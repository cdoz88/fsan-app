'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { RefreshCw, ChevronDown, ChevronUp, Info } from 'lucide-react';

export default function OmfgTable({ visibleData, isHistorical, isSyncing }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const colSpanCount = isHistorical ? 9 : 10;

  const toggleRow = (playerId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const formatNumber = (val, decimals = 1) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? '-' : num.toFixed(decimals);
  };

  const inverseStats = new Set([
    'Projected Interceptions', 'Interceptions',
    'Projected Fumbles', 'Fumbles'
  ]);

  const statThresholds = useMemo(() => {
    if (!visibleData || visibleData.length === 0) return {};
    const thresholds = {};
    const allKeys = Object.keys(visibleData[0]);

    allKeys.forEach(stat => {
      const values = visibleData
        .map(p => p[stat])
        .filter(v => v !== null && v !== undefined && v !== '')
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
    
    if (!thresh || isNaN(num)) {
      return isBox ? 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' : 'text-white font-bold';
    }

    const isInverse = inverseStats.has(statKey);

    let isTop10 = num >= thresh.p90;
    let isTop25 = num >= thresh.p75 && num < thresh.p90;
    let isBot25 = num <= thresh.p25 && num > thresh.p10;
    let isBot10 = num <= thresh.p10;

    if (isInverse) {
      isTop10 = num <= thresh.p10;
      isTop25 = num <= thresh.p25 && num > thresh.p10;
      isBot25 = num >= thresh.p75 && num < thresh.p90;
      isBot10 = num >= thresh.p90;
    }

    if (thresh.p90 === thresh.p10) {
      return isBox ? 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' : 'text-white font-bold';
    }

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

  const getStat = (player, statName) => player[`Projected ${statName}`] ?? player[statName];
  const k = (statName) => isHistorical ? statName : `Projected ${statName}`;

  const renderExpandedStats = (player) => {
    const pos = player.Position;
    let stats = [];

    if (pos === 'QB') {
      stats = [
        { label: 'Pass Att', val: getStat(player, 'Pass Attempts'), key: k('Pass Attempts') },
        { label: 'Pass Yds', val: getStat(player, 'Pass Yards'), key: k('Pass Yards') },
        { label: 'Pass TD', val: getStat(player, 'Pass TDs'), key: k('Pass TDs') },
        { label: 'INTs', val: getStat(player, 'Interceptions'), key: k('Interceptions') },
        { label: 'Rush Att', val: getStat(player, 'Rush Attempts'), key: k('Rush Attempts') },
        { label: 'Rush Yds', val: getStat(player, 'Rush Yards'), key: k('Rush Yards') },
        { label: 'Rush TD', val: getStat(player, 'Rush TDs'), key: k('Rush TDs') },
        { label: 'Total TD', val: getStat(player, 'Total TDs'), key: k('Total TDs') },
      ];
    } else if (pos === 'RB') {
      stats = [
        { label: 'Rush Att', val: getStat(player, 'Rush Attempts'), key: k('Rush Attempts') },
        { label: 'Rush Yds', val: getStat(player, 'Rush Yards'), key: k('Rush Yards') },
        { label: 'Rush TD', val: getStat(player, 'Rush TDs'), key: k('Rush TDs') },
        { label: 'Targets', val: getStat(player, 'Targets'), key: k('Targets') },
        { label: 'Recs', val: getStat(player, 'Receptions'), key: k('Receptions') },
        { label: 'Rec Yds', val: getStat(player, 'Receiving Yards'), key: k('Receiving Yards') },
        { label: 'Rec TD', val: getStat(player, 'Receiving TDs'), key: k('Receiving TDs') },
        { label: '1st Reads', val: getStat(player, 'First Read Targets'), key: k('First Read Targets') },
        { label: 'Scrim Yds', val: getStat(player, 'Scrimmage Yards'), key: k('Scrimmage Yards') },
        { label: 'Total TD', val: getStat(player, 'Total TDs'), key: k('Total TDs') },
      ];
    } else if (pos === 'WR' || pos === 'TE') {
      stats = [
        { label: 'Targets', val: getStat(player, 'Targets'), key: k('Targets') },
        { label: 'Recs', val: getStat(player, 'Receptions'), key: k('Receptions') },
        { label: 'Rec Yds', val: getStat(player, 'Receiving Yards'), key: k('Receiving Yards') },
        { label: 'Rec TD', val: getStat(player, 'Receiving TDs'), key: k('Receiving TDs') },
        { label: 'Air Yds', val: getStat(player, 'Air Yards'), key: k('Air Yards') },
        { label: '1st Reads', val: getStat(player, 'First Read Targets'), key: k('First Read Targets') },
        { label: 'EZ Tgts', val: getStat(player, 'End Zone Targets'), key: k('End Zone Targets') },
        { label: '1st Downs', val: getStat(player, 'Receiving First Downs'), key: k('Receiving First Downs') },
        { label: 'Total TD', val: getStat(player, 'Total TDs'), key: k('Total TDs') },
      ];
    } else if (pos === 'K') {
      stats = [
        { label: 'FG Att', val: getStat(player, 'FG Attempts'), key: k('FG Attempts') },
        { label: 'FG Made', val: getStat(player, 'FGs Made'), key: k('FGs Made') },
        { label: '40-49m FG', val: getStat(player, '40-49 FGs Made'), key: k('40-49 FGs Made') },
        { label: '50+ FG', val: getStat(player, '50+ FGs Made'), key: k('50+ FGs Made') },
        { label: 'XP Att', val: getStat(player, 'XP Attempts'), key: k('XP Attempts') },
        { label: 'XP Made', val: getStat(player, 'XPs Made'), key: k('XPs Made') },
      ];
    } else {
      stats = [
        { label: 'Sacks', val: getStat(player, 'Sacks'), key: k('Sacks') },
        { label: 'Fumbles', val: getStat(player, 'Fumbles'), key: k('Fumbles') },
        { label: 'Def TDs', val: getStat(player, 'Defensive TDs'), key: k('Defensive TDs') },
      ];
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2 p-3">
        {stats.map((stat, i) => {
          const heatClass = getHeatmapClasses(stat.val, stat.key, true);
          return (
            <div key={i} className={`rounded-lg p-2 flex flex-col items-center justify-center text-center transition-colors border ${heatClass}`}>
              <span className="text-[8px] font-black uppercase text-gray-400 mb-0.5 tracking-widest leading-none">{stat.label}</span>
              <span className="text-[13px] font-black leading-none mt-1">{formatNumber(stat.val)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTableRows = () => {
    if (isSyncing) {
      return (
        <tr>
          <td colSpan={colSpanCount} className="py-32 text-center">
            <div className="flex flex-col items-center justify-center text-red-600 animate-in fade-in duration-500">
              <RefreshCw className="animate-spin mb-4" size={36} />
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Loading Utilization Data</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Crunching the OMFG Models...</p>
            </div>
          </td>
        </tr>
      );
    }

    if (!visibleData || visibleData.length === 0) {
      return (
        <tr>
          <td colSpan={colSpanCount} className="py-20 text-center">
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Data Available</h3>
            <p className="text-gray-500 font-bold">No utilization models found.</p>
          </td>
        </tr>
      );
    }

    const rows = [];

    visibleData.forEach((player, idx) => {
      const playerId = `${player.Player}-${idx}`;
      const isExpanded = expandedRows.has(playerId);

      const playerUrl = `/player/${player.Player?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

      const rank = player['Overall Rank'] ?? player['Overall Result Rank'];
      const posRank = player['Position Rank'] ?? player['Actual Position Finish'];
      const games = player['Projected Games'] ?? player['Games'];
      const ppg = player['Projected PPG'] ?? player['Actual PPG'];
      const ppgKey = isHistorical ? 'Actual PPG' : 'Projected PPG';

      rows.push(
        <tr 
          key={playerId} 
          onClick={() => toggleRow(playerId)}
          className="hover:bg-[#151515] transition-colors group cursor-pointer border-b border-gray-800/30"
        >
          <td className="px-2 py-1.5">
            <div className="w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[10px] font-black shrink-0 bg-gray-800 text-gray-300 border border-gray-700 shadow-inner group-hover:bg-gray-700 group-hover:text-white transition-colors">
              {rank}
            </div>
          </td>
          
          <td className="px-2 py-1.5 text-center">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
               {player.Position}{posRank}
             </span>
          </td>

          {isHistorical && (
            <td className="px-2 py-1.5 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {player['SOS Rank'] ? `${player.Position}${player['SOS Rank']}` : '-'}
              </span>
            </td>
          )}

          <td className="px-2 py-1.5">
             <div className="flex items-center gap-2">
               <Link href={playerUrl} onClick={(e) => e.stopPropagation()} className="text-[13px] font-black text-gray-100 tracking-tight hover:text-red-500 transition-colors whitespace-nowrap">
                 {player.Player}
               </Link>
               {player.Team && (
                 <img 
                   src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.Team.toLowerCase()}.png`} 
                   alt={player.Team}
                   className="w-5 h-5 object-contain drop-shadow-md shrink-0"
                   onError={(e) => e.target.style.display = 'none'}
                 />
               )}
             </div>
          </td>

          <td className="px-2 py-1.5 text-center bg-red-900/10 border-x border-gray-800/50">
             <div className={`text-[13px] ${getHeatmapClasses(player['OMFG Score'], 'OMFG Score', false)}`}>
               {formatNumber(player['OMFG Score'])}
             </div>
          </td>

          <td className="px-2 py-1.5 text-center text-[11px] font-bold text-gray-400">{formatNumber(games, 0)}</td>
          
          <td className="px-2 py-1.5 text-center">
             <span className={`text-[11px] ${getHeatmapClasses(ppg, ppgKey, false)}`}>
               {formatNumber(ppg)}
             </span>
          </td>
          
          {isHistorical ? (
            <>
              <td className="px-2 py-1.5 text-center text-[11px] font-bold text-gray-400 bg-gray-800/20">{formatNumber(player['Actual Fantasy Points'])}</td>
            </>
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
      );

      if (isExpanded) {
        rows.push(
          <tr key={`${playerId}-expanded`} className="bg-[#1e1e1e] border-b border-gray-700 shadow-inner">
            <td colSpan={colSpanCount} className="p-0">
               <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                 {renderExpandedStats(player)}
               </div>
            </td>
          </tr>
        );
      }
    });

    return rows;
  };

  return (
    <div className="bg-[#111] rounded-2xl shadow-2xl border border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-[400px] pt-10">
      <div className="overflow-x-auto scrollbar-hide rounded-2xl -mt-10 pt-10">
        <table className="min-w-full text-left whitespace-nowrap">
          <thead className="bg-[#1a1a1a] border-b border-gray-800 relative z-50">
            <tr>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest w-10 text-center">Rk</th>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Pos</th>
              
              {isHistorical && (
                <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">SOS</th>
              )}

              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">Player</th>

              <th className="px-2 py-2 text-[9px] font-black text-red-500 uppercase tracking-widest text-center bg-red-900/10 border-x border-gray-800">OMFG</th>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">G</th>
              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">PPG</th>
              
              {isHistorical ? (
                <>
                  <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center bg-gray-800/20">Total Pts</th>
                </>
              ) : (
                <>
                  <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center relative group cursor-help hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center justify-center gap-1">
                      Floor (P25)
                      <Info size={10} className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-[10px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] font-medium normal-case tracking-normal whitespace-nowrap pointer-events-none origin-bottom">
                      Twenty-fifth-percentile season fantasy-point projection.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
                    </div>
                  </th>
                  
                  <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center bg-gray-800/20 relative group cursor-help hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center justify-center gap-1">
                      Base (P50)
                      <Info size={10} className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-[10px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] font-medium normal-case tracking-normal whitespace-nowrap pointer-events-none origin-bottom">
                      Median season fantasy-point projection.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
                    </div>
                  </th>
                  
                  <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center relative group cursor-help hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center justify-center gap-1">
                      Ceiling (P75)
                      <Info size={10} className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-[10px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] font-medium normal-case tracking-normal whitespace-nowrap pointer-events-none origin-bottom-right">
                      Seventy-fifth-percentile season fantasy-point projection.
                      <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-700"></div>
                    </div>
                  </th>
                </>
              )}

              <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Stats</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-800/50 relative z-0">
            {renderTableRows()}
          </tbody>
        </table>
      </div>
    </div>
  );
}