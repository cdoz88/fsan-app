import React from 'react';
import { Link2, Loader2, Trophy, ShieldCheck, Share2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function MyLeaguesTab({
  syncedSleeperUser,
  handleManualRefresh,
  loadingLeagues,
  isLoading,
  myLeagues,
  liveLeaderboard,
  handleShareRoster,
  handleViewStats
}) {
  return (
    <div className="p-8 relative">
      {syncedSleeperUser && (
        <div className="absolute top-4 right-6 md:top-6 md:right-8 z-10">
          <button 
            onClick={handleManualRefresh}
            disabled={loadingLeagues || isLoading}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors bg-[#111] border border-gray-800 px-3 py-1.5 rounded-lg shadow-inner disabled:opacity-50"
          >
            <RefreshCw size={12} className={(loadingLeagues || isLoading) ? "animate-spin text-[#1b75bb]" : ""} /> 
            {(loadingLeagues || isLoading) ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
      )}

      {!syncedSleeperUser ? (
        <div className="text-center py-20">
          <Link2 className="w-16 h-16 text-gray-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Connect Sleeper Account</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">Enter your Sleeper username in the card above to automatically pull and display your Draft Night Out leagues here!</p>
        </div>
      ) : loadingLeagues ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-10 h-10 text-[#1b75bb] animate-spin mb-3" />
          <p className="text-xs font-bold uppercase tracking-widest">Searching Sleeper for your DNO Leagues...</p>
        </div>
      ) : myLeagues.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="w-16 h-16 text-gray-800 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Leagues Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">You haven't secured a spot in any Draft Night Out leagues yet. Head over to the draft lobby to claim your seat!</p>
          <a href="/dno" className="inline-block bg-[#1b75bb] hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-colors">
            View Available Drafts
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {myLeagues.map((league) => {
            
            const teamStats = liveLeaderboard?.teams?.find(
              t => String(t.leagueId) === String(league.id) && String(t.ownerId) === String(syncedSleeperUser?.sleeper_id)
            );

            const targetInviteLink = league.invite_link || league.inviteLink || league.sleeper_invite_link || league.invite;

            return (
              <div key={league.id} className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-700 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#f5a623] text-[10px] font-bold uppercase tracking-widest bg-[#f5a623]/10 px-2 py-1 rounded-md">Draft Night Out 2026</span>
                    {league.filled_spots >= league.total_spots ? (
                      <span className="text-teal-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={14}/> Filled</span>
                    ) : (
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{league.filled_spots} / {league.total_spots} Spots</span>
                    )}
                  </div>
                  <h4 className="text-lg font-black italic uppercase text-white mb-1">{league.name}</h4>
                  <p className="text-sm text-gray-400 mb-6">PPR • 12 Team • 17 Rounds</p>
                  
                  {teamStats && !league.pending_join && (
                    <div className="flex items-center justify-between bg-[#151515] p-4 rounded-xl border border-gray-800 mb-6 shadow-inner">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Global Rank</span>
                        <span className="text-white font-black text-xl leading-none">#{teamStats.rank}</span>
                      </div>
                      <div className="w-px h-8 bg-gray-800"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Points</span>
                        <span className="text-[#27d7ff] font-black text-xl leading-none">{parseFloat(teamStats.totalPoints).toFixed(2)}</span>
                      </div>
                      <div className="w-px h-8 bg-gray-800"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Record</span>
                        <span className="text-white font-black text-xl leading-none">{teamStats.wins}-{teamStats.losses}</span>
                      </div>
                    </div>
                  )}

                </div>
                
                <div className="flex flex-col gap-2 w-full mt-auto">
                  {league.pending_join ? (
                     <div className="flex flex-col gap-2">
                       <div className="text-amber-400 text-[10px] font-bold uppercase text-center flex items-center justify-center gap-1">
                         <AlertCircle size={12} /> Pending Sleeper Join
                       </div>
                       <a 
                         href={targetInviteLink || `https://sleeper.com/leagues/${league.id}`} 
                         target="_blank" 
                         rel="noreferrer"
                         className="w-full text-center bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] md:text-xs py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(217,119,6,0.3)] animate-pulse"
                       >
                         Click Here to Join Draft Room
                       </a>
                     </div>
                  ) : (
                     <a 
                       href={targetInviteLink || `https://sleeper.com/leagues/${league.id}`} 
                       target="_blank" 
                       rel="noreferrer"
                       className="w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-widest text-[10px] md:text-xs py-3 rounded-xl transition-colors"
                     >
                       Go To Draft Room
                     </a>
                  )}
                  
                  {!league.pending_join && (
                     <div className="flex gap-2 w-full">
                       <button 
                         onClick={() => handleShareRoster(league.id)}
                         className="flex-1 text-center bg-indigo-900/20 border border-indigo-500/30 hover:bg-indigo-900/40 text-indigo-400 font-bold uppercase tracking-widest text-[10px] md:text-xs py-3 rounded-xl transition-colors"
                       >
                         <Share2 size={14} className="inline mr-1 mb-0.5" /> Share
                       </button>
                       
                       {teamStats && (
                         <button 
                           onClick={() => handleViewStats(teamStats)} 
                           className="flex-1 text-center bg-[#1b75bb]/10 border border-[#1b75bb]/30 hover:bg-[#1b75bb]/20 text-[#27d7ff] font-bold uppercase tracking-widest text-[10px] md:text-xs py-3 rounded-xl transition-colors"
                         >
                           Detailed Stats
                         </button>
                       )}
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}