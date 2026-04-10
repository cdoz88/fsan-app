import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function GET(req, { params }) {
  const yahooCookie = cookies().get('yahoo_auth');

  if (!yahooCookie) {
    return NextResponse.json({ error: 'Not authenticated with Yahoo' }, { status: 401 });
  }

  let sessionData = JSON.parse(yahooCookie.value);

  // Automatically refresh the token if it has expired
  if (Date.now() > sessionData.expires_at) {
    try {
      const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const tokenResponse = await axios.post('https://api.login.yahoo.com/oauth2/get_token', new URLSearchParams({
        client_id: process.env.YAHOO_CLIENT_ID,
        client_secret: process.env.YAHOO_CLIENT_SECRET,
        redirect_uri: `${APP_URL}/api/yahoo/callback`,
        refresh_token: sessionData.refresh_token,
        grant_type: 'refresh_token'
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      sessionData = {
        access_token: tokenResponse.data.access_token,
        refresh_token: tokenResponse.data.refresh_token,
        expires_at: Date.now() + tokenResponse.data.expires_in * 1000
      };

      cookies().set('yahoo_auth', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to refresh Yahoo token' }, { status: 401 });
    }
  }

  // Forward the request to Yahoo exactly as your Express proxy did
  const endpointPath = params.endpoint.join('/');
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `https://fantasysports.yahooapis.com/fantasy/v2/${endpointPath}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'Authorization': `Bearer ${sessionData.access_token}`,
        'Accept': 'application/json'
      }
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(error.response?.data || { error: 'Failed to fetch from Yahoo API' }, { status: error.response?.status || 500 });
  }
}