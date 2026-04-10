import { NextResponse } from 'next/server';

export async function GET() {
  const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const REDIRECT_URI = `${APP_URL}/api/yahoo/callback`;

  if (!YAHOO_CLIENT_ID) {
    return NextResponse.json({ error: 'YAHOO_CLIENT_ID is not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: YAHOO_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    prompt: 'login',
  });

  return NextResponse.json({ url: `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}` });
}