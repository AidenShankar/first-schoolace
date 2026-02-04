import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { execute } = await req.json().catch(() => ({}));

        // Fetch all users
        let allUsers = [];
        let page = 0;
        let hasMore = true;
        const limit = 100;

        while (hasMore) {
             const batch = await base44.entities.User.list('-created_date', limit, page * limit);
             allUsers = allUsers.concat(batch);
             if (batch.length < limit) hasMore = false;
             page++;
             if (page > 100) break; // Safety limit
        }

        // Filter: ALL registered users EXCEPT teacher role
        // Note: SDK flattens custom fields, so access u.app_role directly
        const recipients = allUsers.filter(u => u.app_role !== 'teacher');
        
        if (!execute) {
            return Response.json({
                message: "Dry run complete",
                total_users: allUsers.length,
                recipient_count: recipients.length,
                teacher_count: allUsers.length - recipients.length,
                info: "Set 'execute': true in payload to send emails."
            });
        }

        // Send emails
        let sentCount = 0;
        let errors = [];
        
        // Run in chunks to be efficient
        const chunkSize = 10;
        for (let i = 0; i < recipients.length; i += chunkSize) {
            const chunk = recipients.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (user) => {
                if (!user.email) return;
                try {
                     await base44.integrations.Core.SendEmail({
                        to: user.email,
                        subject: "Reminder: Schoolace Survey",
                        body: `<p>Hi,</p>
<p>This is a quick reminder to complete the Schoolace survey by Friday, Feb 7, if you haven’t already.</p>
<p>It takes less than 30 seconds, and your input directly helps us improve Schoolace for students like you.</p>
<p>If you’ve already completed it—thank you!</p>
<p>Take the survey here:</p>
<p><a href="https://forms.gle/SDQxQ6mahv4X6noZ9">https://forms.gle/SDQxQ6mahv4X6noZ9</a></p>
<p>Thanks,</p>
<p>The Schoolace Team</p>`
                    });
                    sentCount++;
                } catch (e) {
                    errors.push({ email: user.email, error: e.message });
                }
            }));
        }

        return Response.json({
            success: true,
            total_attempted: recipients.length,
            sent_count: sentCount,
            error_count: errors.length,
            errors: errors.slice(0, 10)
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});