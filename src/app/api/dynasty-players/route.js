import { NextResponse } from 'next/server';
import { OFFSEASON_FUTURES_DATABASE } from '@/utils/offseasonData';

export async function GET() {
  try {
    const sleeperRes = await fetch('https://api.sleeper.app/v1/players/nfl');
    if (!sleeperRes.ok) throw new Error("Failed to reach Sleeper API");
    const sleeperData = await sleeperRes.json();
    const sleeperPlayers = Object.values(sleeperData);

    const runtimeDatabase = OFFSEASON_FUTURES_DATABASE.map(vegasPlayer => {
      const cleanVegasName = vegasPlayer.name.toLowerCase().replace(/[^a-z]/g, '');

      const match = sleeperPlayers.find(sp => {
        if (!sp.first_name || !sp.last_name) return false;
        
        // THE FIX: Ensure we only match Offensive Skill Positions! No Guards or DEs.
        if (!['QB', 'RB', 'WR', 'TE'].includes(sp.position)) return false;

        const cleanSleeperName = `${sp.first_name}${sp.last_name}`.toLowerCase().replace(/[^a-z]/g, '');
        return cleanSleeperName.includes(cleanVegasName) || cleanVegasName.includes(cleanSleeperName);
      });

      return {
        ...vegasPlayer,
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