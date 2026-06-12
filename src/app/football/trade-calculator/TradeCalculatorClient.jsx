'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Search, X, RefreshCw, Trophy, User, Check, ChevronsUpDown } from 'lucide-react'; 
import { HISTORICAL_DATA } from '../../../utils/historicalData'; 
import { useLeague } from '../../../context/LeagueContext'; 

// --- Generate Draft Picks Data ---
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

const DRAFT_PICKS = generatePicks();

export default function TradeCalculatorClient() {
  const { getActiveLeagueData, sleeperUserId } = useLeague();
  const activeLeague = getActiveLeagueData('football');

  const [playersData, setPlayersData] = useState([]);
  const [sleeperPlayersMap, setSleeperPlayersMap] = useState({}); // 🚀 NEW: Intelligent fallback map
  const [isSyncing, setIsSyncing] = useState(true);

  // --- League Roster Sync State ---
  const [leagueUsers, setLeagueUsers] = useState([]);
  const [leagueRosters, setLeagueRosters] = useState([]);
  const [teamAManager, setTeamAManager] = useState(''); 
  const [teamBManager, setTeamBManager] = useState('');
  
  // Custom Dropdown State for Opponent
  const [isOpponentDropdownOpen, setIsOpponentDropdownOpen] = useState(false);

  // --- Trade Teams State ---
  const [formatMode, setFormatMode] = useState('dynasty'); 
  const [teamAStrategy, setTeamAStrategy] = useState('neutral');
  const [teamBStrategy, setTeamBStrategy] = useState('neutral');
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  
  // --- Search Input States (For manual fallback) ---
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');

  // --- Scoring Format Settings (Fallback for non-synced) ---
  const [showSettings, setShowSettings] = useState(false);
  const [manualIsSuperflex, setManualIsSuperflex] = useState(true); 
  const [manualPprValue, setManualPprValue] = useState(1);       
  const [manualPassTdValue, setManualPassTdValue] = useState(4); 
  const [manualTePremium, setManualTePremium] = useState(0);     

  const isSuperflex = activeLeague?.rosterPositions ? activeLeague.rosterPositions.includes('SUPER_FLEX') : manualIsSuperflex;
  const pprValue = activeLeague?.scoringSettings?.rec ?? manualPprValue;
  const passTdValue = activeLeague?.scoringSettings?.pass_td ?? manualPassTdValue;
  const tePremium = activeLeague?.scoringSettings?.bonus_rec_te ?? manualTePremium;

  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#e42d38';
  const secondaryColor = '#8a1a20';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'redraft' || modeParam === 'dynasty') {
        setFormatMode(modeParam);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('mode', formatMode);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  }, [formatMode]);

  // 🚀 Fetch Global Player DB
  useEffect(() => {
    async function loadLiveDatabase() {
      try {
        const res = await fetch('/api/dynasty-players');
        const data = await res.json();
        if (data.success && data.players) {
          setPlayersData(data.players);
        }
      } catch (err) {
        console.error("Error connecting to database api", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadLiveDatabase();
  }, []);

  // 🚀 NEW: Fetch Sleeper Master Player Map for Fallback Matching
  useEffect(() => {
    if (activeLeague && activeLeague.platform === 'sleeper') {
        const fetchSleeperMap = async () => {
            const cached = localStorage.getItem('fsan_sleeper_players');
            if (cached) {
                setSleeperPlayersMap(JSON.parse(cached));
                return;
            }
            try {
                const res = await fetch('https://api.sleeper.app/v1/players/nfl');
                const data = await res.json();
                setSleeperPlayersMap(data);
                try { localStorage.setItem('fsan_sleeper_players', JSON.stringify(data)); } catch(e){}
            } catch (err) {
                console.error("Failed to load sleeper master players list", err);
            }
        };
        fetchSleeperMap();
    }
  }, [activeLeague]);

  // 🚀 Fetch Sleeper League Rosters & Users
  useEffect(() => {
    if (activeLeague && activeLeague.platform === 'sleeper') {
      const fetchSleeperData = async () => {
        try {
          const [usersRes, rostersRes] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/users`),
            fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/rosters`)
          ]);
          const users = await usersRes.json();
          const rosters = await rostersRes.json();
          setLeagueUsers(users);
          setLeagueRosters(rosters);

          // 🚀 AUTO-ASSIGN TEAM A TO YOU
          if (sleeperUserId) {
            setTeamAManager(sleeperUserId);
          }
        } catch (e) {
          console.error("Failed to fetch sleeper league data", e);
        }
      };
      fetchSleeperData();
    } else {
       setLeagueUsers([]);
       setLeagueRosters([]);
       setTeamAManager('');
       setTeamBManager('');
    }
  }, [activeLeague, sleeperUserId]);

  // 🚀 CORE VALUATION ENGINE
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
    return {
      QB: calcMod(counts.QB),
      RB: calcMod(counts.RB),
      WR: calcMod(counts.WR),
      TE: calcMod(counts.TE)
    };
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
      const posPlayers = rawScored.filter(p => p.position === pos || (pos === 'TE' && p.position === 'WR/TE'))
                                  .sort((a, b) => b.rawPts - a.rawPts);
      let dynamicBase = 0;
      if (posPlayers.length > 0) dynamicBase = posPlayers[Math.min(rankLimit - 1, posPlayers.length - 1)].rawPts;
      let posKey = pos === 'WR/TE' ? 'TE' : pos;
      let histBase = HISTORICAL_DATA?.BASELINES?.[posKey]?.[`Rank_${rankLimit}`];
      if (histBase && histBase > 0) return (dynamicBase * 0.5) + (histBase * 0.5);
      return dynamicBase;
    };
    return {
      QB: getBaseScore('QB', isSuperflex ? 32 : 16),
      RB: getBaseScore('RB', 48), 
      WR: getBaseScore('WR', 60), 
      TE: getBaseScore('TE', 24)
    };
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

  // 🚀 INTELLIGENT SYNCED ROSTER PARSING
  const buildRosterList = (managerId, strategy) => {
    if (!managerId || leagueRosters.length === 0) return [];
    const roster = leagueRosters.find(r => r.owner_id === managerId);
    if (!roster || !roster.players) return [];

    const mappedPlayers = roster.players.map(sleeperId => {
      // 1. Try strict Sleeper ID match first
      let p = playersData.find(dbPlayer => String(dbPlayer.sleeper_id) === String(sleeperId));
      
      // 2. Try generic ID match
      if (!p) p = playersData.find(dbPlayer => String(dbPlayer.id) === String(sleeperId));
      
      // 3. 🚀 THE FALLBACK: Map string ID -> Sleeper Player Object -> Name Match
      if (!p && sleeperPlayersMap[sleeperId]) {
          const sPlayer = sleeperPlayersMap[sleeperId];
          const searchName = sPlayer.search_full_name || sPlayer.full_name?.toLowerCase().replace(/[^a-z]/g, '');
          if (searchName) {
              p = playersData.find(dbPlayer => dbPlayer.name.toLowerCase().replace(/[^a-z]/g, '') === searchName);
          }
      }

      if (!p) return null;
      return { ...p, uniqueId: p.name + Date.now(), calcValue: getPlayerValue(p, strategy) };
    }).filter(Boolean);

    return mappedPlayers.sort((a, b) => b.calcValue - a.calcValue);
  };

  const activeRosterA = useMemo(() => buildRosterList(teamAManager, teamAStrategy), [teamAManager, leagueRosters, playersData, sleeperPlayersMap, teamAStrategy, isSuperflex, pprValue, passTdValue, tePremium, formatMode]);
  const activeRosterB = useMemo(() => buildRosterList(teamBManager, teamBStrategy), [teamBManager, leagueRosters, playersData, sleeperPlayersMap, teamBStrategy, isSuperflex, pprValue, passTdValue, tePremium, formatMode]);

  // Handle toggling players from the side-by-side roster
  const togglePlayerInTrade = (playerObj, team) => {
    if (team === 'A') {
      const isSelected = teamBPlayers.some(p => p.name === playerObj.name);
      if (isSelected) setTeamBPlayers(teamBPlayers.filter(p => p.name !== playerObj.name));
      else setTeamBPlayers([...teamBPlayers, playerObj]);
    } else {
      const isSelected = teamAPlayers.some(p => p.name === playerObj.name);
      if (isSelected) setTeamAPlayers(teamAPlayers.filter(p => p.name !== playerObj.name));
      else setTeamAPlayers([...teamAPlayers, playerObj]);
    }
  };

  // Trade Engine Evaluation
  const tradeEvaluation = useMemo(() => {
    const teamA_assets = teamAPlayers.map(p => ({ ...p, calcValue: getPlayerValue(p, teamAStrategy) }))
                                     .sort((a, b) => b.calcValue - a.calcValue);
    const teamB_assets = teamBPlayers.map(p => ({ ...p, calcValue: getPlayerValue(p, teamBStrategy) }))
                                     .sort((a, b) => b.calcValue - a.calcValue);

    if (teamA_assets.length === 0 && teamB_assets.length === 0) return { totalA: 0, totalB: 0, bestAsset: null, hasPenaltyA: false, hasPenaltyB: false };

    let bestAsset = null;
    let maxVal = -1;
    let bestAssetSide = null;

    teamA_assets.forEach(p => { if(p.calcValue > maxVal) { maxVal = p.calcValue; bestAsset = p; bestAssetSide = 'A'; }});
    teamB_assets.forEach(p => { if(p.calcValue > maxVal) { maxVal = p.calcValue; bestAsset = p; bestAssetSide = 'B'; }});

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

    let finalA = getTieredSum(teamA_assets);
    let finalB = getTieredSum(teamB_assets);
    let premium = 0;
    const isOneForOne = teamA_assets.length === 1 && teamB_assets.length === 1;

    if (!isOneForOne) {
        premium = Math.round(maxVal * 0.10);
        if (bestAssetSide === 'A') finalA += premium;
        if (bestAssetSide === 'B') finalB += premium;
    }

    return { 
        totalA: finalA, 
        totalB: finalB, 
        bestAsset, 
        bestAssetSide, 
        premium, 
        hasPenaltyA: teamA_assets.length > 1, 
        hasPenaltyB: teamB_assets.length > 1,
        isOneForOne
    };
  }, [teamAPlayers, teamBPlayers, teamAStrategy, teamBStrategy, isSuperflex, pprValue, passTdValue, tePremium, formatMode, baselines, positionalScarcity]);

  const { totalA, totalB, bestAsset, bestAssetSide, premium, hasPenaltyA, hasPenaltyB, isOneForOne } = tradeEvaluation;
  const totalBoth = totalA + totalB;
  const diff = Math.abs(totalA - totalB);
  const diffPct = totalBoth > 0 ? (diff / totalBoth) * 100 : 0;

  let verdictTitle = "Select assets to evaluate trade";
  let verdictSubtitle = "Toggle players to see the package analysis.";
  let verdictColor = "text-gray-500";
  let barAWidth = 50;
  let barBWidth = 50;

  if (totalBoth > 0) {
      barAWidth = (totalA / totalBoth) * 100;
      barBWidth = (totalB / totalBoth) * 100;
      const winner = totalA > totalB ? 'Team A' : 'Team B';
      const loser = totalA > totalB ? 'Team B' : 'Team A';
      
      if (diffPct <= 5) {
          verdictTitle = "🤝 Fair Trade";
          verdictColor = "text-zinc-300";
          verdictSubtitle = "Highly balanced deal. Both managers extract equitable value based on their current roster strategies.";
      } else if (diffPct <= 12) {
          verdictTitle = `⚖️ Slight Edge: ${winner}`;
          verdictColor = totalA > totalB ? "text-red-400" : "text-blue-400";
          verdictSubtitle = `A viable trade, but ${winner} extracts roughly ${Math.round(diffPct)}% more value overall.`;
      } else if (diffPct <= 22) {
          verdictTitle = `🏆 Clear Win: ${winner}`;
          verdictColor = totalA > totalB ? "text-red-500" : "text-blue-500";
          verdictSubtitle = `${loser} is sacrificing too much value. Consider adding a draft pick or prospect to balance the scales.`;
      } else {
          verdictTitle = `🚨 Major Overpay by ${loser}`;
          verdictColor = totalA > totalB ? "text-red-600" : "text-blue-600";
          verdictSubtitle = `This trade is heavily lopsided. ${winner} completely dominates the value exchange.`;
      }

      if (bestAsset && diffPct > 5) {
          const receivesBest = bestAssetSide === (totalA > totalB ? 'A' : 'B');
          if (!isOneForOne) {
              verdictSubtitle += ` ${receivesBest ? winner : loser} receives a structural premium for acquiring ${bestAsset.name}, consolidating elite value in this multi-player deal.`;
          }
      }
  }

  // Fallback Manual Add Player
  const addPlayer = (item, team) => {
      const newItem = { ...item, uniqueId: item.name + Date.now() }; 
      if (item.position !== 'PICK' || item.id.includes('.')) {
          if (teamAPlayers.some(p => p.name === item.name) || teamBPlayers.some(p => p.name === item.name)) return; 
      }
      if (team === 'A') setTeamAPlayers([...teamAPlayers, newItem]);
      else setTeamBPlayers([...teamBPlayers, newItem]);
  };

  const removePlayer = (uniqueId, team) => {
      if (team === 'A') setTeamAPlayers(teamAPlayers.filter(p => p.uniqueId !== uniqueId));
      else setTeamBPlayers(teamBPlayers.filter(p => p.uniqueId !== uniqueId));
  };

  const handlePickSelect = (e, team) => {
      if (!e.target.value) return;
      const pick = DRAFT_PICKS.find(p => p.id === e.target.value);
      if (pick) addPlayer(pick, team);
      e.target.value = ""; 
  };

  // 🚀 User / Avatar Helpers
  const myUser = leagueUsers.find(u => u.user_id === teamAManager);
  const myTeamName = myUser?.metadata?.team_name || myUser?.display_name || 'My Team';
  const myAvatar = myUser?.avatar ? `https://sleepercdn.com/avatars/thumbs/${myUser.avatar}` : 'https://placehold.co/40x40/383838/ffffff?text=?';

  const selectedUserB = leagueUsers.find(u => u.user_id === teamBManager);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative">
      
      {/* Hero Section */}
      <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }} />
        <img src={bgImage} alt="Football Background" className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between h-full px-6 md:px-10 pb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              Trade Calculator
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Analyze multi-player deals using live VORP projections and asymmetric league scoring.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex bg-[#111] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
            <button onClick={() => setFormatMode('redraft')} className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formatMode === 'redraft' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-white'}`}>Redraft</button>
            <button onClick={() => setFormatMode('dynasty')} className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formatMode === 'dynasty' ? 'bg-zinc-700 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>Dynasty</button>
          </div>
          
          {activeLeague ? (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 pointer-events-none">
              <Trophy size={16} /> Synced to {activeLeague.name}
            </div>
          ) : (
            <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${showSettings ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'}`}>
              <Settings size={16} /> {showSettings ? 'Hide Settings' : 'Custom League Scoring'}
            </button>
          )}
        </div>

        {/* Custom Scoring Panel (Only shows if no league is synced) */}
        {showSettings && !activeLeague && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">League Type</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  <button onClick={() => setManualIsSuperflex(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!manualIsSuperflex ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>1QB</button>
                  <button onClick={() => setManualIsSuperflex(true)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${manualIsSuperflex ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>SUPERFLEX</button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Receptions (PPR)</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: 'STD', val: 0 }, { label: 'HALF', val: 0.5 }, { label: 'FULL', val: 1 }].map(opt => (
                    <button key={opt.label} onClick={() => setManualPprValue(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualPprValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Passing TDs</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: '4 PTS', val: 4 }, { label: '6 PTS', val: 6 }].map(opt => (
                    <button key={opt.label} onClick={() => setManualPassTdValue(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualPassTdValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">TE Premium</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: 'NONE', val: 0 }, { label: '+0.5', val: 0.5 }, { label: '+1.0', val: 1 }].map(opt => (
                    <button key={opt.label} onClick={() => setManualTePremium(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualTePremium === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {isSyncing ? (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="animate-spin mb-4 text-red-500" size={36} />
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Syncing Live Player Data</h3>
            </div>
        ) : (
            <div className="flex flex-col gap-8">
                
                {/* VERDICT BAR */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <h2 className={`text-center text-2xl font-black uppercase tracking-widest mb-2 ${verdictColor}`}>
                        {verdictTitle}
                    </h2>
                    <p className="text-center text-xs font-bold text-gray-400 max-w-2xl mx-auto mb-6 leading-relaxed">
                        {verdictSubtitle}
                    </p>
                    <div className="w-full h-4 rounded-full bg-[#111] flex overflow-hidden border border-gray-800 shadow-inner">
                        <div className="h-full bg-red-600 transition-all duration-500 relative" style={{ width: `${barAWidth}%` }} />
                        <div className="h-full bg-blue-600 transition-all duration-500 relative" style={{ width: `${barBWidth}%` }} />
                    </div>
                </div>

                {/* 🚀 SIDE-BY-SIDE ROSTER UI (If League Synced) */}
                {activeLeague ? (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* MY ROSTER (Team A) */}
                    <div className="flex-1 bg-[#111] border-2 border-gray-800 rounded-3xl p-6 shadow-2xl relative flex flex-col h-[700px]">
                      
                      {/* Header & Strategy */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 border-b border-gray-800 pb-4 shrink-0">
                          
                          {/* Beautiful Locked Team A Display */}
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                              <img src={myAvatar} className="w-10 h-10 rounded-full border border-gray-600" alt="" />
                              <div className="flex flex-col">
                                  <span className="text-lg font-black text-white truncate max-w-[200px]">{myTeamName}</span>
                                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Sending: {totalA}</span>
                              </div>
                          </div>

                          {formatMode === 'dynasty' && (
                              <select 
                                  value={teamAStrategy} 
                                  onChange={(e) => setTeamAStrategy(e.target.value)}
                                  className="bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-2 px-4 shadow-sm focus:outline-none font-bold text-xs tracking-wide w-full sm:w-auto"
                              >
                                  <option value="win_now">🏆 Win Now</option>
                                  <option value="neutral">⚖️ Balanced</option>
                                  <option value="build">🌱 Rebuild</option>
                              </select>
                          )}
                      </div>

                      {/* Picks Dropdown */}
                      <div className="mb-4 shrink-0">
                          <select 
                              onChange={(e) => handlePickSelect(e, 'A')}
                              className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-400 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:text-white transition-colors cursor-pointer"
                          >
                              <option value="">+ Add Draft Pick to Trade</option>
                              <optgroup label="2026 Picks">
                                  {DRAFT_PICKS.filter(p => p.year === 2026).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </optgroup>
                              <optgroup label="2027 Picks">
                                  {DRAFT_PICKS.filter(p => p.year === 2027).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </optgroup>
                          </select>
                      </div>

                      {/* Scrollable Roster List */}
                      <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-2">
                          {/* Render Manual Picks first */}
                          {teamAPlayers.filter(p => p.position === 'PICK').map(p => (
                             <div 
                                key={p.uniqueId} 
                                onClick={() => togglePlayerInTrade(p, 'A')}
                                className="flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-2 border-red-500 bg-red-900/20"
                              >
                                 <div className="flex items-center gap-3">
                                     <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white"><Check size={14} /></div>
                                     <span className="text-sm font-black text-white">{p.name}</span>
                                 </div>
                                 <span className="text-sm font-black text-white">{getPlayerValue(p, teamAStrategy)}</span>
                             </div>
                          ))}

                          {/* Render Actual Roster */}
                          {activeRosterA.map(p => {
                             const isSelected = teamBPlayers.some(traded => traded.name === p.name);
                             return (
                               <div 
                                  key={p.id} 
                                  onClick={() => togglePlayerInTrade(p, 'A')}
                                  className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? 'border-red-500 bg-red-900/20' : 'border-transparent bg-[#1a1a1a] hover:border-gray-600'}`}
                                >
                                   <div className="flex items-center gap-3">
                                       {isSelected ? (
                                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0"><Check size={16} /></div>
                                       ) : (
                                          p.team && p.team !== 'fa' ? (
                                              <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-8 h-8 object-contain opacity-70 shrink-0" onError={(e) => e.target.style.display = 'none'} />
                                          ) : (
                                              <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0"></div>
                                          )
                                       )}
                                       <div className="flex flex-col">
                                          <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-gray-300'}`}>{p.name}</span>
                                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} {formatMode === 'dynasty' && p.age ? `• ${p.age} y/o` : ''}</span>
                                       </div>
                                   </div>
                                   <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>{p.calcValue}</span>
                               </div>
                             );
                          })}
                          {activeRosterA.length === 0 && <div className="text-center py-10 text-gray-600 text-xs font-bold uppercase tracking-widest">Roster not found</div>}
                      </div>
                    </div>

                    {/* OPPONENT ROSTER (Team B) */}
                    <div className="flex-1 bg-[#111] border-2 border-gray-800 rounded-3xl p-6 shadow-2xl relative flex flex-col h-[700px]">
                      
                      {/* Header & Strategy */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 border-b border-gray-800 pb-4 shrink-0">
                          
                          {/* 🚀 NEW: Custom Opponent Dropdown */}
                          <div className="flex flex-col w-full sm:w-auto gap-1">
                              <div className="relative w-full sm:w-[220px]">
                                <button 
                                  onClick={() => setIsOpponentDropdownOpen(!isOpponentDropdownOpen)}
                                  className="flex items-center gap-3 bg-[#1a1a1a] border border-gray-700 hover:border-blue-500 text-white rounded-xl py-2 px-3 shadow-sm focus:outline-none transition-all w-full text-left"
                                >
                                  {selectedUserB ? (
                                    <>
                                      <img 
                                        src={selectedUserB.avatar ? `https://sleepercdn.com/avatars/thumbs/${selectedUserB.avatar}` : 'https://placehold.co/40x40/383838/ffffff?text=?'} 
                                        className="w-6 h-6 rounded-full border border-gray-600 shrink-0" 
                                        alt="" 
                                      />
                                      <span className="text-sm font-bold truncate flex-1">
                                        {selectedUserB.metadata?.team_name || selectedUserB.display_name}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm font-bold text-gray-400 flex-1">Select Opponent...</span>
                                  )}
                                  <ChevronsUpDown size={14} className="text-gray-500 shrink-0" />
                                </button>

                                {isOpponentDropdownOpen && (
                                  <>
                                    <div className="fixed inset-0 z-[90]" onClick={() => setIsOpponentDropdownOpen(false)}></div>
                                    <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl z-[100] max-h-64 overflow-y-auto custom-scroll py-2">
                                      {leagueUsers.filter(u => u.user_id !== sleeperUserId).map(u => {
                                        const teamName = u.metadata?.team_name || u.display_name;
                                        const avatar = u.avatar ? `https://sleepercdn.com/avatars/thumbs/${u.avatar}` : 'https://placehold.co/40x40/383838/ffffff?text=?';
                                        return (
                                          <button 
                                            key={u.user_id}
                                            onClick={() => { setTeamBManager(u.user_id); setTeamBPlayers([]); setTeamAPlayers([]); setIsOpponentDropdownOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#252525] transition-colors text-left"
                                          >
                                            <img src={avatar} className="w-8 h-8 rounded-full border border-gray-600 shrink-0" alt="" />
                                            <div className="flex flex-col overflow-hidden">
                                              <span className="text-sm font-bold text-white truncate">{teamName}</span>
                                              {u.metadata?.team_name && <span className="text-[10px] text-gray-500 uppercase truncate">@{u.display_name}</span>}
                                            </div>
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </>
                                )}
                              </div>
                              <span className="text-[10px] text-blue-500 font-bold tracking-widest uppercase pl-1">Receiving: {totalB}</span>
                          </div>

                          {formatMode === 'dynasty' && (
                              <select 
                                  value={teamBStrategy} 
                                  onChange={(e) => setTeamBStrategy(e.target.value)}
                                  className="bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-2 px-4 shadow-sm focus:outline-none font-bold text-xs tracking-wide w-full sm:w-auto"
                              >
                                  <option value="win_now">🏆 Win Now</option>
                                  <option value="neutral">⚖️ Balanced</option>
                                  <option value="build">🌱 Rebuild</option>
                              </select>
                          )}
                      </div>

                      {/* Picks Dropdown */}
                      <div className="mb-4 shrink-0">
                          <select 
                              onChange={(e) => handlePickSelect(e, 'B')}
                              disabled={!teamBManager}
                              className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-400 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                          >
                              <option value="">+ Add Draft Pick to Trade</option>
                              <optgroup label="2026 Picks">
                                  {DRAFT_PICKS.filter(p => p.year === 2026).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </optgroup>
                              <optgroup label="2027 Picks">
                                  {DRAFT_PICKS.filter(p => p.year === 2027).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </optgroup>
                          </select>
                      </div>

                      {/* Scrollable Roster List */}
                      <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-2">
                          {!teamBManager ? (
                              <div className="text-center py-20 text-gray-600 text-xs font-bold uppercase tracking-widest">Select an opponent to view roster</div>
                          ) : (
                              <>
                                {/* Render Manual Picks first */}
                                {teamBPlayers.filter(p => p.position === 'PICK').map(p => (
                                   <div 
                                      key={p.uniqueId} 
                                      onClick={() => togglePlayerInTrade(p, 'B')}
                                      className="flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-2 border-blue-500 bg-blue-900/20"
                                    >
                                       <div className="flex items-center gap-3">
                                           <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white"><Check size={14} /></div>
                                           <span className="text-sm font-black text-white">{p.name}</span>
                                       </div>
                                       <span className="text-sm font-black text-white">{getPlayerValue(p, teamBStrategy)}</span>
                                   </div>
                                ))}

                                {/* Render Actual Roster */}
                                {activeRosterB.map(p => {
                                   const isSelected = teamAPlayers.some(traded => traded.name === p.name);
                                   return (
                                     <div 
                                        key={p.id} 
                                        onClick={() => togglePlayerInTrade(p, 'B')}
                                        className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-transparent bg-[#1a1a1a] hover:border-gray-600'}`}
                                      >
                                         <div className="flex items-center gap-3">
                                             {isSelected ? (
                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0"><Check size={16} /></div>
                                             ) : (
                                                p.team && p.team !== 'fa' ? (
                                                    <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-8 h-8 object-contain opacity-70 shrink-0" onError={(e) => e.target.style.display = 'none'} />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0"></div>
                                                )
                                             )}
                                             <div className="flex flex-col">
                                                <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-gray-300'}`}>{p.name}</span>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} {formatMode === 'dynasty' && p.age ? `• ${p.age} y/o` : ''}</span>
                                             </div>
                                         </div>
                                         <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>{p.calcValue}</span>
                                     </div>
                                   );
                                })}
                              </>
                          )}
                      </div>
                    </div>
                  </div>
                ) : (
                  
                  // 🚀 OLD FALLBACK UI (If no league is synced)
                  <div className="flex flex-col lg:flex-row gap-6">
                      {/* TEAM A PANE */}
                      <div className="flex-1 bg-[#111] border-2 border-red-900/30 rounded-3xl p-6 shadow-2xl relative">
                          <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
                              <h3 className="text-lg font-black text-white uppercase tracking-wider">Team A Receives</h3>
                              {formatMode === 'dynasty' && (
                                  <select 
                                      value={teamAStrategy} 
                                      onChange={(e) => setTeamAStrategy(e.target.value)}
                                      className="bg-[#1a1a1a] border border-red-900/50 text-white rounded-xl py-2 px-4 shadow-sm focus:outline-none font-bold text-xs tracking-wide"
                                  >
                                      <option value="win_now">🏆 Win Now</option>
                                      <option value="neutral">⚖️ Balanced</option>
                                      <option value="build">🌱 Rebuild</option>
                                  </select>
                              )}
                          </div>
                          <div className="flex flex-col xl:flex-row gap-3 mb-6">
                              <div className="relative flex-1">
                                  <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
                                      <Search size={18} className="text-gray-500 mr-3 shrink-0" />
                                      <input 
                                          type="text" 
                                          placeholder="Search players..."
                                          className="bg-transparent text-white outline-none w-full text-sm font-bold placeholder-gray-600"
                                          value={queryA}
                                          onChange={e => setQueryA(e.target.value)}
                                      />
                                  </div>
                                  {queryA.length > 1 && (
                                      <div className="absolute z-50 top-full mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scroll">
                                          {playersData.filter(p => p.name.toLowerCase().includes(queryA.toLowerCase())).slice(0, 8).map(p => (
                                              <div key={p.name} className="px-4 py-3 hover:bg-[#252525] cursor-pointer flex justify-between items-center border-b border-gray-800/50" onClick={() => { addPlayer(p, 'A'); setQueryA(''); }}>
                                                  <div className="flex items-center gap-3">
                                                      {p.team && p.team !== 'fa' && (
                                                          <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                                                      )}
                                                      <span className="text-sm font-bold text-white">{p.name}</span>
                                                      <span className="text-[10px] font-black bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">{p.position}</span>
                                                  </div>
                                                  <span className="text-xs font-black text-gray-400">{getPlayerValue(p, teamAStrategy)} pts</span>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                              {formatMode === 'dynasty' && (
                                  <select 
                                      onChange={(e) => handlePickSelect(e, 'A')}
                                      className="bg-[#1a1a1a] border border-gray-800 text-gray-400 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:text-white transition-colors xl:w-40 cursor-pointer"
                                  >
                                      <option value="">+ Add Pick</option>
                                      <optgroup label="2026 Picks">
                                          {DRAFT_PICKS.filter(p => p.year === 2026).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                      </optgroup>
                                  </select>
                              )}
                          </div>
                          <div className="space-y-3 min-h-[150px]">
                              {teamAPlayers.length === 0 ? (
                                  <div className="text-center py-10 text-gray-600 font-bold text-xs uppercase tracking-widest">No assets added</div>
                              ) : teamAPlayers.map(p => (
                                  <div key={p.uniqueId} className="flex justify-between items-center bg-[#1a1a1a] border border-red-900/20 p-4 rounded-2xl group transition-all hover:border-red-500/50">
                                      <div className="flex items-center gap-4">
                                          <button onClick={() => removePlayer(p.uniqueId, 'A')} className="text-gray-600 hover:text-red-500 transition-colors">
                                              <X size={18} />
                                          </button>
                                          <div className="flex items-center gap-3">
                                              {p.position === 'PICK' ? (
                                                  <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-xs font-black text-white shadow-md">{p.year.toString().slice(-2)}</div>
                                              ) : (
                                                  p.team && p.team !== 'fa' && <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-8 h-8 object-contain drop-shadow-md" onError={(e) => e.target.style.display = 'none'} />
                                              )}
                                              <div>
                                                  <div className="text-sm font-black text-white">{p.name}</div>
                                                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} {formatMode === 'dynasty' && p.age ? `• ${p.age} y/o` : ''}</div>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="text-lg font-black text-white">{getPlayerValue(p, teamAStrategy)}</div>
                                  </div>
                              ))}
                          </div>
                          <div className="mt-8 pt-4 border-t border-red-900/30 flex justify-between items-end">
                              <div className="flex flex-col">
                                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Final Package Value</span>
                                  {bestAssetSide === 'A' && !isOneForOne && <span className="text-[10px] text-amber-500 font-bold uppercase mt-1">Includes Elite Premium (+{premium})</span>}
                              </div>
                              <span className="text-4xl font-black text-red-500">{totalA}</span>
                          </div>
                      </div>

                      {/* TEAM B PANE */}
                      <div className="flex-1 bg-[#111] border-2 border-blue-900/30 rounded-3xl p-6 shadow-2xl relative">
                          <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
                              <h3 className="text-lg font-black text-white uppercase tracking-wider">Team B Receives</h3>
                              {formatMode === 'dynasty' && (
                                  <select 
                                      value={teamBStrategy} 
                                      onChange={(e) => setTeamBStrategy(e.target.value)}
                                      className="bg-[#1a1a1a] border border-blue-900/50 text-white rounded-xl py-2 px-4 shadow-sm focus:outline-none font-bold text-xs tracking-wide"
                                  >
                                      <option value="win_now">🏆 Win Now</option>
                                      <option value="neutral">⚖️ Balanced</option>
                                      <option value="build">🌱 Rebuild</option>
                                  </select>
                              )}
                          </div>
                          <div className="flex flex-col xl:flex-row gap-3 mb-6">
                              <div className="relative flex-1">
                                  <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
                                      <Search size={18} className="text-gray-500 mr-3 shrink-0" />
                                      <input 
                                          type="text" 
                                          placeholder="Search players..."
                                          className="bg-transparent text-white outline-none w-full text-sm font-bold placeholder-gray-600"
                                          value={queryB}
                                          onChange={e => setQueryB(e.target.value)}
                                      />
                                  </div>
                                  {queryB.length > 1 && (
                                      <div className="absolute z-50 top-full mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scroll">
                                          {playersData.filter(p => p.name.toLowerCase().includes(queryB.toLowerCase())).slice(0, 8).map(p => (
                                              <div key={p.name} className="px-4 py-3 hover:bg-[#252525] cursor-pointer flex justify-between items-center border-b border-gray-800/50" onClick={() => { addPlayer(p, 'B'); setQueryB(''); }}>
                                                  <div className="flex items-center gap-3">
                                                      {p.team && p.team !== 'fa' && (
                                                          <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                                                      )}
                                                      <span className="text-sm font-bold text-white">{p.name}</span>
                                                      <span className="text-[10px] font-black bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">{p.position}</span>
                                                  </div>
                                                  <span className="text-xs font-black text-gray-400">{getPlayerValue(p, teamBStrategy)} pts</span>
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                              {formatMode === 'dynasty' && (
                                  <select 
                                      onChange={(e) => handlePickSelect(e, 'B')}
                                      className="bg-[#1a1a1a] border border-gray-800 text-gray-400 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:text-white transition-colors xl:w-40 cursor-pointer"
                                  >
                                      <option value="">+ Add Pick</option>
                                      <optgroup label="2026 Picks">
                                          {DRAFT_PICKS.filter(p => p.year === 2026).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                      </optgroup>
                                  </select>
                              )}
                          </div>
                          <div className="space-y-3 min-h-[150px]">
                              {teamBPlayers.length === 0 ? (
                                  <div className="text-center py-10 text-gray-600 font-bold text-xs uppercase tracking-widest">No assets added</div>
                              ) : teamBPlayers.map(p => (
                                  <div key={p.uniqueId} className="flex justify-between items-center bg-[#1a1a1a] border border-blue-900/20 p-4 rounded-2xl group transition-all hover:border-blue-500/50">
                                      <div className="flex items-center gap-4">
                                          <button onClick={() => removePlayer(p.uniqueId, 'B')} className="text-gray-600 hover:text-blue-500 transition-colors">
                                              <X size={18} />
                                          </button>
                                          <div className="flex items-center gap-3">
                                              {p.position === 'PICK' ? (
                                                  <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-xs font-black text-white shadow-md">{p.year.toString().slice(-2)}</div>
                                              ) : (
                                                  p.team && p.team !== 'fa' && <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-8 h-8 object-contain drop-shadow-md" onError={(e) => e.target.style.display = 'none'} />
                                              )}
                                              <div>
                                                  <div className="text-sm font-black text-white">{p.name}</div>
                                                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} {formatMode === 'dynasty' && p.age ? `• ${p.age} y/o` : ''}</div>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="text-lg font-black text-white">{getPlayerValue(p, teamBStrategy)}</div>
                                  </div>
                              ))}
                          </div>
                          <div className="mt-8 pt-4 border-t border-blue-900/30 flex justify-between items-end">
                              <div className="flex flex-col">
                                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Final Package Value</span>
                                  {bestAssetSide === 'B' && !isOneForOne && <span className="text-[10px] text-amber-500 font-bold uppercase mt-1">Includes Elite Premium (+{premium})</span>}
                              </div>
                              <span className="text-4xl font-black text-blue-500">{totalB}</span>
                          </div>
                      </div>
                  </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}