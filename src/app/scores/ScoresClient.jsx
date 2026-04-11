"use client";
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();
  const [userTier, setUserTier] = useState('free');

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

  // Fetch role to determine if they can see the Fantasy tab
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.token) {
      const fetchUserRole = async () => {
        const query = `query GetViewerRole { viewer { roles { nodes { name } } } }`;
        try {
          const res = await fetch('https://admin.fsan.com/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.user.token}`,
            },
            body: JSON.stringify({ query }),
          });
          const json = await res.json();
          if (json?.data?.viewer) {
            const roles = json.data.viewer.roles?.nodes?.map(r => r.name.toLowerCase()) || [];
            if (roles.some(r => r.includes('pro+') || r.includes('pro plus') || r.includes('pro-plus') || r.includes('pro_plus'))) {
              setUserTier('pro-plus');
            } else if (roles.some(r => r.includes('pro') || r.includes('pro member') || r.includes('fsan_pro'))) {
              setUserTier('pro');
            } else {
              setUserTier('free');
            }
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchUserRole();
    } else if (status === 'unauthenticated') {
      setUserTier('free');
    }
  }, [status, session]);

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

  const isPro = userTier === 'pro' || userTier === 'pro-plus';
  const currentTab = isPro ? activeTab : 'scores';

  return (
    <QueryClientProvider client={queryClient}>
        {isPro && (
          <div className="flex flex-col items-center mb-6 pt-6 animate-in fade-in duration-500">
              <SegmentedControl
              activeTab={currentTab}
              onTabChange={handleTabChange}
              tabs={tabs}
              />
          </div>
        )}
        
        {/* Invisible spacer for free users to maintain alignment */}
        {!isPro && <div className="pt-6"></div>}

        {selectedGame ? (
            <GameDetails 
            gameId={selectedGame.id} 
            leagueId={selectedGame.league} 
            onBack={() => setSelectedGame(null)} 
            />
        ) : currentTab === 'scores' ? (
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