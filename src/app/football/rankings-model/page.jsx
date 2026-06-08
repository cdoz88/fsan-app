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
  // Gracefully fallback to localhost if production URL isn't set yet
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/odds-engine`, {
      next: { tags: ['vegas-rankings'] },
      cache: 'no-store' // Avoid caching empty responses during debugging
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API response was not OK (${res.status}):`, errorText);
      return { rankings: [], mode: 'offseason', error: `Server error: ${res.status}` };
    }
    return await res.json();
  } catch (error) {
    console.error("Internal fetch exception calling /api/odds-engine:", error);
    return { rankings: [], mode: 'offseason', error: error.message };
  }
}

export default async function RankingsModelPage() {
  let proToolsMenu = [];
  let connectMenu = [];

  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
  } catch (e) {
    console.error(e);
  }

  const { rankings, mode, error } = await getVegasData();

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0">
          <PlayerProvider>
            <RankingsModelClient initialRankings={rankings} mode={mode} serverError={error} />
          </PlayerProvider>
        </div>
      </div>
    </>
  );
}