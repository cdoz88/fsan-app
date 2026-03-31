import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe securely using our environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { priceId, userId, userEmail } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Send them back to their account dashboard on success, or back to the subscribe page if they back out
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe?checkout=canceled`,
      customer_email: userEmail, // Pre-fills their email on the Stripe screen!
      client_reference_id: userId, // This helps us securely identify the WordPress user in the webhook later
      metadata: {
        wpUserId: userId, 
      }
    });

    // Return the secure Stripe URL to the frontend
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}