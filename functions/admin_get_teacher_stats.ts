import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { email } = await req.json();

        // 1. Get User using service role to bypass restrictions
        const users = await base44.asServiceRole.entities.User.filter({ email });
        if (users.length === 0) {
            return Response.json({ error: "User not found" });
        }
        const teacher = users[0];

        // 2. Get Classes
        const classes = await base44.asServiceRole.entities.Class.filter({ teacher_id: teacher.id });

        // 3. Get Enrollments count for each class
        const results = [];
        for (const cls of classes) {
            // Using count if available would be better, but filter works for now
            const enrollments = await base44.asServiceRole.entities.ClassEnrollment.filter({ class_id: cls.id });
            results.push({
                name: cls.name,
                studentCount: enrollments.length
            });
        }

        return Response.json({
            teacher: teacher.full_name,
            totalClasses: classes.length,
            classes: results
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});