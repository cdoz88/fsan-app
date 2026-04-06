import React from 'react';
import { getMenuBySlug, fetchGraphQL } from '../../../utils/api';
import NapkinClient from './NapkinClient';

export const metadata = {
  title: 'The Napkin League | FSAN',
  description: 'Join The Napkin League: Fantasy Football for a Cause. Compete, earn custom collectibles, and support Mission 22.',
};

export default async function NapkinPage() {
  let proToolsMenu = [];
  let connectMenu = [];
  let leaderboardData = { data: { teams: [], available_weeks: [], winners_registry: {} } };
  let updates = [];
  
  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
    
    // Fetch Leaderboard
    const lbRes = await fetch('https://admin.fsan.com/wp-json/scl/v1/leaderboard', { next: { revalidate: 60 } });
    if (lbRes.ok) leaderboardData = await lbRes.json();

    // Fetch Napkin League Updates
    const updatesQuery = `
      query GetNapkinUpdates {
        posts(where: { tag: "napkinleague" }, first: 20) {
          nodes {
            id
            title
            slug
            excerpt
            date
            featuredImage {
              node {
                sourceUrl
              }
            }
          }
        }
      }
    `;
    const updatesData = await fetchGraphQL(updatesQuery);
    if (updatesData?.posts?.nodes) {
      updates = updatesData.posts.nodes;
    }

  } catch(e) { console.error("Data fetch error:", e); }

  return (
    <NapkinClient 
      proToolsMenu={proToolsMenu} 
      connectMenu={connectMenu} 
      initialLeaderboard={leaderboardData} 
      updates={updates}
    />
  );
}