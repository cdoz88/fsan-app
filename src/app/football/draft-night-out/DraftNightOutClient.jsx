"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import NapkinLeaderboard from '../../../components/NapkinLeaderboard';
import { Ticket, MonitorSmartphone, MapPin, Calendar, Lock, Loader2, CheckCircle2, AlertCircle, ExternalLink, Trophy, Shield, Users, Coins, UserCheck, BookOpen, Handshake, Mail, Medal, Gift } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function DraftNightOutClient({ proToolsMenu, connectMenu, initialLeaderboard }) {
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated';
  
  // DNO Live Sync States (Replaces Gravity Forms Logic)
  const [leagues, setLeagues] = useState([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [userJoinedCount, setUserJoinedCount] = useState(0);
  const [allottedEntries, setAllottedEntries] = useState(1);
  const [isProcessingEntry, setIsProcessingEntry] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Tab State & Styling
  const validTabs = ['live', 'online', 'leaderboard', 'prizes', 'rules', 'sponsors'];
  const [activeTab, setActiveTab] = useState('live');

  const activeTabStyle = "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500";
  const inactiveTabStyle = "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent";

  // Handle URL Hashes for direct linking
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

  // 🚀 Live Pull Open League Data from WordPress API
  useEffect(() => {
    const loadDnoPool = async () => {
      try {
        const res = await fetch('/api/scl?type=dno_pool');
        if (!res.ok) throw new Error("Could not reach DNO matrix");
        const data = await res.json();
        
        setLeagues(data.leagues || []);
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

  // 🚀 Process Entry Claim
  const handleClaimSpot = async (leagueId) => {
    setIsProcessingEntry(leagueId);
    setErrorMessage('');

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
    }
  };

  // 🚀 Trigger Stripe $20 Upsell Checkout for Extra Entry
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

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <main className="w-full animate-in fade-in duration-500">
            
            {/* HERO BANNER - RESTORED EXACTLY */}
            <div className="relative w-full h-[260px] md:h-[300px] flex items-end overflow-hidden rounded-2xl mb-10 shadow-2xl bg-gray-900">
              <div 
                className="absolute inset-0 opacity-80 z-0" 
                style={{ background: `linear-gradient(135deg, #e42d38 0%, #8a1a20 100%)` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/50 to-transparent z-0" />
              
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
              
              {/* TAB SWITCHER - RESTORED EXACTLY */}
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-2 mb-10 bg-[#151515] p-2 rounded-2xl border border-gray-800/50 w-fit mx-auto shadow-inner animate-in fade-in duration-500 delay-100">
                 <button 
                    onClick={() => handleTabClick('live')} 
                    className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'live' ? activeTabStyle : inactiveTabStyle}`}
                 >
                   <MapPin size={16} /> Live Events
                 </button>
                 <button 
                    onClick={() => handleTabClick('online')} 
                    className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'online' ? activeTabStyle : inactiveTabStyle}`}
                 >
                   <MonitorSmartphone size={16} /> Online
                 </button>
                 <button 
                    onClick={() => handleTabClick('leaderboard')} 
                    className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'leaderboard' ? activeTabStyle : inactiveTabStyle}`}
                 >
                   <ListOrdered size={16} /> Leaderboard
                 </button>
                 <button 
                    onClick={() => handleTabClick('prizes')} 
                    className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'prizes' ? activeTabStyle : inactiveTabStyle}`}
                 >
                   <Trophy size={16} /> Prizes
                 </button>
                 <button 
                    onClick={() => handleTabClick('rules')} 
                    className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'rules' ? activeTabStyle : inactiveTabStyle}`}
                 >
                   <BookOpen size={16} /> Rules
                 </button>
                 <button 
                    onClick={() => handleTabClick('sponsors')} 
                    className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'sponsors' ? activeTabStyle : inactiveTabStyle}`}
                 >
                   <Handshake size={16} /> Sponsor
                 </button>
              </div>

              {/* LIVE EVENTS TAB - RESTORED EXACTLY */}
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

              {/* ONLINE DIVISIONS TAB - NEW SLEEPER LOGIC */}
              {activeTab === 'online' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
                  <div className="flex items-center gap-6 mb-8">
                      <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Live Open War Rooms</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
                  </div>

                  {isAuthed && (
                    <div className="mb-8 flex flex-col sm:flex-row items-center justify-between bg-[#151515] border border-gray-800 p-4 px-6 rounded-2xl gap-4">
                      <div className="flex items-center gap-3">
                        <Users size={20} className="text-red-500" />
                        <div>
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Your Entry Ledger</p>
                          <p className="text-white text-sm font-bold">Used <span className="text-red-500">{userJoinedCount}</span> of your <span className="text-green-500">{allottedEntries}</span> allotted slots</p>
                        </div>
                      </div>
                      
                      {userJoinedCount >= allottedEntries ? (
                        <button onClick={handlePurchaseExtraEntry} className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5">
                          <Coins size={14} /> Buy Extra Entry (+$20)
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-green-950/40 text-green-500 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl border border-green-900 shadow-sm">
                          <UserCheck size={14} /> Ready to Draft
                        </div>
                      )}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-wider shadow-md">
                      <AlertCircle size={16} /> {errorMessage}
                    </div>
                  )}

                  <div className="relative w-full min-h-[300px]">
                    {!isAuthed && (
                        <div className="absolute inset-0 z-20 rounded-2xl bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border border-gray-800 shadow-2xl">
                            <Lock size={40} className="text-red-500 mb-4" />
                            <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-2">Membership Required</h4>
                            <p className="text-sm text-gray-300 mb-6 max-w-[280px] leading-relaxed">Log in or upgrade to Pro+ to browse and claim your live Sleeper roster slots.</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {leagues.map((league) => {
                          const openSpots = Math.max(0, league.total_spots - league.filled_spots);
                          const isFull = openSpots === 0;
                          const hasNoEntriesLeft = userJoinedCount >= allottedEntries;

                          return (
                            <div key={league.id} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden group">
                              <div>
                                <h4 className="text-lg font-black text-white uppercase tracking-wide italic mb-2 line-clamp-1">{league.name}</h4>
                                <div className="flex items-center justify-between bg-[#111] px-4 py-2.5 rounded-xl border border-gray-800 shadow-inner mb-4">
                                  <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Roster Fill Rate</span>
                                  <span className={`text-xs font-black ${isFull ? 'text-red-500' : 'text-green-500'}`}>{league.filled_spots} / {league.total_spots} Teams Filled</span>
                                </div>
                              </div>

                              <div className="mt-4">
                                {isFull ? (
                                  <button disabled className="w-full bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-xs py-3 rounded-xl border border-gray-700 cursor-not-allowed">League Full</button>
                                ) : hasNoEntriesLeft ? (
                                  <button onClick={handlePurchaseExtraEntry} className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"><Coins size={14} /> Buy Entry token to unlock</button>
                                ) : (
                                  <button 
                                    disabled={isProcessingEntry !== null}
                                    onClick={() => handleClaimSpot(league.id)}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                  >
                                    {isProcessingEntry === league.id ? <Loader2 size={14} className="animate-spin" /> : <>Claim Team ({openSpots} Open Spots Left)</>}
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

              {/* LEADERBOARD TAB - RESTORED EXACTLY */}
              {activeTab === 'leaderboard' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <NapkinLeaderboard initialLeaderboard={initialLeaderboard} />
                </div>
              )}

              {/* PRIZES TAB - RESTORED EXACTLY */}
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

              {/* RULES TAB - RESTORED EXACTLY */}
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

              {/* SPONSORS TAB - RESTORED EXACTLY */}
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