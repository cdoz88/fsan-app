import { useMemo } from 'react';

// Unified Name Normalizer that strips out suffixes cleanly
const normalizeName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(jr|sr|ii|iii|iv|v)$/, '');
};

// EXACT Age Multiplier Matrix from the Trade Value Chart
const getBaseAgeMultiplier = (position, age, strategy) => {
  if (!age) return 1.0;
  const pos = position === 'WR/TE' ? 'TE' : position;

  if (strategy === 'build') {
    if (pos === 'RB') return age <= 23 ? 1.35 : age <= 25 ? 1.00 : age <= 27 ? 0.60 : age <= 29 ? 0.30 : 0.10;
    if (pos === 'WR') return age <= 24 ? 1.30 : age <= 27 ? 1.05 : age <= 29 ? 0.75 : age <= 31 ? 0.45 : 0.20;
    if (pos === 'QB') return age <= 26 ? 1.30 : age <= 33 ? 1.00 : age <= 36 ? 0.65 : 0.25;
    if (pos === 'TE') return age <= 25 ? 1.30 : age <= 28 ? 0.95 : age <= 30 ? 0.70 : age <= 32 ? 0.45 : 0.20;
  } else { 
    // Balanced and Win_Now Base
    if (pos === 'RB') return age <= 23 ? 1.20 : age <= 25 ? 1.05 : age <= 27 ? 0.85 : age <= 29 ? 0.55 : 0.25;
    if (pos === 'WR') return age <= 24 ? 1.15 : age <= 27 ? 1.05 : age <= 29 ? 0.90 : age <= 31 ? 0.70 : 0.45;
    if (pos === 'QB') return age <= 26 ? 1.15 : age <= 33 ? 1.05 : age <= 36 ? 0.85 : 0.50;
    if (pos === 'TE') return age <= 25 ? 1.15 : age <= 28 ? 1.00 : age <= 30 ? 0.85 : age <= 32 ? 0.65 : 0.40;
  }
  return 1.0;
};

export function useOmfgTradeEngine({
  playersData,
  sleeperPlayersMap,
  leagueRosters,
  leagueTradedPicks,
  leagueUsers,
  activeLeague,
  teamsCount,
  tradeAssets,
  teamManagers,
  teamStrategies,
  formatMode,
  tradeDeadline,
  activeWeekNum,
  isSuperflex,
  pprValue,
  passTdValue,
  tePremium,
  isDraftComplete
}) {

  // 1. DYNAMIC DRAFT YEAR ROLLING WINDOW
  const startYear = useMemo(() => {
    let year = activeLeague?.season ? parseInt(activeLeague.season) : 2026;
    if (isDraftComplete || (activeLeague && ['in_season', 'post_season', 'complete'].includes(activeLeague.status))) {
      year += 1;
    }
    return year;
  }, [activeLeague, isDraftComplete]);

  // 2. BASE DRAFT PICKS LIBRARY (For Manual Dropdowns)
  const DRAFT_PICKS = useMemo(() => {
    const basePicks = [];
    
    [startYear, startYear + 1, startYear + 2].forEach((year, idx) => {
      const decay = idx === 0 ? 1.0 : idx === 1 ? 0.85 : 0.70;
      
      basePicks.push({ id: `pick_${year}_1_early`, name: `${year} Early 1st`, position: 'PICK', year, round: 1, type: 'early', rawBase: 380 * decay });
      basePicks.push({ id: `pick_${year}_1_mid`, name: `${year} Mid 1st`, position: 'PICK', year, round: 1, type: 'mid', rawBase: 260 * decay });
      basePicks.push({ id: `pick_${year}_1_late`, name: `${year} Late 1st`, position: 'PICK', year, round: 1, type: 'late', rawBase: 190 * decay });
      
      basePicks.push({ id: `pick_${year}_2_early`, name: `${year} Early 2nd`, position: 'PICK', year, round: 2, type: 'early', rawBase: 120 * decay });
      basePicks.push({ id: `pick_${year}_2_mid`, name: `${year} Mid 2nd`, position: 'PICK', year, round: 2, type: 'mid', rawBase: 90 * decay });
      basePicks.push({ id: `pick_${year}_2_late`, name: `${year} Late 2nd`, position: 'PICK', year, round: 2, type: 'late', rawBase: 65 * decay });
      
      basePicks.push({ id: `pick_${year}_3`, name: `${year} 3rd Round`, position: 'PICK', year, round: 3, type: 'mid', rawBase: 35 * decay });
      basePicks.push({ id: `pick_${year}_4`, name: `${year} 4th Round`, position: 'PICK', year, round: 4, type: 'mid', rawBase: 15 * decay });
    });
    return basePicks;
  }, [startYear]);

  // 3. REAL LEAGUE SLEEPER TRADED PICK LEDGER
  const realLeaguePicks = useMemo(() => {
    if (!leagueRosters || leagueRosters.length === 0) return [];
    
    const picks = [];
    leagueRosters.forEach(roster => {
      [startYear, startYear + 1, startYear + 2].forEach((year, idx) => {
        const decay = idx === 0 ? 1.0 : idx === 1 ? 0.85 : 0.70;
        [1, 2, 3, 4].forEach(round => {
          let rawBase = 15 * decay;
          if (round === 1) rawBase = 260 * decay; 
          if (round === 2) rawBase = 90 * decay;  
          if (round === 3) rawBase = 35 * decay;

          picks.push({
            id: `pick-${year}-${round}-${roster.roster_id}`,
            season: String(year),
            round,
            originalRosterId: roster.roster_id,
            currentOwnerId: roster.roster_id,
            rawBase,
            position: 'PICK',
            year
          });
        });
      });
    });

    if (leagueTradedPicks && leagueTradedPicks.length > 0) {
      leagueTradedPicks.forEach(trade => {
        const pick = picks.find(p => p.season === trade.season && p.round === trade.round && p.originalRosterId === trade.roster_id);
        if (pick) pick.currentOwnerId = trade.owner_id;
      });
    }
    return picks;
  }, [leagueRosters, leagueTradedPicks, startYear]);

  // 4. CORE OMFG CALCULATION ENGINE
  const { playerValMap, maxRawValues } = useMemo(() => {
    const remainingWeeks = Math.max(1, 18 - (activeWeekNum || 1));
    const currentWeek = activeWeekNum || 1;
    const deadlineWeek = tradeDeadline === 'None' ? 14 : (parseInt(tradeDeadline?.replace(/\D/g, '')) || 10);
    const isPastDeadline = currentWeek >= deadlineWeek;

    const recalculated = (playersData || []).map(player => {
        const { SOS_OMFG, WOW_OMFG, ROS_OMFG, P25, P50, P75, weekly_proj_pts, OMFG_Edge, age, position } = player;
        const isTE = (position === 'TE' || position === 'WR/TE');

        // Dynamic Scoring Adjustments
        const delta_pass_tds_season = (player.pass_tds_season || 0) * (passTdValue - 4);
        const delta_ppr_season = (player.receptions_season || 0) * (pprValue - 0.5); 
        const delta_tep_season = isTE ? ((player.receptions_season || 0) * tePremium) : 0;
        const delta_total_season = delta_pass_tds_season + delta_ppr_season + delta_tep_season;

        const delta_pass_tds_week = (player.pass_tds_week || 0) * (passTdValue - 4);
        const delta_ppr_week = (player.receptions_week || 0) * (pprValue - 0.5); 
        const delta_tep_week = isTE ? ((player.receptions_week || 0) * tePremium) : 0;
        const delta_total_week = delta_pass_tds_week + delta_ppr_week + delta_tep_week;

        const p50_adj = (P50 || 0) + delta_total_season;
        const p75_adj = (P75 || 0) + delta_total_season;
        const weekly_proj_pts_adj = (weekly_proj_pts || 0) + delta_total_week;

        const pts_wow = weekly_proj_pts_adj * (1 + (((WOW_OMFG || 50) - 50) / 100));
        const pts_sos = p50_adj + ((p75_adj - p50_adj) * ((SOS_OMFG || 50) / 100));
        const pts_ros = p50_adj + ((p75_adj - p50_adj) * ((ROS_OMFG || 50) / 100)); 

        let rawValue = 0;
        let finalEdgeMult = 1.0 + ((OMFG_Edge || 0) / 100);

        if (formatMode === 'redraft') {
            let sos_w = 0, wow_w = 0, ros_w = 0;
            if (currentWeek <= 4) {
               sos_w = Math.max(0.40, 0.75 - (currentWeek * 0.08)); 
               wow_w = 0.20 + (currentWeek * 0.04);
               ros_w = 1.0 - sos_w - wow_w;
            } else if (!isPastDeadline) {
               sos_w = Math.max(0.10, 0.40 - ((currentWeek - 4) * 0.05));
               wow_w = 0.30;
               ros_w = 1.0 - sos_w - wow_w;
            } else {
               sos_w = 0.05; wow_w = 0.15; ros_w = 0.80;
            }

            const pts_redraft = (sos_w * (pts_sos * (remainingWeeks / 17))) + (wow_w * (pts_wow * remainingWeeks)) + (ros_w * (pts_ros * (remainingWeeks / 17)));
            rawValue = pts_redraft * finalEdgeMult * 1.5;
        } else {
            rawValue = { pts_sos, pts_wow, pts_ros, finalEdgeMult, age, position, SOS_OMFG }; 
        }

        let sf_mult = 1.0;
        if (position === 'QB') {
            sf_mult = isSuperflex ? 1.0 + ((SOS_OMFG || 50) / 300.0) : 0.75;
        }
        
        let tep_mult = 1.0;
        if (isTE) {
            if (tePremium === 0.5) tep_mult = 1.15;
            else if (tePremium === 1.0) tep_mult = 1.30;
            if ((SOS_OMFG || 50) > 80.0) tep_mult *= (1.0 + ((SOS_OMFG - 80) / 100));
        }

        if (formatMode === 'redraft') {
            rawValue = Math.max(0, rawValue * sf_mult * tep_mult);
        }

        return { ...player, rawValue, sf_mult, tep_mult };
    });

    // Strategy-Specific Max Normalization Scales
    const maxVals = { redraft: 1, win_now: 1, balanced: 1, build: 1, neutral: 1 };
    
    if (formatMode === 'redraft') {
        maxVals.redraft = Math.max(...recalculated.map(p => p.rawValue), 1);
    } else {
        ['win_now', 'balanced', 'build'].forEach(strat => {
            maxVals[strat] = Math.max(...recalculated.map(p => {
                const { pts_sos, pts_wow, pts_ros, finalEdgeMult, age, position, SOS_OMFG } = p.rawValue;
                
                const baseAgeMult = getBaseAgeMultiplier(position, age, strat);
                let gatedAgeMult = 1.0;
                if (baseAgeMult > 1.0) {
                    gatedAgeMult = 1.0 + ((baseAgeMult - 1.0) * ((SOS_OMFG || 50) / 100));
                } else if (baseAgeMult < 1.0) {
                    gatedAgeMult = 1.0 - ((1.0 - baseAgeMult) * (1.0 - ((SOS_OMFG || 50) / 100)));
                }

                let dynRawValue = 0;
                if (strat === 'win_now') {
                    const ros_w = isPastDeadline ? 0.45 : 0.35;
                    const sos_w = isPastDeadline ? 0.30 : 0.40;
                    const pts_win_now = (ros_w * pts_ros) + (0.25 * (pts_wow * 17)) + (sos_w * pts_sos);
                    dynRawValue = pts_win_now * finalEdgeMult * 2.5; 
                } else if (strat === 'balanced') {
                    const ros_w = isPastDeadline ? 0.25 : 0.15;
                    const sos_w = isPastDeadline ? 0.60 : 0.70;
                    const pts_balanced = (ros_w * pts_ros) + (0.15 * (pts_wow * 17)) + (sos_w * pts_sos);
                    dynRawValue = pts_balanced * gatedAgeMult * finalEdgeMult * 2.5;
                } else if (strat === 'build') {
                    dynRawValue = pts_sos * gatedAgeMult * finalEdgeMult * 2.5;
                }

                return Math.max(0, dynRawValue * p.sf_mult * p.tep_mult);
            }), 1);
        });
        maxVals.neutral = maxVals.balanced;
    }

    const map = {};
    recalculated.forEach(p => { map[normalizeName(p.name)] = p; });

    return { playerValMap: map, maxRawValues: maxVals };
  }, [playersData, formatMode, isSuperflex, pprValue, passTdValue, tePremium, tradeDeadline, activeWeekNum]);

  // 5. VALUE RETRIEVAL FUNCTION
  const getPlayerValue = (asset, strategy = 'neutral') => {
      const maxVal = formatMode === 'redraft' ? maxRawValues.redraft : maxRawValues[strategy];

      if (asset.position === 'PICK') {
          if (formatMode === 'redraft') return 0;
          let stratMod = 1.0;
          if (strategy === 'win_now') stratMod = 0.80;
          if (strategy === 'build') stratMod = 1.25;
          return Math.round(((asset.rawBase * stratMod) / maxVal) * 1000) || 0; 
      }

      const player = playerValMap[normalizeName(asset.name)];
      if (!player) return 0;

      if (formatMode === 'redraft') {
          return Math.round((player.rawValue / maxVal) * 1000) || 0;
      }

      const { pts_sos, pts_wow, pts_ros, finalEdgeMult, age, position, SOS_OMFG } = player.rawValue;
      const { sf_mult, tep_mult } = player;
      
      const baseAgeMult = getBaseAgeMultiplier(position, age, strategy);
      let gatedAgeMult = 1.0;
      if (baseAgeMult > 1.0) {
          gatedAgeMult = 1.0 + ((baseAgeMult - 1.0) * ((SOS_OMFG || 50) / 100));
      } else if (baseAgeMult < 1.0) {
          gatedAgeMult = 1.0 - ((1.0 - baseAgeMult) * (1.0 - ((SOS_OMFG || 50) / 100)));
      }

      const currentWeek = activeWeekNum || 1;
      const deadlineWeek = tradeDeadline === 'None' ? 14 : (parseInt(tradeDeadline?.replace(/\D/g, '')) || 10);
      const isPastDeadline = currentWeek >= deadlineWeek;

      let dynRawValue = 0;
      if (strategy === 'win_now') {
          const ros_w = isPastDeadline ? 0.45 : 0.35;
          const sos_w = isPastDeadline ? 0.30 : 0.40;
          const pts_win_now = (ros_w * pts_ros) + (0.25 * (pts_wow * 17)) + (sos_w * pts_sos);
          dynRawValue = pts_win_now * finalEdgeMult * 2.5;
      } else if (strategy === 'neutral' || strategy === 'balanced') {
          const ros_w = isPastDeadline ? 0.25 : 0.15;
          const sos_w = isPastDeadline ? 0.60 : 0.70;
          const pts_balanced = (ros_w * pts_ros) + (0.15 * (pts_wow * 17)) + (sos_w * pts_sos);
          dynRawValue = pts_balanced * gatedAgeMult * finalEdgeMult * 2.5;
      } else if (strategy === 'build') {
          dynRawValue = pts_sos * gatedAgeMult * finalEdgeMult * 2.5;
      }

      dynRawValue = Math.max(0, dynRawValue * sf_mult * tep_mult);
      return Math.round((dynRawValue / maxVal) * 1000) || 0;
  };

  // 6. ASSET SORTING HELPER
  const sortAssets = (a, b) => {
      const posOrder = { 'QB': 1, 'RB': 2, 'WR': 3, 'TE': 4, 'WR/TE': 4, 'K': 5, 'DST': 6, 'PICK': 99 };
      const posA = posOrder[a.position] || 99;
      const posB = posOrder[b.position] || 99;
      if (posA !== posB) return posA - posB;
      if (a.position === 'PICK' && b.position === 'PICK') {
          if (a.year !== b.year) return a.year - b.year;
          if (a.round && b.round) return a.round - b.round;
      }
      return b.calcValue - a.calcValue;
  };

  // 7. ROSTER MAPPING WITH SLEEPER TRADED PICKS
  const activeRosters = useMemo(() => {
    const rosters = { A: [], B: [], C: [] };
    if (!activeLeague || !sleeperPlayersMap) return rosters;

    ['A', 'B', 'C'].forEach(teamId => {
      const mId = teamManagers[teamId];
      if (!mId) return;
      
      const r = leagueRosters.find(roster => roster.owner_id === mId);
      if (!r) return;

      const teamPlayers = (r.players || []).map(pid => {
        const sData = sleeperPlayersMap[pid];
        if (!sData) return null;
        const fullName = `${sData.first_name || ''} ${sData.last_name || ''}`.trim();
        const pData = playerValMap[normalizeName(fullName)];
        
        return {
          id: pid,
          name: fullName,
          position: sData.position,
          team: sData.team,
          age: sData.age,
          calcValue: getPlayerValue({ name: fullName, position: sData.position }, teamStrategies[teamId]),
          ...pData
        };
      }).filter(Boolean).sort(sortAssets);

      let teamPicks = [];
      if (formatMode === 'dynasty') {
        teamPicks = realLeaguePicks.filter(p => p.currentOwnerId === r.roster_id).map(p => {
            let name = `${p.year} Round ${p.round}`;
            if (p.originalRosterId !== r.roster_id) {
                const origRoster = leagueRosters.find(orig => orig.roster_id === p.originalRosterId);
                const origUser = leagueUsers?.find(u => u.user_id === origRoster?.owner_id);
                const origName = origUser?.metadata?.team_name || origUser?.display_name || `Team ${p.originalRosterId}`;
                name += ` (via ${origName})`;
            }
            return {
                ...p,
                name,
                uniqueId: p.id,
                calcValue: getPlayerValue(p, teamStrategies[teamId])
            };
        }).sort(sortAssets);
      }

      rosters[teamId] = [...teamPlayers, ...teamPicks];
    });

    return rosters;
  }, [activeLeague, sleeperPlayersMap, leagueRosters, realLeaguePicks, teamManagers, playerValMap, teamStrategies, formatMode, DRAFT_PICKS]);

  // 8. EVALUATION ENGINE & TIERED MULTIPLIERS
  const evaluations = useMemo(() => {
    const evalResult = {
      A: { receivedTotal: 0, sentTotal: 0, net: 0, premium: 0, hasPenalty: false, sentAssets: [], receivedAssets: [] },
      B: { receivedTotal: 0, sentTotal: 0, net: 0, premium: 0, hasPenalty: false, sentAssets: [], receivedAssets: [] },
      C: { receivedTotal: 0, sentTotal: 0, net: 0, premium: 0, hasPenalty: false, sentAssets: [], receivedAssets: [] }
    };

    const activeTeams = teamsCount === 2 ? ['A', 'B'] : ['A', 'B', 'C'];

    tradeAssets.forEach(asset => {
      const from = asset.fromTeam;
      const to = asset.toTeam;
      
      const valForSender = getPlayerValue(asset, teamStrategies[from]);
      const valForReceiver = getPlayerValue(asset, teamStrategies[to]);

      if (activeTeams.includes(from)) {
          evalResult[from].sentAssets.push({ ...asset, calcValue: valForSender });
          evalResult[from].sentTotal += valForSender;
      }
      
      if (activeTeams.includes(to)) {
          evalResult[to].receivedAssets.push({ ...asset, calcValue: valForReceiver });
      }
    });

    let bestAssetVal = -1;
    let bestAssetTeam = null;

    activeTeams.forEach(t => {
      evalResult[t].receivedAssets.sort((a, b) => b.calcValue - a.calcValue);
      evalResult[t].sentAssets.sort((a, b) => b.calcValue - a.calcValue);

      // Tiered Package Multiplier (1.0, 0.90, 0.80, 0.70, 0.60)
      let receivedSum = 0;
      evalResult[t].receivedAssets.forEach((asset, idx) => {
          let multiplier = 1.0;
          if (idx === 1) multiplier = 0.90; 
          else if (idx === 2) multiplier = 0.80; 
          else if (idx === 3) multiplier = 0.70; 
          else if (idx >= 4) multiplier = 0.60;  
          receivedSum += Math.round(asset.calcValue * multiplier);
      });
      evalResult[t].receivedTotal = receivedSum;
      evalResult[t].hasPenalty = evalResult[t].receivedAssets.length > 1;

      if (evalResult[t].receivedAssets.length > 0 && evalResult[t].receivedAssets[0].calcValue > bestAssetVal) {
          bestAssetVal = evalResult[t].receivedAssets[0].calcValue;
          bestAssetTeam = t;
      }
    });

    // Consolidation Premium (10% bonus on top asset in non-1-for-1 deals)
    const isOneForOneGlobal = tradeAssets.length === 2 && new Set(tradeAssets.map(a => a.fromTeam)).size === 2;
    if (bestAssetTeam && !isOneForOneGlobal && bestAssetVal > 300) {
        const premiumValue = Math.round(bestAssetVal * 0.10);
        evalResult[bestAssetTeam].premium = premiumValue;
        evalResult[bestAssetTeam].receivedTotal += premiumValue;
    }

    activeTeams.forEach(t => {
      evalResult[t].net = evalResult[t].receivedTotal - evalResult[t].sentTotal;
    });

    return evalResult;
  }, [tradeAssets, teamStrategies, teamsCount, playerValMap, formatMode]);

  return { activeRosters, evaluations, getPlayerValue, DRAFT_PICKS };
}