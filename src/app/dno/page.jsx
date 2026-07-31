"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { MonitorSmartphone, Trophy, BookOpen, Handshake, ListOrdered, HeartHandshake } from 'lucide-react';

// Importing from the newly relocated DNO components folder
import DNOHeader from '../../components/dno/DNOHeader';
import DNOAuthModal from '../../components/dno/DNOAuthModal';
import DraftsTab from '../../components/dno/tabs/DraftsTab';
import PrizesTab from '../../components/dno/tabs/PrizesTab';
import RulesTab from '../../components/dno/tabs/RulesTab';
import SponsorsTab from '../../components/dno/tabs/SponsorsTab';
import CharityTab from '../../components/dno/tabs/CharityTab';
import NapkinLeaderboard from '../../components/dno/NapkinLeaderboard';

export default function DNOPublicPage() {
  const [activeTab, setActiveTab] = useState('drafts');
  const [draftView, setDraftView] = useState('online');
  const [showAuthModal, setShowAuthModal] = useState(null); // 'login' or 'register'
  
  const [leagues, setLeagues] = useState([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [liveLeaderboard, setLiveLeaderboard] = useState({ teams: [] });
  const [liveSeasonLabel, setLiveSeasonLabel] = useState("2026 SEASON");

  // Fetch the live pool data so the DraftsTab shows accurate, real-time FOMO numbers
  const loadDnoPool = useCallback(async () => {
    try {
      const res = await fetch(`/api/scl?type=dno_pool&t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Could not reach DNO matrix");
      const data = await res.json();
      setLeagues(data.leagues || []);
    } catch (err) { 
      console.warn("Failed syncing live DNO array: ", err); 
    } finally { 
      setLoadingLeagues(false); 
    }
  }, []);

  // Fetch the live leaderboard
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

  useEffect(() => {
    loadLiveLeaderboard();
    loadDnoPool();
  }, [loadDnoPool, loadLiveLeaderboard]);

  const sortedLeagues = [...leagues].sort((a, b) => {
    const isFullA = a.filled_spots >= a.total_spots;
    const isFullB = b.filled_spots >= b.total_spots;
    if (isFullA === isFullB) return 0;
    return isFullA ? 1 : -1;
  });

  const handleTabClick = (tabId) => setActiveTab(tabId);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col font-sans selection:bg-[#1b75bb] selection:text-white">
      
      {/* Standalone DNO Header */}
      <DNOHeader onOpenAuthModal={setShowAuthModal} />

      {/* Auth Modal Injection */}
      {showAuthModal && (
        <DNOAuthModal 
          initialMode={showAuthModal} 
          onClose={() => setShowAuthModal(null)} 
        />
      )}

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 pt-6 pb-24">
        
        {/* Hero Section */}
        <div className="relative w-full h-[260px] md:h-[350px] flex items-end overflow-hidden rounded-3xl mb-10 shadow-2xl bg-[#0a0a0a]">
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60" style={{ backgroundImage: `url('https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Background.webp')` }} />
          <img src="https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp" alt="Draft Night Out Logo" className="absolute -right-10 md:right-4 top-1/2 -translate-y-1/2 w-[280px] md:w-[450px] h-auto object-contain opacity-20 md:opacity-40 z-0 pointer-events-none mix-blend-plus-lighter drop-shadow-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent z-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/90 via-[#09090b]/50 to-transparent z-0 md:w-2/3" />
          
          <div className="relative z-10 w-full flex flex-col items-start justify-end h-full px-6 md:px-10 pb-10">
            <span className="inline-block py-1.5 px-4 rounded-full bg-[#1b75bb]/20 border border-[#1b75bb]/30 text-[#f5a623] font-bold text-[10px] uppercase tracking-widest mb-4 backdrop-blur-sm">The Biggest Fantasy Hang of the Year</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-3">Draft Night Out</h1>
            <p className="text-gray-300 font-medium md:text-lg leading-relaxed drop-shadow-md max-w-2xl">Secure your seat at one of our live Draft Night Out events, or build your championship roster from home in our exclusive online divisions. Dominate your league to win incredible prizes!</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          
          {/* Tab Navigation */}
          <div className="flex items-center justify-start lg:justify-center gap-2 md:gap-4 py-2 px-2 md:px-4 mb-10 bg-[#151515] rounded-2xl border border-gray-800/50 w-full lg:w-fit mx-auto shadow-inner overflow-x-auto scrollbar-hide">
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

          {/* Dynamic Content Switching */}
          {activeTab === 'drafts' && (
            <DraftsTab 
              draftView={draftView} 
              setDraftView={setDraftView} 
              isProPlus={false} // Forced false for public users so they see locks and are prompted to register
              ticketsAvailable={0} 
              handlePurchaseExtraEntry={() => setShowAuthModal('register')} 
              loadingLeagues={loadingLeagues} 
              leagues={leagues} 
              sortedLeagues={sortedLeagues} 
              recentlyJoinedLeagues={[]} 
              setConfirmingLeague={() => setShowAuthModal('register')} 
            />
          )}
          {activeTab === 'leaderboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <NapkinLeaderboard initialLeaderboard={liveLeaderboard} overrideSeasonLabel={liveSeasonLabel} />
            </div>
          )}
          {activeTab === 'charity' && <CharityTab />}
          {activeTab === 'prizes' && <PrizesTab />}
          {activeTab === 'rules' && <RulesTab />}
          {activeTab === 'sponsors' && <SponsorsTab />}
          
        </div>
      </main>
    </div>
  );
}