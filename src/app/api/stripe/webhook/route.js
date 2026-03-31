import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Map your Stripe Price IDs to your WordPress Tiers
const priceTierMapping = {
  'price_1TH5H5BaSOn1la2fRtfzRPpp': 'pro',
  'price_1TH5HsBaSOn1la2fuOcXj2nq': 'pro',
  'price_1TH5IaBaSOn1la2fS8s0HMPv': 'pro-plus',
  'price_1TH5J9BaSOn1la2f861yf4yB': 'pro-plus'
};

export async function POST(req) {
  try {
    const body = await req.text();
    
    // FIX: Use standard web Request headers instead of the async next/headers API
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature header');
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event;

    // Verify the webhook is authentically from Stripe using our webhook secret
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // We only care about successful checkout completions
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Safeguard: Ensure we actually have the metadata
      if (!session?.metadata?.wpUserId) {
        console.error("Missing WP User ID in session metadata");
        return NextResponse.json({ error: 'Missing WP User ID' }, { status: 400 });
      }

      // Get the WordPress User ID we secretly passed during checkout
      const wpUserId = parseInt(session.metadata.wpUserId, 10);
      
      // Retrieve the session line items to figure out exactly what they bought
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const purchasedPriceId = lineItems.data[0]?.price?.id;
      const assignedTier = priceTierMapping[purchasedPriceId] || 'subscriber';

      // Tell WordPress to upgrade the user
      const query = `
        mutation UpgradeUser {
          updateUserTier(
            input: {
              userId: ${wpUserId}, 
              tier: "${assignedTier}", 
              secret: "fsan_super_secret_webhook_key_2026"
            }
          ) {
            success
          }
        }
      `;

      const wpRes = await fetch('https://admin.fsan.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const wpJson = await wpRes.json();

      if (wpJson.errors) {
        console.error("WordPress failed to upgrade user:", wpJson.errors);
        return NextResponse.json({ error: 'Failed to update WP role' }, { status: 500 });
      }

      console.log(`Successfully upgraded WP User ${wpUserId} to ${assignedTier}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}