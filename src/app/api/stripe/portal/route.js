import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Look up the user in Stripe by their email address
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    // If they don't exist in Stripe yet, they don't have a billing history
    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'No billing history found.' }, { status: 404 });
    }

    const customerId = customers.data[0].id;

    // 2. Generate a secure, temporary link to their specific Customer Portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?checkout=success`, // Drops them back on the subscription tab
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error('Stripe Portal Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}