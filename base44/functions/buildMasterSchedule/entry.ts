import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Scheduling scenarios are admin-owned resources (see SchedulingScenario RLS).
        if (!user || user.app_role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { scenario_id, school_year } = await req.json();

        if (!scenario_id) {
            return Response.json({ error: 'scenario_id is required' }, { status: 400 });
        }

        // Ownership check: verify the scenario exists and was created by this admin,
        // preventing one admin from building/overwriting another's scenario via asServiceRole.
        const ownedScenarios = await base44.asServiceRole.entities.SchedulingScenario.filter({ id: scenario_id });
        if (ownedScenarios.length === 0) {
            return Response.json({ error: 'Scenario not found' }, { status: 404 });
        }
        if (ownedScenarios[0].created_by !== user.email) {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Step 1: Load all data
        const [courses, requests, teacherAssignments, rooms, periods] = await Promise.all([
            base44.asServiceRole.entities.ScheduleCourse.list(),
            base44.asServiceRole.entities.CourseRequest.filter({ school_year }),
            base44.asServiceRole.entities.TeacherScheduleAssignment.list(),
            base44.asServiceRole.entities.ScheduleRoom.filter({ use_for_scheduling: true }),
            base44.asServiceRole.entities.SchedulePeriod.list()
        ]);

        // Step 2: Calculate section counts based on requests
        const courseSectionCounts = {};
        courses.forEach(course => {
            const requestCount = requests.filter(r => r.course_id === course.id).length;
            const sectionsNeeded = Math.ceil(requestCount / course.max_class_size);
            courseSectionCounts[course.id] = Math.max(sectionsNeeded, 1);
        });

        // Step 3: Build conflict matrix (student course pairs)
        const conflictMatrix = {};
        requests.forEach(req1 => {
            requests.forEach(req2 => {
                if (req1.student_id === req2.student_id && req1.course_id !== req2.course_id) {
                    const key = [req1.course_id, req2.course_id].sort().join('-');
                    conflictMatrix[key] = (conflictMatrix[key] || 0) + 1;
                }
            });
        });

        // Step 4: Rank courses by demand (highest first)
        const rankedCourses = courses
            .map(course => ({
                ...course,
                requestCount: requests.filter(r => r.course_id === course.id).length,
                sectionsNeeded: courseSectionCounts[course.id]
            }))
            .filter(course => course.sectionsNeeded > 0)
            .sort((a, b) => b.requestCount - a.requestCount);

        // Step 5: Create sections with greedy scheduling
        const sections = [];
        const teacherLoad = {}; // tracks periods used per teacher
        const roomSchedule = {}; // tracks room usage per period
        const periodsList = periods.sort((a, b) => a.period_number - b.period_number);

        for (const course of rankedCourses) {
            const assignment = teacherAssignments.find(a => a.course_id === course.id);
            if (!assignment) continue;

            for (let sectionNum = 1; sectionNum <= course.sectionsNeeded; sectionNum++) {
                // Find available teacher period
                if (!teacherLoad[assignment.teacher_id]) {
                    teacherLoad[assignment.teacher_id] = {};
                }

                let assignedPeriod = null;
                let assignedRoom = null;
                let hasConflict = false;

                // Try to find a period where teacher is free
                for (const period of periodsList) {
                    if (period.is_lunch) continue;
                    if (teacherLoad[assignment.teacher_id][period.id]) continue;

                    // Check if teacher has reached max load
                    const currentLoad = Object.keys(teacherLoad[assignment.teacher_id]).length;
                    if (currentLoad >= (assignment.max_load || 6)) break;

                    // Find available room
                    const availableRoom = rooms.find(room => {
                        if (!roomSchedule[room.id]) roomSchedule[room.id] = {};
                        if (roomSchedule[room.id][period.id]) return false;
                        if (course.requires_lab && !room.is_lab) return false;
                        if (course.requires_gym && !room.is_gym) return false;
                        if (room.capacity < course.max_class_size) return false;
                        return true;
                    });

                    if (availableRoom) {
                        assignedPeriod = period;
                        assignedRoom = availableRoom;
                        break;
                    }
                }

                if (assignedPeriod && assignedRoom) {
                    // Mark as used
                    teacherLoad[assignment.teacher_id][assignedPeriod.id] = true;
                    if (!roomSchedule[assignedRoom.id]) roomSchedule[assignedRoom.id] = {};
                    roomSchedule[assignedRoom.id][assignedPeriod.id] = true;

                    sections.push({
                        course_id: course.id,
                        section_number: sectionNum,
                        teacher_id: assignment.teacher_id,
                        teacher_name: assignment.teacher_name,
                        room_id: assignedRoom.id,
                        period_id: assignedPeriod.id,
                        capacity: course.max_class_size,
                        enrolled_count: 0,
                        has_teacher_conflict: false,
                        has_room_conflict: false,
                        is_over_capacity: false,
                        school_year,
                        scenario_id
                    });
                } else {
                    // Could not schedule - conflict
                    sections.push({
                        course_id: course.id,
                        section_number: sectionNum,
                        teacher_id: assignment.teacher_id,
                        teacher_name: assignment.teacher_name,
                        room_id: null,
                        period_id: null,
                        capacity: course.max_class_size,
                        enrolled_count: 0,
                        has_teacher_conflict: true,
                        has_room_conflict: false,
                        is_over_capacity: false,
                        school_year,
                        scenario_id
                    });
                }
            }
        }

        // Step 6: Save sections to database
        for (const section of sections) {
            await base44.asServiceRole.entities.ScheduleSection.create(section);
        }

        // Step 7: Calculate metrics
        const totalConflicts = sections.filter(s => s.has_teacher_conflict || s.has_room_conflict).length;
        const totalSections = sections.length;
        const scheduledSections = sections.filter(s => s.period_id !== null).length;
        const satisfactionPercent = Math.round((scheduledSections / totalSections) * 100);

        // Update scenario
        await base44.asServiceRole.entities.SchedulingScenario.update(scenario_id, {
            status: 'built',
            build_completed_at: new Date().toISOString(),
            total_conflicts: totalConflicts,
            requests_satisfied_percent: satisfactionPercent
        });

        return Response.json({
            success: true,
            sections_created: sections.length,
            sections_scheduled: scheduledSections,
            total_conflicts: totalConflicts,
            satisfaction_percent: satisfactionPercent,
            conflict_matrix: conflictMatrix
        });

    } catch (error) {
        console.error('Build error:', error);
        return Response.json({ 
            error: 'Failed to build schedule',
            details: error.message 
        }, { status: 500 });
    }
});