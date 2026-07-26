import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; 

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
  }

  try {
    if (type === 'dno_pool') {
      const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?action=dno_get_leagues_pool&user_id=${session.user.id}&t=${Date.now()}`;
      const res = await fetch(wpUrl, { cache: 'no-store' });
      const wpData = await res.json();

      if (!wpData.success || !wpData.data) {
        return NextResponse.json({ leagues: [], user_joined_count: 0, allotted_entries: 1, joined_leagues: [] });
      }

      const sanitizedLeagues = wpData.data.leagues.map(l => ({
        id: l.id,
        name: l.name,
        total_spots: l.total_spots || 12,
        filled_spots: l.filled_spots || 0,
        draft_date: l.draft_date || '',
        draft_hour: l.draft_hour || '',
        draft_minute: l.draft_minute || '',
        draft_ampm: l.draft_ampm || 'PM',
        draft_style: l.draft_style || 'fast'
      }));

      // Fetch LIVE roster counts directly from Sleeper to ensure it's never out of sync!
      const liveLeagues = await Promise.all(sanitizedLeagues.map(async (league) => {
        try {
          const slpRes = await fetch(`https://api.sleeper.app/v1/league/${league.id}/users`, { 
            next: { revalidate: 30 } 
          });
          if (slpRes.ok) {
            const users = await slpRes.json();
            league.filled_spots = users.length;
          }
        } catch (e) {
          console.warn(`Could not sync live user count for ${league.id}`);
        }
        return league;
      }));

      const userJoinedCount = wpData.data.user_joined_count || 0;
      const allottedEntries = wpData.data.allotted_entries || 1; 
      
      // 🚀 Include the persistent array of joined league IDs 
      const joinedLeagues = wpData.data.joined_leagues || [];

      return NextResponse.json({
        leagues: liveLeagues,
        user_joined_count: userJoinedCount,
        allotted_entries: allottedEntries,
        joined_leagues: joinedLeagues 
      });
    }

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
    
    if (url.searchParams.get('action') === 'claim-spot') {
      const { leagueId } = await request.json();
      
      const wpUrl = `https://admin.fsan.com/wp-admin/admin-ajax.php?action=dno_get_leagues_pool&user_id=${session.user.id}&t=${Date.now()}`;
      const wpRes = await fetch(wpUrl, { cache: 'no-store' });
      const wpData = await wpRes.json();

      if (!wpData.success || !wpData.data) {
        return NextResponse.json({ success: false, message: 'DNO configurations unavailable.' }, { status: 500 });
      }

      const userJoinedCount = wpData.data.user_joined_count || 0;
      const allottedEntries = wpData.data.allotted_entries || 1;

      if (userJoinedCount >= allottedEntries) {
        return NextResponse.json({ success: false, message: 'No available entries remaining. Purchase an additional entry token to continue!' }, { status: 403 });
      }

      const targetedLeague = wpData.data.leagues.find(l => l.id === leagueId);
      if (!targetedLeague || !targetedLeague.invite_link) {
        return NextResponse.json({ success: false, message: 'Targeted draft room invite url link missing or invalid.' }, { status: 404 });
      }

      if (targetedLeague.filled_spots >= targetedLeague.total_spots) {
        return NextResponse.json({ success: false, message: 'This draft room is full!' }, { status: 400 });
      }

      // UPDATE USER LEDGER IN WORDPRESS
      const ledgerFormData = new FormData();
      ledgerFormData.append('action', 'dno_log_user_entry');
      ledgerFormData.append('user_id', session.user.id);
      ledgerFormData.append('league_id', leagueId); // 🚀 Send the exact league ID to track it
      ledgerFormData.append('secret', 'fsan_super_secret_webhook_key_2026'); 

      try {
        const ledgerRes = await fetch('https://admin.fsan.com/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: ledgerFormData
        });
        const ledgerData = await ledgerRes.json();
        
        if (!ledgerData.success) {
            throw new Error('WP ledger sync rejected');
        }
      } catch (e) {
        console.error("Failed to deduct ticket in WP:", e);
        return NextResponse.json({ success: false, message: 'Database sync failed while reserving spot. Roster claim aborted.' }, { status: 500 });
      }

      return NextResponse.json({ success: true, invite_link: targetedLeague.invite_link });
    }

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