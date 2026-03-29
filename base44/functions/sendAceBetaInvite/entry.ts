import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const EMAIL_SUBJECT = "SchoolACE: Welcome to ACE Beta 🚀";

function getEmailBody(firstName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>SchoolACE</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Your AI tutor that adapts to you. Invite-only access inside.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:32px 16px 48px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

        <!-- HERO -->
        <tr>
          <td style="background:#0f172a;padding:28px 36px 24px;border-radius:16px 16px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td>
                  <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#6366f1;">SchoolACE</p>
                  <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">You're invited to the ACE Beta 🚀</p>
                  <p style="margin:10px 0 0;font-size:14px;color:#94a3b8;">Invite-only. Your spot is reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#ffffff;padding:36px;border:1px solid #e2e8f0;border-top:none;">

            <p style="margin:0 0 6px;font-size:16px;color:#1e293b;font-weight:600;">Hey ${firstName},</p>
            <p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.6;">We picked a small group of students to try something new.</p>
            <p style="margin:0 0 24px;font-size:15px;color:#1e293b;font-weight:700;">You made the list. 🎉</p>

            <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#1e293b;">🧠 Meet ACE</p>
            <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1e293b;">AI Learning Companion for Education.</p>
            <p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.7;">Built for <strong>Grades 6 through 12</strong> across <strong>Math, English, and Science</strong> including Physics, Chemistry, and Biology.</p>
            <p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.7;">Ask ACE anything. It can draw it, map it, show it, or break it down step by step.</p>
            <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">It can turn anything into graphs, diagrams, molecules, and interactive visuals so you can actually see how things work.</p>

            <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

            <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e293b;">✨ What ACE does for you</p>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
              <tr>
                <td style="width:48px;vertical-align:top;padding:16px 0 16px 16px;font-size:22px;">📝</td>
                <td style="padding:16px 16px 16px 8px;">
                  <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1e293b;">Instant feedback on your work</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">Submit an assignment, get it graded in seconds with real feedback.</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
              <tr>
                <td style="width:48px;vertical-align:top;padding:16px 0 16px 16px;font-size:22px;">💬</td>
                <td style="padding:16px 16px 16px 8px;">
                  <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1e293b;">Ask anything, get it explained your way</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">Stuck? ACE breaks it down step by step until it clicks.</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
              <tr>
                <td style="width:48px;vertical-align:top;padding:16px 0 16px 16px;font-size:22px;">🎯</td>
                <td style="padding:16px 16px 16px 8px;">
                  <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1e293b;">Quizzes, assignments, and flashcards on demand</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">Test yourself before the test. ACE builds practice sets around what you need most.</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:4px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
              <tr>
                <td style="width:48px;vertical-align:top;padding:16px 0 16px 16px;font-size:22px;">🎨</td>
                <td style="padding:16px 16px 16px 8px;">
                  <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#1e293b;">Visuals that bring concepts to life</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">Interactive graphs, molecular structures, geometric constructions. Not just text.</p>
                </td>
              </tr>
            </table>

            <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

            <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1e293b;">💡 Try asking ACE</p>
            <p style="margin:0 0 16px;font-size:13px;color:#475569;">Just type what you need. Here are some ideas:</p>

            <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6366f1;">📐 Math</p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:10px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;border-left:4px solid #6366f1;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1e293b;line-height:1.5;">💬 &ldquo;Plot a parabola and show me how changing 'a' stretches it&rdquo;</p>
                  <p style="margin:0;font-size:12px;color:#94a3b8;font-style:italic;">→ ACE draws it on an interactive graph you can play with</p>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
              <tr><td style="padding:4px 0;"><div style="background:#eef2ff;padding:9px 14px;border-radius:20px;display:inline-block;font-size:13px;color:#1e293b;">Draw a triangle and prove the Pythagorean theorem 📐</div></td></tr>
              <tr><td style="padding:4px 0;"><div style="background:#eef2ff;padding:9px 14px;border-radius:20px;display:inline-block;font-size:13px;color:#1e293b;">Help me visualize fractions as pie charts 🥧</div></td></tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#10b981;">🔬 Science</p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:10px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;border-left:4px solid #10b981;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1e293b;line-height:1.5;">💬 &ldquo;Show me the molecular structure of caffeine&rdquo;</p>
                  <p style="margin:0;font-size:12px;color:#94a3b8;font-style:italic;">→ ACE renders the 3D molecule so you can see every atom</p>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
              <tr><td style="padding:4px 0;"><div style="background:#d1fae5;padding:9px 14px;border-radius:20px;display:inline-block;font-size:13px;color:#1e293b;">Draw the phases of the moon and explain each one 🌙</div></td></tr>
              <tr><td style="padding:4px 0;"><div style="background:#d1fae5;padding:9px 14px;border-radius:20px;display:inline-block;font-size:13px;color:#1e293b;">Chart how a population grows with limited resources 🌿</div></td></tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#f59e0b;">📝 English</p>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:10px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;border-left:4px solid #f59e0b;">
              <tr>
                <td style="padding:14px 18px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1e293b;line-height:1.5;">💬 &ldquo;Read my paragraph and make it more persuasive&rdquo;</p>
                  <p style="margin:0;font-size:12px;color:#94a3b8;font-style:italic;">→ ACE rewrites with you, showing exactly what changed and why</p>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:4px;">
              <tr><td style="padding:4px 0;"><div style="background:#fef3c7;padding:9px 14px;border-radius:20px;display:inline-block;font-size:13px;color:#1e293b;">Map out the character relationships in my book 📚</div></td></tr>
              <tr><td style="padding:4px 0;"><div style="background:#fef3c7;padding:9px 14px;border-radius:20px;display:inline-block;font-size:13px;color:#1e293b;">Create flashcards from my reading notes 🃏</div></td></tr>
            </table>

            <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

            <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e293b;">📈 Track your growth</p>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;background:#f1f5f9;border-radius:12px;border:1px solid #e2e8f0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e293b;">🏆 Mastery Score</p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">A live score that tracks what you actually know. Every question, every quiz, every submission feeds it.</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:4px;background:#1e1b4b;border-radius:14px;">
              <tr>
                <td style="padding:22px 24px;">
                  <p style="margin:0 0 6px;font-size:22px;">🌌</p>
                  <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#ffffff;">Your Learning Cosmos</p>
                  <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;">Your entire learning journey, mapped as a living universe. Each skill starts on the outer ring and moves inward as you master it.</p>
                </td>
              </tr>
            </table>

            <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

            <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1e293b;">Ready?</p>
            <p style="margin:0 0 20px;font-size:14px;color:#475569;">Takes less than 30 seconds. Pick your grade, choose your subjects, and start exploring. ⚡</p>

            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="border-radius:10px;background:#6366f1;">
                  <a href="https://aitutor.schoolace.ai/tutor" style="display:inline-block;padding:15px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">🚀 Get Started</a>
                </td>
              </tr>
            </table>

            <div style="height:1px;background:#e2e8f0;margin:28px 0;"></div>

            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e293b;">Questions? We're here.</p>
            <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Reply to this email anytime, a real human will get back to you. Or reach us at <a href="mailto:ace@schoolace.ai" style="color:#6366f1;text-decoration:none;">ace@schoolace.ai</a></p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 36px 24px;text-align:center;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;background:#f8fafc;">
            <p style="margin:0;font-size:12px;color:#94a3b8;"><strong style="color:#6366f1;">SchoolACE</strong> &nbsp;·&nbsp; <a href="https://schoolace.ai" style="color:#94a3b8;text-decoration:none;">schoolace.ai</a> &nbsp;·&nbsp; <a href="mailto:ace@schoolace.ai" style="color:#94a3b8;text-decoration:none;">ace@schoolace.ai</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { recipients } = await req.json();

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return Response.json({ error: 'recipients is required and must be a non-empty array of {email, firstName}' }, { status: 400 });
  }

  const results = [];

  for (const recipient of recipients) {
    const { email, firstName } = recipient;
    if (!email || !firstName) {
      results.push({ email: email || 'unknown', status: 'skipped', reason: 'Missing email or firstName' });
      continue;
    }

    try {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: EMAIL_SUBJECT,
        body: getEmailBody(firstName),
        from_name: "SchoolACE"
      });
      results.push({ email, status: 'sent' });
    } catch (error) {
      console.error(`Failed to send to ${email}:`, error.message);
      results.push({ email, status: 'failed', reason: error.message });
    }
  }

  return Response.json({
    total: recipients.length,
    sent: results.filter(r => r.status === 'sent').length,
    failed: results.filter(r => r.status === 'failed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    results
  });
});