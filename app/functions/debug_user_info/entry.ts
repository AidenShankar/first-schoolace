import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Require an authenticated admin — this endpoint exposes PII and academic data
        const caller = await base44.auth.me();
        if (!caller) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (caller.app_role !== 'admin' && caller.role !== 'admin') {
            return Response.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Use service role to ensure we can find the user regardless of current user context
        const users = await base44.asServiceRole.entities.User.filter({ full_name: "Melissa Truong" });

        if (!users || users.length === 0) {
            // Try partial match or case insensitive search if exact match fails
            // Since we can't easily do regex in filter, we'll list all and filter in memory (inefficient but works for analysis)
            const allUsers = await base44.asServiceRole.entities.User.list();
            const found = allUsers.filter(u => u.full_name?.toLowerCase().includes("melissa truong"));
            
            if (found.length === 0) {
                 return Response.json({ message: "User 'Melissa Truong' not found." });
            }
            users.push(...found);
        }

        const report = [];

        for (const user of users) {
            const userInfo = {
                id: user.id,
                name: user.full_name,
                email: user.email,
                role: user.app_role,
                created_at: user.created_date,
                stats: {}
            };

            if (user.app_role === 'teacher') {
                // Teacher Stats
                const classes = await base44.asServiceRole.entities.Class.filter({ teacher_id: user.id });
                const classIds = classes.map(c => c.id);
                
                let studentCount = 0;
                let enrollments = [];
                if (classIds.length > 0) {
                    // Get all enrollments for these classes
                    // We need to fetch enrollments for each class or all at once if supported
                    // Doing filter with $in is better
                    enrollments = await base44.asServiceRole.entities.ClassEnrollment.filter({ class_id: { $in: classIds } });
                    // Count unique students
                    const uniqueStudents = new Set(enrollments.map(e => e.student_id));
                    studentCount = uniqueStudents.size;
                }

                const assignments = await base44.asServiceRole.entities.Assignment.filter({ teacher_id: user.id });
                const quizzes = await base44.asServiceRole.entities.Quiz.filter({ teacher_id: user.id });
                const polls = await base44.asServiceRole.entities.Poll.filter({ teacher_id: user.id });

                userInfo.stats = {
                    classes_created: classes.length,
                    classes_names: classes.map(c => c.name),
                    total_unique_students: studentCount,
                    total_enrollments: enrollments.length,
                    assignments_created: assignments.length,
                    quizzes_created: quizzes.length,
                    polls_created: polls.length
                };

            } else {
                // Student Stats (or other roles)
                const enrollments = await base44.asServiceRole.entities.ClassEnrollment.filter({ student_id: user.id });
                const submissions = await base44.asServiceRole.entities.Submission.filter({ student_id: user.id });
                const quizSubmissions = await base44.asServiceRole.entities.QuizSubmission.filter({ student_id: user.id });
                
                // Get class details for enrolled classes
                let enrolledClassNames = [];
                if (enrollments.length > 0) {
                    const classIds = enrollments.map(e => e.class_id);
                    const classes = await base44.asServiceRole.entities.Class.filter({ id: { $in: classIds } });
                    enrolledClassNames = classes.map(c => c.name);
                }

                userInfo.stats = {
                    classes_enrolled_count: enrollments.length,
                    classes_enrolled_names: enrolledClassNames,
                    assignments_submitted: submissions.length,
                    quizzes_taken: quizSubmissions.length
                };
            }
            report.push(userInfo);
        }

        return Response.json({ count: users.length, users: report });

    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});