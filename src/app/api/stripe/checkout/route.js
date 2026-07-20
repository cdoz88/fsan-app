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

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Create a Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // Changed to 'payment' since this is a one-time ticket, not a subscription
      allow_promotion_codes: true, 
      // 🚀 The BASE_URL dynamically ensures they return to the exact domain they started on
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/football/draft-night-out?checkout=success`, 
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/football/draft-night-out?checkout=canceled`,
      customer_email: session.user.email,
      client_reference_id: String(session.user.id), 
      metadata: {
        wpUserId: String(session.user.id), 
        purchaseType: 'dno_extra_ticket'
      }
    });

    // Return the secure Stripe URL to the frontend
    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}