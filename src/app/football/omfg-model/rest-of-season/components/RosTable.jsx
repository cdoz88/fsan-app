'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { RefreshCw, ChevronDown, ChevronUp, Info } from 'lucide-react';

// 🌟 DYNAMIC RELATIVE RANGE BAR 🌟
function RangeBar({ floor, base, ceiling, maxVal }) {
  const fNum = Number(floor);
  const bNum = Number(base);
  const cNum = Number(ceiling);

  if (isNaN(fNum) || isNaN(bNum) || isNaN(cNum) || cNum <= fNum || !maxVal) {
    return <span className="text-gray-500 font-bold text-[11px]">-</span>;
  }

  // Define the 100% width benchmark (adding a tiny 2% buffer so the highest dot doesn't touch the absolute edge)
  const safeMax = Math.max(maxVal, cNum) * 1.02;

  // Calculate the left starting point and the total width of the colored track
  const leftPct = Math.max((fNum / safeMax) * 100, 0);
  const rightPct = Math.min((cNum / safeMax) * 100, 100);
  const widthPct = rightPct - leftPct;

  // Calculate the absolute position of the median dot along the track
  const dotPct = (bNum / safeMax) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[210px] mx-auto py-1">
      {/* Numbers Row */}
      <div className="flex justify-between items-center w-full text-[10px] font-black mb-1 px-0.5">
        <span className="text-gray-400 font-semibold">{fNum.toFixed(1)}</span>
        <span className="text-white text-[11px] font-black drop-shadow">{bNum.toFixed(1)}</span>
        <span className="text-gray-400 font-semibold">{cNum.toFixed(1)}</span>
      </div>
      
      {/* Slider Bar Container (Dark Track) */}
      <div className="relative w-full h-2 rounded-full bg-[#1e2330] overflow-visible flex items-center border border-gray-800/80">
        
        {/* Color Gradient Track (Spans only from Floor to Ceiling) */}
        <div 
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 opacity-90"
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
        
        {/* White Center Dot (Positioned exactly at Base P50) */}
        <div 
          className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)] border-2 border-gray-900 z-10 transform -translate-x-1/2"
          style={{ left: `${dotPct}%` }}
        />
      </div>
    </div>
  );
}

export default function RosTable({ visibleData, isSyncing }) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const colSpanCount = 10;

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
    if (pct >= 60) return 'text-emerald-400';
    if (pct >= 35) return 'text-blue-400';
    return 'text-gray-500';
  };

  const getFlexibleValue = (player, matchRules) => {
    if (!player) return null;
    const normalize = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const [key, value] of Object.entries(player)) {
      if (value === undefined || value === null || value === '') continue;
      const normKey = normalize(key);
      
      for (const rule of matchRules) {
        if (Array.isArray(rule)) {
          if (rule.every(sub => normKey.includes(normalize(sub)))) return value;
        } else {
          const normRule = normalize(rule);
          if (normKey === normRule || normKey.includes(normRule)) return value;
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
        { label: 'Pass Att', val: formatNumber(getFlexibleValue(player, ['Pass Attempts', 'Pass Att'])) },
        { label: 'Pass Yds', val: formatNumber(getFlexibleValue(player, ['Pass Yards', 'Pass Yds'])) },
        { label: 'Pass TD', val: formatNumber(getFlexibleValue(player, ['Pass Td', 'Pass TD'])) },
        { label: 'INTs', val: formatNumber(getFlexibleValue(player, ['Interceptions', 'INT'])) },
        { label: 'Rush Att', val: formatNumber(getFlexibleValue(player, ['Rush Attempts', 'Rush Att'])) },
        { label: 'Rush Yds', val: formatNumber(getFlexibleValue(player, ['Rush Yards', 'Rush Yds'])) },
        { label: 'Rush TD', val: formatNumber(getFlexibleValue(player, ['Rush Td', 'Rush TD'])) },
      ];
    } else if (pos === 'RB') {
      stats = [
        { label: 'Rush Att', val: formatNumber(getFlexibleValue(player, ['Rush Attempts', 'Rush Att'])) },
        { label: 'Rush Yds', val: formatNumber(getFlexibleValue(player, ['Rush Yards', 'Rush Yds'])) },
        { label: 'Rush TD', val: formatNumber(getFlexibleValue(player, ['Rush Td', 'Rush TD'])) },
        { label: 'Targets', val: formatNumber(getFlexibleValue(player, ['Targets'])) },
        { label: 'Recs', val: formatNumber(getFlexibleValue(player, ['Receptions'])) },
        { label: 'Rec Yds', val: formatNumber(getFlexibleValue(player, ['Receiving Yards'])) },
        { label: 'Rec TD', val: formatNumber(getFlexibleValue(player, ['Receiving Td', 'Rec TD'])) },
        { label: 'Total TD', val: formatNumber(getFlexibleValue(player, ['Total Td', 'Total TD'])) },
      ];
    } else if (pos === 'WR' || pos === 'TE') {
      stats = [
        { label: 'Targets', val: formatNumber(getFlexibleValue(player, ['Targets'])) },
        { label: 'Recs', val: formatNumber(getFlexibleValue(player, ['Receptions'])) },
        { label: 'Rec Yds', val: formatNumber(getFlexibleValue(player, ['Receiving Yards'])) },
        { label: 'Rec TD', val: formatNumber(getFlexibleValue(player, ['Receiving Td', 'Rec TD'])) },
        { label: 'Air Yds', val: formatNumber(getFlexibleValue(player, ['Air Yards'])) },
        { label: '1st Reads', val: formatNumber(getFlexibleValue(player, ['First Read Targets', 'First-Read Targets'])) },
        { label: 'EZ Tgts', val: formatNumber(getFlexibleValue(player, ['End Zone Targets', 'End-Zone Targets'])) },
        { label: 'Total TD', val: formatNumber(getFlexibleValue(player, ['Total Td', 'Total TD'])) },
      ];
    }

    return (
      <div className="flex flex-wrap gap-2 p-3">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-lg p-2 flex flex-col items-center justify-center text-center transition-colors border bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex-1 min-w-[75px]">
            <span className="text-[8px] font-black uppercase text-gray-400 mb-0.5 tracking-widest leading-none">{stat.label}</span>
            <span className="text-[13px] font-black leading-none mt-1">{stat.val}</span>
          </div>
        ))}
      </div>
    );
  };

  // Find the absolute highest ceiling in the currently visible data to scale the range bars relative to each other
  const maxCeiling = useMemo(() => {
    if (!visibleData || visibleData.length === 0) return 100;
    const ceilings = visibleData.map(p => Number(p['ROS Ceiling Points'] || p['Ceiling (P75)'] || 0)).filter(n => !isNaN(n));
    return ceilings.length > 0 ? Math.max(...ceilings) : 100;
  }, [visibleData]);

  const currentPos = visibleData && visibleData.length > 0 ? visibleData[0]?.Position : 'ALL';
  const prob1Header = (currentPos === 'QB' || currentPos === 'TE' || currentPos === 'K' || currentPos === 'DST') ? 'TOP 6%' : 'TOP 12%';
  const prob2Header = (currentPos === 'QB' || currentPos === 'TE' || currentPos === 'K' || currentPos === 'DST') ? 'TOP 12%' : 'TOP 24%';

  return (
    <div className="bg-[#111] rounded-2xl shadow-2xl border border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-[400px] overflow-visible">
      <div className="overflow-x-auto scrollbar-hide rounded-2xl">
        <table className="min-w-full text-left whitespace-nowrap">
          <thead className="bg-[#1a1a1a] border-b border-gray-800 relative z-[60]">
            <tr>
              <th className="px-2 py-2.5 text-[9px] font-black text-gray-500 uppercase tracking-widest w-12 text-center">Rk</th>
              <th className="px-2 py-2.5 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Pos</th>
              <th className="px-2 py-2.5 text-[9px] font-black text-gray-500 uppercase tracking-widest">Player</th>
              
              <th className="px-2 py-2.5 text-[9px] font-black text-red-500 uppercase tracking-widest text-center bg-red-900/10 border-x border-gray-800 relative group cursor-help hover:bg-red-900/30 transition-colors">
                <div className="flex items-center justify-center gap-1">
                  OMFG
                  <Info size={10} className="text-red-400/50 group-hover:text-red-400 transition-colors" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-48 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                  Preseason or updated in-season opportunity score (0-100 rating).
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                </div>
              </th>

              <th className="px-2 py-2.5 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Rem G</th>
              <th className="px-2 py-2.5 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">RoS PPG</th>
              
              <th className="px-4 py-2.5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center bg-gray-900/40 border-x border-gray-800/80 min-w-[210px] relative group cursor-help hover:bg-gray-800/40 transition-colors">
                <div className="flex items-center justify-center gap-1">
                  RoS Range (P25 - P75)
                  <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-52 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                  Displays Floor (25th percentile downside), Base Median (50th percentile expectation), and Ceiling (75th percentile upside) fantasy points across remaining games.
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                </div>
              </th>

              <th className="px-2 py-2.5 text-[9px] font-black text-[#1b75bb] uppercase tracking-widest text-center bg-[#0f446e]/20 border-r border-gray-800 relative group cursor-help hover:bg-[#0f446e]/40 transition-colors">
                {prob1Header}
              </th>

              <th className="px-2 py-2.5 text-[9px] font-black text-[#1b75bb] uppercase tracking-widest text-center bg-[#0f446e]/20 border-r border-gray-800 relative group cursor-help hover:bg-[#0f446e]/40 transition-colors">
                {prob2Header}
              </th>

              <th className="px-2 py-2.5 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Stats</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-800/50 relative z-0">
            {isSyncing ? (
              <tr>
                <td colSpan={colSpanCount} className="py-32 text-center">
                  <div className="flex flex-col items-center justify-center text-red-600 animate-in fade-in duration-500">
                    <RefreshCw className="animate-spin mb-4" size={36} />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Loading Rest of Season Data</h3>
                  </div>
                </td>
              </tr>
            ) : visibleData.length === 0 ? (
              <tr>
                <td colSpan={colSpanCount} className="py-20 text-center">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">NO ROS DATA AVAILABLE</h3>
                </td>
              </tr>
            ) : (
              visibleData.map((player, idx) => {
                const playerId = `${player.Player}-${idx}`;
                const isExpanded = expandedRows.has(playerId);
                const playerUrl = `/player/${player.Player?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

                const rank = player['ROS Rank'] ?? player['Rank'] ?? (idx + 1);
                const posRank = player['Actual Position Finish'] ?? '-';
                const tier = player['ROS Tier'] ?? player['Tier'] ?? null;
                const omfgVal = player['Preseason OMFG'] ?? player['OMFG Score'];
                
                const remGames = player['ROS Projected Games'] ?? player['Projected Games'] ?? '-';
                const rosPpg = player['ROS Projected PPG'] ?? player['Projected PPG'] ?? '-';

                const floorPts = player['ROS Floor Points'] ?? player['Floor (P25)'];
                const basePts = player['ROS Base Points'] ?? player['Base (P50)'];
                const ceilPts = player['ROS Ceiling Points'] ?? player['Ceiling (P75)'];

                const prob1 = (currentPos === 'QB' || currentPos === 'TE' || currentPos === 'K' || currentPos === 'DST')
                   ? getFlexibleValue(player, ['ROS Probability Top6', 'Top 6'])
                   : getFlexibleValue(player, ['ROS Probability Top12', 'Top 12']);
                
                const prob2 = (currentPos === 'QB' || currentPos === 'TE' || currentPos === 'K' || currentPos === 'DST')
                   ? getFlexibleValue(player, ['ROS Probability Top12', 'Top 12'])
                   : getFlexibleValue(player, ['ROS Probability Top24', 'Top 24']);

                return (
                  <React.Fragment key={playerId}>
                    <tr onClick={() => toggleRow(playerId)} className="hover:bg-[#151515] transition-colors group cursor-pointer border-b border-gray-800/30">
                      
                      <td className="px-2 py-2.5 w-12 text-center">
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
                      
                      <td className="px-2 py-2.5 text-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {player.Position}{posRank !== '-' ? posRank : ''}
                        </span>
                      </td>

                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2">
                          <Link href={playerUrl} onClick={(e) => e.stopPropagation()} className="text-[13px] font-black text-gray-100 hover:text-red-500 whitespace-nowrap">
                            {player.Player}
                          </Link>
                          {player.Team && (
                            <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.Team.toLowerCase()}.png`} alt={player.Team} className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                          )}
                        </div>
                      </td>
                      
                      <td className="px-2 py-2.5 text-center bg-red-900/10 border-x border-gray-800/50">
                        <span className="text-[13px] font-black text-white">
                          {formatNumber(omfgVal)}
                        </span>
                      </td>
                      
                      <td className="px-2 py-2.5 text-center text-[11px] font-bold text-gray-400">
                        {formatNumber(remGames, 1)}
                      </td>

                      <td className="px-2 py-2.5 text-center text-[11px] font-black text-white">
                        {formatNumber(rosPpg, 1)}
                      </td>
                      
                      {/* Range Bar Column - Dynamically Scaled via maxVal */}
                      <td className="px-4 py-2 text-center bg-gray-900/30 border-x border-gray-800/80">
                        <RangeBar floor={floorPts} base={basePts} ceiling={ceilPts} maxVal={maxCeiling} />
                      </td>

                      <td className="px-2 py-2.5 text-center text-[11px] font-bold bg-[#0f446e]/20 border-r border-gray-800/50">
                         <span className={getProbColor(prob1)}>{formatPct(prob1)}</span>
                      </td>
                      
                      <td className="px-2 py-2.5 text-center text-[11px] font-bold bg-[#0f446e]/20 border-r border-gray-800/50">
                         <span className={getProbColor(prob2)}>{formatPct(prob2)}</span>
                      </td>

                      <td className="px-2 py-2.5 text-center text-gray-500">
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