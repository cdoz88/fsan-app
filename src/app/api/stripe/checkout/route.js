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
    const { priceId, type, returnUrl } = body;

    // 🚀 DYNAMIC CHECKOUT ROUTING & BUNDLING
    // Check if this is a DNO Ticket purchase via the payload type OR the specific DNO price IDs
    // NOTE: 'price_1Tv8ANBaSOn1la2fsYurqR32' is the placeholder for your future Live ID
    const dnoPriceIds = ['price_1Tv8ANBaSOn1la2fsYurqR32', 'price_1Tze3ZBaSOn1la2fKKZusWaM'];
    const isDnoBundle = type === 'dno_ticket' || (priceId && dnoPriceIds.includes(priceId));

    let line_items = [];
    let mode = 'payment';
    let subscription_data = undefined;
    let purchaseType = 'subscription';

    if (isDnoBundle) {
      // MIXED CART: One-time ticket + Recurring Subscription with Free Trial
      mode = 'subscription'; // Must be 'subscription' if any recurring items are in the cart
      purchaseType = 'dno_ticket_bundle';
      
      // Determine correct DNO Ticket Price ID (Live vs Test)
      const dnoTicketPriceId = process.env.NODE_ENV === 'development' 
        ? 'price_1Tze3ZBaSOn1la2fKKZusWaM' // Your TEST $22 Ticket ID
        : 'price_1Tv8ANBaSOn1la2fsYurqR32'; // Your LIVE $22 Ticket ID (Update this later!)

      // Your actual Pro+ Monthly Price ID ($7.99/mo)
      const proPlusMonthlyPriceId = process.env.STRIPE_PRO_PLUS_MONTHLY_PRICE_ID || 'price_1RsVe1BaSOn1la2fTvpGPNIr';

      line_items = [
        {
          price: dnoTicketPriceId,
          quantity: 1, // Billed immediately
        },
        {
          price: proPlusMonthlyPriceId,
          quantity: 1, // Billed after the 30-day trial
        }
      ];

      // Stripe automatically applies this trial to the recurring item(s) only
      subscription_data = {
        trial_period_days: 30,
      };

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
    
    // If DNO passed a specific returnUrl, use it. Otherwise, default to FSAN routes.
    const successUrl = returnUrl 
      ? `${returnUrl}?checkout=success` 
      : (isDnoBundle ? `https://draftnightout.com/dno/dashboard?checkout=success` : `${baseUrl}/account?checkout=success`);
      
    const cancelUrl = returnUrl 
      ? `${returnUrl}?checkout=canceled` 
      : (isDnoBundle ? `https://draftnightout.com/dno/dashboard?checkout=canceled` : `${baseUrl}/subscribe?checkout=canceled`);

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
        purchaseType: purchaseType
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