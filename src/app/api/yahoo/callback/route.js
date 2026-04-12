import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  // 1. Check if Yahoo threw an error back at us
  if (error) {
    return new NextResponse(`Error: ${error}`, { status: 400 });
  }

  // 2. Check if a code was actually provided
  if (!code) {
    return new NextResponse('No authorization code provided', { status: 400 });
  }

  const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID;
  const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const REDIRECT_URI = `${APP_URL}/api/yahoo/callback`;

  if (!YAHOO_CLIENT_ID || !YAHOO_CLIENT_SECRET) {
    console.error('Yahoo credentials are missing in environment variables.');
    return new NextResponse('Server configuration error. Check Vercel environment variables.', { status: 500 });
  }

  try {
    // FIX: Use btoa() instead of Buffer for Vercel compatibility
    const credentials = btoa(`${YAHOO_CLIENT_ID}:${YAHOO_CLIENT_SECRET}`);
    
    // Exchange the code for the actual access token
    const tokenResponse = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: YAHOO_CLIENT_ID,
        client_secret: YAHOO_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
        grant_type: 'authorization_code'
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.text();
      console.error('Yahoo Token Error:', errData);
      return new NextResponse(`Failed to exchange Yahoo token: ${errData}`, { status: 500 });
    }

    const tokenData = await tokenResponse.json();

    // Return HTML to send message to the parent window and automatically close this popup
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Yahoo Authentication Successful</title></head>
      <body>
        <p>Authentication successful. You can safely close this window.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'YAHOO_AUTH_SUCCESS' }, '*');
          }
          window.close();
        </script>
      </body>
      </html>
    `;

    const response = new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });

    // Safely set the tokens into the user's cookies
    response.cookies.set('yahoo_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in,
      path: '/',
    });
    
    if (tokenData.refresh_token) {
        response.cookies.set('yahoo_refresh_token', tokenData.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 24 * 60 * 60, // ~30 days
            path: '/',
        });
    }

    return response;
  } catch (err) {
    console.error('Yahoo Callback Exception:', err);
    return new NextResponse('Internal Server Error while parsing Yahoo callback.', { status: 500 });
  }
}