import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function toISODateOnly(d) {
  const dt = new Date(d);
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let payload = {};
    try { payload = await req.json(); } catch (_) { payload = {}; }

    const now = new Date();
    const endDate = payload.end_date ? new Date(payload.end_date) : now;
    const startDate = payload.start_date ? new Date(payload.start_date) : new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);

    // Normalize bounds to full-day UTC
    const startISO = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0)).toISOString();
    const endISO = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59)).toISOString();

    // Fetch student queries from AI Tutor (student messages only)
    const comments = await base44.asServiceRole.entities.AssignmentComment.filter({
      is_ai_tutor_message: true,
      user_role: 'student',
      created_date: { $gte: startISO, $lte: endISO }
    }, '-created_date', 20000);

    // Aggregate by UTC date
    const buckets = new Map();
    for (const c of comments) {
      const key = toISODateOnly(c.created_date);
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    // Ensure every day in range exists in output
    const out = [];
    for (let d = new Date(startISO); d <= new Date(endISO); d.setUTCDate(d.getUTCDate() + 1)) {
      const key = toISODateOnly(d);
      out.push({ date: key, count: buckets.get(key) || 0 });
    }

    const total = out.reduce((s, r) => s + r.count, 0);

    return Response.json({
      success: true,
      range: { start_date: startISO, end_date: endISO },
      total,
      daily: out
    });
  } catch (error) {
    console.error('getChatTutorQueryStats error:', error);
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
});