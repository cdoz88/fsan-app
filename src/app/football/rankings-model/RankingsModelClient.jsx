'use client';

import React, { useState } from 'react';

export default function RankingsModelClient({ initialRankings, mode, serverError }) {
  const [rankings, setRankings] = useState(initialRankings);
  
  const isOffseason = mode === 'offseason';

  return (
    <div className="max-w-7xl mx-auto">
      {serverError && (
        <div className="mb-4 p-4 bg-amber-900/50 border border-amber-700 rounded-lg text-amber-200 text-xs font-mono">
          <strong>Vegas Engine Diagnostics Notice:</strong> {serverError}
        </div>
      )}

      {/* Header Area */}
      <div className="bg-[#111111] text-white p-6 rounded-t-lg border border-gray-800 border-b-0">
        <h1 className="text-3xl font-bold tracking-tight">
          {isOffseason ? 'Vegas Consensus Draft Rankings' : 'Vegas Implied Weekly Rankings'}
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          {isOffseason 
            ? 'Preseason fantasy projections based directly on Vegas season-long player futures (Full PPR).'
            : 'Projected fantasy points based directly on sportsbook player props (Full PPR).'}
        </p>
      </div>
      
      {/* Dark Table Area */}
      <div className="bg-[#1a1a1a] shadow-2xl rounded-b-lg border border-gray-800 overflow-hidden">
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
              {rankings && rankings.length > 0 ? (
                rankings.map((player, index) => (
                  <tr key={index} className="border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors text-sm">
                    <td className="p-4 font-bold text-gray-500">{index + 1}</td>
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
                    Waiting for odds data...
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