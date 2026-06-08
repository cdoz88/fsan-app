import { unstable_cache } from 'next/cache';

const API_KEY = process.env.THE_ODDS_API_KEY;
const SPORT = 'americanfootball_nfl';
const REGIONS = 'us';
const MARKETS = 'player_pass_yds,player_pass_tds,player_rush_yds,player_receptions,player_rec_yds,player_anytime_td';
const BOOKMAKER = 'draftkings';

// 🏈 REAL VEGAS OFF-SEASON FUTURES
const OFFSEASON_FUTURES_DATABASE = [
  { name: "Josh Allen", position: "QB", pass_yds: 3800.5, pass_tds: 27.5, rush_yds: 475.5, rush_tds: 7.5, receptions: 0, rec_yds: 0, rec_tds: 0 },
  { name: "Patrick Mahomes", position: "QB", pass_yds: 4150.5, pass_tds: 31.5, rush_yds: 300.5, rush_tds: 2.5, receptions: 0, rec_yds: 0, rec_tds: 0 },
  { name: "Jalen Hurts", position: "QB", pass_yds: 3550.5, pass_tds: 22.5, rush_yds: 550.5, rush_tds: 10.5, receptions: 0, rec_yds: 0, rec_tds: 0 },
  { name: "Lamar Jackson", position: "QB", pass_yds: 3400.5, pass_tds: 21.5, rush_yds: 750.5, rush_tds: 5.5, receptions: 0, rec_yds: 0, rec_tds: 0 },
  { name: "Christian McCaffrey", position: "RB", pass_yds: 0, pass_tds: 0, rush_yds: 1050.5, rush_tds: 9.5, receptions: 65.5, rec_yds: 550.5, rec_tds: 4.5 },
  { name: "Breece Hall", position: "RB", pass_yds: 0, pass_tds: 0, rush_yds: 1025.5, rush_tds: 7.5, receptions: 60.5, rec_yds: 500.5, rec_tds: 3.5 },
  { name: "Bijan Robinson", position: "RB", pass_yds: 0, pass_tds: 0, rush_yds: 1050.5, rush_tds: 7.5, receptions: 58.5, rec_yds: 475.5, rec_tds: 3.5 },
  { name: "Jahmyr Gibbs", position: "RB", pass_yds: 0, pass_tds: 0, rush_yds: 875.5, rush_tds: 7.5, receptions: 55.5, rec_yds: 450.5, rec_tds: 3.5 },
  { name: "Jonathan Taylor", position: "RB", pass_yds: 0, pass_tds: 0, rush_yds: 1100.5, rush_tds: 8.5, receptions: 35.5, rec_yds: 275.5, rec_tds: 1.5 },
  { name: "Saquon Barkley", position: "RB", pass_yds: 0, pass_tds: 0, rush_yds: 1050.5, rush_tds: 7.5, receptions: 45.5, rec_yds: 325.5, rec_tds: 2.5 },
  { name: "CeeDee Lamb", position: "WR", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 108.5, rec_yds: 1350.5, rec_tds: 9.5 },
  { name: "Tyreek Hill", position: "WR", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 105.5, rec_yds: 1375.5, rec_tds: 9.5 },
  { name: "Justin Jefferson", position: "WR", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 102.5, rec_yds: 1400.5, rec_tds: 8.5 },
  { name: "Amon-Ra St. Brown", position: "WR", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 105.5, rec_yds: 1250.5, rec_tds: 8.5 },
  { name: "Ja'Marr Chase", position: "WR", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 95.5, rec_yds: 1300.5, rec_tds: 9.5 },
  { name: "A.J. Brown", position: "WR", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 90.5, rec_yds: 1250.5, rec_tds: 7.5 },
  { name: "Puka Nacua", position: "WR", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 95.5, rec_yds: 1200.5, rec_tds: 7.5 },
  { name: "Garrett Wilson", position: "WR", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 92.5, rec_yds: 1150.5, rec_tds: 7.5 },
  { name: "Marvin Harrison Jr.", position: "WR", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 75.5, rec_yds: 1050.5, rec_tds: 6.5 },
  { name: "Drake London", position: "WR", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 80.5, rec_yds: 1050.5, rec_tds: 6.5 },
  { name: "Travis Kelce", position: "TE", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 85.5, rec_yds: 900.5, rec_tds: 6.5 },
  { name: "Sam LaPorta", position: "TE", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 82.5, rec_yds: 875.5, rec_tds: 7.5 },
  { name: "Mark Andrews", position: "TE", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 75.5, rec_yds: 850.5, rec_tds: 6.5 },
  { name: "Trey McBride", position: "TE", pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0, receptions: 80.5, rec_yds: 850.5, rec_tds: 5.5 }
];

function calculatePoints(player) {
  let pts = 0;
  pts += (player.pass_yds / 25) + (player.pass_tds * 4);
  pts += (player.rush_yds / 10) + (player.rec_yds / 10) + (player.receptions * 1);
  pts += ((player.rush_tds || 0) * 6) + ((player.rec_tds || 0) * 6);
  return Number(pts.toFixed(2));
}

async function fetchLiveVegasData() {
  let finalRankings = [];
  let currentMode = 'weekly';

  if (!API_KEY) {
    return { rankings: OFFSEASON_FUTURES_DATABASE.map(p => ({...p, projected_points: calculatePoints(p)})), mode: 'offseason', error: 'THE_ODDS_API_KEY is missing from Vercel.' };
  }

  try {
    const eventsRes = await fetch(`https://api.the-odds-api.com/v4/sports/${SPORT}/events?apiKey=${API_KEY}`, { cache: 'no-store' });
    
    if (eventsRes.ok) {
      const events = await eventsRes.json();
      let playerStats = {};

      if (events.length > 0) {
        for (const event of events) {
          const oddsRes = await fetch(`https://api.the-odds-api.com/v4/sports/${SPORT}/events/${event.id}/odds?apiKey=${API_KEY}&regions=${REGIONS}&markets=${MARKETS}&bookmakers=${BOOKMAKER}&oddsFormat=american`, { cache: 'no-store' });
          if (!oddsRes.ok) continue;
          
          const gameOdds = await oddsRes.json();
          const bookmaker = gameOdds.bookmakers && gameOdds.bookmakers[0];
          if (!bookmaker) continue;

          for (const market of bookmaker.markets) {
            for (const outcome of market.outcomes) {
              if (outcome.name === 'Under') continue;
              const playerName = outcome.description || outcome.name;
              if (!playerName || playerName === 'Over') continue;

              if (!playerStats[playerName]) {
                playerStats[playerName] = { 
                  name: playerName, game: `${gameOdds.away_team} @ ${gameOdds.home_team}`,
                  pass_yds: 0, pass_tds: 0, rush_yds: 0, rush_tds: 0,
                  receptions: 0, rec_yds: 0, rec_tds: 0, anytime_td_odds: 0, position: "FLEX"
                };
              }

              if (market.key === 'player_anytime_td') {
                playerStats[playerName].anytime_td_odds = outcome.price;
              } else {
                playerStats[playerName][market.key.replace('player_', '')] = outcome.point;
              }
            }
          }
        }

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
    }

    if (finalRankings.length === 0) {
      currentMode = 'offseason';
      finalRankings = OFFSEASON_FUTURES_DATABASE.map(player => ({
        ...player,
        projected_points: calculatePoints(player)
      }));
    } 
    
    finalRankings.sort((a, b) => b.projected_points - a.projected_points);

    return { rankings: finalRankings, mode: currentMode, error: null };
    
  } catch (error) {
    console.error('Odds Engine Error:', error);
    const fallbackRankings = OFFSEASON_FUTURES_DATABASE.map(player => ({
      ...player,
      projected_points: calculatePoints(player)
    })).sort((a, b) => b.projected_points - a.projected_points);

    return { rankings: fallbackRankings, mode: 'offseason', error: error.message };
  }
}

export const getCachedVegasData = unstable_cache(
  async () => await fetchLiveVegasData(),
  ['vegas-rankings-data'],
  { tags: ['vegas-rankings'] }
);