import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // We need service role to look up any user by email and read their data if we are not them
        const userList = await base44.asServiceRole.entities.User.filter({ email: 'mtruong@warriorlife.net' });
        
        if (userList.length === 0) {
            return Response.json({ error: 'User not found' });
        }
        
        const teacher = userList[0];
        
        const classes = await base44.asServiceRole.entities.Class.filter({ teacher_id: teacher.id });
        
        const results = [];
        
        for (const cls of classes) {
            const enrollments = await base44.asServiceRole.entities.ClassEnrollment.filter({ class_id: cls.id });
            results.push({
                class_name: cls.name,
                student_count: enrollments.length
            });
        }
        
        return Response.json({
            teacher_email: teacher.email,
            total_classes: classes.length,
            classes: results
        });

    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});