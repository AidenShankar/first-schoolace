import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.app_role !== 'teacher') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { scenario_id, school_year } = await req.json();

        // Get all sections from the built schedule
        const sections = await base44.asServiceRole.entities.ScheduleSection.filter({
            scenario_id,
            school_year
        });

        // Get all course requests
        const requests = await base44.asServiceRole.entities.CourseRequest.filter({
            school_year,
            status: 'pending'
        });

        // Get all students
        const students = await base44.asServiceRole.entities.User.filter({
            app_role: 'student'
        });

        const studentSchedules = [];
        let studentsScheduled = 0;
        let totalRequests = 0;
        let satisfiedRequests = 0;

        // For each student, assign them to sections based on their requests
        for (const student of students) {
            const studentRequests = requests.filter(r => r.student_id === student.id);
            totalRequests += studentRequests.length;
            
            const scheduledSections = [];
            const periodsFilled = new Set();

            for (const request of studentRequests) {
                // Find sections for this course
                const courseSections = sections.filter(s => s.course_id === request.course_id);

                // Try to find a section that doesn't conflict with student's schedule
                let assignedSection = null;
                for (const section of courseSections) {
                    // Check if student already has class in this period
                    if (!periodsFilled.has(section.period_id) && section.enrolled_count < section.capacity) {
                        assignedSection = section;
                        break;
                    }
                }

                if (assignedSection) {
                    scheduledSections.push({
                        student_id: student.id,
                        student_name: student.full_name,
                        section_id: assignedSection.id,
                        course_id: request.course_id,
                        school_year,
                        term: 'Full Year'
                    });

                    periodsFilled.add(assignedSection.period_id);
                    satisfiedRequests++;

                    // Update section enrolled count
                    await base44.asServiceRole.entities.ScheduleSection.update(assignedSection.id, {
                        enrolled_count: (assignedSection.enrolled_count || 0) + 1
                    });
                }
            }

            if (scheduledSections.length > 0) {
                studentsScheduled++;
                await base44.asServiceRole.entities.StudentSchedule.bulkCreate(scheduledSections);
            }

            // Update request statuses
            for (const request of studentRequests) {
                const wasScheduled = scheduledSections.some(s => s.course_id === request.course_id);
                await base44.asServiceRole.entities.CourseRequest.update(request.id, {
                    status: wasScheduled ? 'scheduled' : 'unfulfilled'
                });
            }
        }

        // Check for overcapacity issues
        const updatedSections = await base44.asServiceRole.entities.ScheduleSection.filter({
            scenario_id,
            school_year
        });

        const rooms = await base44.asServiceRole.entities.ScheduleRoom.list();

        for (const section of updatedSections) {
            const room = rooms.find(r => r.id === section.room_id);
            const isOverCapacity = room && section.enrolled_count > room.capacity;
            
            if (isOverCapacity !== section.is_over_capacity) {
                await base44.asServiceRole.entities.ScheduleSection.update(section.id, {
                    is_over_capacity: isOverCapacity
                });
            }
        }

        const satisfactionRate = totalRequests > 0 ? (satisfiedRequests / totalRequests * 100).toFixed(1) : 0;

        return Response.json({
            success: true,
            students_scheduled: studentsScheduled,
            total_students: students.length,
            satisfied_requests: satisfiedRequests,
            total_requests: totalRequests,
            satisfaction_rate: satisfactionRate
        });

    } catch (error) {
        console.error("Load students error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});