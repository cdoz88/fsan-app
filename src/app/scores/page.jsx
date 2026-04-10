"use client";
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { SegmentedControl } from '../../components/SegmentedControl';

const Scoreboard = dynamic(
  () => import('../../components/Scoreboard').then((mod) => mod.Scoreboard),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-600" size={48} /></div> }
);

const GameDetails = dynamic(
  () => import('../../components/GameDetails').then((mod) => mod.GameDetails),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-600" size={48} /></div> }
);

const Fantasy = dynamic(
  () => import('../../components/Fantasy').then((mod) => mod.Fantasy),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-600" size={48} /></div> }
);

const queryClient = new QueryClient();

export default function ScoresPage() {
  const activeSport = 'All'; 

  const [activeTab, setActiveTab] = useState('scores');
  const [selectedGame, setSelectedGame] = useState(null);
  
  const [date, setDate] = useState(null);
  const [selectedSport, setSelectedSport] = useState('ALL SPORTS');
  const [selectedLeague, setSelectedLeague] = useState('ALL');
  
  // This state prevents the Hydration mismatch caused by timezones!
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setDate(new Date());
    setIsMounted(true);
  }, []);

  const tabs = [
    { id: 'scores', label: 'Scores' },
    { id: 'fantasy', label: 'Fantasy' },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedGame(null); 
  };

  const handleSelectGame = (id, league) => {
    setSelectedGame({ id, league });
  };

  if (!isMounted || !date) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col overflow-hidden bg-[#121212]">
        <Header activeSport={activeSport} />
        
        <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row overflow-hidden">
          <Sidebar activeSport={activeSport} />
          
          {/* We changed pt-6 to pt-0 right here on the main tag! */}
          <main className="flex-1 relative overflow-y-auto w-full px-4 md:px-8 lg:px-10 pt-0 pb-24 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
               
               <div className="flex flex-col items-center mb-6 pt-6">
                  <SegmentedControl
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    tabs={tabs}
                  />
               </div>

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