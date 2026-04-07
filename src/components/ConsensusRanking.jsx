"use client";
import React from 'react';
import { TrendingUp, Users, Award, Loader2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const ConsensusRanking = () => {
  const { consensusRanking, rankings, players, loading, currentPosition, setCurrentPosition } = usePlayer();

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-amber-600 text-white';
    if (rank <= 10) return 'bg-blue-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Aggregating Consensus...</p>
       </div>
     )
  }

  if (players.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">
            Please upload players and collect rankings first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      
      {/* Position Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-fit">
         {['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map(pos => (
            <button 
               key={pos}
               onClick={() => setCurrentPosition(pos)}
               className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${currentPosition === pos ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
               {pos}
            </button>
         ))}
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Consensus Rankings</h1>
        <p className="text-gray-600">
          Aggregated rankings from {rankings.length} user submissions for {currentPosition}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{rankings.length}</div>
              <div className="text-sm text-gray-500">Total Rankings</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{consensusRanking.length}</div>
              <div className="text-sm text-gray-500">Ranked Players</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {consensusRanking[0]?.averageScore.toFixed(1) || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Top Avg Rank</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      {consensusRanking.length > 0 ? (
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
               Consensus Rankings
            </h2>
            </div>

            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High / Low</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {consensusRanking.map((player, index) => {
                  const rank = index + 1;
                  return (
                     <tr
                        key={player.id}
                        className="hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-left-4"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                     >
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankBadgeColor(rank)}`}>
                           {rank}
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                           {player.name}
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.team}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.opponent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                           {player.averageScore.toFixed(1)}
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                           <span className="text-green-600 font-bold">{player.minRank}</span>
                           <span className="text-gray-300">/</span>
                           <span className="text-red-500 font-bold">{player.maxRank}</span>
                        </div>
                        </td>
                     </tr>
                  );
                  })}
               </tbody>
            </table>
            </div>
         </div>
      ) : (
         <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Consensus Yet</h3>
            <p className="text-gray-500">
            Consensus rankings for {currentPosition} will appear once users submit their rankings.
            </p>
         </div>
      )}
    </div>
  );
};

export default ConsensusRanking;