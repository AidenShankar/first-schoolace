import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Parse the body to get the 'to' address
        let bodyParams = {};
        try {
            bodyParams = await req.json();
        } catch (e) {
            // No body provided
        }

        const recipient = bodyParams.to || "haris.pmails@gmail.com";

        const result = await base44.integrations.Core.SendEmail({
            to: recipient,
            subject: "Reminder: Schoolace Survey (Deadline Feb 7)",
            body: `<p>Hi,</p>
<p>This is a quick reminder to complete the Schoolace survey by Friday, Feb 7, if you haven’t already.</p>
<p>It takes less than 30 seconds, and your input directly helps us improve Schoolace for students like you.</p>
<p>If you’ve already completed it—thank you!</p>
<p>Take the survey here:</p>
<p><a href="https://forms.gle/SDQxQ6mahv4X6noZ9">https://forms.gle/SDQxQ6mahv4X6noZ9</a></p>
<p>Thanks,</p>
<p>The Schoolace Team</p>`
        });

        return Response.json({ success: true, recipient, result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});