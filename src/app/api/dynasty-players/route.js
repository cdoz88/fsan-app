import { NextResponse } from 'next/server';
import { OFFSEASON_FUTURES_DATABASE } from '@/utils/offseasonData';

export async function GET() {
  try {
    const sleeperRes = await fetch('https://api.sleeper.app/v1/players/nfl');
    if (!sleeperRes.ok) throw new Error("Failed to reach Sleeper API");
    const sleeperData = await sleeperRes.json();
    const sleeperPlayers = Object.values(sleeperData);

    const runtimeDatabase = OFFSEASON_FUTURES_DATABASE.map(vegasPlayer => {
      if (!vegasPlayer.name) return vegasPlayer;
      
      const cleanVegasName = vegasPlayer.name.toLowerCase().replace(/[^a-z]/g, '');

      const match = sleeperPlayers.find(sp => {
        if (!sp.first_name || !sp.last_name) return false;
        if (!['QB', 'RB', 'WR', 'TE'].includes(sp.position)) return false;

        const cleanSleeperName = `${sp.first_name}${sp.last_name}`.toLowerCase().replace(/[^a-z]/g, '');
        
        // 🛡️ THE FIX: Strict matching prevents short names (like "Brown") from hijacking the wrong players
        return cleanSleeperName === cleanVegasName || 
               (cleanSleeperName.startsWith(cleanVegasName) && cleanVegasName.length > 5) ||
               (cleanVegasName.startsWith(cleanSleeperName) && cleanSleeperName.length > 5);
      });

      return {
        ...vegasPlayer,
        // 🛡️ THE FIX: We force the CSV position to remain the source of truth!
        position: vegasPlayer.position, 
        team: match && match.team ? match.team.toLowerCase() : (vegasPlayer.team || 'fa'),
        age: match && match.age ? parseInt(match.age) : (vegasPlayer.age || 24),
        years_exp: match && match.years_exp !== undefined ? match.years_exp : 0 
      };
    });

    return NextResponse.json({ success: true, players: runtimeDatabase });
  } catch (error) {
    console.error("Dynasty runtime sync failed:", error);
    return NextResponse.json({ success: false, players: OFFSEASON_FUTURES_DATABASE });
  }
}