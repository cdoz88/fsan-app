import { useMemo } from 'react';
import { HISTORICAL_DATA } from '../utils/historicalData';

export const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z]/g, '').replace(/(jr|sr|ii|iii|iv)$/, '');
};

const generatePicks = () => {
  const picks = [];
  const pickValues26 = [650, 550, 480, 420, 360, 310, 270, 230, 190, 160, 140, 120, 100, 90, 80, 70, 60, 55, 50, 45, 40, 35, 30, 25]; 
  
  for(let i=1; i<=12; i++) picks.push({ id: `26-1.${i < 10 ? '0'+i : i}`, name: `2026 Pick 1.${i < 10 ? '0'+i : i}`, position: 'PICK', baseValue: pickValues26[i-1], year: 2026 });
  for(let i=1; i<=12; i++) picks.push({ id: `26-2.${i < 10 ? '0'+i : i}`, name: `2026 Pick 2.${i < 10 ? '0'+i : i}`, position: 'PICK', baseValue: pickValues26[i+11] || 40, year: 2026 });
  picks.push({ id: '26-3', name: '2026 3rd Round', position: 'PICK', baseValue: 20, year: 2026 });
  picks.push({ id: '26-4', name: '2026 4th Round', position: 'PICK', baseValue: 5, year: 2026 });

  [2027, 2028].forEach(year => {
     const discount = year === 2027 ? 0.85 : 0.70; 
     picks.push({ id: `${year}-e1`, name: `${year} Early 1st`, position: 'PICK', baseValue: Math.round(500 * discount), year });
     picks.push({ id: `${year}-m1`, name: `${year} Mid 1st`, position: 'PICK', baseValue: Math.round(270 * discount), year });
     picks.push({ id: `${year}-l1`, name: `${year} Late 1st`, position: 'PICK', baseValue: Math.round(140 * discount), year });
     picks.push({ id: `${year}-e2`, name: `${year} Early 2nd`, position: 'PICK', baseValue: Math.round(90 * discount), year });
     picks.push({ id: `${year}-m2`, name: `${year} Mid 2nd`, position: 'PICK', baseValue: Math.round(60 * discount), year });
     picks.push({ id: `${year}-l2`, name: `${year} Late 2nd`, position: 'PICK', baseValue: Math.round(45 * discount), year });
     picks.push({ id: `${year}-3`, name: `${year} 3rd Round`, position: 'PICK', baseValue: Math.round(20 * discount), year });
     picks.push({ id: `${year}-4`, name: `${year} 4th Round`, position: 'PICK', baseValue: Math.round(5 * discount), year });
  });
  return picks;
};

export const DRAFT_PICKS = generatePicks();

export function useTradeEngine({
  playersData,
  sleeperPlayersMap,
  leagueRosters,
  teamsCount,
  tradeAssets,
  teamManagers,
  teamStrategies,
  formatMode,
  isSuperflex,
  pprValue,
  passTdValue,
  tePremium
}) {

  const positionalScarcity = useMemo(() => {
    if (!playersData || playersData.length === 0) return { QB: 1, RB: 1, WR: 1, TE: 1 };
    const top100 = playersData.filter(p => (p.adp || p.AVG || 300) <= 100);
    const counts = { QB: 0, RB: 0, WR: 0, TE: 0 };
    top100.forEach(p => {
      let pos = p.position === 'WR/TE' ? 'TE' : p.position;
      if (counts[pos] !== undefined) counts[pos] += 1;
    });
    const calcMod = (count) => {
        let mod = 1.0 + ((25 - count) / 100);
        return Math.min(1.35, Math.max(0.75, mod)); 
    };
    return { QB: calcMod(counts.QB), RB: calcMod(counts.RB), WR: calcMod(counts.WR), TE: calcMod(counts.TE) };
  }, [playersData]);

  const baselines = useMemo(() => {
    if (!playersData || playersData.length === 0) return { QB: 0, RB: 0, WR: 0, TE: 0 };
    const rawScored = playersData.map(player => {
      let pts = 0;
      pts += ((player.pass_yds || 0) / 25);
      pts += ((player.pass_tds || 0) * passTdValue); 
      pts -= ((player.turnovers || player.ints || player.fumbles || 0) * 2);
      pts += ((player.rush_yds || 0) / 10);
      pts += ((player.rush_tds || 0) * 6);
      pts += ((player.rec_yds || 0) / 10);
      pts += ((player.rec_tds || 0) * 6);
      let recPoints = ((player.receptions || 0) * pprValue);
      if (player.position === 'TE' || player.position === 'WR/TE') {
        recPoints += ((player.receptions || 0) * tePremium);
      }
      pts += recPoints;
      return { ...player, rawPts: pts };
    });

    const getBaseScore = (pos, rankLimit) => {
      const posPlayers = rawScored.filter(p => p.position === pos || (pos === 'TE' && p.position === 'WR/TE')).sort((a, b) => b.rawPts - a.rawPts);
      let dynamicBase = posPlayers.length > 0 ? posPlayers[Math.min(rankLimit - 1, posPlayers.length - 1)].rawPts : 0;
      let posKey = pos === 'WR/TE' ? 'TE' : pos;
      let histBase = HISTORICAL_DATA?.BASELINES?.[posKey]?.[`Rank_${rankLimit}`];
      if (histBase && histBase > 0) return (dynamicBase * 0.5) + (histBase * 0.5);
      return dynamicBase;
    };
    return { QB: getBaseScore('QB', isSuperflex ? 32 : 16), RB: getBaseScore('RB', 48), WR: getBaseScore('WR', 60), TE: getBaseScore('TE', 24) };
  }, [playersData, isSuperflex, pprValue, passTdValue, tePremium]);

  const getAgeMultiplier = (position, age, strategy) => {
    if (!age) return 1; 
    let posKey = position === 'WR/TE' ? 'TE' : position;
    const curves = HISTORICAL_DATA?.AGE_CURVES?.[posKey];
    if (curves && Object.keys(curves).length > 8) {
        const maxAge = posKey === 'QB' ? 38 : (posKey === 'TE' ? 33 : 30);
        let expectedRemainingPts = 0;
        let maxCareerPts = 0;
        for (let a = age; a <= maxAge; a++) expectedRemainingPts += (curves[a] || 0);
        for (let a = 21; a <= maxAge; a++) maxCareerPts += (curves[a] || 0);
        if (maxCareerPts > 0) {
            let baseFuel = expectedRemainingPts / maxCareerPts; 
            let histMult = (baseFuel * 1.2) + 0.2; 
            if (strategy === 'build') histMult = (baseFuel * 1.4) + 0.1; 
            else if (strategy === 'win_now') {
                let shortTermPts = (curves[age]||0) + (curves[age+1]||0) + (curves[age+2]||0);
                let peakShortTerm = 0;
                for (let a = 21; a <= maxAge; a++) {
                    let st = (curves[a]||0) + (curves[a+1]||0) + (curves[a+2]||0);
                    if (st > peakShortTerm) peakShortTerm = st;
                }
                let shortTermFuel = shortTermPts / (peakShortTerm || 1);
                histMult = (shortTermFuel * 0.8) + 0.4;
            }
            return Math.max(0.1, Math.min(histMult, 1.5)); 
        }
    }
    if (strategy === 'build') {
      if (position === 'WR') return age <= 24 ? 1.40 : age <= 27 ? 1.20 : age <= 30 ? 0.90 : 0.40;
      if (position === 'RB') return age <= 23 ? 1.20 : age <= 25 ? 0.90 : age <= 27 ? 0.60 : 0.20;
      if (position === 'QB') return age <= 27 ? 1.30 : age <= 33 ? 1.10 : age <= 36 ? 0.85 : 0.40;
      if (position === 'TE' || position === 'WR/TE') return age <= 25 ? 1.25 : age <= 28 ? 1.05 : age <= 31 ? 0.80 : 0.35;
    }
    if (strategy === 'win_now') {
      if (position === 'WR') return age <= 28 ? 1.10 : age <= 31 ? 1.00 : age <= 33 ? 0.85 : 0.60;
      if (position === 'RB') return age <= 26 ? 1.10 : age <= 28 ? 0.95 : age <= 30 ? 0.70 : 0.40;
      if (position === 'QB') return age <= 33 ? 1.05 : age <= 36 ? 0.95 : 0.75;
      if (position === 'TE' || position === 'WR/TE') return age <= 28 ? 1.05 : age <= 31 ? 1.00 : age <= 33 ? 0.80 : 0.60;
    }
    if (position === 'WR') return age <= 25 ? 1.25 : age <= 28 ? 1.10 : age <= 30 ? 0.95 : age <= 32 ? 0.75 : 0.45;
    if (position === 'RB') return age <= 24 ? 1.05 : age <= 26 ? 0.90 : age <= 28 ? 0.65 : age <= 30 ? 0.40 : 0.20;
    if (position === 'QB') return age <= 27 ? 1.15 : age <= 33 ? 1.05 : age <= 36 ? 0.85 : 0.50;
    if (position === 'TE' || position === 'WR/TE') return age <= 25 ? 1.15 : age <= 29 ? 1.00 : age <= 31 ? 0.85 : age <= 33 ? 0.65 : 0.40;
    return 1;
  };

  const getPlayerValue = (player, strategy) => {
    if (player.position === 'PICK') {
        let val = player.baseValue;
        if (isSuperflex && val > 100) val = Math.round(val * 1.3); 
        if (strategy === 'build') return Math.round(val * 1.15); 
        if (strategy === 'win_now') return Math.round(val * 0.85); 
        return val;
    }
    let pts = 0;
    pts += ((player.pass_yds || 0) / 25);
    pts += ((player.pass_tds || 0) * passTdValue); 
    pts -= ((player.turnovers || player.ints || player.fumbles || 0) * 2);
    pts += ((player.rush_yds || 0) / 10);
    pts += ((player.rush_tds || 0) * 6);
    pts += ((player.rec_yds || 0) / 10);
    pts += ((player.rec_tds || 0) * 6);
    let recPoints = ((player.receptions || 0) * pprValue);
    if (player.position === 'TE' || player.position === 'WR/TE') {
      recPoints += ((player.receptions || 0) * tePremium);
    }
    pts += recPoints;
    let vorp = 0;
    if (player.position === 'QB') vorp = pts - baselines.QB;
    else if (player.position === 'RB') vorp = pts - baselines.RB;
    else if (player.position === 'WR') vorp = pts - baselines.WR;
    else if (player.position === 'TE' || player.position === 'WR/TE') vorp = pts - baselines.TE;
    else vorp = pts;

    if (vorp <= 0) {
        if (player.age && player.age <= 25) {
            vorp = 35 - ((player.age - 20) * 5); 
            if (vorp < 0) vorp = 2; 
        } else vorp = 2; 
    }

    let productionValue = vorp;
    let posKey = player.position === 'WR/TE' ? 'TE' : player.position;
    let scarcityMod = positionalScarcity[posKey] || 1.0;
    if (posKey === 'QB') productionValue *= isSuperflex ? (1.60 * scarcityMod) : (1.0 * scarcityMod);
    else productionValue *= scarcityMod;

    let adp = player.adp || player.AVG || 300; 
    if (isSuperflex && player.position === 'QB' && adp < 300) adp = Math.max(1, adp / 4); 
    let marketValue = 0;
    if (adp >= 300 && productionValue > 50) marketValue = productionValue * 0.9;
    else {
        const marketScore = 100 * Math.pow(0.985, adp - 1); 
        marketValue = marketScore * 3.5; 
    }

    if (formatMode === 'dynasty') {
      const baseAssetValue = (productionValue * 0.50) + (marketValue * 0.50);
      const ageMult = getAgeMultiplier(player.position, player.age, strategy);
      return Math.round(baseAssetValue * ageMult * 2.2); 
    } else {
      const baseAssetValue = (productionValue * 0.75) + (marketValue * 0.25);
      return Math.round(baseAssetValue * 1.8);
    }
  };

  const buildRosterList = (managerId, strategy) => {
    if (!managerId || leagueRosters.length === 0) return [];
    const roster = leagueRosters.find(r => r.owner_id === managerId);
    if (!roster || !roster.players) return [];

    const mappedPlayers = roster.players.map(sleeperId => {
      let p = playersData.find(dbPlayer => String(dbPlayer.sleeper_id) === String(sleeperId));
      if (!p) p = playersData.find(dbPlayer => String(dbPlayer.id) === String(sleeperId));
      
      if (!p && sleeperPlayersMap[sleeperId]) {
          const sPlayer = sleeperPlayersMap[sleeperId];
          const sName = normalizeName(sPlayer.search_full_name || sPlayer.full_name);
          if (sName) {
              p = playersData.find(dbPlayer => {
                  if (normalizeName(dbPlayer.name) !== sName) return false;
                  if (sPlayer.position && dbPlayer.position) {
                      const sPos = sPlayer.position;
                      const dbPos = dbPlayer.position;
                      if (sPos !== dbPos && sPos !== 'WR/TE' && dbPos !== 'WR/TE') {
                         if (['QB', 'RB', 'WR', 'TE'].includes(sPos) !== ['QB', 'RB', 'WR', 'TE'].includes(dbPos)) return false;
                      }
                  }
                  return true;
              });
          }
      }

      if (!p) return null;
      // 🚀 FIX: Removed Date.now() to prevent React from losing track of the element and locking selections!
      return { ...p, uniqueId: p.id || p.name, calcValue: getPlayerValue(p, strategy) };
    }).filter(Boolean);

    const posOrder = { 'QB': 1, 'RB': 2, 'WR': 3, 'TE': 4, 'WR/TE': 4, 'K': 5, 'DST': 6 };
    
    return mappedPlayers.sort((a, b) => {
        const posA = posOrder[a.position] || 99;
        const posB = posOrder[b.position] || 99;
        if (posA !== posB) return posA - posB;
        return b.calcValue - a.calcValue;
    });
  };

  // Build the active rosters (valued at their OWN strategy for baseline display)
  const activeRosters = useMemo(() => {
    const rosters = {};
    ['A', 'B', 'C'].forEach(teamId => {
        if (teamsCount === 2 && teamId === 'C') return;
        rosters[teamId] = buildRosterList(teamManagers[teamId], teamStrategies[teamId]);
    });
    return rosters;
  }, [teamManagers, leagueRosters, playersData, sleeperPlayersMap, teamStrategies, isSuperflex, pprValue, passTdValue, tePremium, formatMode, teamsCount]);

  // Evaluate the entire 2 or 3 team trade structure
  const evaluations = useMemo(() => {
    const evals = {};
    let bestAssetVal = -1;
    let bestAssetTeam = null;

    ['A', 'B', 'C'].forEach(teamId => {
        if (teamsCount === 2 && teamId === 'C') return;

        // What did this team RECEIVE? Evaluate using THEIR strategy (because they own them now)
        const received = tradeAssets.filter(a => a.toTeam === teamId).map(a => ({
            ...a,
            calcValue: getPlayerValue(a, teamStrategies[teamId])
        })).sort((a, b) => b.calcValue - a.calcValue);

        // What did this team SEND? Evaluate using THEIR strategy (because they lost them)
        const sent = tradeAssets.filter(a => a.fromTeam === teamId).map(a => ({
            ...a,
            calcValue: getPlayerValue(a, teamStrategies[teamId])
        }));

        const getTieredSum = (assets) => {
            let sum = 0;
            assets.forEach((asset, idx) => {
                let multiplier = 1.0;
                if (idx === 1) multiplier = 0.90; 
                else if (idx === 2) multiplier = 0.80; 
                else if (idx === 3) multiplier = 0.70; 
                else if (idx >= 4) multiplier = 0.60;  
                sum += (asset.calcValue * multiplier);
            });
            return Math.round(sum);
        };

        const receivedTotalBase = getTieredSum(received);
        const sentTotal = Math.round(sent.reduce((acc, a) => acc + a.calcValue, 0));

        if (received.length > 0 && received[0].calcValue > bestAssetVal) {
            bestAssetVal = received[0].calcValue;
            bestAssetTeam = teamId;
        }

        evals[teamId] = {
            receivedAssets: received,
            sentAssets: sent,
            receivedTotalBase,
            sentTotal,
            hasPenalty: received.length > 1,
            isOneForOne: received.length === 1 && sent.length === 1,
            premium: 0 
        };
    });

    // Apply the 10% premium to the team receiving the single best asset in the entire trade
    if (bestAssetTeam) {
        const isOneForOneGlobal = tradeAssets.length === 2 && new Set(tradeAssets.map(a=>a.fromTeam)).size === 2;
        if (!isOneForOneGlobal) {
            const premium = Math.round(bestAssetVal * 0.10);
            if (evals[bestAssetTeam] && !evals[bestAssetTeam].isOneForOne) {
                evals[bestAssetTeam].premium = premium;
            }
        }
    }

    // Finalize Net Totals
    ['A', 'B', 'C'].forEach(teamId => {
        if (teamsCount === 2 && teamId === 'C') return;
        const e = evals[teamId];
        e.receivedTotal = e.receivedTotalBase + e.premium;
        e.net = e.receivedTotal - e.sentTotal;
    });

    return evals;
  }, [tradeAssets, teamStrategies, teamsCount, isSuperflex, pprValue, passTdValue, tePremium, formatMode, baselines, positionalScarcity]);

  return {
    activeRosters,
    evaluations,
    getPlayerValue
  };
}