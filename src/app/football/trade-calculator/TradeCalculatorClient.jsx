'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Settings, Search, X, RefreshCw, ArrowRightLeft } from 'lucide-react'; 

export default function TradeCalculatorClient() {
  const [playersData, setPlayersData] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);

  // --- Trade Teams State ---
  const [teamAStrategy, setTeamAStrategy] = useState('win_now');
  const [teamBStrategy, setTeamBStrategy] = useState('build');
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  
  // --- Search Input States ---
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');

  // --- Scoring Format Settings ---
  const [showSettings, setShowSettings] = useState(false);
  const [isSuperflex, setIsSuperflex] = useState(false); 
  const [pprValue, setPprValue] = useState(1);       
  const [passTdValue, setPassTdValue] = useState(4); 
  const [tePremium, setTePremium] = useState(0);     

  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#e42d38';
  const secondaryColor = '#8a1a20';

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

  const getAgeMultiplier = (position, age, strategy) => {
    if (!age) return 1; 
    if (strategy === 'build') {
      if (position === 'RB') return age <= 23 ? 1.35 : age <= 25 ? 1.10 : age <= 27 ? 0.75 : 0.30;
      if (position === 'WR') return age <= 24 ? 1.30 : age <= 26 ? 1.15 : age <= 29 ? 0.85 : 0.40;
      if (position === 'QB') return age <= 26 ? 1.25 : age <= 33 ? 1.05 : age <= 36 ? 0.80 : 0.40;
      if (position === 'TE' || position === 'WR/TE') return age <= 25 ? 1.25 : age <= 28 ? 1.05 : age <= 30 ? 0.80 : 0.35;
    }
    if (strategy === 'win_now') {
      if (position === 'RB') return age <= 25 ? 1.10 : age <= 27 ? 1.05 : age <= 29 ? 0.90 : 0.60;
      if (position === 'WR') return age <= 26 ? 1.05 : age <= 29 ? 1.05 : age <= 31 ? 0.95 : 0.75;
      if (position === 'QB') return age <= 33 ? 1.05 : age <= 36 ? 0.95 : 0.75;
      if (position === 'TE' || position === 'WR/TE') return age <= 27 ? 1.05 : age <= 30 ? 1.00 : age <= 32 ? 0.90 : 0.65;
    }
    // Neutral / Balanced Base
    if (position === 'RB') return age <= 23 ? 1.20 : age <= 25 ? 1.05 : age <= 27 ? 0.85 : age <= 29 ? 0.55 : 0.25;
    if (position === 'WR') return age <= 24 ? 1.15 : age <= 27 ? 1.05 : age <= 29 ? 0.90 : age <= 31 ? 0.70 : 0.45;
    if (position === 'QB') return age <= 26 ? 1.15 : age <= 33 ? 1.05 : age <= 36 ? 0.85 : 0.50;
    if (position === 'TE' || position === 'WR/TE') return age <= 25 ? 1.15 : age <= 28 ? 1.00 : age <= 30 ? 0.85 : age <= 32 ? 0.65 : 0.40;
    return 1;
  };

  const getPlayerValue = (player, strategy) => {
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

    if (player.position === 'QB') {
      pts *= isSuperflex ? 1.0 : 0.60; 
    } else {
      pts *= 1.0;  
    }

    const ageMult = getAgeMultiplier(player.position, player.age, strategy);
    return Math.round(pts * ageMult * 2.5);
  };

  // --- Dynamic Totals ---
  const totalA = useMemo(() => {
    return teamAPlayers.reduce((sum, p) => sum + getPlayerValue(p, teamAStrategy), 0);
  }, [teamAPlayers, teamAStrategy, isSuperflex, pprValue, passTdValue, tePremium]);

  const totalB = useMemo(() => {
    return teamBPlayers.reduce((sum, p) => sum + getPlayerValue(p, teamBStrategy), 0);
  }, [teamBPlayers, teamBStrategy, isSuperflex, pprValue, passTdValue, tePremium]);

  // --- Verdict Logic ---
  const totalBoth = totalA + totalB;
  const diff = Math.abs(totalA - totalB);
  let verdictText = "Add players to evaluate trade";
  let verdictColor = "text-gray-500";
  let barAWidth = 50;
  let barBWidth = 50;

  if (totalBoth > 0) {
      barAWidth = (totalA / totalBoth) * 100;
      barBWidth = (totalB / totalBoth) * 100;

      if (diff <= (totalBoth * 0.05)) {
          verdictText = "🤝 Fair Trade for Both Managers";
          verdictColor = "text-zinc-300";
      } else if (totalA > totalB) {
          verdictText = `🏆 Team A wins by ${diff} points`;
          verdictColor = "text-red-500";
      } else {
          verdictText = `🏆 Team B wins by ${diff} points`;
          verdictColor = "text-blue-500";
      }
  }

  // --- Helpers ---
  const addPlayer = (player, team) => {
      if (team === 'A') {
          if (!teamAPlayers.some(p => p.name === player.name) && !teamBPlayers.some(p => p.name === player.name)) {
              setTeamAPlayers([...teamAPlayers, player]);
          }
      } else {
          if (!teamAPlayers.some(p => p.name === player.name) && !teamBPlayers.some(p => p.name === player.name)) {
              setTeamBPlayers([...teamBPlayers, player]);
          }
      }
  };

  const removePlayer = (player, team) => {
      if (team === 'A') {
          setTeamAPlayers(teamAPlayers.filter(p => p.name !== player.name));
      } else {
          setTeamBPlayers(teamBPlayers.filter(p => p.name !== player.name));
      }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative">
      
      {/* Hero Section */}
      <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-8 mt-6 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }} />
        <img src={bgImage} alt="Football Background" className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between h-full px-6 md:px-10 pb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              Trade Calculator
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Dynasty trade analyzer with asymmetric strategy evaluations.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-end gap-4 mb-6">
          <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${showSettings ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'}`}>
            <Settings size={16} /> {showSettings ? 'Hide Settings' : 'Custom League Scoring'}
          </button>
        </div>

        {/* Custom Scoring Panel */}
        {showSettings && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">League Type</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  <button onClick={() => setIsSuperflex(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isSuperflex ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>1QB</button>
                  <button onClick={() => setIsSuperflex(true)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${isSuperflex ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>SUPERFLEX</button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Receptions (PPR)</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: 'STD', val: 0 }, { label: 'HALF', val: 0.5 }, { label: 'FULL', val: 1 }].map(opt => (
                    <button key={opt.label} onClick={() => setPprValue(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pprValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Passing TDs</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: '4 PTS', val: 4 }, { label: '6 PTS', val: 6 }].map(opt => (
                    <button key={opt.label} onClick={() => setPassTdValue(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${passTdValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">TE Premium</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: 'NONE', val: 0 }, { label: '+0.5', val: 0.5 }, { label: '+1.0', val: 1 }].map(opt => (
                    <button key={opt.label} onClick={() => setTePremium(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tePremium === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
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
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 shadow-xl">
                    <h2 className={`text-center text-xl font-black uppercase tracking-widest mb-6 ${verdictColor}`}>
                        {verdictText}
                    </h2>
                    <div className="w-full h-4 rounded-full bg-[#111] flex overflow-hidden border border-gray-800 shadow-inner">
                        <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${barAWidth}%` }} />
                        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${barBWidth}%` }} />
                    </div>
                </div>

                {/* TWO COLUMN LAYOUT */}
                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* TEAM A PANE */}
                    <div className="flex-1 bg-[#111] border-2 border-red-900/30 rounded-3xl p-6 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Team A Receives</h3>
                            <select 
                                value={teamAStrategy} 
                                onChange={(e) => setTeamAStrategy(e.target.value)}
                                className="bg-[#1a1a1a] border border-red-900/50 text-white rounded-xl py-2 px-4 shadow-sm focus:outline-none font-bold text-xs tracking-wide"
                            >
                                <option value="win_now">🏆 Win Now</option>
                                <option value="neutral">⚖️ Balanced</option>
                                <option value="build">🌱 Rebuild</option>
                            </select>
                        </div>

                        {/* Search Bar A */}
                        <div className="relative mb-6">
                            <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
                                <Search size={18} className="text-gray-500 mr-3" />
                                <input 
                                    type="text" 
                                    placeholder="Search players to add to Team A..." 
                                    className="bg-transparent text-white outline-none w-full text-sm font-bold placeholder-gray-600"
                                    value={queryA}
                                    onChange={e => setQueryA(e.target.value)}
                                />
                            </div>
                            {queryA.length > 1 && (
                                <div className="absolute z-50 top-full mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                    {playersData.filter(p => p.name.toLowerCase().includes(queryA.toLowerCase())).slice(0, 8).map(p => (
                                        <div key={p.name} className="px-4 py-3 hover:bg-[#252525] cursor-pointer flex justify-between items-center border-b border-gray-800/50" onClick={() => { addPlayer(p, 'A'); setQueryA(''); }}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-white">{p.name}</span>
                                                <span className="text-[10px] font-black bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">{p.position}</span>
                                            </div>
                                            <span className="text-xs font-black text-gray-400">{getPlayerValue(p, teamAStrategy)} pts</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Team A Players */}
                        <div className="space-y-3 min-h-[150px]">
                            {teamAPlayers.length === 0 ? (
                                <div className="text-center py-10 text-gray-600 font-bold text-xs uppercase tracking-widest">No players added</div>
                            ) : teamAPlayers.map(p => (
                                <div key={p.name} className="flex justify-between items-center bg-[#1a1a1a] border border-red-900/20 p-4 rounded-2xl group transition-all hover:border-red-500/50">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => removePlayer(p, 'A')} className="text-gray-600 hover:text-red-500 transition-colors">
                                            <X size={18} />
                                        </button>
                                        <div>
                                            <div className="text-sm font-black text-white">{p.name}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} • {p.age} y/o</div>
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-white">{getPlayerValue(p, teamAStrategy)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Team A Totals */}
                        <div className="mt-8 pt-4 border-t border-red-900/30 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Value Received</span>
                            <span className="text-4xl font-black text-red-500">{totalA}</span>
                        </div>
                    </div>

                    {/* TEAM B PANE */}
                    <div className="flex-1 bg-[#111] border-2 border-blue-900/30 rounded-3xl p-6 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Team B Receives</h3>
                            <select 
                                value={teamBStrategy} 
                                onChange={(e) => setTeamBStrategy(e.target.value)}
                                className="bg-[#1a1a1a] border border-blue-900/50 text-white rounded-xl py-2 px-4 shadow-sm focus:outline-none font-bold text-xs tracking-wide"
                            >
                                <option value="win_now">🏆 Win Now</option>
                                <option value="neutral">⚖️ Balanced</option>
                                <option value="build">🌱 Rebuild</option>
                            </select>
                        </div>

                        {/* Search Bar B */}
                        <div className="relative mb-6">
                            <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
                                <Search size={18} className="text-gray-500 mr-3" />
                                <input 
                                    type="text" 
                                    placeholder="Search players to add to Team B..." 
                                    className="bg-transparent text-white outline-none w-full text-sm font-bold placeholder-gray-600"
                                    value={queryB}
                                    onChange={e => setQueryB(e.target.value)}
                                />
                            </div>
                            {queryB.length > 1 && (
                                <div className="absolute z-50 top-full mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                    {playersData.filter(p => p.name.toLowerCase().includes(queryB.toLowerCase())).slice(0, 8).map(p => (
                                        <div key={p.name} className="px-4 py-3 hover:bg-[#252525] cursor-pointer flex justify-between items-center border-b border-gray-800/50" onClick={() => { addPlayer(p, 'B'); setQueryB(''); }}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-white">{p.name}</span>
                                                <span className="text-[10px] font-black bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">{p.position}</span>
                                            </div>
                                            <span className="text-xs font-black text-gray-400">{getPlayerValue(p, teamBStrategy)} pts</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Team B Players */}
                        <div className="space-y-3 min-h-[150px]">
                            {teamBPlayers.length === 0 ? (
                                <div className="text-center py-10 text-gray-600 font-bold text-xs uppercase tracking-widest">No players added</div>
                            ) : teamBPlayers.map(p => (
                                <div key={p.name} className="flex justify-between items-center bg-[#1a1a1a] border border-blue-900/20 p-4 rounded-2xl group transition-all hover:border-blue-500/50">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => removePlayer(p, 'B')} className="text-gray-600 hover:text-blue-500 transition-colors">
                                            <X size={18} />
                                        </button>
                                        <div>
                                            <div className="text-sm font-black text-white">{p.name}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} • {p.age} y/o</div>
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-white">{getPlayerValue(p, teamBStrategy)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Team B Totals */}
                        <div className="mt-8 pt-4 border-t border-blue-900/30 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Value Received</span>
                            <span className="text-4xl font-black text-blue-500">{totalB}</span>
                        </div>
                    </div>

                </div>
            </div>
        )}

      </div>
    </div>
  );
}