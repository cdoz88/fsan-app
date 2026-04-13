import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Ping the WordPress GraphQL API to wake up the database and cache the ads
    const query = `
      query GetGlobalAds {
        globalAds {
          id
        }
      }
    `;
    
    await fetch('https://admin.fsan.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    // 2. The act of hitting this route also keeps your Vercel serverless functions warm!
    return NextResponse.json({ success: true, message: 'Server and Database warmed successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to warm cache.' }, { status: 500 });
  }
}