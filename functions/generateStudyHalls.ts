import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.app_role !== 'teacher') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { scenario_id, school_year } = await req.json();

        // Load all data needed
        const [sections, requests, students, periods] = await Promise.all([
            base44.asServiceRole.entities.ScheduleSection.filter({ scenario_id, school_year }),
            base44.asServiceRole.entities.CourseRequest.filter({ school_year }),
            base44.asServiceRole.entities.StudentSchedule.filter({ school_year }),
            base44.asServiceRole.entities.SchedulePeriod.list()
        ]);

        const periodsNonLunch = periods.filter(p => !p.is_lunch).sort((a, b) => a.period_number - b.period_number);
        
        // Group students by their scheduled periods
        const studentScheduledPeriods = {};
        students.forEach(schedule => {
            if (!studentScheduledPeriods[schedule.student_id]) {
                studentScheduledPeriods[schedule.student_id] = new Set();
            }
            const section = sections.find(s => s.id === schedule.section_id);
            if (section && section.period_id) {
                studentScheduledPeriods[schedule.student_id].add(section.period_id);
            }
        });

        // Get unique students who made requests
        const studentIds = [...new Set(requests.map(r => r.student_id))];

        let studyHallsCreated = 0;
        const studyHallSection = {
            course_id: 'STUDY_HALL',
            section_number: 1,
            teacher_id: null,
            room_id: null,
            capacity: 999,
            school_year,
            scenario_id
        };

        // For each student, find empty periods and create study hall enrollments
        for (const studentId of studentIds) {
            const scheduledPeriods = studentScheduledPeriods[studentId] || new Set();
            
            // Find periods where student has no class
            const emptyPeriods = periodsNonLunch.filter(p => !scheduledPeriods.has(p.id));
            
            if (emptyPeriods.length > 0) {
                const studentRequest = requests.find(r => r.student_id === studentId);
                const studentName = studentRequest?.student_name || "Student";
                
                for (const period of emptyPeriods) {
                    // Create a study hall section for this period if it doesn't exist
                    const existingStudyHall = sections.find(s => 
                        s.course_id === 'STUDY_HALL' && s.period_id === period.id
                    );
                    
                    let studyHallSectionId;
                    
                    if (existingStudyHall) {
                        studyHallSectionId = existingStudyHall.id;
                    } else {
                        const newStudyHall = await base44.asServiceRole.entities.ScheduleSection.create({
                            ...studyHallSection,
                            period_id: period.id,
                            section_number: sections.filter(s => s.course_id === 'STUDY_HALL').length + 1
                        });
                        studyHallSectionId = newStudyHall.id;
                    }
                    
                    // Enroll student in study hall
                    await base44.asServiceRole.entities.StudentSchedule.create({
                        student_id: studentId,
                        student_name: studentName,
                        section_id: studyHallSectionId,
                        course_id: 'STUDY_HALL',
                        school_year
                    });
                    
                    studyHallsCreated++;
                }
            }
        }

        return Response.json({
            success: true,
            study_halls_created: studyHallsCreated,
            message: `Filled ${studyHallsCreated} empty periods with study halls`
        });

    } catch (error) {
        console.error("Generate study halls error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});