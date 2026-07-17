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

        // 1. Check if the space exists (use service role so lookup is not blocked by RLS)
        const space = await base44.asServiceRole.entities.AceSpace.get(space_id);
        if (!space) {
            return Response.json({ error: 'Space not found' }, { status: 404 });
        }

        // 1b. Authorize: only the space creator or a space admin may add members
        const isCreator = space.creator_id === user.id;
        let isSpaceAdmin = false;
        if (!isCreator) {
            const callerMemberships = await base44.asServiceRole.entities.AceSpaceMember.filter({
                space_id: space_id,
                student_id: user.id,
                role: 'admin'
            });
            isSpaceAdmin = callerMemberships.length > 0;
        }
        if (!isCreator && !isSpaceAdmin) {
            return Response.json({ error: 'You do not have permission to add members to this space' }, { status: 403 });
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