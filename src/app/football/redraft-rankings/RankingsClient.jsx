'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Settings, RefreshCw, Trophy, ListOrdered, ChevronDown, ChevronUp, Info, Search, X } from 'lucide-react'; 
import { useLeague } from '../../../context/LeagueContext'; 

export default function RankingsClient() {
  const [playersData, setPlayersData] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [latestWeekDisplay, setLatestWeekDisplay] = useState('Player');

  // Hook into League Context
  const { getActiveLeagueData } = useLeague();
  const activeLeague = getActiveLeagueData('football');

  // UI State Variables
  const [currentPosition, setCurrentPosition] = useState('QB');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Manual Scoring Format Settings (Defaults: 1QB, Full PPR, 6pt Pass TD, No TE Prem)
  const [manualIsSuperflex, setManualIsSuperflex] = useState(false); 
  const [manualPprValue, setManualPprValue] = useState(1); 
  const [manualPassTdValue, setManualPassTdValue] = useState(6); 
  const [manualTePremium, setManualTePremium] = useState(0);     

  // Active Scoring Formats (Overrides manual settings if a league is synced)
  const currentIsSuperflex = activeLeague?.rosterPositions ? activeLeague.rosterPositions.includes('SUPER_FLEX') : manualIsSuperflex;
  const currentPprValue = activeLeague?.scoringSettings?.rec ?? manualPprValue;
  const currentPassTdValue = activeLeague?.scoringSettings?.pass_td ?? manualPassTdValue;
  const currentTePremium = activeLeague?.scoringSettings?.bonus_rec_te ?? manualTePremium;

  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#e42d38';
  const secondaryColor = '#8a1a20';
  const positions = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DST'];

  useEffect(() => {
    async function loadData() {
      setIsSyncing(true);
      try {
        const metaRes = await fetch(`/api/omfg-data?year=2026&week=Week 1`);
        const metaData = await metaRes.json();
        let latestYear = '2026';
        let latestWeek = 'Week 1';
        
        if (metaData.available_models) {
            const activeWeekly = metaData.available_models.filter(m => m.week !== 'Season');
            if (activeWeekly.length > 0) {
                latestYear = String(activeWeekly[0].year);
                latestWeek = activeWeekly[0].week;
            }
        }
        
        // Update the dynamic header display
        setLatestWeekDisplay(latestWeek);

        const res = await fetch(`/api/omfg-data?year=${latestYear}&week=${latestWeek}`);
        const data = await res.json();
        setPlayersData(data.success && data.players ? data.players : []);
      } catch (err) {
        console.error("Error loading Rankings data", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadData();
  }, []);

  const processedRankings = useMemo(() => {
    let basePlayers = playersData || [];
    
    // Position Filtering
    if (currentPosition === 'FLEX') {
        basePlayers = basePlayers.filter(p => ['RB', 'WR', 'TE'].includes(p.Position));
    } else {
        basePlayers = basePlayers.filter(p => p.Position === currentPosition);
    }

    const recalculated = basePlayers.map(player => {
        const baseProj = Number(player['Projected Fantasy Points']) || 0;
        const pos = player.Position;
        
        // Extract raw stats
        const passTds = Number(player['Pass Td'] || player['PASS TDS']) || 0;
        const receptions = Number(player['Receptions'] || player['REC']) || 0;

        // Dynamic Scoring Adjustments (Assumes base OMFG data is 0.5 PPR and 4pt Pass TD)
        const deltaPassTd = passTds * (currentPassTdValue - 4);
        const deltaPpr = receptions * (currentPprValue - 0.5);
        const deltaTep = (pos === 'TE') ? (receptions * currentTePremium) : 0;
        
        const adjProjPts = baseProj + deltaPassTd + deltaPpr + deltaTep;
        
        // Determine Edge against Market
        const consensusGap = Number(player['Consensus Rank Gap'] || player['Rank Gap']) || 0;
        
        return {
            ...player,
            adjProjPts,
            consensusGap
        };
    });

    // Re-sort dynamically by adjusted points
    recalculated.sort((a, b) => b.adjProjPts - a.adjProjPts);

    // Assign dynamic overall and positional ranks
    const posCounters = {};
    return recalculated.map((player, index) => {
      const pos = player.Position || 'UNK';
      if (!posCounters[pos]) posCounters[pos] = 0;
      posCounters[pos] += 1;
      
      return { 
          ...player, 
          overallRank: index + 1, 
          posRank: `${pos}${posCounters[pos]}` 
      };
    });
  }, [playersData, currentPosition, currentPprValue, currentPassTdValue, currentTePremium]); 

  // Apply Search Filter AFTER ranks are assigned to preserve true ranking numbers
  const visibleRankings = useMemo(() => {
    return processedRankings.filter(player => {
      if (!searchQuery.trim()) return true;
      const playerName = player.Player || player.name || '';
      return playerName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [processedRankings, searchQuery]);

  const toggleRow = (playerId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) newSet.delete(playerId);
      else newSet.add(playerId);
      return newSet;
    });
  };

  const formatNumber = (val, decimals = 1) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? '-' : num.toFixed(decimals);
  };

  const formatPct = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const cleanVal = String(val).replace('%', '').trim();
    let num = Number(cleanVal);
    if (isNaN(num)) return '-';
    if (num <= 1 && num > 0) num = num * 100;
    return `${Math.round(num)}%`;
  };

  const getProbColor = (val) => {
    if (val === null || val === undefined || val === '') return 'text-gray-600';
    const cleanVal = String(val).replace('%', '').trim();
    let num = Number(cleanVal);
    if (isNaN(num)) return 'text-gray-600';
    const pct = (num <= 1 && num > 0) ? num * 100 : num;
    if (pct >= 60) return 'text-blue-400';
    if (pct >= 30) return 'text-blue-600';
    return 'text-gray-600';
  };

  // Fixed Absolute Scale Heatmap
  const getAbsoluteHeatmapColor = (val) => {
    if (val === null || val === undefined || val === '') return 'text-gray-400';
    const num = Number(val);
    if (isNaN(num)) return 'text-gray-400';
    
    if (num >= 87.5) return 'text-green-500 font-bold';
    if (num >= 75.0) return 'text-emerald-400 font-bold';
    if (num >= 62.5) return 'text-yellow-400 font-bold';
    if (num >= 50.0) return 'text-yellow-200 font-bold';
    if (num >= 37.5) return 'text-orange-500 font-bold';
    if (num >= 25.0) return 'text-orange-300 font-bold';
    if (num >= 12.5) return 'text-red-400 font-bold';
    return 'text-red-600 font-bold';
  };

  // Relative Scale Heatmap for Expanded Stats
  const inverseStats = useMemo(() => new Set([
    'Projected Interceptions', 'Interceptions', 'Actual Interceptions', 'INT',
    'Projected Fumbles', 'Fumbles', 'Actual Fumbles', 'FUM',
    'Projected Points Allowed', 'Points Allowed', 'Actual Points Allowed', 'Pts Agn', 'PTS AGN',
    'Projected Yards Allowed', 'Yards Allowed', 'Actual Yards Allowed', 'Yds Agn', 'YDS AGN'
  ]), []);

  const statThresholds = useMemo(() => {
    if (!processedRankings || processedRankings.length === 0) return {};
    const thresholds = {};
    const allKeys = Object.keys(processedRankings[0]);

    allKeys.forEach(stat => {
      const values = processedRankings.map(p => p[stat])
        .filter(v => v !== null && v !== undefined && v !== '')
        .map(v => Number(v)).filter(v => !isNaN(v)).sort((a, b) => a - b);
        
      if (values.length > 0) {
        thresholds[stat] = {
          p90: values[Math.floor(values.length * 0.90)] || values[values.length - 1],
          p75: values[Math.floor(values.length * 0.75)] || values[values.length - 1],
          p25: values[Math.floor(values.length * 0.25)] || values[0],
          p10: values[Math.floor(values.length * 0.10)] || values[0],
        };
      }
    });
    return thresholds;
  }, [processedRankings]);

  const getHeatmapClasses = (val, statKey) => {
    if (val === null || val === undefined || val === '-') {
      return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';
    }
    const num = Number(val);
    const thresh = statThresholds[statKey];
    
    if (!thresh || isNaN(num)) return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';

    const isInverse = inverseStats.has(statKey);
    let isTop10 = num >= thresh.p90; let isTop25 = num >= thresh.p75 && num < thresh.p90;
    let isBot25 = num <= thresh.p25 && num > thresh.p10; let isBot10 = num <= thresh.p10;

    if (isInverse) {
      isTop10 = num <= thresh.p10; isTop25 = num <= thresh.p25 && num > thresh.p10;
      isBot25 = num >= thresh.p75 && num < thresh.p90; isBot10 = num >= thresh.p90;
    }

    if (thresh.p90 === thresh.p10) return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';

    if (isTop10) return 'bg-emerald-900/30 border-emerald-800/50 text-emerald-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)]';
    if (isTop25) return 'bg-emerald-900/10 border-emerald-800/30 text-emerald-300';
    if (isBot10) return 'bg-red-900/30 border-red-800/50 text-red-400 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)]';
    if (isBot25) return 'bg-red-900/10 border-red-800/30 text-red-300';
    return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';
  };

  const getFlexibleValue = (player, matchRules) => {
    if (!player) return null;
    const normalize = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
    const isValid = (val) => val !== undefined && val !== null && val !== '' && val !== '-';

    for (const rule of matchRules) {
      if (Array.isArray(rule)) continue;
      const normRule = normalize(rule);
      for (const [key, value] of Object.entries(player)) {
        if (!isValid(value)) continue;
        if (normalize(key) === normRule) return value;
      }
    }

    for (const rule of matchRules) {
      if (Array.isArray(rule)) continue;
      const normRule = normalize(rule);
      for (const [key, value] of Object.entries(player)) {
        if (!isValid(value)) continue;
        const strippedKey = normalize(key).replace(/^projected/, '').replace(/^actual/, '');
        if (strippedKey === normRule) return value;
      }
    }
    
    for (const rule of matchRules) {
      for (const [key, value] of Object.entries(player)) {
        if (!isValid(value)) continue;
        const normKey = normalize(key);
        if (Array.isArray(rule)) {
          if (rule.every(sub => normKey.includes(normalize(sub)))) return value;
        } else {
          const normRule = normalize(rule);
          if (!normRule.includes('40') && normKey.includes('40')) continue;
          if (!normRule.includes('50') && normKey.includes('50')) continue;
          if (!normRule.includes('plus') && normKey.includes('plus')) continue;
          if (normKey.includes(normRule)) return value;
        }
      }
    }
    return null;
  };

  const renderExpandedStats = (player) => {
    const pos = player.Position;
    let stats = [];

    if (pos === 'QB') {
      stats = [
        { label: 'Pass Att', val: getFlexibleValue(player, ['Projected Pass Attempts', 'Actual Pass Attempts', 'Pass Attempts', 'Pass Att']), key: 'Pass Attempts' },
        { label: 'Pass Yds', val: getFlexibleValue(player, ['Projected Pass Yards', 'Actual Pass Yards', 'Pass Yards', 'Pass Yds']), key: 'Pass Yards' },
        { label: 'Pass TD', val: getFlexibleValue(player, ['Projected Pass Td', 'Actual Pass Td', 'Projected Pass TDs', 'Actual Pass TDs', 'Pass Td', 'Pass TD']), key: 'Pass Td' },
        { label: 'INTs', val: getFlexibleValue(player, ['Projected Interceptions', 'Actual Interceptions', 'Interceptions', 'INT', 'Ints']), key: 'Interceptions' },
        { label: 'Rush Att', val: getFlexibleValue(player, ['Projected Rush Attempts', 'Actual Rush Attempts', 'Rush Attempts', 'Rush Att']), key: 'Rush Attempts' },
        { label: 'Rush Yds', val: getFlexibleValue(player, ['Projected Rush Yards', 'Actual Rush Yards', 'Rush Yards', 'Rush Yds']), key: 'Rush Yards' },
        { label: 'Rush TD', val: getFlexibleValue(player, ['Projected Rush Td', 'Actual Rush Td', 'Projected Rush TDs', 'Actual Rush TDs', 'Rush Td', 'Rush TD']), key: 'Rush Td' },
      ];
    } else if (pos === 'RB') {
      stats = [
        { label: 'Rush Att', val: getFlexibleValue(player, ['Projected Rush Attempts', 'Actual Rush Attempts', 'Rush Attempts', 'Rush Att']), key: 'Rush Attempts' },
        { label: 'Rush Yds', val: getFlexibleValue(player, ['Projected Rush Yards', 'Actual Rush Yards', 'Rush Yards', 'Rush Yds']), key: 'Rush Yards' },
        { label: 'Rush TD', val: getFlexibleValue(player, ['Projected Rush Td', 'Actual Rush Td', 'Projected Rush TDs', 'Actual Rush TDs', 'Rush Td', 'Rush TD']), key: 'Rush Td' },
        { label: 'Targets', val: getFlexibleValue(player, ['Projected Targets', 'Actual Targets', 'Targets']), key: 'Targets' },
        { label: 'Recs', val: getFlexibleValue(player, ['Projected Receptions', 'Actual Receptions', 'Receptions']), key: 'Receptions' },
        { label: 'Rec Yds', val: getFlexibleValue(player, ['Projected Receiving Yards', 'Actual Receiving Yards', 'Receiving Yards']), key: 'Receiving Yards' },
        { label: 'Rec TD', val: getFlexibleValue(player, ['Projected Receiving Td', 'Actual Receiving Td', 'Receiving Td', 'Receiving TD', 'Rec Td']), key: 'Receiving Td' },
      ];
    } else if (pos === 'WR' || pos === 'TE') {
      stats = [
        { label: 'Targets', val: getFlexibleValue(player, ['Projected Targets', 'Actual Targets', 'Targets']), key: 'Targets' },
        { label: 'Recs', val: getFlexibleValue(player, ['Projected Receptions', 'Actual Receptions', 'Receptions']), key: 'Receptions' },
        { label: 'Rec Yds', val: getFlexibleValue(player, ['Projected Receiving Yards', 'Actual Receiving Yards', 'Receiving Yards']), key: 'Receiving Yards' },
        { label: 'Rec TD', val: getFlexibleValue(player, ['Projected Receiving Td', 'Actual Receiving Td', 'Receiving Td', 'Receiving TD', 'Rec Td']), key: 'Receiving Td' },
        { label: 'Air Yds', val: getFlexibleValue(player, ['Projected Air Yards', 'Actual Air Yards', 'Air Yards']), key: 'Air Yards' },
        { label: '1st Reads', val: getFlexibleValue(player, ['Projected First Read Targets', 'Actual First Read Targets', 'First Read Targets', 'First-Read Targets']), key: 'First Read Targets' },
        { label: 'EZ Tgts', val: getFlexibleValue(player, ['Projected End Zone Targets', 'Actual End Zone Targets', 'End Zone Targets', 'End-Zone Targets']), key: 'End Zone Targets' },
      ];
    } else if (pos === 'K') {
      stats = [
        { label: 'FG Att', val: getFlexibleValue(player, ['Projected FG Attempts', 'Actual FG Attempts', 'FG Attempts', 'FG Att', 'Projected Fga', 'Actual Fga', 'Fga']), key: 'Fga' },
        { label: 'FG Made', val: getFlexibleValue(player, ['Projected FGs Made', 'Actual FGs Made', 'FGs Made', 'FG Made', 'Projected Fgm', 'Actual Fgm', 'Fgm']), key: 'Fgm' },
        { label: 'FGA 40-49', val: getFlexibleValue(player, ['Projected 40-49 FG Attempts', 'Actual 40-49 FG Attempts', '40-49 FG Attempts', 'FGA 40-49', 'Projected Fga 40 49', 'Actual Fga 40 49', 'Fga 40 49']), key: 'Fga 40 49' },
        { label: 'FGM 40-49', val: getFlexibleValue(player, ['Projected 40-49 FGs Made', 'Actual 40-49 FGs Made', '40-49 FGs Made', 'FGM 40-49', 'Projected Fgm 40 49', 'Actual Fgm 40 49', 'Fgm 40 49']), key: 'Fgm 40 49' },
        { label: 'FGA 50+', val: getFlexibleValue(player, ['Projected 50+ FG Attempts', 'Actual 50+ FG Attempts', '50+ FG Attempts', 'FGA 50+', 'Projected Fga 50 Plus', 'Actual Fga 50 Plus', 'Fga 50 Plus']), key: 'Fga 50 Plus' },
        { label: 'FGM 50+', val: getFlexibleValue(player, ['Projected 50+ FGs Made', 'Actual 50+ FGs Made', '50+ FGs Made', 'FGM 50+', 'Projected Fgm 50 Plus', 'Actual Fgm 50 Plus', 'Fgm 50 Plus']), key: 'Fgm 50 Plus' },
        { label: 'XP Att', val: getFlexibleValue(player, ['Projected XP Attempts', 'Actual XP Attempts', 'XP Attempts', 'XP Att', 'Projected Xpa', 'Actual Xpa', 'Xpa']), key: 'Xpa' },
        { label: 'XP Made', val: getFlexibleValue(player, ['Projected XPs Made', 'Actual XPs Made', 'XPs Made', 'XP Made', 'Projected Xpm', 'Actual Xpm', 'Xpm']), key: 'Xpm' },
      ];
    } else if (pos === 'DST') {
      stats = [
        { label: 'Sacks', val: getFlexibleValue(player, ['Projected Sacks', 'Actual Sacks', 'Sacks', 'SACK']), key: 'Sacks' },
        { label: 'INTs', val: getFlexibleValue(player, ['Projected Interceptions', 'Actual Interceptions', 'Interceptions', 'INT', 'Ints', 'Int']), key: 'Interceptions' },
        { label: 'Fum Rec', val: getFlexibleValue(player, ['Projected Fumbles', 'Actual Fumbles', 'Fumbles', 'Fumble Recoveries', 'Fumbles Recovered', 'Fum Rec', 'FUM REC']), key: 'Fumbles' },
        { label: 'Def TDs', val: getFlexibleValue(player, ['Projected Defensive Tds', 'Actual Defensive Tds', 'Defensive Tds', 'Defensive Touchdowns', 'Def Tds', 'Def TD', 'DEF TD']), key: 'Defensive Tds' },
        { label: 'Pts Allw', val: getFlexibleValue(player, ['Projected Points Allowed', 'Actual Points Allowed', 'Points Allowed', 'Pts Allow', 'Pts Agn', 'PTS AGN']), key: 'Points Allowed' },
        { label: 'Yds Allw', val: getFlexibleValue(player, ['Projected Yards Allowed', 'Actual Yards Allowed', 'Yards Allowed', 'Yds Allow', 'Yds Agn', 'YDS AGN']), key: 'Yards Allowed' },
      ];
    }

    return (
      <div className="flex flex-wrap gap-2 p-3">
        {stats.map((stat, i) => {
          const heatClass = getHeatmapClasses(stat.val, stat.key);
          return (
            <div key={i} className={`rounded-lg p-2 flex flex-col items-center justify-center text-center transition-colors border flex-1 min-w-[70px] ${heatClass}`}>
              <span className="text-[8px] font-black uppercase text-gray-400 mb-0.5 tracking-widest leading-none">{stat.label}</span>
              <span className="text-[13px] font-black leading-none mt-1">{formatNumber(stat.val)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const prob1Header = currentPosition === 'TE' ? 'TOP 5' : (currentPosition === 'QB' || currentPosition === 'K' || currentPosition === 'DST') ? 'TOP 6' : 'TOP 12';
  const prob2Header = (currentPosition === 'QB' || currentPosition === 'TE' || currentPosition === 'K' || currentPosition === 'DST') ? 'TOP 12' : 'TOP 24';
  const prob3Header = (currentPosition === 'QB' || currentPosition === 'TE' || currentPosition === 'K' || currentPosition === 'DST') ? 'TOP 18' : 'TOP 36';
  
  const colSpanCount = currentPosition === 'FLEX' ? 11 : 10;

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative">
      
      {/* Hero Section */}
      <div className="relative w-full h-[220px] md:h-[260px] flex items-center overflow-hidden rounded-2xl mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }} />
        <img src={bgImage} alt="Football Background" className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between h-full px-6 md:px-10 pb-4 sm:pb-0 gap-4">
          <div className="max-w-2xl w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-inner backdrop-blur-sm">
              <ListOrdered size={12} /> OMFG-Powered Projections
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              {latestWeekDisplay} Rankings
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Weekly player rankings that adapt to upcoming matchups and recent trends—fully customized to match your exact league scoring rules so you know exactly who to start.
            </p>
          </div>

          <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-2xl shrink-0 mt-4 md:mt-0 self-start md:self-end md:mb-8">
            <Link href="/football/draft-rankings" className="px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all text-gray-400 hover:text-white">Draft</Link>
            <Link href="/football/redraft-rankings" className="px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all bg-white text-black shadow-md">Redraft</Link>
            <Link href="/football/dynasty-rankings" className="px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all text-gray-400 hover:text-white">Dynasty</Link>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Controls Row */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 relative z-[100]">
          
          <div className="flex flex-row flex-wrap items-center gap-2 xl:gap-4 w-full pb-2 -mb-2">
            <div className="flex bg-[#1a1a1a] p-1 rounded-2xl shadow-inner border border-gray-800 w-fit shrink-0">
               {positions.map(pos => (
                  <button key={pos} onClick={() => setCurrentPosition(pos)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>{pos}</button>
               ))}
            </div>

            {/* SEARCH TOGGLE */}
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => {
                  setShowSearch(!showSearch);
                  if (showSearch) setSearchQuery('');
                }} 
                className={`p-2 rounded-xl border transition-all ${showSearch || searchQuery ? 'bg-red-600/10 border-red-500/50 text-red-500' : 'bg-[#1a1a1a] border-gray-800 text-gray-500 hover:text-white'}`}
              >
                <Search size={16} />
              </button>
              
              {showSearch && (
                <div className="relative animate-in fade-in slide-in-from-left-2 duration-200">
                  <input 
                    type="text" 
                    placeholder="Search player..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#111] border border-gray-800 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xl pl-3 pr-8 py-2 h-[34px] w-40 sm:w-48 focus:outline-none focus:border-red-500 transition-colors shadow-inner"
                    autoFocus
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
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
        <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-[400px]">
          <div className="overflow-x-auto scrollbar-hide pb-4 overflow-y-visible">
            <table className="min-w-full text-left whitespace-nowrap">
              <thead className="bg-[#1a1a1a] border-b border-gray-800 relative z-50">
                <tr>
                  {currentPosition === 'FLEX' && (
                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Rnk</th>
                  )}
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-16">Pos Rank</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Opponent</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center bg-gray-900/30 border-x border-gray-800">
                    Proj Pts
                  </th>
                  <th 
                    className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center cursor-help hover:bg-gray-800/40 transition-colors relative group"
                  >
                    <div className="flex items-center justify-center gap-1">
                      OMFG
                      <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-52 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                      Overall Metric Fantasy Grade. Rates the strength of the player's underlying volume and role opportunity for this week.
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center cursor-help hover:bg-gray-800/40 transition-colors relative group"
                  >
                    <div className="flex items-center justify-center gap-1">
                      Matchup
                      <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-52 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                      A 0-100 rating of opponent matchup difficulty. Higher scores represent more favorable matchups against opposing defenses.
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-[10px] font-black text-[#1b75bb] uppercase tracking-widest text-center bg-[#0f446e]/20 border-l border-gray-800 cursor-help hover:bg-[#0f446e]/40 transition-colors relative group"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {prob1Header}
                      <Info size={10} className="text-[#1b75bb]/70 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-52 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                      Estimated percentage chance of finishing inside this position-specific rank tier for the week.
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-[10px] font-black text-[#1b75bb] uppercase tracking-widest text-center bg-[#0f446e]/20 border-x border-gray-800 cursor-help hover:bg-[#0f446e]/40 transition-colors relative group"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {prob2Header}
                      <Info size={10} className="text-[#1b75bb]/70 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-52 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                      Estimated percentage chance of finishing inside this position-specific rank tier for the week.
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-[10px] font-black text-[#1b75bb] uppercase tracking-widest text-center bg-[#0f446e]/20 border-r border-gray-800 cursor-help hover:bg-[#0f446e]/40 transition-colors relative group"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {prob3Header}
                      <Info size={10} className="text-[#1b75bb]/70 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-52 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                      Estimated percentage chance of finishing inside this position-specific rank tier for the week.
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Stats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {isSyncing ? (
                  <tr>
                    <td colSpan={colSpanCount} className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center text-red-500 animate-in fade-in duration-500">
                        <RefreshCw className="animate-spin mb-4" size={36} />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Calculating Rankings</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Applying custom scoring format...</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleRankings.length === 0 ? (
                   <tr>
                    <td colSpan={colSpanCount} className="py-20 text-center">
                      <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Data Available</h3>
                      <p className="text-gray-500 font-bold">No players match the current filter selection.</p>
                    </td>
                  </tr>
                ) : visibleRankings.map((player, idx) => {
                    const playerId = `${player.Player}-${idx}`;
                    const isExpanded = expandedRows.has(playerId);
                    const playerUrl = `/player/${player.Player?.toLowerCase().replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/i, '').replace(/['.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
                    const omfgScore = Number(player['Preseason OMFG'] ?? player['In-Season OMFG Score'] ?? player['OMFG Score']) || 0;
                    const matchupScore = Number(player['Matchup Score']) || 0;

                    let prob1, prob2, prob3;

                    if (currentPosition === 'TE') {
                        prob1 = getFlexibleValue(player, ['Top 5 Probability', 'Top 5', ['prob', 'top5']]);
                        prob2 = getFlexibleValue(player, ['Top 12 Probability', 'Top 12', ['prob', 'top12']]);
                        prob3 = getFlexibleValue(player, ['Top 18 Probability', 'Top 18', ['prob', 'top18']]);
                    } else if (currentPosition === 'QB' || currentPosition === 'K' || currentPosition === 'DST') {
                        prob1 = getFlexibleValue(player, ['Top 6 Probability', 'Top 6', ['prob', 'top6']]);
                        prob2 = getFlexibleValue(player, ['Top 12 Probability', 'Top 12', ['prob', 'top12']]);
                        prob3 = getFlexibleValue(player, ['Top 18 Probability', 'Top 18', ['prob', 'top18']]);
                    } else {
                        // RBs, WRs, FLEX
                        prob1 = getFlexibleValue(player, ['Top 12 Probability', 'Top 12', ['prob', 'top12']]);
                        prob2 = getFlexibleValue(player, ['Top 24 Probability', 'Top 24', ['prob', 'top24']]);
                        prob3 = getFlexibleValue(player, ['Top 36 Probability', 'Top 36', ['prob', 'top36']]);
                    }

                    return (
                    <React.Fragment key={playerId}>
                      <tr onClick={() => toggleRow(playerId)} className="hover:bg-[#151515] transition-colors group cursor-pointer">
                        {currentPosition === 'FLEX' && (
                          <td className="px-4 py-2.5">
                            <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-gray-800 text-gray-300 border border-gray-700 shadow-inner group-hover:bg-gray-700 group-hover:text-white transition-colors">
                              {player.overallRank}
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-2.5 text-center">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                             {player.posRank}
                           </span>
                        </td>
                        <td className="px-4 py-2.5">
                           <div className="flex items-center gap-3">
                             <Link href={playerUrl} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-gray-100 tracking-tight hover:text-red-400 transition-colors">
                               {player.Player}
                             </Link>
                             {player.Team && player.Team !== 'fa' && (
                               <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.Team.toLowerCase()}.png`} alt={player.Team} className="w-6 h-6 object-contain drop-shadow-md" onError={(e) => e.target.style.display = 'none'} />
                             )}
                           </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                            <span className="text-xs font-bold text-gray-400">{player.Opponent}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center bg-gray-900/30 border-x border-gray-800/50">
                            <div className="text-base font-black text-white">{player.adjProjPts.toFixed(1)}</div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                            <div className={`text-xs ${getAbsoluteHeatmapColor(omfgScore)}`}>
                              {formatNumber(omfgScore)}
                            </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                            <div className={`text-xs ${getAbsoluteHeatmapColor(matchupScore)}`}>
                              {formatNumber(matchupScore)}
                            </div>
                        </td>
                        <td className="px-4 py-2.5 text-center bg-[#0f446e]/20 border-l border-gray-800/50">
                            <span className={`text-[11px] font-bold ${getProbColor(prob1)}`}>{formatPct(prob1)}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center bg-[#0f446e]/20 border-x border-gray-800/50">
                            <span className={`text-[11px] font-bold ${getProbColor(prob2)}`}>{formatPct(prob2)}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center bg-[#0f446e]/20 border-r border-gray-800/50">
                            <span className={`text-[11px] font-bold ${getProbColor(prob3)}`}>{formatPct(prob3)}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-500">
                          {isExpanded ? <ChevronUp size={16} className="mx-auto" /> : <ChevronDown size={16} className="mx-auto" />}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-[#1e1e1e] border-b border-gray-700 shadow-inner">
                          <td colSpan={colSpanCount} className="p-0">
                            <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                              {renderExpandedStats(player)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                 })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}