import React from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import RankingsModelClient from './RankingsModelClient';
import { PlayerProvider } from '../../../context/PlayerContext';
import { getMenuBySlug } from '../../../utils/api';

export const metadata = {
  title: 'Vegas Implied Rankings | FSAN',
  description: 'Fantasy football rankings calculated directly from Vegas prop bets.',
};

async function getVegasData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/odds-engine`, {
      next: { tags: ['vegas-rankings'] } 
    });
    
    if (!res.ok) return { rankings: [], mode: 'weekly' };
    return await res.json();
  } catch (error) {
    console.error("Error fetching local rankings API:", error);
    return { rankings: [], mode: 'weekly' };
  }
}

export default async function RankingsModelPage() {
  let proToolsMenu = [];
  let connectMenu = [];

  // Fetch the menus so the Sidebar renders correctly
  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
  } catch (e) {
    console.error(e);
  }

  // Fetch from our smart engine
  const { rankings, mode } = await getVegasData();

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0">
          <PlayerProvider>
            {/* We now pass the mode to the client so the UI knows how to display itself */}
            <RankingsModelClient initialRankings={rankings} mode={mode} />
          </PlayerProvider>
        </div>
      </div>
    </>
  );
}