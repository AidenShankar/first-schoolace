import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read payload and require sinceDate (ISO). Example for 12:00 AM PST on Jan 11: 2026-01-11T08:00:00Z
    const body = await req.json().catch(() => ({}));
    const sinceDate = body?.sinceDate;
    if (!sinceDate) {
      return Response.json({ error: 'sinceDate is required (ISO string). For 12:00 AM PST on Jan 11 use 2026-01-11T08:00:00Z.' }, { status: 400 });
    }

    // Efficient single query with high limit to avoid per-item counting
    // Validate ISO date
    const since = new Date(sinceDate);
    if (isNaN(since.getTime())) {
      return Response.json({ error: 'Invalid sinceDate. Must be a valid ISO timestamp.' }, { status: 400 });
    }

    const results = await base44.asServiceRole.entities.Submission.filter(
      { submitted_at: { $gte: since.toISOString() } },
      '-submitted_at',
      100000
    );

    return Response.json({
      success: true,
      sinceDate,
      count: results.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});