import React from 'react';
import { getMenuBySlug } from '../../../utils/api'; // Corrected path (3 dots)
import PlayerClient from './PlayerClient';

// --- DATA FETCHING ---

// 1. Fetch from ESPN APIs
async function getESPNPlayerData(playerName) {
  try {
    // Attempt 1: Search API
    const searchRes = await fetch(`https://site.web.api.espn.com/apis/search/v2?query=${encodeURIComponent(playerName)}&limit=5`, { next: { revalidate: 3600 } });
    if (!searchRes.ok) throw new Error('Search failed');
    const searchData = await searchRes.json();
    
    // Look for a football player in the results
    const athleteResult = searchData?.results?.[0]?.contents?.find(c => 
      c.url && c.url.includes('/nfl/player/') || 
      (c.url && c.url.includes('/player/') && c.sport === 'football')
    );
    
    if (!athleteResult) {
       console.log("No athlete found in search for:", playerName);
       return null;
    }

    // Extract ID
    const urlParts = athleteResult.url.split('/');
    const idIndex = urlParts.indexOf('id') + 1;
    const playerId = urlParts[idIndex] || athleteResult.id;

    if (!playerId) {
       console.log("Could not extract player ID from URL:", athleteResult.url);
       return null;
    }

    // Fetch the detailed payload
    const playerRes = await fetch(`https://site.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${playerId}`, { next: { revalidate: 3600 } });
    if (!playerRes.ok) throw new Error('Detail fetch failed');
    const playerData = await playerRes.json();
    
    return playerData.athlete;
  } catch (error) {
    console.error("ESPN API Error for", playerName, ":", error);
    return null;
  }
}

// 2. Fetch from your WordPress GraphQL
async function getPlayerContent(playerName) {
  const query = `
    query GetPlayerPosts {
      posts(where: {search: "${playerName}"}, first: 50) {
        nodes {
          id
          title
          excerpt
          date
          slug
          featuredImage { node { sourceUrl } }
          categories { nodes { name } }
          tags { nodes { name } }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://admin.fsan.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      next: { revalidate: 60 }
    });
    
    const json = await res.json();
    const posts = json?.data?.posts?.nodes || [];

    return posts.map(post => {
      const cats = post.categories?.nodes?.map(c => c.name.toLowerCase()) || [];
      let type = 'article';
      if (cats.includes('video') || cats.includes('videos')) type = 'video';
      else if (cats.includes('short') || cats.includes('shorts')) type = 'short';
      else if (cats.includes('podcast') || cats.includes('podcasts')) type = 'podcast';

      let sport = 'All';
      if (cats.includes('football')) sport = 'Football';
      if (cats.includes('basketball')) sport = 'Basketball';
      if (cats.includes('baseball')) sport = 'Baseball';

      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        imageUrl: post.featuredImage?.node?.sourceUrl || null,
        type,
        sport,
        slug: post.slug
      };
    });
  } catch (error) {
    console.error("WP GraphQL Error:", error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug: rawSlug } = await params;
  const playerName = rawSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
    title: `${playerName} | FSAN`,
  };
}

export default async function PlayerPage({ params }) {
  const { slug: rawSlug } = await params;
  const playerName = rawSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const [espnData, content] = await Promise.all([
    getESPNPlayerData(playerName),
    getPlayerContent(playerName)
  ]);

  // Handle missing API functions gracefully if getMenuBySlug isn't exported yet
  let proToolsMenu = [];
  let connectMenu = [];
  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
  } catch(e) {
    console.error("Menu fetch failed:", e);
  }

  return (
    <PlayerClient 
       playerName={playerName}
       rawSlug={rawSlug}
       espnData={espnData}
       content={content}
       proToolsMenu={proToolsMenu}
       connectMenu={connectMenu}
    />
  );
}