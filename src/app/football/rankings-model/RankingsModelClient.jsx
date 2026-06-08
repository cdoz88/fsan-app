'use client';

import React, { useState } from 'react';

export default function RankingsModelClient({ initialRankings, mode }) {
  const [rankings, setRankings] = useState(initialRankings);
  
  const isOffseason = mode === 'offseason';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-[#1a1a1a] text-white p-6 rounded-t-lg border border-gray-800">
        <h1 className="text-3xl font-bold">
          {isOffseason ? 'Vegas Consensus Draft Rankings' : 'Vegas Implied Weekly Rankings'}
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          {isOffseason 
            ? 'Preseason fantasy projections based directly on Vegas season-long player futures (Full PPR).'
            : 'Projected fantasy points based directly on sportsbook player props (Full PPR).'}
        </p>
      </div>
      
      <div className="bg-white shadow-xl rounded-b-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs border-b-2 border-gray-300">
                <th className="p-4 font-semibold">Rank</th>
                <th className="p-4 font-semibold">Player</th>
                <th className="p-4 font-semibold">Pos</th>
                {/* Hide Game column during off-season */}
                {!isOffseason && <th className="p-4 font-semibold">Game</th>}
                <th className="p-4 font-extrabold text-green-800 bg-green-100 border-x border-green-200 shadow-sm">Proj Pts</th>
                
                {/* Passing Stats */}
                <th className="p-4 font-semibold text-gray-500">Pass Yds</th>
                <th className="p-4 font-semibold text-gray-500 border-r border-gray-200">Pass TD</th>
                
                {/* Rushing Stats */}
                <th className="p-4 font-semibold text-gray-500">Rush Yds</th>
                <th className="p-4 font-semibold text-gray-500 border-r border-gray-200">Rush TD</th>
                
                {/* Receiving Stats */}
                <th className="p-4 font-semibold text-gray-500">Recs</th>
                <th className="p-4 font-semibold text-gray-500">Rec Yds</th>
                <th className="p-4 font-semibold text-gray-500">Rec TD</th>
              </tr>
            </thead>
            <tbody>
              {rankings && rankings.length > 0 ? (
                rankings.map((player, index) => (
                  <tr key={index} className="border-b hover:bg-blue-50 transition-colors text-sm">
                    <td className="p-4 font-bold text-gray-500">{index + 1}</td>
                    <td className="p-4 font-bold text-gray-900">{player.name}</td>
                    <td className="p-4">
                      <span className="bg-[#1a1a1a] text-white text-xs font-bold px-2 py-1 rounded">
                        {player.position}
                      </span>
                    </td>
                    
                    {!isOffseason && <td className="p-4 text-gray-500 font-medium">{player.game}</td>}
                    
                    <td className="p-4 font-black text-green-700 bg-green-50 border-x border-green-100 text-base">
                      {player.projected_points.toFixed(2)}
                    </td>
                    
                    <td className="p-4 text-gray-600">{player.pass_yds || '-'}</td>
                    <td className="p-4 text-gray-600 border-r border-gray-100">{player.pass_tds || '-'}</td>
                    
                    <td className="p-4 text-gray-600">{player.rush_yds || '-'}</td>
                    <td className="p-4 text-gray-600 border-r border-gray-100">{player.rush_tds || '-'}</td>
                    
                    <td className="p-4 text-gray-600">{player.receptions || '-'}</td>
                    <td className="p-4 text-gray-600">{player.rec_yds || '-'}</td>
                    <td className="p-4 text-gray-600">{player.rec_tds || '-'}</td>
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