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
  let leaderboardData = { data: { teams: [], available_weeks: [] } };
  
  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
    const lbRes = await fetch('https://admin.fsan.com/wp-json/scl/v1/leaderboard', { next: { revalidate: 60 } });
    if (lbRes.ok) leaderboardData = await lbRes.json();
  } catch(e) { console.error("Data fetch error:", e); }

  return <NapkinClient proToolsMenu={proToolsMenu} connectMenu={connectMenu} initialLeaderboard={leaderboardData} />;
}