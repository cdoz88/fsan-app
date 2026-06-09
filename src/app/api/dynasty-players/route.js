import { NextResponse } from 'next/server';
import { OFFSEASON_FUTURES_DATABASE } from '@/utils/offseasonData';

export async function GET() {
  try {
    // 1. Fetch live player records from Sleeper to get current ages/teams/positions
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
        // THE FIX: Automatically correct the position using Sleeper's database!
        position: match && match.position ? match.position : vegasPlayer.position,
        team: match && match.team ? match.team.toLowerCase() : (vegasPlayer.team || 'fa'),
        age: match && match.age ? parseInt(match.age) : (vegasPlayer.age || 24) 
      };
    });

    return NextResponse.json({ success: true, players: runtimeDatabase });
  } catch (error) {
    console.error("Dynasty runtime sync failed:", error);
    return NextResponse.json({ success: false, players: OFFSEASON_FUTURES_DATABASE });
  }
}