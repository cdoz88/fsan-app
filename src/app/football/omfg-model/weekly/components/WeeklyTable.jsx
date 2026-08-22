'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { RefreshCw, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Info } from 'lucide-react';

export default function WeeklyTable({ visibleData, isHistorical, isSyncing }) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  const colSpanCount = 11;

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
    if (val === null || val === undefined || val === '' || isNaN(val)) return '-';
    return `${(Number(val) * 100).toFixed(0)}%`;
  };

  const inverseStats = new Set(['Interceptions', 'Fumbles']);

  const statThresholds = useMemo(() => {
    if (!visibleData || visibleData.length === 0) return {};
    const thresholds = {};
    const allKeys = Object.keys(visibleData[0]);

    allKeys.forEach(stat => {
      const values = visibleData.map(p => p[stat]).filter(v => v !== null && v !== undefined && v !== '')
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

  const getStat = (player, statName) => {
    const hyphenated = statName.replace(' ', '-');
    return player[`Projected ${statName}`] ?? player[statName] ?? player[`Actual ${statName}`] ?? player[hyphenated] ?? player[`Projected ${hyphenated}`] ?? null;
  };

  const renderExpandedStats = (player) => {
    const pos = player.Position;
    let stats = [];

    if (pos === 'QB') {
      stats = [
        { label: 'Pass Att', val: formatNumber(getStat(player, 'Pass Attempts')), key: 'Pass Attempts' },
        { label: 'Pass Yds', val: formatNumber(getStat(player, 'Pass Yards')), key: 'Pass Yards' },
        { label: 'Pass TD', val: formatNumber(getStat(player, 'Pass TDs') ?? getStat(player, 'Pass TD')), key: 'Pass TDs' },
        { label: 'INTs', val: formatNumber(getStat(player, 'Interceptions')), key: 'Interceptions' },
        { label: 'Rush Att', val: formatNumber(getStat(player, 'Rush Attempts')), key: 'Rush Attempts' },
        { label: 'Rush Yds', val: formatNumber(getStat(player, 'Rush Yards')), key: 'Rush Yards' },
      ];
    } else if (pos === 'RB') {
      stats = [
        { label: 'Rush Att', val: formatNumber(getStat(player, 'Rush Attempts')), key: 'Rush Attempts' },
        { label: 'Rush Yds', val: formatNumber(getStat(player, 'Rush Yards')), key: 'Rush Yards' },
        { label: 'Targets', val: formatNumber(getStat(player, 'Targets')), key: 'Targets' },
        { label: 'Recs', val: formatNumber(getStat(player, 'Receptions')), key: 'Receptions' },
        { label: 'Rec Yds', val: formatNumber(getStat(player, 'Receiving Yards')), key: 'Receiving Yards' },
      ];
    } else if (pos === 'WR' || pos === 'TE') {
      stats = [
        { label: 'Targets', val: formatNumber(getStat(player, 'Targets')), key: 'Targets' },
        { label: 'Recs', val: formatNumber(getStat(player, 'Receptions')), key: 'Receptions' },
        { label: 'Rec Yds', val: formatNumber(getStat(player, 'Receiving Yards')), key: 'Receiving Yards' },
        { label: 'Air Yds', val: formatNumber(getStat(player, 'Air Yards')), key: 'Air Yards' },
        { label: '1st Reads', val: formatNumber(getStat(player, 'First Read Targets')), key: 'First-Read Targets' },
        { label: 'EZ Tgts', val: formatNumber(getStat(player, 'End Zone Targets')), key: 'End-Zone Targets' },
      ];
    }

    return (
      <div className="flex flex-wrap gap-2 p-3">
        {stats.map((stat, i) => {
          const heatClass = getHeatmapClasses(stat.val, stat.key, true);
          return (
            <div key={i} className={`rounded-lg p-2 flex flex-col items-center justify-center text-center transition-colors border flex-1 min-w-[70px] ${heatClass}`}>
              <span className="text-[8px] font-black uppercase text-gray-400 mb-0.5 tracking-widest leading-none">{stat.label}</span>
              <span className="text-[13px] font-black leading-none mt-1">{stat.val}</span>
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
          <thead className="bg-[#1a1a1a] border-b border-gray-800 relative z-[60]">
            <tr>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest w-12 text-center">Rk</th>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Pos</th>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Opp</th>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">Player</th>
              
              <th className="px-2 py-2 text-[9px] font-black text-red-500 uppercase tracking-widest text-center bg-red-900/10 border-x border-gray-800 relative group cursor-help hover:bg-red-900/30 transition-colors">
                <div className="flex items-center justify-center gap-1">
                  OMFG
                  <Info size={10} className="text-red-400/50 group-hover:text-red-400 transition-colors" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-48 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                  Overall Metric Fantasy Grade. Analyzes recent volume and high-value opportunities to predict what could happen next.
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                </div>
              </th>

              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">{isHistorical ? 'Actual Pts' : 'Proj Pts'}</th>
              
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center relative group cursor-help hover:bg-gray-800/40 transition-colors">
                <div className="flex items-center justify-center gap-1">
                  Matchup
                  <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-48 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                  Opponent Difficulty rating on a 0-100 scale. Higher scores mean an easier positional matchup.
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                </div>
              </th>

              <th className="px-2 py-2 text-[9px] font-black text-[#1b75bb] uppercase tracking-widest text-center bg-[#0f446e]/20 border-x border-gray-800 relative group cursor-help hover:bg-[#0f446e]/40 transition-colors">
                <div className="flex items-center justify-center gap-1">
                  Top 12
                  <Info size={10} className="text-[#1b75bb]/60 group-hover:text-[#1b75bb] transition-colors" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-48 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                  The model's probability that this player finishes inside the Top 12 at their position this week.
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                </div>
              </th>

              <th className="px-2 py-2 text-[9px] font-black text-[#1b75bb] uppercase tracking-widest text-center bg-[#0f446e]/20 border-r border-gray-800 relative group cursor-help hover:bg-[#0f446e]/40 transition-colors">
                <div className="flex items-center justify-center gap-1">
                  Top 24
                  <Info size={10} className="text-[#1b75bb]/60 group-hover:text-[#1b75bb] transition-colors" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-48 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                  The model's probability that this player finishes inside the Top 24 at their position this week.
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                </div>
              </th>

              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center relative group cursor-help hover:bg-gray-800/40 transition-colors">
                <div className="flex items-center justify-center gap-1">
                  Edge
                  <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-48 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                  Difference between OMFG rank and industry consensus. A positive (+) number means the model ranks them higher than the market.
                  <div className="absolute bottom-full right-4 border-4 border-transparent border-b-gray-600"></div>
                </div>
              </th>

              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Stats</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-800/50 relative z-0">
            {isSyncing ? (
              <tr>
                <td colSpan={colSpanCount} className="py-32 text-center">
                  <div className="flex flex-col items-center justify-center text-red-600 animate-in fade-in duration-500">
                    <RefreshCw className="animate-spin mb-4" size={36} />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Loading Weekly Data</h3>
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

                const rank = player['Rank'] ?? player['Finish Rank'] ?? (idx + 1);
                const posRank = player['Position Rank'] ?? '-';
                const tier = player['Tier'] ?? null;
                const omfgVal = player['Preseason OMFG'] ?? player['In-Season OMFG Score'] ?? player['OMFG Score'];
                const ptsVal = isHistorical ? player['Actual Fantasy Points'] : player['Projected Fantasy Points'];
                const top12 = player['Top 12 Probability'];
                const top24 = player['Top 24 Probability'];
                const rankGap = player['Rank Gap'];

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
                          {player.Position}{posRank !== '-' ? posRank : ''}
                        </span>
                      </td>

                      <td className="px-2 py-1.5 text-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {player.Opponent ?? '-'}
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
                        <div className={`text-[13px] ${getHeatmapClasses(omfgVal, 'Preseason OMFG', false)}`}>
                          {formatNumber(omfgVal)}
                        </div>
                      </td>
                      
                      <td className="px-2 py-1.5 text-center">
                        <span className={`text-[11px] ${getHeatmapClasses(ptsVal, 'Projected Fantasy Points', false)}`}>
                          {formatNumber(ptsVal)}
                        </span>
                      </td>
                      
                      <td className="px-2 py-1.5 text-center text-[11px] font-bold text-gray-400">
                         {formatNumber(player['Matchup Score'])}
                      </td>

                      <td className="px-2 py-1.5 text-center text-[11px] font-bold text-[#60a5fa] bg-[#0f446e]/20 border-x border-gray-800/50">
                         {formatPct(top12)}
                      </td>
                      <td className="px-2 py-1.5 text-center text-[11px] font-bold text-[#93c5fd] bg-[#0f446e]/20 border-r border-gray-800/50">
                         {formatPct(top24)}
                      </td>

                      <td className="px-2 py-1.5 text-center">
                        {rankGap !== undefined && rankGap !== null && rankGap !== '' ? (
                          <div className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm ${Number(rankGap) > 0 ? 'bg-emerald-900/40 text-emerald-400' : Number(rankGap) < 0 ? 'bg-red-900/40 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
                            {Number(rankGap) > 0 ? <TrendingUp size={10} /> : Number(rankGap) < 0 ? <TrendingDown size={10} /> : null}
                            {Number(rankGap) > 0 ? `+${rankGap}` : rankGap}
                          </div>
                        ) : '-'}
                      </td>
                      
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