import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const result = await base44.integrations.Core.SendEmail({
            to: "Aiden.shankar@warriorlife.net",
            subject: "Help us improve Schoolace",
            body: `Hi!
We’re building tools to make school easier, and your input matters.

Please fill out this short Google Form by Friday, February 6th, it should take less than 30 seconds.

https://docs.google.com/forms/d/e/1FAIpQLScmqD0HYTPF4qxYpPprbg74o6k9cjrTOSrrCjQsHHW6sOmb1g/viewform

Your answers help us understand how you actually study and where AI can help the most.

Thanks for helping us improve Schoolace.`
        });

        return Response.json({ success: true, result });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});