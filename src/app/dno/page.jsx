"use client";
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  MonitorSmartphone, 
  Trophy, 
  HeartHandshake, 
  Gift, 
  BookOpen, 
  Users, 
  Handshake, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ExternalLink 
} from 'lucide-react';

// Header, Footer & Auth Components
import DNOHeader from '../../components/dno/DNOHeader';
import DNOFooter from '../../components/dno/DNOFooter';
import DNOAuthModal from '../../components/dno/DNOAuthModal';

// Tab Components
import DraftsTab from '../../components/dno/tabs/DraftsTab';
import LeaderboardTab from '../../components/dno/tabs/LeaderboardTab';
import CharityTab from '../../components/dno/tabs/CharityTab';
import PrizesTab from '../../components/dno/tabs/PrizesTab';
import RulesTab from '../../components/dno/tabs/RulesTab';
import CommunityTab from '../../components/dno/tabs/CommunityTab';
import SponsorTab from '../../components/dno/tabs/SponsorTab';

function DNOPageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get('tab') || 'drafts';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [draftView, setDraftView] = useState('online'); // 'online' or 'live'

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // League & Draft Pool Data
  const [leagues, setLeagues] = useState([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [ticketsAvailable, setTicketsAvailable] = useState(0);
  const [allottedEntries, setAllottedEntries] = useState(1);
  const [recentlyJoinedLeagues, setRecentlyJoinedLeagues] = useState([]);
  
  // Claiming & Confirmation Modals
  const [confirmingLeague, setConfirmingLeague] = useState(null);
  const [isClaimingSpot, setIsClaimingSpot] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimedInviteUrl, setClaimedInviteUrl] = useState('');
  const [showRaffleModal, setShowRaffleModal] = useState(false);

  const isProPlus = status === 'authenticated';

  // Sync title and favicon
  useEffect(() => {
    document.title = "Draft Night Out | 2026 Championship Fantasy League";
    
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

  // Handle URL Query Params for active tab
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

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Load League Pool & User Entry Balances
  const loadLeaguesPool = useCallback(async () => {
    setLoadingLeagues(true);
    try {
      const res = await fetch(`/api/scl?type=dno_pool&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const poolLeagues = data.leagues || [];
        setLeagues(poolLeagues);

        const joinedCount = data.user_joined_count || 0;
        const totalAllotted = data.allotted_entries || 1;
        setAllottedEntries(totalAllotted);
        setTicketsAvailable(Math.max(0, totalAllotted - joinedCount));

        if (data.joined_leagues) {
          setRecentlyJoinedLeagues(data.joined_leagues);
        }
      }
    } catch (err) {
      console.error("Failed loading DNO pool:", err);
    } finally {
      setLoadingLeagues(false);
    }
  }, []);

  useEffect(() => {
    loadLeaguesPool();
  }, [loadLeaguesPool, session]);

  // Execute spot claim / entry deduction
  const handleConfirmClaimSpot = async () => {
    if (!session) {
      setConfirmingLeague(null);
      handleOpenAuthModal('register');
      return;
    }

    if (!confirmingLeague || confirmingLeague.mock) return;

    setIsClaimingSpot(true);
    setClaimError('');

    try {
      const res = await fetch('/api/scl?action=claim-spot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId: confirmingLeague.id })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to claim draft spot. Please try again.');
      }

      setClaimedInviteUrl(data.invite_link);
      setRecentlyJoinedLeagues(prev => [...prev, confirmingLeague.id]);
      
      // Refresh pool state
      loadLeaguesPool();
    } catch (err) {
      setClaimError(err.message);
    } finally {
      setIsClaimingSpot(false);
    }
  };

  const handlePurchaseExtraEntry = () => {
    window.open('https://fsan.com/subscribe', '_blank');
  };

  // Sort leagues (open first)
  const sortedLeagues = [...leagues].sort((a, b) => {
    const openA = Math.max(0, a.total_spots - a.filled_spots);
    const openB = Math.max(0, b.total_spots - b.filled_spots);
    if (openA > 0 && openB === 0) return -1;
    if (openA === 0 && openB > 0) return 1;
    return 0;
  });

  // Tab definitions with icons (Community placed between Rules & Sponsor)
  const tabs = [
    { id: 'drafts', label: 'Drafts', icon: MonitorSmartphone },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'charity', label: 'Charity', icon: HeartHandshake },
    { id: 'prizes', label: 'Prizes', icon: Gift },
    { id: 'rules', label: 'Rules', icon: BookOpen },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'sponsor', label: 'Sponsor', icon: Handshake },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans selection:bg-[#1b75bb] selection:text-white relative overflow-x-hidden">
      
      <DNOHeader onOpenAuthModal={handleOpenAuthModal} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-28 pb-24 z-10 relative">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 pt-4">
          <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-xl mb-4">
            Draft Night Out
          </h1>
          <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed uppercase tracking-wider">
            Secure your seat at one of our live Draft Night Out events, or build your championship roster from home in our exclusive online divisions. Dominate your league to win incredible prizes!
          </p>
        </div>

        {/* Main Tab Navigation Bar */}
        <div className="flex justify-center mb-10 overflow-x-auto scrollbar-hide py-2">
          <div className="bg-[#111] p-1.5 rounded-2xl border border-gray-800 flex items-center gap-1 shadow-2xl backdrop-blur-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-4 sm:px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-500 to-[#1b75bb] text-white shadow-lg shadow-[#1b75bb]/20 scale-[1.02]' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tab Render */}
        {activeTab === 'drafts' && (
          <DraftsTab 
            draftView={draftView}
            setDraftView={setDraftView}
            isProPlus={isProPlus}
            ticketsAvailable={ticketsAvailable}
            handlePurchaseExtraEntry={handlePurchaseExtraEntry}
            errorMessage=""
            loadingLeagues={loadingLeagues}
            leagues={leagues}
            sortedLeagues={sortedLeagues}
            recentlyJoinedLeagues={recentlyJoinedLeagues}
            setConfirmingLeague={setConfirmingLeague}
            setShowRaffleModal={setShowRaffleModal}
          />
        )}

        {activeTab === 'leaderboard' && <LeaderboardTab />}
        {activeTab === 'charity' && <CharityTab />}
        {activeTab === 'prizes' && <PrizesTab />}
        {activeTab === 'rules' && <RulesTab />}
        {activeTab === 'community' && <CommunityTab />}
        {activeTab === 'sponsor' && <SponsorTab />}

      </main>

      <DNOFooter />

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <DNOAuthModal 
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Spot Claiming & Confirmation Modal */}
      {confirmingLeague && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-gray-800 rounded-3xl max-w-md w-full p-8 text-white shadow-2xl relative overflow-hidden text-center">
            
            <button 
              onClick={() => { setConfirmingLeague(null); setClaimedInviteUrl(''); setClaimError(''); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>

            {!claimedInviteUrl ? (
              <>
                <h3 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tight">
                  Confirm Division Seat
                </h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
                  {confirmingLeague.name}
                </p>

                {claimError && (
                  <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{claimError}</span>
                  </div>
                )}

                <p className="text-sm text-gray-300 leading-relaxed mb-8">
                  Claiming a seat in this division will deduct <strong>1 Draft Ticket</strong> from your available balance. Are you ready to join?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmingLeague(null)}
                    className="flex-1 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmClaimSpot}
                    disabled={isClaimingSpot}
                    className="flex-1 py-3.5 rounded-xl bg-[#1b75bb] hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {isClaimingSpot ? <Loader2 size={16} className="animate-spin" /> : 'Confirm & Join'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tight">
                  Seat Reserved!
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Your ticket has been claimed. Click the button below to join your official Sleeper draft room!
                </p>

                <a 
                  href={claimedInviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg transition-all"
                >
                  Enter Sleeper Draft Room <ExternalLink size={16} />
                </a>
              </>
            )}

          </div>
        </div>
      )}

      {/* Raffle Promo Modal */}
      {showRaffleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-gray-800 rounded-3xl max-w-lg w-full p-8 text-white shadow-2xl relative overflow-hidden">
            
            <button 
              onClick={() => setShowRaffleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tight">
              Canton Live Event Raffles
            </h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
              Exclusive Prizes For In-Person Attendees
            </p>

            <ul className="space-y-3 text-sm text-gray-300 mb-8">
              <li className="flex items-center gap-2 bg-[#111] p-3 rounded-xl border border-gray-800">
                <span className="text-[#f5a623] font-bold">•</span> Signed NFL Helmets & Memorabilia
              </li>
              <li className="flex items-center gap-2 bg-[#111] p-3 rounded-xl border border-gray-800">
                <span className="text-[#f5a623] font-bold">•</span> High-Stakes Championship Rings
              </li>
              <li className="flex items-center gap-2 bg-[#111] p-3 rounded-xl border border-gray-800">
                <span className="text-[#f5a623] font-bold">•</span> Free 1-Year FSAN Pro Subscriptions
              </li>
            </ul>

            <a 
              href="https://in-betweenmedia.com/product/draft-night-out-2026-tickets/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1b75bb] hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg transition-all"
            >
              Get Tickets to Canton Event <ExternalLink size={16} />
            </a>

          </div>
        </div>
      )}

    </div>
  );
}

export default function DNOPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1b75bb] animate-spin" />
      </div>
    }>
      <DNOPageContent />
    </Suspense>
  );
}