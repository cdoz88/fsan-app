import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // The WP plugin uses action=nfl_get_consensus to get the aggregated list
  const action = searchParams.get('action') || 'nfl_get_consensus';
  const position = searchParams.get('position') || 'QB';
  const week = searchParams.get('week') || 'Offseason';

  try {
    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?action=${action}&position=${position}&week=${week}`;
    
    const res = await fetch(wpUrl, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Rankings Proxy Error:", error);
    return NextResponse.json({ success: false, message: 'Proxy Error', data: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php`;
    
    // Extract token if present
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
    console.error("Rankings Submit Proxy Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to proxy request.' }, { status: 500 });
  }
}