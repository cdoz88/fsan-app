'use client';

import React, { useState } from 'react';

export default function RankingsModelClient({ initialRankings }) {
  const [rankings, setRankings] = useState(initialRankings);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-gray-900 text-white p-6 rounded-t-lg">
        <h1 className="text-3xl font-bold">Vegas Implied Fantasy Rankings</h1>
        <p className="text-sm text-gray-400 mt-2">
          Projected fantasy points based directly on sportsbook player props (Full PPR).
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-b-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs border-b-2 border-gray-200">
                <th className="p-3 font-semibold">Rank</th>
                <th className="p-3 font-semibold">Player</th>
                <th className="p-3 font-semibold">Pos</th>
                <th className="p-3 font-semibold">Game</th>
                <th className="p-3 font-semibold text-green-700 bg-green-50 border-x border-gray-300">Proj Pts</th>
                
                {/* Passing Stats */}
                <th className="p-3 font-semibold">Pass Yds</th>
                <th className="p-3 font-semibold">Pass TD</th>
                
                {/* Rushing Stats */}
                <th className="p-3 font-semibold border-l border-gray-300">Rush Yds</th>
                <th className="p-3 font-semibold">Rush TD</th>
                
                {/* Receiving Stats */}
                <th className="p-3 font-semibold border-l border-gray-300">Recs</th>
                <th className="p-3 font-semibold">Rec Yds</th>
                <th className="p-3 font-semibold">Rec TD</th>
              </tr>
            </thead>
            <tbody>
              {rankings && rankings.length > 0 ? (
                rankings.map((player, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-3 font-bold text-gray-600">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{player.name}</td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                        {player.position}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{player.game}</td>
                    
                    {/* Highlighted Projection Column */}
                    <td className="p-3 font-bold text-green-700 bg-green-50 border-x border-gray-200">
                      {player.projected_points.toFixed(2)}
                    </td>
                    
                    {/* Passing */}
                    <td className="p-3 text-gray-600">{player.pass_yds || '-'}</td>
                    <td className="p-3 text-gray-600">{player.pass_tds || '-'}</td>
                    
                    {/* Rushing */}
                    <td className="p-3 text-gray-600 border-l border-gray-100">{player.rush_yds || '-'}</td>
                    <td className="p-3 text-gray-600">{player.rush_tds || '-'}</td>
                    
                    {/* Receiving */}
                    <td className="p-3 text-gray-600 border-l border-gray-100">{player.receptions || '-'}</td>
                    <td className="p-3 text-gray-600">{player.rec_yds || '-'}</td>
                    <td className="p-3 text-gray-600">{player.rec_tds || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="p-8 text-center text-gray-500">
                    Waiting for odds data for the upcoming week...
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