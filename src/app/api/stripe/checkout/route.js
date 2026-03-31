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
    
    // Safety Net: Catch a missing User ID before it even goes to Stripe
    if (!userId) {
      return NextResponse.json({ error: 'User ID is missing from session' }, { status: 400 });
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe?checkout=canceled`,
      customer_email: userEmail,
      client_reference_id: String(userId), // Stripe prefers this as a string
      metadata: {
        wpUserId: String(userId), // Stripe strictly requires metadata to be strings
      }
    });

    // Return the secure Stripe URL to the frontend
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}