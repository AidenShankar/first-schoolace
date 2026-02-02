import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Final cleanup: Send to the 4 users who failed due to rate limits
        const specificEmails = [
            "rebekah.varghese@warriorlife.net",
            "vbui@warriorlife.net",
            "cash.slezak@gmail.com",
            "sammourmahfouz@gmail.com"
        ];
        
        const emailSubject = "Help us improve Schoolace";
        const emailBody = `Hi! We’re building tools to make school easier, and your input matters.

Please fill out this short Google Form by Friday, February 6th, it should take less than 30 seconds.

https://docs.google.com/forms/d/e/1FAIpQLScmqD0HYTPF4qxYpPprbg74o6k9cjrTOSrrCjQsHHW6sOmb1g/viewform

Your answers help us understand how you actually study and where AI can help the most.

Thanks for helping us improve Schoolace.`;

        let sentCount = 0;
        let errors = [];

        console.log(`Sending final retry to ${specificEmails.length} users.`);

        for (const email of specificEmails) {
            try {
                await base44.integrations.Core.SendEmail({
                    to: email,
                    subject: emailSubject,
                    body: emailBody
                });
                sentCount++;
                console.log(`Sent to ${email}`);
                await delay(1000); // Be very gentle
            } catch (err) {
                console.error(`Failed to send to ${email}:`, err);
                errors.push({ email: email, error: err.message });
            }
        }

        return Response.json({ 
            success: true, 
            sent_count: sentCount,
            errors: errors 
        });

    } catch (error) {
        console.error("Broadcast failed:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});