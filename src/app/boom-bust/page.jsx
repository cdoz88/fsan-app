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

  // --- INITIALIZATION & LOCAL STORAGE ---
  useEffect(() => {
    // Load saved data from local storage on mount
    const savedCols = localStorage.getItem('bb_columns');
    const savedMode = localStorage.getItem('bb_mode');
    const savedBg = localStorage.getItem('bb_bg');

    if (savedCols) setColumns(JSON.parse(savedCols));
    if (savedMode) setLayoutMode(savedMode);
    if (savedBg) setBgUrl(savedBg);

    // Fetch Player Databases (Matches DNO Graphic Logic)
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
          
          // Generate Top 400 for Dashboard
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

  // Save to local storage whenever critical state changes
  useEffect(() => {
    localStorage.setItem('bb_columns', JSON.stringify(columns));
    localStorage.setItem('bb_mode', layoutMode);
    localStorage.setItem('bb_bg', bgUrl);
  }, [columns, layoutMode, bgUrl]);

  // --- LOGIC ---
  const handlePlayerToggle = (playerId) => {
    setColumns(prev => {
      const newCols = { ...prev };
      
      // Check if player is already in the current layout
      let exists = false;
      newCols[layoutMode].forEach(col => {
        if (col.players.includes(playerId)) exists = true;
      });

      if (exists) {
        // Remove from all columns in current layout
        newCols[layoutMode] = newCols[layoutMode].map(col => ({
          ...col,
          players: col.players.filter(id => id !== playerId)
        }));
      } else {
        // Add to the middle/first pool column by default
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

  // --- DRAG AND DROP ---
  const handleDragStart = (e, playerId, sourceColId) => {
    e.dataTransfer.setData('playerId', playerId);
    e.dataTransfer.setData('sourceColId', sourceColId);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData('playerId');
    const sourceColId = e.dataTransfer.getData('sourceColId');
    
    if (sourceColId === targetColId) return;

    setColumns(prev => {
      const newCols = { ...prev };
      const currentLayoutCols = [...newCols[layoutMode]];
      
      const srcIdx = currentLayoutCols.findIndex(c => c.id === sourceColId);
      const tgtIdx = currentLayoutCols.findIndex(c => c.id === targetColId);

      // Remove from source
      currentLayoutCols[srcIdx].players = currentLayoutCols[srcIdx].players.filter(id => id !== playerId);
      // Add to target
      currentLayoutCols[tgtIdx].players.push(playerId);

      newCols[layoutMode] = currentLayoutCols;
      return newCols;
    });
  };

  // --- UI HELPERS ---
  const getCardStyle = (position) => {
    switch (position) {
      case 'QB': return { border: 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]', gradient: 'from-cyan-950/40 to-black', text: 'text-cyan-400' };
      case 'RB': return { border: 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]', gradient: 'from-emerald-950/40 to-black', text: 'text-emerald-500' };
      case 'WR': return { border: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]', gradient: 'from-amber-900/40 to-black', text: 'text-amber-500' };
      case 'TE': return { border: 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]', gradient: 'from-red-950/40 to-black', text: 'text-red-500' };
      default: return { border: 'border-zinc-500/60 shadow-[0_0_20px_rgba(113,113,122,0.15)]', gradient: 'from-zinc-800/40 to-black', text: 'text-zinc-400' };
    }
  };

  const getESPNHeadshot = (espnId) => `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${espnId}.png&w=350&h=254`;

  // --- RENDER PLAYER CARD ---
  const renderPlayerCard = (playerId, colId) => {
    const dbPlayer = playerDB[playerId];
    if (!dbPlayer) return null;

    const firstName = dbPlayer.first_name || "";
    const lastName = dbPlayer.last_name || "";
    const position = dbPlayer.position || "UNK";
    const team = dbPlayer.team ? dbPlayer.team.toLowerCase() : "fa";
    
    const cardStyle = getCardStyle(position);
    const teamLogo = team !== 'fa' ? `https://sleepercdn.com/images/team_logos/nfl/${team}.png` : null;
    
    let playerImage = dbPlayer?.espn_id 
      ? getESPNHeadshot(dbPlayer.espn_id) 
      : `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;

    return (
      <div 
        key={playerId} 
        draggable
        onDragStart={(e) => handleDragStart(e, playerId, colId)}
        onDragEnd={handleDragEnd}
        className="relative w-full h-[150px] flex flex-col justify-end group shadow-xl cursor-grab active:cursor-grabbing mb-4 transition-transform hover:scale-[1.02]"
      >
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${cardStyle.gradient} backdrop-blur-md border-2 ${cardStyle.border} overflow-hidden`}>
            {teamLogo && (
              <div className="absolute inset-x-0 top-0 z-0 flex items-start justify-center opacity-[0.25] pointer-events-none">
                <img src={teamLogo} className="w-[120%] max-w-none h-auto object-contain -translate-y-4 mix-blend-screen" alt="" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
        </div>

        <div className="absolute top-2 left-2 z-40">
            <span className="bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black tracking-widest text-zinc-200 border border-zinc-700/50 shadow-md uppercase">
              {position}
            </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center z-10 pointer-events-none h-[130%]">
            <img 
              src={playerImage} 
              className="w-auto h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter contrast-110 brightness-110 origin-bottom" 
              alt="" 
              onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
            />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black via-black/90 to-transparent z-20 rounded-b-2xl pointer-events-none" />

        <div className="relative z-30 px-3 pb-2 pt-2 mt-auto flex flex-col items-center text-center bg-transparent pointer-events-none w-full min-w-0">
            <div className={`text-[10px] font-bold tracking-widest uppercase leading-tight mb-0.5 ${cardStyle.text} drop-shadow-md`}>
              {firstName}
            </div>
            <div className="text-xl font-black text-white tracking-tight truncate w-full drop-shadow-lg leading-none">
              {lastName}
            </div>
        </div>
      </div>
    );
  };

  // --- RENDER ---
  return (
    // The fixed inset-0 wrapper forces this page to completely cover headers, footers, and global layouts!
    <div className="fixed inset-0 z-[9999] bg-[#09090b] text-gray-300 font-sans overflow-y-auto selection:bg-[#1b75bb] selection:text-white"
         style={{ backgroundImage: bgUrl ? `url('${bgUrl}')` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      
      {/* Dark Overlay for Readability if Background is set */}
      {bgUrl && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none z-0" />}

      {/* Main Content Area */}
      <div className="relative z-10 min-h-screen p-4 md:p-8 flex flex-col">
        
        {/* Stream Display View */}
        {!showSettings && (
          <div className="flex-1 flex flex-col">
            <button onClick={() => setShowSettings(true)} className="absolute top-4 right-4 bg-black/50 p-3 rounded-full hover:bg-black/80 text-zinc-400 hover:text-white transition-colors backdrop-blur-md border border-zinc-800">
              <Settings size={24} />
            </button>

            <div className={`grid gap-6 flex-1 mt-12 ${layoutMode === '2-col' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'}`}>
              {columns[layoutMode].map((col, idx) => (
                <div 
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="bg-black/40 backdrop-blur-md border border-zinc-800/80 rounded-3xl p-4 flex flex-col shadow-2xl transition-colors"
                >
                  <h2 className={`text-2xl font-black text-center mb-6 uppercase tracking-widest italic drop-shadow-lg ${col.color}`}>
                    {col.title}
                  </h2>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {col.players.map(playerId => renderPlayerCard(playerId, col.id))}
                    {col.players.length === 0 && (
                      <div className="h-full flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-xs text-center border-2 border-dashed border-zinc-800 rounded-2xl p-6">
                        Drop Players Here
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Settings View */}
        {showSettings && (
          <div className="bg-[#151515] border border-gray-800 rounded-3xl p-8 w-full max-w-5xl mx-auto shadow-2xl animate-in fade-in zoom-in-95">
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
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1b75bb] shadow-inner text-sm font-bold"
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
                  <div className="flex bg-[#151515] border border-gray-800 rounded-xl p-1">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {dbLoading ? (
                    <div className="col-span-full text-center py-12 text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Databases...</div>
                  ) : (
                    topPlayers
                      .filter(p => posFilter === 'ALL' || p.position === posFilter)
                      .filter(p => !searchTerm || p.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(player => {
                        // Check if player is selected in current layout
                        let isSelected = false;
                        columns[layoutMode].forEach(col => {
                          if (col.players.includes(player.player_id)) isSelected = true;
                        });

                        return (
                          <div 
                            key={player.player_id}
                            onClick={() => handlePlayerToggle(player.player_id)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${isSelected ? 'bg-[#1b75bb]/20 border-[#1b75bb]/50' : 'bg-[#151515] border-gray-800 hover:border-gray-600'}`}
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
}