'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, ChevronDown, BarChart2 } from 'lucide-react'; 

export default function OmfgClient() {
  const [playersData, setPlayersData] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);

  // --- UI State Variables ---
  const [currentPosition, setCurrentPosition] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedWeek, setSelectedWeek] = useState('Season');
  
  // Theme Constants
  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#1b75bb'; // Changed to blue to differentiate from standard rankings
  const secondaryColor = '#0f4c7a';

  // Fetch the data (This will eventually hit the API where your creator's Excel data lives)
  useEffect(() => {
    async function loadOmfgData() {
      setIsSyncing(true);
      try {
        // Placeholder API endpoint for the uploaded Excel data
        const res = await fetch(`/api/omfg-data?year=${selectedYear}&week=${selectedWeek}`);
        const data = await res.json();
        if (data.success && data.players) {
          setPlayersData(data.players);
        } else {
          setPlayersData([]); // Fallback if no data exists for that week
        }
      } catch (err) {
        console.error("Error connecting to OMFG database", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadOmfgData();
  }, [selectedYear, selectedWeek]);

  // Filter by Position
  const visibleData = useMemo(() => {
    if (!playersData) return [];
    return playersData.filter((player) => {
      if (currentPosition === 'All') return true;
      return player.Position === currentPosition;
    });
  }, [playersData, currentPosition]);

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];
  const years = ['2026', '2025', '2024'];
  const weeks = ['Season', ...Array.from({length: 18}, (_, i) => `Week ${i + 1}`)];

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative">

      {/* Hero Section */}
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

      <div className="w-full">
        {/* Controls Row */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          
          <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
            
            {/* Year Dropdown */}
            <div className="relative w-32">
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)} 
                className="w-full bg-[#111] border border-gray-800 text-white rounded-xl py-2.5 pl-4 pr-10 text-xs font-bold uppercase tracking-widest appearance-none shadow-inner cursor-pointer hover:border-gray-600 transition-colors"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Week Dropdown */}
            <div className="relative w-40">
              <select 
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(e.target.value)} 
                className="w-full bg-[#111] border border-gray-800 text-white rounded-xl py-2.5 pl-4 pr-10 text-xs font-bold uppercase tracking-widest appearance-none shadow-inner cursor-pointer hover:border-gray-600 transition-colors"
              >
                {weeks.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Position Filters */}
            <div className="flex flex-wrap gap-2 bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
               {positions.map(pos => (
                  <button 
                     key={pos} 
                     onClick={() => setCurrentPosition(pos)}
                     className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                       currentPosition === pos 
                        ? 'bg-[#1b75bb] text-white shadow-[0_0_15px_rgba(27,117,187,0.4)]' 
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
        <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-[400px]">
          
          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full text-left whitespace-nowrap">
              <thead className="bg-[#1a1a1a] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Ovr</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pos Rank</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Tier</th>
                  
                  {/* Highlighted OMFG Column */}
                  <th className="px-4 py-3 text-[10px] font-black text-[#1b75bb] uppercase tracking-widest text-center bg-[#1b75bb]/10 border-x border-gray-800">OMFG Score</th>
                  
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Proj PPG</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Proj Tgts</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Air Yds</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rush Att</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-800/50">
                {isSyncing ? (
                  <tr>
                    <td colSpan="9" className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center text-[#1b75bb] animate-in fade-in duration-500">
                        <RefreshCw className="animate-spin mb-4" size={36} />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Loading Utilization Data</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Crunching the OMFG Models...</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleData && visibleData.length > 0 ? (
                  visibleData.map((player, idx) => {
                    const playerUrl = `/player/${player.Player?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

                    return (
                    <tr key={`${player.Player}-${idx}`} className="hover:bg-[#151515] transition-colors group">
                      
                      <td className="px-4 py-2.5">
                        <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-gray-800 text-gray-300 border border-gray-700 shadow-inner group-hover:bg-gray-700 group-hover:text-white transition-colors">
                          {player['Overall Rank']}
                        </div>
                      </td>
                      
                      <td className="px-4 py-2.5 text-center">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                           {player.Position}{player['Position Rank']}
                         </span>
                      </td>

                      <td className="px-4 py-2.5">
                         <div className="flex items-center gap-3">
                           <Link href={playerUrl} className="text-sm font-black text-gray-100 tracking-tight hover:text-[#1b75bb] transition-colors">
                             {player.Player}
                           </Link>
                           {player.Team && (
                             <img 
                               src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.Team.toLowerCase()}.png`} 
                               alt={player.Team}
                               className="w-6 h-6 object-contain drop-shadow-md"
                               onError={(e) => e.target.style.display = 'none'}
                             />
                           )}
                         </div>
                      </td>
                      
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {player.Tier}
                      </td>

                      {/* Highlighted OMFG Score */}
                      <td className="px-4 py-2.5 text-center bg-[#1b75bb]/5 border-x border-gray-800/50">
                         <div className="text-sm font-black text-white">
                           {player['OMFG Score']?.toFixed(1) || '-'}
                         </div>
                      </td>

                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player['Projected PPG']?.toFixed(1) || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player['Projected Targets']?.toFixed(1) || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player['Projected Air Yards']?.toFixed(1) || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player['Projected Rush Attempts']?.toFixed(1) || '-'}</td>
                    </tr>
                  )
                 })
                ) : (
                  <tr>
                    <td colSpan="9" className="py-20 text-center">
                      <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Data Available</h3>
                      <p className="text-gray-500 font-bold">No utilization models found for {selectedYear} {selectedWeek}.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">OMFG Methodology</h3>
          <div className="text-xs text-gray-400 space-y-2 font-medium leading-relaxed">
            <p>• The OMFG Score evaluates under-the-hood usage metrics rather than raw fantasy point outcomes.</p>
            <p>• Players with a <strong>High OMFG Score</strong> but low Projected/Actual PPG are prime positive regression candidates (Buy Low).</p>
            <p>• Players with a <strong>Low OMFG Score</strong> but high PPG are relying on unsustainable efficiency or luck (Sell High).</p>
          </div>
        </div>

      </div>
    </div>
  );
}