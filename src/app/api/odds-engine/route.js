import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const API_KEY = process.env.THE_ODDS_API_KEY;
const SPORT = 'americanfootball_nfl';
const REGIONS = 'us';
// We are requesting 6 specific markets to calculate full PPR points
const MARKETS = 'player_pass_yds,player_pass_tds,player_rush_yds,player_receptions,player_rec_yds,player_anytime_td';
const BOOKMAKER = 'draftkings'; // Hardcoding one bookmaker to keep data clean and save bandwidth

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const isCron = url.searchParams.get('cron') === 'true';

    if (!API_KEY) {
      return NextResponse.json({ error: 'API key not configured in Vercel Environment Variables' }, { status: 500 });
    }

    // 1. Fetch all upcoming NFL games
    const eventsRes = await fetch(`https://api.the-odds-api.com/v4/sports/${SPORT}/events?apiKey=${API_KEY}`);
    if (!eventsRes.ok) throw new Error('Failed to fetch events from The Odds API');
    const events = await eventsRes.json();

    let playerStats = {};

    // 2. Fetch props for each game
    // NOTE: To protect your free API limit during testing, you can change this to events.slice(0, 2) to only pull 2 games.
    for (const event of events) {
      const oddsRes = await fetch(`https://api.the-odds-api.com/v4/sports/${SPORT}/events/${event.id}/odds?apiKey=${API_KEY}&regions=${REGIONS}&markets=${MARKETS}&bookmakers=${BOOKMAKER}&oddsFormat=american`);
      
      if (!oddsRes.ok) continue;
      const gameOdds = await oddsRes.json();

      const bookmaker = gameOdds.bookmakers && gameOdds.bookmakers[0];
      if (!bookmaker) continue;

      for (const market of bookmaker.markets) {
        const marketKey = market.key;
        
        for (const outcome of market.outcomes) {
          // If the outcome name is "Under", skip it. We only calculate based on the "Over" baseline.
          if (outcome.name === 'Under') continue;

          // For Anytime TD, the player's name is usually in `name`. For over/unders, it's in `description`.
          const playerName = outcome.description || outcome.name;
          if (!playerName || playerName === 'Over') continue;

          // Initialize the player in our dictionary if they don't exist yet
          if (!playerStats[playerName]) {
            playerStats[playerName] = { 
              name: playerName, 
              game: `${gameOdds.away_team} @ ${gameOdds.home_team}`,
              pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0,
              receptions: 0, rec_yds: 0, rec_tds: 0, anytime_td_odds: 0,
              position: "FLEX"
            };
          }

          // Store the prop lines
          if (marketKey === 'player_anytime_td') {
            playerStats[playerName].anytime_td_odds = outcome.price;
          } else {
            playerStats[playerName][marketKey.replace('player_', '')] = outcome.point;
          }
        }
      }
    }

    // 3. Run the Fantasy Math and infer player positions
    const processedPlayers = Object.values(playerStats).map(player => {
      let pts = 0;
      
      // Passing: 1 pt per 25 yds, 4 pts per pass TD
      pts += (player.pass_yds / 25) + (player.pass_tds * 4);
      
      // Rushing/Receiving: 1 pt per 10 yds, 1 pt per reception
      pts += (player.rush_yds / 10) + (player.rec_yds / 10) + (player.receptions * 1);
      
      // Touchdowns (Implied Probability calculation for American odds)
      if (player.anytime_td_odds) {
        let prob = 0;
        const odds = player.anytime_td_odds;
        if (odds < 0) prob = Math.abs(odds) / (Math.abs(odds) + 100);
        else if (odds > 0) prob = 100 / (odds + 100);
        
        pts += (prob * 6); // 6 points per expected TD
        
        // Populate the UI table with the expected decimal TDs
        if (player.rec_yds > 0) player.rec_tds = Number((prob).toFixed(2));
        else player.rush_tds = Number((prob).toFixed(2));
      }

      // Infer Position based on stat profile
      if (player.pass_yds > 0) player.position = "QB";
      else if (player.rush_yds > 0 && player.rec_yds > 0) player.position = "RB";
      else if (player.rush_yds > 0) player.position = "RB";
      else if (player.rec_yds > 0) player.position = "WR/TE";
      
      player.projected_points = Number(pts.toFixed(2));
      return player;
    });

    // 4. Sort from highest projected points to lowest
    const finalRankings = processedPlayers
      .filter(p => p.projected_points > 0)
      .sort((a, b) => b.projected_points - a.projected_points);

    // --- OFF-SEASON FALLBACK ---
    // If the API returns 0 players (because there are no active NFL props right now), load the mock data
    if (finalRankings.length === 0) {
      const mockRankings = [
        { name: "Justin Jefferson", position: "WR", game: "MIN @ DET", projected_points: 21.5, receptions: 7.5, rec_yds: 95.5, rec_tds: 0.75 },
        { name: "Christian McCaffrey", position: "RB", game: "SF @ LAR", projected_points: 24.2, rush_yds: 82.5, rush_tds: 0.85, receptions: 4.5, rec_yds: 35.5, rec_tds: 0.25 },
        { name: "Josh Allen", position: "QB", game: "BUF @ MIA", projected_points: 22.1, pass_yds: 265.5, pass_tds: 1.8, rush_yds: 40.5, rush_tds: 0.4 },
        { name: "Travis Kelce", position: "TE", game: "KC @ LV", projected_points: 16.8, receptions: 6.5, rec_yds: 70.5, rec_tds: 0.55 },
        { name: "Breece Hall", position: "RB", game: "NYJ @ NE", projected_points: 18.5, rush_yds: 75.5, rush_tds: 0.65, receptions: 3.5, rec_yds: 25.5, rec_tds: 0.15 }
      ];
      return NextResponse.json({ rankings: mockRankings, note: "Off-season: Displaying mock data" });
    }

    if (isCron) {
      revalidateTag('vegas-rankings');
      console.log("Cache revalidated for Vegas Rankings");
    }

    return NextResponse.json({ rankings: finalRankings });
    
  } catch (error) {
    console.error('Odds Engine Error:', error);
    return NextResponse.json({ error: 'Failed to process odds' }, { status: 500 });
  }
}