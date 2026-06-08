import { unstable_cache } from 'next/cache';
import { OFFSEASON_FUTURES_DATABASE } from './offseasonData';

const API_KEY = process.env.THE_ODDS_API_KEY;
const SPORT = 'americanfootball_nfl';
const REGIONS = 'us';
// Note: player_pass_ints was added. Vegas usually doesn't offer fumbles, but if they do, we'll catch it.
const MARKETS = 'player_pass_yds,player_pass_tds,player_pass_ints,player_rush_yds,player_receptions,player_rec_yds,player_anytime_td';
const BOOKMAKER = 'draftkings';

// Centralized Math Helper
function calculatePoints(player) {
  let pts = 0;
  
  // Combine INTs and fumbles into total turnovers
  const totalTurnovers = (player.ints || 0) + (player.fumbles || 0);
  player.turnovers = totalTurnovers;
  
  // Math Breakdown
  pts += ((player.pass_yds || 0) / 25) + ((player.pass_tds || 0) * 4);
  pts -= (totalTurnovers * 2); // -2 per turnover!
  pts += ((player.rush_yds || 0) / 10) + ((player.rec_yds || 0) / 10) + ((player.receptions || 0) * 1);
  pts += ((player.rush_tds || 0) * 6) + ((player.rec_tds || 0) * 6);
  
  return Number(pts.toFixed(2));
}

async function fetchLiveVegasData() {
  let finalRankings = [];
  let currentMode = 'weekly';

  if (!API_KEY) {
    return { rankings: OFFSEASON_FUTURES_DATABASE.map(p => ({...p, projected_points: calculatePoints(p)})).sort((a,b) => b.projected_points - a.projected_points), mode: 'offseason', error: 'THE_ODDS_API_KEY is missing from Vercel.' };
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
                  pass_yds: 0, pass_tds: 0, ints: 0, fumbles: 0, rush_yds: 0, rush_tds: 0,
                  receptions: 0, rec_yds: 0, rec_tds: 0, anytime_td_odds: 0, position: "FLEX"
                };
              }

              if (market.key === 'player_anytime_td') {
                playerStats[playerName].anytime_td_odds = outcome.price;
              } else if (market.key === 'player_pass_ints') {
                playerStats[playerName].ints = outcome.point;
              } else {
                playerStats[playerName][market.key.replace('player_', '')] = outcome.point;
              }
            }
          }
        }

        finalRankings = Object.values(playerStats).map(player => {
          if (player.anytime_td_odds) {
            let prob = 0;
            const odds = player.anytime_td_odds;
            if (odds < 0) prob = Math.abs(odds) / (Math.abs(odds) + 100);
            else if (odds > 0) prob = 100 / (odds + 100);
            
            if (player.rec_yds > 0) player.rec_tds = Number((prob).toFixed(2));
            else player.rush_tds = Number((prob).toFixed(2));
          }

          player.projected_points = calculatePoints(player);

          if (player.pass_yds > 0) player.position = "QB";
          else if (player.rush_yds > 0 && player.rec_yds > 0) player.position = "RB";
          else if (player.rush_yds > 0) player.position = "RB";
          else if (player.rec_yds > 0) player.position = "WR/TE";
          
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