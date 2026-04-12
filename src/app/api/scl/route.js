import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (!action) return NextResponse.json({ success: false, message: 'Action required' }, { status: 400 });

  try {
    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?${searchParams.toString()}`;
    const res = await fetch(wpUrl, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Proxy Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php`;

    // Extract token if present for secure saving
    const authHeader = request.headers.get('authorization');
    const headers = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const res = await fetch(wpUrl, {
      method: 'POST',
      body: formData,
      headers: headers
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("SCL Proxy POST Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to proxy POST request.' }, { status: 500 });
  }
}