import { unstable_cache } from 'next/cache';
import { OFFSEASON_FUTURES_DATABASE } from './offseasonData';

const API_KEY = process.env.THE_ODDS_API_KEY;
const SPORT = 'americanfootball_nfl';
const REGIONS = 'us';
const MARKETS = 'player_pass_yds,player_pass_tds,player_pass_ints,player_rush_yds,player_receptions,player_rec_yds,player_anytime_td';
const BOOKMAKER = 'draftkings';

// ==========================================
// 🧠 ADVANCED DATA SCIENCE & MATH UTILS
// ==========================================

// 1. Converts American Betting Odds to Implied Probability
function getImpliedProb(odds) {
  if (odds < 0) return Math.abs(odds) / (Math.abs(odds) + 100);
  if (odds > 0) return 100 / (odds + 100);
  return 0;
}

// 2. The Poisson Distribution EV Calculator
// If we know the true probability of a player scoring AT LEAST 1 TD, 
// we can mathematically calculate their exact expected total TDs (including 2+ or 3+ TD games).
// Formula: P(k=0) = e^(-lambda). Therefore, Expected Value (lambda) = -ln(P(k=0))
function getPoissonEV(probAtLeastOne) {
  // Cap probability at 99% to prevent infinite logarithms
  const safeProb = Math.min(probAtLeastOne, 0.99);
  const probZero = 1 - safeProb; // The probability they score 0 TDs
  return -Math.log(probZero);    // Returns exact Expected Value (e.g. 0.85 TDs)
}

// 3. Centralized Math Helper for Baseline Points
function calculatePoints(player) {
  let pts = 0;
  
  // Combine INTs and fumbles into total turnovers
  const totalTurnovers = (player.ints || 0) + (player.fumbles || 0);
  player.turnovers = totalTurnovers;
  
  // Math Breakdown
  pts += ((player.pass_yds || 0) / 25) + ((player.pass_tds || 0) * 4);
  pts -= (totalTurnovers * 2); // -2 per turnover penalty
  pts += ((player.rush_yds || 0) / 10) + ((player.rec_yds || 0) / 10) + ((player.receptions || 0) * 1);
  pts += ((player.rush_tds || 0) * 6) + ((player.rec_tds || 0) * 6);
  
  return Number(pts.toFixed(2));
}

// ==========================================
// 🚀 LIVE VEGAS FETCH ENGINE
// ==========================================

async function fetchLiveVegasData() {
  let finalRankings = [];
  let currentMode = 'weekly';

  if (!API_KEY) {
    return { 
      rankings: OFFSEASON_FUTURES_DATABASE.map(p => ({...p, projected_points: calculatePoints(p)})).sort((a,b) => b.projected_points - a.projected_points), 
      mode: 'offseason', 
      error: 'THE_ODDS_API_KEY is missing from Vercel.' 
    };
  }

  try {
    const eventsRes = await fetch(`https://api.the-odds-api.com/v4/sports/${SPORT}/events?apiKey=${API_KEY}`, { cache: 'no-store' });
    
    if (eventsRes.ok) {
      const events = await eventsRes.json();
      let playerStats = {};

      if (events.length > 0) {
        // Fetch all player props for every active game
        for (const event of events) {
          const oddsRes = await fetch(`https://api.the-odds-api.com/v4/sports/${SPORT}/events/${event.id}/odds?apiKey=${API_KEY}&regions=${REGIONS}&markets=${MARKETS}&bookmakers=${BOOKMAKER}&oddsFormat=american`, { cache: 'no-store' });
          if (!oddsRes.ok) continue;
          
          const gameOdds = await oddsRes.json();
          const bookmaker = gameOdds.bookmakers && gameOdds.bookmakers[0];
          if (!bookmaker) continue;

          for (const market of bookmaker.markets) {
            for (const outcome of market.outcomes) {
              // We only build baselines off the "Over" lines
              if (outcome.name === 'Under') continue;
              const playerName = outcome.description || outcome.name;
              if (!playerName || playerName === 'Over') continue;

              // Initialize player in dictionary if not exists
              if (!playerStats[playerName]) {
                playerStats[playerName] = { 
                  name: playerName, game: `${gameOdds.away_team} @ ${gameOdds.home_team}`,
                  pass_yds: 0, pass_tds: 0, ints: 0, fumbles: 0, rush_yds: 0, rush_tds: 0,
                  receptions: 0, rec_yds: 0, rec_tds: 0, anytime_td_odds: 0, position: "FLEX"
                };
              }

              // Map API keys to our player object properties
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

        // Process final math for every scraped player
        finalRankings = Object.values(playerStats).map(player => {
          
          // POISSON DISTRIBUTION EV CALCULATION
          if (player.anytime_td_odds) {
            const rawProb = getImpliedProb(player.anytime_td_odds);
            
            // Standard Devigging: Strip the ~4% sportsbook profit margin (juice) to find true probability
            const deviggedProb = rawProb / 1.04; 
            
            // Pass devigged probability through the Poisson equation to capture multi-TD expected value
            const expectedTds = getPoissonEV(deviggedProb);
            
            if (player.rec_yds > 0) {
              player.rec_tds = Number(expectedTds.toFixed(2));
            } else {
              player.rush_tds = Number(expectedTds.toFixed(2));
            }
          }

          // Infer player position based on the lines Vegas assigned them
          if (player.pass_yds > 0) player.position = "QB";
          else if (player.rush_yds > 0 && player.rec_yds > 0) player.position = "RB";
          else if (player.rush_yds > 0) player.position = "RB";
          else if (player.rec_yds > 0) player.position = "WR/TE";

          // Calculate Baseline Points
          player.projected_points = calculatePoints(player);
          
          return player;
        }).filter(p => p.projected_points > 0);
      }
    }

    // OFF-SEASON FALLBACK: Triggers perfectly if API returns 0 active games
    if (finalRankings.length === 0) {
      currentMode = 'offseason';
      finalRankings = OFFSEASON_FUTURES_DATABASE.map(player => ({
        ...player,
        projected_points: calculatePoints(player)
      }));
    } 
    
    // Sort all rankings from highest projected score to lowest
    finalRankings.sort((a, b) => b.projected_points - a.projected_points);

    return { rankings: finalRankings, mode: currentMode, error: null };
    
  } catch (error) {
    console.error('Odds Engine Error:', error);
    // Bulletproof Fallback: Serve the draft board even if the API completely crashes
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