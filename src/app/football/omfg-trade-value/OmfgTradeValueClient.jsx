'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Info, X, RefreshCw, Trophy, ShieldCheck } from 'lucide-react'; 
import { useLeague } from '../../../context/LeagueContext'; 

export default function OmfgTradeValueClient() {
  const [playersData, setPlayersData] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);

  // Hook into League Context
  const { getActiveLeagueData } = useLeague();
  const activeLeague = getActiveLeagueData('football');

  // --- UI State Variables ---
  const [currentPosition, setCurrentPosition] = useState('All');
  const [showSettings, setShowSettings] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  
  // Format toggles
  const [formatMode, setFormatMode] = useState('dynasty'); 
  const [dynastyStrategy, setDynastyStrategy] = useState('balanced'); 

  // Automated Behind-the-Scenes Week Logic
  const [activeWeekNum, setActiveWeekNum] = useState(1); 

  // Manual Scoring Format Settings
  const [manualIsSuperflex, setManualIsSuperflex] = useState(false); 
  const [manualPprValue, setManualPprValue] = useState(1);       
  const [manualPassTdValue, setManualPassTdValue] = useState(4); 
  const [manualTePremium, setManualTePremium] = useState(0);     

  // Active Scoring Formats (Overrides manual settings if a league is synced)
  const currentIsSuperflex = activeLeague?.rosterPositions ? activeLeague.rosterPositions.includes('SUPER_FLEX') : manualIsSuperflex;
  const currentPprValue = activeLeague?.scoringSettings?.rec ?? manualPprValue;
  const currentPassTdValue = activeLeague?.scoringSettings?.pass_td ?? manualPassTdValue;
  const currentTePremium = activeLeague?.scoringSettings?.bonus_rec_te ?? manualTePremium;

  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#e42d38';
  const secondaryColor = '#8a1a20';

  useEffect(() => {
    async function loadAllData() {
      setIsSyncing(true);
      try {
        // 1. Fetch Dynasty Players for Base Info
        const dynRes = await fetch('/api/dynasty-players');
        const dynData = await dynRes.json();
        const basePlayers = (dynData.success && dynData.players) ? dynData.players : [];

        // 2. Fetch OMFG Metadata to find latest year/week
        const metaRes = await fetch(`/api/omfg-data?year=2026&week=Week 1`);
        const metaData = await metaRes.json();
        let latestYear = '2026';
        let latestWeek = 'Week 1';
        
        if (metaData.available_models) {
            const activeWeekly = metaData.available_models.filter(m => m.week !== 'Season');
            if (activeWeekly.length > 0) {
                latestYear = String(activeWeekly[0].year);
                latestWeek = activeWeekly[0].week;
                setActiveWeekNum(parseInt(latestWeek.replace(/\D/g, '')) || 1);
            }
        }

        // 3. Fetch Season-Over-Season (SOS) Data
        const sosRes = await fetch(`/api/omfg-data?year=${latestYear}&week=Season`);
        const sosJson = await sosRes.json();
        const sosPlayers = sosJson.success && sosJson.players ? sosJson.players : [];

        // 4. Fetch Week-Over-Week (WOW) Data
        const wowRes = await fetch(`/api/omfg-data?year=${latestYear}&week=${latestWeek}`);
        const wowJson = await wowRes.json();
        const wowPlayers = wowJson.success && wowJson.players ? wowJson.players : [];

        // 5. Merge Data by Normalized Name
        const normalizeName = (name) => {
            if (!name) return '';
            return name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(jr|sr|ii|iii|iv|v)$/, '');
        };

        const sosMap = {};
        sosPlayers.forEach(p => {
            if (p.Player) sosMap[normalizeName(p.Player)] = p;
        });

        const wowMap = {};
        wowPlayers.forEach(p => {
            if (p.Player) wowMap[normalizeName(p.Player)] = p;
        });

        const merged = basePlayers.map(p => {
            const cleanName = normalizeName(p.name);
            const sData = sosMap[cleanName] || {};
            const wData = wowMap[cleanName] || {};
            
            const SOS_OMFG = Number(sData['OMFG Score']) || 50;
            const WOW_OMFG = Number(wData['In-Season OMFG Score'] ?? wData['Preseason OMFG'] ?? wData['OMFG Score']) || SOS_OMFG;
            
            const P25 = Number(sData['Floor (P25)']) || 0;
            const P50 = Number(sData['Base (P50)']) || 0;
            const P75 = Number(sData['Ceiling (P75)']) || 0;
            
            const weekly_proj_pts = Number(wData['Projected Fantasy Points']) || (P50 / 17) || 0;
            const OMFG_Edge = Number(sData['Rank Gap'] ?? wData['Rank Gap']) || 0;

            // Dynamic Scoring Stats Extraction
            const pass_tds_season = Number(sData['Pass TD'] ?? sData['PASS TDS']) || 0;
            const receptions_season = Number(sData['Receptions'] ?? sData['REC']) || 0;
            const pass_tds_week = Number(wData['Pass TD'] ?? wData['PASS TDS']) || (pass_tds_season / 17) || 0;
            const receptions_week = Number(wData['Receptions'] ?? wData['REC']) || (receptions_season / 17) || 0;

            return {
                ...p,
                SOS_OMFG, WOW_OMFG, P25, P50, P75, weekly_proj_pts, OMFG_Edge,
                pass_tds_season, receptions_season, pass_tds_week, receptions_week
            };
        }).filter(p => p.P50 > 0 || p.weekly_proj_pts > 0);

        setPlayersData(merged);
      } catch (err) {
        console.error("Error loading OMFG Trade Value data", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadAllData();
  }, []);

  // --- AGE MULTIPLIER MATRIX ---
  const getBaseAgeMultiplier = (position, age, strategy) => {
    if (!age) return 1.0;
    const pos = position === 'WR/TE' ? 'TE' : position;

    if (strategy === 'build') {
      if (pos === 'RB') return age <= 23 ? 1.35 : age <= 25 ? 1.00 : age <= 27 ? 0.60 : age <= 29 ? 0.30 : 0.10;
      if (pos === 'WR') return age <= 24 ? 1.30 : age <= 27 ? 1.05 : age <= 29 ? 0.75 : age <= 31 ? 0.45 : 0.20;
      if (pos === 'QB') return age <= 26 ? 1.30 : age <= 33 ? 1.00 : age <= 36 ? 0.65 : 0.25;
      if (pos === 'TE') return age <= 25 ? 1.30 : age <= 28 ? 0.95 : age <= 30 ? 0.70 : age <= 32 ? 0.45 : 0.20;
    } else { 
      // Balanced and Win_Now Base
      if (pos === 'RB') return age <= 23 ? 1.20 : age <= 25 ? 1.05 : age <= 27 ? 0.85 : age <= 29 ? 0.55 : 0.25;
      if (pos === 'WR') return age <= 24 ? 1.15 : age <= 27 ? 1.05 : age <= 29 ? 0.90 : age <= 31 ? 0.70 : 0.45;
      if (pos === 'QB') return age <= 26 ? 1.15 : age <= 33 ? 1.05 : age <= 36 ? 0.85 : 0.50;
      if (pos === 'TE') return age <= 25 ? 1.15 : age <= 28 ? 1.00 : age <= 30 ? 0.85 : age <= 32 ? 0.65 : 0.40;
    }
    return 1.0;
  };

  // ⚡ DYNAMIC RECALCULATION ENGINE
  const processedRankings = useMemo(() => {
    const remainingWeeks = Math.max(1, 18 - activeWeekNum);

    const recalculated = (playersData || []).map(player => {
        const { SOS_OMFG, WOW_OMFG, P25, P50, P75, weekly_proj_pts, OMFG_Edge, age, position } = player;
        const isTE = (position === 'TE' || position === 'WR/TE');

        // STEP 1: Calculate Dynamic Scoring Adjustments
        const delta_pass_tds_season = player.pass_tds_season * (currentPassTdValue - 4);
        const delta_ppr_season = player.receptions_season * currentPprValue;
        const delta_tep_season = isTE ? (player.receptions_season * currentTePremium) : 0;
        const delta_total_season = delta_pass_tds_season + delta_ppr_season + delta_tep_season;

        const delta_pass_tds_week = player.pass_tds_week * (currentPassTdValue - 4);
        const delta_ppr_week = player.receptions_week * currentPprValue;
        const delta_tep_week = isTE ? (player.receptions_week * currentTePremium) : 0;
        const delta_total_week = delta_pass_tds_week + delta_ppr_week + delta_tep_week;

        const p25_adj = P25 + delta_total_season;
        const p50_adj = P50 + delta_total_season;
        const p75_adj = P75 + delta_total_season;
        const weekly_proj_pts_adj = weekly_proj_pts + delta_total_week;

        // STEP 2: Calculate OMFG-Weighted Points
        const pts_wow = weekly_proj_pts_adj * (1 + ((WOW_OMFG - 50) / 100));
        const pts_sos = p50_adj + ((p75_adj - p50_adj) * (SOS_OMFG / 100));

        // STEP 3 & 4: Apply Selected Format & Strategy Formulas
        let rawValue = 0;
        let finalEdgeMult = 1.0 + (OMFG_Edge / 100);

        if (formatMode === 'redraft') {
            const pts_redraft = (0.75 * (pts_sos * (remainingWeeks / 17))) + (0.25 * (pts_wow * remainingWeeks));
            rawValue = pts_redraft * finalEdgeMult * 1.5;
        } else {
            const baseAgeMult = getBaseAgeMultiplier(position, age, dynastyStrategy);
            
            // OMFG-Gated Age Logic
            let gatedAgeMult = 1.0;
            if (baseAgeMult > 1.0) {
                const premiumFactor = baseAgeMult - 1.0;
                gatedAgeMult = 1.0 + (premiumFactor * (SOS_OMFG / 100));
            } else if (baseAgeMult < 1.0) {
                const penaltyFactor = 1.0 - baseAgeMult;
                gatedAgeMult = 1.0 - (penaltyFactor * (1.0 - (SOS_OMFG / 100)));
            }

            if (dynastyStrategy === 'win_now') {
                const pts_win_now = (0.40 * (pts_wow * 17)) + (0.60 * pts_sos);
                rawValue = pts_win_now * finalEdgeMult * 2.5;
            } else if (dynastyStrategy === 'balanced') {
                const pts_balanced = (0.20 * (pts_wow * 17)) + (0.80 * pts_sos);
                rawValue = pts_balanced * gatedAgeMult * finalEdgeMult * 2.5;
            } else if (dynastyStrategy === 'build') {
                rawValue = pts_sos * gatedAgeMult * finalEdgeMult * 2.5;
            }
        }

        // STEP 5: Apply Scarcity and Scoring Modifiers
        let sf_mult = 1.0;
        if (position === 'QB') {
            if (currentIsSuperflex) {
                sf_mult = 1.0 + (SOS_OMFG / 300.0); 
            } else {
                sf_mult = 0.50;
            }
        }
        rawValue = rawValue * sf_mult;

        let tep_mult = 1.0;
        if (isTE) {
            if (currentTePremium === 0.5) tep_mult = 1.15;
            else if (currentTePremium === 1.0) tep_mult = 1.30;

            if (SOS_OMFG > 80.0) {
                tep_mult = tep_mult * (1.0 + ((SOS_OMFG - 80) / 100));
            }
        }
        rawValue = rawValue * tep_mult;
        if (rawValue < 0) rawValue = 0;

        return { 
          ...player, 
          rawValue, 
          adjP25: p25_adj, 
          adjP50: p50_adj, 
          adjP75: p75_adj 
        };
    });

    // STEP 6: Dynamic 0-1,000 Scale Normalization
    const maxRawValue = Math.max(...recalculated.map(p => p.rawValue), 1);

    recalculated.forEach(player => {
        player.trade_value = Math.round((player.rawValue / maxRawValue) * 1000);
        
        let actionBadge = { text: 'FAIR VALUE', color: 'text-zinc-400 bg-zinc-800/30 border-zinc-700/50' };
        const edgeMult = 1.0 + (player.OMFG_Edge / 100);
        
        if (edgeMult > 1.05) {
            actionBadge = { text: 'BUY: Undervalued', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' };
        } else if (edgeMult < 0.95) {
            actionBadge = { text: 'SELL: Volatile Profile', color: 'text-red-400 bg-red-950/30 border-red-800/40' };
        }
        player.actionBadge = actionBadge;
    });

    recalculated.sort((a, b) => b.trade_value - a.trade_value);

    const posCounters = {};
    return recalculated.map((player, index) => {
      const pos = player.position || 'UNK';
      if (!posCounters[pos]) posCounters[pos] = 0;
      posCounters[pos] += 1;
      
      return { ...player, overallRank: index + 1, posRank: `${pos}${posCounters[pos]}` };
    });
  }, [playersData, formatMode, dynastyStrategy, currentIsSuperflex, currentPprValue, currentPassTdValue, currentTePremium, activeWeekNum]); 

  const visibleData = processedRankings.filter((player) => {
    if (currentPosition === 'All') return true;
    if (player.position === 'WR/TE') return currentPosition === 'WR' || currentPosition === 'TE';
    return player.position === currentPosition;
  });

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];

  const minP25 = Math.min(...processedRankings.map(p => p.adjP25)) || 0;
  const maxP75 = Math.max(...processedRankings.map(p => p.adjP75)) || 1;
  const rangeSpan = (maxP75 - minP25) || 1;

  const renderRangeVisualizer = (p25, p50, p75) => {
    const leftPercent = Math.max(0, Math.min(100, ((p25 - minP25) / rangeSpan) * 100));
    const widthPercent = Math.max(0, Math.min(100, ((p75 - p25) / rangeSpan) * 100));
    const medianPercentOfBar = (p75 - p25) > 0 ? ((p50 - p25) / (p75 - p25)) * 100 : 50;

    return (
        <div className="flex flex-col items-center w-36 sm:w-48 mx-auto gap-1">
          <div className="flex justify-between w-full text-[9px] font-bold text-gray-500">
             <span>{p25.toFixed(1)}</span>
             <span className="text-white">{p50.toFixed(1)}</span>
             <span>{p75.toFixed(1)}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full relative shadow-inner">
              <div 
                  className="absolute h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500 shadow-[0_0_8px_rgba(255,255,255,0.15)]" 
                  style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
              >
                  <div 
                      className="absolute w-2.5 h-2.5 bg-white rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-md border border-gray-300"
                      style={{ left: `${medianPercentOfBar}%` }}
                  />
              </div>
          </div>
        </div>
    );
  };

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative">
      
      {/* ℹ️ Outcome Range Modal */}
      {activeModal === 'outcomeRange' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161616] border border-gray-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Info size={18} className="text-zinc-400" /> Outcome Range (P25 - P75) Methodology
            </h3>
            
            <div className="space-y-4 text-xs font-medium text-gray-400 leading-relaxed mt-4">
              <p>
                Instead of relying on a single static point projection, the <strong>Outcome Range</strong> displays a player's statistical range of outcomes derived from our projection models.
              </p>
              
              <div className="space-y-3 bg-[#111] p-4 rounded-2xl border border-gray-800/60 mt-4">
                <p>• <span className="text-red-400 font-bold">Left Edge (P25 - Floor):</span> The 25th percentile downside outcome. A realistic floor expectation if touchdown luck or game scripts swing negative.</p>
                <p>• <span className="text-white font-bold">White Indicator (P50 - Median):</span> The 50th percentile baseline expectation. This represents the player's most likely output under standard conditions.</p>
                <p>• <span className="text-emerald-400 font-bold">Right Edge (P75 - Ceiling):</span> The 75th percentile upside outcome. Represents high-end ceiling potential during a breakout season or favorable environment.</p>
              </div>

              <div className="space-y-2 bg-[#111] p-4 rounded-2xl border border-gray-800/60">
                <p><strong>Reading Asset Volatility:</strong></p>
                <p>• <span className="text-gray-300 font-bold">Wide Bar:</span> High-volatility / boom-or-bust profile with massive ceiling upside paired with downside risk.</p>
                <p>• <span className="text-gray-300 font-bold">Narrow Bar:</span> Highly stable, predictable role with a tight range of outcomes and secure weekly utility.</p>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-inner backdrop-blur-sm">
              <ShieldCheck size={12} /> OMFG-Powered Valuations
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              Trade Value Chart
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Market-implied asset valuations. Evaluate assets using our OMFG-gated age decay matrix and projected output ranges.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Controls Row */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          
          {/* Tighter Non-Wrapping Flex Container */}
          <div className="flex flex-row items-center gap-2 xl:gap-4 overflow-x-auto scrollbar-hide w-full whitespace-nowrap pb-2 -mb-2">
            
            <div className="flex bg-[#111] p-1 rounded-2xl shadow-inner border border-gray-800 w-fit shrink-0">
              <button onClick={() => setFormatMode('redraft')} className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${formatMode === 'redraft' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-white'}`}>Redraft</button>
              <button onClick={() => setFormatMode('dynasty')} className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${formatMode === 'dynasty' ? 'bg-zinc-700 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>Dynasty</button>
            </div>

            <div className="flex bg-[#1a1a1a] p-1 rounded-2xl shadow-inner border border-gray-800 w-fit shrink-0">
               {positions.map(pos => (
                  <button key={pos} onClick={() => setCurrentPosition(pos)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>{pos}</button>
               ))}
            </div>

            {formatMode === 'dynasty' && (
              <div className="flex items-center bg-[#111] p-1 rounded-2xl border border-gray-800 w-fit animate-in fade-in zoom-in-95 duration-200 shrink-0">
                <button onClick={() => setDynastyStrategy('win_now')} className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${dynastyStrategy === 'win_now' ? 'bg-zinc-200 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>🏆 Win Now</button>
                <button onClick={() => setDynastyStrategy('balanced')} className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${dynastyStrategy === 'balanced' ? 'bg-zinc-200 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>⚖️ Balanced</button>
                <button onClick={() => setDynastyStrategy('build')} className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${dynastyStrategy === 'build' ? 'bg-zinc-200 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>🌱 Rebuild</button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto xl:justify-end shrink-0">
            {activeLeague ? (
               <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-lg pointer-events-none">
                 <Trophy size={16} /> 
                 Synced to {activeLeague.name}
               </div>
            ) : (
               <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ml-auto xl:ml-0 ${showSettings ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'}`}>
                 <Settings size={14} /> 
                 {showSettings ? 'Hide Scoring' : 'Custom Scoring'}
               </button>
            )}
          </div>
        </div>

        {/* Custom Scoring Panel */}
        {showSettings && !activeLeague && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6">
               Adjust League Scoring Format
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
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
                    <button 
                      key={opt.label} onClick={() => setManualPprValue(opt.val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualPprValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
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
                      key={opt.label} onClick={() => setManualPassTdValue(opt.val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualPassTdValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
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
                      key={opt.label} onClick={() => setManualTePremium(opt.val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualTePremium === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
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
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Rnk</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pos Rank</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                  
                  <th className="px-4 py-3 text-[10px] font-black text-red-500 uppercase tracking-widest text-center bg-red-900/10 border-x border-gray-800">
                    Trade Value
                  </th>

                  {formatMode === 'dynasty' ? (
                    <>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Age</th>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center relative group cursor-help hover:bg-gray-800/40 transition-colors">
                        <div className="flex items-center justify-center gap-1">
                          SOS OMFG
                          <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-48 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                          Season-Over-Season Overall Metric Fantasy Grade. Rates the strength of the player's underlying long-term profile compared to historical data.
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                        </div>
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center relative group cursor-help hover:bg-gray-800/40 transition-colors">
                        <div className="flex items-center justify-center gap-1">
                          SOS OMFG
                          <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-48 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                          Season-Over-Season Overall Metric Fantasy Grade. Rates the strength of the player's underlying long-term profile compared to historical data.
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center relative group cursor-help hover:bg-gray-800/40 transition-colors">
                        <div className="flex items-center justify-center gap-1">
                          WOW OMFG
                          <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-48 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                          Week-Over-Week Overall Metric Fantasy Grade. Analyzes recent volume and high-value opportunities to predict what could happen next.
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                        </div>
                      </th>
                    </>
                  )}
                  
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center border-l border-gray-800">
                    <div className="flex items-center justify-center gap-1.5">
                      Outcome Range (P25 - P75)
                      <button onClick={() => setActiveModal('outcomeRange')} className="text-gray-500 hover:text-white transition-colors">
                        <Info size={11} />
                      </button>
                    </div>
                  </th>

                  <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">Action Profile <button onClick={() => setActiveModal('marketAction')} className="text-gray-500 hover:text-white"><Info size={11} /></button></div>
                  </th>

                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-800/50">
                {isSyncing ? (
                  <tr>
                    <td colSpan="14" className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center text-red-500 animate-in fade-in duration-500">
                        <RefreshCw className="animate-spin mb-4" size={36} />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Calculating OMFG Trade Values</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Aligning algorithmic structures...</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleData.length === 0 ? (
                   <tr>
                    <td colSpan="14" className="py-20 text-center">
                      <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Data Available</h3>
                      <p className="text-gray-500 font-bold">No players match the current filter selection.</p>
                    </td>
                  </tr>
                ) : visibleData.map((player, idx) => {
                    const playerUrl = `/player/${player.name.toLowerCase().replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/i, '').replace(/['.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

                    return (
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
                           <Link href={playerUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-gray-100 tracking-tight hover:text-red-400 transition-colors">
                             {player.name}
                           </Link>
                           {player.team && player.team !== 'fa' && (
                             <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.team.toLowerCase()}.png`} alt={player.team} className="w-6 h-6 object-contain drop-shadow-md" onError={(e) => e.target.style.display = 'none'} />
                           )}
                         </div>
                      </td>

                      {/* Trade Value (First Data Column) */}
                      <td className="px-4 py-2.5 text-center bg-red-900/10 border-x border-gray-800/50">
                          <div className="text-base font-black text-white">{player.trade_value}</div>
                      </td>
                      
                      {formatMode === 'dynasty' ? (
                        <>
                          <td className="px-4 py-2.5 text-center"><span className="text-xs font-bold text-gray-300 bg-gray-800/80 px-2.5 py-1 rounded-md">{player.age || '-'}</span></td>
                          <td className="px-4 py-2.5 text-center"><div className="text-xs font-bold text-white">{player.SOS_OMFG.toFixed(1)}</div></td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2.5 text-center"><div className="text-xs font-bold text-white">{player.SOS_OMFG.toFixed(1)}</div></td>
                          <td className="px-4 py-2.5 text-center"><div className="text-xs font-bold text-gray-400">{player.WOW_OMFG.toFixed(1)}</div></td>
                        </>
                      )}

                      <td className="px-4 py-2.5 text-center border-l border-gray-800/50">
                         {/* Passing Adjusted Projections into Visualizer */}
                         {renderRangeVisualizer(player.adjP25, player.adjP50, player.adjP75)}
                      </td>
                      
                      <td className="px-4 py-2.5">
                         <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-lg border uppercase ${player.actionBadge.color}`}>
                            {player.actionBadge.text}
                         </span>
                      </td>

                    </tr>
                  )
                 })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">OMFG Trade Philosophy</h3>
          <div className="text-xs text-gray-400 space-y-2 font-medium leading-relaxed">
            <p>• Traditional trade calculators overreact to points. OMFG Trade Values evaluate the <strong>underlying strength of a player's role</strong> and volume security.</p>
            <p>• Values scale from 0 to 1,000, normalized against the highest-valued player in your scoring format.</p>
            <p>• In Dynasty mode, Age Multipliers are <strong>gated by OMFG Scores</strong>. Unproductive young players lose their youth premium, while elite veterans are insulated from age cliffs.</p>
          </div>
        </div>

      </div>
    </div>
  );
}