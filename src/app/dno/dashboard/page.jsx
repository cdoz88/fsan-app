"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Ticket, ShieldCheck, Share2, Trophy, ExternalLink, Loader2 } from 'lucide-react';

// Importing from the DNO components folder
import DNOHeader from '../../../components/dno/DNOHeader';
import GraphicTab from '../../../components/dno/tabs/GraphicTab';

export default function DNODashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('my-leagues');
  
  const [ticketCount, setTicketCount] = useState(0);
  const [myLeagues, setMyLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccountData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const uRes = await fetch(`/api/user?id=${session.user.id}`);
      const uData = await uRes.json();
      
      setTicketCount(uData.dno_tickets || 0);

      const pRes = await fetch(`/api/scl?type=dno_pool`);
      if (pRes.ok) {
        const pData = await pRes.json();
        
        const myJoinedLeagues = (pData.leagues || []).filter(league => {
           if (!uData.sleeper_id) return false;
           return league.members?.some(m => m.user_id === uData.sleeper_id);
        });
        
        setMyLeagues(myJoinedLeagues);
      }
    } catch (err) {
      console.error("Failed loading account data", err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadAccountData();
    } else if (status === 'unauthenticated') {
      window.location.href = '/dno'; 
    }
  }, [status, loadAccountData]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1b75bb] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans selection:bg-[#1b75bb] selection:text-white relative">
      
      {/* Floating DNO Header */}
      <DNOHeader onOpenAuthModal={() => {}} />

      {/* Added pt-28 to push content below the absolute header */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-28 pb-24 z-10 relative">
        
        {/* Welcome & Account Snapshot */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
            Welcome to the Locker Room, <span className="text-[#1b75bb]">{session?.user?.name || 'Manager'}</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ticket Stash Card */}
            <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1b75bb] opacity-5 blur-[50px] rounded-full"></div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Available Draft Tickets</p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-white leading-none">{ticketCount}</span>
                  <span className="text-gray-500 font-medium mb-1">Tickets</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center shadow-inner">
                <Ticket className="w-8 h-8 text-[#f5a623]" />
              </div>
            </div>

            {/* FSAN Perk Card */}
            <div className="bg-gradient-to-br from-[#111] to-[#151515] border border-[#1b75bb]/30 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-[0_0_20px_rgba(27,117,187,0.1)] group hover:border-[#1b75bb]/60 transition-colors">
              <div>
                <p className="text-[#1b75bb] font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                  <ShieldCheck size={14} /> FSAN Subscription
                </p>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-1">Claim Your Free Year</h3>
                <p className="text-sm text-gray-400 max-w-[250px]">Use your DNO entry to unlock premium tools at FSAN.</p>
              </div>
              <a href="https://fsan.com/subscribe" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#1b75bb] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-px overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('my-leagues')}
            className={`pb-4 px-2 font-black uppercase tracking-widest text-xs transition-colors whitespace-nowrap relative ${activeTab === 'my-leagues' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <div className="flex items-center gap-2"><Trophy size={16} /> My Leagues</div>
            {activeTab === 'my-leagues' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 to-[#1b75bb] rounded-t-full"></div>}
          </button>

          <button 
            onClick={() => setActiveTab('share')}
            className={`pb-4 px-2 font-black uppercase tracking-widest text-xs transition-colors whitespace-nowrap relative ${activeTab === 'share' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <div className="flex items-center gap-2"><Share2 size={16} /> Share Roster</div>
            {activeTab === 'share' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 to-[#1b75bb] rounded-t-full"></div>}
          </button>
        </div>

        {/* Dynamic Dashboard Content */}
        <div className="bg-[#151515] border border-gray-800 rounded-3xl min-h-[400px]">
          {activeTab === 'my-leagues' && (
            <div className="p-8">
              {myLeagues.length === 0 ? (
                <div className="text-center py-20">
                  <Trophy className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Leagues Yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">You haven't secured a spot in any Draft Night Out leagues yet. Head over to the draft lobby to claim your seat!</p>
                  <a href="/dno" className="inline-block bg-[#1b75bb] hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-colors">
                    View Available Drafts
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myLeagues.map((league) => (
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
                      </div>
                      
                      <a 
                        href={`https://sleeper.com/leagues/${league.sleeper_id}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-widest text-xs py-3 rounded-xl transition-colors"
                      >
                        Go To Draft Room
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'share' && (
            <div className="animate-in fade-in duration-300">
              <GraphicTab />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}