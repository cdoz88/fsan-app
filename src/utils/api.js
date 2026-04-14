export async function getMenuBySlug(slug) {
  const query = `
    query GetMenu($slug: ID!) {
      menu(id: $slug, idType: SLUG) {
        menuItems(first: 100) {
          nodes {
            id
            label
            url
            target
            cssClasses
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://admin.fsan.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { slug } }),
      next: { revalidate: 3600 }
    });

    const json = await res.json();
    return json?.data?.menu?.menuItems?.nodes || [];
  } catch (error) {
    console.error(`Failed to fetch menu ${slug}:`, error);
    return [];
  }
}

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

export const generatePlayerSlug = (name) => {
  return name.toLowerCase()
             .replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/i, '') // Strips out suffixes
             .replace(/['.]/g, '')                      // Strips out apostrophes and periods
             .replace(/[^a-z0-9]+/g, '-')               // Replaces spaces/specials with dashes
             .replace(/(^-|-$)/g, '');                  // Trims any trailing dashes
};

export async function fetchPosts(activeSport = 'All', postType = 'all', page = 1) {
  const POSTS_PER_PAGE = 17; // Increased from 15 to 17 to fill the bottom row!
  
  const sportSlug = activeSport !== 'All' ? activeSport.toLowerCase() : '';
  const categoryFilter = sportSlug ? `, categoryName: "${sportSlug}"` : '';

  const stripTags = (html) => {
    if (!html) return '';
    return html.replace(/<\/?[^>]+(>|$)/g, "").trim();
  };

  const extractYoutubeId = (content) => {
    if (!content) return { youtubeId: null, cleanContent: content };
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = content.match(ytRegex);
    if (match && match[1]) {
      const cleanContent = content.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
      return { youtubeId: match[1], cleanContent };
    }
    return { youtubeId: null, cleanContent: content };
  };

  // ---------------------------------------------------------
  // 1. FETCH ARTICLES VIA GRAPHQL
  // ---------------------------------------------------------
  let gqlPosts = [];
  let gqlTotalPages = 1;
  let gqlHasMore = false;

  if (postType === 'all' || postType === 'articles') {
    const skip = (page - 1) * POSTS_PER_PAGE;
    const query = `
      query GetPosts {
        posts(where: {offsetPagination: {size: ${POSTS_PER_PAGE}, offset: ${skip}}${categoryFilter}}) {
          pageInfo { offsetPagination { total } }
          nodes {
            id title excerpt content date slug
            author { node { name avatar { url } } }
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
        cache: 'no-store'
      });
      const json = await res.json();
      const rawPosts = json?.data?.posts?.nodes || [];
      const totalPosts = json?.data?.posts?.pageInfo?.offsetPagination?.total || 0;
      gqlTotalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
      gqlHasMore = page < gqlTotalPages;

      gqlPosts = rawPosts.reduce((acc, post) => {
        const cats = post.categories?.nodes?.map(c => c.name.toLowerCase()) || [];
        if (cats.some(c => c.includes('pod') || c.includes('video') || c.includes('short'))) {
          return acc; 
        }

        const d = new Date(post.date);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

        const { youtubeId, cleanContent } = extractYoutubeId(post.content);

        acc.push({
          id: post.id,
          title: post.title,
          excerpt: stripTags(post.excerpt),
          content: cleanContent,
          date: safeDateString,
          rawDate: d.getTime(),
          imageUrl: post.featuredImage?.node?.sourceUrl || null,
          author: {
            name: post.author?.node?.name || 'FSAN Staff',
            avatar: post.author?.node?.avatar?.url || null
          },
          type: 'article',
          sport: activeSport,
          slug: post.slug,
          youtubeId
        });
        return acc;
      }, []);
    } catch (error) {
      console.error('GraphQL fetch error:', error);
    }
  }

  // ---------------------------------------------------------
  // 2. FETCH VIDEOS VIA REST API
  // ---------------------------------------------------------
  let restVideos = [];
  let videoHasMore = false;
  if (postType === 'all' || postType === 'videos') {
    try {
      const sportQuery = sportSlug ? `&sport=${sportSlug}` : '';
      const url = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=videos&per_page=${POSTS_PER_PAGE}&page=${page}${sportQuery}`;
      
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        
        const totalPagesHeader = res.headers.get('X-WP-TotalPages');
        if (totalPagesHeader) {
          videoHasMore = page < parseInt(totalPagesHeader, 10);
        } else {
          videoHasMore = data.length === POSTS_PER_PAGE;
        }

        restVideos = data.map(v => {
          const cats = v.category_slugs || [];
          const d = new Date(v.date);
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
          
          let { youtubeId, cleanContent } = extractYoutubeId(v.content?.rendered);
          
          if (v.youtube_description) {
            cleanContent += `<br/><br/><div>${v.youtube_description.replace(/(?:\r\n|\r|\n)/g, '<br/>')}</div>`;
          }

          return {
            id: v.id.toString(),
            title: stripTags(v.title?.rendered || ''),
            excerpt: stripTags(v.excerpt?.rendered || ''),
            content: cleanContent,
            date: safeDateString,
            rawDate: d.getTime(),
            imageUrl: v._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
            author: {
              name: v._embedded?.author?.[0]?.name || 'FSAN Staff',
              avatar: v.author_avatar_url || null
            },
            type: cats.includes('shorts') || cats.includes('short') || cats.includes('football-shorts') ? 'short' : 'video',
            sport: activeSport,
            slug: v.slug || v.id.toString(),
            youtubeId
          };
        });
      }
    } catch (e) {
      console.error('REST Videos fetch error:', e);
    }
  }

  // ---------------------------------------------------------
  // 3. FETCH PODCASTS VIA REST API
  // ---------------------------------------------------------
  let restPodcasts = [];
  let podcastHasMore = false;
  if (postType === 'all' || postType === 'shows') {
    try {
      const sportQuery = sportSlug ? `&sport=${sportSlug}` : '';
      const url = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=podcasts&per_page=100&page=1${sportQuery}`;
      
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        
        const masterShows = data.filter(p => {
           const cats = p.category_slugs || [];
           return cats.includes('football-podcast') || cats.includes('podcast-basketball') || cats.includes('podcast-baseball');
        });

        restPodcasts = masterShows.map(p => {
          const d = new Date(p.date);
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

          return {
            id: p.id.toString(),
            title: stripTags(p.title?.rendered || ''),
            excerpt: stripTags(p.excerpt?.rendered || ''),
            content: p.content?.rendered || '',
            date: safeDateString,
            rawDate: d.getTime(),
            imageUrl: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
            author: { name: 'FSAN Staff', avatar: null },
            type: 'podcast',
            sport: activeSport,
            slug: p.slug || p.id.toString(),
            spreakerShowId: p.spreaker_show_id || null,
            isMasterShow: true 
          };
        });
      }
    } catch (e) {
      console.error('REST Master Podcasts fetch error:', e);
    }
  } else if (postType === 'podcasts') {
    try {
      const sportQuery = sportSlug ? `&sport=${sportSlug}` : '';
      const url = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=podcasts&per_page=${POSTS_PER_PAGE}&page=${page}${sportQuery}`;
      
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        
        const totalPagesHeader = res.headers.get('X-WP-TotalPages');
        if (totalPagesHeader) {
          podcastHasMore = page < parseInt(totalPagesHeader, 10);
        } else {
          podcastHasMore = data.length === POSTS_PER_PAGE;
        }

        const episodes = data.filter(p => {
           const cats = p.category_slugs || [];
           return !cats.includes('football-podcast') && !cats.includes('podcast-basketball') && !cats.includes('podcast-baseball');
        });

        restPodcasts = episodes.map(p => {
          const d = new Date(p.date);
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

          return {
            id: p.id.toString(),
            title: stripTags(p.title?.rendered || ''),
            excerpt: stripTags(p.excerpt?.rendered || ''),
            content: p.content?.rendered || '',
            date: safeDateString,
            rawDate: d.getTime(),
            imageUrl: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
            author: { name: 'FSAN Staff', avatar: null },
            type: 'podcast',
            sport: activeSport,
            slug: p.slug || p.id.toString(),
            spreakerId: p.spreaker_episode_id || null,
            spreakerShowId: p.spreaker_show_id || null,
            isMasterShow: false
          };
        });
      }
    } catch (e) {
      console.error('REST Episodes fetch error:', e);
    }
  }

  // Combine and sort ALL the fetched content!
  const allPosts = [...gqlPosts, ...restVideos, ...restPodcasts].sort((a, b) => b.rawDate - a.rawDate);

  let finalHasMore = false;
  let finalTotalPages = 1;

  if (postType === 'all') {
    finalHasMore = gqlHasMore || videoHasMore;
    finalTotalPages = Math.max(gqlTotalPages, page + (finalHasMore ? 1 : 0));
  } else if (postType === 'articles') {
    finalHasMore = gqlHasMore;
    finalTotalPages = gqlTotalPages;
  } else if (postType === 'videos') {
    finalHasMore = videoHasMore;
    finalTotalPages = page + (videoHasMore ? 1 : 0);
  } else if (postType === 'podcasts') {
    finalHasMore = podcastHasMore;
    finalTotalPages = page + (podcastHasMore ? 1 : 0);
  } else if (postType === 'shows') {
    finalHasMore = false;
    finalTotalPages = 1;
  }

  return {
    posts: allPosts,
    totalPages: finalTotalPages
  };
}