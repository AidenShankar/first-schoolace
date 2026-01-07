import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.app_role !== 'teacher') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { scenario_id, school_year } = await req.json();

        const sections = await base44.asServiceRole.entities.ScheduleSection.filter({
            scenario_id,
            school_year
        });

        const rooms = await base44.asServiceRole.entities.ScheduleRoom.list();
        const teachers = await base44.asServiceRole.entities.User.filter({ app_role: 'teacher' });
        const periods = await base44.asServiceRole.entities.SchedulePeriod.list();
        const courses = await base44.asServiceRole.entities.ScheduleCourse.list();

        let resolvedCount = 0;
        const resolutionLog = [];

        // Try to resolve room conflicts
        for (const section of sections) {
            if (!section.has_room_conflict) continue;

            // Find an alternative room in the same period
            const usedRoomsInPeriod = sections
                .filter(s => s.period_id === section.period_id && s.id !== section.id)
                .map(s => s.room_id);

            const course = courses.find(c => c.id === section.course_id);
            
            const availableRoom = rooms.find(room => {
                if (usedRoomsInPeriod.includes(room.id)) return false;
                if (!room.use_for_scheduling) return false;
                if (room.capacity < section.capacity) return false;
                
                // Check if room has required facilities
                if (course && course.requires_lab && !room.is_lab) return false;
                if (course && course.requires_gym && !room.is_gym) return false;
                
                return true;
            });

            if (availableRoom) {
                await base44.asServiceRole.entities.ScheduleSection.update(section.id, {
                    room_id: availableRoom.id,
                    has_room_conflict: false
                });
                
                resolvedCount++;
                resolutionLog.push({
                    type: 'room_conflict',
                    section_id: section.id,
                    action: `Moved to room ${availableRoom.room_number}`,
                    success: true
                });
            }
        }

        // Try to resolve teacher conflicts
        for (const section of sections) {
            if (!section.has_teacher_conflict) continue;

            // Find an alternative period where teacher is free
            const teacherSections = sections.filter(s => 
                s.teacher_id === section.teacher_id && s.id !== section.id
            );
            const occupiedPeriods = new Set(teacherSections.map(s => s.period_id));

            const freePeriod = periods.find(p => 
                !p.is_lunch && !occupiedPeriods.has(p.id)
            );

            if (freePeriod) {
                // Check if room is available in this period
                const roomOccupied = sections.some(s => 
                    s.period_id === freePeriod.id && 
                    s.room_id === section.room_id &&
                    s.id !== section.id
                );

                if (!roomOccupied) {
                    await base44.asServiceRole.entities.ScheduleSection.update(section.id, {
                        period_id: freePeriod.id,
                        has_teacher_conflict: false
                    });
                    
                    resolvedCount++;
                    resolutionLog.push({
                        type: 'teacher_conflict',
                        section_id: section.id,
                        action: `Moved to period ${freePeriod.period_name}`,
                        success: true
                    });
                }
            }
        }

        // Re-check all conflicts after resolution attempts
        const updatedSections = await base44.asServiceRole.entities.ScheduleSection.filter({
            scenario_id,
            school_year
        });

        const remainingConflicts = updatedSections.filter(s => 
            s.has_teacher_conflict || s.has_room_conflict
        ).length;

        return Response.json({
            success: true,
            resolved_count: resolvedCount,
            remaining_conflicts: remainingConflicts,
            resolution_log: resolutionLog
        });

    } catch (error) {
        console.error("Auto resolve conflicts error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});