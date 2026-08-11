"use client";
import React, { useState, useEffect } from 'react';
import { Search, X, Settings, DollarSign, Trash2 } from 'lucide-react';
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

const POSITIONS = ['QB', 'RB', 'WR', 'TE'];

const DEFAULT_WAIVER_DATA = {
  QB: { wireId: null, cutId: null, faab: '' },
  RB: { wireId: null, cutId: null, faab: '' },
  WR: { wireId: null, cutId: null, faab: '' },
  TE: { wireId: null, cutId: null, faab: '' }
};

export default function WaiverTab() {
  const [activeWirePos, setActiveWirePos] = useState(null);
  const [activeCutPos, setActiveCutPos] = useState(null);
  const [faabRevealed, setFaabRevealed] = useState({ QB: false, RB: false, WR: false, TE: false });
  const [waiverData, setWaiverData] = useState(DEFAULT_WAIVER_DATA);

  const [showSettings, setShowSettings] = useState(false);
  const [playerDB, setPlayerDB] = useState({});
  const [topPlayers, setTopPlayers] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');

  const [editingPos, setEditingPos] = useState('QB');
  const [editingType, setEditingType] = useState('wire'); // 'wire' or 'cut'

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
             if (mergedDB[key]) mergedDB[key] = { ...mergedDB[key], ...customMap[key] };
          });
          setPlayerDB(mergedDB);
          
          const top = Object.values(mergedDB)
            .filter(p => p.active && p.team && POSITIONS.includes(p.position) && p.search_rank)
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

  const getESPNHeadshot = (espnId) => `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${espnId}.png&w=400&h=300`;

  const renderCard = (playerId, isWire = true) => {
    const player = playerDB[playerId];
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

    return (
      <div className={`w-full max-w-md h-[280px] rounded-[24px] border-[3px] ${cardBorderColor} bg-zinc-950 relative flex flex-col shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95`}>
        
        {/* Background Container (Clipped to inner border) */}
        <div className="absolute inset-0 rounded-[20px] overflow-hidden z-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-90"
            style={{ background: `linear-gradient(135deg, ${tColors.primary}70 0%, ${tColors.secondary}40 50%, #0a0a0c 100%)` }}
          />
          {teamLogo && (
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
            {team} • #{player.number || '00'}
          </span>
        </div>

        {/* Player Image Wrapper - Extends way above card to allow head overflow, clips bottom corners */}
        <div className="absolute inset-x-0 bottom-0 h-[140%] rounded-b-[20px] overflow-hidden z-10 flex items-end justify-center pointer-events-none">
          <img 
            src={playerImage} 
            alt={lastName}
            className="w-auto h-[95%] object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] filter contrast-110 brightness-105 origin-bottom"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

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
      </div>
    );
  };

  const wirePlayer = activeWirePos ? waiverData[activeWirePos]?.wireId : null;
  const cutPlayer = activeCutPos ? waiverData[activeCutPos]?.cutId : null;
  const currentFaabValue = activeWirePos ? waiverData[activeWirePos]?.faab : null;
  const isRevealed = activeWirePos ? faabRevealed[activeWirePos] : false;

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

        {/* CENTER DIVIDER */}
        <div className="w-px h-[280px] bg-gradient-to-b from-transparent via-zinc-800 to-transparent shrink-0" />

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
                  const data = waiverData[pos];
                  const wireP = playerDB[data.wireId];
                  const cutP = playerDB[data.cutId];

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
                    {['ALL', 'QB', 'RB', 'WR', 'TE'].map(pos => (
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
                              src={player.espn_id ? getESPNHeadshot(player.espn_id) : `https://sleepercdn.com/content/nfl/players/thumb/${player.player_id}.jpg`} 
                              alt="" 
                              className="w-8 h-8 rounded-lg object-cover bg-black shrink-0" 
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