import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { admin_code } = await req.json();

        if (!admin_code || typeof admin_code !== 'string') {
            return Response.json({ 
                valid: false, 
                error: 'Admin code is required' 
            });
        }

        // Use service role to query all users
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
        
        // Find admin with matching code
        const admin = allUsers.find(u => 
            u.app_role === 'admin' && 
            u.admin_code === admin_code.trim().toUpperCase()
        );

        if (admin) {
            return Response.json({ 
                valid: true, 
                admin_id: admin.id,
                school_name: admin.school_name 
            });
        } else {
            return Response.json({ 
                valid: false, 
                error: 'Invalid admin code' 
            });
        }

    } catch (error) {
        console.error("Validate admin code error:", error);
        return Response.json({ 
            valid: false,
            error: error.message 
        }, { status: 500 });
    }
});