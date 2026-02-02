import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { to, subject, body } = await req.json();

        if (!to || !subject || !body) {
            return Response.json({ error: "Missing required fields: to, subject, body" }, { status: 400 });
        }

        const result = await base44.integrations.Core.SendEmail({
            to,
            subject,
            body
        });

        return Response.json({ success: true, result });
    } catch (error) {
        console.error("Failed to send email:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});