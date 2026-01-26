import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fixed date: Jan 11, 2026 12:00 AM America/Los_Angeles = 2026-01-11T08:00:00Z
    const sinceDate = '2026-01-11T08:00:00Z';
    console.log('[countSubmissionsSinceJan11_2026] sinceDate:', sinceDate);

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
    console.error('[countSubmissionsSinceJan11_2026] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});