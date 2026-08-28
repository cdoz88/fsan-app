'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { RefreshCw, ChevronDown, ChevronUp, Info } from 'lucide-react';

export default function SeasonTable({ visibleData, isHistorical, isSyncing }) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  const colSpanCount = isHistorical ? 8 : 10;

  const toggleRow = (playerId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) newSet.delete(playerId);
      else newSet.add(playerId);
      return newSet;
    });
  };

  const formatNumber = (val, decimals = 1) => {
    if (val === null || val === undefined || val === '' || val === '-') return '-';
    const num = Number(val);
    return isNaN(num) ? '-' : num.toFixed(decimals);
  };

  // 🌟 NEW: Added Pts Allow and Yds Allow fallbacks to Inverse Stats
  const inverseStats = new Set([
    'Projected Interceptions', 'Interceptions', 'Actual Interceptions', 'INT', 'Int', 'Ints',
    'Projected Fumbles', 'Fumbles', 'Actual Fumbles', 'FUM',
    'Projected Points Allowed', 'Points Allowed', 'Actual Points Allowed', 'Pts Agn', 'PTS AGN', 'Pts Allow',
    'Projected Yards Allowed', 'Yards Allowed', 'Actual Yards Allowed', 'Yds Agn', 'YDS AGN', 'Yds Allow'
  ]);

  const statThresholds = useMemo(() => {
    if (!visibleData || visibleData.length === 0) return {};
    const thresholds = {};
    const allKeys = Object.keys(visibleData[0]);

    allKeys.forEach(stat => {
      const values = visibleData.map(p => p[stat])
        .filter(v => v !== null && v !== undefined && v !== '' && v !== '-')
        .map(v => Number(v))
        .filter(v => !isNaN(v))
        .sort((a, b) => a - b);
        
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
  }, [visibleData]);

  const getHeatmapClasses = (val, statKey, isBox = false) => {
    if (val === null || val === undefined || val === '-') {
      return isBox ? 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' : 'text-white';
    }
    const num = Number(val);
    const thresh = statThresholds[statKey];
    if (!thresh || isNaN(num)) return isBox ? 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' : 'text-white font-bold';

    const isInverse = inverseStats.has(statKey);
    let isTop10 = num >= thresh.p90; let isTop25 = num >= thresh.p75 && num < thresh.p90;
    let isBot25 = num <= thresh.p25 && num > thresh.p10; let isBot10 = num <= thresh.p10;

    if (isInverse) {
      isTop10 = num <= thresh.p10; isTop25 = num <= thresh.p25 && num > thresh.p10;
      isBot25 = num >= thresh.p75 && num < thresh.p90; isBot10 = num >= thresh.p90;
    }

    if (thresh.p90 === thresh.p10) return isBox ? 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' : 'text-white font-bold';

    if (isBox) {
      if (isTop10) return 'bg-emerald-900/30 border-emerald-800/50 text-emerald-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)]';
      if (isTop25) return 'bg-emerald-900/10 border-emerald-800/30 text-emerald-300';
      if (isBot10) return 'bg-red-900/30 border-red-800/50 text-red-400 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)]';
      if (isBot25) return 'bg-red-900/10 border-red-800/30 text-red-300';
      return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';
    } else {
      if (isTop10) return 'text-emerald-400 font-black drop-shadow-sm';
      if (isTop25) return 'text-emerald-300 font-bold';
      if (isBot10) return 'text-red-400 font-black drop-shadow-sm';
      if (isBot25) return 'text-red-300 font-bold';
      return 'text-white font-bold';
    }
  };

  const getFlexibleValue = (player, matchRules) => {
    if (!player) return null;
    const normalize = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 🌟 FIX: Explicitly ignore "-" dashes so the loop keeps searching for the real column
    const isValid = (val) => val !== undefined && val !== null && val !== '' && val !== '-';

    // Phase 1: EXACT MATCHES
    for (const rule of matchRules) {
      if (Array.isArray(rule)) continue;
      const normRule = normalize(rule);
      for (const [key, value] of Object.entries(player)) {
        if (!isValid(value)) continue;
        if (normalize(key) === normRule) return value;
      }
    }

    // Phase 1.5: EXACT MATCHES ignoring "Projected" or "Actual" prefixes
    for (const rule of matchRules) {
      if (Array.isArray(rule)) continue;
      const normRule = normalize(rule);
      for (const [key, value] of Object.entries(player)) {
        if (!isValid(value)) continue;
        const strippedKey = normalize(key).replace(/^projected/, '').replace(/^actual/, '');
        if (strippedKey === normRule) return value;
      }
    }
    
    // Phase 2: PARTIAL MATCHES (Safeguarded)
    for (const rule of matchRules) {
      for (const [key, value] of Object.entries(player)) {
        if (!isValid(value)) continue;
        const normKey = normalize(key);
        if (Array.isArray(rule)) {
          if (rule.every(sub => normKey.includes(normalize(sub)))) return value;
        } else {
          const normRule = normalize(rule);
          
          // Anti-Collision Safeguard for Kicker Stats
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
        { label: 'Pass Att', val: getFlexibleValue(player, ['Pass Attempts', 'Pass Att']), key: 'Pass Attempts' },
        { label: 'Pass Yds', val: getFlexibleValue(player, ['Pass Yards', 'Pass Yds']), key: 'Pass Yards' },
        { label: 'Pass TD', val: getFlexibleValue(player, ['Pass Td', 'Pass TD']), key: 'Pass Td' },
        { label: 'INTs', val: getFlexibleValue(player, ['Interceptions', 'INT', 'Ints']), key: 'Interceptions' },
        { label: 'Rush Att', val: getFlexibleValue(player, ['Rush Attempts', 'Rush Att']), key: 'Rush Attempts' },
        { label: 'Rush Yds', val: getFlexibleValue(player, ['Rush Yards', 'Rush Yds']), key: 'Rush Yards' },
        { label: 'Rush TD', val: getFlexibleValue(player, ['Rush Td', 'Rush TD']), key: 'Rush Td' },
      ];
    } else if (pos === 'RB') {
      stats = [
        { label: 'Rush Att', val: getFlexibleValue(player, ['Rush Attempts', 'Rush Att']), key: 'Rush Attempts' },
        { label: 'Rush Yds', val: getFlexibleValue(player, ['Rush Yards', 'Rush Yds']), key: 'Rush Yards' },
        { label: 'Rush TD', val: getFlexibleValue(player, ['Rush Td', 'Rush TD']), key: 'Rush Td' },
        { label: 'Targets', val: getFlexibleValue(player, ['Targets']), key: 'Targets' },
        { label: 'Recs', val: getFlexibleValue(player, ['Receptions']), key: 'Receptions' },
        { label: 'Rec Yds', val: getFlexibleValue(player, ['Receiving Yards']), key: 'Receiving Yards' },
        { label: 'Rec TD', val: getFlexibleValue(player, ['Receiving Td', 'Receiving TD', 'Rec Td']), key: 'Receiving Td' },
      ];
    } else if (pos === 'WR' || pos === 'TE') {
      stats = [
        { label: 'Targets', val: getFlexibleValue(player, ['Targets']), key: 'Targets' },
        { label: 'Recs', val: getFlexibleValue(player, ['Receptions']), key: 'Receptions' },
        { label: 'Rec Yds', val: getFlexibleValue(player, ['Receiving Yards']), key: 'Receiving Yards' },
        { label: 'Rec TD', val: getFlexibleValue(player, ['Receiving Td', 'Receiving TD', 'Rec Td']), key: 'Receiving Td' },
        { label: 'Air Yds', val: getFlexibleValue(player, ['Air Yards']), key: 'Air Yards' },
        { label: '1st Reads', val: getFlexibleValue(player, ['First Read Targets', 'First-Read Targets']), key: 'First Read Targets' },
        { label: 'EZ Tgts', val: getFlexibleValue(player, ['End Zone Targets', 'End-Zone Targets']), key: 'End Zone Targets' },
      ];
    } else if (pos === 'K') {
      stats = [
        { label: 'FG Att', val: getFlexibleValue(player, ['Fga', 'FGA', 'Field Goals Attempted', 'FG Att']), key: 'Fga' },
        { label: 'FG Made', val: getFlexibleValue(player, ['Fgm', 'FGM', 'Field Goals Made', 'FG Made']), key: 'Fgm' },
        { label: 'FGA 40-49', val: getFlexibleValue(player, ['Fga 40 49', 'FGA 40-49', 'Fga4049']), key: 'Fga 40 49' },
        { label: 'FGM 40-49', val: getFlexibleValue(player, ['Fgm 40 49', 'FGM 40-49', 'Fgm4049']), key: 'Fgm 40 49' },
        { label: 'FGA 50+', val: getFlexibleValue(player, ['Fga 50 Plus', 'FGA 50+', 'Fga50Plus', 'Fga 50']), key: 'Fga 50 Plus' },
        { label: 'FGM 50+', val: getFlexibleValue(player, ['Fgm 50 Plus', 'FGM 50+', 'Fgm50Plus', 'Fgm 50']), key: 'Fgm 50 Plus' },
        { label: 'XP Att', val: getFlexibleValue(player, ['Xpa', 'XPA', 'Extra Points Attempted', 'XP Att']), key: 'Xpa' },
        { label: 'XP Made', val: getFlexibleValue(player, ['Xpm', 'XPM', 'Extra Points Made', 'XP Made']), key: 'Xpm' },
      ];
    } else if (pos === 'DST') {
      stats = [
        { label: 'Sacks', val: getFlexibleValue(player, ['Sacks', 'SACK']), key: 'Sacks' },
        { label: 'INTs', val: getFlexibleValue(player, ['Interceptions', 'INT', 'Ints', 'Int']), key: 'Interceptions' },
        { label: 'Fum Rec', val: getFlexibleValue(player, ['Fumble Recoveries', 'Fumbles Recovered', 'Fum Rec', 'FUM REC']), key: 'Fumble Recoveries' },
        { label: 'Def TDs', val: getFlexibleValue(player, ['Defensive Touchdowns', 'Def Tds', 'Def TD', 'DEF TD']), key: 'Defensive Touchdowns' },
        { label: 'Pts Allw', val: getFlexibleValue(player, ['Points Allowed', 'Pts Allow', 'Pts Agn', 'PTS AGN']), key: 'Points Allowed' },
        { label: 'Yds Allw', val: getFlexibleValue(player, ['Yards Allowed', 'Yds Allow', 'Yds Agn', 'YDS AGN']), key: 'Yards Allowed' },
      ];
    }

    return (
      <div className="flex flex-wrap gap-2 p-3">
        {stats.map((stat, i) => {
          const heatClass = getHeatmapClasses(stat.val, stat.key, true);
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

  return (
    <div className="bg-[#111] rounded-2xl shadow-2xl border border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-[400px] overflow-visible">
      <div className="overflow-x-auto scrollbar-hide rounded-2xl">
        <table className="min-w-full text-left whitespace-nowrap">
          <thead className="bg-[#1a1a1a] border-b border-gray-800 relative z-50">
            <tr>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest w-12 text-center">Rk</th>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Pos</th>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">Player</th>
              
              <th className="px-2 py-2 text-[9px] font-black text-red-500 uppercase tracking-widest text-center bg-red-900/10 border-x border-gray-800 relative group cursor-help hover:bg-red-900/30 transition-colors">
                <div className="flex items-center justify-center gap-1">
                  OMFG
                  <Info size={10} className="text-red-400/50 group-hover:text-red-400 transition-colors" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-48 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                  Overall Metric Fantasy Grade. Rates the strength of the player's underlying profile compared to historical data.
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                </div>
              </th>
              
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">G</th>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">PPG</th>
              
              {isHistorical ? (
                <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center bg-gray-800/20">Total Pts</th>
              ) : (
                <>
                  <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center relative group cursor-help hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center justify-center gap-1">
                      Floor (P25)
                      <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                  </th>
                  <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center bg-gray-800/20 relative group cursor-help hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center justify-center gap-1">
                      Base (P50)
                      <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                  </th>
                  <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center relative group cursor-help hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center justify-center gap-1">
                      Ceiling (P75)
                      <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                  </th>
                </>
              )}
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Stats</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-800/50 relative z-0">
            {isSyncing ? (
              <tr>
                <td colSpan={colSpanCount} className="py-32 text-center">
                  <div className="flex flex-col items-center justify-center text-red-600 animate-in fade-in duration-500">
                    <RefreshCw className="animate-spin mb-4" size={36} />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Loading Season Data</h3>
                  </div>
                </td>
              </tr>
            ) : visibleData.length === 0 ? (
              <tr>
                <td colSpan={colSpanCount} className="py-20 text-center">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">NO DATA AVAILABLE</h3>
                </td>
              </tr>
            ) : (
              visibleData.map((player, idx) => {
                const playerId = `${player.Player}-${idx}`;
                const isExpanded = expandedRows.has(playerId);
                const playerUrl = `/player/${player.Player?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

                const rank = player['Overall Rank'] ?? player['Overall Result Rank'] ?? '-';
                const posRank = player['Position Rank'] ?? player['Actual Position Finish'] ?? '-';
                const tier = player['Tier'] ?? null;

                const ppgKey = player['Actual PPG'] ? 'Actual PPG' : (player['Projected PPG'] ? 'Projected PPG' : 'PPG');
                const ppgVal = player['Actual PPG'] ?? player['Projected PPG'] ?? player['PPG'];

                return (
                  <React.Fragment key={playerId}>
                    <tr onClick={() => toggleRow(playerId)} className="hover:bg-[#151515] transition-colors group cursor-pointer border-b border-gray-800/30">
                      
                      <td className="px-2 py-1.5 w-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 bg-gray-800 text-gray-300 shadow-inner group-hover:bg-gray-700 group-hover:text-white">
                            {rank}
                          </div>
                          {tier && (
                            <span className="text-[8px] font-black text-gray-500 uppercase mt-0.5 tracking-tighter">
                              {String(tier).replace('Tier ', 'T')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-2 py-1.5 text-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {player.Position}{posRank}
                        </span>
                      </td>

                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-2">
                          <Link href={playerUrl} onClick={(e) => e.stopPropagation()} className="text-[13px] font-black text-gray-100 hover:text-red-500 whitespace-nowrap">
                            {player.Player}
                          </Link>
                          {player.Team && (
                            <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.Team.toLowerCase()}.png`} alt={player.Team} className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                          )}
                        </div>
                      </td>

                      <td className="px-2 py-1.5 text-center bg-red-900/10 border-x border-gray-800/50">
                        <div className={`text-[13px] ${getHeatmapClasses(player['OMFG Score'], 'OMFG Score', false)}`}>
                          {formatNumber(player['OMFG Score'])}
                        </div>
                      </td>

                      <td className="px-2 py-1.5 text-center text-[11px] font-bold text-gray-400">{formatNumber(player['Actual Games'] ?? player['Projected Games'] ?? player['Games'], 0)}</td>
                      
                      <td className="px-2 py-1.5 text-center">
                        <span className={`text-[11px] ${getHeatmapClasses(ppgVal, ppgKey, false)}`}>
                          {formatNumber(ppgVal)}
                        </span>
                      </td>

                      {isHistorical ? (
                        <td className="px-2 py-1.5 text-center text-[11px] font-bold text-gray-400 bg-gray-800/20">{formatNumber(player['Actual Fantasy Points'])}</td>
                      ) : (
                        <>
                          <td className="px-2 py-1.5 text-center text-[11px] font-bold text-gray-500">{formatNumber(player['Floor (P25)'])}</td>
                          <td className="px-2 py-1.5 text-center text-[11px] font-bold text-gray-400 bg-gray-800/20">{formatNumber(player['Base (P50)'])}</td>
                          <td className="px-2 py-1.5 text-center text-[11px] font-bold text-gray-300">{formatNumber(player['Ceiling (P75)'])}</td>
                        </>
                      )}

                      <td className="px-2 py-1.5 text-center text-gray-500">
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}