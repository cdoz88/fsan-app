'use client';

import React, { useState, useMemo } from 'react';

export default function RankingsModelClient({ initialRankings, mode, serverError }) {
  const [activePosition, setActivePosition] = useState('All');
  const isOffseason = mode === 'offseason';

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
  const filteredRankings = processedRankings.filter((player) => {
    if (activePosition === 'All') return true;
    if (player.position === 'WR/TE') {
      return activePosition === 'WR' || activePosition === 'TE';
    }
    return player.position === activePosition;
  });

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];

  return (
    <div className="w-full flex flex-col items-center">
      {serverError && (
        <div className="mb-6 w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-mono text-center">
          <strong>Vegas Engine Diagnostics Notice:</strong> {serverError}
        </div>
      )}

      {/* 1. Red Hero Section exactly matching the Football Theme screenshot */}
      <div className="relative w-full overflow-hidden bg-[#dc2626] rounded-3xl p-10 md:p-14 mb-8 shadow-xl flex flex-col items-center justify-center text-center border border-red-700">
        {/* NFL Logo Watermark Background (Stylized Shield) */}
        <div className="absolute right-[-5%] top-[-10%] opacity-20 pointer-events-none w-64 h-64 md:w-96 md:h-96">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5L90 25V75L50 95L10 75V25L50 5Z" />
          </svg>
        </div>

        <span className="relative z-10 text-white/90 text-sm md:text-base font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-sm">
          {isOffseason ? 'Preseason Rankings' : 'Weekly Rankings'}
        </span>
        <h1 className="relative z-10 text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
          Vegas Draft Board
        </h1>
      </div>

      {/* 2. Red Position Filters */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10 w-full">
        {positions.map((pos) => (
          <button
            key={pos}
            onClick={() => setActivePosition(pos)}
            className={`px-8 py-3 text-sm font-black uppercase tracking-widest rounded-full transition-all duration-200 ${
              activePosition === pos
                ? 'bg-[#dc2626] text-white shadow-lg shadow-red-600/30 scale-105'
                : 'bg-white text-gray-700 hover:bg-red-50 hover:text-[#dc2626] border border-gray-200 shadow-sm'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
      
      {/* 3. Clean Light-Mode Table Container */}
      <div className="w-full bg-white shadow-2xl rounded-3xl border border-gray-200 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-xs border-b-2 border-gray-200">
                <th className="p-4 font-bold tracking-wider text-center">Ovr Rank</th>
                <th className="p-4 font-bold tracking-wider text-center">Pos Rank</th>
                <th className="p-4 font-semibold tracking-wider">Player</th>
                {!isOffseason && <th className="p-4 font-semibold tracking-wider">Game</th>}
                <th className="p-4 font-extrabold text-green-800 bg-green-100 border-x border-green-200 shadow-sm text-center">Proj Pts</th>
                
                {/* Passing Stats */}
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500">Pass Yds</th>
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500 border-r border-gray-200">Pass TD</th>
                
                {/* Rushing Stats */}
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500">Rush Yds</th>
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500 border-r border-gray-200">Rush TD</th>
                
                {/* Receiving Stats */}
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500">Recs</th>
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500">Rec Yds</th>
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500">Rec TD</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredRankings && filteredRankings.length > 0 ? (
                filteredRankings.map((player) => (
                  <tr key={player.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                    {/* Overall Rank */}
                    <td className="p-4 font-bold text-gray-400 text-center">
                      {player.overallRank}
                    </td>
                    
                    {/* Position Rank */}
                    <td className="p-4 text-center">
                      <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-md">
                        {player.posRank}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-gray-900 text-base">{player.name}</td>
                    
                    {!isOffseason && <td className="p-4 text-gray-500 font-medium">{player.game}</td>}
                    
                    <td className="p-4 font-black text-green-700 bg-green-50 border-x border-green-100 text-lg text-center">
                      {player.projected_points.toFixed(1)}
                    </td>
                    
                    <td className="p-4 text-gray-500 text-center">{player.pass_yds || '-'}</td>
                    <td className="p-4 text-gray-500 text-center border-r border-gray-100">{player.pass_tds || '-'}</td>
                    
                    <td className="p-4 text-gray-500 text-center">{player.rush_yds || '-'}</td>
                    <td className="p-4 text-gray-500 text-center border-r border-gray-100">{player.rush_tds || '-'}</td>
                    
                    <td className="p-4 text-gray-500 text-center">{player.receptions || '-'}</td>
                    <td className="p-4 text-gray-500 text-center">{player.rec_yds || '-'}</td>
                    <td className="p-4 text-gray-500 text-center">{player.rec_tds || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="p-12 text-center text-gray-400 text-lg">
                    No players found matching the selected position filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}