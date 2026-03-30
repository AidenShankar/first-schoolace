import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Configuration — tune these for your use case
const BATCH_SIZE = 10;        // Emails per function call
const DELAY_BETWEEN_MS = 2000; // 2 seconds between each email

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  // Optional: pass a custom email_type to support future campaigns
  const { email_type = 'beta_invite', dry_run = false } = await req.json().catch(() => ({}));

  // Step 1: Fetch all users who haven't received this email yet
  const unsent = [];
  let skip = 0;
  const fetchSize = 50;

  while (true) {
    const batch = await base44.asServiceRole.entities.User.list('created_date', fetchSize, skip);
    if (!batch || batch.length === 0) break;

    for (const u of batch) {
      const email = u.email || '';
      if (!email.includes('@') || !email.includes('.')) continue;
      if (u.beta_email_sent === true) continue; // Already sent
      unsent.push(u);
    }

    skip += fetchSize;
    if (batch.length < fetchSize) break;
  }

  // If nothing to send, report done
  if (unsent.length === 0) {
    return Response.json({
      status: 'complete',
      message: 'All users have been emailed.',
      remaining: 0
    });
  }

  // Step 2: Take only BATCH_SIZE users for this run
  const thisBatch = unsent.slice(0, BATCH_SIZE);

  const results = { sent: 0, failed: 0, errors: [], emails_sent: [] };

  for (const u of thisBatch) {
    const email = u.email;
    const firstName = (u.full_name || 'there').split(' ')[0];

    if (dry_run) {
      results.sent++;
      results.emails_sent.push(email);
      continue;
    }

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: "SchoolACE: Welcome to ACE Beta",
        body: getEmailBody(firstName),
        from_name: "SchoolACE"
      });

      // Mark as sent immediately after success
      await base44.asServiceRole.entities.User.update(u.id, {
        beta_email_sent: true,
        beta_email_sent_at: new Date().toISOString()
      });

      results.sent++;
      results.emails_sent.push(email);
      console.log(`✅ Sent to ${email}`);
    } catch (error) {
      // Retry once after delay if rate limited
      if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
        console.log(`⏳ Rate limited on ${email}, waiting 5s and retrying...`);
        await new Promise(r => setTimeout(r, 5000));
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: "SchoolACE: Welcome to ACE Beta",
            body: getEmailBody(firstName),
            from_name: "SchoolACE"
          });

          await base44.asServiceRole.entities.User.update(u.id, {
            beta_email_sent: true,
            beta_email_sent_at: new Date().toISOString()
          });

          results.sent++;
          results.emails_sent.push(email);
          console.log(`✅ Sent to ${email} (retry)`);
        } catch (retryError) {
          results.failed++;
          results.errors.push({ email, error: retryError.message });
          console.error(`❌ Failed after retry: ${email} - ${retryError.message}`);
        }
      } else {
        results.failed++;
        results.errors.push({ email, error: error.message });
        console.error(`❌ Failed: ${email} - ${error.message}`);
      }
    }

    // Pace: wait between each send
    await new Promise(r => setTimeout(r, DELAY_BETWEEN_MS));
  }

  const remaining = unsent.length - results.sent;

  console.log(`Batch done. Sent: ${results.sent}, Failed: ${results.failed}, Remaining: ${remaining}`);

  return Response.json({
    status: remaining > 0 ? 'in_progress' : 'complete',
    batch_sent: results.sent,
    batch_failed: results.failed,
    remaining,
    total_unsent_before: unsent.length,
    emails_sent: results.emails_sent,
    errors: results.errors
  });
});

function getEmailBody(firstName) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SchoolACE</title>
</head>

<body
  style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Stuck on homework? Your AI study companion is here.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
    style="background:#f1f5f9;padding:32px 16px 48px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- HERO -->
          <tr>
            <td style="background:#0f172a;padding:28px 36px 24px;border-radius:16px 16px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:3px;
                             text-transform:uppercase;color:#6366f1;">SchoolACE</p>
                    <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">
                      You're invited to the ACE Beta 🚀
                    </p>
                    <p style="margin:10px 0 0;font-size:14px;color:#94a3b8;">
                      Invite-only. Your spot is reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:36px;border:1px solid #e2e8f0;border-top:none;">

              <p style="margin:0 0 6px;font-size:16px;color:#1e293b;font-weight:600;">Hey ${firstName},</p>
              <p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.6;">
                We picked a group of SchoolACE users to try something new.
              </p>

              <div style="height:1px;background:#e2e8f0;margin:24px 0;"></div>

              <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#1e293b;">🧠 Meet ACE - AI Learning Companion for Education.</p>
              <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">
                Built for <strong>Grades 6 through 12</strong> across <strong>Math, English, and Science</strong>
                including Physics, Chemistry, and Biology.
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
                Ask ACE anything. It can turn problems into graphs, diagrams, charts, and interactive visuals.
              </p>

              <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

              <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e293b;">✨ What ACE does for you</p>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="margin-bottom:12px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="width:48px;vertical-align:top;padding:16px 0 16px 16px;font-size:22px;">📝</td>
                  <td style="padding:16px 16px 16px 8px;">
                    <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1e293b;">Instant feedback on your work</p>
                    <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">Upload an assignment, get it graded in seconds with real feedback.</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="margin-bottom:12px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="width:48px;vertical-align:top;padding:16px 0 16px 16px;font-size:22px;">💬</td>
                  <td style="padding:16px 16px 16px 8px;">
                    <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1e293b;">Ask anything, get it explained your way</p>
                    <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">Stuck? ACE breaks it down step by step until it clicks.</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="margin-bottom:12px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="width:48px;vertical-align:top;padding:16px 0 16px 16px;font-size:22px;">🎯</td>
                  <td style="padding:16px 16px 16px 8px;">
                    <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1e293b;">Quizzes, assignments, and flashcards on demand</p>
                    <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">ACE builds practice sets for your unique learning style.</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="margin-bottom:4px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="width:48px;vertical-align:top;padding:16px 0 16px 16px;font-size:22px;">🎨</td>
                  <td style="padding:16px 16px 16px 8px;">
                    <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1e293b;">Visuals that bring concepts to life</p>
                    <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">Graphs, charts, flowcharts, molecular structures, and more.</p>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

              <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1e293b;">💡 Try asking ACE</p>
              <p style="margin:0 0 16px;font-size:13px;color:#475569;">Just type what you need. Here are some ideas:</p>

              <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6366f1;">📐 Math</p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="margin-bottom:10px;background:#f1f5f9;border-radius:12px;border-left:4px solid #6366f1;border:1px solid #e2e8f0;border-left:4px solid #6366f1;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1e293b;line-height:1.5;">
                      💬 &ldquo;Plot a parabola and show me how changing 'a' stretches it&rdquo;
                    </p>
                    <p style="margin:0;font-size:12px;color:#94a3b8;font-style:italic;">→ ACE draws it on an interactive graph you can play with</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#10b981;">🔬 Science</p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="margin-bottom:10px;background:#f1f5f9;border-radius:12px;border-left:4px solid #10b981;border:1px solid #e2e8f0;border-left:4px solid #10b981;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1e293b;line-height:1.5;">
                      💬 &ldquo;Show me the molecular structure of caffeine&rdquo;
                    </p>
                    <p style="margin:0;font-size:12px;color:#94a3b8;font-style:italic;">→ ACE renders the 3D molecule so you can see every atom</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f59e0b;">📝 English</p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="margin-bottom:10px;background:#f1f5f9;border-radius:12px;border-left:4px solid #f59e0b;border:1px solid #e2e8f0;border-left:4px solid #f59e0b;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1e293b;line-height:1.5;">
                      💬 &ldquo;Read my paragraph and make it more persuasive&rdquo;
                    </p>
                    <p style="margin:0;font-size:12px;color:#94a3b8;font-style:italic;">→ ACE rewrites with you, showing exactly what changed and why</p>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

              <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e293b;">📈 Track your growth</p>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="margin-bottom:12px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e293b;">🏆 Mastery Score</p>
                    <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">A live score that tracks your learning in real time.</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                style="margin-bottom:4px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e293b;">🌌 Your Learning Cosmos</p>
                    <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">Your learning journey, mapped as a universe of concepts you master.</p>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

              <div style="margin:0 0 20px;padding:16px;background:#fef3c7;border-radius:12px;border:1px solid #fde68a;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1e293b;">⏳ Early access perk</p>
                <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                  Join before Apr 2 and get 14 days free instead of 7. Enough time to upload assignments, explore your subjects, and see real results.
                </p>
              </div>

              <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1e293b;">Ready?</p>
              <p style="margin:0 0 20px;font-size:14px;color:#475569;">Under 30 seconds. Pick your grade, choose subjects, start exploring.</p>

              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius:10px;background:#6366f1;">
                    <a href="https://aitutor.schoolace.ai/tutor" style="display:inline-block;padding:15px 32px;font-size:15px;font-weight:700;
                            color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">
                      🚀 Get Started
                    </a>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

              <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e293b;">Questions? We're here.</p>
              <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                Reply to this email anytime, a real human will get back to you. Or reach us at
                <a href="mailto:ace@schoolace.ai" style="color:#6366f1;text-decoration:none;">ace@schoolace.ai</a>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              style="padding:20px 36px 24px;text-align:center;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;background:#f8fafc;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                <strong style="color:#6366f1;">SchoolACE</strong> &nbsp;·&nbsp;
                <a href="https://schoolace.ai" style="color:#94a3b8;text-decoration:none;">schoolace.ai</a>
                &nbsp;·&nbsp;
                <a href="mailto:ace@schoolace.ai" style="color:#94a3b8;text-decoration:none;">ace@schoolace.ai</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">
                © 2026 SchoolACE LLC. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>

</html>`;
}