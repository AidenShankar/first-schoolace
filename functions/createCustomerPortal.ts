import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Strict authentication check
    if (!user) {
      return Response.json({ error: 'You must be logged in.' }, { status: 401 });
    }

    // Check if user has a Stripe customer ID
    if (!user.customer_id) {
      return Response.json({ error: 'No subscription found.' }, { status: 400 });
    }

    // Create a portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.customer_id,
      return_url: `${req.headers.get('origin')}/Dashboard`,
    });

    return Response.json({ portal_url: portalSession.url });
  } catch (error) {
    console.error('Portal Error:', error);
    return Response.json({ 
      error: `Failed to create customer portal: ${error.message}` 
    }, { status: 500 });
  }
});