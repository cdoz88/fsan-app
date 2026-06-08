'use client';

import React, { useState, useMemo } from 'react';

export default function RankingsModelClient({ initialRankings, mode, serverError }) {
  const [currentPosition, setCurrentPosition] = useState('All');
  const isOffseason = mode === 'offseason';

  // Vegas Football Theme Constants (Matching ConsensusRanking.jsx)
  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#e42d38';
  const secondaryColor = '#8a1a20';

  // Calculate Overall Rank and Position Rank natively exactly once
  const processedRankings = useMemo(() => {
    const posCounters = {};
    return (initialRankings || []).map((player, index) => {
      const pos = player.position || 'UNK';
      
      if (!posCounters[pos]) posCounters[pos] = 0;
      posCounters[pos] += 1;
      
      return {
        ...player,
        overallRank: index + 1,
        posRank: `${pos}${posCounters[pos]}`
      };
    });
  }, [initialRankings]);

  // Filter rankings based on selected position
  const visibleData = processedRankings.filter((player) => {
    if (currentPosition === 'All') return true;
    if (player.position === 'WR/TE') {
      return currentPosition === 'WR' || currentPosition === 'TE';
    }
    return player.position === currentPosition;
  });

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24">
      
      {serverError && (
        <div className="mt-6 mb-2 p-4 bg-red-900/30 border border-red-800 rounded-2xl text-red-200 text-xs font-mono font-bold tracking-wide">
          ⚠️ Vegas Engine Diagnostics Notice: {serverError}
        </div>
      )}

      {/* EXACT DUPLICATE HERO SECTION */}
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
              {isOffseason ? 'Preseason' : 'Weekly'} Rankings
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              {isOffseason 
                ? 'Aggregated PPR projections modeled directly from Vegas season-long player futures.'
                : 'Projected fantasy points calculated dynamically from live sportsbook player props.'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* EXACT DUPLICATE FILTER BUTTONS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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

        {/* EXACT DUPLICATE TABLE CONTAINER */}
        <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
          
          <div className="px-6 py-4 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
              Vegas Implied {currentPosition === 'All' ? 'Overall' : currentPosition} Projections
            </h2>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-gray-800">
              Data Source: <span className="text-white">DraftKings Sportsbook</span>
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="min-w-full text-left whitespace-nowrap">
              <thead className="bg-[#1a1a1a] border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Ovr</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pos Rank</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                  {!isOffseason && <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Game</th>}
                  
                  {/* Highlighted Fantasy Points */}
                  <th className="px-4 py-3 text-[10px] font-black text-red-500 uppercase tracking-widest text-center bg-red-900/10 border-x border-gray-800">Proj Pts</th>
                  
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Pass Yds</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center border-r border-gray-800">Pass TD</th>
                  
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rush Yds</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center border-r border-gray-800">Rush TD</th>
                  
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Recs</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rec Yds</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rec TD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {visibleData && visibleData.length > 0 ? (
                  visibleData.map((player) => (
                    <tr key={player.name} className="hover:bg-[#151515] transition-colors group">
                      
                      {/* Ovr Rank Circle (Matching Consensus) */}
                      <td className="px-4 py-2.5">
                        <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-gray-800 text-gray-300 border border-gray-700 shadow-inner group-hover:bg-gray-700 group-hover:text-white transition-colors">
                          {player.overallRank}
                        </div>
                      </td>
                      
                      {/* Pos Rank */}
                      <td className="px-4 py-2.5 text-center">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                           {player.posRank}
                         </span>
                      </td>

                      {/* Player Name */}
                      <td className="px-4 py-2.5">
                         <span className="text-sm font-black text-gray-100 tracking-tight">
                           {player.name}
                         </span>
                      </td>
                      
                      {!isOffseason && <td className="px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">{player.game}</td>}
                      
                      {/* Projected Points Column */}
                      <td className="px-4 py-2.5 text-center bg-red-900/5 border-x border-gray-800/50">
                         <div className="text-sm font-black text-white">
                           {player.projected_points.toFixed(1)}
                         </div>
                      </td>

                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player.pass_yds || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400 border-r border-gray-800/50">{player.pass_tds || '-'}</td>
                      
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player.rush_yds || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400 border-r border-gray-800/50">{player.rush_tds || '-'}</td>
                      
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player.receptions || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player.rec_yds || '-'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-400">{player.rec_tds || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="py-20 text-center">
                      <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Data Available</h3>
                      <p className="text-gray-500 font-bold">No {currentPosition} projections exist yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology Box */}
        <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 animate-in fade-in duration-700 delay-500 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Ranking Methodology</h3>
          <div className="text-xs text-gray-400 space-y-2 font-medium leading-relaxed">
            <p>• Projections are pulled directly from live DraftKings sportsbook player prop Over/Under totals.</p>
            <p>• Player fantasy points are calculated using standard Full-PPR scoring logic (1 pt per reception, 4 pt passing TDs).</p>
            <p>• Touchdown projections are derived using the implied probability mathematically extracted from the "Anytime TD" betting odds.</p>
            <p>• During the offseason, these numbers utilize DraftKings season-long player futures.</p>
          </div>
        </div>

      </div>
    </div>
  );
}