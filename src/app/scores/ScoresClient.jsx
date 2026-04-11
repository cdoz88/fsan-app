"use client";
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { SegmentedControl } from '../../components/SegmentedControl';

// Dynamically import the heavy data components and disable Server-Side Rendering (SSR)
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

export default function ScoresClient() {
  const [activeTab, setActiveTab] = useState('scores');
  const [selectedGame, setSelectedGame] = useState(null); 

  const [date, setDate] = useState(null);
  const [selectedSport, setSelectedSport] = useState('ALL SPORTS');
  const [selectedLeague, setSelectedLeague] = useState('ALL');
  
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
    </QueryClientProvider>
  );
}