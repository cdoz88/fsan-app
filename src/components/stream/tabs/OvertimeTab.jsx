"use client";
import React, { useState, useEffect } from 'react';
import { MessageSquare, Settings, X, Image as ImageIcon, MessageCircle, RefreshCw, Info, Search, User, RotateCcw, Calendar, History, Loader2, Plus, Play, Pause, Zap, Beaker } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
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

const DRAFT_PICKS = [
  { player_id: 'pick_2025_1', full_name: '2025 1st Round Pick', position: 'PICK', team: 'DRAFT', year: '2025', round: '1st' },
  { player_id: 'pick_2025_2', full_name: '2025 2nd Round Pick', position: 'PICK', team: 'DRAFT', year: '2025', round: '2nd' },
  { player_id: 'pick_2025_3', full_name: '2025 3rd Round Pick', position: 'PICK', team: 'DRAFT', year: '2025', round: '3rd' },
  { player_id: 'pick_2026_1', full_name: '2026 1st Round Pick', position: 'PICK', team: 'DRAFT', year: '2026', round: '1st' },
  { player_id: 'pick_2026_2', full_name: '2026 2nd Round Pick', position: 'PICK', team: 'DRAFT', year: '2026', round: '2nd' },
  { player_id: 'pick_2026_3', full_name: '2026 3rd Round Pick', position: 'PICK', team: 'DRAFT', year: '2026', round: '3rd' },
  { player_id: 'pick_2027_1', full_name: '2027 1st Round Pick', position: 'PICK', team: 'DRAFT', year: '2027', round: '1st' },
  { player_id: 'pick_2027_2', full_name: '2027 2nd Round Pick', position: 'PICK', team: 'DRAFT', year: '2027', round: '2nd' },
  { player_id: 'pick_2027_3', full_name: '2027 3rd Round Pick', position: 'PICK', team: 'DRAFT', year: '2027', round: '3rd' },
  { player_id: 'pick_2028_1', full_name: '2028 1st Round Pick', position: 'PICK', team: 'DRAFT', year: '2028', round: '1st' },
  { player_id: 'pick_2028_2', full_name: '2028 2nd Round Pick', position: 'PICK', team: 'DRAFT', year: '2028', round: '2nd' },
  { player_id: 'pick_2028_3', full_name: '2028 3rd Round Pick', position: 'PICK', team: 'DRAFT', year: '2028', round: '3rd' }
];

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

const MOCK_TEST_CHATS = [
  {
    id: 'mock_1',
    user: 'FantasyGuru99',
    avatar: 'https://placehold.co/100x100/1b75bb/white?text=FG',
    text: 'Are we starting Josh Allen this week even in the snow?',
    type: 'chat',
    amount: null,
    color: null,
    sideA: [],
    sideB: []
  },
  {
    id: 'mock_2',
    user: 'DynastyDan',
    avatar: 'https://placehold.co/100x100/10b981/white?text=DD',
    text: 'Need trade help ASAP! Giving away my first rounder for a haul.',
    type: 'trade',
    amount: '$10.00',
    color: 'bg-yellow-500 border-yellow-300 text-black',
    sideA: ['pick_2025_1'],
    sideB: ['pick_2026_1', 'pick_2026_2']
  },
  {
    id: 'mock_3',
    user: 'KyleFanBoy',
    avatar: 'https://placehold.co/100x100/f59e0b/white?text=KF',
    text: 'Kyle is always right. Corey, your takes are wild today.',
    type: 'chat',
    amount: '$2.00',
    color: 'bg-cyan-500 border-cyan-300 text-black',
    sideA: [],
    sideB: []
  },
  {
    id: 'mock_4',
    user: 'SleeperSavant',
    avatar: 'https://placehold.co/100x100/ef4444/white?text=SS',
    text: 'Who wins this trade? I am contending this year.',
    type: 'trade',
    amount: '$50.00',
    color: 'bg-red-600 border-red-400 text-white',
    sideA: ['pick_2025_1'],
    sideB: ['pick_2025_2', 'pick_2026_3']
  },
  {
    id: 'mock_5',
    user: 'GridironGeek',
    avatar: 'https://placehold.co/100x100/8b5cf6/white?text=GG',
    text: 'This dashboard looks amazing guys! What happens if I send a really long chat message that spans multiple lines to test how the text wrapping works on the screen?',
    type: 'chat',
    amount: null,
    color: null,
    sideA: [],
    sideB: []
  }
];

// --- DATA HELPERS ---
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

const formatChatForFirebase = (chat) => {
  if (!chat) return null;
  return {
    id: chat.id || null,
    user: chat.user || "",
    avatar: chat.avatar || "",
    text: chat.text || "",
    type: chat.type || "chat",
    amount: chat.amount || null,  
    color: chat.color || null,    
    sideA: chat.sideA || [],
    sideB: chat.sideB || []
  };
};

export default function OvertimeTab({
  streamUrl,
  setStreamUrl,
  isConnected,
  setIsConnected,
  connectionStatus,
  allChats,
  playerDB,
  updateFirebaseState
}) {
  // --- OVERTIME COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [targetEndTime, setTargetEndTime] = useState(null);

  // --- Q&A STATE ---
  const [activeChat, setActiveChat] = useState(null);
  const [showGraphic, setShowGraphic] = useState(false);
  const [customPlayerLists, setCustomPlayerLists] = useState(null);
  const [disabledPlayers, setDisabledPlayers] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [playerSearch, setPlayerSearch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [infoPlayerId, setInfoPlayerId] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [playerSchedule, setPlayerSchedule] = useState([]);
  const [omfgStats, setOmfgStats] = useState([]);
  const [omfgLoading, setOmfgLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);

  // Filter out the live chat to only grab Super Chats!
  const superChats = allChats.filter(chat => chat.amount);

  // --- FIREBASE COLLABORATION LISTENER ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stream_state', 'live'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Q&A Sync
        if (data.ot_activeChat !== undefined) setActiveChat(data.ot_activeChat);
        if (data.ot_showGraphic !== undefined) setShowGraphic(data.ot_showGraphic);
        if (data.ot_customPlayerLists !== undefined) setCustomPlayerLists(data.ot_customPlayerLists);
        if (data.ot_disabledPlayers !== undefined) setDisabledPlayers(data.ot_disabledPlayers);

        // Countdown Sync
        if (data.ot_isClockRunning !== undefined) setIsClockRunning(data.ot_isClockRunning);
        if (data.ot_targetEndTime !== undefined) setTargetEndTime(data.ot_targetEndTime);
        if (data.ot_timeLeft !== undefined && !data.ot_isClockRunning) {
          setTimeLeft(data.ot_timeLeft);
        }
      }
    });
    return () => unsub();
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

  // --- LOCAL COUNTDOWN LOGIC ---
  useEffect(() => {
    let interval;
    if (isClockRunning && targetEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((targetEndTime - now) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          setIsClockRunning(false);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isClockRunning, targetEndTime]);

  // ESPN Stats Fetcher
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

  // Manual Clock Controls
  const handleToggleClock = () => {
    if (isClockRunning) {
      updateFirebaseState({ ot_isClockRunning: false, ot_timeLeft: timeLeft });
    } else {
      updateFirebaseState({ ot_isClockRunning: true, ot_targetEndTime: Date.now() + (timeLeft * 1000) });
    }
  };

  const handleResetClock = () => {
    updateFirebaseState({ ot_isClockRunning: true, ot_timeLeft: 120, ot_targetEndTime: Date.now() + 120000 });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- AUTOMATED CLOCK LOGIC (When chat is pushed to screen) ---
  const handleSelectDisplay = (chatItem, isGraphic) => {
    setActiveChat(chatItem);
    setShowGraphic(isGraphic);
    setCustomPlayerLists(null);
    setDisabledPlayers({});
    
    // AUTOMATION: Pause the clock and reset it to 2:00 because we are actively answering
    updateFirebaseState({
      ot_activeChat: chatItem,
      ot_showGraphic: isGraphic,
      ot_customPlayerLists: null,
      ot_disabledPlayers: {},
      ot_isClockRunning: false,
      ot_timeLeft: 120
    });
  };

  // --- AUTOMATED CLOCK LOGIC (When screen is cleared) ---
  const handleClearScreen = () => {
    setActiveChat(null);
    setShowGraphic(false);
    setCustomPlayerLists(null);
    setDisabledPlayers({});
    
    // AUTOMATION: The screen is empty, so immediately start the 2:00 Sudden Death countdown!
    updateFirebaseState({
      ot_activeChat: null,
      ot_showGraphic: false,
      ot_customPlayerLists: null,
      ot_disabledPlayers: {},
      ot_isClockRunning: true,
      ot_timeLeft: 120,
      ot_targetEndTime: Date.now() + 120000
    });
  };

  const handleResetGraphic = () => {
    setCustomPlayerLists(null);
    setDisabledPlayers({});
    updateFirebaseState({ ot_customPlayerLists: null, ot_disabledPlayers: {} });
  };

  const togglePlayerDisabled = (playerId, e) => {
    if (e) e.stopPropagation();
    const newState = { ...disabledPlayers, [playerId]: !disabledPlayers[playerId] };
    setDisabledPlayers(newState);
    updateFirebaseState({ ot_disabledPlayers: newState });
  };

  const handlePlayerSelect = (newPlayerId) => {
    if (!playerSearch || !activeChat) return;

    const { type, side, oldPlayerId } = playerSearch;
    const currentSideA = customPlayerLists ? customPlayerLists.sideA : (activeChat.sideA || []);
    const currentSideB = customPlayerLists ? customPlayerLists.sideB : (activeChat.sideB || []);

    let newLists = {};

    if (type === 'swap') {
      if (side === 'sideA') {
        newLists = { sideA: currentSideA.map(id => id === oldPlayerId ? newPlayerId : id), sideB: currentSideB };
      } else {
        newLists = { sideA: currentSideA, sideB: currentSideB.map(id => id === oldPlayerId ? newPlayerId : id) };
      }
    } else if (type === 'add') {
      if (side === 'sideA') {
        newLists = { sideA: [...currentSideA, newPlayerId], sideB: currentSideB };
      } else {
        newLists = { sideA: currentSideA, sideB: [...currentSideB, newPlayerId] };
      }
    }

    setCustomPlayerLists(newLists);
    setPlayerSearch(null);
    setSearchQuery('');
    updateFirebaseState({ ot_customPlayerLists: newLists });
  };

  const handleInjectMockData = () => {
    const mockSupers = MOCK_TEST_CHATS.filter(c => c.amount);
    updateFirebaseState({
      qa_allChats: MOCK_TEST_CHATS,
      qa_priorityQueue: mockSupers
    });
    setShowSettings(false);
  };

  const handleClearMockData = () => {
    updateFirebaseState({
      qa_allChats: [],
      qa_priorityQueue: [],
      ot_activeChat: null
    });
  };

  const getESPNHeadshot = (espnId) => `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${espnId}.png&w=350&h=254`;

  const getCardStyle = (position) => {
    switch (position) {
      case 'QB': return { border: 'border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]', text: 'text-cyan-400' };
      case 'RB': return { border: 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)]', text: 'text-emerald-500' };
      case 'WR': return { border: 'border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]', text: 'text-amber-500' };
      case 'TE': return { border: 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.25)]', text: 'text-red-500' };
      case 'DST': return { border: 'border-slate-400/80 shadow-[0_0_15px_rgba(148,163,184,0.25)]', text: 'text-slate-300' };
      default:   return { border: 'border-zinc-500/80 shadow-[0_0_15px_rgba(113,113,122,0.25)]', text: 'text-zinc-400' };
    }
  };

  const renderDNOLandscapeCard = (playerId, side = 'sideA') => {
    if (playerId.startsWith('pick_')) {
      const pickData = DRAFT_PICKS.find(p => p.player_id === playerId) || { year: 'Unknown', round: 'Pick' };
      const isGrayedOut = !!disabledPlayers[playerId];
      const cardStyle = { border: 'border-yellow-500/80 shadow-[0_0_15px_rgba(234,179,8,0.25)]', text: 'text-yellow-500' };

      return (
        <div key={playerId} className={`relative h-[135px] w-[210px] flex flex-col justify-center items-center shadow-2xl rounded-[18px] overflow-hidden border-2 transition-all duration-300 shrink-0 animate-in zoom-in-95 group ${isGrayedOut ? 'border-red-600/80 opacity-35 grayscale' : `${cardStyle.border}`}`} style={{ background: `linear-gradient(180deg, #27272a 0%, #000000 100%)` }}>
          {isGrayedOut && (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none animate-in fade-in duration-200">
              <div className="bg-red-600 text-white rounded-full p-2.5 shadow-2xl border-2 border-white/90"><X size={32} strokeWidth={3.5} /></div>
            </div>
          )}

          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2">
            <button onClick={(e) => togglePlayerDisabled(playerId, e)} className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg transition-transform hover:scale-110 flex items-center justify-center"><X size={18} strokeWidth={3} /></button>
            <button onClick={(e) => { e.stopPropagation(); setPlayerSearch({ type: 'swap', oldPlayerId: playerId, side }); }} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 rounded-xl shadow-lg transition-transform hover:scale-110 flex items-center justify-center"><RefreshCw size={18} /></button>
          </div>

          <div className="absolute top-2 left-2 z-20"><span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black tracking-widest text-zinc-200 border border-zinc-700/50 shadow-md uppercase">PICK</span></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-5xl font-black text-white/5 absolute top-2">{pickData.year}</span>
            <div className="z-10 flex flex-col items-center mt-3">
              <span className="text-3xl font-black text-yellow-500 uppercase leading-none drop-shadow-md">{pickData.round}</span>
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest mt-1">Round Pick</span>
            </div>
          </div>
        </div>
      );
    }

    const dbPlayer = playerDB[playerId] || TEAM_DSTS[playerId];
    if (!dbPlayer) return null;

    const firstName = dbPlayer.first_name || "";
    const lastName = dbPlayer.last_name || "Player";
    const position = dbPlayer.position || "UNK";
    const team = dbPlayer.team ? dbPlayer.team.toUpperCase() : "FA";
    const isGrayedOut = !!disabledPlayers[playerId];
    const cardStyle = getCardStyle(position);
    const tColors = NFL_COLORS[team] || NFL_COLORS['FA'];
    
    const teamLogo = team !== 'FA' ? `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png` : null;
    let playerImage = dbPlayer?.espn_id ? getESPNHeadshot(dbPlayer.espn_id) : `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;

    if (position === 'DST') {
      playerImage = teamLogo;
    }

    return (
      <div key={playerId} className={`relative h-[135px] w-[210px] flex flex-col justify-end shadow-2xl rounded-[18px] overflow-hidden border-2 transition-all duration-300 shrink-0 animate-in zoom-in-95 group ${isGrayedOut ? 'border-red-600/80 opacity-35 grayscale' : `${cardStyle.border}`}`} style={{ background: `linear-gradient(180deg, ${tColors.primary}90 0%, ${tColors.secondary}95 65%, #000000 100%)` }}>
        {isGrayedOut && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none animate-in fade-in duration-200">
            <div className="bg-red-600 text-white rounded-full p-2.5 shadow-2xl border-2 border-white/90"><X size={32} strokeWidth={3.5} /></div>
          </div>
        )}

        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2">
          <button onClick={(e) => togglePlayerDisabled(playerId, e)} className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg transition-transform hover:scale-110 flex items-center justify-center"><X size={18} strokeWidth={3} /></button>
          <button onClick={(e) => { e.stopPropagation(); setInfoPlayerId(playerId); }} className="p-2.5 bg-[#1b75bb] hover:bg-[#155e96] text-white rounded-xl shadow-lg transition-transform hover:scale-110 flex items-center justify-center"><Info size={18} /></button>
          <button onClick={(e) => { e.stopPropagation(); setPlayerSearch({ type: 'swap', oldPlayerId: playerId, side }); }} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 rounded-xl shadow-lg transition-transform hover:scale-110 flex items-center justify-center"><RefreshCw size={18} /></button>
        </div>

        {teamLogo && position !== 'DST' && (
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.25] pointer-events-none">
            <img src={teamLogo} className="w-[140%] max-w-none h-auto object-contain mix-blend-screen" alt="" />
          </div>
        )}

        <div className="absolute top-2 left-2 z-20"><span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black tracking-widest text-zinc-200 border border-zinc-700/50 shadow-md uppercase">{position}</span></div>
        <div className="absolute top-2 right-2 z-20"><span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black tracking-widest text-zinc-200 border border-zinc-700/50 shadow-md uppercase">{team}</span></div>

        {position === 'DST' ? (
          <div className="absolute inset-x-0 top-0 bottom-3 flex items-center justify-center z-10 pointer-events-none overflow-hidden p-6 opacity-60">
            <img 
              src={playerImage} 
              className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]" 
              alt={lastName}
            />
          </div>
        ) : (
          <div className="absolute inset-x-0 top-0 bottom-3 flex items-center justify-center z-10 pointer-events-none overflow-hidden">
            <img 
              src={playerImage} 
              className="w-full h-auto object-cover object-top scale-150 -translate-y-1 drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)] filter contrast-110 brightness-110" 
              alt={lastName}
              onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
            />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black via-black/85 to-transparent z-20 pointer-events-none" />

        <div className="relative z-20 px-2 pb-2 pt-1 text-center pointer-events-none w-full truncate">
          <div className={`text-[10px] font-bold tracking-widest uppercase leading-none ${cardStyle.text} drop-shadow-md mb-0.5`}>{firstName}</div>
          <div className="text-xl font-black text-white tracking-tight truncate w-full drop-shadow-lg leading-none uppercase">{lastName}</div>
        </div>
      </div>
    );
  };

  const renderAddPlayerButton = (side) => (
    <button 
      onClick={() => setPlayerSearch({ type: 'add', side })}
      className="h-[34px] px-6 mt-1 flex items-center justify-center border-2 border-dashed border-zinc-700/60 hover:border-[#1b75bb] hover:bg-[#1b75bb]/10 rounded-full transition-all group shrink-0 animate-in fade-in"
      title="Add Player"
    >
      <Plus size={16} className="text-zinc-500 group-hover:text-[#1b75bb] transition-colors" />
    </button>
  );

  const searchResults = searchQuery.trim().length > 1
    ? [
        ...DRAFT_PICKS.filter(p => p.full_name.toLowerCase().includes(searchQuery.toLowerCase())),
        ...Object.values(TEAM_DSTS).filter(p => p.full_name.toLowerCase().includes(searchQuery.toLowerCase())),
        ...Object.values(playerDB).filter(p => p.full_name && p.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
      ].slice(0, 8)
    : [];

  const selectedInfoPlayer = infoPlayerId ? (playerDB[infoPlayerId] || TEAM_DSTS[infoPlayerId]) : null;
  const currentSideA = customPlayerLists ? customPlayerLists.sideA : (activeChat?.sideA || []);
  const currentSideB = customPlayerLists ? customPlayerLists.sideB : (activeChat?.sideB || []);

  const projYear = availableYears.length > 0 ? availableYears[0] : '2026';
  const projStats = omfgStats.find(s => s.year === projYear);
  const omfgScoreRaw = projStats ? getFlexibleValue(projStats, ['OMFG Score', 'OMFG']) : null;
  const omfgScore = omfgScoreRaw ? Number(omfgScoreRaw).toFixed(1) : null;

  return (
    <div className="flex h-full w-full gap-4 p-4 overflow-hidden relative min-h-0">
      
      {/* 1. LEFT SIDE: Main Broadcast Stage */}
      <div className="flex-1 bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col min-h-0">
        
        {/* OVERTIME COUNTDOWN HEADER */}
        <div className="p-3 px-5 border-b border-zinc-800/80 bg-[#141418] flex justify-between items-center z-10 shadow-md shrink-0">
          <div className="flex items-center gap-6">
            <div className="font-mono text-red-500 text-5xl font-black tracking-wider drop-shadow-[0_0_15px_rgba(239,68,68,0.3)] leading-none w-[120px]">
              {formatTime(timeLeft)}
            </div>
            <div className="flex flex-col border-l border-zinc-700 pl-6 py-1">
               <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1.5">
                 <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isClockRunning ? 'animate-pulse' : ''}`}></span> 
                 Overtime Active
               </span>
               <span className="text-white text-xl font-black uppercase tracking-widest leading-none">Super Chats Only</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-2xl border border-zinc-800">
            <button onClick={handleToggleClock} className={`flex items-center justify-center w-12 h-10 rounded-xl transition-all ${isClockRunning ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-red-600 text-white hover:bg-red-500 shadow-lg'}`}>
              {isClockRunning ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={handleResetClock} className="flex items-center justify-center w-12 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-all">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className="p-2 px-3 border-b border-zinc-800/60 bg-black/40 flex justify-between items-center z-10 min-h-[36px] shrink-0">
          {activeChat ? (
            <button onClick={handleResetGraphic} className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
              <RotateCcw size={16} />
            </button>
          ) : <div />}

          {activeChat && (
            <button onClick={handleClearScreen} className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 min-h-0">
            <MessageSquare size={48} className="text-zinc-600 mb-4" />
            <h2 className="text-xl font-black text-zinc-500 uppercase tracking-widest italic">Waiting for Super Chat...</h2>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-6 overflow-hidden min-h-0">
            
            <div className={`bg-gradient-to-r ${activeChat.color.replace('text-white', '').replace('text-black', '')} p-0.5 rounded-2xl shadow-xl mb-4 shrink-0 animate-in slide-in-from-top-3 duration-300`}>
              <div className={`bg-[#111114] rounded-[14px] flex items-center relative overflow-hidden transition-all duration-300 ${showGraphic ? 'p-4 gap-4' : 'p-6 md:p-8 gap-6'}`}>
                <img src={activeChat.avatar} alt={activeChat.user} className={`${showGraphic ? 'w-10 h-10 border' : 'w-16 h-16 md:w-20 md:h-20 border-2'} rounded-full border-zinc-600 shadow-md shrink-0 z-10 transition-all duration-300`} />
                <div className="flex-1 min-w-0 z-10">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`${showGraphic ? 'text-[11px]' : 'text-sm md:text-base'} font-black tracking-widest uppercase text-zinc-400 transition-all duration-300`}>{activeChat.user}</span>
                    <span className={`${showGraphic ? 'text-[10px] px-2 py-0.5' : 'text-xs md:text-sm px-3 py-1'} font-black rounded uppercase tracking-wider ${activeChat.color} transition-all duration-300`}>{activeChat.amount}</span>
                  </div>
                  <div className={`text-white font-bold leading-snug break-words transition-all duration-300 ${showGraphic ? 'text-xl md:text-2xl' : 'text-4xl md:text-5xl'}`}>"{activeChat.text}"</div>
                </div>
              </div>
            </div>

            {showGraphic && (currentSideA.length > 0 || currentSideB.length > 0) && (
              <div className="flex-1 flex items-center justify-center p-2 overflow-y-auto custom-scrollbar min-h-0">
                {activeChat.type === 'trade' || currentSideB.length > 0 ? (
                  <div className="flex items-center justify-center gap-6 max-w-full">
                    <div className="flex flex-col items-center gap-3 w-full max-w-[460px]">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {currentSideA.map(pId => renderDNOLandscapeCard(pId, 'sideA'))}
                      </div>
                      {renderAddPlayerButton('sideA')}
                    </div>
                    
                    <div className="text-zinc-500 text-3xl font-black italic uppercase tracking-widest shrink-0 px-2">VS</div>
                    
                    <div className="flex flex-col items-center gap-3 w-full max-w-[460px]">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {currentSideB.map(pId => renderDNOLandscapeCard(pId, 'sideB'))}
                      </div>
                      {renderAddPlayerButton('sideB')}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 w-full max-w-[780px] py-2">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {currentSideA.map(pId => renderDNOLandscapeCard(pId, 'sideA'))}
                    </div>
                    {renderAddPlayerButton('sideA')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. RIGHT SIDEBAR: Super Chat Feed */}
      <div className="w-80 lg:w-88 bg-[#0e0e11] border border-zinc-800 rounded-2xl flex flex-col shadow-2xl flex-shrink-0 min-h-0">
        
        <div className="p-3 border-b border-zinc-800 bg-black/50 rounded-t-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Super Chats</span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
          </div>
          
          <button onClick={() => setShowSettings(true)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <Settings size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-2.5 min-h-0">
          {superChats.map((chat) => (
            <div 
              key={chat.id} 
              className={`p-0.5 rounded-xl transition-all flex flex-col gap-2 
                ${activeChat?.id === chat.id ? 'bg-zinc-400 scale-[1.02]' : 'bg-zinc-800/40 hover:bg-zinc-700/60'}
              `}
            >
              <div className="bg-[#111114] rounded-[10px] p-2 flex flex-col gap-2">
                <div className="flex gap-2.5 items-start">
                  <img src={chat.avatar} alt={chat.user} className="w-8 h-8 rounded-full shrink-0 border border-zinc-700" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="text-[10px] font-black tracking-widest uppercase text-zinc-400 truncate">{chat.user}</div>
                      <div className={`text-[9px] font-black px-1.5 rounded-sm border drop-shadow-md uppercase tracking-wider ${chat.color}`}>{chat.amount}</div>
                    </div>
                    <div className="text-xs text-zinc-200 leading-snug font-medium">{chat.text}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-0.5">
                  <button 
                    onClick={() => handleSelectDisplay(chat, false)} 
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-[9px] font-black uppercase tracking-widest py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 border border-zinc-700"
                  >
                    <MessageCircle size={11} /> Show Chat
                  </button>
                  {(chat.sideA?.length > 0 || chat.sideB?.length > 0) && (
                    <button 
                      onClick={() => handleSelectDisplay(chat, true)} 
                      className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white text-[9px] font-black uppercase tracking-widest py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 border border-zinc-500"
                    >
                      <ImageIcon size={11} /> Show Graphic
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {superChats.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 font-black uppercase tracking-widest text-xs py-10 px-6 text-center gap-2">
              {connectionStatus && connectionStatus.includes(' ') ? (
                <span className="text-red-500">{connectionStatus}</span>
              ) : (
                "Waiting for Super Chats..."
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. UNIFIED SEARCH MODAL (ADD & SWAP) */}
      {playerSearch && (
        <div onClick={() => setPlayerSearch(null)} className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div onClick={(e) => e.stopPropagation()} className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                {playerSearch.type === 'swap' ? <><RefreshCw size={16} className="text-[#1b75bb]" /> Swap Player</> : <><Plus size={16} className="text-emerald-500" /> Add Player</>}
              </h3>
              <button onClick={() => setPlayerSearch(null)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search player or pick (e.g. '2026')..." className="w-full bg-black border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-zinc-400 text-xs" autoFocus />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {searchResults.map(p => (
                <div key={p.player_id} onClick={() => handlePlayerSelect(String(p.player_id))} className="p-2.5 bg-black/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-xl flex items-center justify-between cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-zinc-500" />
                    <div>
                      <div className="text-xs font-bold text-white">{p.full_name}</div>
                      <div className="text-[10px] text-zinc-500 uppercase font-black">{p.position || 'NFL'} • {p.team || 'FA'}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] text-white px-2 py-1 rounded-md font-black uppercase transition-colors ${playerSearch.type === 'swap' ? 'bg-[#1b75bb] group-hover:bg-[#155e96]' : 'bg-emerald-600 group-hover:bg-emerald-500'}`}>Select</span>
                </div>
              ))}
              {searchQuery.length > 1 && searchResults.length === 0 && (
                <div className="text-center py-6 text-zinc-500 text-xs font-bold">No results found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SLEEPER + ESPN INFO & STATS MODAL */}
      {selectedInfoPlayer && (
        <div onClick={() => setInfoPlayerId(null)} className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div onClick={(e) => e.stopPropagation()} className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 w-full max-w-4xl shadow-2xl space-y-4 max-h-[85vh] flex flex-col overflow-hidden relative">
            <button onClick={() => setInfoPlayerId(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10 bg-black/50 p-1.5 rounded-lg border border-zinc-800"><X size={18} /></button>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 pt-2">
              
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
                    <div className="text-xs font-bold text-[#1b75bb] uppercase tracking-wider mt-1">{selectedInfoPlayer.position} • {selectedInfoPlayer.team || 'Free Agent'} {selectedInfoPlayer.number ? `• #${selectedInfoPlayer.number}` : ''}</div>
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

              {/* 2026 GAME LOG & SCHEDULE TABLE */}
              <div className="bg-black/40 p-3.5 rounded-xl border border-zinc-800">
                <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Calendar size={13} className="text-[#1b75bb]" /> 2026 Game Log & Schedule</span>
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
                        {playerSchedule.map((game, idx) => {
                          return (
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
                          );
                        })}
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
                                {statYear.year} {statYear.year === projYear ? <span className="text-emerald-500 text-[9px] ml-1">(PROJ)</span> : ''}
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

      {/* 5. SETTINGS MODAL */}
      {showSettings && (
        <div onClick={() => setShowSettings(false)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div onClick={(e) => e.stopPropagation()} className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <h3 className="text-base font-black text-white uppercase tracking-wider">Live Chat Stream Setup</h3>
              <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">YouTube URL</label>
                <input 
                  type="text" 
                  value={streamUrl} 
                  onChange={(e) => {
                    setStreamUrl(e.target.value);
                    updateFirebaseState({ qa_streamUrl: e.target.value });
                  }} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-zinc-400 text-xs" 
                />
              </div>

              <button 
                onClick={() => {
                   const newStatus = !isConnected;
                  setIsConnected(newStatus); 
                  updateFirebaseState({ qa_isConnected: newStatus });
                  setShowSettings(false); 
                }} 
                className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${isConnected ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}
              >
                {isConnected ? 'Disconnect Stream' : 'Connect Stream'}
              </button>

              <div className="pt-4 border-t border-zinc-800 space-y-2 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Beaker size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Visual Testing</span>
                </div>
                <button 
                  onClick={handleInjectMockData}
                  className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors bg-amber-600 hover:bg-amber-500 text-white shadow-md"
                >
                  Inject Fake Chats
                </button>
                <button 
                  onClick={handleClearMockData}
                  className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                >
                  Clear All Chats
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}