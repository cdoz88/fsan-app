import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const API_KEY = process.env.THE_ODDS_API_KEY;
const SPORT = 'americanfootball_nfl';
const REGIONS = 'us';
const MARKETS = 'player_pass_yds,player_pass_tds,player_rush_yds,player_receptions,player_rec_yds,player_anytime_td';
const BOOKMAKER = 'draftkings';

// High-quality mock data used when the API key is missing or no games are scheduled (Off-season)
const MOCK_DRAFT_RANKINGS = [
  { name: "Josh Allen", position: "QB", projected_points: 329.07, pass_yds: 3550.5, pass_tds: 24.5, rush_yds: 500.5, rush_tds: 6.5 },
  { name: "Christian McCaffrey", position: "RB", projected_points: 309.60, rush_yds: 1050.5, rush_tds: 9.5, receptions: 65.5, rec_yds: 550.5, rec_tds: 4.5 },
  { name: "Justin Jefferson", position: "WR", projected_points: 296.55, receptions: 105.5, rec_yds: 1400.5, rec_tds: 8.5 },
  { name: "Patrick Mahomes", position: "QB", projected_points: 321.40, pass_yds: 4050.5, pass_tds: 31.5, rush_yds: 350.5, rush_tds: 2.5 },
  { name: "Breece Hall", position: "RB", projected_points: 285.50, rush_yds: 950.5, rush_tds: 7.5, receptions: 60.5, rec_yds: 500.5, rec_tds: 4.5 }
];

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const isCron = url.searchParams.get('cron') === 'true';

    let finalRankings = [];
    let currentMode = 'weekly';

    if (!API_KEY) {
      console.warn("THE_ODDS_API_KEY environment variable is not defined. Falling back to offseason mock data.");
      return NextResponse.json({ rankings: MOCK_DRAFT_RANKINGS, mode: 'offseason', note: 'Running on preview mock data' });
    }

    // 1. Fetch upcoming NFL games
    const eventsRes = await fetch(`https://api.the-odds-api.com/v4/sports/${SPORT}/events?apiKey=${API_KEY}`);
    
    if (eventsRes.ok) {
      const events = await eventsRes.json();
      let playerStats = {};

      // 2. Fetch props for games (Only loop if events exist)
      for (const event of events) {
        const oddsRes = await fetch(`https://api.the-odds-api.com/v4/sports/${SPORT}/events/${event.id}/odds?apiKey=${API_KEY}&regions=${REGIONS}&markets=${MARKETS}&bookmakers=${BOOKMAKER}&oddsFormat=american`);
        
        if (!oddsRes.ok) continue;
        const gameOdds = await oddsRes.json();

        const bookmaker = gameOdds.bookmakers && gameOdds.bookmakers[0];
        if (!bookmaker) continue;

        for (const market of bookmaker.markets) {
          const marketKey = market.key;
          for (const outcome of market.outcomes) {
            if (outcome.name === 'Under') continue;

            const playerName = outcome.description || outcome.name;
            if (!playerName || playerName === 'Over') continue;

            if (!playerStats[playerName]) {
              playerStats[playerName] = { 
                name: playerName, 
                game: `${gameOdds.away_team} @ ${gameOdds.home_team}`,
                pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0,
                receptions: 0, rec_yds: 0, rec_tds: 0, anytime_td_odds: 0,
                position: "FLEX"
              };
            }

            if (marketKey === 'player_anytime_td') {
              playerStats[playerName].anytime_td_odds = outcome.price;
            } else {
              playerStats[playerName][marketKey.replace('player_', '')] = outcome.point;
            }
          }
        }
      }

      // 3. Process Weekly Stats
      finalRankings = Object.values(playerStats).map(player => {
        let pts = (player.pass_yds / 25) + (player.pass_tds * 4) + (player.rush_yds / 10) + (player.rec_yds / 10) + (player.receptions * 1);
        
        if (player.anytime_td_odds) {
          let prob = 0;
          const odds = player.anytime_td_odds;
          if (odds < 0) prob = Math.abs(odds) / (Math.abs(odds) + 100);
          else if (odds > 0) prob = 100 / (odds + 100);
          
          pts += (prob * 6);
          if (player.rec_yds > 0) player.rec_tds = Number((prob).toFixed(2));
          else player.rush_tds = Number((prob).toFixed(2));
        }

        if (player.pass_yds > 0) player.position = "QB";
        else if (player.rush_yds > 0 && player.rec_yds > 0) player.position = "RB";
        else if (player.rush_yds > 0) player.position = "RB";
        else if (player.rec_yds > 0) player.position = "WR/TE";
        
        player.projected_points = Number(pts.toFixed(2));
        return player;
      }).filter(p => p.projected_points > 0);
    }

    // 4. SMART FALLBACK: If no weekly data is found (Off-Season), load Season-Long Futures Mock Data!
    if (finalRankings.length === 0) {
      currentMode = 'offseason';
      finalRankings = MOCK_DRAFT_RANKINGS;
    } else {
      finalRankings.sort((a, b) => b.projected_points - a.projected_points);
    }

    if (isCron) {
      revalidateTag('vegas-rankings');
      console.log("Cache revalidated for Vegas Rankings");
    }

    return NextResponse.json({ rankings: finalRankings, mode: currentMode });
    
  } catch (error) {
    console.error('Odds Engine Error:', error);
    // Serve mock data even on massive crashes so the UI never breaks
    return NextResponse.json({ rankings: MOCK_DRAFT_RANKINGS, mode: 'offseason', error: error.message });
  }
}