"use client";
import React from 'react';
import Link from 'next/link';
import { TrendingUp, Users, Award, Loader2, Edit } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const ConsensusRanking = () => {
  const { consensusRanking, rankings, players, loading, currentPosition, setCurrentPosition, selectedAnalyst, setSelectedAnalyst } = usePlayer();

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

  if (players.length === 0 || consensusRanking.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
        
        {/* We still want the submit button available even if there are no rankings yet! */}
        <div className="flex justify-end mb-4">
           <Link href="/football/football-consensus-rankings/submit" className="bg-gray-900 text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm">
              <Edit size={16} /> Submit Rankings
           </Link>
        </div>

        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">No rankings exist for {currentPosition} yet.</p>
        </div>
      </div>
    );
  }

  // Determine what data to display (Consensus vs Individual Analyst)
  let displayData = [];
  let isIndividualView = false;

  if (selectedAnalyst === 'consensus') {
      displayData = consensusRanking;
  } else {
      isIndividualView = true;
      const analystSubmission = rankings.find(r => r.user_id == selectedAnalyst);
      if (analystSubmission) {
          try {
              const rawData = JSON.parse(analystSubmission.ranking_data);
              const stopIndex = rawData.findIndex(i => i.id === 'stop-tier');
              const validData = stopIndex !== -1 ? rawData.slice(0, stopIndex) : rawData;
              
              // Only map actual players, keeping track of their new rank
              let currentRank = 1;
              displayData = validData.filter(i => i.type === 'player').map(item => {
                  const consensusPlayer = consensusRanking.find(p => p.id === item.id);
                  const cRank = consensusPlayer ? consensusRanking.indexOf(consensusPlayer) + 1 : null;
                  const diff = cRank ? (cRank - currentRank) : 0;
                  
                  const playerObj = { ...item, currentRank, diff };
                  currentRank++;
                  return playerObj;
              });
          } catch(e) { console.error("Error parsing analyst data", e); }
      }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      
      {/* Top Controls: Position & Ranker Selectors */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-fit">
           {['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map(pos => (
              <button 
                 key={pos} onClick={() => setCurrentPosition(pos)}
                 className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${currentPosition === pos ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                 {pos}
              </button>
           ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Ranker:</span>
           <select 
              value={selectedAnalyst} 
              onChange={(e) => setSelectedAnalyst(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer"
           >
              <option value="consensus">Consensus</option>
              {rankings.map(r => (
                 <option key={r.user_id} value={r.user_id}>{r.display_name}</option>
              ))}
           </select>

           {/* LINK TO THE SUBMISSION PAGE */}
           <Link href="/football/football-consensus-rankings/submit" className="bg-gray-900 text-white flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm ml-auto md:ml-4">
              <Edit size={16} /> Submit Rankings
           </Link>
        </div>

      </div>

      {/* Rankings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {isIndividualView ? `${currentPosition} Rankings by ${rankings.find(r => r.user_id == selectedAnalyst)?.display_name}` : `Consensus ${currentPosition} Rankings`}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                {isIndividualView ? (
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vs Consensus</th>
                ) : (
                   <>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Rank</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High / Low</th>
                   </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((player, index) => {
                const rank = isIndividualView ? player.currentRank : (index + 1);
                return (
                  <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankBadgeColor(rank)}`}>{rank}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-gray-900">{player.name}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{player.team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.opponent}</td>
                    
                    {isIndividualView ? (
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-bold flex items-center">
                            {player.diff > 0 ? <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded-md">+{player.diff}</span> : 
                             player.diff < 0 ? <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded-md">{player.diff}</span> : 
                             <span className="text-gray-400">-</span>}
                         </div>
                       </td>
                    ) : (
                       <>
                         <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-gray-900">{player.averageScore?.toFixed(1)}</div></td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-500 flex items-center gap-2">
                             <span className="text-green-600 font-bold">{player.minRank}</span>
                             <span className="text-gray-300">/</span>
                             <span className="text-red-500 font-bold">{player.maxRank}</span>
                           </div>
                         </td>
                       </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConsensusRanking;