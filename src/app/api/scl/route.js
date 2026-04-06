import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (!action) {
    return NextResponse.json({ success: false, message: 'Action is required' }, { status: 400 });
  }

  try {
    // 1. Fetch a valid security token (nonce) from our custom WordPress endpoint
    const nonceRes = await fetch('https://admin.fsan.com/wp-json/scl/v1/nonce', { cache: 'no-store' });
    
    if (!nonceRes.ok) {
        return NextResponse.json({ success: false, message: 'Failed to communicate with WordPress' }, { status: 500 });
    }

    const nonceData = await nonceRes.json();
    const nonce = nonceData.nonce;

    if (!nonce) {
      return NextResponse.json({ success: false, message: 'Failed to generate security token' }, { status: 500 });
    }

    // 2. Append the nonce to the URL parameters
    searchParams.set('nonce', nonce);

    // 3. Securely proxy the request to the WordPress admin-ajax endpoint
    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?${searchParams.toString()}`;
    
    const res = await fetch(wpUrl, { cache: 'no-store' });
    const data = await res.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('SCL API Proxy Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server proxy error' }, { status: 500 });
  }
}