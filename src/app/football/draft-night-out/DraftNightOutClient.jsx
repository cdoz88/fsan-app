"use client";
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import NapkinLeaderboard from '../../../components/NapkinLeaderboard';
import { Ticket, MonitorSmartphone, MapPin, Calendar, Lock, Loader2, CheckCircle2, AlertCircle, ExternalLink, Trophy, Shield, Users, Coins, UserCheck, BookOpen, Handshake, Mail, Medal, Gift, ListOrdered, Clock, LogOut, X, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';

// 🚀 CUSTOM YOUTUBE ICON (Lucide removed brand icons)
const Youtube = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 7.1C2.6 5.8 3.8 4.8 5 4.7 7.3 4.5 12 4.5 12 4.5s4.7 0 7 .2c1.2.1 2.4 1.1 2.5 2.4.2 1.6.2 3.8.2 4.9 0 1.1 0 3.3-.2 4.9-.1 1.3-1.3 2.3-2.5 2.4-2.3.2-7 .2-7 .2s-4.7 0-7-.2c-1.2-.1-2.4-1.1-2.5-2.4-.2-1.6-.2-3.8-.2-4.9 0-1.1 0-3.3.2-4.9z" />
    <path d="m10 15 5-3-5-3v6z" />
  </svg>
);

// 🚀 ISOLATED SUCCESS TOAST COMPONENT
function SuccessToast({ setActiveTab, loadDnoPool, isAuthed }) {
  const searchParams = useSearchParams();
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (searchParams?.get('checkout') === 'success') {
      setShowSuccessToast(true);
      
      // 1. Force the user to the Online tab where their tickets are
      setActiveTab('online');
      
      // 2. Instantly wipe the ?checkout=success parameter from the browser so it never gets stuck
      window.history.replaceState(null, '', window.location.pathname + '#online');
      
      // Webhook takes a moment to process. Fetch updated ticket counts at 3s and 7s marks.
      setTimeout(() => {
         if (isAuthed) loadDnoPool();
      }, 3000);
      
      setTimeout(() => {
         if (isAuthed) loadDnoPool();
      }, 7000);
    }
  }, [searchParams, setActiveTab, loadDnoPool, isAuthed]);

  if (!showSuccessToast) return null;

  return (
    <div className="fixed top-24 right-4 z-[100] max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-xl shadow-2xl flex items-start gap-4 border border-emerald-500/30">
        <CheckCircle2 size={24} className="text-emerald-200 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-black uppercase tracking-widest text-sm mb-1">Payment Successful!</h4>
          <p className="text-sm text-emerald-100 leading-relaxed">
            Your extra draft ticket has been added to your account.
          </p>
          <div className="mt-3 bg-teal-900/40 p-3 rounded-lg border border-teal-500/30">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-50 leading-snug">
              Please Note: This ticket must be used for the current season and will not be usable for the next season.
            </p>
          </div>
        </div>
        <button onClick={() => setShowSuccessToast(false)} className="text-emerald-200 hover:text-white shrink-0">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

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
  
  // LIVE LEADERBOARD OVERRIDES
  const [liveLeaderboard, setLiveLeaderboard] = useState(initialLeaderboard || { teams: [] });
  const [liveSeasonLabel, setLiveSeasonLabel] = useState("2025-2026 SEASON");

  // Confirmation Popup State
  const [confirmingLeague, setConfirmingLeague] = useState(null);
  
  // Raffle Modal State
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [raffleTab, setRaffleTab] = useState('tickets'); // 'tickets' | 'prizes'

  // State to visually flip the button to "Go to League" for leagues joined this session
  const [recentlyJoinedLeagues, setRecentlyJoinedLeagues] = useState([]);

  // Tab State & Styling
  const validTabs = ['live', 'online', 'leaderboard', 'prizes', 'rules', 'sponsors'];
  const [activeTab, setActiveTab] = useState('live');

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', window.location.pathname + `#${tabId}`);
  };

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

  const loadDnoPool = useCallback(async () => {
    try {
      const res = await fetch(`/api/scl?type=dno_pool&t=${Date.now()}`, { cache: 'no-store' });
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
  }, []);

  const loadLiveLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/scl?action=dno_get_leaderboard_data&t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Could not fetch leaderboard action");
      const json = await res.json();
      
      if (json.success && json.data) {
        setLiveLeaderboard(json.data);
        if (json.data.season_label) {
          setLiveSeasonLabel(json.data.season_label.toUpperCase());
        }
      }
    } catch (err) {
      console.warn("Failed loading live initialization data arrays: ", err);
    }
  }, []);

  useEffect(() => {
    loadLiveLeaderboard();
    if (isAuthed) {
      loadDnoPool();
    } else {
      setLoadingLeagues(false);
    }
  }, [isAuthed, loadDnoPool, loadLiveLeaderboard]);

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
        setRecentlyJoinedLeagues(prev => [...prev, leagueId]);
        window.open(data.invite_link, '_blank');
        loadLiveLeaderboard();
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
        body: JSON.stringify({ priceId: 'price_1Tv8ANBaSOn1la2fsYurqR32' }) 
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setErrorMessage('Could not initiate additional entry purchase window.');
    }
  };

  const ticketsAvailable = Math.max(0, allottedEntries - userJoinedCount);

  const sortedLeagues = [...leagues].sort((a, b) => {
    const isFullA = a.filled_spots >= a.total_spots;
    const isFullB = b.filled_spots >= b.total_spots;
    if (isFullA === isFullB) return 0;
    return isFullA ? 1 : -1;
  });

  return (
    <>
      <Header activeSport="Football" />
      
      <Suspense fallback={null}>
        <SuccessToast setActiveTab={setActiveTab} loadDnoPool={loadDnoPool} isAuthed={isAuthed} />
      </Suspense>

      {/* RAFFLE MODAL POPUP */}
      {showRaffleModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-[#151515] border border-gray-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
              <button 
                onClick={() => { setShowRaffleModal(false); setRaffleTab('tickets'); }} 
                className="absolute top-4 right-4 p-2 bg-gray-900 border border-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="p-6 md:p-8 border-b border-gray-800 bg-[#111] shrink-0 sticky top-0 z-10">
                 <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
                   <Ticket className="text-[#f5a623]" size={32} />
                   2026 Draft Night Out Drawings
                 </h2>
                 <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-3xl">
                   Drawing tickets are available for purchase or for free through the promos below. Each item will have its own cup for tickets, so put all your tickets towards one item or spread them across all prizes!
                 </p>
                 
                 {/* MODAL TAB SWITCHER */}
                 <div className="mt-6 flex flex-wrap items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-xl border border-gray-800 w-fit">
                    <button
                       onClick={() => setRaffleTab('tickets')}
                       className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${raffleTab === 'tickets' ? 'bg-[#111] border border-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
                    >
                       <Ticket size={16} /> Get Tickets
                    </button>
                    <button
                       onClick={() => setRaffleTab('prizes')}
                       className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${raffleTab === 'prizes' ? 'bg-[#111] border border-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}
                    >
                       <Gift size={16} /> Prize Vault
                    </button>
                 </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto scrollbar-hide flex-1">
                 
                 {/* TAB: TICKETS */}
                 {raffleTab === 'tickets' && (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                       
                       {/* BUY TICKETS AT THE TOP FOR MOBILE */}
                       <div className="bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] p-[2px] rounded-2xl shadow-lg">
                          <div className="bg-[#151515] p-6 md:p-8 rounded-[14px] flex flex-col items-center text-center h-full">
                             <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-2">Buy Tickets</h3>
                             <p className="text-sm text-gray-400 mb-6">Skip the promos and buy tickets directly at the event!</p>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                               <div className="bg-[#111] border border-gray-800 rounded-xl p-4"><div className="text-[#f5a623] font-black md:text-lg mb-1">1 Ticket</div><div className="text-white font-bold">$5</div></div>
                               <div className="bg-[#111] border border-gray-800 rounded-xl p-4"><div className="text-[#f5a623] font-black md:text-lg mb-1">3 Tickets</div><div className="text-white font-bold">$10</div></div>
                               <div className="bg-[#111] border border-gray-800 rounded-xl p-4"><div className="text-[#f5a623] font-black md:text-lg mb-1">7 Tickets</div><div className="text-white font-bold">$20</div></div>
                               <div className="bg-[#111] border border-gray-800 rounded-xl p-4"><div className="text-[#f5a623] font-black md:text-lg mb-1">17 Tickets</div><div className="text-white font-bold">$40</div></div>
                             </div>
                          </div>
                       </div>

                       {/* EARN FREE TICKETS SECTION */}
                       <div>
                          <h3 className="text-xl font-black uppercase tracking-wider text-white border-b border-gray-800 pb-3 mb-6">Earn Free Tickets</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* LEFT COLUMN: Promos */}
                             <div className="flex flex-col gap-6">
                                {/* FSAN PROMO */}
                                <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 shadow-inner">
                                   <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-sm mb-3">Fantasy Sports Advice Network</h4>
                                   <div className="space-y-4">
                                      <div className="flex gap-3 items-start">
                                        <div className="bg-[#111] border border-gray-700 rounded-lg px-2 py-1 text-xs font-black text-[#f5a623] shrink-0 mt-0.5">5 Tix</div>
                                        <div>
                                          <p className="text-sm text-gray-300 font-medium">Use promo code <strong className="text-white">DNO1</strong> to get a FSAN Pro+ Membership for $1.</p>
                                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">*Required for entry into the grand prize drawing</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-3 items-start">
                                        <div className="bg-[#111] border border-gray-700 rounded-lg px-2 py-1 text-xs font-black text-[#f5a623] shrink-0 mt-0.5">2 Tix</div>
                                        <div>
                                          <p className="text-sm text-gray-300 font-medium mb-2">Subscribe to all FSAN YouTube Channels:</p>
                                          <div className="grid grid-cols-2 gap-2">
                                            <a href="https://www.youtube.com/@FSANHQ" target="_blank" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"><Youtube size={14}/> HQ</a>
                                            <a href="https://www.youtube.com/@FSANFootball" target="_blank" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"><Youtube size={14}/> Football</a>
                                            <a href="https://www.youtube.com/@FSANBasketball" target="_blank" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"><Youtube size={14}/> Basketball</a>
                                            <a href="https://www.youtube.com/@FSANBaseball" target="_blank" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"><Youtube size={14}/> Baseball</a>
                                            <a href="https://www.youtube.com/@FSANRacing" target="_blank" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"><Youtube size={14}/> Racing</a>
                                            <a href="https://www.youtube.com/@FSANGolf" target="_blank" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"><Youtube size={14}/> Golf</a>
                                          </div>
                                        </div>
                                      </div>
                                   </div>
                                </div>
                                
                                {/* FANTASY SIX PACK */}
                                <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 shadow-inner">
                                   <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-sm mb-2">Fantasy Six Pack</h4>
                                   <p className="text-sm text-gray-300 font-medium mb-3">Use promo code <strong className="text-white">F6PDNO26</strong> to get 20% off membership at <a href="https://fantasysixpack.net/" target="_blank" className="text-[#1b75bb] hover:underline">fantasysixpack.net</a></p>
                                   <div className="flex flex-wrap gap-2">
                                     <span className="bg-[#111] border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-300"><strong className="text-[#f5a623]">2 Tix:</strong> 1 Month</span>
                                     <span className="bg-[#111] border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-300"><strong className="text-[#f5a623]">4 Tix:</strong> 3 Months</span>
                                     <span className="bg-[#111] border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-300"><strong className="text-[#f5a623]">6 Tix:</strong> 6 Months</span>
                                   </div>
                                </div>
                             </div>

                             {/* RIGHT COLUMN: Promos */}
                             <div className="flex flex-col gap-6">
                                {/* IN-BETWEEN MEDIA PROMO */}
                                <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 shadow-inner">
                                   <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-sm mb-3">In-Between Media</h4>
                                   <div className="flex gap-3 items-start">
                                      <div className="bg-[#111] border border-gray-700 rounded-lg px-2 py-1 text-xs font-black text-[#f5a623] shrink-0 mt-0.5">1 Tix</div>
                                      <div>
                                        <p className="text-sm text-gray-300 font-medium mb-2">Subscribe to both IBT YouTube Channels:</p>
                                        <div className="flex flex-col gap-2">
                                          <a href="https://www.youtube.com/@IBT_Media" target="_blank" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"><Youtube size={14}/> IBT Channel</a>
                                          <a href="https://www.youtube.com/@IBT-Entertainment" target="_blank" className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"><Youtube size={14}/> IBT Entertainment</a>
                                        </div>
                                      </div>
                                   </div>
                                </div>
                                
                                {/* FASTDRAFT */}
                                <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-800 shadow-inner">
                                   <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-xs mb-2">FastDraft Fantasy</h4>
                                   <div className="flex gap-2 items-start mb-2">
                                     <div className="bg-[#111] border border-gray-700 rounded-lg px-1.5 py-0.5 text-[10px] font-black text-[#f5a623] shrink-0 mt-0.5">2 Tix</div>
                                     <p className="text-xs text-gray-300 leading-snug">Download & use promo code <strong className="text-white">IBT</strong> for a 100% deposit match up to $50 at <a href="https://fastdraft.app/" target="_blank" className="text-[#1b75bb] hover:underline">fastdraft.app</a></p>
                                   </div>
                                   <p className="text-[9px] text-gray-500 leading-tight uppercase font-bold">*Min $5 Deposit. Legal in AL, AK, AR, AZ, CA, CO, DC, FL, GA, IL, KS, KY, MA, MD, MN, MO, NC, NH, ND, NJ, NM, OH, OK, OR, PA, RI, SC, SD, TN, UT, WI, WV, WY</p>
                                </div>
                                
                                {/* WANNA PARLAY */}
                                <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-800 shadow-inner">
                                   <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-xs mb-2">Wanna Parlay</h4>
                                   <div className="flex gap-2 items-start mb-2">
                                     <div className="bg-[#111] border border-gray-700 rounded-lg px-1.5 py-0.5 text-[10px] font-black text-[#f5a623] shrink-0 mt-0.5">2 Tix</div>
                                     <p className="text-xs text-gray-300 leading-snug">Download & use promo code <strong className="text-white">IBT</strong> for a 100% deposit match up to $250 at <a href="https://wannaparlay.com/" target="_blank" className="text-[#1b75bb] hover:underline">wannaparlay.com</a></p>
                                   </div>
                                   <p className="text-[9px] text-gray-500 leading-tight uppercase font-bold">*Min $5 Deposit. Legal in AK, AR, CA, FL, GA, IL, KS, KY, MN, NE, NM, ND, OK, OR, RI, SC, SD, TX, UT, WV, WI, WY</p>
                                </div>

                                {/* SELLOUT CROWDS / BLUECHIP */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-800 shadow-inner">
                                      <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-xs mb-2">Sellout Crowds</h4>
                                      <div className="flex gap-2 items-start">
                                        <div className="bg-[#111] border border-gray-700 rounded-lg px-1.5 py-0.5 text-[10px] font-black text-[#f5a623] shrink-0 mt-0.5">2 Tix</div>
                                        <p className="text-[11px] text-gray-300 leading-snug">Join the community for free at <a href="https://www.selloutcrowds.com/crowd/ffan" target="_blank" className="text-[#1b75bb] hover:underline">selloutcrowds.com/crowd/ffan</a></p>
                                      </div>
                                   </div>
                                   <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-800 shadow-inner">
                                      <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-xs mb-2">BlueChip Fantasy</h4>
                                      <p className="text-[11px] text-gray-400 font-bold mb-1">Sponsored by BlueChip Fantasy</p>
                                      <p className="text-[10px] text-gray-300 leading-snug mb-1">CFF, Devy & C2C</p>
                                      <a href="https://playbluechip.com/" target="_blank" className="text-[10px] font-black uppercase text-[#1b75bb] hover:underline flex items-center gap-1 mt-2"><ExternalLink size={12}/> Download App</a>
                                   </div>
                                </div>

                             </div>
                          </div>
                       </div>

                    </div>
                 )}

                 {/* TAB: PRIZES */}
                 {raffleTab === 'prizes' && (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                       <h3 className="text-xl font-black uppercase tracking-wider text-white border-b border-gray-800 pb-2">The Prize Vault</h3>
                       <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Kayvon Thibodeaux</strong> NYG Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Josh Hines-Allen</strong> JAX Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Andre Reed</strong> BUF Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Vince Young</strong> TEX Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Tyreek Hill</strong> MIA Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Troy Franklin</strong> DEN Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Amari Cooper</strong> CLE Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Damar Hamlin</strong> BUF Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Rico Dowdle</strong> DAL Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Treylon Burks</strong> TEN Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Ben Skowronek</strong> LAR Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Star size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Antonio Gibson</strong> WAS Jersey</span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Gift size={16} className="text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Draft Night Out Shirt <strong className="text-white">(Black)</strong></span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Gift size={16} className="text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Draft Night Out Shirt <strong className="text-white">(Green)</strong></span>
                          </li>
                          <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                            <Ticket size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-gray-300 leading-snug">Entry Into Draft Night Out Online <strong className="text-[#1b75bb]">(2 Winners)</strong></span>
                          </li>
                       </ul>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

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
                className="w-full relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(27,117,187,0.2)] transition-transform hover:-translate-y-0.5"
              >
                <div className="bg-[#151515] group-hover:bg-[#1a1a1a] transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center gap-2 w-full h-full">
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
            
            {/* HERO BANNER - DNO BRANDED */}
            <div className="relative w-full h-[260px] md:h-[300px] flex items-end overflow-hidden rounded-2xl mb-10 shadow-2xl bg-[#0a0a0a]">
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60" 
                style={{ backgroundImage: `url('https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Background.webp')` }} 
              />
              <img 
                src="https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp"
                alt="Draft Night Out Logo"
                className="absolute -right-10 md:right-4 top-1/2 -translate-y-1/2 w-[280px] md:w-[380px] h-auto object-contain opacity-20 md:opacity-40 z-0 pointer-events-none mix-blend-plus-lighter drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/90 via-[#121212]/50 to-transparent z-0 md:w-2/3" />
              
              <div className="relative z-10 w-full flex flex-col items-start justify-end h-full px-6 md:px-10 pb-8">
                <span className="inline-block py-1 px-3 rounded-full bg-[#1b75bb]/20 border border-[#1b75bb]/30 text-[#f5a623] font-bold text-[10px] uppercase tracking-widest mb-3 backdrop-blur-sm">
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
              
              {/* TAB SWITCHER - DYNAMIC GRADIENT OUTLINES */}
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-2 mb-10 bg-[#151515] p-2 rounded-2xl border border-gray-800/50 w-fit mx-auto shadow-inner animate-in fade-in duration-500 delay-100">
                {[
                  { id: 'live', icon: MapPin, label: 'Live Events' },
                  { id: 'online', icon: MonitorSmartphone, label: 'Online' },
                  { id: 'leaderboard', icon: ListOrdered, label: 'Leaderboard' },
                  { id: 'prizes', icon: Trophy, label: 'Prizes' },
                  { id: 'rules', icon: BookOpen, label: 'Rules' },
                  { id: 'sponsors', icon: Handshake, label: 'Sponsor' }
                ].map(tab => {
                  const Icon = tab.icon;
                  return activeTab === tab.id ? (
                    <button key={tab.id} onClick={() => handleTabClick(tab.id)} className="relative p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_15px_rgba(27,117,187,0.3)] transition-all">
                      <div className="bg-[#151515] rounded-[10px] px-5 py-3 flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs">
                        <Icon size={16} /> {tab.label}
                      </div>
                    </button>
                  ) : (
                    <button key={tab.id} onClick={() => handleTabClick(tab.id)} className="px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent">
                      <Icon size={16} /> {tab.label}
                    </button>
                  );
                })}
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
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#1b75bb]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                      
                      <div className="flex items-center gap-4 w-full mb-6 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1b75bb] to-[#0a4b7d] flex items-center justify-center shrink-0 shadow-lg">
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
                            <div className="flex items-center gap-2 mb-1"><Calendar size={14} className="text-[#f5a623]"/><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</span></div>
                            <p className="text-xs text-gray-200">July 25, 2026</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1"><Clock size={14} className="text-[#f5a623]"/><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</span></div>
                            <p className="text-xs text-gray-200">12pm - 4pm ET</p>
                          </div>
                          <div className="col-span-2 border-t border-gray-800 pt-3 mt-1">
                            <div className="flex items-center gap-2 mb-1"><MapPin size={14} className="text-[#f5a623]"/><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Where</span></div>
                            <p className="text-[11px] text-gray-400 leading-snug">Jerzee's Sports Grille<br/>5260 Dressler Rd NW, Canton, OH 44718</p>
                          </div>
                      </div>
                      
                      <div className="mt-auto relative z-10 flex flex-col gap-3">
                        <a href="https://in-betweenmedia.com/product/draft-night-out-2026-tickets/" target="_blank" rel="noopener noreferrer" className="w-full inline-block relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(27,117,187,0.2)] transition-transform hover:-translate-y-0.5">
                          <div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-6 py-3.5 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs">
                            Get Canton Tickets <ExternalLink size={16} />
                          </div>
                        </a>
                        <button onClick={() => setShowRaffleModal(true)} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] bg-[#111] hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-black uppercase tracking-widest border border-gray-800 transition-colors">
                           <Ticket size={16} className="text-[#f5a623]" /> View Raffle Prizes & Promos
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-[#1b75bb]/10 border border-[#1b75bb]/30 rounded-xl p-4 flex items-start gap-3">
                    <Ticket size={20} className="text-[#f5a623] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-black text-[#1b75bb] uppercase tracking-widest mb-1">Live Event Note</h5>
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

                  <div className="mb-8 p-[2px] rounded-2xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(27,117,187,0.15)]">
                    <div className="flex flex-col sm:flex-row items-center justify-between bg-[#151515] p-5 px-6 rounded-[14px] gap-4 w-full h-full">
                      {isProPlus ? (
                        <>
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#1b75bb]/20 flex items-center justify-center shrink-0 border border-[#1b75bb]/30">
                              <Ticket size={20} className="text-[#1b75bb]" />
                            </div>
                            <h3 className="text-white text-lg md:text-xl font-black uppercase tracking-wide italic text-center sm:text-left">
                              You have <span className="text-[#f5a623]">{ticketsAvailable}</span> online draft ticket{ticketsAvailable !== 1 ? 's' : ''} available
                            </h3>
                          </div>
                          <button onClick={handlePurchaseExtraEntry} className="shrink-0 w-full sm:w-auto bg-teal-600 hover:bg-teal-500 transition-colors text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5">
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
                          <Link href="/subscribe" className="shrink-0 w-full sm:w-auto bg-[#1b75bb] hover:bg-[#155d96] transition-colors text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2">
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
                            <Lock size={40} className="text-[#1b75bb] mb-4" />
                            <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-2">Pro+ Required</h4>
                            <p className="text-sm text-gray-300 mb-6 max-w-[280px] leading-relaxed">Upgrade to Pro+ to browse and claim your live Sleeper roster slots.</p>
                            <Link href="/subscribe" className="relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-lg transition-transform hover:-translate-y-0.5 inline-block">
                              <div className="bg-black group-hover:bg-gray-900 transition-colors rounded-[10px] px-8 py-3.5 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-sm">
                                Upgrade to Pro+
                              </div>
                            </Link>
                        </div>
                    )}

                    {loadingLeagues ? (
                      <div className="w-full flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
                        <Loader2 size={32} className="animate-spin text-[#1b75bb]" /> 
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
                          
                          const isJoinedLocal = recentlyJoinedLeagues.includes(league.id);

                          return (
                            <div key={league.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md relative overflow-hidden group">
                              
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h4 className="text-lg font-black text-white uppercase tracking-wide italic mb-1 line-clamp-1">{league.name}</h4>
                                <span className={`text-xs font-black uppercase tracking-wider ${isFull && !isJoinedLocal ? 'text-gray-500' : 'text-green-500'}`}>
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
                                  <button onClick={handlePurchaseExtraEntry} className="w-full sm:w-auto relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-lg transition-transform hover:-translate-y-0.5">
                                    <div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-6 py-3 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs">
                                      <Coins size={14} className="text-[#f5a623]" /> Buy Ticket
                                    </div>
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => setConfirmingLeague(league)}
                                    className="w-full sm:w-auto relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-md transition-transform hover:-translate-y-0.5"
                                  >
                                    <div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-6 py-3 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs">
                                      Join League
                                    </div>
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
                  <NapkinLeaderboard 
                    initialLeaderboard={liveLeaderboard} 
                    overrideSeasonLabel={liveSeasonLabel}
                  />
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
                       <p className="text-sm text-gray-400 leading-relaxed">Mini Championship Belt from <strong className="text-white">TrophySmack</strong>.</p>
                     </div>

                     <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                       <Gift className="text-[#f5a623] mb-4" size={40} />
                       <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Overall Regular Season Champ</h4>
                       <p className="text-sm text-gray-400 leading-relaxed">Ultimate 6lb Custom Championship Belt from <strong className="text-[#f5a623]">TrophySmack</strong>.</p>
                     </div>

                     <div className="bg-gradient-to-b from-[#0a1220] to-[#111] p-8 rounded-3xl border border-[#1b75bb]/30 flex flex-col items-center text-center shadow-[0_0_30px_rgba(27,117,187,0.15)] hover:-translate-y-1 transition-transform relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-[#1b75bb]/10 blur-2xl rounded-full"></div>
                       <Trophy className="text-yellow-500 mb-4 relative z-10" size={40} />
                       <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2 relative z-10">Playoff Challenge Champion</h4>
                       <p className="text-sm text-gray-300 leading-relaxed relative z-10">Playstation 5, Madden 2026, and championship ring from <strong className="text-white">TrophySmack</strong>!</p>
                     </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#0a1220] to-[#111] rounded-3xl border border-[#1b75bb]/30 p-8 md:p-12 mb-12 shadow-[0_0_40px_rgba(27,117,187,0.1)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="absolute -right-4 -top-4 text-[120px] md:text-[180px] font-black text-[#1b75bb]/10 z-0 select-none transition-colors leading-none pointer-events-none">🏆</div>
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#1b75bb] to-[#0d4a7a] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(27,117,187,0.4)] border-4 border-[#111] relative z-10">
                      <Shield size={48} className="text-white drop-shadow-md" />
                    </div>
                    <div className="flex-1 text-center md:text-left relative z-10">
                      <div className="inline-block px-3 py-1 bg-[#f5a623] text-black font-black text-[10px] uppercase tracking-widest rounded-full mb-3 shadow-md">New in 2026!</div>
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
                             <li className="flex gap-3 items-center"><span className="text-[#1b75bb] font-black text-lg">1.</span> Be Cool.</li>
                             <li className="flex gap-3 items-center"><span className="text-[#1b75bb] font-black text-lg">2.</span> No Colluding.</li>
                             <li className="flex gap-3 items-center"><span className="text-[#1b75bb] font-black text-lg">3.</span> Max 1 Team per League.</li>
                           </ul>
                        </div>

                        <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
                           <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">Draft Settings</h3>
                           <ul className="space-y-4 text-sm text-gray-400 font-medium">
                             <li className="flex gap-3 items-center"><span className="text-[#f5a623] font-black text-lg">•</span> Hosted on Sleeper App</li>
                             <li className="flex gap-3 items-center"><span className="text-[#f5a623] font-black text-lg">•</span> 12 Teams Per League</li>
                             <li className="flex gap-3 items-center"><span className="text-[#f5a623] font-black text-lg">•</span> Randomized Pick Order</li>
                             <li className="flex gap-3 items-center"><span className="text-[#f5a623] font-black text-lg">•</span> Snake Draft</li>
                           </ul>
                        </div>

                        <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
                           <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">Scoring & Format</h3>
                           <ul className="space-y-4 text-sm text-gray-400 font-medium">
                             <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">PPR</span></li>
                             <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Start: 1 QB 2 RB 3 WR 1 TE 3 FLEX 1 DST</span></li>
                             <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Bench: 8 Players plus 1 IR</span></li>
                             <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Playoffs: Top 4 advance in Wk 15</span></li>
                             <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Two-Week Championship (Wks 16 & 17)</span></li>
                             <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">League winner advances to the Playoff Challenge</span></li>
                           </ul>
                        </div>
                     </div>
                     
                     {/* SPECIALTY LEAGUES SECTION */}
                     <div className="mt-6 bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
                       <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-3 border-b border-gray-800 pb-3">Specialty Leagues</h3>
                       <p className="text-sm text-gray-400 font-medium leading-relaxed">
                         Leagues featuring specialty scoring or alternative formats (such as Dynasty or Superflex) are not included on the global Draft Night Out leaderboard due to point variances. However, the winners of these leagues are still fully eligible to advance and compete in the Playoff Challenge!
                       </p>
                     </div>

                     {/* LEGAL DISCLAIMER SECTION */}
                     <div className="mt-8 pt-6 border-t border-gray-800">
                       <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                         <strong className="text-gray-400">LEGAL DISCLAIMER:</strong> NO PURCHASE OR PAYMENT OF ANY KIND IS NECESSARY TO ENTER OR WIN. A PURCHASE WILL NOT INCREASE YOUR CHANCES OF WINNING. Participants must be 18 years of age or older at the time of entry. Minors under the age of 18 may only participate with the explicit, verifiable consent of a parent or legal guardian. Void where prohibited or restricted by law. By participating in Draft Night Out or the Playoff Challenge, you agree to abide by the Official League Rules and the decisions of the sponsor, which are final and binding. For alternative methods of entry (AMOE) and full official rules, please contact our support team.
                       </p>
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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#1b75bb]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    
                    <div className="max-w-3xl relative z-10">
                      <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-4">Become a Sponsor</h3>
                      <p className="text-gray-300 leading-relaxed mb-8">
                        We are always looking to collaborate with brands and individuals who want to make Draft Night Out the ultimate fantasy football experience. Whether you're interested in location hosting, providing prize giveaways, donating raffle items, or exploring other partnership opportunities, we'd love to hear from you!
                      </p>
                      
                      <a href="mailto:info@fsannetwork.com" className="inline-block relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(27,117,187,0.2)] transition-transform hover:-translate-y-0.5">
                        <div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-8 py-4 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs">
                          <Mail size={16} /> Contact Us About Sponsorships
                        </div>
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