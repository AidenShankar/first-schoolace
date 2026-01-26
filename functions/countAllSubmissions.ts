import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // Fetch all submissions with a high limit to ensure we count all of them
        const submissions = await base44.asServiceRole.entities.Submission.list("-created_date", 100000);
        
        return Response.json({ 
            count: submissions.length,
            message: `Found ${submissions.length} submissions`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});