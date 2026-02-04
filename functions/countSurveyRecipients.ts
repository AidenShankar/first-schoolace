import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Fetch just a few to inspect
        const users = await base44.entities.User.list('-created_date', 5);
        
        // Check structure
        const firstUser = users[0];
        
        // Count again properly if we can figure out the structure
        let allUsers = [];
        let page = 0;
        let hasMore = true;
        const limit = 100;

        while (hasMore) {
             const batch = await base44.entities.User.list('-created_date', limit, page * limit);
             allUsers = allUsers.concat(batch);
             if (batch.length < limit) hasMore = false;
             page++;
             if (page > 50) break; 
        }

        // Try to filter
        // Option A: user.app_role (flattened)
        // Option B: user.data.app_role (nested)
        
        const teachersA = allUsers.filter(u => u.app_role === 'teacher').length;
        const teachersB = allUsers.filter(u => u.data?.app_role === 'teacher').length;
        
        return Response.json({ 
            sample_user: firstUser,
            total: allUsers.length,
            teachers_flattened: teachersA,
            teachers_nested: teachersB
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});