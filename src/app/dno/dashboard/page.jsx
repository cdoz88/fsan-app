"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Ticket, ShieldCheck, Share2, Trophy, ExternalLink, Loader2, Link2, CheckCircle2, Gift, Edit3, X } from 'lucide-react';

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

  // Dedicated DNO Sleeper Sync State
  const [sleeperInput, setSleeperInput] = useState('');
  const [livePreviewUser, setLivePreviewUser] = useState(null); 
  const [syncedSleeperUser, setSyncedSleeperUser] = useState(null); 
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [isEditingSync, setIsEditingSync] = useState(false);

  // Dedicated storage key for DNO-only local caching
  const getDnoStorageKey = (userId) => `dno_dedicated_sleeper_${userId}`;

  // Set Page Title & Force Favicon Swap
  useEffect(() => {
    document.title = "Locker Room | Draft Night Out";
    
    const dnoFaviconUrl = "/images/dno/DNO-Logo_Logo.webp?v=dno2026";
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

  // Restore DNO-specific Sleeper sync from local cache on initial render
  useEffect(() => {
    if (session?.user?.id) {
      const cached = localStorage.getItem(getDnoStorageKey(session.user.id));
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.sleeper_id || parsed.sleeper_username)) {
            setSyncedSleeperUser(parsed);
            setSleeperInput(parsed.sleeper_username || parsed.displayName || '');
          }
        } catch (e) {
          console.warn("Failed reading cached DNO Sleeper user:", e);
        }
      }
    }
  }, [session]);

  // Sync tab state if URL parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tabId);
    router.push(`?${newParams.toString()}`, { scroll: false });
  };

  // Helper to fetch Sleeper display details given a Sleeper User ID or Username
  const hydrateSleeperUser = async (identifier) => {
    try {
      const slpRes = await fetch(`https://api.sleeper.app/v1/user/${identifier}`);
      if (slpRes.ok) {
        const slpData = await slpRes.json();
        const userObj = {
          sleeper_id: slpData.user_id,
          sleeper_username: slpData.username || slpData.display_name,
          displayName: slpData.display_name,
          avatar: slpData.avatar
        };
        setSyncedSleeperUser(userObj);
        setSleeperInput(userObj.sleeper_username);
        if (session?.user?.id) {
          localStorage.setItem(getDnoStorageKey(session.user.id), JSON.stringify(userObj));
        }
        return userObj;
      }
    } catch (e) {
      console.warn("Could not hydrate Sleeper details:", e);
    }
    return null;
  };

  // Load User Data & Joined DNO Leagues via Dedicated DNO Endpoints
  const loadAccountData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      let dnoSleeperId = null;

      // Fetch DNO user metadata (dno_tickets, dno_sleeper_id) from /api/scl
      try {
        const uRes = await fetch(`/api/scl?action=dno_get_user_data&user_id=${session.user.id}&t=${Date.now()}`);
        if (uRes.ok) {
          const uData = await uRes.json();
          setTicketCount(uData.dno_tickets || 0);
          dnoSleeperId = uData.dno_sleeper_id || uData.dno_sleeper_user_id || null;
          
          if (dnoSleeperId) {
            await hydrateSleeperUser(dnoSleeperId);
          }
        }
      } catch (e) {
        console.warn("DNO User data fetch warning", e);
      }

      // Fetch DNO Pool to highlight joined leagues for this DNO Sleeper ID
      const activeId = dnoSleeperId || syncedSleeperUser?.sleeper_id;
      const pRes = await fetch(`/api/scl?type=dno_pool&t=${Date.now()}`);
      if (pRes.ok) {
        try {
          const pData = await pRes.json();
          const myJoinedLeagues = (pData.leagues || []).filter(league => {
             if (!activeId) return false;
             return league.members?.some(m => m.user_id === activeId);
          });
          setMyLeagues(myJoinedLeagues);
        } catch (e) {
          console.warn("DNO Pool API parsing warning", e);
        }
      }
    } catch (err) {
      console.error("Failed loading account data", err);
    } finally {
      setIsLoading(false);
    }
  }, [session, syncedSleeperUser]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadAccountData();
    } else if (status === 'unauthenticated') {
      window.location.href = '/dno'; 
    }
  }, [status, loadAccountData]);

  // Debounced Live Search against Sleeper API
  useEffect(() => {
    if (!sleeperInput || sleeperInput.trim().length < 3 || (syncedSleeperUser && !isEditingSync)) {
      setLivePreviewUser(null);
      setSyncError('');
      return;
    }

    setIsSearching(true);
    setSyncError('');

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.sleeper.app/v1/user/${sleeperInput.trim()}`);
        if (!res.ok) throw new Error("Sleeper account not found");
        const data = await res.json();
        
        if (!data || !data.user_id) throw new Error("Sleeper account not found");

        setLivePreviewUser({
          user_id: data.user_id,
          username: data.username || data.display_name,
          displayName: data.display_name,
          avatar: data.avatar
        });
      } catch (err) {
        setLivePreviewUser(null);
        setSyncError("Username not found on Sleeper");
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [sleeperInput, syncedSleeperUser, isEditingSync]);

  // Save Dedicated DNO Sleeper Connection to WordPress & Local Storage
  const handleConfirmSync = async (userToSync) => {
    if (!userToSync || !session?.user?.id) return;
    setIsSaving(true);
    setSyncError('');

    const sleeperIdToSave = userToSync.user_id || userToSync.sleeper_id;
    const sleeperUsernameToSave = userToSync.username || userToSync.sleeper_username;

    try {
      // Save specifically to DNO metadata field on WordPress
      const saveRes = await fetch('/api/scl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dno_update_sleeper',
          user_id: session.user.id,
          dno_sleeper_id: sleeperIdToSave,
          dno_sleeper_username: sleeperUsernameToSave
        })
      });

      if (!saveRes.ok) throw new Error("Failed saving DNO Sleeper connection");

      const finalUser = {
        sleeper_id: sleeperIdToSave,
        sleeper_username: sleeperUsernameToSave,
        displayName: userToSync.displayName || userToSync.display_name,
        avatar: userToSync.avatar
      };

      setSyncedSleeperUser(finalUser);
      localStorage.setItem(getDnoStorageKey(session.user.id), JSON.stringify(finalUser));
      setLivePreviewUser(null);
      setIsEditingSync(false);

      loadAccountData();
    } catch (err) {
      console.warn("Server save warning, applying locally:", err);
      const finalUser = {
        sleeper_id: sleeperIdToSave,
        sleeper_username: sleeperUsernameToSave,
        displayName: userToSync.displayName || userToSync.display_name,
        avatar: userToSync.avatar
      };
      setSyncedSleeperUser(finalUser);
      localStorage.setItem(getDnoStorageKey(session.user.id), JSON.stringify(finalUser));
      setIsEditingSync(false);
    } finally {
      setIsSaving(false);
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
          <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-lg relative overflow-hidden min-h-[160px]">
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

          {/* Connect Sleeper Account Card */}
          <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden min-h-[160px]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#1b75bb] font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <Link2 size={14} /> Connect Sleeper Account
              </p>
              {syncedSleeperUser && !isEditingSync && (
                <button 
                  onClick={() => { setIsEditingSync(true); setLivePreviewUser(null); }}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Edit3 size={12} /> Change
                </button>
              )}
            </div>

            {/* LOCKED SYNCED USER DISPLAY */}
            {syncedSleeperUser && !isEditingSync ? (
              <div className="flex items-center justify-between bg-[#111] border border-gray-800 rounded-2xl p-3.5 mt-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-zinc-900 border-2 border-[#1b75bb] overflow-hidden shrink-0 shadow-md">
                    <img 
                      src={syncedSleeperUser.avatar ? `https://sleepercdn.com/avatars/thumbs/${syncedSleeperUser.avatar}` : 'https://sleepercdn.com/images/v2/icons/player_default.webp'} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-black text-sm uppercase tracking-tight truncate">
                      {syncedSleeperUser.displayName || syncedSleeperUser.sleeper_username}
                    </h4>
                    <p className="text-[11px] font-bold text-gray-500 tracking-wider">@{syncedSleeperUser.sleeper_username}</p>
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 size={13} className="text-emerald-400" /> Connected
                </span>
              </div>
            ) : (
              /* DYNAMIC INPUT & LIVE PREVIEW SEARCH */
              <div className="flex flex-col gap-2 mt-1">
                <div className="relative flex items-center gap-2">
                  <input 
                    type="text"
                    placeholder="Enter Sleeper Username..."
                    value={sleeperInput}
                    onChange={(e) => setSleeperInput(e.target.value)}
                    className="w-full bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:border-[#1b75bb] transition-colors"
                  />
                  {isSearching && (
                    <Loader2 size={16} className="absolute right-3 text-gray-400 animate-spin" />
                  )}
                  {isEditingSync && (
                    <button 
                      onClick={() => setIsEditingSync(false)}
                      className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {syncError && (
                  <p className="text-red-400 text-[11px] font-bold uppercase tracking-wider px-1">{syncError}</p>
                )}

                {/* LIVE FOUND USER CARD */}
                {livePreviewUser && (
                  <div className="flex items-center justify-between bg-[#111] border border-[#1b75bb]/50 rounded-xl p-3 mt-1 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#1b75bb] overflow-hidden shrink-0">
                        <img 
                          src={livePreviewUser.avatar ? `https://sleepercdn.com/avatars/thumbs/${livePreviewUser.avatar}` : 'https://sleepercdn.com/images/v2/icons/player_default.webp'} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-black text-xs uppercase truncate">{livePreviewUser.displayName}</p>
                        <p className="text-[10px] text-gray-400">@{livePreviewUser.username}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleConfirmSync(livePreviewUser)}
                      disabled={isSaving}
                      className="bg-[#1b75bb] hover:bg-teal-500 text-white font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      {isSaving ? <Loader2 size={12} className="animate-spin" /> : 'Sync & Lock'}
                    </button>
                  </div>
                )}
              </div>
            )}
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
                <h3 className="text-xl font-bold text-white mb-2">Connect Sleeper Account</h3>
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
          <GraphicTab syncedSleeperUser={syncedSleeperUser} />
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