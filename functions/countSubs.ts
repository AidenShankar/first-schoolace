import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const all = await base44.asServiceRole.entities.Submission.filter({}, undefined, 50000);
        const start = new Date('2026-01-11T00:00:00Z');
        const count = all.filter(s => {
            const d = s.submitted_at || s.created_date;
            return d && new Date(d) >= start;
        }).length;
        
        return Response.json({ total: all.length, sinceJan11: count });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
});