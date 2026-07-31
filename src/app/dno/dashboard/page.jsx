"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Ticket, ShieldCheck, Share2, Trophy, ExternalLink, Loader2, Link2, Check, RefreshCw, Gift } from 'lucide-react';

// Importing DNO components
import DNOHeader from '../../../components/dno/DNOHeader';
import GraphicTab from '../../../components/dno/tabs/GraphicTab';

function DashboardContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get('tab') || 'my-leagues';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [ticketCount, setTicketCount] = useState(0);
  const [myLeagues, setMyLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sleeper Sync State
  const [sleeperUsernameInput, setSleeperUsernameInput] = useState('');
  const [syncedSleeperUser, setSyncedSleeperUser] = useState(null); // { sleeper_id, sleeper_username }
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Set Page Title & Force Favicon Swap
  useEffect(() => {
    document.title = "Locker Room | Draft Night Out";
    
    const dnoFaviconUrl = "https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp?v=dno2026";
    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    
    if (existingIcons.length > 0) {
      existingIcons.forEach(icon => {
        icon.href = dnoFaviconUrl;
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = dnoFaviconUrl;
      document.head.appendChild(link);
    }
  }, []);

  // Sync tab state if URL parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Handle Tab Click and update URL parameter
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tabId);
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  const loadAccountData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      // 1. Fetch user data (includes tickets & sleeper_id/sleeper_username)
      const uRes = await fetch(`/api/user?id=${session.user.id}`);
      const uData = await uRes.json();
      
      setTicketCount(uData.dno_tickets || 0);

      if (uData.sleeper_id) {
        setSyncedSleeperUser({
          sleeper_id: uData.sleeper_id,
          sleeper_username: uData.sleeper_username || uData.sleeper_id
        });
        setSleeperUsernameInput(uData.sleeper_username || uData.sleeper_id);
      }

      // 2. Fetch DNO pool to filter user's joined leagues
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

  // Handle Sleeper Account Sync
  const handleSyncSleeper = async (e) => {
    e.preventDefault();
    if (!sleeperUsernameInput.trim() || !session?.user?.id) return;

    setIsSyncing(true);
    setSyncError('');
    setSyncSuccess(false);

    try {
      // Step A: Verify username exists on Sleeper via official public API
      const sleeperRes = await fetch(`https://api.sleeper.app/v1/user/${sleeperUsernameInput.trim()}`);
      if (!sleeperRes.ok) {
        throw new Error("Sleeper user not found");
      }
      const sleeperData = await sleeperRes.json();
      
      if (!sleeperData || !sleeperData.user_id) {
        throw new Error("Invalid Sleeper username");
      }

      // Step B: Save Sleeper ID & Username to our user database
      const saveRes = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_sleeper',
          userId: session.user.id,
          sleeper_id: sleeperData.user_id,
          sleeper_username: sleeperData.username || sleeperUsernameInput.trim()
        })
      });

      if (!saveRes.ok) {
        throw new Error("Failed saving Sleeper connection to database");
      }

      setSyncedSleeperUser({
        sleeper_id: sleeperData.user_id,
        sleeper_username: sleeperData.username || sleeperUsernameInput.trim()
      });

      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
      
      // Reload account data to update leagues immediately
      loadAccountData();

    } catch (err) {
      console.error("Sleeper Sync Error:", err);
      setSyncError(err.message || "Unable to sync Sleeper account.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1b75bb] animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-28 pb-24 z-10 relative">
      
      {/* Welcome Banner */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
          Welcome to the Locker Room, <span className="text-[#1b75bb]">{session?.user?.name || 'Manager'}</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Ticket Balance Card */}
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

          {/* Universal Sleeper Account Sync Card */}
          <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#1b75bb] font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <Link2 size={14} /> Universal Sleeper Sync
              </p>
              {syncedSleeperUser && (
                <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 flex items-center gap-1">
                  <Check size={12} /> Connected
                </span>
              )}
            </div>

            <form onSubmit={handleSyncSleeper} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Enter Sleeper Username"
                  value={sleeperUsernameInput}
                  onChange={(e) => setSleeperUsernameInput(e.target.value)}
                  className="flex-1 bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#1b75bb] transition-colors"
                />
                <button 
                  type="submit"
                  disabled={isSyncing}
                  className="px-5 py-2.5 bg-[#1b75bb] hover:bg-teal-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
                >
                  {isSyncing ? <Loader2 size={14} className="animate-spin" /> : syncedSleeperUser ? 'Update' : 'Sync'}
                </button>
              </div>

              {syncError && (
                <p className="text-red-400 text-[11px] font-bold uppercase tracking-wider">{syncError}</p>
              )}
              {syncSuccess && (
                <p className="text-teal-400 text-[11px] font-bold uppercase tracking-wider">Sleeper account successfully synced!</p>
              )}
              {!syncError && !syncSuccess && (
                <p className="text-gray-500 text-[11px]">Syncing connects your DNO leagues and roster graphics automatically.</p>
              )}
            </form>
          </div>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-px overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => handleTabClick('my-leagues')}
          className={`pb-4 px-2 font-black uppercase tracking-widest text-xs transition-colors whitespace-nowrap relative ${activeTab === 'my-leagues' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <div className="flex items-center gap-2"><Trophy size={16} /> My Leagues</div>
          {activeTab === 'my-leagues' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 to-[#1b75bb] rounded-t-full"></div>}
        </button>

        <button 
          onClick={() => handleTabClick('share')}
          className={`pb-4 px-2 font-black uppercase tracking-widest text-xs transition-colors whitespace-nowrap relative ${activeTab === 'share' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <div className="flex items-center gap-2"><Share2 size={16} /> Share Roster</div>
          {activeTab === 'share' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 to-[#1b75bb] rounded-t-full"></div>}
        </button>

        <button 
          onClick={() => handleTabClick('perks')}
          className={`pb-4 px-2 font-black uppercase tracking-widest text-xs transition-colors whitespace-nowrap relative ${activeTab === 'perks' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <div className="flex items-center gap-2"><Gift size={16} /> Perks</div>
          {activeTab === 'perks' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-400 to-[#1b75bb] rounded-t-full"></div>}
        </button>
      </div>

      {/* Dynamic Tab Content */}
      <div className="bg-[#151515] border border-gray-800 rounded-3xl min-h-[400px]">
        
        {/* TAB 1: MY LEAGUES */}
        {activeTab === 'my-leagues' && (
          <div className="p-8">
            {!syncedSleeperUser ? (
              <div className="text-center py-20">
                <Link2 className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Sync Your Sleeper Account</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">Enter your Sleeper username in the card above to automatically pull and display your Draft Night Out leagues here!</p>
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

        {/* TAB 2: SHARE ROSTER */}
        {activeTab === 'share' && (
          <div className="animate-in fade-in duration-300">
            <GraphicTab />
          </div>
        )}

        {/* TAB 3: PERKS */}
        {activeTab === 'perks' && (
          <div className="p-8 animate-in fade-in duration-300">
            <div className="max-w-xl mx-auto bg-gradient-to-br from-[#111] to-[#151515] border border-[#1b75bb]/40 rounded-3xl p-8 shadow-[0_0_30px_rgba(27,117,187,0.15)] text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-[#1b75bb]/10 border border-[#1b75bb]/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldCheck className="w-8 h-8 text-[#1b75bb]" />
              </div>
              
              <span className="text-[#1b75bb] font-bold uppercase tracking-widest text-xs mb-2 block">
                Exclusive DNO Perk
              </span>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-3">
                1 Free Year of FSAN Pro
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                As a Draft Night Out participant, your entry includes 12 full months of access to FSAN’s premium rankings, trade calculator, trade value charts, and real-time draft advice.
              </p>

              <a 
                href="https://fsan.com/subscribe" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 bg-[#1b75bb] hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all shadow-lg hover:scale-105"
              >
                Claim Subscription <ExternalLink size={16} />
              </a>
            </div>
          </div>
        )}

      </div>

    </main>
  );
}

export default function DNODashboard() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans selection:bg-[#1b75bb] selection:text-white relative">
      <DNOHeader onOpenAuthModal={() => {}} />
      <Suspense fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#1b75bb] animate-spin" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}