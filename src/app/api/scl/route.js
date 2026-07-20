import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; 

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const session = await getServerSession(authOptions);

  // Gated: Force authentication to fetch open DNO leagues pool
  if (!session) {
    return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
  }

  try {
    if (type === 'dno_pool') {
      // 🚀 FIX: Append the user_id to the WP URL so WordPress knows whose live tickets to fetch!
      const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?action=dno_get_leagues_pool&user_id=${session.user.id}&t=${Date.now()}`;
      const res = await fetch(wpUrl, { cache: 'no-store' });
      const wpData = await res.json();

      if (!wpData.success || !wpData.data) {
        return NextResponse.json({ leagues: [], user_joined_count: 0, allotted_entries: 1 });
      }

      // Hide secure invite links from the initial pool payload to prevent scraping
      const sanitizedLeagues = wpData.data.leagues.map(l => ({
        id: l.id,
        name: l.name,
        total_spots: l.total_spots || 12,
        filled_spots: l.filled_spots || 0
      }));

      // 🚀 FIX: Read the LIVE ticket count directly from the WordPress database response instead of the stale session
      const userJoinedCount = wpData.data.user_joined_count || 0;
      const allottedEntries = wpData.data.allotted_entries || 1; 

      return NextResponse.json({
        leagues: sanitizedLeagues,
        user_joined_count: userJoinedCount,
        allotted_entries: allottedEntries
      });
    }

    // Fallback for previous leaderboard scripts
    const action = searchParams.get('action');
    if (!action) return NextResponse.json({ success: false, message: 'Action or type required' }, { status: 400 });

    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?${searchParams.toString()}`;
    const res = await fetch(wpUrl, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("DNO Bridge Proxy GET Error:", error);
    return NextResponse.json({ success: false, message: 'Proxy Error' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    
    // 🚀 SECURE GATE: Handle claiming a draft slot
    if (url.pathname.endsWith('/claim-spot')) {
      const { leagueId } = await request.json();
      
      // Securely fetch original raw league options stack AND the user's live ticket count
      const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?action=dno_get_leagues_pool&user_id=${session.user.id}&t=${Date.now()}`;
      const wpRes = await fetch(wpUrl, { cache: 'no-store' });
      const wpData = await wpRes.json();

      if (!wpData.success || !wpData.data) {
        return NextResponse.json({ success: false, message: 'DNO configurations unavailable.' }, { status: 500 });
      }

      // 🚀 FIX: Use LIVE ticket counts for the gate validation
      const userJoinedCount = wpData.data.user_joined_count || 0;
      const allottedEntries = wpData.data.allotted_entries || 1;

      // Restrict access if user ledger is exhausted
      if (userJoinedCount >= allottedEntries) {
        return NextResponse.json({ success: false, message: 'No available entries remaining. Purchase an additional entry token to continue!' }, { status: 403 });
      }

      const targetedLeague = wpData.data.leagues.find(l => l.id === leagueId);
      if (!targetedLeague || !targetedLeague.invite_link) {
        return NextResponse.json({ success: false, message: 'Targeted draft room invite url link missing or invalid.' }, { status: 404 });
      }

      // Check room full threshold locally
      if (targetedLeague.filled_spots >= targetedLeague.total_spots) {
        return NextResponse.json({ success: false, message: 'This draft room is full!' }, { status: 400 });
      }

      // UPDATE USER LEDGER HERE (Increment user's dno_joined_count in your database using an SQL or ORM update statement)
      // e.g., await db.user.update({ where: { id: session.user.id }, data: { dno_joined_count: userJoinedCount + 1 } });

      return NextResponse.json({ success: true, invite_link: targetedLeague.invite_link });
    }

    // Generic fallback proxy for previous leaderboard operations
    const formData = await request.formData();
    const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php`;

    const authHeader = request.headers.get('authorization');
    const headers = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const res = await fetch(wpUrl, {
      method: 'POST',
      body: formData,
      headers: headers
    });

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("SCL Proxy POST Error:", error);
    return NextResponse.json({ success: false, message: 'Failed to process DNO action submission.' }, { status: 500 });
  }
}