"use client";
import React, { useState, useEffect } from 'react';
import { Settings, X, Search, Trash2 } from 'lucide-react';

export default function BoomBustStreamTool() {
  // --- STATE ---
  const [showSettings, setShowSettings] = useState(false);
  const [playerDB, setPlayerDB] = useState({});
  const [topPlayers, setTopPlayers] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  
  const [bgUrl, setBgUrl] = useState('');
  const [layoutMode, setLayoutMode] = useState('2-col');
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');

  // Columns & Selected Players State
  const [columns, setColumns] = useState({
    '2-col': [
      { id: 'col-2-1', title: 'BOOM 🚀', players: [], color: 'text-emerald-500' },
      { id: 'col-2-2', title: 'POOL', players: [], color: 'text-zinc-500' },
      { id: 'col-2-3', title: 'BUST 👎', players: [], color: 'text-red-500' }
    ],
    '4-col': [
      { id: 'col-4-1', title: 'STOCK', players: [], color: 'text-cyan-500' },
      { id: 'col-4-2', title: 'BUY', players: [], color: 'text-emerald-500' },
      { id: 'col-4-3', title: 'HOLD', players: [], color: 'text-amber-500' },
      { id: 'col-4-4', title: 'SELL', players: [], color: 'text-red-500' }
    ]
  });

  // Drag and Drop Indicator State
  const [dragState, setDragState] = useState({
    playerId: null,
    sourceColId: null,
    overColId: null,
    overPlayerId: null,
    dropEdge: null // 'top' or 'bottom'
  });

  // --- INITIALIZATION & LOCAL STORAGE ---
  useEffect(() => {
    const savedCols = localStorage.getItem('bb_columns');
    const savedMode = localStorage.getItem('bb_mode');
    const savedBg = localStorage.getItem('bb_bg');

    if (savedCols) setColumns(JSON.parse(savedCols));
    if (savedMode) setLayoutMode(savedMode);
    if (savedBg) setBgUrl(savedBg);

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
        } catch(e) { console.warn("Custom DB fetch failed"); }

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
      } catch (err) {
        console.warn("Could not load player databases:", err);
      } finally {
        setDbLoading(false);
      }
    };
    
    loadPlayerDatabases();
  }, []);

  useEffect(() => {
    localStorage.setItem('bb_columns', JSON.stringify(columns));
    localStorage.setItem('bb_mode', layoutMode);
    localStorage.setItem('bb_bg', bgUrl);
  }, [columns, layoutMode, bgUrl]);

  // --- DASHBOARD LOGIC ---
  const handlePlayerToggle = (playerId) => {
    setColumns(prev => {
      const newCols = { ...prev };
      
      let exists = false;
      newCols[layoutMode].forEach(col => {
        if (col.players.includes(playerId)) exists = true;
      });

      if (exists) {
        newCols[layoutMode] = newCols[layoutMode].map(col => ({
          ...col,
          players: col.players.filter(id => id !== playerId)
        }));
      } else {
        const targetColIdx = layoutMode === '2-col' ? 1 : 0; 
        newCols[layoutMode][targetColIdx].players.push(playerId);
      }
      return newCols;
    });
  };

  const handleClearAll = () => {
    setColumns(prev => {
      const newCols = { ...prev };
      newCols[layoutMode] = newCols[layoutMode].map(col => ({ ...col, players: [] }));
      return newCols;
    });
  };

  const updateHeader = (colIdx, newTitle) => {
    setColumns(prev => {
      const newCols = { ...prev };
      newCols[layoutMode][colIdx].title = newTitle;
      return newCols;
    });
  };

  // --- DRAG AND DROP LOGIC (WITH REORDERING) ---
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
      const currentLayoutCols = [...newCols[layoutMode]].map(col => ({ ...col, players: [...col.players] }));
      
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
      return newCols;
    });

    handleDragEnd(); 
  };

  // --- UI HELPERS ---
  const getPosColor = (position) => {
    switch (position) {
      case 'QB': return 'text-cyan-400';
      case 'RB': return 'text-emerald-500';
      case 'WR': return 'text-amber-500';
      case 'TE': return 'text-red-500';
      default: return 'text-zinc-400';
    }
  };

  // Converts text color (text-red-500) to border color (border-red-500)
  const getBorderColor = (textColorClass) => {
    if (!textColorClass) return 'border-zinc-800';
    return textColorClass.replace('text-', 'border-');
  };

  const getESPNHeadshot = (espnId) => `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${espnId}.png&w=350&h=254`;

  // --- RENDER COMPACT PLAYER LIST ITEM ---
  const renderPlayerCard = (playerId, col) => {
    const dbPlayer = playerDB[playerId];
    if (!dbPlayer) return null;

    const firstName = dbPlayer.first_name || "";
    const lastName = dbPlayer.last_name || "";
    const position = dbPlayer.position || "UNK";
    const team = dbPlayer.team ? dbPlayer.team.toLowerCase() : "fa";
    
    const posColor = getPosColor(position);
    // Dynamically match the border color to the column's header color
    const cardBorderColor = getBorderColor(col.color);
    
    const teamLogo = team !== 'fa' ? `https://sleepercdn.com/images/team_logos/nfl/${team}.png` : null;
    let playerImage = dbPlayer?.espn_id 
      ? getESPNHeadshot(dbPlayer.espn_id) 
      : `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;

    const isDragging = dragState.playerId === playerId;
    const isOver = dragState.overPlayerId === playerId;
    const showTopIndicator = isOver && dragState.dropEdge === 'top';
    const showBottomIndicator = isOver && dragState.dropEdge === 'bottom';

    return (
      <div key={playerId} className="relative w-full">
        {/* Drop Indicator (Top) */}
        <div className={`h-[3px] rounded-full bg-[#1b75bb] transition-all duration-200 ${showTopIndicator ? 'opacity-100 my-1' : 'opacity-0 h-0 my-0'}`} />
        
        <div 
          draggable
          onDragStart={(e) => handleDragStart(e, playerId, col.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, col.id, playerId)}
          onDrop={(e) => handleDrop(e, col.id)}
          className={`relative h-[68px] flex items-center p-2 rounded-[14px] border transition-all cursor-grab active:cursor-grabbing shadow-lg overflow-hidden
            ${isDragging ? 'opacity-40 border-gray-700 bg-black' : `opacity-100 hover:brightness-125 bg-[#111] ${cardBorderColor}`}
          `}
        >
          {/* Faded Background Team Logo */}
          {teamLogo && (
             <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-[180%] w-auto opacity-10 pointer-events-none z-0">
                <img src={teamLogo} className="h-full w-auto object-contain" alt="" onError={(e) => e.target.style.display = 'none'} />
             </div>
          )}

          {/* Position Badge */}
          <div className={`w-[42px] flex justify-center text-[12px] font-black uppercase tracking-widest ${posColor} drop-shadow-md z-10 shrink-0`}>
            {position}
          </div>

          {/* Headshot Circle */}
          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner z-10">
            <img 
              src={playerImage} 
              alt={lastName}
              className="w-full h-full object-cover object-top scale-[1.15] translate-y-1"
              onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
            />
          </div>

          {/* Name & Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center ml-3 z-10">
            <div className="flex items-baseline truncate">
              <span className="text-white font-black text-[16px] tracking-wide truncate drop-shadow-md leading-none">
                {firstName.charAt(0)}. {lastName.toUpperCase()}
              </span>
            </div>
            {team !== 'fa' && (
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                {team}
              </div>
            )}
          </div>
        </div>

        {/* Drop Indicator (Bottom) */}
        <div className={`h-[3px] rounded-full bg-[#1b75bb] transition-all duration-200 ${showBottomIndicator ? 'opacity-100 my-1' : 'opacity-0 h-0 my-0'}`} />
      </div>
    );
  };

  // --- RENDER PAGE ---
  return (
    <div className="fixed inset-0 z-[9999] bg-[#09090b] text-gray-300 font-sans overflow-y-auto selection:bg-[#1b75bb] selection:text-white"
         style={{ backgroundImage: bgUrl ? `url('${bgUrl}')` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      
      {bgUrl && <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-none z-0" />}

      <div className="relative z-10 min-h-screen p-4 md:p-8 flex flex-col">
        
        {/* Stream Display View */}
        {!showSettings && (
          <div className="flex-1 flex flex-col">
            <button onClick={() => setShowSettings(true)} className="absolute top-4 right-4 bg-black/50 p-3 rounded-full hover:bg-black/80 text-zinc-400 hover:text-white transition-colors backdrop-blur-md border border-zinc-800">
              <Settings size={24} />
            </button>

            <div className={`grid gap-6 flex-1 mt-12 ${layoutMode === '2-col' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'}`}>
              {columns[layoutMode].map((col) => {
                const colBorderColor = getBorderColor(col.color);
                
                return (
                  <div 
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`bg-black/60 backdrop-blur-xl border-2 ${colBorderColor}/40 rounded-3xl p-5 flex flex-col shadow-2xl transition-colors`}
                    style={{ minHeight: '70vh' }}
                  >
                    <h2 className={`text-2xl font-black text-center mb-5 uppercase tracking-widest italic drop-shadow-lg ${col.color}`}>
                      {col.title}
                    </h2>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-1.5 pb-20">
                      {col.players.map(playerId => renderPlayerCard(playerId, col))}
                      {col.players.length === 0 && (
                        <div className="h-full min-h-[150px] flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-xs text-center border-2 border-dashed border-zinc-800/50 rounded-2xl p-6 pointer-events-none">
                          Drop Players Here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dashboard Settings View */}
        {showSettings && (
          <div className="bg-[#151515] border border-gray-800 rounded-3xl p-8 w-full max-w-5xl mx-auto shadow-2xl animate-in fade-in zoom-in-95 mt-10">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Control Dashboard</h1>
              <button onClick={() => setShowSettings(false)} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Settings Sidebar */}
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Layout Mode</label>
                  <div className="flex bg-black rounded-xl p-1 border border-gray-800">
                    <button onClick={() => setLayoutMode('2-col')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${layoutMode === '2-col' ? 'bg-[#1b75bb] text-white' : 'text-gray-400 hover:text-white'}`}>3 Columns</button>
                    <button onClick={() => setLayoutMode('4-col')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${layoutMode === '4-col' ? 'bg-[#1b75bb] text-white' : 'text-gray-400 hover:text-white'}`}>4 Columns</button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Column Headers</label>
                  <div className="space-y-3">
                    {columns[layoutMode].map((col, idx) => (
                      <input 
                        key={`input-${col.id}`}
                        type="text" 
                        value={col.title}
                        onChange={(e) => updateHeader(idx, e.target.value)}
                        className={`w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1b75bb] shadow-inner text-sm font-bold ${col.color}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Background Image URL</label>
                  <input 
                    type="text" 
                    value={bgUrl}
                    onChange={(e) => setBgUrl(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1b75bb] shadow-inner text-sm"
                    placeholder="https://..."
                  />
                </div>
                
                <button onClick={handleClearAll} className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-400 font-black uppercase tracking-widest text-xs px-6 py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Trash2 size={16} /> Clear All Selections
                </button>
              </div>

              {/* Player Selector Main Area */}
              <div className="lg:col-span-2 bg-black border border-gray-800 rounded-2xl p-6">
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Player Pool</label>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search players..." 
                      className="w-full bg-[#151515] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#1b75bb] text-sm"
                    />
                  </div>
                  <div className="flex bg-[#151515] border border-gray-800 rounded-xl p-1 overflow-x-auto custom-scrollbar">
                    {['ALL', 'QB', 'RB', 'WR', 'TE'].map(pos => (
                      <button 
                        key={pos}
                        onClick={() => setPosFilter(pos)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${posFilter === pos ? 'bg-zinc-700 text-white' : 'text-gray-500 hover:text-white'}`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-6">
                  {dbLoading ? (
                    <div className="col-span-full text-center py-12 text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Databases...</div>
                  ) : (
                    topPlayers
                      .filter(p => posFilter === 'ALL' || p.position === posFilter)
                      .filter(p => !searchTerm || p.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(player => {
                        let isSelected = false;
                        columns[layoutMode].forEach(col => {
                          if (col.players.includes(player.player_id)) isSelected = true;
                        });

                        return (
                          <div 
                            key={player.player_id}
                            onClick={() => handlePlayerToggle(player.player_id)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-[#1b75bb]/20 border-[#1b75bb]/50 shadow-inner' : 'bg-[#151515] border-gray-800 hover:border-gray-600 shadow-md'}`}
                          >
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

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
}