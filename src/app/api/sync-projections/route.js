import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.TANK01_API_KEY || '75fe2c1730msh1a119af5c4f4103p185827jsneb2a7dc06942';

  try {
    console.log("Fetching REAL 2026 Projections and Ages...");
    
    // 1. Fetch live ages from Sleeper (Free)
    const sleeperRes = await fetch('https://api.sleeper.app/v1/players/nfl');
    if (!sleeperRes.ok) throw new Error("Sleeper API failed.");
    const sleeperData = await sleeperRes.json();
    const sleeperPlayers = Object.values(sleeperData);

    // 2. Fetch the REAL 2026 Season Projections from Tank01
    const tankRes = await fetch('https://tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com/getNFLProjections?week=season&itemFormat=list', {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com'
      }
    });
    
    if (!tankRes.ok) throw new Error("Tank01 API failed.");
    const tankData = await tankRes.json();
    
    // THE FIX: Check if Tank01 gave us an Object instead of an Array, and convert it!
    let projections = [];
    if (Array.isArray(tankData.body)) {
      projections = tankData.body;
    } else if (typeof tankData.body === 'object' && tankData.body !== null) {
      // If it's a giant map of Player IDs, convert it to an array
      projections = Object.values(tankData.body);
    }

    // 3. Format and Merge into our exact engine structure
    const formattedDatabase = projections
      // Filter out defenders and empty names
      .filter(p => ['QB', 'RB', 'WR', 'TE'].includes(p.pos) && p.longName)
      .map(p => {
        
        // Match with Sleeper to steal their accurate Age
        const matchedSleeper = sleeperPlayers.find(sp => {
          if (!sp.first_name || !sp.last_name) return false;
          const sleeperName = `${sp.first_name} ${sp.last_name}`.toLowerCase();
          return sleeperName.includes(p.longName.toLowerCase().replace(/[^a-z]/g, '')) || 
                 p.longName.toLowerCase().replace(/[^a-z]/g, '').includes(sleeperName);
        });

        return {
          name: p.longName,
          team: p.team ? p.team.toLowerCase() : null, // for ESPN logos
          age: matchedSleeper && matchedSleeper.age ? parseInt(matchedSleeper.age) : null,
          position: p.pos,
          
          // Map Tank01's projection keys perfectly to our engine's keys
          pass_yds: p.passYards ? parseFloat(p.passYards) : 0,
          pass_tds: p.passTD ? parseFloat(p.passTD) : 0,
          ints: p.passInterceptions ? parseFloat(p.passInterceptions) : 0,
          rush_yds: p.rushYards ? parseFloat(p.rushYards) : 0,
          rush_tds: p.rushTD ? parseFloat(p.rushTD) : 0,
          receptions: p.receptions ? parseFloat(p.receptions) : 0,
          rec_yds: p.receivingYards ? parseFloat(p.receivingYards) : 0,
          rec_tds: p.receivingTD ? parseFloat(p.receivingTD) : 0,
          fumbles: p.fumblesLost ? parseFloat(p.fumblesLost) : 0
        };
      })
      // Strip out guys with literal 0s across the board to keep the file clean
      .filter(p => p.pass_yds > 0 || p.rush_yds > 0 || p.rec_yds > 0); 

    // Sort by total yards so the top players appear at the top of the JSON
    formattedDatabase.sort((a, b) => (b.pass_yds + b.rush_yds + b.rec_yds) - (a.pass_yds + a.rush_yds + a.rec_yds));

    return NextResponse.json({
      message: "SUCCESS! REAL 2026 PROJECTIONS MERGED WITH AGES. Copy 'data' array to offseasonData.js.",
      total_players: formattedDatabase.length,
      data: formattedDatabase
    });

  } catch (error) {
    console.error("Projection Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}