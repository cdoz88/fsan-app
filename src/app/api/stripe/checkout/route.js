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

    // 🚀 DYNAMIC CHECKOUT ROUTING
    // Identify if the user is buying a DNO ticket (Live or Test ID)
    const dnoPriceIds = ['price_1Tv8ANBaSOn1la2fsYurqR32', 'price_1Tv8VeBaSOn1la2fIytAwZZ7'];
    const isDnoTicket = dnoPriceIds.includes(priceId);

    // Set checkout parameters based on product type
    const checkoutMode = isDnoTicket ? 'payment' : 'subscription';
    const purchaseType = isDnoTicket ? 'dno_extra_ticket' : 'subscription';
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fsan.com';
    
    const successUrl = isDnoTicket 
      ? `${baseUrl}/football/draft-night-out?checkout=success`
      : `${baseUrl}/account?checkout=success`;
      
    const cancelUrl = isDnoTicket
      ? `${baseUrl}/football/draft-night-out?checkout=canceled`
      : `${baseUrl}/subscribe?checkout=canceled`;

    // Create a Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: checkoutMode, 
      allow_promotion_codes: true, 
      success_url: successUrl, 
      cancel_url: cancelUrl,
      customer_email: session.user.email,
      client_reference_id: String(session.user.id), 
      metadata: {
        wpUserId: String(session.user.id), 
        purchaseType: purchaseType
      }
    });

    // Return the secure Stripe URL to the frontend
    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}