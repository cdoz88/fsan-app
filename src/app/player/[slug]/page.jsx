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
  // Use exact match phrase for a cleaner search
  const searchStr = encodeURIComponent(`"${playerName}"`);

  // Helper function to hit the native WP REST API safely
  const fetchRest = async (postType) => {
    try {
      // _embed=1 pulls in the images, authors, and categories in the same request
      const url = `https://admin.fsan.com/wp-json/wp/v2/${postType}?search=${searchStr}&_embed=1&per_page=50`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error(`REST Fetch Error for ${postType}:`, e);
      return [];
    }
  };

  // Run both queries in parallel against the REST API
  const [posts, videos] = await Promise.all([
    fetchRest('posts'),
    fetchRest('yt2posts_youtube')
  ]);

  const formatItem = (item, defaultType) => {
    // Extract category slugs from the WP REST _embedded object
    let cats = [];
    if (item._embedded && item._embedded['wp:term']) {
       const taxonomies = item._embedded['wp:term'];
       taxonomies.forEach(tax => {
          tax.forEach(term => {
             if (term.taxonomy === 'category') {
                cats.push(term.slug.toLowerCase());
             }
          });
       });
    }

    let type = defaultType;
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
      title: item.title?.rendered || '',
      excerpt: item.excerpt?.rendered || '',
      content: item.content?.rendered || '',
      date: safeDateString,
      rawDate: d.getTime(), // For absolute chronological sorting
      imageUrl: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      author: {
        name: item._embedded?.author?.[0]?.name || 'FSAN Staff',
        avatar: item._embedded?.author?.[0]?.avatar_urls?.['96'] || null
      },
      type,
      sport,
      slug: item.slug
    };
  };

  // Safely map in case API returns an error object instead of an array
  const formattedPosts = Array.isArray(posts) ? posts.map(p => formatItem(p, 'article')) : [];
  const formattedVideos = Array.isArray(videos) ? videos.map(v => formatItem(v, 'video')) : [];

  // Merge the two independent lists together and sort them chronologically
  const combinedContent = [...formattedPosts, ...formattedVideos].sort((a, b) => b.rawDate - a.rawDate);
  
  // Strip the rawDate out before passing to the client component
  return combinedContent.map(({ rawDate, ...rest }) => rest);
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