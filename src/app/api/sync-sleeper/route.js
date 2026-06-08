import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("Fetching live NFL Player Data from Sleeper Enterprise API...");
    
    // Sleeper's public NFL players endpoint (No API key needed!)
    const response = await fetch('https://api.sleeper.app/v1/players/nfl');

    if (!response.ok) {
      throw new Error(`Sleeper API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Sleeper returns a giant object with player IDs as keys. 
    // We use Object.values() to convert it into a mappable array.
    const rawPlayers = Object.values(data);

    // Filter out retired players, free agents, and defensive players
    const fantasyPlayers = rawPlayers.filter(p => 
      p.active === true &&
      p.team !== null &&
      p.team !== 'FA' &&
      ['QB', 'RB', 'WR', 'TE'].includes(p.position)
    );

    // Format the Sleeper data payload into our exact Vegas Engine format
    const formattedDatabase = fantasyPlayers.map(p => {
      // Clean up names (e.g., removing Jr., III if needed, or just keeping Sleeper's clean names)
      const fullName = `${p.first_name} ${p.last_name}`;

      return {
        name: fullName,
        team: p.team.toLowerCase(), // Converts 'BUF' to 'buf' for our ESPN logo images
        age: p.age ? parseInt(p.age) : null,
        position: p.position,
        
        // Setting baseline stats to 0. 
        pass_yds: 0, pass_tds: 0, ints: 0, 
        rush_yds: 0, rush_tds: 0, 
        receptions: 0, rec_yds: 0, rec_tds: 0, 
        fumbles: 0
      };
    });

    // Sort alphabetically so it is easy to read when pasted into your database
    formattedDatabase.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      message: "SUCCESS! Copy the 'data' array below into your offseasonData.js file to update all Ages, Teams, and Rookies.",
      total_players_found: formattedDatabase.length,
      data: formattedDatabase
    });

  } catch (error) {
    console.error("Sleeper Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}