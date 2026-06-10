'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Settings, RefreshCw } from 'lucide-react'; 

export default function RankingsModelClient({ initialRankings, mode, serverError }) {
  const [playersData, setPlayersData] = useState(initialRankings || []);
  const [isSyncing, setIsSyncing] = useState(true);

  // --- UI State Variables ---
  const [currentPosition, setCurrentPosition] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  
  // NEW DRAFT MODES: Redraft, Best Ball, Rookies
  const [rankingMode, setRankingMode] = useState('redraft'); 
  const isOffseason = mode === 'offseason';

  // Scoring Format State Variables
  const [isSuperflex, setIsSuperflex] = useState(false);
  const [pprValue, setPprValue] = useState(1);       
  const [passTdValue, setPassTdValue] = useState(4); 
  const [tePremium, setTePremium] = useState(0);     

  // Theme Constants
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

  // ⚡ DYNAMIC RECALCULATION ENGINE
  const processedRankings = useMemo(() => {
    let filteredData = playersData || [];

    // If Rookies mode is active, filter out veterans (years_exp > 0)
    if (rankingMode === 'rookies') {
      filteredData = filteredData.filter(player => player.years_exp === 0);
    }

    const recalculated = filteredData.map(player => {
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

      // Best Ball bumps volatile, high-ceiling assets (like Deep Threat WRs or Mobile QBs)
      if (rankingMode === 'bestball') {
         if (player.position === 'WR') pts *= 1.05; // Spike week bump
         if (player.position === 'QB' && player.rush_yds > 300) pts *= 1.05; // Konami Code bump
      }

      // VORP Positional Adjustments
      if (player.position === 'QB') {
        if (isSuperflex) {
          pts *= 0.95; 
        } else {
          pts *= 0.65; 
        }
      } else if (player.position === 'TE' || player.position === 'WR/TE') {
        pts *= 1.15; 
      } else {
        pts *= 1.05; 
      }

      return {
        ...player,
        projected_points: Number(pts.toFixed(1))
      };
    });

    recalculated.sort((a, b) => b.projected_points - a.projected_points);

    const posCounters = {};
    return recalculated.map((player, index) => {
      const pos = player.position || 'UNK';
      if (!posCounters[pos]) posCounters[pos] = 0;
      posCounters[pos] += 1;
      
      return {
        ...player,
        overallRank: index + 1,
        posRank: `${pos}${posCounters[pos]}`
      };
    });
  }, [playersData, pprValue, passTdValue, tePremium, isSuperflex, rankingMode]); 

  const visibleData = processedRankings.filter((player) => {
    if (currentPosition === 'All') return true;
    if (player.position === 'WR/TE') {
      return currentPosition === 'WR' || currentPosition === 'TE';
    }
    return player.position === currentPosition;
  });

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative">

      {serverError && (
        <div className="mt-6 mb-2 p-4 bg-red-900/30 border border-red-800 rounded-2xl text-red-200 text-xs font-mono font-bold tracking-wide">
          ⚠️ Vegas Engine Diagnostics Notice: {serverError}
        </div>
      )}

      {/* Red Hero Section */}
      <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-8 mt-6 shadow-2xl">
        <div 
          className="absolute inset-0 opacity-80 z-0" 
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        />
        <img 
          src={bgImage} 
          alt="Football Background" 
          className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between h-full px-6 md:px-10 pb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              {rankingMode === 'bestball' ? 'Best Ball Rankings' : rankingMode === 'rookies' ? 'Rookie Draft Board' : (isOffseason ? 'Preseason Rankings' : 'Weekly Rankings')}
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              {rankingMode === 'bestball' 
                ? 'Optimized for high-variance spike weeks and maximum ceiling outcomes.'
                : rankingMode === 'rookies'
                  ? 'Incoming rookie prospects ranked by projected year-one output.'
                  : 'Aggregated baseline projections modeled from Vegas lines & consensus data.'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Controls Row */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          
          <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
            {/* Mode Toggle */}
            <div className="flex bg-[#111] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
              <button 
                onClick={() => setRankingMode('redraft')}
                className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  rankingMode === 'redraft' 
                  ? 'bg-white text-black shadow-md' 
                  : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                Redraft
              </button>
              <button 
                onClick={() => setRankingMode('bestball')}
                className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  rankingMode === 'bestball' 
                  ? 'bg-white text-black shadow-md' 
                  : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                Best Ball
              </button>
              <button 
                onClick={() => setRankingMode('rookies')}
                className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  rankingMode === 'rookies' 
                  ? 'bg-white text-black shadow-md' 
                  : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                Rookies
              </button>
            </div>

            {/* Position Filters */}
            <div className="flex flex-wrap gap-2 bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
               {positions.map(pos => (
                  <button 
                     key={pos} 
                     onClick={() => setCurrentPosition(pos)}
                     className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                       currentPosition === pos 
                        ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                        : 'text-gray-500 hover:text-white hover:bg-[#252525]'
                     }`}
                  >
                     {pos}
                  </button>
               ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto xl:justify-end">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ml-auto xl:ml-0 ${
                showSettings 
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <Settings size={16} /> 
              {showSettings ? 'Hide Scoring' : 'Custom Scoring'}
            </button>
          </div>
        </div>

        {/* Custom Scoring Panel */}
        {showSettings && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6">
               Adjust League Scoring Format
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
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
                    <button 
                      key={opt.label} onClick={() => setPprValue(opt.val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pprValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Passing TDs</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: '4 PTS', val: 4 }, { label: '6 PTS', val: 6 }].map(opt => (
                    <button 
                      key={opt.label} onClick={() => setPassTdValue(opt.val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${passTdValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">TE Premium Bonus</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: 'NONE', val: 0 }, { label: '+0.5', val: 0.5 }, { label: '+1.0', val: 1 }].map(opt => (
                    <button 
                      key={opt.label} onClick={() => setTePremium(opt.val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tePremium === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dark Table Container */}
        <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-[400px]">
          
          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full text-left whitespace-nowrap">
              <thead className="bg-[#1a1a1a] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Ovr</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pos Rank</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                  
                  {!isOffseason && <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Game</th>}
                  <th className="px-4 py-3 text-[10px] font-black text-red-500 uppercase tracking-widest text-center bg-red-900/10 border-x border-gray-800">Proj Pts</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pass Yds</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center border-r border-gray-800">Pass TD</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rush Yds</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center border-r border-gray-800">Rush TD</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Recs</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rec Yds</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center border-r border-gray-800">Rec TD</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">TOs</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-800/50">
                {isSyncing ? (
                  <tr>
                    <td colSpan="14" className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center text-red-500 animate-in fade-in duration-500">
                        <RefreshCw className="animate-spin mb-4" size={36} />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Syncing Live Player Data</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Connecting to Sleeper API & Vegas Baseline</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleData && visibleData.length > 0 ? (
                  // 🛡️ THE FIX: We map with (player, idx) and use idx in the key to prevent freezing!
                  visibleData.map((player, idx) => (
                    <tr key={`${player.name}-${player.position}-${idx}`} className="hover:bg-[#151515] transition-colors group">
                      
                      <td className="px-4 py-2.5">
                        <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-gray-800 text-gray-300 border border-gray-700 shadow-inner group-hover:bg-gray-700 group-hover:text-white transition-colors">
                          {player.overallRank}
                        </div>
                      </td>
                      
                      <td className="px-4 py-2.5 text-center">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                           {player.posRank}
                         </span>
                      </td>

                      <td className="px-4 py-2.5">
                         <div className="flex items-center gap-3">
                           <span className="text-sm font-black text-gray-100 tracking-tight">
                             {player.name}
                           </span>
                           {player.team && player.team !== 'fa' && (
                             <img 
                               src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.team.toLowerCase()}.png`} 
                               alt={player.team}
                               className="w-6 h-6 object-contain drop-shadow-md"
                               onError={(e) => e.target.style.display = 'none'}
                             />
                           )}
                         </div>
                      </td>
                      
                      {!isOffseason && <td className="px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">{player.game}</td>}
                      <td className="px-4 py-2.5 text-center bg-red-900/5 border-x border-gray-800/50">
                         <div className="text-sm font-black text-white">
                           {player.projected_points}
                         </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player.pass_yds || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400 border-r border-gray-800/50">{player.pass_tds || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player.rush_yds || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400 border-r border-gray-800/50">{player.rush_tds || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player.receptions || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player.rec_yds || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400 border-r border-gray-800/50">{player.rec_tds || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{(player.turnovers || player.ints || player.fumbles) ? (player.ints || 0) + (player.fumbles || 0) : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="py-20 text-center">
                      <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Data Available</h3>
                      <p className="text-gray-500 font-bold">No {currentPosition} projections match current filter indexes.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Ranking Methodology</h3>
          <div className="text-xs text-gray-400 space-y-2 font-medium leading-relaxed">
            <p>• Projections are an aggregation of custom Vegas lines & Consensus expected output metrics.</p>
            <p>• Player fantasy points recalculate instantly to mirror custom PPR, TE Premium, and Superflex scarcity modifiers.</p>
            <p>• <strong>Best Ball</strong> mode algorithmically isolates and bumps variance-heavy profiles (like Konami-code QBs and deep-threat WRs).</p>
          </div>
        </div>

      </div>
    </div>
  );
}