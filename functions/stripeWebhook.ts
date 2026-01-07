import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sig = req.headers.get('stripe-signature');
    const body = await req.text();

    console.log('Webhook received:', req.headers.get('stripe-signature'));

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    console.log('Event type:', event.type);

    // Handle successful subscription creation
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Session completed for user:', session.metadata?.user_email);
      
      if (session.mode === 'subscription' && session.metadata?.user_id) {
        // Update user to Supercharged status
        await base44.asServiceRole.entities.User.update(session.metadata.user_id, {
          subscription_status: 'active',
          subscription_tier: 'supercharged',
          subscription_id: session.subscription,
          customer_id: session.customer
        });
        
        console.log(`✅ User ${session.metadata.user_email} upgraded to Supercharged`);
      }
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      console.log('Subscription updated:', subscription.id, subscription.status);
      
      // Find user by subscription ID
      const users = await base44.asServiceRole.entities.User.filter({
        subscription_id: subscription.id
      });
      
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          subscription_status: subscription.status === 'active' ? 'active' : subscription.status
        });
        console.log(`✅ User subscription status updated: ${subscription.status}`);
      }
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      console.log('Subscription canceled:', subscription.id);
      
      // Find user by subscription ID and downgrade
      const users = await base44.asServiceRole.entities.User.filter({
        subscription_id: subscription.id
      });
      
      if (users.length > 0) {
        await base44.asServiceRole.entities.User.update(users[0].id, {
          subscription_status: 'canceled',
          subscription_tier: null,
          subscription_id: null
        });
        
        console.log(`✅ User subscription canceled: ${subscription.id}`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});