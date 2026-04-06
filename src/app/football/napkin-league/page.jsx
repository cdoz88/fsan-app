import React from 'react';
import { getMenuBySlug } from '../../../utils/api';
import NapkinClient from './NapkinClient';

export const metadata = {
  title: 'The Napkin League | FSAN',
  description: 'Join The Napkin League: Fantasy Football for a Cause. Compete, earn custom collectibles, and support Mission 22.',
};

export default async function NapkinPage() {
  let proToolsMenu = [];
  let connectMenu = [];
  let leaderboardData = [];
  
  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
  } catch(e) {
    console.error("Menu fetch failed:", e);
  }

  try {
    // SERVER-SIDE FETCH: Bypasses browser CORS and ad-blockers!
    const lbRes = await fetch('https://admin.fsan.com/wp-json/scl/v1/leaderboard', { 
      next: { revalidate: 60 } // Caches the data and checks for new scores every 60 seconds
    });
    
    if (lbRes.ok) {
      const lbJson = await lbRes.json();
      leaderboardData = lbJson.teams || [];
    } else {
      console.error("Leaderboard Endpoint returned:", lbRes.status);
    }
  } catch(e) {
    console.error("Leaderboard fetch failed:", e);
  }

  return (
    <NapkinClient 
      proToolsMenu={proToolsMenu} 
      connectMenu={connectMenu} 
      initialLeaderboard={leaderboardData} 
    />
  );
}