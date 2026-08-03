"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MonitorSmartphone, Trophy, BookOpen, Handshake, ListOrdered, HeartHandshake, Loader2, Users, Plus, Minus, X, ShoppingCart, Swords } from 'lucide-react';

// Importing DNO components
import DNOHeader from '../../components/dno/DNOHeader';
import DNOAuthModal from '../../components/dno/DNOAuthModal';
import DraftsTab from '../../components/dno/tabs/DraftsTab';
import PrizesTab from '../../components/dno/tabs/PrizesTab';
import PlayoffTab from '../../components/dno/tabs/PlayoffTab';
import RulesTab from '../../components/dno/tabs/RulesTab';
import SponsorsTab from '../../components/dno/tabs/SponsorsTab';
import CharityTab from '../../components/dno/tabs/CharityTab';
import CommunityTab from '../../components/dno/tabs/CommunityTab';
import Leaderboard from '../../components/dno/Leaderboard';

function PublicPageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get('tab') || 'drafts';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [draftView, setDraftView] = useState('online');
  const [showAuthModal, setShowAuthModal] = useState(null); // 'login' or 'register'

  const [leagues, setLeagues] = useState([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [liveLeaderboard, setLiveLeaderboard] = useState({ teams: [] });
  const [liveSeasonLabel, setLiveSeasonLabel] = useState("2026 SEASON");

  // State for Purchasing and Joining
  const [ticketsAvailable, setTicketsAvailable] = useState(0);
  const [userJoinedCount, setUserJoinedCount] = useState(0);
  const [isQualified, setIsQualified] = useState(false);
  const [confirmingLeague, setConfirmingLeague] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [donationAmount, setDonationAmount] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync tab state if URL parameter changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Handle Tab Click, update URL, and handle specific scroll targets
  const handleTabClick = (tabId, targetElementId = null) => {
    setActiveTab(tabId);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tabId);
    router.push(`?${newParams.toString()}`, { scroll: false });
    
    if (targetElementId) {
      // Give React a tiny fraction of a second to render the new tab content before searching for the ID
      setTimeout(() => {
        const element = document.getElementById(targetElementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50); 
    } else {
      // Default: Smoothly scroll to top so the user isn't stuck at the bottom of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fetch live pool data & securely fetch user ticket counts in the same call
  const loadDnoPool = useCallback(async () => {
    try {
      const userIdParam = session?.user?.id ? `&user_id=${session.user.id}` : '';
      const res = await fetch(`/api/scl?type=dno_pool${userIdParam}&t=${Date.now()}`, { cache: 'no-store' });
      
      if (!res.ok) throw new Error("Could not reach DNO matrix");
      const data = await res.json();
      
      setLeagues(data.leagues || []);
      
      if (session?.user?.id) {
        const allotted = data.allotted_entries !== undefined ? data.allotted_entries : 0;
        const joined = data.user_joined_count || 0;
        setTicketsAvailable(Math.max(0, allotted - joined));
        setUserJoinedCount(joined);
      }
    } catch (err) {
       console.warn("Failed syncing live DNO array: ", err);
     } finally {
       setLoadingLeagues(false);
     }
  }, [session]);

  // Fetch live leaderboard
  const loadLiveLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/scl?action=dno_get_leaderboard_data&t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setLiveLeaderboard(json.data);
        if (json.data.season_label) setLiveSeasonLabel(json.data.season_label.toUpperCase());
      }
    } catch (err) {
       console.warn("Failed loading live leaderboard: ", err);
     }
  }, []);

  // Check if the user is qualified for the Playoff Challenge
  const loadUserData = useCallback(async () => {
    if (session?.user?.id) {
      try {
        const res = await fetch(`/api/scl?action=dno_get_user_data&user_id=${session.user.id}&t=${Date.now()}`, { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.data) {
          setIsQualified(json.data.is_qualified || false);
        }
      } catch (err) {
        console.warn("Failed loading user qualification status: ", err);
      }
    }
  }, [session]);

  useEffect(() => {
    loadLiveLeaderboard();
  }, [loadLiveLeaderboard]);

  useEffect(() => {
    loadDnoPool();
    loadUserData();
  }, [loadDnoPool, loadUserData, session]);

  const sortedLeagues = [...leagues].sort((a, b) => {
    const isFullA = a.filled_spots >= a.total_spots;
    const isFullB = b.filled_spots >= b.total_spots;
    if (isFullA === isFullB) return 0;
    return isFullA ? 1 : -1;
  });

  // Open the Purchase Modal
  const handlePurchaseExtraEntry = () => {
    if (status !== 'authenticated') {
      setShowAuthModal('register');
      return;
    }
    setShowPurchaseModal(true);
  };

  // Execute Stripe Checkout from the Purchase Modal
  const executeStripeCheckout = async () => {
    setIsProcessing(true);
    try {
      const isFirstTicket = ticketsAvailable <= 0 && userJoinedCount === 0;
      const purchaseType = isFirstTicket ? 'dno_bundle' : 'dno_extra_ticket';

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: purchaseType,
          quantity: purchaseQuantity,
          donationAmount: donationAmount,
          isAnonymous: isAnonymous,
          userId: session.user.id,
          email: session.user.email,
          returnUrl: `${window.location.origin}/dno/dashboard`
        })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      alert("Unable to initiate checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  // Join League Execution
  const executeJoin = async () => {
    if (!confirmingLeague || !session?.user?.id) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/scl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dno_join_league',
          league_id: confirmingLeague.id,
          sleeper_id: confirmingLeague.sleeper_id,
          user_id: session.user.id
        })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/dno/dashboard';
      } else {
        alert(data.message || "Failed to join the league.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Join Error:", err);
      alert("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans selection:bg-[#1b75bb] selection:text-white relative">
      
      {/* Floating DNO Header */}
      <DNOHeader onOpenAuthModal={setShowAuthModal} />

      {/* Auth Modal */}
      {showAuthModal && (
        <DNOAuthModal 
          initialMode={showAuthModal} 
          onClose={() => setShowAuthModal(null)} 
        />
      )}

      {/* Dedicated Ticket Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
           <div className="bg-[#151515] p-8 rounded-3xl border border-gray-800 text-center text-white shadow-2xl w-full max-w-md relative overflow-hidden my-auto">
              <button 
                 onClick={() => { setShowPurchaseModal(false); setPurchaseQuantity(1); setDonationAmount(0); setIsAnonymous(false); }} 
                 className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2"
                disabled={isProcessing}
              >
                 <X size={20} />
              </button>
              
              <div className="mx-auto w-12 h-12 bg-[#1b75bb]/20 text-[#1b75bb] rounded-full flex items-center justify-center mb-4">
                 <ShoppingCart size={24} />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">Get Draft Tickets</h3>
              
              <div className="flex flex-col gap-3 mt-4">
                <div className="bg-[#111] border border-[#1b75bb]/30 p-4 rounded-xl text-left mb-2 shadow-inner">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <strong className="text-white block mb-1">Standard Entry</strong> 
                    Each ticket is $22 ($4 goes directly to charity).
                  </p>
                  
                  {ticketsAvailable <= 0 && userJoinedCount === 0 && (
                    <p className="text-xs text-[#f5a623] font-bold mt-3 bg-[#f5a623]/10 p-2 rounded-lg inline-block border border-[#f5a623]/20">
                        First-time buyers get a free 1-month trial of FSAN Pro+ automatically applied at checkout!
                    </p>
                  )}

                  {/* Quantity Selector */}
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Quantity:</span>
                    <div className="flex items-center gap-3 bg-[#181818] border border-gray-700 rounded-xl px-3 py-1.5">
                      <button 
                        onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                        disabled={isProcessing}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-black text-white text-base min-w-[20px] text-center">{purchaseQuantity}</span>
                      <button 
                        onClick={() => setPurchaseQuantity(Math.min(25, purchaseQuantity + 1))}
                        disabled={isProcessing}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Optional Charity Donation UI */}
                  <div className="mt-5 pt-4 border-t border-gray-800 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                      <HeartHandshake size={14} className="text-[#f5a623]" /> Optional Charity Donation:
                    </span>
                    <div className="flex gap-2 mb-3">
                      {[0, 5, 10, 25].map(amt => (
                        <button 
                          key={amt} 
                          onClick={() => setDonationAmount(amt)}
                          disabled={isProcessing}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors border ${donationAmount === amt ? 'bg-gradient-to-r from-teal-400 to-[#1b75bb] border-transparent text-white' : 'bg-[#181818] border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
                        >
                          {amt === 0 ? 'None' : `+$${amt}`}
                        </button>
                      ))}
                    </div>

                    {donationAmount > 0 && (
                      <label className="flex items-center gap-2 cursor-pointer mt-1 group">
                        <input 
                          type="checkbox" 
                          checked={isAnonymous} 
                          onChange={(e) => setIsAnonymous(e.target.checked)} 
                          className="rounded border-gray-700 bg-[#181818] text-[#1b75bb] focus:ring-[#1b75bb] focus:ring-offset-gray-900"
                        />
                        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">Keep my donation anonymous on the Wall of Fame</span>
                      </label>
                    )}

                  </div>
                </div>

                {/* Legal Fine Print Disclaimer */}
                <div className="my-3 text-left">
                  <p className="text-[11px] text-gray-500 leading-tight">
                    By proceeding to checkout, you agree to our{' '}
                    <a href="/dno/agreement" target="_blank" rel="noopener noreferrer" className="text-[#1b75bb] underline hover:text-white">
                      Official Contest Rules & Terms
                    </a>. First-time buyers receive a 30-day free trial of FSAN Pro+, which automatically renews at $7.99/mo thereafter. Cancel anytime in account settings.
                  </p>
                </div>

                <button 
                  onClick={executeStripeCheckout}
                  disabled={isProcessing}
                  className="w-full relative group p-[2px] rounded-xl bg-gradient-to-r from-[#f5a623] to-[#c30b16] shadow-[0_0_15px_rgba(245,166,35,0.2)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center w-full text-white font-black uppercase tracking-widest text-xs">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Checkout ($${(22 * purchaseQuantity) + donationAmount})`}
                  </div>
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Confirm Join League Modal */}
      {confirmingLeague && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#151515] p-8 rounded-3xl border border-gray-800 text-center text-white shadow-2xl w-full max-w-md relative overflow-hidden">
              <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">Confirm Entry</h3>
              
              <div className="flex items-center justify-center gap-4 mb-6 mt-4">
                <div className="bg-[#111] border border-gray-800 rounded-xl px-6 py-4 shadow-inner">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Your Tickets</p>
                   <p className="text-3xl font-black text-[#f5a623] leading-none">{ticketsAvailable}</p>
                </div>
              </div>

              {ticketsAvailable > 0 ? (
                <>
                  <p className="text-gray-400 mb-6 text-sm">
                    You are about to use <strong className="text-white">1 Draft Ticket</strong> to secure your spot in <strong className="text-[#1b75bb]">{confirmingLeague.name}</strong>.
                  </p>
                  <button 
                    onClick={executeJoin}
                    disabled={isProcessing}
                    className="w-full relative group p-[2px] rounded-xl bg-gradient-to-r from-teal-400 to-[#1b75bb] shadow-[0_0_15px_rgba(27,117,187,0.2)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center w-full text-white font-black uppercase tracking-widest text-xs">
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Join League'}
                    </div>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    You need a Draft Ticket to join this league. 
                  </p>
                  <button 
                    onClick={() => {
                      setConfirmingLeague(null);
                      setShowPurchaseModal(true);
                    }}
                    disabled={isProcessing}
                    className="w-full relative group p-[2px] rounded-xl bg-gradient-to-r from-[#f5a623] to-[#c30b16] shadow-[0_0_15px_rgba(245,166,35,0.2)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center w-full text-white font-black uppercase tracking-widest text-xs">
                      Get Tickets
                    </div>
                  </button>
                </div>
              )}

              <button 
                 onClick={() => setConfirmingLeague(null)} 
                 disabled={isProcessing}
                className="w-full mt-3 px-6 py-3 bg-transparent hover:bg-gray-800 transition-colors text-gray-400 hover:text-white font-bold uppercase tracking-widest text-xs rounded-xl"
              >
                Cancel
              </button>
           </div>
        </div>
      )}

      <main className="flex-1 w-full pb-24">
        
        {/* Hero Banner */}
        <div className="relative w-full min-h-[400px] md:min-h-[450px] flex items-end overflow-hidden mb-10 shadow-2xl bg-[#0a0a0a]">
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60" style={{ backgroundImage: `url('https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Background.webp')` }} />
          <img src="https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp" alt="Draft Night Out Logo" className="absolute -right-10 md:right-10 top-1/2 -translate-y-1/2 w-[280px] md:w-[550px] h-auto object-contain opacity-20 md:opacity-40 z-0 pointer-events-none mix-blend-plus-lighter drop-shadow-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent z-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/90 via-[#09090b]/60 to-transparent z-0 md:w-2/3" />
          
          <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col items-start justify-end h-full px-6 md:px-8 lg:px-10 pb-8 md:pb-10 pt-32 md:pt-24">
            <span className="inline-block py-1.5 px-4 rounded-full bg-[#1b75bb]/20 border border-[#1b75bb]/30 text-[#f5a623] font-bold text-[10px] uppercase tracking-widest mb-4 backdrop-blur-sm">The Biggest Fantasy Hang of the Year</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">Draft Night Out</h1>
            
            {/* Powered By Label */}
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">Powered by</span>
              <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest drop-shadow-md">Fantasy Sports Advice Network</span>
            </div>

            <p className="text-gray-300 font-medium md:text-lg leading-relaxed drop-shadow-md max-w-2xl mt-2">Secure your seat at one of our live Draft Night Out events, or build your championship roster from home in our exclusive online divisions. Dominate your league to win incredible prizes!</p>
          </div>
        </div>

        {/* Dynamic Content Container */}
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10">
          
          {/* Tab Navigation with Hash/Query Linking */}
          <div className="flex items-center justify-start lg:justify-center gap-2 md:gap-4 py-2 px-2 md:px-4 mb-10 bg-[#151515] rounded-2xl border border-gray-800/50 w-full lg:w-fit mx-auto shadow-inner overflow-x-auto scrollbar-hide">
            {[
              { id: 'drafts', icon: MonitorSmartphone, label: 'Drafts' },
              { id: 'leaderboard', icon: ListOrdered, label: 'Leaderboard' },
              { id: 'charity', icon: HeartHandshake, label: 'Charity' },
              { id: 'prizes', icon: Trophy, label: 'Prizes' },
              { id: 'playoffs', icon: Swords, label: 'Playoffs' },
              { id: 'rules', icon: BookOpen, label: 'Rules' },
              { id: 'community', icon: Users, label: 'Community' },
              { id: 'sponsors', icon: Handshake, label: 'Sponsor' }
            ].map(tab => {
              const Icon = tab.icon;
              return activeTab === tab.id ? (
                <button key={tab.id} onClick={() => handleTabClick(tab.id)} className="relative p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_15px_rgba(27,117,187,0.3)] transition-all shrink-0">
                  <div className="bg-[#151515] rounded-[10px] px-5 py-3 flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs whitespace-nowrap"><Icon size={16} /> {tab.label}</div>
                </button>
              ) : (
                <button key={tab.id} onClick={() => handleTabClick(tab.id)} className="px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent shrink-0 whitespace-nowrap"><Icon size={16} /> {tab.label}</button>
              );
            })}
          </div>

          <div className="max-w-5xl mx-auto">
            {activeTab === 'drafts' && (
              <DraftsTab 
                draftView={draftView} 
                setDraftView={setDraftView} 
                isProPlus={status === 'authenticated'} 
                ticketsAvailable={ticketsAvailable} 
                handlePurchaseExtraEntry={handlePurchaseExtraEntry} 
                loadingLeagues={loadingLeagues} 
                leagues={leagues} 
                sortedLeagues={sortedLeagues} 
                recentlyJoinedLeagues={[]} 
                setConfirmingLeague={(league) => {
                  if (status !== 'authenticated') {
                    setShowAuthModal('register');
                  } else {
                    setConfirmingLeague(league);
                  }
                }}
               />
            )}
            {activeTab === 'leaderboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Leaderboard initialLeaderboard={liveLeaderboard} overrideSeasonLabel={liveSeasonLabel} />
              </div>
            )}
            {activeTab === 'charity' && <CharityTab />}
            {activeTab === 'prizes' && <PrizesTab />}
            {activeTab === 'playoffs' && <PlayoffTab isQualified={isQualified} onTabChange={handleTabClick} />}
            {activeTab === 'rules' && <RulesTab />}
            {activeTab === 'community' && <CommunityTab />}
            {activeTab === 'sponsors' && <SponsorsTab />}
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default function DNOPublicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1b75bb] animate-spin" />
      </div>
    }>
      <PublicPageContent />
    </Suspense>
  );
}