import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

// Initialize Stripe securely using our environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    // Securely get the user session on the server
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { priceId, type, returnUrl, quantity = 1 } = body;

    // Enforce a valid integer quantity (at least 1)
    const ticketQty = Math.max(1, parseInt(quantity, 10) || 1);

    let line_items = [];
    let mode = 'payment';
    let subscription_data = undefined;
    let purchaseType = 'subscription';

    if (type === 'dno_bundle') {
      // 🛒 FIRST TICKET MIXED CART: N x $22 Tickets + 1 x Recurring $7.99 Subscription with Free Trial
      mode = 'subscription'; 
      purchaseType = 'dno_ticket_bundle';
      
      const dnoBundlePriceId = 'price_1Tze2DBaSOn1la2fjK7ediju';
      const proPlusMonthlyPriceId = process.env.STRIPE_PRO_PLUS_MONTHLY_PRICE_ID || 'price_1RsVe1BaSOn1la2fTvpGPNIr';

      line_items = [
        {
          price: dnoBundlePriceId,
          quantity: ticketQty, // Billed N times immediately
        },
        {
          price: proPlusMonthlyPriceId,
          quantity: 1, // Billed once after the 30-day trial
        }
      ];

      // Stripe automatically applies this trial to the recurring item(s) only
      subscription_data = {
        trial_period_days: 30,
      };

    } else if (type === 'dno_extra_ticket') {
      // 🎟 EXTRA TICKET CART: Just N x $22 Tickets, NO Subscription
      mode = 'payment';
      purchaseType = 'dno_extra_ticket';
      
      const dnoExtraTicketPriceId = 'price_1TzeUyBaSOn1la2fhgegZYeC';

      line_items = [
        {
          price: dnoExtraTicketPriceId,
          quantity: ticketQty,
        }
      ];

    } else if (priceId) {
      // Standard FSAN Single-Item Checkout (e.g., standard Pro+ signup)
      mode = 'subscription'; 
      purchaseType = 'subscription';
      line_items = [
        {
          price: priceId,
          quantity: 1,
        }
      ];
    } else {
      return NextResponse.json({ error: 'Valid priceId or type is required' }, { status: 400 });
    }

    // Dynamic URL Routing
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fsan.com';
    const isDno = type === 'dno_bundle' || type === 'dno_extra_ticket';
    
    const successUrl = returnUrl 
      ? `${returnUrl}?checkout=success` 
      : (isDno ? `https://draftnightout.com/dno/dashboard?checkout=success` : `${baseUrl}/account?checkout=success`);
      
    const cancelUrl = returnUrl 
      ? `${returnUrl}?checkout=canceled` 
      : (isDno ? `https://draftnightout.com/dno/dashboard?checkout=canceled` : `${baseUrl}/subscribe?checkout=canceled`);

    // Build the Stripe Session Configuration
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: line_items,
      mode: mode, 
      allow_promotion_codes: true, 
      success_url: successUrl, 
      cancel_url: cancelUrl,
      customer_email: session.user.email,
      client_reference_id: String(session.user.id), 
      metadata: {
        wpUserId: String(session.user.id), 
        purchaseType: purchaseType,
        ticketQuantity: String(ticketQty) // Pass quantity to Webhook
      }
    };

    // Attach trial data if this is the DNO Bundle
    if (subscription_data) {
      sessionConfig.subscription_data = subscription_data;
    }

    // Create the Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create(sessionConfig);

    // Return the secure Stripe URL to the frontend
    return NextResponse.json({ url: stripeSession.url });

  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}