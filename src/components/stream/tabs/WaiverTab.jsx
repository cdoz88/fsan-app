"use client";
import React, { useState, useEffect } from 'react';
import { Search, X, Settings, DollarSign, RotateCcw, Info, Calendar, History, Loader2 } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NFL_COLORS = {
  ARI: { primary: '#97233F', secondary: '#000000' },
  ATL: { primary: '#A71930', secondary: '#000000' },
  BAL: { primary: '#241773', secondary: '#9E7C0C' },
  BUF: { primary: '#00338D', secondary: '#C60C30' },
  CAR: { primary: '#0085CA', secondary: '#101820' },
  CHI: { primary: '#0B162A', secondary: '#C83803' },
  CIN: { primary: '#FB4F14', secondary: '#000000' },
  CLE: { primary: '#311D00', secondary: '#FF3C00' },
  DAL: { primary: '#003594', secondary: '#041E42' },
  DEN: { primary: '#FB4F14', secondary: '#002244' },
  DET: { primary: '#0076B6', secondary: '#B0B7BC' },
  GB:  { primary: '#203731', secondary: '#FFB612' },
  HOU: { primary: '#03202F', secondary: '#A71930' },
  IND: { primary: '#002C5F', secondary: '#A2AAAD' },
  JAX: { primary: '#101820', secondary: '#D7A22A' },
  KC:  { primary: '#E31837', secondary: '#FFB81C' },
  LV:  { primary: '#000000', secondary: '#A5ACAF' },
  LAC: { primary: '#0080C6', secondary: '#FFC20E' },
  LAR: { primary: '#003594', secondary: '#FFA300' },
  MIA: { primary: '#008E97', secondary: '#FC4C02' },
  MIN: { primary: '#4F2683', secondary: '#FFC62F' },
  NE:  { primary: '#002244', secondary: '#C60C30' },
  NO:  { primary: '#D3BC8D', secondary: '#101820' },
  NYG: { primary: '#0B2265', secondary: '#A71930' },
  NYJ: { primary: '#125740', secondary: '#000000' },
  PHI: { primary: '#004C54', secondary: '#A5ACAF' },
  PIT: { primary: '#101820', secondary: '#FFB612' },
  SF:  { primary: '#AA0000', secondary: '#B3995D' },
  SEA: { primary: '#002244', secondary: '#69BE28' },
  TB:  { primary: '#D50A0A', secondary: '#FF7900' },
  TEN: { primary: '#0C2340', secondary: '#4B92DB' },
  WAS: { primary: '#5A1414', secondary: '#FFB612' },
  FA:  { primary: '#3f3f46', secondary: '#18181b' }
};

const NFL_TEAMS = Object.keys(NFL_COLORS).filter(t => t !== 'FA');
const TEAM_DSTS = NFL_TEAMS.reduce((acc, team) => {
  acc[`dst_${team}`] = {
    player_id: `dst_${team}`,
    full_name: `${team} Defense`,
    first_name: team,
    last_name: 'D/ST',
    position: 'DST',
    team: team
  };
  return acc;
}, {});

const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'DST'];
const DEFAULT_WAIVER_DATA = {
  QB: { wireId: null, cutId: null, faab: '' },
  RB: { wireId: null, cutId: null, faab: '' },
  WR: { wireId: null, cutId: null, faab: '' },
  TE: { wireId: null, cutId: null, faab: '' },
  DST: { wireId: null, cutId: null, faab: '' }
};

// --- DATA HELPERS FOR INFO MODAL ---
const formatNumber = (val, decimals = 1) => {
  if (val === null || val === undefined || val === '' || val === '-') return '-';
  const num = Number(val);
  return isNaN(num) ? '-' : num.toFixed(decimals);
};

const getFlexibleValue = (player, matchRules) => {
  if (!player) return null;
  const normalize = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
  const isValid = (val) => val !== undefined && val !== null && val !== '' && val !== '-';

  for (const rule of matchRules) {
    if (Array.isArray(rule)) continue;
    const normRule = normalize(rule);
    for (const [key, value] of Object.entries(player)) {
      if (!isValid(value)) continue;
      if (normalize(key) === normRule) return value;
    }
  }

  for (const rule of matchRules) {
    if (Array.isArray(rule)) continue;
    const normRule = normalize(rule);
    for (const [key, value] of Object.entries(player)) {
      if (!isValid(value)) continue;
      const strippedKey = normalize(key).replace(/^projected/, '').replace(/^actual/, '');
      if (strippedKey === normRule) return value;
    }
  }
  
  for (const rule of matchRules) {
    for (const [key, value] of Object.entries(player)) {
      if (!isValid(value)) continue;
      const normKey = normalize(key);
      if (Array.isArray(rule)) {
        if (rule.every(sub => normKey.includes(normalize(sub)))) return value;
      } else {
        const normRule = normalize(rule);
        if (!normRule.includes('40') && normKey.includes('40')) continue;
        if (!normRule.includes('50') && normKey.includes('50')) continue;
        if (!normRule.includes('plus') && normKey.includes('plus')) continue;
        if (normKey.includes(normRule)) return value;
      }
    }
  }
  return null;
};

const getColumnsForPosition = (pos) => {
  const baseCols = [
    { label: 'G', rules: ['Projected Games', 'Actual Games', 'Games', 'G'] },
    { label: 'FPTS', rules: ['Projected Fantasy Points', 'Actual Fantasy Points', 'Fantasy Points', 'FPTS'] },
    { label: 'PPG', rules: ['Projected PPG', 'Actual PPG', 'PPG'] }
  ];

  let specificCols = [];
  if (pos === 'QB') {
    specificCols = [
      { label: 'PASS ATT', rules: ['Projected Pass Attempts', 'Actual Pass Attempts', 'Pass Attempts'] },
      { label: 'PASS YDS', rules: ['Projected Pass Yards', 'Actual Pass Yards', 'Pass Yards'] },
      { label: 'PASS TD', rules: ['Projected Pass Td', 'Actual Pass Td', 'Pass Td'] },
      { label: 'INT', rules: ['Projected Interceptions', 'Actual Interceptions', 'Interceptions', 'INT'] },
      { label: 'RUSH YDS', rules: ['Projected Rush Yards', 'Actual Rush Yards', 'Rush Yards'] },
      { label: 'RUSH TD', rules: ['Projected Rush Td', 'Actual Rush Td', 'Rush Td'] },
    ];
  } else if (pos === 'RB') {
    specificCols = [
      { label: 'RUSH ATT', rules: ['Projected Rush Attempts', 'Actual Rush Attempts', 'Rush Attempts'] },
      { label: 'RUSH YDS', rules: ['Projected Rush Yards', 'Actual Rush Yards', 'Rush Yards'] },
      { label: 'RUSH TD', rules: ['Projected Rush Td', 'Actual Rush Td', 'Rush Td'] },
      { label: 'TGTS', rules: ['Projected Targets', 'Actual Targets', 'Targets'] },
      { label: 'REC', rules: ['Projected Receptions', 'Actual Receptions', 'Receptions'] },
      { label: 'REC YDS', rules: ['Projected Receiving Yards', 'Actual Receiving Yards', 'Receiving Yards'] },
      { label: 'REC TD', rules: ['Projected Receiving Td', 'Actual Receiving Td', 'Receiving Td'] },
    ];
  } else if (pos === 'WR' || pos === 'TE') {
    specificCols = [
      { label: 'TGTS', rules: ['Projected Targets', 'Actual Targets', 'Targets'] },
      { label: 'REC', rules: ['Projected Receptions', 'Actual Receptions', 'Receptions'] },
      { label: 'REC YDS', rules: ['Projected Receiving Yards', 'Actual Receiving Yards', 'Receiving Yards'] },
      { label: 'REC TD', rules: ['Projected Receiving Td', 'Actual Receiving Td', 'Receiving Td'] },
      { label: 'AIR YDS', rules: ['Projected Air Yards', 'Actual Air Yards', 'Air Yards'] },
      { label: 'YAC', rules: ['Projected Yac', 'Actual Yac', 'Yac', 'Yards After Catch'] },
    ];
  } else if (pos === 'K') {
    specificCols = [
      { label: 'FG ATT', rules: ['Projected FG Attempts', 'Actual FG Attempts', 'FG Attempts'] },
      { label: 'FG MADE', rules: ['Projected FGs Made', 'Actual FGs Made', 'FGs Made', 'FG Made'] },
      { label: 'XP ATT', rules: ['Projected XP Attempts', 'Actual XP Attempts', 'XP Attempts'] },
      { label: 'XP MADE', rules: ['Projected XPs Made', 'Actual XPs Made', 'XPs Made'] },
    ];
  } else if (pos === 'DST') {
    specificCols = [
      { label: 'SACKS', rules: ['Projected Sacks', 'Actual Sacks', 'Sacks'] },
      { label: 'INT', rules: ['Projected Interceptions', 'Actual Interceptions', 'Interceptions'] },
      { label: 'FUM REC', rules: ['Projected Fumbles', 'Actual Fumbles', 'Fumbles'] },
      { label: 'DEF TD', rules: ['Projected Defensive Tds', 'Actual Defensive Tds', 'Defensive Tds'] },
      { label: 'PTS ALLOW', rules: ['Projected Points Allowed', 'Actual Points Allowed', 'Points Allowed'] },
    ];
  }

  return [baseCols[0], ...specificCols, baseCols[1], baseCols[2]];
};

export default function WaiverTab() {
  const [activeWirePos, setActiveWirePos] = useState(null);
  const [activeCutPos, setActiveCutPos] = useState(null);
  const [faabRevealed, setFaabRevealed] = useState({ QB: false, RB: false, WR: false, TE: false, DST: false });
  const [waiverData, setWaiverData] = useState(DEFAULT_WAIVER_DATA);
  const [showSettings, setShowSettings] = useState(false);
  
  const [playerDB, setPlayerDB] = useState({});
  const [topPlayers, setTopPlayers] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [editingPos, setEditingPos] = useState('QB');
  const [editingType, setEditingType] = useState('wire'); // 'wire' or 'cut'

  // --- STATS MODAL STATE ---
  const [infoPlayerId, setInfoPlayerId] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [playerSchedule, setPlayerSchedule] = useState([]);
  const [omfgStats, setOmfgStats] = useState([]);
  const [omfgLoading, setOmfgLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);

  // --- FIREBASE SYNC ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stream_state', 'live'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.waiverData) setWaiverData(data.waiverData);
        if (data.waiverActiveWirePos !== undefined) setActiveWirePos(data.waiverActiveWirePos);
        if (data.waiverActiveCutPos !== undefined) setActiveCutPos(data.waiverActiveCutPos);
        if (data.waiverFaabRevealed) setFaabRevealed(data.waiverFaabRevealed);
      }
    });
    return () => unsub();
  }, []);

  const updateFirebaseWaiver = async (updates) => {
    try {
      await setDoc(doc(db, 'stream_state', 'live'), updates, { merge: true });
    } catch (err) {
      console.error("Failed to sync Waiver Wire data to Firebase:", err);
    }
  };

  // Fetch Player Database
  useEffect(() => {
    const loadPlayerDatabases = async () => {
      try {
        let customMap = {};
        try {
          const res = await fetch('/api/dynasty-players');
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.players) {
              data.players.forEach(p => { if (p.sleeper_id) customMap[String(p.sleeper_id)] = p; });
            }
          }
        } catch(e) {}

        const slpRes = await fetch('https://api.sleeper.app/v1/players/nfl');
        if (slpRes.ok) {
          const slpData = await slpRes.json();
          const mergedDB = { ...slpData };
          
          Object.keys(customMap).forEach(key => { 
             if (mergedDB[key]) {
               mergedDB[key] = { ...mergedDB[key], ...customMap[key] };
             }
          });
          
          setPlayerDB(mergedDB);
          
          const top = Object.values(mergedDB)
            .filter(p => p.active && p.team && POSITIONS.includes(p.position) && p.search_rank)
            .sort((a, b) => a.search_rank - b.search_rank)
            .slice(0, 400);
            
          setTopPlayers([...Object.values(TEAM_DSTS), ...top]);
        }
      } catch (err) {} finally {
        setDbLoading(false);
      }
    };
    
    loadPlayerDatabases();
  }, []);

  // Fetch Available OMFG Years on Mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const metaRes = await fetch(`/api/omfg-data?week=Season`).then(r => r.ok ? r.json() : null);
        if (metaRes && metaRes.available_models) {
          const seasonModels = metaRes.available_models.filter(m => m.week === 'Season');
          const years = Array.from(new Set(seasonModels.map(m => String(m.year)))).sort((a, b) => Number(b) - Number(a));
          setAvailableYears(years);
        } else {
          setAvailableYears(['2026', '2025', '2024']);
        }
      } catch(e) {
        setAvailableYears(['2026', '2025', '2024']);
      }
    };
    fetchYears();
  }, []);

  // Fetch Stats Data when a player is selected for Info
  useEffect(() => {
    if (!infoPlayerId || (!playerDB[infoPlayerId] && !TEAM_DSTS[infoPlayerId])) return;
    
    const player = playerDB[infoPlayerId] || TEAM_DSTS[infoPlayerId];
    const teamAbbr = player.team ? player.team.toLowerCase() : 'fa';

    const fetchInfoData = async () => {
      setInfoLoading(true);
      setOmfgLoading(true);
      let schedule = [];
      let statsArr = [];

      try {
        if (teamAbbr !== 'fa') {
          const schedRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamAbbr}/schedule?seasontype=2`);
          if (schedRes.ok) {
            const schedData = await schedRes.json();
            if (schedData.events) {
              schedule = schedData.events.map(evt => {
                const comp = evt.competitions?.[0];
                const weekNum = evt.week?.number || '-';
                const homeComp = comp?.competitors?.find(c => c.homeAway === 'home');
                const awayComp = comp?.competitors?.find(c => c.homeAway === 'away');
                const isHome = homeComp?.team?.abbreviation?.toLowerCase() === teamAbbr;
                const oppComp = isHome ? awayComp : homeComp;
                const oppTeam = oppComp?.team?.abbreviation || 'BYE';
                const oppLogo = oppComp?.team?.logos?.[0]?.href || `https://sleepercdn.com/images/team_logos/nfl/${oppTeam.toLowerCase()}.png`;

                const dateObj = new Date(evt.date);
                const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                return { week: weekNum, opp: oppTeam, oppLogo, isHome, date: dateStr, time: timeStr };
              });
            }
          }
        }
      } catch (err) {
        console.warn("ESPN Fetch Error:", err);
      }

      try {
        const yearsToFetch = availableYears.length > 0 ? availableYears : ['2026', '2025', '2024'];
        const fetchPromises = yearsToFetch.map(year => 
          fetch(`/api/omfg-data?year=${year}&week=Season`).then(r => r.ok ? r.json() : null)
        );
        
        const results = await Promise.all(fetchPromises);

        results.forEach((res, index) => {
          if (res && res.success && res.players) {
            const matched = res.players.find(p => {
              if (p.sleeper_id && String(p.sleeper_id) === String(infoPlayerId)) return true;
              if (p.Player && player.full_name && p.Player.toLowerCase() === player.full_name.toLowerCase()) return true;
              if (player.position === 'DST' && p.Player && p.Player.toLowerCase().includes(player.first_name.toLowerCase())) return true;
              return false;
            });

            if (matched) {
              statsArr.push({ year: yearsToFetch[index], ...matched });
            }
          }
        });
      } catch (err) {
        console.error("OMFG Fetch Error:", err);
      }

      setPlayerSchedule(schedule);
      setOmfgStats(statsArr);
      setInfoLoading(false);
      setOmfgLoading(false);
    };

    fetchInfoData();
  }, [infoPlayerId, playerDB, availableYears]);

  // Wire Toggles independently
  const handleSelectWire = (pos) => {
    const newPos = activeWirePos === pos ? null : pos;
    setActiveWirePos(newPos);
    updateFirebaseWaiver({ waiverActiveWirePos: newPos });
  };

  // Cut Toggles independently
  const handleSelectCut = (pos) => {
    const newPos = activeCutPos === pos ? null : pos;
    setActiveCutPos(newPos);
    updateFirebaseWaiver({ waiverActiveCutPos: newPos });
  };

  const handleToggleFaabReveal = (pos) => {
    const newRevealed = { ...faabRevealed, [pos]: !faabRevealed[pos] };
    setFaabRevealed(newRevealed);
    updateFirebaseWaiver({ waiverFaabRevealed: newRevealed });
  };

  const handleAssignPlayer = (playerId) => {
    const newWaiverData = {
      ...waiverData,
      [editingPos]: {
        ...waiverData[editingPos],
        [editingType === 'wire' ? 'wireId' : 'cutId']: playerId
      }
    };
    setWaiverData(newWaiverData);
    updateFirebaseWaiver({ waiverData: newWaiverData });
  };

  const handleUpdateFaab = (pos, val) => {
    const newWaiverData = {
      ...waiverData,
      [pos]: {
        ...waiverData[pos],
        faab: val
      }
    };
    setWaiverData(newWaiverData);
    updateFirebaseWaiver({ waiverData: newWaiverData });
  };

  const handleClearBoard = () => {
    setActiveWirePos(null);
    setActiveCutPos(null);
    updateFirebaseWaiver({ waiverActiveWirePos: null, waiverActiveCutPos: null });
  };

  const getESPNHeadshot = (espnId) => `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${espnId}.png&w=400&h=300`;

  const renderCard = (playerId, isWire = true) => {
    const player = playerDB[playerId] || TEAM_DSTS[playerId];
    
    const cardBorderColor = isWire ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.25)]' : 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.25)]';
    const accentTextColor = isWire ? 'text-cyan-400' : 'text-amber-500';

    if (!player) {
      return (
        <div className={`w-full max-w-md h-[280px] rounded-[24px] border-[3px] ${cardBorderColor} bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95`}>
          <div className="text-zinc-600 font-black uppercase tracking-widest text-lg mb-2">
            {isWire ? 'The Wire Pickup' : 'The Cut Line Drop'}
          </div>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider">No Player Assigned</p>
        </div>
      );
    }

    const firstName = player.first_name || '';
    const lastName = player.last_name || '';
    const position = player.position || 'UNK';
    const team = player.team ? player.team.toUpperCase() : 'FA';
    const tColors = NFL_COLORS[team] || NFL_COLORS['FA'];
    const teamLogo = team !== 'FA' ? `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png` : null;
    
    let playerImage = player.espn_id 
      ? getESPNHeadshot(player.espn_id) 
      : `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
      
    if (position === 'DST') {
      playerImage = teamLogo;
    }

    return (
      <div className={`w-full max-w-md h-[280px] rounded-[24px] border-[3px] ${cardBorderColor} bg-zinc-950 relative flex flex-col shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 group`}>
        
        {/* Background Container (Clipped to inner border) */}
        <div className="absolute inset-0 rounded-[20px] overflow-hidden z-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-90"
            style={{ background: `linear-gradient(135deg, ${tColors.primary}70 0%, ${tColors.secondary}40 50%, #0a0a0c 100%)` }}
          />
          {teamLogo && position !== 'DST' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.15]">
              <img src={teamLogo} className="w-[140%] max-w-none h-auto object-contain mix-blend-screen" alt="" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>

        {/* Top Badges Header */}
        <div className="absolute top-4 left-4 z-30 pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest bg-black/90 text-white border border-zinc-700/50 shadow-md">
            {position}
          </span>
        </div>
        <div className="absolute top-4 right-4 z-30 pointer-events-none">
          <span className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-black/90 text-zinc-300 border border-zinc-700/50 shadow-md">
            {team} {player.number ? `• #${player.number}` : ''}
          </span>
        </div>

        {position === 'DST' ? (
          <div className="absolute inset-x-0 bottom-0 h-[100%] rounded-b-[20px] overflow-hidden z-10 flex items-center justify-center pointer-events-none p-12 opacity-80">
            <img 
              src={playerImage} 
              alt={lastName}
              className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
            />
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 h-[140%] rounded-b-[20px] overflow-hidden z-10 flex items-end justify-center pointer-events-none">
            <img 
              src={playerImage} 
              alt={lastName}
              className="w-auto h-[95%] object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] filter contrast-110 brightness-105 origin-bottom"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Bottom Black Fade */}
        <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none rounded-b-[20px]" />

        {/* Bottom Name Labels */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center justify-end text-center w-full pb-5 pointer-events-none">
          <span className={`${accentTextColor} font-black uppercase text-[11px] tracking-[0.2em] drop-shadow-md mb-0.5`}>
            {firstName}
          </span>
          <span className="text-white font-black uppercase text-[34px] tracking-tight leading-none drop-shadow-lg">
            {lastName}
          </span>
        </div>

        {/* Info Icon Button (Bottom Right) */}
        <button 
          onClick={(e) => { e.stopPropagation(); setInfoPlayerId(playerId); }}
          className="absolute bottom-5 right-5 z-40 p-2 bg-zinc-900/80 hover:bg-[#1b75bb] text-zinc-400 hover:text-white rounded-full border border-zinc-700/50 backdrop-blur-md transition-colors shadow-lg cursor-pointer"
          title="Player Info & Stats"
        >
          <Info size={16} />
        </button>

      </div>
    );
  };

  const wirePlayer = activeWirePos ? waiverData[activeWirePos]?.wireId : null;
  const cutPlayer = activeCutPos ? waiverData[activeCutPos]?.cutId : null;
  const currentFaabValue = activeWirePos ? waiverData[activeWirePos]?.faab : null;
  const isRevealed = activeWirePos ? faabRevealed[activeWirePos] : false;

  // Variables for Stats Modal
  const selectedInfoPlayer = infoPlayerId ? (playerDB[infoPlayerId] || TEAM_DSTS[infoPlayerId]) : null;
  const projYear = availableYears.length > 0 ? availableYears[0] : '2026';
  const projStats = omfgStats.find(s => s.year === projYear);
  const omfgScoreRaw = projStats ? getFlexibleValue(projStats, ['OMFG Score', 'OMFG']) : null;
  const omfgScore = omfgScoreRaw ? Number(omfgScoreRaw).toFixed(1) : null;

  return (
    <div className="h-full w-full bg-[#0a0a0c] flex flex-col justify-between p-6 relative overflow-hidden font-sans select-none">
      
      {/* Super Discreet Settings / Setup Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-4 right-4 z-50 text-zinc-800 hover:text-zinc-600 p-2 transition-colors"
        title="Setup Waiver Wire"
      >
        <Settings size={20} />
      </button>

      {/* TOP LINE: THE WIRE */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between relative py-4 px-8 z-10">
        <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-[2px] bg-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.8)] z-0" />
        
        {POSITIONS.map(pos => {
          const isActive = activeWirePos === pos;
          return (
            <button
              key={`wire-${pos}`}
              onClick={() => handleSelectWire(pos)}
              className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center font-black text-sm uppercase tracking-widest transition-all ${
                isActive 
                  ? 'bg-black border-[3px] border-emerald-500 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-125' 
                  : 'bg-[#141418] border-2 border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {pos}
            </button>
          );
        })}
      </div>

      {/* CENTER STAGE: STAGE SPLIT */}
      <div className="flex-1 flex items-center justify-center w-full max-w-5xl mx-auto gap-8 relative z-10 pt-12 pb-4">
        
        {/* LEFT SIDE: THE WIRE (PICKUP) */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 h-full">
          {activeWirePos ? renderCard(wirePlayer, true) : <div className="w-full max-w-md h-[280px]" />}

          {/* FAAB REVEAL BOX */}
          {activeWirePos ? (
            <button
              onClick={() => handleToggleFaabReveal(activeWirePos)}
              className={`px-10 py-3 rounded-2xl border-2 font-black uppercase tracking-widest text-lg transition-all shadow-xl active:scale-95 animate-in fade-in duration-300 ${
                isRevealed && currentFaabValue
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-emerald-500/50 hover:text-white'
              }`}
            >
              {isRevealed && currentFaabValue ? `FAAB: ${currentFaabValue}` : 'FAAB'}
            </button>
          ) : (
            <div className="h-[52px]" /> /* Spacer to maintain layout when button is hidden */
          )}
        </div>

        {/* CENTER DIVIDER WITH CLEAR BUTTON */}
        <div className="flex flex-col items-center justify-center relative w-12 shrink-0">
          <div className="w-px h-[100px] bg-gradient-to-b from-transparent to-zinc-800 shrink-0" />
          
          <button 
            onClick={handleClearBoard}
            className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center my-4 group transition-colors hover:bg-zinc-900 hover:border-red-900/50"
            title="Clear Board"
          >
            <RotateCcw size={16} className="text-zinc-800 group-hover:text-red-500/70 transition-colors" />
          </button>
          
          <div className="w-px h-[100px] bg-gradient-to-t from-transparent to-zinc-800 shrink-0" />
        </div>

        {/* RIGHT SIDE: THE CUT LINE (DROP) */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 h-full">
          {activeCutPos ? renderCard(cutPlayer, false) : <div className="w-full max-w-md h-[280px]" />}
          
          {/* Spacer to align vertically with FAAB box */}
          <div className="h-[52px]" />
        </div>

      </div>

      {/* BOTTOM LINE: THE CUT LINE */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between relative py-4 px-8 z-10">
        <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-[2px] border-b-2 border-dashed border-red-600/60 shadow-[0_0_12px_rgba(220,38,38,0.8)] z-0" />
        
        {POSITIONS.map(pos => {
          const isActive = activeCutPos === pos;
          return (
            <button
              key={`cut-${pos}`}
              onClick={() => handleSelectCut(pos)}
              className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center font-black text-sm uppercase tracking-widest transition-all ${
                isActive 
                  ? 'bg-black border-[3px] border-red-600 text-red-500 shadow-[0_0_25px_rgba(220,38,38,0.5)] scale-125' 
                  : 'bg-[#141418] border-2 border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {pos}
            </button>
          );
        })}
      </div>

      {/* SLEEPER + ESPN INFO & STATS MODAL */}
      {selectedInfoPlayer && (
        <div 
          onClick={() => setInfoPlayerId(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 w-full max-w-4xl shadow-2xl space-y-4 max-h-[85vh] flex flex-col overflow-hidden relative"
          >
            <button 
              onClick={() => setInfoPlayerId(null)} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10 bg-black/50 p-1.5 rounded-lg border border-zinc-800"
              title="Close"
            >
              <X size={18} />
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 pt-2">
              
              {/* Player Condensed Bio Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-black/60 p-4 rounded-xl border border-zinc-800 shrink-0 gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {selectedInfoPlayer.position === 'DST' ? (
                    <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-700 shrink-0 flex items-center justify-center p-2">
                       <img 
                        src={`https://sleepercdn.com/images/team_logos/nfl/${selectedInfoPlayer.team.toLowerCase()}.png`} 
                        alt={selectedInfoPlayer.full_name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <img 
                      src={selectedInfoPlayer.espn_id ? getESPNHeadshot(selectedInfoPlayer.espn_id) : `https://sleepercdn.com/content/nfl/players/thumb/${selectedInfoPlayer.player_id}.jpg`} 
                      alt={selectedInfoPlayer.full_name} 
                      className="w-16 h-16 object-cover rounded-xl bg-zinc-900 border border-zinc-700 shrink-0"
                      onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-2xl font-black text-white uppercase leading-none truncate pr-8 sm:pr-0">{selectedInfoPlayer.full_name}</div>
                    <div className="text-xs font-bold text-[#1b75bb] uppercase tracking-wider mt-1">
                      {selectedInfoPlayer.position} • {selectedInfoPlayer.team || 'Free Agent'} {selectedInfoPlayer.number ? `• #${selectedInfoPlayer.number}` : ''}
                    </div>
                  </div>
                  
                  {omfgScore && (
                    <div className="flex flex-col items-center sm:items-end ml-4 pl-4 border-l border-zinc-700/50 hidden sm:flex">
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">OMFG Score</span>
                      <span className="text-xl font-black text-red-500">{omfgScore}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end bg-zinc-900/50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:mr-8 border border-zinc-800 sm:border-0">
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Age</span>
                    <span className="text-sm font-bold text-white">{selectedInfoPlayer.age || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Exp</span>
                    <span className="text-sm font-bold text-white">{selectedInfoPlayer.years_exp ? `${selectedInfoPlayer.years_exp} Yrs` : 'Rookie'}</span>
                  </div>
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">College</span>
                    <span className="text-sm font-bold text-zinc-300 truncate max-w-[120px]">{selectedInfoPlayer.college || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Status</span>
                    <span className="text-sm font-bold text-emerald-400 uppercase">{selectedInfoPlayer.status || 'Active'}</span>
                  </div>
                </div>
              </div>

              {/* 2026 SCHEDULE TABLE */}
              <div className="bg-black/40 p-3.5 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Calendar size={13} className="text-[#1b75bb]" /> 2026 Team Schedule</span>
                  {infoLoading && <Loader2 size={12} className="animate-spin text-zinc-500" />}
                </div>
                {infoLoading ? (
                  <div className="flex items-center justify-center py-6 text-xs text-zinc-500 font-bold uppercase tracking-widest gap-2">
                    <Loader2 size={16} className="animate-spin text-[#1b75bb]" /> Fetching Schedule...
                  </div>
                ) : playerSchedule.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-black/60 max-h-56 custom-scrollbar relative">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-zinc-900 text-[10px] text-zinc-400 font-black uppercase border-b border-zinc-800 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="p-2.5">WK</th>
                          <th className="p-2.5">OPP</th>
                          <th className="p-2.5 text-right">DATE</th>
                          <th className="p-2.5 text-right">TIME</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-bold text-white">
                        {playerSchedule.map((game, idx) => (
                          <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="p-2.5 text-zinc-400">{game.week}</td>
                            <td className="p-2.5 flex items-center gap-2">
                              <span className="text-zinc-500 text-[10px]">{game.isHome ? 'VS' : '@'}</span>
                              <img src={game.oppLogo} alt="" className="w-5 h-5 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                              {game.opp}
                            </td>
                            <td className="p-2.5 text-right text-zinc-300">{game.date}</td>
                            <td className="p-2.5 text-right text-zinc-500">{game.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-zinc-500 font-bold">Schedule unavailable for Free Agents.</div>
                )}
              </div>

              {/* CAREER SEASON TOTALS TABLE */}
              <div className="bg-black/40 p-3.5 rounded-xl border border-zinc-800 mb-2">
                <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-1.5 mb-3 shrink-0">
                  <History size={13} className="text-[#1b75bb]" /> Season OMFG Projections & Historicals
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-black/60 max-h-48 custom-scrollbar relative">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-zinc-900 text-[10px] text-zinc-400 font-black uppercase border-b border-zinc-800 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-2.5">YEAR</th>
                        <th className="p-2.5">TEAM</th>
                        {selectedInfoPlayer && getColumnsForPosition(selectedInfoPlayer.position).map((col, i) => (
                          <th key={i} className="p-2.5 text-center">{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-bold text-white">
                      {omfgLoading ? (
                        <tr>
                          <td colSpan={12} className="p-6 text-center text-zinc-500">
                            <Loader2 size={16} className="animate-spin inline-block mr-2" /> Fetching OMFG Stats...
                          </td>
                        </tr>
                      ) : omfgStats.length > 0 ? (
                        omfgStats.map((statYear, i) => {
                          const cols = getColumnsForPosition(selectedInfoPlayer.position);
                          return (
                            <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                              <td className="p-2.5 text-zinc-400">
                                {statYear.year} {statYear.year === '2026' ? <span className="text-emerald-500 text-[9px] ml-1">(PROJ)</span> : ''}
                              </td>
                              <td className="p-2.5">{statYear.Team || selectedInfoPlayer.team || '-'}</td>
                              {cols.map((col, j) => {
                                const val = getFlexibleValue(statYear, col.rules);
                                const isFptsOrPpg = col.label === 'FPTS' || col.label === 'PPG';
                                return (
                                  <td key={j} className={`p-2.5 text-center ${isFptsOrPpg ? 'text-[#1b75bb]' : 'text-zinc-300'}`}>
                                    {col.label === 'G' ? formatNumber(val, 0) : formatNumber(val)}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={12} className="p-4 text-center text-zinc-500 font-normal">OMFG Data currently unavailable for this player.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SETUP / CONTROL MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl p-6 w-full max-w-5xl shadow-2xl space-y-6 max-h-[90vh] flex flex-col overflow-hidden relative">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 shrink-0">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Waiver Wire Setup</h2>
              <button onClick={() => setShowSettings(false)} className="bg-zinc-800 p-2 rounded-full text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
              
              {/* Left Column: Position Grid & FAAB Inputs */}
              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
                {POSITIONS.map(pos => {
                  const data = waiverData[pos] || { wireId: null, cutId: null, faab: '' };
                  const wireP = playerDB[data.wireId] || TEAM_DSTS[data.wireId];
                  const cutP = playerDB[data.cutId] || TEAM_DSTS[data.cutId];

                  return (
                    <div key={`cfg-${pos}`} className="bg-black/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-amber-500 uppercase tracking-widest">{pos}</span>
                        
                        <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800">
                          <DollarSign size={12} className="text-emerald-500" />
                          <input 
                            type="text" 
                            value={data.faab}
                            onChange={(e) => handleUpdateFaab(pos, e.target.value)}
                            placeholder="FAAB ($ or %)"
                            className="w-24 bg-transparent text-xs font-bold text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Wire Target Selector Button */}
                      <button 
                        onClick={() => { setEditingPos(pos); setEditingType('wire'); setPosFilter(pos); }}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                          editingPos === pos && editingType === 'wire' 
                            ? 'bg-emerald-950/60 border-emerald-500 text-white' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-xs font-bold truncate">
                          Wire Add: <strong className="text-emerald-400">{wireP ? wireP.full_name : 'Click to Assign'}</strong>
                        </span>
                        {wireP && <span className="text-[10px] font-black text-zinc-500">{wireP.team}</span>}
                      </button>

                      {/* Cut Line Selector Button */}
                      <button 
                        onClick={() => { setEditingPos(pos); setEditingType('cut'); setPosFilter(pos); }}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                          editingPos === pos && editingType === 'cut' 
                            ? 'bg-red-950/60 border-red-500 text-white' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-xs font-bold truncate">
                          Cut Drop: <strong className="text-red-400">{cutP ? cutP.full_name : 'Click to Assign'}</strong>
                        </span>
                        {cutP && <span className="text-[10px] font-black text-zinc-500">{cutP.team}</span>}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Right Columns: Player Pool Search */}
              <div className="lg:col-span-2 bg-black/80 border border-zinc-800 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    Assigning <strong className={editingType === 'wire' ? 'text-emerald-400' : 'text-red-400'}>{editingPos} {editingType === 'wire' ? 'Wire Add' : 'Cut Drop'}</strong>
                  </span>
                  
                  <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                    {['ALL', 'QB', 'RB', 'WR', 'TE', 'DST'].map(pos => (
                      <button 
                        key={`flt-${pos}`} 
                        onClick={() => setPosFilter(pos)} 
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-colors ${posFilter === pos ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative mb-4 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Search player database..." 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1b75bb]" 
                  />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dbLoading ? (
                    <div className="col-span-full text-center py-12 text-zinc-500 font-bold uppercase text-xs">Loading Databases...</div>
                  ) : (
                    topPlayers
                      .filter(p => posFilter === 'ALL' || p.position === posFilter)
                      .filter(p => !searchTerm || p.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(player => {
                        const isWireSelected = waiverData[editingPos]?.wireId === player.player_id;
                        const isCutSelected = waiverData[editingPos]?.cutId === player.player_id;

                        return (
                          <div 
                            key={`pool-${player.player_id}`} 
                            onClick={() => handleAssignPlayer(player.player_id)} 
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all ${
                              isWireSelected ? 'bg-emerald-950/60 border-emerald-500' : isCutSelected ? 'bg-red-950/60 border-red-500' : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <img 
                              src={player.position === 'DST' ? `https://sleepercdn.com/images/team_logos/nfl/${player.team.toLowerCase()}.png` : (player.espn_id ? getESPNHeadshot(player.espn_id) : `https://sleepercdn.com/content/nfl/players/thumb/${player.player_id}.jpg`)} 
                              alt="" 
                              className={`w-8 h-8 rounded-lg ${player.position === 'DST' ? 'object-contain p-0.5' : 'object-cover'} bg-black shrink-0`} 
                              onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-white truncate">{player.full_name}</div>
                              <div className="text-[10px] font-black uppercase text-zinc-500">{player.position} • {player.team}</div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}