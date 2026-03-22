import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (user.app_role !== 'admin') {
            return Response.json({ error: 'Only admins can access this' }, { status: 403 });
        }

        // Use service role to get all users
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
        
        // Filter teachers that belong to this admin
        const adminTeachers = allUsers.filter(u => 
            u.app_role === 'teacher' && u.admin_id === user.id
        );

        // Also get students from classes taught by these teachers
        const teacherIds = adminTeachers.map(t => t.id);
        const allClasses = await base44.asServiceRole.entities.Class.list('-created_date', 1000);
        const adminClasses = allClasses.filter(c => teacherIds.includes(c.teacher_id));
        const adminClassIds = adminClasses.map(c => c.id);
        
        const allEnrollments = await base44.asServiceRole.entities.ClassEnrollment.list('-created_date', 1000);
        const relevantEnrollments = allEnrollments.filter(e => 
            adminClassIds.includes(e.class_id)
        );
        
        const uniqueStudentIds = [...new Set(relevantEnrollments.map(e => e.student_id))];
        const students = allUsers.filter(u => 
            u.app_role === 'student' && uniqueStudentIds.includes(u.id)
        );

        return Response.json({ 
            teachers: adminTeachers,
            students: students
        });

    } catch (error) {
        console.error("Get admin teachers error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});