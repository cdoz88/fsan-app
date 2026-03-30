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
  const slugs = post.category_slugs || []; 
  const slugString = slugs.join(' ').toLowerCase();
  const titleString = (post.title?.rendered || '').toLowerCase();
  
  // ABSOLUTE SPORT DETECTION
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

  let defaultType = post.post_type === 'yt2posts_youtube' ? 'video' : 'article';
  let type = defaultType;
  if (slugs.some(s => s.includes('shorts'))) type = 'short';

  let cleanContent = decodeWP(post.content?.rendered || '');
  let excerpt = decodeWP(post.excerpt?.rendered || '');

  const showMatch = cleanContent.match(/show_id=([0-9]+)/);
  const epMatch = cleanContent.match(/episode_id=([0-9]+)/);
  
  let spreakerShowId = post.spreaker_show_id || (showMatch ? showMatch[1] : null);
  let spreakerId = post.spreaker_episode_id || (epMatch ? epMatch[1] : null);

  const isMasterCategory = slugs.some(s => ['football-podcast', 'podcast-basketball', 'podcast-baseball'].includes(s));
  const isEpisodeCategory = slugs.some(s => ['football-pod-episode', 'basketball-pod-episode', 'baseball-pod-episode', 'pod-episode'].includes(s));
  const isMasterShow = !!spreakerShowId || isMasterCategory;

  if (spreakerId || spreakerShowId || isMasterCategory || isEpisodeCategory || cleanContent.includes('spreaker')) {
     type = 'podcast';
  }

  const stripTags = (html) => html.replace(/\[\/?vc_[^\]]+\]/gi, '').replace(/\[spreaker[^\]]*\]/gi, '').trim();
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

    if (targetType === 'all') {
      const endpoints = [
        `https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=15&page=${currentPage}&sport=${activeSport}&type=articles`,
        `https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=15&page=${currentPage}&sport=${activeSport}&type=videos`,
        `https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=15&page=${currentPage}&sport=${activeSport}&type=podcasts`,
        `https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=15&page=${currentPage}&sport=${activeSport}&type=shorts`,
        `https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=20&page=${currentPage}&sport=${activeSport}&type=shows`
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
      const res = await fetch(`https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=24&page=${currentPage}&sport=${activeSport}&type=${targetType}`, fetchOptions);
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

// ---------------------------------------------------------
// NEW WPGRAPHQL FETCHERS
// ---------------------------------------------------------

export async function fetchGraphQL(query, variables = {}) {
  const WP_GRAPHQL_URL = 'https://admin.fsan.com/graphql';

  try {
    const res = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      // This tells Next.js to revalidate the menu every 60 seconds
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
  
  // Return the array of links, or an empty array if it fails
  return data?.menu?.menuItems?.nodes || [];
}