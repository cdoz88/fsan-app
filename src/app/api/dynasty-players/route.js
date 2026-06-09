import { NextResponse } from 'next/server';
import { OFFSEASON_FUTURES_DATABASE } from '@/utils/offseasonData';

export async function GET() {
  try {
    // 1. Fetch live player records from Sleeper to get current ages/teams
    const sleeperRes = await fetch('https://api.sleeper.app/v1/players/nfl');
    if (!sleeperRes.ok) throw new Error("Failed to reach Sleeper API");
    const sleeperData = await sleeperRes.json();
    const sleeperPlayers = Object.values(sleeperData);

    // 2. Map across our Vegas foundation and inject matching demographic data
    const runtimeDatabase = OFFSEASON_FUTURES_DATABASE.map(vegasPlayer => {
      const cleanVegasName = vegasPlayer.name.toLowerCase().replace(/[^a-z]/g, '');

      const match = sleeperPlayers.find(sp => {
        if (!sp.first_name || !sp.last_name) return false;
        const cleanSleeperName = `${sp.first_name}${sp.last_name}`.toLowerCase().replace(/[^a-z]/g, '');
        return cleanSleeperName.includes(cleanVegasName) || cleanVegasName.includes(cleanSleeperName);
      });

      return {
        ...vegasPlayer,
        team: match && match.team ? match.team.toLowerCase() : (vegasPlayer.team || 'fa'),
        age: match && match.age ? parseInt(match.age) : (vegasPlayer.age || 24) // Fallback default for incoming rookies
      };
    });

    return NextResponse.json({ success: true, players: runtimeDatabase });
  } catch (error) {
    console.error("Dynasty runtime sync failed:", error);
    // Secure fallback to original file data if the external API rate-limits
    return NextResponse.json({ success: false, players: OFFSEASON_FUTURES_DATABASE });
  }
}