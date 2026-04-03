import React from 'react';
import { getMenuBySlug } from '../../../utils/api'; 
import PlayerClient from './PlayerClient';

// --- DATA FETCHING ---

async function getESPNPlayerData(playerName) {
  try {
    // 1. Search across ESPN's entire global database
    const searchRes = await fetch(`https://site.web.api.espn.com/apis/search/v2?query=${encodeURIComponent(playerName)}&limit=10`, { 
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FSAN/1.0)' }
    });
    if (!searchRes.ok) throw new Error('Search failed');
    const searchData = await searchRes.json();
    
    const allContents = searchData?.results?.flatMap(r => r.contents || []) || [];
    
    // 2. Intelligently hunt for NFL, NBA, or MLB players in the results
    const athleteResult = allContents.find(c => {
      if (!c.url) return false;
      return c.url.includes('/nfl/player/') || 
             c.url.includes('/nba/player/') || 
             c.url.includes('/mlb/player/');
    });
    
    if (!athleteResult) return null;

    // 3. Dynamically extract the League, Sport, and Player ID from the URL
    const url = athleteResult.url;
    let league = '';
    let sportName = '';
    
    if (url.includes('/nfl/')) { league = 'nfl'; sportName = 'football'; }
    else if (url.includes('/nba/')) { league = 'nba'; sportName = 'basketball'; }
    else if (url.includes('/mlb/')) { league = 'mlb'; sportName = 'baseball'; }

    const urlParts = url.split('/');
    const idIndex = urlParts.indexOf('id') + 1;
    let playerId = urlParts[idIndex];
    if (!playerId && athleteResult.id) playerId = athleteResult.id;

    if (!playerId || !league || !sportName) return null;

    // 4. Hit the highly specific API endpoint for that exact sport and league!
    const playerRes = await fetch(`https://site.api.espn.com/apis/common/v3/sports/${sportName}/${league}/athletes/${playerId}`, { next: { revalidate: 3600 } });
    if (!playerRes.ok) throw new Error('Detail fetch failed');
    const playerData = await playerRes.json();
    
    // The ESPN API naturally returns the exact data structure our PlayerClient expects
    return playerData.athlete;
  } catch (error) {
    console.error("ESPN API Error for", playerName, ":", error);
    return null;
  }
}

async function getPlayerContent(playerName) {
  // Force Exact Phrase Match by wrapping the variable in escaped quotes
  const exactMatchQuery = `\\"${playerName}\\"`;
  
  const query = `
    query GetPlayerPosts {
      posts(where: {search: "${exactMatchQuery}"}, first: 50) {
        nodes {
          id
          title
          excerpt
          content 
          date
          slug
          author {
            node {
              name
              avatar { url }
            }
          }
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

      const d = new Date(post.date);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        date: safeDateString,
        imageUrl: post.featuredImage?.node?.sourceUrl || null,
        author: {
          name: post.author?.node?.name || null,
          avatar: post.author?.node?.avatar?.url || null
        },
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

  // Pass the data directly into the Client component
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