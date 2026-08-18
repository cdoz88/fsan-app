import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || '2026';
  const week = searchParams.get('week') || 'Season';

  try {
    // Construct the endpoint URL to ping your WordPress admin-ajax handler
    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?action=omfg_get_projections&year=${encodeURIComponent(year)}&week=${encodeURIComponent(week)}&t=${Date.now()}`;

    const res = await fetch(wpUrl, { cache: 'no-store' });
    const wpData = await res.json();

    if (!wpData.success || !wpData.data) {
      return NextResponse.json({ 
        success: false, 
        message: 'No OMFG Model found for the requested period.', 
        players: [] 
      });
    }

    return NextResponse.json({
      success: true,
      year: wpData.data.year,
      week: wpData.data.week,
      players: wpData.data.players || []
    });

  } catch (error) {
    console.error("OMFG Bridge Proxy GET Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: 'Proxy Error loading OMFG data.', 
      players: [] 
    }, { status: 500 });
  }
}