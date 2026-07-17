import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

// The specific price ID for your "Supercharged" plan
const SUPERCHARGED_PRICE_ID = 'price_1S4td14UhCbFBRyx8K8XJZJy';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'You must be logged in to sync your subscription.' }, { status: 401 });
    }

    // 1. Find the Stripe Customer
    let customerId = user.customer_id;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length === 0) {
        return Response.json({ error: 'No subscription found for your account.' }, { status: 404 });
      }
      customerId = customers.data[0].id;
    }

    // 2. Find active subscriptions for that customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 10,
    });

    // 3. Check if any active subscription is for the Supercharged plan
    const superchargedSub = subscriptions.data.find(sub => 
      sub.items.data.some(item => item.price.id === SUPERCHARGED_PRICE_ID)
    );

    if (superchargedSub) {
      // 4. Update the user record in Base44
      await base44.asServiceRole.entities.User.update(user.id, {
        subscription_status: 'active',
        subscription_tier: 'supercharged',
        subscription_id: superchargedSub.id,
        customer_id: customerId,
      });
      console.log(`✅ Successfully synced subscription for ${user.email}`);
      return Response.json({ success: true, message: 'Account synced! You now have Schoolace Supercharged.' });
    } else {
      console.log(`No active Supercharged subscription found for ${user.email}`);
      return Response.json({ error: 'No active Schoolace Supercharged subscription found.' }, { status: 404 });
    }

  } catch (error) {
    console.error('❌ Sync Subscription Error:', error);
    return Response.json({ error: `An error occurred: ${error.message}` }, { status: 500 });
  }
});