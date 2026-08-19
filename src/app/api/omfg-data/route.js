import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || '';
  const week = searchParams.get('week') || '';

  try {
    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?action=omfg_get_projections&year=${encodeURIComponent(year)}&week=${encodeURIComponent(week)}&t=${Date.now()}`;

    const res = await fetch(wpUrl, { cache: 'no-store' });
    const wpData = await res.json();

    if (!wpData.success) {
      return NextResponse.json({ 
        success: false, 
        message: wpData.data?.message || 'No OMFG Model found.', 
        players: [],
        available_models: wpData.data?.available_models || []
      });
    }

    return NextResponse.json({
      success: true,
      year: wpData.data.year,
      week: wpData.data.week,
      players: wpData.data.players || [],
      available_models: wpData.data.available_models || []
    });

  } catch (error) {
    console.error("OMFG Bridge Proxy GET Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: 'Proxy Error loading OMFG data.', 
      players: [],
      available_models: []
    }, { status: 500 });
  }
}