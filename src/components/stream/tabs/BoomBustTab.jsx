"use client";
import React, { useState, useEffect } from 'react';
import { X, Search, Trash2, Calendar, History, Loader2 } from 'lucide-react';

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

// DEMO MOCK STATS FOR VISUAL PURPOSES
const MOCK_CAREER_STATS = [
  { year: '2025', team: 'BUF', g: 17, passCmpAtt: '319/460', passYds: '3668', passTd: 25, int: 10, rushYds: 579, rushTd: 14, fpts: 368.6 },
  { year: '2024', team: 'BUF', g: 17, passCmpAtt: '307/483', passYds: '3731', passTd: 28, int: 6, rushYds: 531, rushTd: 12, fpts: 374.3 },
  { year: '2023', team: 'BUF', g: 17, passCmpAtt: '385/579', passYds: '4306', passTd: 29, int: 18, rushYds: 524, rushTd: 15, fpts: 394.6 },
  { year: '2022', team: 'BUF', g: 16, passCmpAtt: '359/567', passYds: '4283', passTd: 35, int: 14, rushYds: 762, rushTd: 7, fpts: 401.5 },
  { year: '2021', team: 'BUF', g: 17, passCmpAtt: '409/646', passYds: '4407', passTd: 36, int: 15, rushYds: 763, rushTd: 6, fpts: 402.6 },
  { year: '2020', team: 'BUF', g: 16, passCmpAtt: '396/572', passYds: '4544', passTd: 37, int: 10, rushYds: 421, rushTd: 8, fpts: 399.9 },
  { year: '2019', team: 'BUF', g: 16, passCmpAtt: '271/461', passYds: '3089', passTd: 20, int: 9, rushYds: 510, rushTd: 9, fpts: 290.6 },
  { year: '2018', team: 'BUF', g: 12, passCmpAtt: '169/320', passYds: '2074', passTd: 10, int: 12, rushYds: 631, rushTd: 8, fpts: 209.1 }
];

const MOCK_WEEKLY_STATS = [
  { passCmpAtt: "21/32", passYds: "254", passTd: "2", int: "0", rushYds: "22", rushTd: "1", fpts: "26.3" },
  { passCmpAtt: "18/25", passYds: "210", passTd: "3", int: "0", rushYds: "45", rushTd: "0", fpts: "24.9" },
  { passCmpAtt: "24/40", passYds: "280", passTd: "1", int: "2", rushYds: "12", rushTd: "0", fpts: "14.4" }
];

export default function BoomBustTab() {
  const [showSettings, setShowSettings] = useState(false);
  const [playerDB, setPlayerDB] = useState({});
  const [topPlayers, setTopPlayers] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  
  const [bgUrl, setBgUrl] = useState('');
  const [layoutMode, setLayoutMode] = useState('2-col');
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');

  // Player Info Modal State (Local Only)
  const [infoPlayerId, setInfoPlayerId] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [playerSchedule, setPlayerSchedule] = useState([]);

  const [columns, setColumns] = useState({
    '2-col': [
      { id: 'col-2-1', title: 'BOOM 🚀', players: [], color: '#10b981' }, 
      { id: 'col-2-2', title: 'POOL', players: [], color: '#71717a' },   
      { id: 'col-2-3', title: 'BUST 👎', players: [], color: '#ef4444' } 
    ],
    '4-col': [
      { id: 'col-4-1', title: 'STOCK', players: [], color: '#06b6d4' },
      { id: 'col-4-2', title: 'BUY', players: [], color: '#10b981' },
      { id: 'col-4-3', title: 'HOLD', players: [], color: '#f59e0b' },
      { id: 'col-4-4', title: 'SELL', players: [], color: '#ef4444' }
    ]
  });

  const [dragState, setDragState] = useState({
    playerId: null, sourceColId: null, overColId: null, overPlayerId: null, dropEdge: null 
  });

  // --- FIREBASE SYNC LOGIC ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stream_state', 'live'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.bb_columns) setColumns(data.bb_columns);
        if (data.bb_layoutMode) setLayoutMode(data.bb_layoutMode);
        if (data.bb_bgUrl !== undefined) setBgUrl(data.bb_bgUrl); 
      }
    });
    return () => unsub();
  }, []);

  const updateFirebaseBB = async (updates) => {
    try {
      await setDoc(doc(db, 'stream_state', 'live'), updates, { merge: true });
    } catch (err) {
      console.error("Failed to sync Boom/Bust to Firebase:", err);
    }
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
             if (mergedDB[key]) {
               mergedDB[key] = { ...mergedDB[key], ...customMap[key] };
             }
          });
          
          setPlayerDB(mergedDB);
          
          const relevantPositions = ['QB', 'RB', 'WR', 'TE'];
          const top = Object.values(mergedDB)
            .filter(p => p.active && p.team && relevantPositions.includes(p.position) && p.search_rank)
            .sort((a, b) => a.search_rank - b.search_rank)
            .slice(0, 400);
            
          setTopPlayers(top);
        }
      } catch (err) {} finally {
        setDbLoading(false);
      }
    };
    
    loadPlayerDatabases();
  }, []);

  // Fetch Full 18-Week Regular Season Schedule from ESPN for Info Modal
  useEffect(() => {
    if (!infoPlayerId || !playerDB[infoPlayerId]) return;
    
    const player = playerDB[infoPlayerId];
    const teamAbbr = player.team ? player.team.toLowerCase() : 'fa';

    const fetchESPNSchedule = async () => {
      setInfoLoading(true);
      let schedule = [];

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

                return {
                  week: weekNum,
                  opp: oppTeam,
                  oppLogo,
                  isHome
                };
              });
            }
          }
        }
      } catch (err) {
        console.warn("ESPN Fetch Error:", err);
      } finally {
        setPlayerSchedule(schedule);
        setInfoLoading(false);
      }
    };

    fetchESPNSchedule();
  }, [infoPlayerId, playerDB]);

  // Sync Layout Changes
  const handleLayoutChange = (mode) => {
    setLayoutMode(mode);
    updateFirebaseBB({ bb_layoutMode: mode });
  };

  // Sync Background URL specifically when the user clicks off the input
  const handleBgBlur = () => {
    updateFirebaseBB({ bb_bgUrl: bgUrl });
  };

  const handlePlayerToggle = (playerId) => {
    setColumns(prev => {
      const newCols = { ...prev };
      let exists = false;
      prev[layoutMode].forEach(col => {
        if (col.players.includes(playerId)) exists = true;
      });

      if (exists) {
        newCols[layoutMode] = prev[layoutMode].map(col => ({
          ...col,
          players: col.players.filter(id => id !== playerId)
        }));
      } else {
        const targetColIdx = layoutMode === '2-col' ? 1 : 0; 
        newCols[layoutMode] = prev[layoutMode].map((col, idx) => {
          if (idx === targetColIdx) {
            return { ...col, players: [...col.players, playerId] };
          }
          return col;
        });
      }
      
      updateFirebaseBB({ bb_columns: newCols });
      return newCols;
    });
  };

  const handleClearAll = () => {
    setColumns(prev => {
      const newCols = { ...prev };
      newCols[layoutMode] = prev[layoutMode].map(col => ({ ...col, players: [] }));
      
      updateFirebaseBB({ bb_columns: newCols });
      return newCols;
    });
  };

  const updateHeader = (colIdx, newTitle) => {
    setColumns(prev => {
      const newCols = { ...prev };
      newCols[layoutMode] = prev[layoutMode].map((col, idx) => 
        idx === colIdx ? { ...col, title: newTitle } : col
      );
      
      updateFirebaseBB({ bb_columns: newCols });
      return newCols;
    });
  };

  const updateColor = (colIdx, newColor) => {
    setColumns(prev => {
      const newCols = { ...prev };
      newCols[layoutMode] = prev[layoutMode].map((col, idx) => 
        idx === colIdx ? { ...col, title: col.title, players: col.players, color: newColor } : col
      );
      
      updateFirebaseBB({ bb_columns: newCols });
      return newCols;
    });
  };

  const handleDragStart = (e, playerId, sourceColId) => {
    e.dataTransfer.setData('playerId', playerId);
    e.dataTransfer.setData('sourceColId', sourceColId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      setDragState(prev => ({ ...prev, playerId, sourceColId }));
    }, 0);
  };

  const handleDragEnd = () => {
    setDragState({ playerId: null, sourceColId: null, overColId: null, overPlayerId: null, dropEdge: null });
  };

  const handleDragOver = (e, colId, targetPlayerId = null) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    if (targetPlayerId && targetPlayerId !== dragState.playerId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const dropEdge = y < rect.height / 2 ? 'top' : 'bottom';
      if (dragState.overColId !== colId || dragState.overPlayerId !== targetPlayerId || dragState.dropEdge !== dropEdge) {
        setDragState(prev => ({ ...prev, overColId: colId, overPlayerId: targetPlayerId, dropEdge }));
      }
    } else {
      if (dragState.overColId !== colId || dragState.overPlayerId !== null) {
        setDragState(prev => ({ ...prev, overColId: colId, overPlayerId: null, dropEdge: null }));
      }
    }
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    e.stopPropagation();

    const { playerId, sourceColId, overPlayerId, dropEdge } = dragState;
    if (!playerId || !sourceColId) return;

    setColumns(prev => {
      const newCols = { ...prev };
      const currentLayoutCols = [...prev[layoutMode]].map(col => ({ ...col, players: [...col.players] }));
      
      const srcIdx = currentLayoutCols.findIndex(c => c.id === sourceColId);
      const tgtIdx = currentLayoutCols.findIndex(c => c.id === targetColId);

      if (sourceColId === targetColId && overPlayerId === playerId) return prev;

      currentLayoutCols[srcIdx].players = currentLayoutCols[srcIdx].players.filter(id => id !== playerId);

      if (overPlayerId && overPlayerId !== playerId) {
        const tgtPlayerIdx = currentLayoutCols[tgtIdx].players.indexOf(overPlayerId);
        if (tgtPlayerIdx !== -1) {
          const insertIdx = dropEdge === 'top' ? tgtPlayerIdx : tgtPlayerIdx + 1;
          currentLayoutCols[tgtIdx].players.splice(insertIdx, 0, playerId);
        } else {
          currentLayoutCols[tgtIdx].players.push(playerId);
        }
      } else {
        currentLayoutCols[tgtIdx].players.push(playerId);
      }

      newCols[layoutMode] = currentLayoutCols;
      
      // Update Firebase the moment it is dropped
      updateFirebaseBB({ bb_columns: newCols });
      return newCols;
    });
    handleDragEnd(); 
  };

  const getPosColor = (position) => {
    switch (position) {
      case 'QB': return 'text-cyan-400';
      case 'RB': return 'text-emerald-500';
      case 'WR': return 'text-amber-500';
      case 'TE': return 'text-red-500';
      default: return 'text-zinc-400';
    }
  };

  const getESPNHeadshot = (espnId) => `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${espnId}.png&w=350&h=254`;

  const renderPlayerCard = (playerId, col) => {
    const dbPlayer = playerDB[playerId];
    if (!dbPlayer) return null;

    const firstName = dbPlayer.first_name || "";
    const lastName = dbPlayer.last_name || "";
    const position = dbPlayer.position || "UNK";
    const team = dbPlayer.team ? dbPlayer.team.toUpperCase() : "FA";
    
    const posColor = getPosColor(position);
    const tColors = NFL_COLORS[team] || NFL_COLORS['FA'];
    
    const teamLogo = team !== 'FA' ? `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png` : null;
    let playerImage = dbPlayer?.espn_id 
      ? getESPNHeadshot(dbPlayer.espn_id) 
      : `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;

    const isDragging = dragState.playerId === playerId;
    const isOver = dragState.overPlayerId === playerId;
    const showTopIndicator = isOver && dragState.dropEdge === 'top';
    const showBottomIndicator = isOver && dragState.dropEdge === 'bottom';

    let lastNameSize = "text-[18px] tracking-wide";
    if (lastName.length > 14) {
      lastNameSize = "text-[14.5px] tracking-tight pt-[2px]";
    } else if (lastName.length > 11) {
      lastNameSize = "text-[16px] tracking-tight pt-[1px]";
    }

    return (
      <div key={playerId} className="relative w-full mb-5">
        <div className={`absolute top-[-11px] left-0 right-0 h-[3px] rounded-full transition-all duration-200 z-50 ${showTopIndicator ? 'opacity-100 bg-white shadow-[0_0_8px_#fff]' : 'opacity-0'}`} />
        
        <div 
          draggable
          onDragStart={(e) => handleDragStart(e, playerId, col.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, col.id, playerId)}
          onDrop={(e) => handleDrop(e, col.id)}
          className={`relative h-[68px] flex items-center p-2 rounded-[14px] border transition-all cursor-grab active:cursor-grabbing group
            ${isDragging ? 'opacity-40 bg-black border border-gray-800' : 'opacity-100 hover:brightness-125'}
          `}
          style={{ borderColor: isDragging ? undefined : col.color }}
        >
          <div 
            className={`absolute inset-0 rounded-[13px] overflow-hidden pointer-events-none z-0`}
            style={{ background: `linear-gradient(90deg, ${tColors.primary}70 0%, ${tColors.secondary}40 45%, #111111 100%)` }}
          >
             {teamLogo && (
               <div className="absolute right-[5px] top-1/2 -translate-y-1/2 h-[150%] w-auto opacity-[0.15] pointer-events-none z-0">
                  <img src={teamLogo} className="h-full w-auto object-contain" alt="" onError={(e) => e.target.style.display = 'none'} />
               </div>
             )}
          </div>

          <div className="absolute bottom-0 left-3 w-[120px] h-[175%] z-20 flex items-end justify-center pointer-events-none">
            <img 
              src={playerImage} alt={lastName}
              className="w-full h-full object-contain object-bottom drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)] filter contrast-110 brightness-110 mb-[1px]"
              onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
            />
          </div>

          <div className="absolute inset-0 z-10 flex items-center pr-5 pl-[135px] pointer-events-none">
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-baseline truncate">
                <span className="text-zinc-300 font-black text-[13px] mr-1.5 uppercase drop-shadow-md">{firstName.charAt(0)}.</span>
                <span className={`text-white font-black uppercase truncate drop-shadow-md leading-none ${lastNameSize}`}>{lastName}</span>
              </div>
              {team !== 'FA' && (
                <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mt-1 drop-shadow-md">
                  {team}
                </div>
              )}
            </div>
            
            <div 
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setInfoPlayerId(playerId); }}
              className={`font-black uppercase text-[22px] tracking-tighter ${posColor} drop-shadow-md shrink-0 ml-4 pointer-events-auto cursor-pointer hover:scale-110 hover:brightness-150 transition-all z-30`}
              title="View Player Stats"
            >
              {position}
            </div>
          </div>
        </div>

        <div className={`absolute bottom-[-11px] left-0 right-0 h-[3px] rounded-full transition-all duration-200 z-50 ${showBottomIndicator ? 'opacity-100 bg-white shadow-[0_0_8px_#fff]' : 'opacity-0'}`} />
      </div>
    );
  };

  const selectedInfoPlayer = infoPlayerId ? playerDB[infoPlayerId] : null;

  return (
    <div className="h-full w-full relative flex flex-col font-sans selection:bg-[#1b75bb] selection:text-white"
         style={{ backgroundImage: bgUrl ? `url('${bgUrl}')` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      
      {bgUrl && <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-none z-0" />}

      <div className="relative z-10 h-full p-4 md:p-8 flex flex-col">
        {!showSettings && (
          <div className="flex-1 flex flex-col h-full">
            <div className={`grid gap-6 flex-1 ${layoutMode === '2-col' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'}`}>
              {columns[layoutMode].map((col) => {
                const isSettingsTrigger = col.id === 'col-2-2' || col.id === 'col-4-1';

                return (
                  <div 
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className="bg-black/60 backdrop-blur-xl border-2 rounded-3xl p-5 flex flex-col transition-colors h-full"
                    style={{ borderColor: `${col.color}80`, boxShadow: `0 20px 25px -5px rgba(0,0,0,0.3), 0 0 20px ${col.color}20` }}
                  >
                    <h2 
                      onClick={() => { if (isSettingsTrigger) setShowSettings(true); }}
                      className={`text-2xl font-black text-center mb-8 mt-2 uppercase tracking-widest italic drop-shadow-lg select-none ${isSettingsTrigger ? 'cursor-pointer' : ''}`}
                      style={{ color: col.color }}
                    >
                      {col.title}
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col pb-2 pt-2">
                      {col.players.map(playerId => renderPlayerCard(playerId, col))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showSettings && (
          <div className="bg-[#151515] border border-gray-800 rounded-3xl p-8 w-full max-w-5xl mx-auto shadow-2xl animate-in fade-in zoom-in-95 mt-4">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Control Dashboard</h1>
              <button onClick={() => setShowSettings(false)} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Layout Mode</label>
                  <div className="flex bg-black rounded-xl p-1 border border-gray-800">
                    <button onClick={() => handleLayoutChange('2-col')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${layoutMode === '2-col' ? 'bg-[#1b75bb] text-white' : 'text-gray-400 hover:text-white'}`}>3 Columns</button>
                    <button onClick={() => handleLayoutChange('4-col')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${layoutMode === '4-col' ? 'bg-[#1b75bb] text-white' : 'text-gray-400 hover:text-white'}`}>4 Columns</button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Column Colors & Headers</label>
                  <div className="space-y-3">
                    {columns[layoutMode].map((col, idx) => (
                      <div key={`input-${col.id}`} className="flex gap-2">
                        <input type="color" value={col.color} onChange={(e) => updateColor(idx, e.target.value)} className="w-12 h-11 p-1 bg-black border border-gray-800 rounded-xl cursor-pointer shrink-0" />
                        <input type="text" value={col.title} onChange={(e) => updateHeader(idx, e.target.value)} style={{ color: col.color }} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1b75bb] shadow-inner text-sm font-bold" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Background Image URL</label>
                  <input 
                    type="text" 
                    value={bgUrl} 
                    onChange={(e) => setBgUrl(e.target.value)} 
                    onBlur={handleBgBlur}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1b75bb] shadow-inner text-sm" 
                    placeholder="https://..." 
                  />
                </div>
                
                <button onClick={handleClearAll} className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-400 font-black uppercase tracking-widest text-xs px-6 py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Trash2 size={16} /> Clear All Selections
                </button>
              </div>

              <div className="lg:col-span-2 bg-black border border-gray-800 rounded-2xl p-6">
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Player Pool</label>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search players..." className="w-full bg-[#151515] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#1b75bb] text-sm" />
                  </div>
                  <div className="flex bg-[#151515] border border-gray-800 rounded-xl p-1 overflow-x-auto custom-scrollbar">
                    {['ALL', 'QB', 'RB', 'WR', 'TE'].map(pos => (
                      <button key={pos} onClick={() => setPosFilter(pos)} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${posFilter === pos ? 'bg-zinc-700 text-white' : 'text-gray-500 hover:text-white'}`}>{pos}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-6">
                  {dbLoading ? (
                    <div className="col-span-full text-center py-12 text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Databases...</div>
                  ) : (
                    topPlayers.filter(p => posFilter === 'ALL' || p.position === posFilter).filter(p => !searchTerm || p.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map(player => {
                        let isSelected = false;
                        columns[layoutMode].forEach(col => { if (col.players.includes(player.player_id)) isSelected = true; });

                        return (
                          <div key={player.player_id} onClick={() => handlePlayerToggle(player.player_id)} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-[#1b75bb]/20 border-[#1b75bb]/50 shadow-inner' : 'bg-[#151515] border-gray-800 hover:border-gray-600 shadow-md'}`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-[#1b75bb] border-[#1b75bb]' : 'bg-black border-gray-700'}`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-white truncate">{player.full_name}</div>
                              <div className="text-[10px] font-black tracking-widest uppercase text-gray-500">{player.position} • {player.team}</div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SLEEPER + ESPN INFO & STATS MODAL (UNIFIED TABLE VIEW) */}
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
                  <img 
                    src={selectedInfoPlayer.espn_id ? getESPNHeadshot(selectedInfoPlayer.espn_id) : `https://sleepercdn.com/content/nfl/players/thumb/${selectedInfoPlayer.player_id}.jpg`} 
                    alt={selectedInfoPlayer.full_name} 
                    className="w-16 h-16 object-cover rounded-xl bg-zinc-900 border border-zinc-700 shrink-0"
                    onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                  />
                  <div className="min-w-0">
                    <div className="text-2xl font-black text-white uppercase leading-none truncate pr-8 sm:pr-0">{selectedInfoPlayer.full_name}</div>
                    <div className="text-xs font-bold text-[#1b75bb] uppercase tracking-wider mt-1">
                      {selectedInfoPlayer.position} • {selectedInfoPlayer.team || 'Free Agent'} • #{selectedInfoPlayer.number || '00'}
                    </div>
                  </div>
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
                          <th className="p-2.5 text-center">CMP/ATT</th>
                          <th className="p-2.5 text-center">PASS YDS</th>
                          <th className="p-2.5 text-center">PASS TD</th>
                          <th className="p-2.5 text-center">INT</th>
                          <th className="p-2.5 text-center">RUSH YDS</th>
                          <th className="p-2.5 text-center">RUSH TD</th>
                          <th className="p-2.5 text-center">FPTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-bold text-white">
                        {playerSchedule.map((game, idx) => {
                          const mockStat = MOCK_WEEKLY_STATS[idx];
                          return (
                            <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                              <td className="p-2.5 text-zinc-400">{game.week}</td>
                              <td className="p-2.5 flex items-center gap-2">
                                <span className="text-zinc-500 text-[10px]">{game.isHome ? 'VS' : '@'}</span>
                                <img src={game.oppLogo} alt="" className="w-5 h-5 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                                {game.opp}
                              </td>
                              <td className="p-2.5 text-center">{mockStat ? mockStat.passCmpAtt : '-'}</td>
                              <td className="p-2.5 text-center">{mockStat ? mockStat.passYds : '-'}</td>
                              <td className="p-2.5 text-center text-emerald-400">{mockStat ? mockStat.passTd : '-'}</td>
                              <td className="p-2.5 text-center text-red-400">{mockStat ? mockStat.int : '-'}</td>
                              <td className="p-2.5 text-center">{mockStat ? mockStat.rushYds : '-'}</td>
                              <td className="p-2.5 text-center text-emerald-400">{mockStat ? mockStat.rushTd : '-'}</td>
                              <td className="p-2.5 text-center text-[#1b75bb]">{mockStat ? mockStat.fpts : '-'}</td>
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
                  <History size={13} className="text-[#1b75bb]" /> Career Season Totals
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-black/60 max-h-48 custom-scrollbar relative">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-zinc-900 text-[10px] text-zinc-400 font-black uppercase border-b border-zinc-800 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-2.5">YEAR</th>
                        <th className="p-2.5">TEAM</th>
                        <th className="p-2.5 text-center">G</th>
                        <th className="p-2.5 text-center">CMP/ATT</th>
                        <th className="p-2.5 text-center">PASS YDS</th>
                        <th className="p-2.5 text-center">PASS TD</th>
                        <th className="p-2.5 text-center">INT</th>
                        <th className="p-2.5 text-center">RUSH YDS</th>
                        <th className="p-2.5 text-center">RUSH TD</th>
                        <th className="p-2.5 text-center">FPTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-bold text-white">
                      {MOCK_CAREER_STATS.map((yr, i) => (
                        <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="p-2.5 text-zinc-400">{yr.year}</td>
                          <td className="p-2.5">{yr.team}</td>
                          <td className="p-2.5 text-center text-zinc-400">{yr.g}</td>
                          <td className="p-2.5 text-center">{yr.passCmpAtt}</td>
                          <td className="p-2.5 text-center">{yr.passYds}</td>
                          <td className="p-2.5 text-center text-emerald-400">{yr.passTd}</td>
                          <td className="p-2.5 text-center text-red-400">{yr.int}</td>
                          <td className="p-2.5 text-center">{yr.rushYds}</td>
                          <td className="p-2.5 text-center text-emerald-400">{yr.rushTd}</td>
                          <td className="p-2.5 text-center text-[#1b75bb]">{yr.fpts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
}