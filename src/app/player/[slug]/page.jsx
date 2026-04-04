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
  // 1. Fetch Articles Using Your Exact Working GraphQL Query
  const exactMatchQuery = `\\"${playerName}\\"`;
  const postsQuery = `
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

  let posts = [];
  try {
    const res = await fetch('https://admin.fsan.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: postsQuery }),
      next: { revalidate: 60 }
    });
    const json = await res.json();
    posts = json?.data?.posts?.nodes || [];
  } catch (error) {
    console.error("WP GraphQL Error:", error);
  }

  // 2. Fetch Videos Using the Custom FSAN Feed Endpoint
  // This grabs the 200 most recent videos so we can manually search the custom youtube_description field
  let videos = [];
  try {
    const feedUrl1 = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=videos&per_page=100&page=1`;
    const feedUrl2 = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=videos&per_page=100&page=2`;
    
    const [res1, res2] = await Promise.all([
      fetch(feedUrl1, { next: { revalidate: 60 } }),
      fetch(feedUrl2, { next: { revalidate: 60 } })
    ]);
    
    let allVids = [];
    if (res1.ok) allVids = allVids.concat(await res1.json());
    if (res2.ok) allVids = allVids.concat(await res2.json());

    // Manually filter videos to ensure we catch the player's name in the custom description
    const playerNameLower = playerName.toLowerCase();
    videos = allVids.filter(v => {
      const title = (v.title?.rendered || '').toLowerCase();
      const content = (v.content?.rendered || '').toLowerCase();
      const desc = (v.youtube_description || '').toLowerCase();
      return title.includes(playerNameLower) || content.includes(playerNameLower) || desc.includes(playerNameLower);
    });
  } catch (e) {
    console.error("Video fetch error:", e);
  }

  // Standard regex to parse YouTube IDs for the pop-up modal
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

  const formattedPosts = posts.map(post => {
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

    // Extract youtubeId so the modal works correctly if an article happens to be a video post
    let youtubeId = null;
    const ytMatch = post.content?.match(ytRegex);
    if (ytMatch && ytMatch[1]) {
      youtubeId = ytMatch[1];
    }

    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      date: safeDateString,
      rawDate: d.getTime(),
      imageUrl: post.featuredImage?.node?.sourceUrl || null,
      author: {
        name: post.author?.node?.name || null,
        avatar: post.author?.node?.avatar?.url || null
      },
      type,
      sport,
      slug: post.slug,
      youtubeId
    };
  });

  const formattedVideos = videos.map(item => {
    let cats = item.category_slugs || [];
    
    let sport = 'All';
    if (cats.includes('football') || cats.includes('nfl')) sport = 'Football';
    if (cats.includes('basketball') || cats.includes('nba')) sport = 'Basketball';
    if (cats.includes('baseball') || cats.includes('mlb')) sport = 'Baseball';

    const d = new Date(item.date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

    let contentHtml = item.content?.rendered || '';
    
    // If there's a custom youtube description, append it so it shows up in the modal!
    if (item.youtube_description) {
        const formattedDesc = item.youtube_description.replace(/(?:\r\n|\r|\n)/g, '<br/>');
        contentHtml += `<br/><br/><div>${formattedDesc}</div>`;
    }

    // Extract youtubeId from the content so the content modal displays the YouTube video properly
    let youtubeId = null;
    const ytMatch = contentHtml.match(ytRegex);
    if (ytMatch && ytMatch[1]) {
      youtubeId = ytMatch[1];
    }

    return {
      id: item.id.toString(),
      title: item.title?.rendered || '',
      excerpt: item.excerpt?.rendered || '',
      content: contentHtml,
      date: safeDateString,
      rawDate: d.getTime(),
      imageUrl: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      author: {
        name: item._embedded?.author?.[0]?.name || 'FSAN Staff',
        avatar: item.author_avatar_url || null
      },
      type: cats.includes('shorts') || cats.includes('short') ? 'short' : 'video',
      sport,
      slug: item.slug || item.id.toString(),
      youtubeId
    };
  });

  // Interweave posts and videos, sorted by newest first
  const combinedContent = [...formattedPosts, ...formattedVideos].sort((a, b) => b.rawDate - a.rawDate);
  
  // Strip out the rawDate before passing to client to keep props clean
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