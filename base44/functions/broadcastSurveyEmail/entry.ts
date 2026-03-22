import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { execute, skip = 0, limit = 50 } = await req.json().catch(() => ({}));

        // Fetch all users to maintain consistent order
        let allUsers = [];
        let page = 0;
        let hasMore = true;
        const fetchLimit = 100;

        while (hasMore) {
             const batch = await base44.entities.User.list('-created_date', fetchLimit, page * fetchLimit);
             allUsers = allUsers.concat(batch);
             if (batch.length < fetchLimit) hasMore = false;
             page++;
             if (page > 100) break; 
        }

        // Filter: ALL registered users EXCEPT teacher role
        const allRecipients = allUsers.filter(u => u.app_role !== 'teacher');
        
        // Apply pagination for the batch
        const batchRecipients = allRecipients.slice(skip, skip + limit);

        if (!execute) {
            return Response.json({
                message: "Dry run complete",
                total_recipients: allRecipients.length,
                batch_size: batchRecipients.length,
                skip: skip,
                limit: limit,
                next_skip: skip + limit,
                info: "Set 'execute': true in payload to send emails."
            });
        }

        // Send emails with delay to avoid rate limits
        let sentCount = 0;
        let errors = [];
        
        for (const user of batchRecipients) {
            if (!user.email) continue;
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
                // Add delay of 500ms
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {
                errors.push({ email: user.email, error: e.message });
                // If rate limit error, wait longer
                if (e.message.includes("Rate limit")) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        return Response.json({
            success: true,
            total_recipients: allRecipients.length,
            batch_processed: batchRecipients.length,
            sent_count: sentCount,
            error_count: errors.length,
            skip: skip,
            next_skip: skip + batchRecipients.length,
            errors: errors.slice(0, 10)
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});