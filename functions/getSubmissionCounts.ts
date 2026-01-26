import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Fetch all submissions (limit set high to catch all)
        // Using service role to ensure we see everything
        const allSubmissions = await base44.asServiceRole.entities.Submission.list("-created_date", 20000);
        
        const totalCount = allSubmissions.length;
        
        // Filter for submissions since Jan 11th, 2026
        const startDate = new Date('2026-01-11T00:00:00Z');
        const recentSubmissions = allSubmissions.filter(s => {
            const date = s.submitted_at ? new Date(s.submitted_at) : new Date(s.created_date);
            return date >= startDate;
        });
        
        const recentCount = recentSubmissions.length;
        
        return Response.json({ 
            total_count: totalCount,
            recent_count: recentCount,
            message: `Total: ${totalCount}, Since Jan 11: ${recentCount}`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});