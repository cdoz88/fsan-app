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
  // 1. Bulletproof URL Resolver
  let baseUrl = 'http://localhost:3000';
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  } else if (process.env.VERCEL_URL) {
    // Vercel automatically populates this, but we must add the https:// protocol manually
    baseUrl = `https://${process.env.VERCEL_URL}`;
  }

  // Strip any accidental trailing slashes to prevent //api/odds-engine
  baseUrl = baseUrl.replace(/\/$/, "");
  
  try {
    const res = await fetch(`${baseUrl}/api/odds-engine`, {
      next: { tags: ['vegas-rankings'] },
      cache: 'no-store' // Prevents Vercel from permanently caching an error state during debugging
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      return { rankings: [], mode: 'offseason', error: `API status code ${res.status}: ${errorText}` };
    }
    return await res.json();
  } catch (error) {
    console.error("Internal fetch exception calling /api/odds-engine:", error);
    return { rankings: [], mode: 'offseason', error: `Network connection error (${error.message}) using base target: ${baseUrl}` };
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