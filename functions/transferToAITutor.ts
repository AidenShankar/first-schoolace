import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const GCP_AITUTOR_URL = "https://mimir-core-v3-7k6mnc7qga-uc.a.run.app";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Get user with retry on rate limit
        let user = null;
        let lastError = null;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                user = await base44.auth.me();
                break;
            } catch (err) {
                lastError = err;
                const status = err?.status || err?.response?.status;
                if (status === 429) {
                    // Exponential backoff: 200ms, 400ms, 800ms
                    await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)));
                    continue;
                }
                throw err;
            }
        }

        if (!user) {
            if (lastError) throw lastError;
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sharedSecret = Deno.env.get('GCP_SHARED_SECRET');
        if (!sharedSecret) {
            return Response.json({ error: 'Server misconfiguration: missing GCP_SHARED_SECRET' }, { status: 500 });
        }

        const payload = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            app_role: user.app_role || 'student',
            exp: Date.now() + 5 * 60 * 1000
        };

        const payloadStr = JSON.stringify(payload);
        const encoder = new TextEncoder();

        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(sharedSecret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadStr));
        const sigHex = Array.from(new Uint8Array(signatureBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        const payloadB64 = btoa(payloadStr);
        const token = `${payloadB64}.${sigHex}`;

        const redirectUrl = `${GCP_AITUTOR_URL}/auth/schoolace-handoff?token=${encodeURIComponent(token)}`;

        return Response.json({ 
            success: true,
            token,
            redirect_url: redirectUrl
        });

    } catch (error) {
        console.error('transferToAITutor error:', error);
        const status = error?.status || error?.response?.status;
        return Response.json({ error: error.message }, { status: status === 429 ? 429 : 500 });
    }
});