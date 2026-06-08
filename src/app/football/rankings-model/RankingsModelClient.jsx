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
      
      // Increment the counter for this specific position
      if (!posCounters[pos]) posCounters[pos] = 0;
      posCounters[pos] += 1;
      
      return {
        ...player,
        overallRank: index + 1,
        posRank: `${pos}${posCounters[pos]}` // Generates labels like "WR1", "RB12"
      };
    });
  }, [initialRankings]);

  // Filter rankings based on selected position
  const filteredRankings = processedRankings.filter((player) => {
    if (activePosition === 'All') return true;
    
    // Handle combined "WR/TE" tags gracefully if they occur
    if (player.position === 'WR/TE') {
      return activePosition === 'WR' || activePosition === 'TE';
    }
    
    return player.position === activePosition;
  });

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];

  return (
    <div className="max-w-7xl mx-auto flex flex-col items-center w-full">
      {serverError && (
        <div className="mb-6 w-full p-4 bg-amber-900/50 border border-amber-700 rounded-xl text-amber-200 text-sm font-mono text-center">
          <strong>Vegas Engine Diagnostics Notice:</strong> {serverError}
        </div>
      )}

      {/* 1. Duplicated Hero Section Layout */}
      <div className="flex flex-col items-center justify-center mb-8 text-center mt-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 uppercase tracking-tighter mb-4">
          {isOffseason ? 'Vegas Draft Board' : 'Vegas Weekly Board'}
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          {isOffseason 
            ? 'Preseason fantasy rankings modeled directly from Vegas season-long player futures (Full PPR).'
            : 'Projected fantasy points calculated dynamically from live sportsbook player props (Full PPR).'}
        </p>
      </div>

      {/* 2. Position Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-[#1a1a1a] p-2 rounded-3xl border border-gray-800 shadow-xl">
        {positions.map((pos) => (
          <button
            key={pos}
            onClick={() => setActivePosition(pos)}
            className={`px-8 py-3 text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${
              activePosition === pos
                ? 'bg-white text-black shadow-lg scale-105'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/80'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>
      
      {/* 3. Dark Table Container */}
      <div className="w-full bg-[#1a1a1a] shadow-2xl rounded-3xl border border-gray-800 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="bg-[#111111] text-gray-400 uppercase text-xs border-b-2 border-gray-800">
                <th className="p-4 font-bold tracking-wider text-center">Ovr Rank</th>
                <th className="p-4 font-bold tracking-wider text-center">Pos Rank</th>
                <th className="p-4 font-semibold tracking-wider">Player</th>
                {!isOffseason && <th className="p-4 font-semibold tracking-wider">Game</th>}
                <th className="p-4 font-extrabold text-green-400 bg-green-900/10 border-x border-gray-800 shadow-sm text-center">Proj Pts</th>
                
                {/* Passing Stats */}
                <th className="p-4 font-semibold tracking-wider text-center">Pass Yds</th>
                <th className="p-4 font-semibold tracking-wider text-center border-r border-gray-800">Pass TD</th>
                
                {/* Rushing Stats */}
                <th className="p-4 font-semibold tracking-wider text-center">Rush Yds</th>
                <th className="p-4 font-semibold tracking-wider text-center border-r border-gray-800">Rush TD</th>
                
                {/* Receiving Stats */}
                <th className="p-4 font-semibold tracking-wider text-center">Recs</th>
                <th className="p-4 font-semibold tracking-wider text-center">Rec Yds</th>
                <th className="p-4 font-semibold tracking-wider text-center">Rec TD</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {filteredRankings && filteredRankings.length > 0 ? (
                filteredRankings.map((player) => (
                  <tr key={player.name} className="border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors text-sm">
                    {/* Overall Rank */}
                    <td className="p-4 font-bold text-gray-500 text-center">
                      {player.overallRank}
                    </td>
                    
                    {/* Position Rank */}
                    <td className="p-4 text-center">
                      <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-md">
                        {player.posRank}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-white text-base">{player.name}</td>
                    
                    {!isOffseason && <td className="p-4 text-gray-400 font-medium">{player.game}</td>}
                    
                    <td className="p-4 font-black text-green-400 bg-green-900/10 border-x border-gray-800 text-lg text-center">
                      {player.projected_points.toFixed(1)}
                    </td>
                    
                    <td className="p-4 text-gray-400 text-center">{player.pass_yds || '-'}</td>
                    <td className="p-4 text-gray-400 text-center border-r border-gray-800/60">{player.pass_tds || '-'}</td>
                    
                    <td className="p-4 text-gray-400 text-center">{player.rush_yds || '-'}</td>
                    <td className="p-4 text-gray-400 text-center border-r border-gray-800/60">{player.rush_tds || '-'}</td>
                    
                    <td className="p-4 text-gray-400 text-center">{player.receptions || '-'}</td>
                    <td className="p-4 text-gray-400 text-center">{player.rec_yds || '-'}</td>
                    <td className="p-4 text-gray-400 text-center">{player.rec_tds || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="p-12 text-center text-gray-500 text-lg">
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