import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        let allUsers = [];
        let page = 0;
        let hasMore = true;
        const limit = 100;

        // Fetch up to 5000 users to get a count
        while (hasMore) {
             const users = await base44.entities.User.list('-created_date', limit, page * limit);
             allUsers = allUsers.concat(users);
             if (users.length < limit) hasMore = false;
             page++;
             if (page > 50) break; 
        }

        // Filter out teachers. 
        // Note: app_role is in `data.app_role` usually, but the entity might flatten it or not.
        // Looking at previous output: `data: {'app_role': 'teacher', ...}`.
        // So we check u.data?.app_role.
        
        const recipients = allUsers.filter(u => u.data?.app_role !== 'teacher');
        
        return Response.json({ 
            total_users: allUsers.length,
            recipients_count: recipients.length,
            teachers_count: allUsers.length - recipients.length
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});