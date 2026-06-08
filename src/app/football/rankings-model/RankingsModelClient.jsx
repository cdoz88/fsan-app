'use client';

import React, { useState } from 'react';

export default function RankingsModelClient({ initialRankings, mode, serverError }) {
  const [rankings] = useState(initialRankings);
  const [activePosition, setActivePosition] = useState('All');
  
  const isOffseason = mode === 'offseason';

  // Filter rankings based on selected position
  const filteredRankings = rankings.filter((player) => {
    if (activePosition === 'All') return true;
    
    // Handle combined "WR/TE" tags from the weekly engine gracefully
    if (player.position === 'WR/TE') {
      return activePosition === 'WR' || activePosition === 'TE';
    }
    
    return player.position === activePosition;
  });

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];

  return (
    <div className="max-w-7xl mx-auto">
      {serverError && (
        <div className="mb-4 p-4 bg-amber-900/50 border border-amber-700 rounded-lg text-amber-200 text-xs font-mono">
          <strong>Vegas Engine Diagnostics Notice:</strong> {serverError}
        </div>
      )}

      {/* 1. Hero Section & Filter Header Container */}
      <div className="bg-[#111111] text-white p-6 rounded-lg border border-gray-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isOffseason ? 'Vegas Consensus Draft Rankings' : 'Vegas Implied Weekly Rankings'}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              {isOffseason 
                ? 'Preseason fantasy projections based directly on Vegas season-long player futures (Full PPR).'
                : 'Projected fantasy points based directly on sportsbook player props (Full PPR).'}
            </p>
          </div>

          {/* Premium Segmented Position Filter */}
          <div className="flex items-center bg-[#1a1a1a] p-1 rounded-lg border border-gray-800 self-start md:self-center">
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setActivePosition(pos)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                  activePosition === pos
                    ? 'bg-green-500 text-black shadow-lg shadow-green-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 2. Standalone Dark Table Container (With Clean mt-6 Spacing Gap) */}
      <div className="bg-[#1a1a1a] shadow-2xl rounded-lg border border-gray-800 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-[#111111] text-gray-400 uppercase text-xs border-b-2 border-gray-800">
                <th className="p-4 font-semibold tracking-wider">Rank</th>
                <th className="p-4 font-semibold tracking-wider">Player</th>
                <th className="p-4 font-semibold tracking-wider">Pos</th>
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
                filteredRankings.map((player, index) => (
                  <tr key={index} className="border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors text-sm">
                    {/* Maintain absolute rank placement based on full list */}
                    <td className="p-4 font-bold text-gray-500">
                      {rankings.findIndex((p) => p.name === player.name) + 1}
                    </td>
                    <td className="p-4 font-bold text-white">{player.name}</td>
                    <td className="p-4">
                      <span className="bg-gray-800 text-gray-300 text-xs font-bold px-2 py-1 rounded">
                        {player.position}
                      </span>
                    </td>
                    
                    {!isOffseason && <td className="p-4 text-gray-400 font-medium">{player.game}</td>}
                    
                    <td className="p-4 font-black text-green-400 bg-green-900/10 border-x border-gray-800 text-base text-center">
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
                  <td colSpan="12" className="p-8 text-center text-gray-500">
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