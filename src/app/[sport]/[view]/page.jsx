import ClientManager from '../../../components/ClientManager';
import { fetchPosts, getMenuBySlug } from '../../../utils/api';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { sport, view } = await params;
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  const viewName = view.charAt(0).toUpperCase() + view.slice(1);
  return {
    title: activeSport === 'All' ? `FSAN | The ${viewName}` : `${activeSport} | FSAN`,
  };
}

export default async function DynamicPage({ params, searchParams }) {
  const { sport, view } = await params;
  const { q } = await searchParams;
  
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  
  let posts = [];
  let totalPages = 1;
  let hasMore = false;

  // --- MAGIC SEARCH ROUTING ---
  if (view === 'search' && q) {
     
     // 1. Instantly check if the user searched for a player!
     try {
        const searchRes = await fetch(`https://site.web.api.espn.com/apis/search/v2?query=${encodeURIComponent(q)}&limit=3`);
        if (searchRes.ok) {
           const searchData = await searchRes.json();
           const allContents = searchData?.results?.flatMap(r => r.contents || []) || [];
           const athleteResult = allContents.find(c => c.uid && c.uid.includes('~a:'));
           if (athleteResult) {
              const slug = q.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              // We found a player! Redirect directly to their hub to trigger dynamic sport switching.
              redirect(`/player/${slug}`);
           }
        }
     } catch(e) {}

     // 2. If it is NOT a player, fetch standard search results from WP
     const exactMatchQuery = `\\"${q}\\"`;
     const sportSlug = activeSport !== 'All' ? activeSport.toLowerCase() : '';
     const categoryFilter = sportSlug ? `, categoryName: "${sportSlug}"` : '';
     
     // Search GraphQL for Articles
     const postsQuery = `
       query GetSearch {
         posts(where: {search: "${exactMatchQuery}"${categoryFilter}}, first: 50) {
           nodes {
             id title excerpt content date slug
             author { node { name avatar { url } } }
             featuredImage { node { sourceUrl } }
             categories { nodes { name } }
           }
         }
       }
     `;

     const stripTags = (html) => html ? html.replace(/<\/?[^>]+(>|$)/g, "").trim() : '';
     const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

     try {
       const res = await fetch('https://admin.fsan.com/graphql', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ query: postsQuery })
       });
       const json = await res.json();
       const gqlPosts = json?.data?.posts?.nodes?.map(post => {
          let type = 'article';
          const cats = post.categories?.nodes?.map(c => c.name.toLowerCase()) || [];
          if (cats.includes('video') || cats.includes('videos')) type = 'video';
          else if (cats.includes('short') || cats.includes('shorts')) type = 'short';
          else if (cats.includes('podcast') || cats.includes('podcasts')) type = 'podcast';

          const d = new Date(post.date);
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

          let youtubeId = null;
          const ytMatch = post.content?.match(ytRegex);
          if (ytMatch && ytMatch[1]) youtubeId = ytMatch[1];

          return {
            id: post.id,
            title: post.title,
            excerpt: stripTags(post.excerpt),
            content: post.content,
            date: safeDateString,
            rawDate: d.getTime(),
            imageUrl: post.featuredImage?.node?.sourceUrl || null,
            author: { name: post.author?.node?.name || 'FSAN Staff', avatar: post.author?.node?.avatar?.url || null },
            type, sport: activeSport, slug: post.slug, youtubeId
          };
       }) || [];
       posts = [...posts, ...gqlPosts];
     } catch (e) {}

     // Search REST API for Videos
     try {
       const sportParam = sportSlug ? `&sport=${sportSlug}` : '';
       const feedUrl = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=videos&per_page=100&page=1${sportParam}`;
       const res = await fetch(feedUrl);
       if (res.ok) {
          const vids = await res.json();
          const qLower = q.toLowerCase();
          const matchedVids = vids.filter(v => 
            (v.title?.rendered || '').toLowerCase().includes(qLower) || 
            (v.youtube_description || '').toLowerCase().includes(qLower)
          );
          const formattedVids = matchedVids.map(v => {
            const cats = v.category_slugs || [];
            const d = new Date(v.date);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

            let contentHtml = v.content?.rendered || '';
            if (v.youtube_description) contentHtml += `<br/><br/><div>${v.youtube_description.replace(/(?:\r\n|\r|\n)/g, '<br/>')}</div>`;

            let youtubeId = null;
            const ytMatch = contentHtml.match(ytRegex);
            if (ytMatch && ytMatch[1]) youtubeId = ytMatch[1];

            return {
              id: v.id.toString(),
              title: stripTags(v.title?.rendered || ''),
              excerpt: stripTags(v.excerpt?.rendered || ''),
              content: contentHtml,
              date: safeDateString,
              rawDate: d.getTime(),
              imageUrl: v._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
              author: { name: v._embedded?.author?.[0]?.name || 'FSAN Staff', avatar: v.author_avatar_url || null },
              type: cats.includes('shorts') || cats.includes('short') ? 'short' : 'video',
              sport: activeSport, slug: v.slug || v.id.toString(), youtubeId
            };
          });
          posts = [...posts, ...formattedVids];
       }
     } catch(e) {}
     
     posts.sort((a,b) => b.rawDate - a.rawDate);

  } else {
     // Default fetching for regular archive pages
     const targetType = view === 'home' ? 'all' : (view === 'podcasts' ? 'shows' : view);
     const data = await fetchPosts(activeSport, targetType, 1);
     posts = data.posts;
     totalPages = data.totalPages;
     hasMore = 1 < totalPages;
  }

  // FETCH WORDPRESS MENUS DYNAMICALLY BASED ON CURRENT SPORT
  const proToolsMenu = await getMenuBySlug(`pro-tools-${sport.toLowerCase()}`);
  const connectMenu = await getMenuBySlug(`connect-${sport.toLowerCase()}`);

  return (
    <ClientManager 
      initialPosts={posts} 
      activeSport={activeSport} 
      currentView={view} 
      initialHasMore={hasMore} 
      proToolsMenu={proToolsMenu}
      connectMenu={connectMenu}
      searchQuery={q}
    />
  );
}