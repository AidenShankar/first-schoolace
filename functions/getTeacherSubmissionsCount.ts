import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Authenticate caller (any authenticated user can query)
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read payload (optional to support platform tests)
    let payload = {};
    try {
      payload = await req.json();
    } catch (_) {
      payload = {};
    }

    // Teacher email to query – default to the email asked by user if not provided
    const teacherEmail = payload.teacherEmail || payload.email || 'mtruong@warriorlife.net';

    // Resolve teacher user by email (service role to ensure access)
    const teachers = await base44.asServiceRole.entities.User.filter({ email: teacherEmail }, undefined, 1);
    if (!teachers || teachers.length === 0) {
      return Response.json({ error: `Teacher not found for email ${teacherEmail}` }, { status: 404 });
    }
    const teacher = teachers[0];

    // Get all classes owned by the teacher
    const classes = await base44.entities.Class.filter({ teacher_id: teacher.id }, '-created_date', 1000);
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) {
      return Response.json({
        success: true,
        teacherEmail,
        classesCount: 0,
        assignmentsCount: 0,
        submissionsCount: 0
      });
    }

    // Get all assignments for those classes
    const assignments = await base44.entities.Assignment.filter({ class_id: { $in: classIds } }, '-created_date', 5000);
    const assignmentIds = assignments.map(a => a.id);

    if (assignmentIds.length === 0) {
      return Response.json({
        success: true,
        teacherEmail,
        classesCount: classes.length,
        assignmentsCount: 0,
        submissionsCount: 0
      });
    }

    // Get submissions for all assignments (use a large limit; adjust if needed)
    const submissions = await base44.entities.Submission.filter({ assignment_id: { $in: assignmentIds } }, '-created_date', 5000);

    return Response.json({
      success: true,
      teacherEmail,
      classesCount: classes.length,
      assignmentsCount: assignments.length,
      submissionsCount: submissions.length
    });
  } catch (error) {
    console.error('getTeacherSubmissionsCount error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});