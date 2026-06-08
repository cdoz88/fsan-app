'use client';

import React, { useState, useMemo } from 'react';
import { Settings, ShieldAlert, TrendingUp, RefreshCw } from 'lucide-react'; 
import { FootballIcon } from '../../../components/icons';

export default function RankingsModelClient({ initialRankings, mode, serverError }) {
  const [currentPosition, setCurrentPosition] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [rankingMode, setRankingMode] = useState('redraft'); // 'redraft' or 'dynasty'
  const [dynastyStrategy, setDynastyStrategy] = useState('neutral'); // 'win_now', 'neutral', 'build'
  const isOffseason = mode === 'offseason';

  // Scoring Format State Variables
  const [pprValue, setPprValue] = useState(1);       
  const [passTdValue, setPassTdValue] = useState(4); 
  const [tePremium, setTePremium] = useState(0);     

  // Vegas Football Theme Constants
  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#e42d38';
  const secondaryColor = '#8a1a20';

  // 🧠 Algorithmic Dynasty Age Multiplier tilted by Team Strategy
  const getAgeMultiplier = (position, age, strategy) => {
    if (!age) return 1; 

    // STRATEGY A: PRODUCTIVE STRUGGLE / REBUILD (Heavy premium on youth, completely crush older assets)
    if (strategy === 'build') {
      if (position === 'RB') {
        if (age <= 23) return 1.65;
        if (age <= 25) return 1.15;
        if (age <= 27) return 0.65;
        return 0.10;
      }
      if (position === 'WR') {
        if (age <= 23) return 1.55;
        if (age <= 26) return 1.25;
        if (age <= 29) return 0.80;
        return 0.20;
      }
      if (position === 'QB') {
        if (age <= 24) return 1.45;
        if (age <= 28) return 1.15;
        if (age <= 32) return 0.80;
        return 0.30;
      }
      if (position === 'TE' || position === 'WR/TE') {
        if (age <= 24) return 1.50;
        if (age <= 27) return 1.15;
        if (age <= 30) return 0.75;
        return 0.15;
      }
    }

    // STRATEGY B: WIN NOW (Protect veteran production baselines, downplay unproven youth spikes)
    if (strategy === 'win_now') {
      if (position === 'RB') {
        if (age <= 23) return 1.20;
        if (age <= 25) return 1.20;
        if (age <= 27) return 1.05;
        if (age <= 29) return 0.85;
        return 0.50;
      }
      if (position === 'WR') {
        if (age <= 23) return 1.15;
        if (age <= 26) return 1.15;
        if (age <= 29) return 1.10;
        if (age <= 31) return 0.95;
        return 0.70;
      }
      if (position === 'QB') {
        if (age <= 24) return 1.10;
        if (age <= 28) return 1.10;
        if (age <= 32) return 1.05;
        if (age <= 36) return 0.90;
        return 0.65;
      }
      if (position === 'TE' || position === 'WR/TE') {
        if (age <= 24) return 1.15;
        if (age <= 27) return 1.10;
        if (age <= 30) return 1.05;
        if (age <= 32) return 0.85;
        return 0.55;
      }
    }

    // STRATEGY C: BALANCED / NEUTRAL (Standard baseline settings)
    if (position === 'RB') {
      if (age <= 23) return 1.45;
      if (age <= 25) return 1.20;
      if (age <= 27) return 0.90;
      if (age <= 29) return 0.50;
      return 0.20;
    }
    if (position === 'WR') {
      if (age <= 23) return 1.35;
      if (age <= 26) return 1.15;
      if (age <= 29) return 0.95;
      if (age <= 31) return 0.70;
      return 0.40;
    }
    if (position === 'QB') {
      if (age <= 24) return 1.30;
      if (age <= 28) return 1.10;
      if (age <= 32) return 0.95;
      if (age <= 36) return 0.70;
      return 0.40;
    }
    if (position === 'TE' || position === 'WR/TE') {
      if (age <= 24) return 1.30;
      if (age <= 27) return 1.10;
      if (age <= 30) return 0.90;
      if (age <= 32) return 0.60;
      return 0.30;
    }
    return 1;
  };

  // 📈 Algorithmic Market Status Engine
  const getMarketStatus = (position, age, strategy, points) => {
    if (!age) return { text: 'FAIR VALUE', color: 'text-gray-400 bg-gray-800/40 border-gray-700/50' };

    if (strategy === 'build') {
      if (age <= 23 && points > 180) return { text: '🟢 SCREAMING BUY', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
      if (age >= 28) return { text: '🔴 SELL HIGH', color: 'text-rose-400 bg-rose-950/30 border-rose-800/40' };
    }
    if (strategy === 'win_now') {
      if (age >= 27 && points > 200) return { text: '🟢 WIN-NOW BUY', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
      if (age <= 22) return { text: '🟡 HOLD / OVERPRICED', color: 'text-amber-400 bg-amber-950/30 border-amber-800/40' };
    }
    
    // Balanced Base Logics
    if (position === 'RB' && age <= 22) return { text: '🟢 SCREAMING BUY', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
    if (position === 'WR' && age <= 23 && points > 220) return { text: '🟢 SCREAMING BUY', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
    if (age >= 30) return { text: '🔴 AGING ASSET', color: 'text-rose-400 bg-rose-950/30 border-rose-800/40' };
    
    return { text: '🟡 FAIR VALUE', color: 'text-zinc-400 bg-zinc-800/40 border-zinc-700/50' };
  };

  // ⚡ DYNAMIC RECALCULATION ENGINE
  const processedRankings = useMemo(() => {
    const recalculated = (initialRankings || []).map(player => {
      let pts = 0;
      
      // Calculate Base Vegas Points
      pts += ((player.pass_yds || 0) / 25);
      pts += ((player.pass_tds || 0) * passTdValue); 
      pts -= ((player.turnovers || 0) * 2);
      pts += ((player.rush_yds || 0) / 10);
      pts += ((player.rush_tds || 0) * 6);
      pts += ((player.rec_yds || 0) / 10);
      pts += ((player.rec_tds || 0) * 6);
      
      let recPoints = ((player.receptions || 0) * pprValue);
      if (player.position === 'TE' || player.position === 'WR/TE') {
        recPoints += ((player.receptions || 0) * tePremium);
      }
      pts += recPoints;

      // Calculate Dynasty Score
      const ageMult = getAgeMultiplier(player.position, player.age, dynastyStrategy);
      const dynastyScore = Math.round(pts * ageMult * 2.5);
      const marketStatus = getMarketStatus(player.position, player.age, dynastyStrategy, pts);

      return {
        ...player,
        projected_points: Number(pts.toFixed(1)),
        dynasty_score: dynastyScore,
        market_status: marketStatus
      };
    });

    // Sort based on chosen format
    if (rankingMode === 'dynasty') {
      recalculated.sort((a, b) => b.dynasty_score - a.dynasty_score);
    } else {
      recalculated.sort((a, b) => b.projected_points - a.projected_points);
    }

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
  }, [initialRankings, pprValue, passTdValue, tePremium, rankingMode, dynastyStrategy]); 

  const visibleData = processedRankings.filter((player) => {
    if (currentPosition === 'All') return true;
    if (player.position === 'WR/TE') {
      return currentPosition === 'WR' || currentPosition === 'TE';
    }
    return player.position === currentPosition;
  });

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24">
      
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
              {rankingMode === 'dynasty' ? 'Dynasty Models' : (isOffseason ? 'Preseason Rankings' : 'Weekly Rankings')}
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              {rankingMode === 'dynasty'
                ? 'Vegas projected metrics run through an interactive, strategy-tilted age decay index.'
                : isOffseason 
                  ? 'Aggregated projections modeled directly from Vegas season-long player futures.'
                  : 'Projected fantasy points calculated dynamically from live sportsbook player props.'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Top Controls Row: Mode Toggle, Position Filters + Settings */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          
          <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
            {/* Mode Toggle (Redraft vs Dynasty) */}
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
                onClick={() => setRankingMode('dynasty')}
                className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  rankingMode === 'dynasty' 
                  ? 'bg-zinc-700 text-white shadow-[0_0_15px_rgba(113,113,122,0.3)]' 
                  : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                Dynasty
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

          {/* Dynamic Strategy Matrix Block (Visible only in Dynasty Mode) */}
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto xl:justify-end">
            {rankingMode === 'dynasty' && (
              <div className="flex items-zinc bg-[#111] p-1.5 rounded-2xl border border-gray-800 w-fit animate-in fade-in zoom-in-95 duration-300">
                <button 
                  onClick={() => setDynastyStrategy('win_now')}
                  className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${
                    dynastyStrategy === 'win_now' 
                    ? 'bg-zinc-200 text-black shadow-sm' 
                    : 'text-gray-500 hover:text-white'
                  }`}
                >
                  🏆 Win Now
                </button>
                <button 
                  onClick={() => setDynastyStrategy('neutral')}
                  className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${
                    dynastyStrategy === 'neutral' 
                    ? 'bg-zinc-200 text-black shadow-sm' 
                    : 'text-gray-500 hover:text-white'
                  }`}
                >
                  ⚖️ Balanced
                </button>
                <button 
                  onClick={() => setDynastyStrategy('build')}
                  className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${
                    dynastyStrategy === 'build' 
                    ? 'bg-zinc-200 text-black shadow-sm' 
                    : 'text-gray-500 hover:text-white'
                  }`}
                >
                  🌱 Rebuild
                </button>
              </div>
            )}

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
          
          <div className="px-6 py-4 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              {rankingMode === 'dynasty' ? 'Age-Decay Valuation Matrix' : `Vegas Implied ${currentPosition === 'All' ? 'Overall' : currentPosition} Projections`}
            </h2>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-gray-800">
              Data Engine: <span className="text-white">DraftKings Sportsbook Inputs</span>
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full text-left whitespace-nowrap">
              <thead className="bg-[#1a1a1a] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Ovr</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pos Rank</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                  
                  {/* Dynamic Headers per Mode */}
                  {rankingMode === 'dynasty' ? (
                    <>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Age</th>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center bg-zinc-900/20 border-x border-gray-800">Dynasty Score</th>
                      <th className="px-5 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Market Recommendation</th>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {visibleData && visibleData.length > 0 ? (
                  visibleData.map((player) => (
                    <tr key={player.name} className="hover:bg-[#151515] transition-colors group">
                      
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
                           {player.team && (
                             <img 
                               src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.team.toLowerCase()}.png`} 
                               alt={player.team}
                               className="w-6 h-6 object-contain drop-shadow-md"
                               onError={(e) => e.target.style.display = 'none'}
                             />
                           )}
                         </div>
                      </td>
                      
                      {/* Dynamic Columns Render logic */}
                      {rankingMode === 'dynasty' ? (
                        <>
                          <td className="px-4 py-2.5 text-center">
                            <span className="text-xs font-bold text-gray-300 bg-gray-800/80 px-2.5 py-1 rounded-md border border-gray-700/40">
                              {player.age || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center bg-zinc-900/10 border-x border-gray-800/50">
                             <div className="text-sm font-black text-zinc-300">
                               {player.dynasty_score}
                             </div>
                          </td>
                          <td className="px-5 py-2.5">
                            <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-lg border uppercase ${player.market_status.color}`}>
                              {player.market_status.text}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
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
                          <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player.turnovers !== undefined && player.turnovers > 0 ? player.turnovers : '-'}</td>
                        </>
                      )}

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
            <p>• Projections are pulled directly from live DraftKings sportsbook player prop Over/Under totals.</p>
            <p>• Player fantasy points recalculate instantly to mirror custom PPR and Tight End premium modifiers.</p>
            <p>• <strong>Dynasty Matrix Scores</strong> run Vegas projected baseline output across position-specific age curves tilted by your specific team timeline setting (Win Now, Balanced, or Rebuild).</p>
          </div>
        </div>

      </div>
    </div>
  );
}