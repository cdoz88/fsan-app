'use client';

import React, { useState, useMemo } from 'react';
import { FootballIcon } from '../../../components/icons';

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
    <div className="max-w-7xl mx-auto flex flex-col items-center w-full">
      {serverError && (
        <div className="mb-6 w-full p-4 bg-amber-900/50 border border-amber-700 rounded-xl text-amber-200 text-sm font-mono text-center">
          <strong>Vegas Engine Diagnostics Notice:</strong> {serverError}
        </div>
      )}

      {/* 1. Red Hero Section */}
      <div className="relative w-full overflow-hidden bg-red-600 rounded-3xl p-10 md:p-14 mb-8 shadow-2xl flex flex-col items-center justify-center text-center">
        {/* NFL Logo Watermark Background using your existing FootballIcon */}
        <div className="absolute right-[-5%] top-[-10%] opacity-20 pointer-events-none w-64 h-64 md:w-96 md:h-96 text-black">
          <FootballIcon />
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
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                : 'bg-[#1a1a1a] text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800 shadow-sm'
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
                <th className="p-4 font-extrabold text-red-400 bg-red-900/10 border-x border-gray-800 shadow-sm text-center">Proj Pts</th>
                
                {/* Passing Stats */}
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500">Pass Yds</th>
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500 border-r border-gray-800">Pass TD</th>
                
                {/* Rushing Stats */}
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500">Rush Yds</th>
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500 border-r border-gray-800">Rush TD</th>
                
                {/* Receiving Stats */}
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500">Recs</th>
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500">Rec Yds</th>
                <th className="p-4 font-semibold tracking-wider text-center text-gray-500">Rec TD</th>
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
                    
                    <td className="p-4 font-black text-red-400 bg-red-900/10 border-x border-gray-800 text-lg text-center">
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