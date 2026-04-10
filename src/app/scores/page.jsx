"use client";
import React, { useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Standard import for the tab switcher
import { SegmentedControl } from '../../components/SegmentedControl';

// Dynamically import the heavy data components and disable Server-Side Rendering (SSR)
// This prevents Vercel build crashes for components using dates, localStorage, or window objects.
const Scoreboard = dynamic(
  () => import('../../components/Scoreboard').then((mod) => mod.Scoreboard),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-600" size={48} /></div>
  }
);

const GameDetails = dynamic(
  () => import('../../components/GameDetails').then((mod) => mod.GameDetails),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-600" size={48} /></div>
  }
);

const Fantasy = dynamic(
  () => import('../../components/Fantasy').then((mod) => mod.Fantasy),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-600" size={48} /></div>
  }
);

// Initialize the React Query Client for the Scoreboard data fetching
const queryClient = new QueryClient();

export default function ScoresPage() {
  const activeSport = 'All'; 

  // --- TAB & VIEW STATE ---
  const [activeTab, setActiveTab] = useState('scores');
  const [selectedGame, setSelectedGame] = useState(null); // { id: string; league: string }

  // --- SCOREBOARD STATE ---
  const [date, setDate] = useState(new Date());
  const [selectedSport, setSelectedSport] = useState('ALL SPORTS');
  const [selectedLeague, setSelectedLeague] = useState('ALL');

  const tabs = [
    { id: 'scores', label: 'Scores' },
    { id: 'fantasy', label: 'Fantasy' },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedGame(null); // Reset detail view when switching tabs
  };

  const handleSelectGame = (id, league) => {
    setSelectedGame({ id, league });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col overflow-hidden bg-[#121212]">
        <Header activeSport={activeSport} />
        
        <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row overflow-hidden">
          <Sidebar activeSport={activeSport} />
          
          {/* FIX: Added flex-1, relative, and overflow-y-auto!
            This creates an isolated scroll box. The page will not scroll, only the content inside this div will scroll.
            This ensures the main header stays visible, and the GameDetails sticky header stops directly beneath it! 
          */}
          <main className="flex-1 relative overflow-y-auto w-full px-4 md:px-8 lg:px-10 pt-6 pb-24 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
               
               {/* THE TAB SWITCHER */}
               <div className="flex flex-col items-center mb-6">
                  <SegmentedControl
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    tabs={tabs}
                  />
               </div>

               {/* MAIN CONTENT AREA */}
               {selectedGame ? (
                  <GameDetails 
                    gameId={selectedGame.id} 
                    leagueId={selectedGame.league} 
                    onBack={() => setSelectedGame(null)} 
                  />
               ) : activeTab === 'scores' ? (
                  <Scoreboard 
                    date={date}
                    setDate={setDate}
                    selectedSport={selectedSport}
                    setSelectedSport={setSelectedSport}
                    selectedLeague={selectedLeague}
                    setSelectedLeague={setSelectedLeague}
                    onSelectGame={handleSelectGame}
                  />
               ) : (
                  <Fantasy />
               )}

            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}