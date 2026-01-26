import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Use service role to ensure we count ALL submissions regardless of RLS
        // We set a high limit to capture all records. If there are more than 50k, we might need a different strategy.
        const allSubmissions = await base44.asServiceRole.entities.Submission.filter({}, undefined, 50000);
        
        const totalCount = allSubmissions.length;
        
        // Filter for submissions since January 11th, 2026
        // We check submitted_at first, then fall back to created_date
        const startDate = new Date('2026-01-11T00:00:00Z');
        
        const sinceJan11Count = allSubmissions.filter(s => {
            const dateStr = s.submitted_at || s.created_date;
            if (!dateStr) return false;
            return new Date(dateStr) >= startDate;
        }).length;
        
        return Response.json({
            total: totalCount,
            since_jan_11: sinceJan11Count,
            limit_reached: totalCount === 50000
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});