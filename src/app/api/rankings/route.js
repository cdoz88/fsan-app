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