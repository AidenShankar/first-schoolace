import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read payload (optional). Expected: { sinceDate: 'YYYY-MM-DDTHH:mm:ssZ' }
    let sinceDate = '2026-01-11T00:00:00Z';
    try {
      const body = await req.json().catch(() => ({}));
      if (body?.sinceDate) sinceDate = body.sinceDate;
    } catch (_) {
      // Ignore body parsing errors and use default
    }

    // Efficient single query with high limit to avoid per-item counting
    const results = await base44.asServiceRole.entities.Submission.filter(
      { submitted_at: { $gte: sinceDate } },
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