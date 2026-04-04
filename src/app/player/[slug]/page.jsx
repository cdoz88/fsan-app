import React from 'react';
import { getMenuBySlug } from '../../../utils/api'; 
import PlayerClient from './PlayerClient';

// --- DATA FETCHING ---

async function getESPNPlayerData(playerName) {
  try {
    const searchRes = await fetch(`https://site.web.api.espn.com/apis/search/v2?query=${encodeURIComponent(playerName)}&limit=10`, { 
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FSAN/1.0)' }
    });
    if (!searchRes.ok) throw new Error('Search failed');
    const searchData = await searchRes.json();
    
    const allContents = searchData?.results?.flatMap(r => r.contents || []) || [];
    
    const athleteResult = allContents.find(c => c.uid && c.uid.includes('~a:'));
    if (!athleteResult) return null;

    const uidParts = athleteResult.uid.split('~');
    let sportCode = '';
    let leagueCode = '';
    let playerId = '';

    uidParts.forEach(part => {
      if (part.startsWith('s:')) sportCode = part.replace('s:', '');
      if (part.startsWith('l:')) leagueCode = part.replace('l:', '');
      if (part.startsWith('a:')) playerId = part.replace('a:', '');
    });

    if (!playerId) return null;

    let sportString = '';
    let leagueString = '';

    if (sportCode === '20') {
      sportString = 'football';
      leagueString = leagueCode === '28' ? 'nfl' : 'college-football';
    } else if (sportCode === '40') {
      sportString = 'basketball';
      leagueString = leagueCode === '46' ? 'nba' : (leagueCode === '54' ? 'wnba' : 'mens-college-basketball');
    } else if (sportCode === '1') {
      sportString = 'baseball';
      leagueString = leagueCode === '10' ? 'mlb' : 'college-baseball';
    } else {
      return null;
    }

    const [playerRes, overviewRes, statsRes] = await Promise.all([
      fetch(`https://site.api.espn.com/apis/common/v3/sports/${sportString}/${leagueString}/athletes/${playerId}`, { next: { revalidate: 3600 } }),
      fetch(`https://site.web.api.espn.com/apis/common/v3/sports/${sportString}/${leagueString}/athletes/${playerId}/overview`, { next: { revalidate: 3600 } }),
      fetch(`https://site.web.api.espn.com/apis/common/v3/sports/${sportString}/${leagueString}/athletes/${playerId}/statistics`, { next: { revalidate: 3600 } })
    ]);
    
    if (!playerRes.ok) throw new Error('Detail fetch failed');
    
    const playerData = await playerRes.json();
    const overviewData = overviewRes.ok ? await overviewRes.json() : null;
    const statsData = statsRes.ok ? await statsRes.json() : null;
    
    return {
      ...playerData.athlete,
      overview: overviewData,
      deepStats: statsData
    };

  } catch (error) {
    console.error("ESPN API Error for", playerName, ":", error);
    return null;
  }
}

async function getPlayerContent(playerName) {
  const exactMatchQuery = `\\"${playerName}\\"`;
  
  // Expanded GraphQL query to fetch both standard posts and dedicated video CPTs
  const query = `
    query GetPlayerContent {
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
        }
      }
      videos(where: {search: "${exactMatchQuery}"}, first: 50) {
        nodes {
          id
          title
          content 
          date
          slug
          featuredImage { node { sourceUrl } }
          categories { nodes { name } }
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
    const videos = json?.data?.videos?.nodes || [];

    const formatItem = (item, defaultType) => {
      const cats = item.categories?.nodes?.map(c => c.name.toLowerCase()) || [];
      
      let type = defaultType;
      // Allow WP Categories to override standard post types if needed
      if (defaultType === 'article') {
        if (cats.includes('video') || cats.includes('videos')) type = 'video';
        else if (cats.includes('short') || cats.includes('shorts')) type = 'short';
        else if (cats.includes('podcast') || cats.includes('podcasts')) type = 'podcast';
      }

      let sport = 'All';
      if (cats.includes('football')) sport = 'Football';
      if (cats.includes('basketball')) sport = 'Basketball';
      if (cats.includes('baseball')) sport = 'Baseball';

      const d = new Date(item.date);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

      return {
        id: item.id,
        title: item.title,
        excerpt: item.excerpt || '',
        content: item.content,
        date: safeDateString,
        rawDate: d.getTime(), // Used for exact timeline sorting
        imageUrl: item.featuredImage?.node?.sourceUrl || null,
        author: {
          name: item.author?.node?.name || null,
          avatar: item.author?.node?.avatar?.url || null
        },
        type,
        sport,
        slug: item.slug
      };
    };

    const formattedPosts = posts.map(p => formatItem(p, 'article'));
    const formattedVideos = videos.map(v => formatItem(v, 'video'));

    // Interweave posts and videos, sorted by newest first
    const combinedContent = [...formattedPosts, ...formattedVideos].sort((a, b) => b.rawDate - a.rawDate);
    
    // Strip out the rawDate before passing to client to keep props clean
    return combinedContent.map(({ rawDate, ...rest }) => rest);

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