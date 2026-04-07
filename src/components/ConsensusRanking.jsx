"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Users, Loader2, Edit, User } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { themes } from '../utils/theme';

const ConsensusRanking = () => {
  const { consensusRanking, rankings, players, loading, currentPosition, setCurrentPosition, selectedAnalyst, setSelectedAnalyst } = usePlayer();
  const { data: session, status } = useSession();
  const [canRank, setCanRank] = useState(false);

  const activeSport = 'Football'; 
  
  const bgImages = {
    All: 'https://admin.fsan.com/wp-content/uploads/2023/11/FSAN-Icon.webp',
    Football: 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp',
    Basketball: 'https://admin.fsan.com/wp-content/uploads/2026/04/nba-logo.webp',
    Baseball: 'https://admin.fsan.com/wp-content/uploads/2026/04/Major_League_Baseball_logo.webp'
  };

  const sportColors = {
    All: { primary: '#374151', secondary: '#1f2937' },
    Football: { primary: '#e42d38', secondary: '#8a1a20' },
    Basketball: { primary: '#e85d22', secondary: '#a33308' },
    Baseball: { primary: '#1b75bb', secondary: '#1e3b8a' },
  };

  const bgImage = bgImages[activeSport] || bgImages.All;
  const primaryColor = sportColors[activeSport]?.primary || sportColors.All.primary;
  const secondaryColor = sportColors[activeSport]?.secondary || sportColors.All.secondary;

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

  const parseWPDate = (dateString) => {
      if (!dateString) return null;
      const safeDateString = dateString.replace(' ', 'T');
      const date = new Date(safeDateString);
      return isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (dateObj) => {
      if (!dateObj) return 'N/A';
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const mostRecentUpdate = rankings.reduce((latest, current) => {
      const currentDate = parseWPDate(current.updated_at);
      if (!currentDate) return latest;
      if (!latest || currentDate > latest) return currentDate;
      return latest;
  }, null);

  const getAvatarUrl = (userId) => {
      if (activeAnalystData?.avatar) return activeAnalystData.avatar;
      return null; 
  };

  // Helper function to create URL-friendly slugs from player names
  const generatePlayerSlug = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24">
      
      {/* FULL WIDTH HERO HEADER (Always Visible) */}
      <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-8 mt-6 shadow-2xl">
        <div 
          className="absolute inset-0 opacity-80 z-0" 
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        />
        <img 
          src={bgImage} 
          alt={`${activeSport} Background`} 
          className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between h-full px-6 md:px-10 pb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              Consensus Rankings
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Aggregated PPR Redraft rankings from {rankings.length} experts for <span className="text-white font-bold">{currentPosition}</span>.
            </p>
          </div>
          
          {canRank && (
             <Link href="/football/rankings/submit" className="bg-[#111] hover:bg-gray-900 border border-gray-700 text-white flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shrink-0 w-full md:w-auto">
                <Edit size={16} /> Submit Rankings
             </Link>
          )}
        </div>
      </div>

      <div className="w-full">
        {/* Position & Ranker Controls (Always Visible) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2 bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
             {['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map(pos => (
                <button 
                   key={pos} onClick={() => setCurrentPosition(pos)}
                   className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}
                >
                   {pos}
                </button>
             ))}
          </div>

          <div className="flex items-center gap-3 bg-[#1a1a1a] p-1.5 rounded-2xl border border-gray-800 shadow-inner w-full md:w-auto">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-3">Ranker:</span>
             <select 
                value={selectedAnalyst} 
                onChange={(e) => setSelectedAnalyst(e.target.value)}
                className="bg-[#252525] border border-gray-700 text-white rounded-xl py-1.5 px-4 shadow-sm focus:outline-none focus:border-red-500 font-bold cursor-pointer text-xs tracking-wide w-full md:w-auto outline-none"
             >
                <option value="consensus">Consensus</option>
                {rankings.map(r => (
                   <option key={r.user_id} value={r.user_id}>{r.display_name}</option>
                ))}
             </select>
          </div>
        </div>

        {/* CONDITIONAL BODY CONTENT */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-24 bg-[#111] rounded-3xl border border-gray-800 shadow-2xl">
              <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Aggregating Consensus...</p>
           </div>
        ) : (players.length === 0 || consensusRanking.length === 0) ? (
           <div className="text-center py-20 bg-[#111] rounded-3xl border border-dashed border-gray-700 shadow-xl">
             <Users className="mx-auto h-12 w-12 text-gray-500 mb-4" />
             <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Data Available</h3>
             <p className="text-gray-500 font-bold">No rankings exist for {currentPosition} yet.</p>
           </div>
        ) : (
           <>
            {/* Rankings Table */}
            <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="px-6 py-4 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                  {isIndividualView ? (
                    <>
                      {currentPosition} Rankings by {activeAnalystData?.display_name}
                      {getAvatarUrl() ? (
                        <img src={getAvatarUrl()} alt={activeAnalystData.display_name} className="w-6 h-6 rounded-full border border-gray-600 object-cover" />
                      ) : (
                         <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                           <User size={12} className="text-gray-400" />
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
                      <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Rank</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Team</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Opponent</th>
                      {isIndividualView ? (
                         <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Vs Consensus</th>
                      ) : (
                         <>
                           <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Avg Rank</th>
                           <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">High / Low</th>
                         </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {displayData.map((player, index) => {
                      const rank = isIndividualView ? player.currentRank : (index + 1);
                      return (
                        <tr key={player.id} className="hover:bg-[#151515] transition-colors group">
                          <td className="px-4 py-2.5">
                            <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-gray-800 text-gray-300 border border-gray-700 shadow-inner group-hover:bg-gray-700 group-hover:text-white transition-colors">
                              {rank}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                             {/* Wrapped Player Name in Link Component */}
                             <Link href={`/player/${generatePlayerSlug(player.name)}`} className="text-sm font-black text-gray-100 tracking-tight hover:text-red-500 transition-colors">
                               {player.name}
                             </Link>
                          </td>
                          <td className="px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">{player.team}</td>
                          <td className="px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wider">{player.opponent}</td>
                          
                          {isIndividualView ? (
                             <td className="px-4 py-2.5">
                               <div className="text-xs font-black flex items-center justify-center">
                                  {player.diff > 0 ? <span className="text-green-500 bg-green-900/20 px-2 py-0.5 rounded border border-green-500/30">+{player.diff}</span> : 
                                   player.diff < 0 ? <span className="text-red-500 bg-red-900/20 px-2 py-0.5 rounded border border-red-500/30">{player.diff}</span> : 
                                   <span className="text-gray-600">-</span>}
                               </div>
                             </td>
                          ) : (
                             <>
                               <td className="px-4 py-2.5 text-center">
                                  <div className="text-sm font-black text-white">{player.averageScore?.toFixed(1)}</div>
                               </td>
                               <td className="px-4 py-2.5 text-center">
                                 <div className="text-xs text-gray-500 flex items-center justify-center gap-1.5 font-bold">
                                   <span className="text-green-500">{player.minRank}</span>
                                   <span className="text-gray-700">/</span>
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

            <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 animate-in fade-in duration-700 delay-500 shadow-xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Ranking Methodology</h3>
              <div className="text-xs text-gray-400 space-y-2 font-medium leading-relaxed">
                <p>• Each user ranking assigns points to players based on their position (higher position = more points).</p>
                <p>• Consensus ranking is calculated by averaging all user scores for each player.</p>
                <p>• Players are then sorted by their average score in descending order.</p>
                <p>• High / Low indicates the absolute highest and lowest rank this player received across all submitted staff rankings.</p>
              </div>
            </div>
           </>
        )}
      </div>
    </div>
  );
};

export default ConsensusRanking;