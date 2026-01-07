import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Authenticate request
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { space_id, email } = await req.json();

        if (!space_id || !email) {
            return Response.json({ error: 'Missing space_id or email' }, { status: 400 });
        }

        // 1. Check if the space exists
        // (Optional, but good for validation. We can skip if we trust the frontend, but let's be safe)
        const space = await base44.entities.AceSpace.get(space_id);
        if (!space) {
            return Response.json({ error: 'Space not found' }, { status: 404 });
        }

        // 2. Find the user by email (Requires Service Role)
        const users = await base44.asServiceRole.entities.User.filter({ email: email });
        
        if (!users || users.length === 0) {
            return Response.json({ error: 'No user found with that email address' }, { status: 404 });
        }

        const targetUser = users[0];

        // 3. Check if already a member
        const existingMembers = await base44.entities.AceSpaceMember.filter({
            space_id: space_id,
            student_id: targetUser.id
        });

        if (existingMembers.length > 0) {
            return Response.json({ error: 'User is already a member of this space' }, { status: 409 });
        }

        // 4. Add the member
        const newMember = await base44.entities.AceSpaceMember.create({
            space_id: space_id,
            student_id: targetUser.id,
            student_name: targetUser.full_name,
            role: 'member',
            joined_at: new Date().toISOString()
        });

        return Response.json({ success: true, member: newMember, message: 'Added!' });

    } catch (error) {
        console.error("Error adding member:", error);
        return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
});