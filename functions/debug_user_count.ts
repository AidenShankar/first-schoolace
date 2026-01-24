import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // Use service role to ensure we can see all users
        const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
        return Response.json({ emails: users.map(u => u.email) });
    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});