"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Users, Loader2, Edit, User } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const ConsensusRanking = () => {
  const { consensusRanking, rankings, players, loading, currentPosition, setCurrentPosition, selectedAnalyst, setSelectedAnalyst } = usePlayer();
  const { data: session, status } = useSession();
  const [canRank, setCanRank] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (status === 'authenticated' && session?.user?.token) {
        try {
          const res = await fetch('https://admin.fsan.com/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.user.token}`,
            },
            body: JSON.stringify({ query: `query { viewer { roles { nodes { name } } } }` })
          });
          const json = await res.json();
          const roles = json?.data?.viewer?.roles?.nodes?.map(r => r.name.toLowerCase()) || [];
          
          if (roles.some(r => ['administrator', 'editor', 'author', 'player'].includes(r))) {
            setCanRank(true);
          }
        } catch (e) { console.error("Failed to fetch user roles", e); }
      }
    };
    checkRole();
  }, [status, session]);

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Aggregating Consensus...</p>
       </div>
     )
  }

  if (players.length === 0 || consensusRanking.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {canRank && (
          <div className="flex justify-end mb-4">
             <Link href="/football/football-consensus-rankings/submit" className="bg-red-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest font-black hover:bg-red-500 transition-colors shadow-lg">
                <Edit size={16} /> Submit Rankings
             </Link>
          </div>
        )}
        <div className="text-center py-20 bg-[#111] rounded-3xl border border-dashed border-gray-700 shadow-xl">
          <Users className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Data Available</h3>
          <p className="text-gray-500 font-bold">No rankings exist for {currentPosition} yet.</p>
        </div>
      </div>
    );
  }

  let displayData = [];
  let isIndividualView = false;
  let activeAnalystData = null;

  if (selectedAnalyst === 'consensus') {
      displayData = consensusRanking;
  } else {
      isIndividualView = true;
      activeAnalystData = rankings.find(r => r.user_id == selectedAnalyst);
      if (activeAnalystData) {
          try {
              const rawData = JSON.parse(activeAnalystData.ranking_data);
              const stopIndex = rawData.findIndex(i => i.id === 'stop-tier');
              const validData = stopIndex !== -1 ? rawData.slice(0, stopIndex) : rawData;
              
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

  // --- FIXED DATE PARSER ---
  // Safely parses "YYYY-MM-DD HH:MM:SS" from WP into a valid JS Date object
  const parseWPDate = (dateString) => {
      if (!dateString) return null;
      // Replace space with 'T' for ISO 8601 compliance, which Safari/iOS requires
      const safeDateString = dateString.replace(' ', 'T');
      const date = new Date(safeDateString);
      return isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (dateObj) => {
      if (!dateObj) return 'N/A';
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Find the absolute latest update timestamp among all fetched rankings
  const mostRecentUpdate = rankings.reduce((latest, current) => {
      const currentDate = parseWPDate(current.updated_at);
      if (!currentDate) return latest;
      if (!latest || currentDate > latest) return currentDate;
      return latest;
  }, null);

  // Grab the correct avatar URL
  const getAvatarUrl = (userId) => {
      // Because your WP REST API exposes avatars globally (like in your articles archive),
      // we can construct the default gravatar fallback URL WordPress uses if the custom meta is missing.
      // If the custom avatar query was added to PHP, it will be in `activeAnalystData.avatar`.
      if (activeAnalystData?.avatar) return activeAnalystData.avatar;
      
      // Fallback: If we have an email hash or user ID, we could use gravatar, 
      // but without exposing user emails in the ranking JSON, we will render the generic user icon.
      return null; 
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
             <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter drop-shadow-md mb-2">Consensus Rankings</h1>
             <p className="text-gray-400">Aggregated rankings from {rankings.length} experts for <span className="text-red-500 font-bold">{currentPosition}</span>.</p>
          </div>
          
          {canRank && (
             <Link href="/football/football-consensus-rankings/submit" className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] shrink-0 w-full md:w-auto">
                <Edit size={16} /> Submit Rankings
             </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2 bg-[#111] p-2 rounded-2xl shadow-inner border border-gray-800 w-fit">
             {['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map(pos => (
                <button 
                   key={pos} onClick={() => setCurrentPosition(pos)}
                   className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'}`}
                >
                   {pos}
                </button>
             ))}
          </div>

          <div className="flex items-center gap-3 bg-[#111] p-2 rounded-2xl border border-gray-800 shadow-inner w-full md:w-auto">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-3">Ranker:</span>
             <select 
                value={selectedAnalyst} 
                onChange={(e) => setSelectedAnalyst(e.target.value)}
                className="bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-2 px-4 shadow-sm focus:outline-none focus:border-red-500 font-bold cursor-pointer text-sm tracking-wide w-full md:w-auto outline-none"
             >
                <option value="consensus">Consensus</option>
                {rankings.map(r => (
                   <option key={r.user_id} value={r.user_id}>{r.display_name}</option>
                ))}
             </select>
          </div>
        </div>
      </div>

      <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="px-6 md:px-8 py-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-4">
            {isIndividualView ? (
              <>
                {currentPosition} Rankings by {activeAnalystData?.display_name}
                {getAvatarUrl() ? (
                  <img src={getAvatarUrl()} alt={activeAnalystData.display_name} className="w-8 h-8 rounded-full border border-gray-600 object-cover" />
                ) : (
                   <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                     <User size={16} className="text-gray-400" />
                   </div>
                )}
              </>
            ) : (
              `Consensus ${currentPosition} Rankings`
            )}
          </h2>
          
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-gray-800">
            Last Updated: <span className="text-white">{isIndividualView && activeAnalystData ? formatDate(parseWPDate(activeAnalystData.updated_at)) : formatDate(mostRecentUpdate)}</span>
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full text-left whitespace-nowrap">
            <thead className="bg-[#1a1a1a] border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest w-20 text-center">Rank</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Team</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Opponent</th>
                {isIndividualView ? (
                   <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Vs Consensus</th>
                ) : (
                   <>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Avg Rank</th>
                     <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">High / Low</th>
                   </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {displayData.map((player, index) => {
                const rank = isIndividualView ? player.currentRank : (index + 1);
                return (
                  <tr key={player.id} className="hover:bg-[#151515] transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-black shrink-0 bg-gray-800 text-white border border-gray-700 shadow-inner">
                        {rank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-base font-black text-gray-100 tracking-tight">{player.name}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{player.team}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{player.opponent}</td>
                    
                    {isIndividualView ? (
                       <td className="px-6 py-4">
                         <div className="text-sm font-black flex items-center justify-center">
                            {player.diff > 0 ? <span className="text-green-500 bg-green-900/20 px-3 py-1 rounded-lg border border-green-500/30">+{player.diff}</span> : 
                             player.diff < 0 ? <span className="text-red-500 bg-red-900/20 px-3 py-1 rounded-lg border border-red-500/30">{player.diff}</span> : 
                             <span className="text-gray-500">-</span>}
                         </div>
                       </td>
                    ) : (
                       <>
                         <td className="px-6 py-4 text-center">
                            <div className="text-sm font-black text-white">{player.averageScore?.toFixed(1)}</div>
                         </td>
                         <td className="px-6 py-4 text-center">
                           <div className="text-sm text-gray-500 flex items-center justify-center gap-2 font-bold">
                             <span className="text-green-500">{player.minRank}</span>
                             <span className="text-gray-600">/</span>
                             <span className="text-red-500">{player.maxRank}</span>
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

      <div className="mt-8 bg-[#111] border border-gray-800 rounded-3xl p-6 md:p-8 animate-in fade-in duration-700 delay-500 shadow-xl">
        <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4">Ranking Methodology</h3>
        <div className="text-sm text-gray-400 space-y-3 font-medium leading-relaxed">
          <p>• Each user ranking assigns points to players based on their position (higher position = more points).</p>
          <p>• Consensus ranking is calculated by averaging all user scores for each player.</p>
          <p>• Players are then sorted by their average score in descending order.</p>
          <p>• High / Low indicates the absolute highest and lowest rank this player received across all submitted staff rankings.</p>
        </div>
      </div>
    </div>
  );
};

export default ConsensusRanking;