import { NextResponse } from 'next/server';

export async function GET() {
  // securely grabbing your key from the environment variables
  const API_KEY = process.env.TANK01_API_KEY || '75fe2c1730msh1a119af5c4f4103p185827jsneb2a7dc06942';

  try {
    console.log("Fetching live 2026 NFL Roster from Tank01...");
    
    // Hitting the Tank01 Player List endpoint
    const response = await fetch('https://tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com/getNFLPlayerList', {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Tank01 API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Tank01 houses the actual player array inside the 'body' object
    const rawPlayers = data.body || [];

    // We only want fantasy-relevant positions, and we want to filter out Free Agents
    const fantasyPlayers = rawPlayers.filter(p => 
      ['QB', 'RB', 'WR', 'TE'].includes(p.pos) && 
      p.team !== 'FA' && 
      p.longName
    );

    // Format the massive Tank01 data payload into our exact Vegas Engine format
    const formattedDatabase = fantasyPlayers.map(p => {
      return {
        name: p.longName,
        team: p.team.toLowerCase(), // Converts 'BUF' to 'buf' for our ESPN logo images
        age: p.age ? parseInt(p.age) : null,
        position: p.pos,
        
        // Setting baseline stats to 0. 
        // (We can build a second fetch later to pull Tank01's ADP or Projections to fill these in!)
        pass_yds: 0, pass_tds: 0, ints: 0, 
        rush_yds: 0, rush_tds: 0, 
        receptions: 0, rec_yds: 0, rec_tds: 0, 
        fumbles: 0
      };
    });

    // We output the data as raw JSON so you can easily copy/paste it into offseasonData.js
    return NextResponse.json({
      message: "SUCCESS! Copy the 'data' array below into your offseasonData.js file to update all 2026 Ages, Teams, and Rookies.",
      total_players_found: formattedDatabase.length,
      data: formattedDatabase
    });

  } catch (error) {
    console.error("Tank01 Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}