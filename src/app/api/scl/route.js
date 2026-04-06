import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (!action) return NextResponse.json({ success: false, message: 'Action required' }, { status: 400 });

  try {
    const nonceRes = await fetch('https://admin.fsan.com/wp-json/scl/v1/nonce', { cache: 'no-store' });
    const { nonce } = await nonceRes.json();
    
    searchParams.set('nonce', nonce);
    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?${searchParams.toString()}`;
    
    const res = await fetch(wpUrl, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Proxy Error' }, { status: 500 });
  }
}