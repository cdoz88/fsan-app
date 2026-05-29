const decodeWP = (text) => {
  if (!text) return '';
  return text.replace(/\[vc_raw_html[^\]]*\](.*?)\[\/vc_raw_html\]/gi, (match, b64) => {
    try {
      const cleanB64 = b64.replace(/\s/g, '');
      return decodeURIComponent(atob(cleanB64));
    } catch(e) {
      return '';
    }
  });
};

export const formatPost = (post) => {
  let slugs = [];
  if (Array.isArray(post.category_slugs)) {
      slugs = post.category_slugs;
  } else if (typeof post.category_slugs === 'string') {
      slugs = [post.category_slugs];
  }
  
  const slugString = slugs.join(' ').toLowerCase();
  const titleString = (post.title?.rendered || '').toLowerCase();
  
  let sport = 'All'; 
  
  if (
      slugString.includes('football') || 
      slugString.includes('nfl') || 
      slugString.includes('dynasty') ||
      titleString.includes('football') ||
      titleString.includes('nfl') ||
      titleString.includes('dynasty')
  ) {
      sport = 'Football';
  } 
  else if (slugString.includes('basketball') || slugString.includes('nba')) {
      sport = 'Basketball';
  } 
  else if (slugString.includes('baseball') || slugString.includes('mlb')) {
      sport = 'Baseball';
  }
  else if (slugString.includes('racing') || slugString.includes('nascar') || slugString.includes('f1')) {
      sport = 'Racing';
  }
  else if (slugString.includes('golf') || slugString.includes('pga')) {
      sport = 'Golf';
  }

  let defaultType = post.post_type === 'yt2posts_youtube' ? 'video' : 'article';
  let type = defaultType;
  if (slugs.some(s => s.includes('shorts'))) type = 'short';

  let cleanContent = decodeWP(post.content?.rendered || '');
  let excerpt = decodeWP(post.excerpt?.rendered || '');

  const showMatch = cleanContent.match(/show_id=([0-9]+)/);
  const epMatch = cleanContent.match(/episode_id=([0-9]+)/);
  
  let acastShowId = post.acast_show_id || (showMatch ? showMatch[1] : null);
  let rawAcastId = post.acast_episode_id || (epMatch ? epMatch[1] : null);
  
  // THE FIX: Simple, strict formatting. Glues the exact BSON Show ID to the exact Episode Slug.
  let finalAcastId = null;
  if (rawAcastId) {
      let cleanId = rawAcastId.replace('acast:', '').replace(/^https?:\/\//, '').trim();
      
      let episodePart = cleanId;
      if (cleanId.includes('/')) {
          const parts = cleanId.split('/').filter(Boolean);
          episodePart = parts[parts.length - 1]; 
      }
      
      if (acastShowId) {
          finalAcastId = `${acastShowId}/${episodePart}`;
      } else {
          finalAcastId = episodePart;
      }
  }
  
  let spreakerShowId = post.spreaker_show_id || null;
  let spreakerId = post.spreaker_episode_id || null;

  const isMasterCategory = slugs.some(s => ['football-podcast', 'podcast-football', 'basketball-podcast', 'podcast-basketball', 'baseball-podcast', 'podcast-baseball'].includes(s));
  const isEpisodeCategory = slugs.some(s => ['football-pod-episode', 'basketball-pod-episode', 'baseball-pod-episode', 'pod-episode'].includes(s));
  
  const isMasterShow = (!finalAcastId && !spreakerId && (!!acastShowId || !!spreakerShowId)) || isMasterCategory;

  if (finalAcastId || acastShowId || spreakerId || spreakerShowId || isMasterCategory || isEpisodeCategory || cleanContent.includes('acast')) {
     type = 'podcast';
  }

  const stripTags = (html) => html.replace(/\[\/?vc_[^\]]+\]/gi, '').replace(/\[acast[^\]]*\]/gi, '').trim();
  cleanContent = stripTags(cleanContent);
  excerpt = stripTags(excerpt);

  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
  const date = new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const rawTimestamp = new Date(post.date).getTime();
  
  const authorName = post._embedded?.author?.[0]?.name || 'FSAN Staff';
  const authorAvatar = post.author_avatar_url || null; 

  let youtubeId = null;
  let customYtDesc = post.youtube_description;

  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = cleanContent.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    youtubeId = ytMatch[1];
    cleanContent = cleanContent.replace(/<iframe.*?<\/iframe>/i, ''); 
  }

  if ((type === 'video' || type === 'short') && customYtDesc && typeof customYtDesc === 'string' && customYtDesc.trim().length > 0) {
    let formattedDesc = customYtDesc.replace(/(?:\r\n|\r|\n)/g, '<br/>');
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    formattedDesc = formattedDesc.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: #60a5fa;">${url}</a>`);
    cleanContent = formattedDesc;
  }

  return {
    id: post.id,
    slug: post.slug, 
    title: post.title?.rendered || 'Untitled',
    content: cleanContent,
    excerpt: excerpt,
    date,
    rawTimestamp,
    sport,
    type,
    isMasterShow, 
    category_slugs: slugs,
    imageUrl,
    author: {
      name: authorName,
      avatar: authorAvatar
    },
    youtubeId,
    acastId: finalAcastId,
    acastShowId, 
    spreakerId, 
    spreakerShowId, 
    link: post.link
  };
};

export const fetchPosts = async (activeSport, targetType, currentPage = 1) => {
  try {
    let rawPosts = [];
    let totalPages = 1;
    const fetchOptions = { next: { revalidate: 60 } }; 

    const timeBuster = Math.floor(Date.now() / (1000 * 60 * 5));

    if (targetType === 'all') {
      const endpoints = [
        `https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=30&page=${currentPage}&sport=${activeSport}&type=articles&t=${timeBuster}`,
        `https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=40&page=${currentPage}&sport=${activeSport}&type=videos&t=${timeBuster}`,
        `https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=20&page=${currentPage}&sport=${activeSport}&type=podcasts&t=${timeBuster}`,
        `https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=20&page=${currentPage}&sport=${activeSport}&type=shorts&t=${timeBuster}`,
        `https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=20&page=${currentPage}&sport=${activeSport}&type=shows&t=${timeBuster}`
      ];
      
      const responses = await Promise.all(endpoints.map(url => fetch(url, fetchOptions)));
      responses.forEach(res => {
        const tp = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
        if (tp > totalPages) totalPages = tp;
      });
      
      const dataArrays = await Promise.all(responses.map(res => res.json()));
      let combinedRaw = dataArrays.flat().filter(post => post && post.id);
      const uniqueRawMap = new Map();
      combinedRaw.forEach(post => {
        if (!uniqueRawMap.has(post.id)) uniqueRawMap.set(post.id, post);
      });
      rawPosts = Array.from(uniqueRawMap.values());
      rawPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    } else {
      const fetchLimit = targetType === 'videos' ? 60 : 36;
      
      const res = await fetch(`https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=${fetchLimit}&page=${currentPage}&sport=${activeSport}&type=${targetType}&t=${timeBuster}`, fetchOptions);
      if (!res.ok) throw new Error("API failed");
      totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
      rawPosts = await res.json();
    }

    return { posts: rawPosts.map(formatPost), totalPages };
  } catch (error) {
    console.warn("API fetch failed: ", error);
    return { posts: [], totalPages: 1 };
  }
};

export async function fetchGraphQL(query, variables = {}) {
  const WP_GRAPHQL_URL = 'https://admin.fsan.com/graphql';

  const queryParams = new URLSearchParams({
    query: query.trim(), 
  });
  
  if (Object.keys(variables).length > 0) {
    queryParams.append('variables', JSON.stringify(variables));
  }

  const timeBuster = Math.floor(Date.now() / (1000 * 60 * 5));
  queryParams.append('t', timeBuster);

  try {
    const res = await fetch(`${WP_GRAPHQL_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, 
    });

    const json = await res.json();
    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
      throw new Error('Failed to fetch GraphQL API');
    }

    return json.data;
  } catch (error) {
    console.error('GraphQL Fetch Error:', error);
    return null;
  }
}

export async function getMenuBySlug(slug) {
  const query = `
    query GetMenu($id: ID!) {
      menu(id: $id, idType: SLUG) {
        menuItems {
          nodes {
            id
            label
            url
          }
        }
      }
    }
  `;

  const variables = { id: slug };
  const data = await fetchGraphQL(query, variables);
  
  return data?.menu?.menuItems?.nodes || [];
}

export const generatePlayerSlug = (name) => {
  return name.toLowerCase()
             .replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/i, '') 
             .replace(/['.]/g, '')                      
             .replace(/[^a-z0-9]+/g, '-')               
             .replace(/(^-|-$)/g, '');                  
};