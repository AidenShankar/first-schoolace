import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Skip the first 299 users who already got the email (120 batch 1 + 179 batch 2)
        // Fetch remaining users
        const SKIP_COUNT = 299;
        const LIMIT_COUNT = 1000;
        
        // Using filter to allow skipping
        // users are sorted by created_date desc (newest first)
        const users = await base44.asServiceRole.entities.User.filter({}, "-created_date", LIMIT_COUNT, SKIP_COUNT);
        
        const emailSubject = "Help us improve Schoolace";
        const emailBody = `Hi! We’re building tools to make school easier, and your input matters.

Please fill out this short Google Form by Friday, February 6th, it should take less than 30 seconds.

https://docs.google.com/forms/d/e/1FAIpQLScmqD0HYTPF4qxYpPprbg74o6k9cjrTOSrrCjQsHHW6sOmb1g/viewform

Your answers help us understand how you actually study and where AI can help the most.

Thanks for helping us improve Schoolace.`;

        let sentCount = 0;
        let errors = [];

        console.log(`Resuming broadcast. Found ${users.length} remaining users (skipped ${SKIP_COUNT}).`);

        for (const user of users) {
            if (user.email) {
                try {
                    await base44.integrations.Core.SendEmail({
                        to: user.email,
                        subject: emailSubject,
                        body: emailBody
                    });
                    sentCount++;
                    console.log(`Sent to ${user.email} (${sentCount}/${users.length})`);
                    
                    // Wait 500ms to avoid rate limits
                    await delay(500); 
                    
                } catch (err) {
                    console.error(`Failed to send to ${user.email}:`, err);
                    errors.push({ email: user.email, error: err.message });
                    
                    // If rate limited, wait longer
                    if (err.message?.includes("Rate limit") || err.status === 429) {
                         console.log("Rate limit hit, waiting 5 seconds...");
                         await delay(5000);
                    }
                }
            }
        }

        return Response.json({ 
            success: true, 
            total_remaining: users.length, 
            sent_count: sentCount,
            errors: errors 
        });

    } catch (error) {
        console.error("Broadcast failed:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});