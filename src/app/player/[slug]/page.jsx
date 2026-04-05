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
    let sportName = 'All'; // Dynamically capturing the Sport Name for the UI

    if (sportCode === '20') {
      sportString = 'football';
      sportName = 'Football';
      leagueString = leagueCode === '28' ? 'nfl' : 'college-football';
    } else if (sportCode === '40') {
      sportString = 'basketball';
      sportName = 'Basketball';
      leagueString = leagueCode === '46' ? 'nba' : (leagueCode === '54' ? 'wnba' : 'mens-college-basketball');
    } else if (sportCode === '1') {
      sportString = 'baseball';
      sportName = 'Baseball';
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
      deepStats: statsData,
      sportName // Pass this to the client
    };

  } catch (error) {
    console.error("ESPN API Error for", playerName, ":", error);
    return null;
  }
}

async function getPlayerContent(playerName) {
  const exactMatchQuery = `\\"${playerName}\\"`;
  
  // 1. Fetch Articles Using GraphQL
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

  // 2. Fetch Videos & Podcasts Using the Custom FSAN Feed Endpoint
  let videos = [];
  let podcasts = [];
  try {
    const feedUrl1 = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=videos&per_page=100&page=1`;
    const feedUrl2 = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=videos&per_page=100&page=2`;
    
    const podUrl1 = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=podcasts&per_page=100&page=1`;
    const podUrl2 = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=podcasts&per_page=100&page=2`;

    const [v1, v2, p1, p2] = await Promise.all([
      fetch(feedUrl1, { next: { revalidate: 60 } }),
      fetch(feedUrl2, { next: { revalidate: 60 } }),
      fetch(podUrl1, { next: { revalidate: 60 } }),
      fetch(podUrl2, { next: { revalidate: 60 } })
    ]);
    
    let allVids = [];
    if (v1.ok) allVids = allVids.concat(await v1.json());
    if (v2.ok) allVids = allVids.concat(await v2.json());

    let allPods = [];
    if (p1.ok) allPods = allPods.concat(await p1.json());
    if (p2.ok) allPods = allPods.concat(await p2.json());

    const playerNameLower = playerName.toLowerCase();
    
    videos = allVids.filter(v => {
      const title = (v.title?.rendered || '').toLowerCase();
      const content = (v.content?.rendered || '').toLowerCase();
      const desc = (v.youtube_description || '').toLowerCase();
      return title.includes(playerNameLower) || content.includes(playerNameLower) || desc.includes(playerNameLower);
    });

    podcasts = allPods.filter(p => {
      const title = (p.title?.rendered || '').toLowerCase();
      const content = (p.content?.rendered || '').toLowerCase();
      return title.includes(playerNameLower) || content.includes(playerNameLower);
    });
  } catch (e) {
    console.error("Feed fetch error:", e);
  }

  const stripTags = (html) => html ? html.replace(/<\/?[^>]+(>|$)/g, "").trim() : '';
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

  const formattedPosts = posts.reduce((acc, post) => {
    const cats = post.categories?.nodes?.map(c => c.name.toLowerCase()) || [];
    if (cats.some(c => c.includes('pod') || c.includes('video') || c.includes('short'))) return acc;

    let sport = 'All';
    if (cats.includes('football')) sport = 'Football';
    if (cats.includes('basketball')) sport = 'Basketball';
    if (cats.includes('baseball')) sport = 'Baseball';

    const d = new Date(post.date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

    acc.push({
      id: post.id,
      title: post.title,
      excerpt: stripTags(post.excerpt),
      content: post.content,
      date: safeDateString,
      rawDate: d.getTime(),
      imageUrl: post.featuredImage?.node?.sourceUrl || null,
      author: {
        name: post.author?.node?.name || null,
        avatar: post.author?.node?.avatar?.url || null
      },
      type: 'article',
      sport,
      slug: post.slug
    });
    return acc;
  }, []);

  const formattedVideos = videos.map(item => {
    const cats = item.category_slugs || []; 
    
    let sport = 'All';
    if (cats.includes('football') || cats.includes('nfl')) sport = 'Football';
    if (cats.includes('basketball') || cats.includes('nba')) sport = 'Basketball';
    if (cats.includes('baseball') || cats.includes('mlb')) sport = 'Baseball';

    let type = 'video';
    if (cats.includes('shorts') || cats.includes('short') || cats.includes('football-shorts')) {
      type = 'short';
    }

    const d = new Date(item.date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

    let contentHtml = item.content?.rendered || '';
    if (item.youtube_description) {
        const formattedDesc = item.youtube_description.replace(/(?:\r\n|\r|\n)/g, '<br/>');
        contentHtml += `<br/><br/><div>${formattedDesc}</div>`;
    }

    let youtubeId = null;
    const ytMatch = contentHtml.match(ytRegex);
    if (ytMatch && ytMatch[1]) youtubeId = ytMatch[1];

    return {
      id: item.id.toString(),
      title: stripTags(item.title?.rendered || ''),
      excerpt: stripTags(item.excerpt?.rendered || ''),
      content: contentHtml,
      date: safeDateString,
      rawDate: d.getTime(),
      imageUrl: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      author: {
        name: item._embedded?.author?.[0]?.name || 'FSAN Staff',
        avatar: item.author_avatar_url || null
      },
      type,
      sport,
      slug: item.slug || item.id.toString(),
      youtubeId
    };
  });

  const formattedPodcasts = podcasts.map(item => {
    const cats = item.category_slugs || []; 
    
    let sport = 'All';
    if (cats.includes('football') || cats.includes('nfl')) sport = 'Football';
    if (cats.includes('basketball') || cats.includes('nba')) sport = 'Basketball';
    if (cats.includes('baseball') || cats.includes('mlb')) sport = 'Baseball';

    const d = new Date(item.date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

    return {
      id: item.id.toString(),
      title: stripTags(item.title?.rendered || ''),
      excerpt: stripTags(item.excerpt?.rendered || ''),
      content: item.content?.rendered || '',
      date: safeDateString,
      rawDate: d.getTime(),
      imageUrl: item._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      author: {
        name: item._embedded?.author?.[0]?.name || 'FSAN Staff',
        avatar: item.author_avatar_url || null
      },
      type: 'podcast',
      sport,
      slug: item.slug || item.id.toString(),
      spreakerId: item.spreaker_episode_id || null,
      spreakerShowId: item.spreaker_show_id || null
    };
  });

  const combinedContent = [...formattedPosts, ...formattedVideos, ...formattedPodcasts].sort((a, b) => b.rawDate - a.rawDate);
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

  // Determine the sport dynamically (Fallback to 'All' if ESPN couldn't find a specific sport)
  const playerSport = espnData?.sportName || content[0]?.sport || 'All';

  let proToolsMenu = [];
  let connectMenu = [];
  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug(`pro-tools-${playerSport.toLowerCase()}`);
      connectMenu = await getMenuBySlug(`connect-${playerSport.toLowerCase()}`);
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
       playerSport={playerSport} // Passing the dynamic sport to the Client UI
    />
  );
}