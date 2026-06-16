'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Info, X, RefreshCw, Trophy } from 'lucide-react'; 
import { useLeague } from '../../../context/LeagueContext'; // 🚀 Added Context

export default function TradeValueClient() {
  const [playersData, setPlayersData] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);

  // 🚀 Hook into League Context
  const { getActiveLeagueData } = useLeague();
  const activeLeague = getActiveLeagueData('football');

  // --- UI State Variables ---
  const [currentPosition, setCurrentPosition] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  
  // Format toggles
  const [formatMode, setFormatMode] = useState('dynasty'); 
  const [dynastyStrategy, setDynastyStrategy] = useState('neutral'); 

  // Manual Scoring Format Settings
  const [manualIsSuperflex, setManualIsSuperflex] = useState(false); 
  const [manualPprValue, setManualPprValue] = useState(1);       
  const [manualPassTdValue, setManualPassTdValue] = useState(4); 
  const [manualTePremium, setManualTePremium] = useState(0);     

  // 🚀 Active Scoring Formats (Overrides manual settings if a league is synced!)
  const currentIsSuperflex = activeLeague?.rosterPositions ? activeLeague.rosterPositions.includes('SUPER_FLEX') : manualIsSuperflex;
  const currentPprValue = activeLeague?.scoringSettings?.rec ?? manualPprValue;
  const currentPassTdValue = activeLeague?.scoringSettings?.pass_td ?? manualPassTdValue;
  const currentTePremium = activeLeague?.scoringSettings?.bonus_rec_te ?? manualTePremium;

  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#e42d38';
  const secondaryColor = '#8a1a20';

  // 🔗 EFFECT 1: Read initial state from URL parameters on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      const modeParam = params.get('mode');
      if (modeParam === 'redraft' || modeParam === 'dynasty') {
        setFormatMode(modeParam);
      }
      
      const posParam = params.get('pos');
      if (posParam) {
        const upperPos = posParam.toUpperCase();
        if (['ALL', 'QB', 'RB', 'WR', 'TE'].includes(upperPos)) {
          setCurrentPosition(upperPos === 'ALL' ? 'All' : upperPos);
        }
      }

      const stratParam = params.get('strategy');
      if (stratParam === 'win_now' || stratParam === 'neutral' || stratParam === 'build') {
        setDynastyStrategy(stratParam);
      }
    }
  }, []);

  // 🔗 EFFECT 2: Write state shifts out to the browser URL string silently
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      params.set('mode', formatMode);
      params.set('pos', currentPosition.toLowerCase());
      if (formatMode === 'dynasty') {
        params.set('strategy', dynastyStrategy);
      } else {
        params.delete('strategy');
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  }, [formatMode, currentPosition, dynastyStrategy]);

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

  const getDynastyMetrics = (position, age, strategy, points) => {
    let assetProfile = { text: 'Roster Depth', color: 'text-zinc-400 bg-zinc-800/30 border-zinc-700/50' };
    let marketAction = { text: 'Fair Value', color: 'text-zinc-400 bg-zinc-800/30 border-zinc-700/50' };

    if (!age) return { assetProfile, marketAction };

    let cornerstoneAge, winNowAge, stashAge;
    let sellNowAge, sellHighAge, buyLowAge;

    if (position === 'RB') {
      cornerstoneAge = 23; winNowAge = 26; stashAge = 23;
      sellNowAge = 28; sellHighAge = 25; buyLowAge = 24;
    } else if (position === 'WR') {
      cornerstoneAge = 24; winNowAge = 28; stashAge = 23;
      sellNowAge = 30; sellHighAge = 27; buyLowAge = 25;
    } else if (position === 'QB') {
      cornerstoneAge = 26; winNowAge = 32; stashAge = 24;
      sellNowAge = 35; sellHighAge = 32; buyLowAge = 26;
    } else { // TEs
      cornerstoneAge = 25; winNowAge = 29; stashAge = 24;
      sellNowAge = 31; sellHighAge = 28; buyLowAge = 25;
    }

    if (points > 180) {
      if (age <= cornerstoneAge) assetProfile = { text: '💎 Cornerstone', color: 'text-sky-400 bg-sky-950/30 border-sky-800/40' };
      else if (age >= winNowAge) assetProfile = { text: '🏆 Win-Now Asset', color: 'text-amber-400 bg-amber-950/30 border-amber-800/40' };
      else assetProfile = { text: '💎 Cornerstone', color: 'text-sky-400 bg-sky-950/30 border-sky-800/40' }; 
    } else if (points > 115) {
      if (age <= stashAge + 1) assetProfile = { text: '📈 High Upside', color: 'text-teal-400 bg-teal-950/30 border-teal-800/40' };
      else if (age >= winNowAge) assetProfile = { text: '🏆 Win-Now Asset', color: 'text-amber-400 bg-amber-950/30 border-amber-800/40' };
      else assetProfile = { text: '⚔️ Core Starter', color: 'text-zinc-300 bg-zinc-800/40 border-zinc-700/40' };
    } else {
      if (age <= stashAge) assetProfile = { text: '🌱 High Upside / Stash', color: 'text-teal-400 bg-teal-950/20 border-teal-900/30' };
    }

    if (strategy === 'build') {
      if (age <= buyLowAge && points > 130) marketAction = { text: 'Acquisition Target', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
      else if (age <= buyLowAge) marketAction = { text: 'Buy Low', color: 'text-teal-400 bg-teal-950/30 border-teal-800/40' };
      else if (age >= sellNowAge) marketAction = { text: 'Exit Strategy', color: 'text-red-400 bg-red-950/30 border-red-800/40' };
      else if (age >= sellHighAge) marketAction = { text: 'Sell High', color: 'text-rose-400 bg-rose-950/30 border-rose-800/40' };
    } else if (strategy === 'win_now') {
      if (age >= sellHighAge && points > 150) marketAction = { text: 'Acquisition Target', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
      else if (age >= sellHighAge && points > 110) marketAction = { text: 'Buy Low', color: 'text-teal-400 bg-teal-950/30 border-teal-800/40' };
      else if (age <= stashAge && points < 100) marketAction = { text: 'Sell High', color: 'text-rose-400 bg-rose-950/30 border-rose-800/40' }; 
    } else {
      if (age <= buyLowAge && points > 140) marketAction = { text: 'Acquisition Target', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
      else if (age <= buyLowAge && points < 120) marketAction = { text: 'Buy Low', color: 'text-teal-400 bg-teal-950/30 border-teal-800/40' };
      else if (age >= sellNowAge) marketAction = { text: 'Exit Strategy', color: 'text-red-400 bg-red-950/30 border-red-800/40' };
      else if (age >= sellHighAge && points > 170) marketAction = { text: 'Sell High', color: 'text-rose-400 bg-rose-950/30 border-rose-800/40' };
    }

    return { assetProfile, marketAction };
  };

  const getRedraftMetrics = () => {
    return { 
      assetProfile: { text: 'Offseason', color: 'text-zinc-500 bg-zinc-900/30 border-zinc-800/50' }, 
      marketAction: { text: 'Offseason', color: 'text-zinc-500 bg-zinc-900/30 border-zinc-800/50' } 
    };
  };

  const processedValues = useMemo(() => {
    const recalculated = (playersData || []).map(player => {
      let pts = 0;
      
      pts += ((player.pass_yds || 0) / 25);
      pts += ((player.pass_tds || 0) * currentPassTdValue); 
      pts -= ((player.turnovers || player.ints || player.fumbles || 0) * 2);
      pts += ((player.rush_yds || 0) / 10);
      pts += ((player.rush_tds || 0) * 6);
      pts += ((player.rec_yds || 0) / 10);
      pts += ((player.rec_tds || 0) * 6);
      
      let recPoints = ((player.receptions || 0) * currentPprValue);
      if (player.position === 'TE' || player.position === 'WR/TE') {
        recPoints += ((player.receptions || 0) * currentTePremium);
      }
      pts += recPoints;

      if (player.position === 'QB') {
        if (currentIsSuperflex) {
          pts *= 1.0;  
        } else {
          pts *= 0.60; 
        }
      } else {
        pts *= 1.0;  
      }

      let trade_value = 0;
      let asset_profile = {};
      let market_action = {};

      if (formatMode === 'dynasty') {
        const ageMult = getAgeMultiplier(player.position, player.age, dynastyStrategy);
        trade_value = Math.round(pts * ageMult * 2.5);
        const metrics = getDynastyMetrics(player.position, player.age, dynastyStrategy, pts);
        asset_profile = metrics.assetProfile;
        market_action = metrics.marketAction;
      } else {
        trade_value = Math.round(pts * 1.5); 
        const metrics = getRedraftMetrics(); 
        asset_profile = metrics.assetProfile;
        market_action = metrics.marketAction;
      }

      return { ...player, trade_value, asset_profile, market_action };
    });

    recalculated.sort((a, b) => b.trade_value - a.trade_value);

    const posCounters = {};
    return recalculated.map((player, index) => {
      const pos = player.position || 'UNK';
      if (!posCounters[pos]) posCounters[pos] = 0;
      posCounters[pos] += 1;
      
      return { ...player, overallRank: index + 1, posRank: `${pos}${posCounters[pos]}` };
    });
  }, [playersData, currentPprValue, currentPassTdValue, currentTePremium, formatMode, dynastyStrategy, currentIsSuperflex]); 

  const visibleData = processedValues.filter((player) => {
    if (currentPosition === 'All') return true;
    if (player.position === 'WR/TE') return currentPosition === 'WR' || currentPosition === 'TE';
    return player.position === currentPosition;
  });

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative">
      
      {/* ℹ️ Asset Type Modal */}
      {activeModal === 'assetType' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161616] border border-gray-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Info size={18} className="text-zinc-400" /> Asset Type Methodology
            </h3>
            
            <div className="space-y-4 text-xs font-medium text-gray-400 leading-relaxed mt-4">
              <p>
                <strong>Dynasty Formats:</strong> Evaluates base projected output against position-specific age cliffs. For example, a 28-year-old RB is penalized heavily, while a 28-year-old QB remains in their prime window.
              </p>
              <p>
                <strong>Redraft Formats:</strong> Currently in Offseason mode. Once the season begins, this column will dynamically evaluate live performance actuals versus projected volume to identify positive/negative regression candidates.
              </p>
              
              <div className="space-y-3 bg-[#111] p-4 rounded-2xl border border-gray-800/60 mt-4">
                <p>• <span className="text-sky-400 font-bold">💎 Cornerstone:</span> Elite premium assets with extensive production runways. Essential foundational builds.</p>
                <p>• <span className="text-amber-400 font-bold">🏆 Win-Now Asset / League Winner:</span> High point production volume. Crucial value anchors for current season title contention.</p>
                <p>• <span className="text-teal-400 font-bold">📈 High Upside / Stash:</span> Developmentally insulated profiles showing asymmetric breakout metrics relative to age thresholds.</p>
                <p>• <span className="text-zinc-300 font-bold">⚔️ Core Starter:</span> Reliable roster assets providing weekly utility.</p>
                <p>• <span className="text-zinc-400 font-bold">🔄 Flex Play / Bench Depth:</span> Roster insulation and depth chart fillers.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ℹ️ Market Recommendation Modal */}
      {activeModal === 'marketAction' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161616] border border-gray-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Info size={18} className="text-zinc-400" /> Market Recommendation Methodology
            </h3>
            
            <div className="space-y-4 text-xs font-medium text-gray-400 leading-relaxed mt-4">
              <p>
                <strong>Dynasty Formats:</strong> Dynamically adjusts based on your selected Team Strategy (Build, Balanced, Win Now). It surfaces action markers by identifying inefficiencies between a player's age-adjusted value and their current production volume.
              </p>
              <p>
                <strong>Redraft Formats:</strong> Currently in Offseason mode. During the season, this will surface actionable insights (e.g., triggering a "Buy Low" recommendation on an underperforming high-volume asset).
              </p>
              
              <div className="space-y-3 bg-[#111] p-4 rounded-2xl border border-gray-800/60 mt-4">
                <p>• <span className="text-emerald-400 font-bold">Acquisition Target:</span> Deep inefficiencies identified between production volume and market perception. Strong buy recommendation.</p>
                <p>• <span className="text-teal-400 font-bold">Buy Low:</span> Price point optimization window opened due to macro roster trends or strategic mismatch.</p>
                <p>• <span className="text-zinc-400 font-bold">Fair Value:</span> Valued completely accurately on standard baseline equilibrium metrics.</p>
                <p>• <span className="text-rose-400 font-bold">Sell High:</span> Asset valuation apex. Historical models indicate exchanging for future values right now optimizes returns.</p>
                <p>• <span className="text-red-400 font-bold">Exit Strategy:</span> High value erosion risk. Rapid asset degradation threshold approaching. Divestment advised.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-8 mt-6 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }} />
        <img src={bgImage} alt="Football Background" className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between h-full px-6 md:px-10 pb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              Trade Value Charts
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Market-implied asset valuations. Evaluate blockbusters using our age-decay matrix and projected outputs.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Unified Single-Line Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            
            <div className="flex bg-[#111] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
              <button onClick={() => setFormatMode('redraft')} className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formatMode === 'redraft' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-white'}`}>Redraft</button>
              <button onClick={() => setFormatMode('dynasty')} className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formatMode === 'dynasty' ? 'bg-zinc-700 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>Dynasty</button>
            </div>

            <div className="flex flex-wrap gap-2 bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
               {positions.map(pos => (
                  <button key={pos} onClick={() => setCurrentPosition(pos)} className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>{pos}</button>
               ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {formatMode === 'dynasty' && (
              <div className="flex items-center bg-[#111] p-1.5 rounded-2xl border border-gray-800 w-fit animate-in fade-in zoom-in-95 duration-200 hidden md:flex">
                <button onClick={() => setDynastyStrategy('win_now')} className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${dynastyStrategy === 'win_now' ? 'bg-zinc-200 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>🏆 Win Now</button>
                <button onClick={() => setDynastyStrategy('neutral')} className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${dynastyStrategy === 'neutral' ? 'bg-zinc-200 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>⚖️ Balanced</button>
                <button onClick={() => setDynastyStrategy('build')} className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${dynastyStrategy === 'build' ? 'bg-zinc-200 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>🌱 Rebuild</button>
              </div>
            )}
            
            {activeLeague ? (
               <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg pointer-events-none">
                 <Trophy size={16} /> 
                 Synced to {activeLeague.name}
               </div>
            ) : (
               <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${showSettings ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'}`}>
                 <Settings size={16} /> {showSettings ? 'Hide Settings' : 'League Settings'}
               </button>
            )}
          </div>
        </div>

        {/* Custom Scoring Panel */}
        {showSettings && !activeLeague && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">League Type</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  <button onClick={() => setManualIsSuperflex(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!manualIsSuperflex ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>1QB</button>
                  <button onClick={() => setManualIsSuperflex(true)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${manualIsSuperflex ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>SUPERFLEX</button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Receptions (PPR)</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: 'STD', val: 0 }, { label: 'HALF', val: 0.5 }, { label: 'FULL', val: 1 }].map(opt => (
                    <button key={opt.label} onClick={() => setManualPprValue(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualPprValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Passing TDs</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: '4 PTS', val: 4 }, { label: '6 PTS', val: 6 }].map(opt => (
                    <button key={opt.label} onClick={() => setManualPassTdValue(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualPassTdValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">TE Premium</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: 'NONE', val: 0 }, { label: '+0.5', val: 0.5 }, { label: '+1.0', val: 1 }].map(opt => (
                    <button key={opt.label} onClick={() => setManualTePremium(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualTePremium === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full text-left whitespace-nowrap">
              <thead className="bg-[#1a1a1a] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Rnk</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pos</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                  
                  {formatMode === 'dynasty' ? (
                    <>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Age</th>
                      <th className="px-4 py-3 text-[10px] font-black text-red-400 uppercase tracking-widest text-center bg-red-900/10 border-x border-gray-800">Trade Value</th>
                    </>
                  ) : (
                    <th className="px-4 py-3 text-[10px] font-black text-red-400 uppercase tracking-widest text-center bg-red-900/10 border-x border-gray-800">Trade Value (ROS)</th>
                  )}

                  <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">Asset Type <button onClick={() => setActiveModal('assetType')} className="text-gray-500 hover:text-white"><Info size={11} /></button></div>
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">Market Recommendation <button onClick={() => setActiveModal('marketAction')} className="text-gray-500 hover:text-white"><Info size={11} /></button></div>
                  </th>

                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-800/50">
                {isSyncing ? (
                  <tr>
                    <td colSpan="14" className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center text-red-500 animate-in fade-in duration-500">
                        <RefreshCw className="animate-spin mb-4" size={36} />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Calculating Market Values</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Aligning algorithmic structures...</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleData.map((player, idx) => {
                    const playerUrl = `/player/${player.name.toLowerCase().replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/i, '').replace(/['.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

                    return (
                    <tr key={`${player.name}-${player.position}-${idx}`} className="hover:bg-[#151515] transition-colors group">
                      <td className="px-4 py-2.5">
                        <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-gray-800 text-gray-300 border border-gray-700">{player.overallRank}</div>
                      </td>
                      <td className="px-4 py-2.5 text-center"><span className="text-xs font-bold text-gray-400 uppercase">{player.posRank}</span></td>
                      <td className="px-4 py-2.5">
                         <div className="flex items-center gap-3">
                           <Link href={playerUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-gray-100 tracking-tight hover:text-red-400 transition-colors">
                             {player.name}
                           </Link>
                           {player.team && player.team !== 'fa' && (
                             <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.team.toLowerCase()}.png`} alt={player.team} className="w-6 h-6 object-contain" onError={(e) => e.target.style.display = 'none'} />
                           )}
                         </div>
                      </td>
                      
                      {formatMode === 'dynasty' ? (
                        <>
                          <td className="px-4 py-2.5 text-center"><span className="text-xs font-bold text-gray-300 bg-gray-800/80 px-2.5 py-1 rounded-md">{player.age || '-'}</span></td>
                          <td className="px-4 py-2.5 text-center bg-red-900/10 border-x border-gray-800/50"><div className="text-sm font-black text-white">{player.trade_value}</div></td>
                        </>
                      ) : (
                          <td className="px-4 py-2.5 text-center bg-red-900/10 border-x border-gray-800/50"><div className="text-sm font-black text-white">{player.trade_value}</div></td>
                      )}
                      
                      <td className="px-4 py-2.5"><span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-lg border uppercase ${player.asset_profile.color}`}>{player.asset_profile.text}</span></td>
                      <td className="px-4 py-2.5"><span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-lg border uppercase ${player.market_action.color}`}>{player.market_action.text}</span></td>
                    </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}