"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import NapkinLeaderboard from '../../../components/NapkinLeaderboard';
import { Ticket, MonitorSmartphone, MapPin, Calendar, Lock, Loader2, CheckCircle2, AlertCircle, ExternalLink, Trophy, Shield, Users, Coins, UserCheck, BookOpen, Handshake, Mail, Medal, Gift, ListOrdered, Clock, LogOut, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function DraftNightOutClient({ proToolsMenu, connectMenu, initialLeaderboard }) {
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated';
  const isProPlus = session?.user?.tier === 'pro-plus';
  
  // DNO Live Sync States
  const [leagues, setLeagues] = useState([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [userJoinedCount, setUserJoinedCount] = useState(0);
  const [allottedEntries, setAllottedEntries] = useState(1);
  const [isProcessingEntry, setIsProcessingEntry] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Confirmation Popup State
  const [confirmingLeague, setConfirmingLeague] = useState(null);

  // Dummy State to track joined test leagues for UI visualization
  const [joinedDummyLeagues, setJoinedDummyLeagues] = useState([]);

  // Tab State & Styling
  const validTabs = ['live', 'online', 'leaderboard', 'prizes', 'rules', 'sponsors'];
  const [activeTab, setActiveTab] = useState('live');

  const activeTabStyle = "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500";
  const inactiveTabStyle = "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent";

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState(null, '', `#${tabId}`);
  };

  useEffect(() => {
    const loadDnoPool = async () => {
      try {
        const res = await fetch('/api/scl?type=dno_pool');
        if (!res.ok) throw new Error("Could not reach DNO matrix");
        const data = await res.json();
        
        const dummyLeague1 = {
          id: 'dummy_test_league_1',
          name: 'FSAN Test War Room 1',
          total_spots: 12,
          filled_spots: 8
        };
        const dummyLeague2 = {
          id: 'dummy_test_league_2',
          name: 'FSAN Test War Room 2 (Full)',
          total_spots: 12,
          filled_spots: 12
        };

        setLeagues([dummyLeague1, dummyLeague2, ...(data.leagues || [])]);
        setUserJoinedCount(data.user_joined_count || 0);
        setAllottedEntries(data.allotted_entries || 1);
      } catch (err) {
        console.warn("Failed syncing live DNO array: ", err);
      } finally {
        setLoadingLeagues(false);
      }
    };

    if (isAuthed) {
      loadDnoPool();
    } else {
      setLoadingLeagues(false);
    }
  }, [isAuthed]);

  const handleClaimSpot = async (leagueId) => {
    setIsProcessingEntry(leagueId);
    setErrorMessage('');

    if (leagueId.includes('dummy_test_league')) {
      setTimeout(() => {
        setUserJoinedCount(prev => prev + 1);
        setJoinedDummyLeagues(prev => [...prev, leagueId]);
        window.open('https://sleeper.com/i/fsantestdummy', '_blank');
        setIsProcessingEntry(null);
        setConfirmingLeague(null);
      }, 1000);
      return;
    }

    try {
      const res = await fetch('/api/scl/claim-spot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId })
      });
      const data = await res.json();

      if (data.success && data.invite_link) {
        setUserJoinedCount(prev => prev + 1);
        window.open(data.invite_link, '_blank');
      } else {
        setErrorMessage(data.message || 'Could not claim roster spot. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Network error processing registration.');
    } finally {
      setIsProcessingEntry(null);
      setConfirmingLeague(null);
    }
  };

  const handlePurchaseExtraEntry = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_dno_additional_entry_20' })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setErrorMessage('Could not initiate additional entry purchase window.');
    }
  };

  const ticketsAvailable = Math.max(0, allottedEntries - userJoinedCount);

  // Sort leagues so open ones appear first
  const sortedLeagues = [...leagues].sort((a, b) => {
    const isFullA = a.filled_spots >= a.total_spots;
    const isFullB = b.filled_spots >= b.total_spots;
    if (isFullA === isFullB) return 0;
    return isFullA ? 1 : -1;
  });

  return (
    <>
      <Header activeSport="Football" />
      
      {/* CONFIRMATION MODAL */}
      {confirmingLeague && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-gray-800 rounded-3xl max-w-md w-full shadow-2xl relative flex flex-col">
            
            <button 
              onClick={() => setConfirmingLeague(null)} 
              disabled={isProcessingEntry !== null}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#111] hover:bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors z-10"
              aria-label="Close Modal"
            >
              <X size={18} />
            </button>

            <div className="p-6 md:p-8 text-center pt-12">
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight italic mb-3">Ready to Draft?</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                You are about to use <strong className="text-white">1 draft ticket</strong> to claim a team in:
              </p>
              
              <div className="mb-6 text-center">
                <span className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">{confirmingLeague.name}</span>
              </div>
            </div>
            
            <div className="px-6 md:px-8 pb-3">
              <button 
                onClick={() => handleClaimSpot(confirmingLeague.id)}
                disabled={isProcessingEntry !== null}
                className="w-full relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(220,38,38,0.15)] transition-transform hover:-translate-y-0.5"
              >
                <div className="bg-[#151515] hover:bg-[#1a1a1a] transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center gap-2 w-full h-full">
                  {isProcessingEntry === confirmingLeague.id ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <span className="font-black uppercase tracking-widest text-xs text-white">Join and Draft</span>
                  )}
                </div>
              </button>
            </div>

            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-3">
              <div className="flex items-start gap-3 bg-[#111] border border-gray-800 p-4 rounded-xl">
                <AlertCircle size={16} className="text-gray-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                  Please note: This action is final. Entry tickets cannot be refunded or transferred once you have joined a draft room.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24 relative z-10">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <main className="w-full animate-in fade-in duration-500">
            
            {/* HERO BANNER - REDESIGNED WITH IMAGES */}
            <div className="relative w-full h-[260px] md:h-[300px] flex items-end overflow-hidden rounded-2xl mb-10 shadow-2xl bg-[#0a0a0a]">
              
              {/* Main Background Image */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60" 
                style={{ backgroundImage: `url('https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Background.webp')` }} 
              />
              
              {/* Large Faded Right-Aligned Logo */}
              <img 
                src="https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp"
                alt="Draft Night Out Logo"
                className="absolute -right-10 md:right-4 top-1/2 -translate-y-1/2 w-[280px] md:w-[380px] h-auto object-contain opacity-20 md:opacity-40 z-0 pointer-events-none mix-blend-plus-lighter drop-shadow-2xl"
              />

              {/* Gradients to keep text readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/90 via-[#121212]/50 to-transparent z-0 md:w-2/3" />
              
              <div className="relative z-10 w-full flex flex-col items-start justify-end h-full px-6 md:px-10 pb-8">
                <span className="inline-block py-1 px-3 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase tracking-widest mb-3 backdrop-blur-sm">
                  The Biggest Fantasy Hang of the Year
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
                  Draft Night Out
                </h1>
                <p className="text-gray-300 font-medium md:text-lg leading-relaxed drop-shadow-md max-w-2xl">
                  Secure your seat at one of our live Draft Night Out events, or build your championship roster from home in our exclusive online divisions. Dominate your league to win incredible prizes and compete for the ultimate Playoff Challenge championship!
                </p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-2 mb-10 bg-[#151515] p-2 rounded-2xl border border-gray-800/50 w-fit mx-auto shadow-inner animate-in fade-in duration-500 delay-100">
                 <button onClick={() => handleTabClick('live')} className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'live' ? activeTabStyle : inactiveTabStyle}`}><MapPin size={16} /> Live Events</button>
                 <button onClick={() => handleTabClick('online')} className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'online' ? activeTabStyle : inactiveTabStyle}`}><MonitorSmartphone size={16} /> Online</button>
                 <button onClick={() => handleTabClick('leaderboard')} className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'leaderboard' ? activeTabStyle : inactiveTabStyle}`}><ListOrdered size={16} /> Leaderboard</button>
                 <button onClick={() => handleTabClick('prizes')} className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'prizes' ? activeTabStyle : inactiveTabStyle}`}><Trophy size={16} /> Prizes</button>
                 <button onClick={() => handleTabClick('rules')} className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'rules' ? activeTabStyle : inactiveTabStyle}`}><BookOpen size={16} /> Rules</button>
                 <button onClick={() => handleTabClick('sponsors')} className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'sponsors' ? activeTabStyle : inactiveTabStyle}`}><Handshake size={16} /> Sponsor</button>
              </div>

              {/* LIVE EVENTS TAB */}
              {activeTab === 'live' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
                  <div className="flex items-center gap-6 mb-8">
                      <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Choose Your City</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 p-6 flex flex-col relative overflow-hidden group shadow-lg">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                      
                      <div className="flex items-center gap-4 w-full mb-6 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shrink-0 shadow-lg">
                          <MapPin className="text-white" size={28} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-wide leading-tight italic">Canton, OH</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Fantasy Football Expo</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 leading-relaxed mb-6 relative z-10">
                        Secure your spot to draft in person. You will be able to select your specific division (named after NFL legends) during checkout.
                      </p>

                      <div className="bg-[#111] rounded-2xl border border-gray-800 p-4 mb-6 grid grid-cols-2 gap-4 relative z-10">
                          <div>
                            <div className="flex items-center gap-2 mb-1"><Calendar size={14} className="text-red-500"/><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</span></div>
                            <p className="text-xs text-gray-200">July 25, 2026</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1"><Clock size={14} className="text-red-500"/><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</span></div>
                            <p className="text-xs text-gray-200">12pm - 4pm ET</p>
                          </div>
                          <div className="col-span-2 border-t border-gray-800 pt-3 mt-1">
                            <div className="flex items-center gap-2 mb-1"><MapPin size={14} className="text-red-500"/><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Where</span></div>
                            <p className="text-[11px] text-gray-400 leading-snug">Jerzee's Sports Grille<br/>5260 Dressler Rd NW, Canton, OH 44718</p>
                          </div>
                      </div>
                      
                      <div className="mt-auto relative z-10">
                        <a href="https://in-betweenmedia.com/product/draft-night-out-2026-tickets/" target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-center">
                          Get Canton Tickets <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-red-900/10 border border-red-900/30 rounded-xl p-4 flex items-start gap-3">
                    <Ticket size={20} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Live Event Note</h5>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        These are private events featuring exclusive raffles and giveaways! All attendees must have a ticket (Draft or "Just To Hang" covers available).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ONLINE DIVISIONS TAB */}
              {activeTab === 'online' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
                  <div className="flex items-center gap-6 mb-8">
                      <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Online Drafts</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
                  </div>

                  <div className="mb-8 p-[2px] rounded-2xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-[#151515] p-5 px-6 rounded-[14px] gap-4 w-full h-full">
                      {isProPlus ? (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center shrink-0 border border-red-500/30">
                              <Ticket size={20} className="text-red-500" />
                            </div>
                            <h3 className="text-white text-lg md:text-xl font-black uppercase tracking-wide italic text-center sm:text-left">
                              You have <span className="text-red-500">{ticketsAvailable}</span> online draft ticket{ticketsAvailable !== 1 ? 's' : ''} available
                            </h3>
                          </div>
                          <button onClick={handlePurchaseExtraEntry} className="shrink-0 w-full sm:w-auto bg-[#222] hover:bg-[#2a2a2a] text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5 border border-gray-700">
                            <Ticket size={16} /> Buy More Tickets
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                              <Lock size={20} className="text-gray-400" />
                            </div>
                            <h3 className="text-white text-lg md:text-xl font-black uppercase tracking-wide italic text-center sm:text-left">
                              A Pro+ account is required to enter Draft Night Out
                            </h3>
                          </div>
                          <Link href="/subscribe" className="shrink-0 w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                            Upgrade
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-wider shadow-md">
                      <AlertCircle size={16} /> {errorMessage}
                    </div>
                  )}

                  <div className="relative w-full min-h-[300px]">
                    {!isProPlus && (
                        <div className="absolute inset-0 z-20 rounded-2xl bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border border-gray-800 shadow-2xl">
                            <Lock size={40} className="text-red-500 mb-4" />
                            <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-2">Pro+ Required</h4>
                            <p className="text-sm text-gray-300 mb-6 max-w-[280px] leading-relaxed">Upgrade to Pro+ to browse and claim your live Sleeper roster slots.</p>
                            <Link href="/subscribe" className="bg-gradient-to-r from-[#e42d38] to-[#8a1a20] text-white text-sm font-black uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">Upgrade to Pro+</Link>
                        </div>
                    )}

                    {loadingLeagues ? (
                      <div className="w-full flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
                        <Loader2 size={32} className="animate-spin text-red-500" /> 
                        <span className="text-xs font-bold uppercase tracking-widest">Querying Sleeper API Matrix...</span>
                      </div>
                    ) : leagues.length === 0 ? (
                      <div className="w-full bg-[#151515] rounded-2xl p-12 text-center border border-gray-800 text-gray-500 text-sm font-bold uppercase tracking-widest">No active divisions found in database. Check back soon!</div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {sortedLeagues.map((league) => {
                          const openSpots = Math.max(0, league.total_spots - league.filled_spots);
                          const isFull = openSpots === 0;
                          const hasNoEntriesLeft = ticketsAvailable === 0;
                          
                          const isJoinedLocal = joinedDummyLeagues.includes(league.id);

                          return (
                            <div key={league.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md relative overflow-hidden group">
                              
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h4 className="text-lg font-black text-white uppercase tracking-wide italic mb-1 line-clamp-1">{league.name}</h4>
                                <span className={`text-xs font-black uppercase tracking-wider ${isFull && !isJoinedLocal ? 'text-red-500' : 'text-green-500'}`}>
                                  {league.filled_spots} / {league.total_spots} Teams Filled
                                </span>
                              </div>

                              <div className="shrink-0 w-full sm:w-auto">
                                {isJoinedLocal ? (
                                  <a 
                                    href="https://sleeper.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-6 bg-transparent hover:bg-gray-800 text-green-500 font-black uppercase tracking-widest text-xs py-3 rounded-xl border border-green-900/50 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <ExternalLink size={14} /> Go to League
                                  </a>
                                ) : isFull ? (
                                  <button disabled className="w-full sm:w-auto px-6 bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-xs py-3 rounded-xl border border-gray-700 cursor-not-allowed">League Full</button>
                                ) : hasNoEntriesLeft ? (
                                  <button onClick={handlePurchaseExtraEntry} className="w-full sm:w-auto px-6 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"><Coins size={14} /> Buy Ticket</button>
                                ) : (
                                  <button 
                                    onClick={() => setConfirmingLeague(league)}
                                    className="w-full sm:w-auto px-6 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                  >
                                    Join League
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LEADERBOARD TAB */}
              {activeTab === 'leaderboard' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <NapkinLeaderboard initialLeaderboard={initialLeaderboard} />
                </div>
              )}

              {/* PRIZES TAB */}
              {activeTab === 'prizes' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
                  <div className="flex items-center gap-6 mb-8">
                     <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">What's on the Line?</h2>
                     <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                       <Medal className="text-gray-400 mb-4" size={40} />
                       <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">League Winners</h4>
                       <p className="text-sm text-gray-400 leading-relaxed">Championship plaque provided by <strong className="text-white">Dynasty Decks</strong>.</p>
                     </div>

                     <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                       <Gift className="text-green-500 mb-4" size={40} />
                       <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Overall Regular Season Champ</h4>
                       <p className="text-sm text-gray-400 leading-relaxed">A <strong className="text-green-400">$75 Gift Card</strong> to the official FSAN Shop.</p>
                     </div>

                     <div className="bg-gradient-to-b from-[#1a0f0f] to-[#111] p-8 rounded-3xl border border-red-500/30 flex flex-col items-center text-center shadow-[0_0_30px_rgba(220,38,38,0.15)] hover:-translate-y-1 transition-transform relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-2xl rounded-full"></div>
                       <Trophy className="text-yellow-500 mb-4 relative z-10" size={40} />
                       <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2 relative z-10">Playoff Champion</h4>
                       <p className="text-sm text-gray-300 leading-relaxed relative z-10">Championship plaque by <strong className="text-white">Dynasty Decks</strong> & Champ Chain by <strong className="text-white">TrophySmack</strong>!</p>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#1b1010] to-[#111] rounded-3xl border border-red-900/30 p-8 md:p-12 mb-12 shadow-[0_0_40px_rgba(220,38,38,0.1)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="absolute -right-4 -top-4 text-[120px] md:text-[180px] font-black text-red-900/10 z-0 select-none transition-colors leading-none pointer-events-none">🏆</div>
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(220,38,38,0.4)] border-4 border-[#111] relative z-10">
                      <Shield size={48} className="text-white drop-shadow-md" />
                    </div>
                    <div className="flex-1 text-center md:text-left relative z-10">
                      <div className="inline-block px-3 py-1 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-full mb-3 shadow-md">New in 2026!</div>
                      <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">
                        The Playoff Challenge
                      </h2>
                      <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                        We are hosting a massive playoff challenge for <strong>all league winners</strong> from the regular season. Qualify for the playoffs to compete for the ultimate prize package and prove you are the undisputed champion!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* RULES TAB */}
              {activeTab === 'rules' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
                  <section className="bg-[#1a1a1a] rounded-3xl p-8 md:p-10 border border-gray-800 shadow-xl mb-16">
                     <h2 className="text-3xl font-black italic text-white mb-8">OFFICIAL LEAGUE RULES</h2>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
                           <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">The Golden Rules</h3>
                           <ul className="space-y-4 text-sm text-gray-400 font-medium">
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">1.</span> Be Cool.</li>
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">2.</span> Must be over 18 to play.</li>
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">3.</span> No Colluding.</li>
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">4.</span> Max 5 Teams per Owner.</li>
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">5.</span> Max 1 Team per League.</li>
                           </ul>
                        </div>

                        <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
                           <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">Draft Settings</h3>
                           <ul className="space-y-4 text-sm text-gray-400 font-medium">
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">•</span> Hosted on Sleeper App</li>
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">•</span> 12 Teams Per League</li>
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">•</span> Randomized Pick Order</li>
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">•</span> Slow Draft, Snake format</li>
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">•</span> 8 Hour Pick Clock (Off 12p-10a ET)</li>
                             <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">•</span> Draft starts once league fills</li>
                           </ul>
                        </div>

                        <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
                           <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">Scoring & Format</h3>
                           <ul className="space-y-4 text-sm text-gray-400 font-medium">
                             <li className="flex gap-3 items-start"><span className="text-red-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">PPR PPFD "Big Plays"</span></li>
                             <li className="flex gap-3 items-start"><span className="text-red-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Start: 1QB 2RB 3WR 1TE 1FLEX 1DST</span></li>
                             <li className="flex gap-3 items-start"><span className="text-red-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Bench: 5 Players (Plus 1 IR)</span></li>
                             <li className="flex gap-3 items-start"><span className="text-red-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Playoffs: Top 4 advance in Wk 15</span></li>
                             <li className="flex gap-3 items-start"><span className="text-red-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Two-Week Championship (Wks 16 & 17)</span></li>
                             <li className="flex gap-3 items-start"><span className="text-red-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Winner: Most points among league champs</span></li>
                           </ul>
                        </div>

                     </div>
                  </section>
                </div>
              )}

              {/* SPONSORS TAB */}
              {activeTab === 'sponsors' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
                  <div className="flex items-center gap-6 mb-8">
                     <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Partner With Us</h2>
                     <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 p-8 md:p-10 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    
                    <div className="max-w-3xl relative z-10">
                      <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-4">Become a Sponsor</h3>
                      <p className="text-gray-300 leading-relaxed mb-8">
                        We are always looking to collaborate with brands and individuals who want to make Draft Night Out the ultimate fantasy football experience. Whether you're interested in location hosting, providing prize giveaways, donating raffle items, or exploring other partnership opportunities, we'd love to hear from you!
                      </p>
                      
                      <a href="mailto:info@fsannetwork.com" className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all hover:-translate-y-0.5">
                        <Mail size={16} /> Contact Us About Sponsorships
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </>
  );
}