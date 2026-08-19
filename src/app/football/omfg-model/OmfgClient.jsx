'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { RefreshCw, ChevronDown, ChevronUp, BarChart2, Info } from 'lucide-react'; 

// --- Custom Dark Dropdown Component ---
function CustomDropdown({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#111] border border-gray-800 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl py-2 pl-3 pr-8 flex items-center justify-between gap-2 shadow-inner hover:border-gray-600 transition-colors cursor-pointer min-w-[110px]"
      >
        <span>{value || 'Select'}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[130px] bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl py-1 z-[120] max-h-60 overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[10px] text-gray-500 italic">No options</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  value === opt
                    ? 'bg-red-600/20 text-red-500 border-l-2 border-red-500'
                    : 'text-gray-300 hover:bg-[#252525] hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function OmfgClient() {
  const [playersData, setPlayersData] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);

  // --- UI State Variables ---
  const [currentPosition, setCurrentPosition] = useState('All');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set()); 

  // Dynamically extract available years from WordPress response (sorted descending)
  const availableYears = useMemo(() => {
    if (!availableModels || availableModels.length === 0) return [];
    const yearsSet = new Set(availableModels.map(m => String(m.year)));
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [availableModels]);

  // Dynamically extract available weeks for the currently selected year
  const availableWeeks = useMemo(() => {
    if (!availableModels || !selectedYear) return [];
    const weeksForYear = availableModels
      .filter(m => String(m.year) === String(selectedYear))
      .map(m => m.week);
    
    // Sort so "Season" comes first, followed by "Week 1", "Week 2", etc.
    return Array.from(new Set(weeksForYear)).sort((a, b) => {
      if (a === 'Season') return -1;
      if (b === 'Season') return 1;
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [availableModels, selectedYear]);

  // Fetch the data on load or whenever selectedYear / selectedWeek changes
  useEffect(() => {
    async function loadOmfgData() {
      setIsSyncing(true);
      try {
        const res = await fetch(`/api/omfg-data?year=${selectedYear}&week=${selectedWeek}`);
        const data = await res.json();
        
        if (data.available_models && data.available_models.length > 0) {
          setAvailableModels(data.available_models);

          // If no year is selected yet, default to the latest available year
          if (!selectedYear) {
            const latestYear = String(data.available_models[0].year);
            setSelectedYear(latestYear);
            setSelectedWeek(data.available_models[0].week || 'Season');
            return;
          }
        }

        if (data.success && data.players) {
          setPlayersData(data.players);
        } else {
          setPlayersData([]);
        }
      } catch (err) {
        console.error("Error connecting to OMFG database", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadOmfgData();
  }, [selectedYear, selectedWeek]);

  // Auto-select first available week when Year changes
  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    const matchingWeeks = availableModels
      .filter(m => String(m.year) === String(newYear))
      .map(m => m.week);
    if (matchingWeeks.length > 0) {
      setSelectedWeek(matchingWeeks[0]);
    } else {
      setSelectedWeek('Season');
    }
  };

  // Filter by Position
  const visibleData = useMemo(() => {
    if (!playersData) return [];
    return playersData.filter((player) => {
      if (currentPosition === 'All') return true;
      return player.Position === currentPosition;
    });
  }, [playersData, currentPosition]);

  // Safe Number Formatter
  const formatNumber = (val, decimals = 1) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? '-' : num.toFixed(decimals);
  };

  // Toggle Row Expansion
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

  const positions = ['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'];

  // --- DYNAMIC MODE DETECTOR ---
  const isHistorical = playersData.length > 0 && ('SOS Rank' in playersData[0] || 'Actual PPG' in playersData[0]);
  const isSinglePos = currentPosition !== 'All';
  const colSpanCount = isHistorical ? (isSinglePos ? 10 : 9) : 10;

  // Helper to grab stats regardless of whether they say "Projected" or not
  const getStat = (player, statName) => {
    return player[`Projected ${statName}`] ?? player[statName];
  };

  // Helper to render the expanded stats based on player position
  const renderExpandedStats = (player) => {
    const pos = player.Position;
    let stats = [];

    if (pos === 'QB') {
      stats = [
        { label: 'Pass Att', val: getStat(player, 'Pass Attempts') },
        { label: 'Pass Yds', val: getStat(player, 'Pass Yards') },
        { label: 'Pass TD', val: getStat(player, 'Pass TDs') },
        { label: 'INTs', val: getStat(player, 'Interceptions') },
        { label: 'Rush Att', val: getStat(player, 'Rush Attempts') },
        { label: 'Rush Yds', val: getStat(player, 'Rush Yards') },
        { label: 'Rush TD', val: getStat(player, 'Rush TDs') },
        { label: 'Total TD', val: getStat(player, 'Total TDs') },
      ];
    } else if (pos === 'RB') {
      stats = [
        { label: 'Rush Att', val: getStat(player, 'Rush Attempts') },
        { label: 'Rush Yds', val: getStat(player, 'Rush Yards') },
        { label: 'Rush TD', val: getStat(player, 'Rush TDs') },
        { label: 'Targets', val: getStat(player, 'Targets') },
        { label: 'Recs', val: getStat(player, 'Receptions') },
        { label: 'Rec Yds', val: getStat(player, 'Receiving Yards') },
        { label: 'Rec TD', val: getStat(player, 'Receiving TDs') },
        { label: '1st Reads', val: getStat(player, 'First Read Targets') },
        { label: 'Scrim Yds', val: getStat(player, 'Scrimmage Yards') },
        { label: 'Total TD', val: getStat(player, 'Total TDs') },
      ];
    } else if (pos === 'WR' || pos === 'TE') {
      stats = [
        { label: 'Targets', val: getStat(player, 'Targets') },
        { label: 'Recs', val: getStat(player, 'Receptions') },
        { label: 'Rec Yds', val: getStat(player, 'Receiving Yards') },
        { label: 'Rec TD', val: getStat(player, 'Receiving TDs') },
        { label: 'Air Yds', val: getStat(player, 'Air Yards') },
        { label: '1st Reads', val: getStat(player, 'First Read Targets') },
        { label: 'EZ Tgts', val: getStat(player, 'End Zone Targets') },
        { label: '1st Downs', val: getStat(player, 'Receiving First Downs') },
        { label: 'Total TD', val: getStat(player, 'Total TDs') },
      ];
    } else if (pos === 'K') {
      stats = [
        { label: 'FG Att', val: getStat(player, 'FG Attempts') },
        { label: 'FG Made', val: getStat(player, 'FGs Made') },
        { label: '40-49m FG', val: getStat(player, '40-49 FGs Made') },
        { label: '50+ FG', val: getStat(player, '50+ FGs Made') },
        { label: 'XP Att', val: getStat(player, 'XP Attempts') },
        { label: 'XP Made', val: getStat(player, 'XPs Made') },
      ];
    } else {
      stats = [
        { label: 'Sacks', val: getStat(player, 'Sacks') },
        { label: 'Fumbles', val: getStat(player, 'Fumbles') },
        { label: 'Def TDs', val: getStat(player, 'Defensive TDs') },
      ];
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2 p-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111] border border-gray-900 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <span className="text-[8px] font-black uppercase text-gray-500 mb-0.5 tracking-widest leading-none">{stat.label}</span>
            <span className="text-[13px] font-black text-white leading-none mt-1">{formatNumber(stat.val)}</span>
          </div>
        ))}
      </div>
    );
  };

  // Function to render table rows
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
            <p className="text-gray-500 font-bold">No utilization models found for {selectedYear} {selectedWeek}.</p>
          </td>
        </tr>
      );
    }

    const rows = [];
    let currentTier = null;

    visibleData.forEach((player, idx) => {
      const playerTier = player.Tier || 'Unranked';
      const playerId = `${player.Player}-${idx}`;
      const isExpanded = expandedRows.has(playerId);
      
      if (!isHistorical && isSinglePos && playerTier !== currentTier) {
        currentTier = playerTier;
        rows.push(
          <tr key={`tier-${currentTier}-${idx}`} className="bg-[#e42d38]">
            <td colSpan={colSpanCount} className="px-3 py-1 font-black text-white uppercase tracking-widest text-[10px] shadow-inner">
              {currentTier}
            </td>
          </tr>
        );
      }

      const playerUrl = `/player/${player.Player?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

      const rank = player['Overall Rank'] ?? player['Overall Result Rank'];
      const posRank = player['Position Rank'] ?? player['Actual Position Finish'];
      const games = player['Projected Games'] ?? player['Games'];
      const ppg = player['Projected PPG'] ?? player['Actual PPG'];

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

          {isHistorical && isSinglePos && (
            <td className="px-2 py-1.5 text-center">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                 {playerTier}
               </span>
            </td>
          )}

          <td className="px-2 py-1.5 text-center bg-red-900/10 border-x border-gray-800/50">
             <div className="text-[13px] font-black text-red-500 drop-shadow-sm">
               {formatNumber(player['OMFG Score'])}
             </div>
          </td>

          <td className="px-2 py-1.5 text-center text-[11px] font-bold text-gray-400">{formatNumber(games, 0)}</td>
          <td className="px-2 py-1.5 text-center text-[11px] font-black text-white">{formatNumber(ppg)}</td>
          
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
    <div className="w-full animate-in fade-in duration-500 pb-24 relative z-0">

      {/* Hero Section */}
      <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-8 mt-6 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0 bg-gradient-to-br from-[#e42d38] to-[#8a1a20]" />
        <img 
          src="https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp" 
          alt="Football Background" 
          className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between h-full px-6 md:px-10 pb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-inner backdrop-blur-sm">
              <BarChart2 size={12} /> Utilization Metrics
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              OMFG Score
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Identify underlying player usage, high-value opportunities, and positive regression candidates before your league-mates do.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full relative z-10">
        {/* Controls Row */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          
          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            
            {/* Dynamic Year Dropdown */}
            <CustomDropdown
              options={availableYears}
              value={selectedYear}
              onChange={handleYearChange}
            />

            {/* Dynamic Week Dropdown */}
            <CustomDropdown
              options={availableWeeks}
              value={selectedWeek}
              onChange={setSelectedWeek}
            />

            {/* Position Filters */}
            <div className="flex flex-wrap gap-1.5 bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
               {positions.map(pos => (
                  <button 
                     key={pos} 
                     onClick={() => setCurrentPosition(pos)}
                     className={`px-3 py-1 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
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
        </div>

        {/* Dark Table Container */}
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
                  
                  {isHistorical && isSinglePos && (
                    <th className="px-2 py-2 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Tier</th>
                  )}

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

        <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">OMFG Methodology</h3>
          <div className="text-[11px] text-gray-400 space-y-1.5 font-medium leading-relaxed">
            <p>• The OMFG Score evaluates under-the-hood usage metrics rather than raw fantasy point outcomes.</p>
            <p>• Players with a <strong>High OMFG Score</strong> but low Projected/Actual PPG are prime positive regression candidates (Buy Low).</p>
            <p>• Players with a <strong>Low OMFG Score</strong> but high PPG are relying on unsustainable efficiency or luck (Sell High).</p>
          </div>
        </div>

      </div>
    </div>
  );
}