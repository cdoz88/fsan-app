"use client";
import React, { useState, useEffect } from 'react';
import { MessageSquare, Settings, X, Image as ImageIcon, MessageCircle, RefreshCw, Info, Search, User, RotateCcw, Calendar, History, Loader2, Plus, Play, Pause } from 'lucide-react';

// --- FIREBASE IMPORTS ---
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

const MOCK_CAREER_STATS = [
  { year: '2025', team: 'BUF', g: 17, passCmpAtt: '319/460', passYds: '3668', passTd: 25, int: 10, rushYds: 579, rushTd: 14, fpts: 368.6 }
];

const MOCK_WEEKLY_STATS = [
  { passCmpAtt: "21/32", passYds: "254", passTd: "2", int: "0", rushYds: "22", rushTd: "1", fpts: "26.3" }
];

const DUMMY_SUPERCHATS = [
  { 
    id: 1, 
    user: "TradeMaster2026", 
    avatar: "https://placehold.co/100x100/1b75bb/white?text=TM", 
    text: "Blockbuster trade! Do I send JJ and CMC for CeeDee, Gibbs, and Sun God??", 
    amount: "$50.00",
    color: "bg-blue-600 border-blue-400 text-white",
    type: "trade", 
    sideA: ["6801", "4984"], 
    sideB: ["6794", "9221", "7525"] 
  },
  { 
    id: 2, 
    user: "FantasyFootballJunkie", 
    avatar: "https://placehold.co/100x100/10b981/white?text=FF", 
    text: "Pick 3 WRs out of these 5 in full PPR: Chase, Jefferson, Lamb, Sun God, or AJ Brown?", 
    amount: "$20.00",
    color: "bg-emerald-500 border-emerald-300 text-black",
    type: "start", 
    sideA: ["7564", "6801", "6794", "7525", "5859"] 
  },
  { 
    id: 3, 
    user: "GridironGuru99", 
    avatar: "https://placehold.co/100x100/f59e0b/white?text=GG", 
    text: "Need to start 2 in full PPR: Waddle, Devonta Smith, or Achane?", 
    amount: "$5.00",
    color: "bg-amber-500 border-amber-300 text-black",
    type: "start", 
    sideA: ["7526", "7547", "9226"] 
  },
  { 
    id: 4, 
    user: "casual_fan_12", 
    avatar: "https://placehold.co/100x100/ef4444/white?text=CF", 
    text: "Corey, you're crazy for that take on the Cowboys lol", 
    amount: "$2.00",
    color: "bg-cyan-500 border-cyan-300 text-black",
    type: "chat", 
    sideA: [] 
  }
];

export default function OvertimeTab() {
  const [streamUrl, setStreamUrl] = useState('');
  
  // --- OVERTIME COUNTDOWN STATE ---
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [targetEndTime, setTargetEndTime] = useState(null);

  // --- Q&A STATE ---
  const [activeChat, setActiveChat] = useState(null);
  const [showGraphic, setShowGraphic] = useState(false);
  const [customPlayerLists, setCustomPlayerLists] = useState(null);
  const [disabledPlayers, setDisabledPlayers] = useState({});
  
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playerDB, setPlayerDB] = useState({});

  const [playerSearch, setPlayerSearch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [infoPlayerId, setInfoPlayerId] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [playerSchedule, setPlayerSchedule] = useState([]);

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

  const updateFirebaseOT = async (updates) => {
    try {
      await setDoc(doc(db, 'stream_state', 'live'), updates, { merge: true });
    } catch (err) {
      console.error("Failed to sync OT to Firebase:", err);
    }
  };

  // Manual Clock Controls (Still available just in case)
  const handleToggleClock = () => {
    if (isClockRunning) {
      updateFirebaseOT({ ot_isClockRunning: false, ot_timeLeft: timeLeft });
    } else {
      updateFirebaseOT({ ot_isClockRunning: true, ot_targetEndTime: Date.now() + (timeLeft * 1000) });
    }
  };

  const handleResetClock = () => {
    updateFirebaseOT({ ot_isClockRunning: true, ot_timeLeft: 120, ot_targetEndTime: Date.now() + 120000 });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
             if (mergedDB[key]) mergedDB[key] = { ...mergedDB[key], ...customMap[key] };
          });
          setPlayerDB(mergedDB);
        }
      } catch (err) {}
    };
    loadPlayerDatabases();
  }, []);

  // --- AUTOMATED CLOCK LOGIC (When chat is pushed to screen) ---
  const handleSelectDisplay = (chatItem, isGraphic) => {
    setActiveChat(chatItem);
    setShowGraphic(isGraphic);
    setCustomPlayerLists(null);
    setDisabledPlayers({});
    
    // AUTOMATION: Pause the clock and reset it to 2:00 because we are actively answering
    updateFirebaseOT({
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
    updateFirebaseOT({
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
    updateFirebaseOT({ ot_customPlayerLists: null, ot_disabledPlayers: {} });
  };

  const togglePlayerDisabled = (playerId, e) => {
    if (e) e.stopPropagation();
    const newState = { ...disabledPlayers, [playerId]: !disabledPlayers[playerId] };
    setDisabledPlayers(newState);
    updateFirebaseOT({ ot_disabledPlayers: newState });
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
    updateFirebaseOT({ ot_customPlayerLists: newLists });
  };

  const getESPNHeadshot = (espnId) => `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${espnId}.png&w=350&h=254`;

  const getCardStyle = (position) => {
    switch (position) {
      case 'QB': return { border: 'border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]', text: 'text-cyan-400' };
      case 'RB': return { border: 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)]', text: 'text-emerald-500' };
      case 'WR': return { border: 'border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]', text: 'text-amber-500' };
      case 'TE': return { border: 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.25)]', text: 'text-red-500' };
      default:   return { border: 'border-zinc-500/80 shadow-[0_0_15px_rgba(113,113,122,0.25)]', text: 'text-zinc-400' };
    }
  };

  const renderDNOLandscapeCard = (playerId, side = 'sideA') => {
    const dbPlayer = playerDB[playerId];
    if (!dbPlayer) return null;

    const firstName = dbPlayer.first_name || "";
    const lastName = dbPlayer.last_name || "Player";
    const position = dbPlayer.position || "UNK";
    const team = dbPlayer.team ? dbPlayer.team.toUpperCase() : "FA";

    const isGrayedOut = !!disabledPlayers[playerId];
    const cardStyle = getCardStyle(position);
    const tColors = NFL_COLORS[team] || NFL_COLORS['FA'];
    const teamLogo = team !== 'FA' ? `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png` : null;

    let playerImage = dbPlayer?.espn_id 
      ? getESPNHeadshot(dbPlayer.espn_id) 
      : `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;

    return (
      <div 
        key={playerId} 
        className={`relative h-[135px] w-[210px] flex flex-col justify-end shadow-2xl rounded-[18px] overflow-hidden border-2 transition-all duration-300 shrink-0 animate-in zoom-in-95 group
          ${isGrayedOut ? 'border-red-600/80 opacity-35 grayscale' : `${cardStyle.border}`}
        `}
        style={{ background: `linear-gradient(180deg, ${tColors.primary}90 0%, ${tColors.secondary}95 65%, #000000 100%)` }}
      >
        {isGrayedOut && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none animate-in fade-in duration-200">
            <div className="bg-red-600 text-white rounded-full p-2.5 shadow-2xl border-2 border-white/90"><X size={32} strokeWidth={3.5} /></div>
          </div>
        )}

        {/* 3-BUTTON HOVER OVERLAY */}
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2">
          <button onClick={(e) => togglePlayerDisabled(playerId, e)} className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg transition-transform hover:scale-110 flex items-center justify-center">
            <X size={18} strokeWidth={3} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setInfoPlayerId(playerId); }} className="p-2.5 bg-[#1b75bb] hover:bg-[#155e96] text-white rounded-xl shadow-lg transition-transform hover:scale-110 flex items-center justify-center">
            <Info size={18} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setPlayerSearch({ type: 'swap', oldPlayerId: playerId, side }); }} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 rounded-xl shadow-lg transition-transform hover:scale-110 flex items-center justify-center">
            <RefreshCw size={18} />
          </button>
        </div>

        {teamLogo && (
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.25] pointer-events-none">
            <img src={teamLogo} className="w-[140%] max-w-none h-auto object-contain mix-blend-screen" alt="" />
          </div>
        )}

        <div className="absolute top-2 left-2 z-20">
          <span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black tracking-widest text-zinc-200 border border-zinc-700/50 shadow-md uppercase">{position}</span>
        </div>
        <div className="absolute top-2 right-2 z-20">
          <span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black tracking-widest text-zinc-200 border border-zinc-700/50 shadow-md uppercase">{team}</span>
        </div>

        <div className="absolute inset-x-0 top-0 bottom-3 flex items-center justify-center z-10 pointer-events-none overflow-hidden">
          <img src={playerImage} className="w-full h-auto object-cover object-top scale-150 -translate-y-1 drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)] filter contrast-110 brightness-110" alt={lastName} onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }} />
        </div>
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
      className="h-[135px] w-[60px] flex items-center justify-center border-2 border-dashed border-zinc-700 hover:border-[#1b75bb] hover:bg-[#1b75bb]/10 rounded-[18px] transition-all group shrink-0 animate-in zoom-in-95"
      title="Add Player"
    >
      <Plus size={24} className="text-zinc-600 group-hover:text-[#1b75bb] transition-colors" />
    </button>
  );

  const searchResults = searchQuery.trim().length > 1
    ? Object.values(playerDB).filter(p => p.full_name && p.full_name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : [];

  const selectedInfoPlayer = infoPlayerId ? playerDB[infoPlayerId] : null;
  const currentSideA = customPlayerLists ? customPlayerLists.sideA : (activeChat?.sideA || []);
  const currentSideB = customPlayerLists ? customPlayerLists.sideB : (activeChat?.sideB || []);

  return (
    <div className="flex h-full w-full gap-4 p-4 overflow-hidden relative">
      
      {/* 1. LEFT SIDE: Main Broadcast Stage */}
      <div className="flex-1 bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* OVERTIME COUNTDOWN HEADER */}
        <div className="p-3 px-5 border-b border-zinc-800/80 bg-[#141418] flex justify-between items-center z-10 shadow-md">
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

        <div className="p-2 px-3 border-b border-zinc-800/60 bg-black/40 flex justify-between items-center z-10 min-h-[36px]">
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
          <div className="flex-1 flex flex-col items-center justify-center opacity-30">
            <MessageSquare size={48} className="text-zinc-600 mb-4" />
            <h2 className="text-xl font-black text-zinc-500 uppercase tracking-widest italic">Waiting for Super Chat...</h2>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            
            <div className={`bg-gradient-to-r ${activeChat.color.replace('text-white', '').replace('text-black', '')} p-0.5 rounded-2xl shadow-xl mb-4 shrink-0 animate-in slide-in-from-top-3 duration-300`}>
              <div className="bg-[#111114] rounded-[14px] p-4 flex gap-4 items-center relative overflow-hidden">
                <img src={activeChat.avatar} alt={activeChat.user} className="w-10 h-10 rounded-full border border-zinc-600 shadow-md shrink-0 z-10" />
                <div className="flex-1 min-w-0 z-10">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="text-[11px] font-black tracking-widest uppercase text-zinc-400">{activeChat.user}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${activeChat.color}`}>{activeChat.amount}</span>
                  </div>
                  <div className="text-lg md:text-xl text-white font-bold leading-snug truncate">"{activeChat.text}"</div>
                </div>
              </div>
            </div>

            {showGraphic && (currentSideA.length > 0 || currentSideB.length > 0) && (
              <div className="flex-1 flex items-center justify-center p-2 overflow-y-auto custom-scrollbar">
                {activeChat.type === 'trade' || currentSideB.length > 0 ? (
                  <div className="flex items-center justify-center gap-6 max-w-full">
                    <div className="flex flex-wrap items-center justify-center gap-3 max-w-[460px]">
                      {currentSideA.map(pId => renderDNOLandscapeCard(pId, 'sideA'))}
                      {renderAddPlayerButton('sideA')}
                    </div>
                    <div className="text-zinc-500 text-3xl font-black italic uppercase tracking-widest shrink-0 px-2">VS</div>
                    <div className="flex flex-wrap items-center justify-center gap-3 max-w-[460px]">
                      {currentSideB.map(pId => renderDNOLandscapeCard(pId, 'sideB'))}
                      {renderAddPlayerButton('sideB')}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-4 max-w-[780px] py-2">
                    {currentSideA.map(pId => renderDNOLandscapeCard(pId, 'sideA'))}
                    {renderAddPlayerButton('sideA')}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* 2. RIGHT SIDEBAR: Super Chat Feed */}
      <div className="w-80 lg:w-88 bg-[#0e0e11] border border-zinc-800 rounded-2xl flex flex-col shadow-2xl flex-shrink-0">
        
        <div className="p-3 border-b border-zinc-800 bg-black/50 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Super Chats</span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
          </div>
          
          <button onClick={() => setShowSettings(true)} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors">
            <Settings size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-2.5">
          {DUMMY_SUPERCHATS.map((chat) => (
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
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search player name..." className="w-full bg-black border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-zinc-400 text-xs" autoFocus />
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
            </div>
          </div>
        </div>
      )}

      {/* 4. SLEEPER + ESPN INFO & STATS MODAL (UNIFIED TABLE VIEW) */}
      {selectedInfoPlayer && (
        <div onClick={() => setInfoPlayerId(null)} className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div onClick={(e) => e.stopPropagation()} className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 w-full max-w-4xl shadow-2xl space-y-4 max-h-[85vh] flex flex-col overflow-hidden relative">
            <button onClick={() => setInfoPlayerId(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-10 bg-black/50 p-1.5 rounded-lg border border-zinc-800"><X size={18} /></button>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-between bg-black/60 p-4 rounded-xl border border-zinc-800 shrink-0 gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img src={selectedInfoPlayer.espn_id ? getESPNHeadshot(selectedInfoPlayer.espn_id) : `https://sleepercdn.com/content/nfl/players/thumb/${selectedInfoPlayer.player_id}.jpg`} alt={selectedInfoPlayer.full_name} className="w-16 h-16 object-cover rounded-xl bg-zinc-900 border border-zinc-700 shrink-0" onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }} />
                  <div className="min-w-0">
                    <div className="text-2xl font-black text-white uppercase leading-none truncate pr-8 sm:pr-0">{selectedInfoPlayer.full_name}</div>
                    <div className="text-xs font-bold text-[#1b75bb] uppercase tracking-wider mt-1">{selectedInfoPlayer.position} • {selectedInfoPlayer.team || 'Free Agent'} • #{selectedInfoPlayer.number || '00'}</div>
                  </div>
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
                <input type="text" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-zinc-400 text-xs" />
              </div>
              <button onClick={() => { setIsConnected(!isConnected); setShowSettings(false); }} className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${isConnected ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {isConnected ? 'Disconnect Stream' : 'Connect Stream'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}