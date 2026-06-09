'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Settings, ShieldAlert, TrendingUp, RefreshCw, Info, X } from 'lucide-react'; 

export default function RankingsModelClient({ initialRankings, mode, serverError }) {
  // --- NEW: Live Data State ---
  const [playersData, setPlayersData] = useState(initialRankings || []);
  const [isSyncing, setIsSyncing] = useState(true);

  // --- UI State Variables ---
  const [currentPosition, setCurrentPosition] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [showMarketInfo, setShowMarketInfo] = useState(false);
  const [rankingMode, setRankingMode] = useState('dynasty'); // Defaulted to dynasty
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

  // 🔄 FETCH LIVE HYBRID DATABASE ON LOAD
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

  // 🧠 Algorithmic Dynasty Age Multiplier tilted by Team Strategy
  const getAgeMultiplier = (position, age, strategy) => {
    if (!age) return 1; 

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

    // BALANCED / NEUTRAL LOGICS
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

  // 📊 COMPREHENSIVE DYNASTY CORE MATRIX ENGINE
  const getDynastyMetrics = (position, age, strategy, points) => {
    let assetProfile = { text: 'Roster Depth', color: 'text-zinc-400 bg-zinc-800/30 border-zinc-700/50' };
    let marketAction = { text: 'Fair Value', color: 'text-zinc-400 bg-zinc-800/30 border-zinc-700/50' };

    if (!age) return { assetProfile, marketAction };

    if (points > 210) {
      if (age <= 25) assetProfile = { text: '💎 Cornerstone', color: 'text-sky-400 bg-sky-950/30 border-sky-800/40' };
      else if (age >= 28) assetProfile = { text: '🏆 Win-Now Asset', color: 'text-amber-400 bg-amber-950/30 border-amber-800/40' };
      else assetProfile = { text: '💎 Cornerstone', color: 'text-sky-400 bg-sky-950/30 border-sky-800/40' };
    } else if (points > 130) {
      if (age <= 23) assetProfile = { text: '📈 High Upside', color: 'text-teal-400 bg-teal-950/30 border-teal-800/40' };
      else if (age >= 28) assetProfile = { text: '🏆 Win-Now Asset', color: 'text-amber-400 bg-amber-950/30 border-amber-800/40' };
      else assetProfile = { text: '⚔️ Core Starter', color: 'text-zinc-300 bg-zinc-800/40 border-zinc-700/40' };
    } else {
      if (age <= 23) assetProfile = { text: '🌱 High Upside / Stash', color: 'text-teal-400 bg-teal-950/20 border-teal-900/30' };
    }

    if (strategy === 'build') {
      if (age <= 23 && points > 150) marketAction = { text: 'Buy Now', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
      else if (age <= 24) marketAction = { text: 'Buy Low', color: 'text-teal-400 bg-teal-950/30 border-teal-800/40' };
      else if (age >= 29) marketAction = { text: 'Sell Now', color: 'text-red-400 bg-red-950/30 border-red-800/40' };
      else if (age >= 26) marketAction = { text: 'Sell High', color: 'text-rose-400 bg-rose-950/30 border-rose-800/40' };
    } else if (strategy === 'win_now') {
      if (age >= 27 && points > 170) marketAction = { text: 'Buy Now', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
      else if (age >= 28 && points > 130) marketAction = { text: 'Buy Low', color: 'text-teal-400 bg-teal-950/30 border-teal-800/40' };
      else if (age <= 23 && points < 120) marketAction = { text: 'Sell High', color: 'text-rose-400 bg-rose-950/30 border-rose-800/40' };
    } else {
      if (age <= 22 && points > 160) marketAction = { text: 'Buy Now', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
      else if (age <= 24 && points < 140) marketAction = { text: 'Buy Low', color: 'text-teal-400 bg-teal-950/30 border-teal-800/40' };
      else if (age >= 30) marketAction = { text: 'Sell Now', color: 'text-red-400 bg-red-950/30 border-red-800/40' };
      else if (age >= 28 && points > 190) marketAction = { text: 'Sell High', color: 'text-rose-400 bg-rose-950/30 border-rose-800/40' };
    }

    return { assetProfile, marketAction };
  };

  // ⚡ DYNAMIC RECALCULATION ENGINE (Using playersData instead of initialRankings)
  const processedRankings = useMemo(() => {
    const recalculated = (playersData || []).map(player => {
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

      const ageMult = getAgeMultiplier(player.position, player.age, dynastyStrategy);
      const dynastyScore = Math.round(pts * ageMult * 2.5);
      const { assetProfile, marketAction } = getDynastyMetrics(player.position, player.age, dynastyStrategy, pts);

      return {
        ...player,
        projected_points: Number(pts.toFixed(1)),
        dynasty_score: dynastyScore,
        asset_profile: assetProfile,
        market_action: marketAction
      };
    });

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
  }, [playersData, pprValue, passTdValue, tePremium, rankingMode, dynastyStrategy]); 

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
      
      {/* ℹ️ Valuation Details Modal */}
      {showMarketInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161616] border border-gray-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowMarketInfo(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Info size={18} className="text-zinc-400" /> Valuation Architecture & Matrix Labels
            </h3>
            
            <div className="space-y-5 text-xs font-medium text-gray-400 leading-relaxed">
              <p>Our dynasty model indexes **implied market output (Consensus / Vegas season expectations)** directly across historical **position-specific production age cliffs** using two unique diagnostic metrics:</p>
              
              <div className="space-y-3 bg-[#111] p-4 rounded-2xl border border-gray-800/60">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-white">Axis 1: Asset Profiling</h4>
                <p>• <span className="text-sky-400 font-bold">💎 Cornerstone:</span> Elite premium assets with extensive production runways. Essential foundational builds.</p>
                <p>• <span className="text-amber-400 font-bold">🏆 Win-Now Asset:</span> High point production volume. Crucial value anchors for current season title contention.</p>
                <p>• <span className="text-teal-400 font-bold">📈 High Upside / Stash:</span> Developmentally insulated profiles showing asymmetric breakout metrics relative to age threshold.</p>
              </div>

              <div className="space-y-3 bg-[#111] p-4 rounded-2xl border border-gray-800/60">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-white">Axis 2: Actionable Market Recommendation</h4>
                <p>• <span className="text-emerald-400 font-bold">Buy Now:</span> Deep inefficiencies identified between production volume and market perception. Acquire immediately.</p>
                <p>• <span className="text-teal-400 font-bold">Buy Low:</span> Price point optimization window opened due to macro roster trends or strategic mismatch.</p>
                <p>• <span className="text-zinc-400 font-bold">Fair Value:</span> Valued completely accurately on standard baseline equilibrium metrics.</p>
                <p>• <span className="text-rose-400 font-bold">Sell High:</span> Asset valuation apex. Historical models indicate exchanging for future values right now optimizes returns.</p>
                <p>• <span className="text-red-400 font-bold">Sell Now / Peak Value:</span> High value erosion risk. Rapid asset degradation threshold approaching. Exit positioning advised.</p>
              </div>

              <p className="text-[10px] italic text-gray-500">Note: Identifiers shift instantly in real-time based on your specific team strategy selection (Win Now, Balanced, or Rebuild).</p>
            </div>
          </div>
        </div>
      )}

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
              {rankingMode === 'dynasty' ? 'Dynasty Rankings' : (isOffseason ? 'Preseason Rankings' : 'Weekly Rankings')}
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              {rankingMode === 'dynasty'
                ? 'Projected metrics run through an interactive, strategy-tilted age decay index and ADP consideration.'
                : isOffseason 
                  ? 'Aggregated hybrid projections modeled from Vegas lines & consensus data.'
                  : 'Projected fantasy points calculated dynamically from live sportsbook player props.'}
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

          {/* Dynamic Strategy Matrix Block */}
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
        <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-[400px]">
          
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
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          Roster Asset Type
                          <button 
                            onClick={() => setShowMarketInfo(true)}
                            className="text-gray-500 hover:text-white transition-colors p-0.5 rounded bg-zinc-800/40 border border-zinc-700/50"
                          >
                            <Info size={11} />
                          </button>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          Market Recommendation
                          <button 
                            onClick={() => setShowMarketInfo(true)}
                            className="text-gray-500 hover:text-white transition-colors p-0.5 rounded bg-zinc-800/40 border border-zinc-700/50"
                          >
                            <Info size={11} />
                          </button>
                        </div>
                      </th>
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
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-lg border uppercase ${player.asset_profile.color}`}>
                              {player.asset_profile.text}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-lg border uppercase ${player.market_action.color}`}>
                              {player.market_action.text}
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
                          <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{(player.turnovers || player.ints || player.fumbles) ? (player.ints || 0) + (player.fumbles || 0) : '-'}</td>
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
            <p>• Projections are a hybrid compilation of live DraftKings sportsbook player props anchored with multi-site consensus baseline stats.</p>
            <p>• Player fantasy points recalculate instantly to mirror custom PPR and Tight End premium modifiers.</p>
            <p>• <strong>Dynasty Matrix Scores</strong> run projected baseline output across position-specific age curves tilted by your specific team timeline setting (Win Now, Balanced, or Rebuild).</p>
          </div>
        </div>

      </div>
    </div>
  );
}