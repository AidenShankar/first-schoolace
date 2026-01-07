import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const { studentId, dataType, accessType, purpose, recordId } = await req.json();

        if (!studentId || !dataType || !accessType) {
            return new Response(JSON.stringify({ error: 'Missing required logging information.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Use service role to ensure logs are always created, regardless of user permissions on the log table itself.
        const logRecord = await base44.asServiceRole.entities.DataAccessLog.create({
            student_id: studentId,
            accessed_by_user_id: user.id,
            accessed_by_name: user.full_name || user.email,
            access_type: accessType,
            data_type: dataType,
            purpose: purpose || 'General Review',
            // In a real scenario, you'd get the IP from request headers. Deno Deploy provides this.
            ip_address: req.headers.get('x-forwarded-for') || 'Unknown',
        });

        return new Response(JSON.stringify({ success: true, logId: logRecord.id }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Data access logging failed:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});