import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        
        // Price ID for the "Schoolace Supercharged" plan
        const priceId = "price_1S4td14UhCbFBRyx8K8XJZJy"; 

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            payment_method_collection: 'if_required',
            success_url: `https://schoolace.org/Dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://schoolace.org/Dashboard`,
            customer_email: user.email,
            // Pass user ID to associate Stripe customer with Base44 user
            client_reference_id: user.id,
             // Enable promotions/coupon codes
            allow_promotion_codes: true,
        });

        return new Response(JSON.stringify({ checkout_url: session.url }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error("Error creating Stripe checkout session:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});