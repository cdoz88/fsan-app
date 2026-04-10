import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return new NextResponse('Missing authorization code', { status: 400 });
  }

  const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID;
  const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const REDIRECT_URI = `${APP_URL}/api/yahoo/callback`;

  try {
    const tokenResponse = await axios.post('https://api.login.yahoo.com/oauth2/get_token', new URLSearchParams({
      client_id: YAHOO_CLIENT_ID,
      client_secret: YAHOO_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
      grant_type: 'authorization_code'
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const expires_at = Date.now() + expires_in * 1000;

    // Securely store the token in an encrypted HTTP-only cookie
    cookies().set('yahoo_auth', JSON.stringify({ access_token, refresh_token, expires_at }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return new NextResponse(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'YAHOO_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/scores';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });
  } catch (error) {
    console.error('Yahoo Auth Error:', error.response?.data || error.message);
    return new NextResponse('Failed to authenticate with Yahoo', { status: 500 });
  }
}