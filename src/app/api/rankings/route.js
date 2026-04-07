import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Ensure the action is set to your plugin's AJAX hook
  if (!searchParams.has('action')) {
    searchParams.set('action', 'get_nfl_rankings');
  }

  try {
    // Point this to your actual WordPress admin-ajax URL
    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?${searchParams.toString()}`;
    
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