"use client";
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import NapkinLeaderboard from '../../../components/NapkinLeaderboard';
import { useSession } from 'next-auth/react';
import { MonitorSmartphone, Trophy, BookOpen, Handshake, HeartHandshake, ListOrdered, Loader2, AlertCircle, X } from 'lucide-react';

// Import our newly refactored child components and tabs
import SuccessToast from './components/SuccessToast';
import RaffleModal from './components/RaffleModal';
import DraftsTab from './tabs/DraftsTab';
import CharityTab from './tabs/CharityTab';
import PrizesTab from './tabs/PrizesTab';
import RulesTab from './tabs/RulesTab';
import SponsorsTab from './tabs/SponsorsTab';

export default function DraftNightOutClient({ proToolsMenu, connectMenu, initialLeaderboard }) {
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated';
  const isProPlus = session?.user?.tier === 'pro-plus';
  
  const [leagues, setLeagues] = useState([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [userJoinedCount, setUserJoinedCount] = useState(0);
  const [allottedEntries, setAllottedEntries] = useState(1);
  const [isProcessingEntry, setIsProcessingEntry] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [liveLeaderboard, setLiveLeaderboard] = useState(initialLeaderboard || { teams: [] });
  const [liveSeasonLabel, setLiveSeasonLabel] = useState("2025-2026 SEASON");

  const [confirmingLeague, setConfirmingLeague] = useState(null);
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [recentlyJoinedLeagues, setRecentlyJoinedLeagues] = useState([]);

  // Top-Level Navigation State
  const validTabs = ['drafts', 'leaderboard', 'charity', 'prizes', 'rules', 'sponsors'];
  const [activeTab, setActiveTab] = useState('drafts');
  
  // Drafts Sub-navigation State
  const [draftView, setDraftView] = useState('online');

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', window.location.pathname + `#${tabId}`);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (validTabs.includes(hash)) setActiveTab(hash);
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
    } catch (err) { console.warn("Failed syncing live DNO array: ", err); } 
    finally { setLoadingLeagues(false); }
  }, []);

  const loadLiveLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`/api/scl?action=dno_get_leaderboard_data&t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Could not fetch leaderboard action");
      const json = await res.json();
      if (json.success && json.data) {
        setLiveLeaderboard(json.data);
        if (json.data.season_label) setLiveSeasonLabel(json.data.season_label.toUpperCase());
      }
    } catch (err) { console.warn("Failed loading live initialization data arrays: ", err); }
  }, []);

  useEffect(() => {
    loadLiveLeaderboard();
    if (isAuthed) loadDnoPool(); else setLoadingLeagues(false);
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
      } else { setErrorMessage(data.message || 'Could not claim roster spot. Please try again.'); }
    } catch (err) { setErrorMessage('Network error processing registration.'); } 
    finally { setIsProcessingEntry(null); setConfirmingLeague(null); }
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
    } catch (e) { setErrorMessage('Could not initiate additional entry purchase window.'); }
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
      <Suspense fallback={null}><SuccessToast setActiveTab={setActiveTab} setDraftView={setDraftView} loadDnoPool={loadDnoPool} isAuthed={isAuthed} /></Suspense>
      {showRaffleModal && <RaffleModal setShowRaffleModal={setShowRaffleModal} />}

      {/* CONFIRMATION MODAL */}
      {confirmingLeague && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-gray-800 rounded-3xl max-w-md w-full shadow-2xl relative flex flex-col">
            <button onClick={() => setConfirmingLeague(null)} disabled={isProcessingEntry !== null} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[#111] hover:bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors z-10"><X size={18} /></button>
            <div className="p-6 md:p-8 text-center pt-12">
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight italic mb-3">Ready to Draft?</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">You are about to use <strong className="text-white">1 draft ticket</strong> to claim a team in:</p>
              <div className="mb-6 text-center"><span className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">{confirmingLeague.name}</span></div>
            </div>
            <div className="px-6 md:px-8 pb-3">
              <button onClick={() => handleClaimSpot(confirmingLeague.id)} disabled={isProcessingEntry !== null} className="w-full relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(27,117,187,0.2)] transition-transform hover:-translate-y-0.5">
                <div className="bg-[#151515] group-hover:bg-[#1a1a1a] transition-colors rounded-[10px] px-4 py-3.5 flex items-center justify-center gap-2 w-full h-full">
                  {isProcessingEntry === confirmingLeague.id ? <Loader2 size={16} className="animate-spin text-white" /> : <span className="font-black uppercase tracking-widest text-xs text-white">Join and Draft</span>}
                </div>
              </button>
            </div>
            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-3">
              <div className="flex items-start gap-3 bg-[#111] border border-gray-800 p-4 rounded-xl"><AlertCircle size={16} className="text-gray-500 shrink-0 mt-0.5" /><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">Please note: This action is final. Entry tickets cannot be refunded or transferred once you have joined a draft room.</p></div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24 relative z-10">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <main className="w-full animate-in fade-in duration-500">
            {/* HERO BANNER */}
            <div className="relative w-full h-[260px] md:h-[300px] flex items-end overflow-hidden rounded-2xl mb-10 shadow-2xl bg-[#0a0a0a]">
              <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60" style={{ backgroundImage: `url('https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Background.webp')` }} />
              <img src="https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp" alt="Draft Night Out Logo" className="absolute -right-10 md:right-4 top-1/2 -translate-y-1/2 w-[280px] md:w-[380px] h-auto object-contain opacity-20 md:opacity-40 z-0 pointer-events-none mix-blend-plus-lighter drop-shadow-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/90 via-[#121212]/50 to-transparent z-0 md:w-2/3" />
              <div className="relative z-10 w-full flex flex-col items-start justify-end h-full px-6 md:px-10 pb-8">
                <span className="inline-block py-1 px-3 rounded-full bg-[#1b75bb]/20 border border-[#1b75bb]/30 text-[#f5a623] font-bold text-[10px] uppercase tracking-widest mb-3 backdrop-blur-sm">The Biggest Fantasy Hang of the Year</span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">Draft Night Out</h1>
                <p className="text-gray-300 font-medium md:text-lg leading-relaxed drop-shadow-md max-w-2xl">Secure your seat at one of our live Draft Night Out events, or build your championship roster from home in our exclusive online divisions. Dominate your league to win incredible prizes and compete for the ultimate Playoff Challenge championship!</p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              {/* TAB SWITCHER - HORIZONTALLY SCROLLABLE */}
              <div className="flex items-center justify-start lg:justify-center gap-2 md:gap-4 py-2 px-2 md:px-4 mb-10 bg-[#151515] rounded-2xl border border-gray-800/50 w-full lg:w-fit mx-auto shadow-inner animate-in fade-in duration-500 delay-100 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'drafts', icon: MonitorSmartphone, label: 'Drafts' },
                  { id: 'leaderboard', icon: ListOrdered, label: 'Leaderboard' },
                  { id: 'charity', icon: HeartHandshake, label: 'Charity' },
                  { id: 'prizes', icon: Trophy, label: 'Prizes' },
                  { id: 'rules', icon: BookOpen, label: 'Rules' },
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

              {activeTab === 'drafts' && <DraftsTab draftView={draftView} setDraftView={setDraftView} isProPlus={isProPlus} ticketsAvailable={ticketsAvailable} handlePurchaseExtraEntry={handlePurchaseExtraEntry} errorMessage={errorMessage} loadingLeagues={loadingLeagues} leagues={leagues} sortedLeagues={sortedLeagues} recentlyJoinedLeagues={recentlyJoinedLeagues} setConfirmingLeague={setConfirmingLeague} setShowRaffleModal={setShowRaffleModal} />}
              {activeTab === 'leaderboard' && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><NapkinLeaderboard initialLeaderboard={liveLeaderboard} overrideSeasonLabel={liveSeasonLabel} /></div>}
              {activeTab === 'charity' && <CharityTab />}
              {activeTab === 'prizes' && <PrizesTab />}
              {activeTab === 'rules' && <RulesTab />}
              {activeTab === 'sponsors' && <SponsorsTab />}

            </div>
          </main>
        </div>
      </div>
    </>
  );
}