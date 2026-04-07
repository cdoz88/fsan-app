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
     
     let playerRedirectSlug = null;

     const searchWords = q.trim().split(/\s+/);
     const isPotentiallyPlayer = searchWords.length >= 2;

     if (isPotentiallyPlayer) {
         try {
            const espnQuery = activeSport !== 'All' ? `${q} ${activeSport}` : q;
            
            const searchRes = await fetch(`https://site.web.api.espn.com/apis/search/v2?query=${encodeURIComponent(espnQuery)}&limit=30`);
            if (searchRes.ok) {
               const searchData = await searchRes.json();
               const allContents = searchData?.results?.flatMap(r => r.contents || []) || [];

               const validAthletes = allContents.filter(c => c.uid && c.uid.includes('~a:'));

               let targetSportCode = null;
               if (activeSport === 'Football') targetSportCode = 's:20~';
               else if (activeSport === 'Basketball') targetSportCode = 's:40~';
               else if (activeSport === 'Baseball') targetSportCode = 's:1~';

               let athleteResult = null;
               if (targetSportCode) {
                   athleteResult = validAthletes.find(c => c.uid.includes(targetSportCode));
               }

               if (!athleteResult && validAthletes.length > 0) {
                   athleteResult = validAthletes[0];
               }

               if (athleteResult) {
                  // Clean up suffixes, periods, and apostrophes to generate the exact matching URL
                  playerRedirectSlug = q.trim().toLowerCase().replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/i, '').replace(/['.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
               }
            }
         } catch(e) {
            console.error("ESPN Search Check Error:", e);
         }
     }

     if (playerRedirectSlug) {
        redirect(`/player/${playerRedirectSlug}`);
     }

     let processedQuery = q.toLowerCase().trim();
     if (processedQuery === 'start sit') processedQuery = 'start/sit';

     const exactMatchQuery = `\\"${processedQuery}\\"`;
     const sportSlug = activeSport !== 'All' ? activeSport.toLowerCase() : '';
     const categoryFilter = sportSlug ? `, categoryName: "${sportSlug}"` : '';
     
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
       const rawPosts = json?.data?.posts?.nodes || [];

       const gqlPosts = rawPosts.reduce((acc, post) => {
          const cats = post.categories?.nodes?.map(c => c.name.toLowerCase()) || [];
          if (cats.some(c => c.includes('pod') || c.includes('video') || c.includes('short'))) return acc;

          const d = new Date(post.date);
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

          let contentHtml = post.content || '';
          let youtubeId = null;
          const ytMatch = contentHtml.match(ytRegex);
          if (ytMatch && ytMatch[1]) {
              youtubeId = ytMatch[1];
              contentHtml = contentHtml.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
          }

          acc.push({
            id: post.id,
            title: post.title,
            excerpt: stripTags(post.excerpt),
            content: contentHtml,
            date: safeDateString,
            rawDate: d.getTime(),
            imageUrl: post.featuredImage?.node?.sourceUrl || null,
            author: { name: post.author?.node?.name || 'FSAN Staff', avatar: post.author?.node?.avatar?.url || null },
            type: 'article',
            sport: activeSport,
            slug: post.slug,
            youtubeId
          });
          return acc;
       }, []);

       posts = [...posts, ...gqlPosts];
     } catch (e) {}

     try {
       const sportParam = sportSlug ? `&sport=${sportSlug}` : '';
       
       const vUrl1 = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=videos&per_page=100&page=1${sportParam}`;
       const vUrl2 = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=videos&per_page=100&page=2${sportParam}`;
       const pUrl1 = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=podcasts&per_page=100&page=1${sportParam}`;
       const pUrl2 = `https://admin.fsan.com/wp-json/fsan/v1/feed?type=podcasts&per_page=100&page=2${sportParam}`;

       const [vRes1, vRes2, pRes1, pRes2] = await Promise.all([
         fetch(vUrl1), fetch(vUrl2), fetch(pUrl1), fetch(pUrl2)
       ]);

       let vids = [];
       if (vRes1.ok) vids = vids.concat(await vRes1.json());
       if (vRes2.ok) vids = vids.concat(await vRes2.json());

       let pods = [];
       if (pRes1.ok) pods = pods.concat(await pRes1.json());
       if (pRes2.ok) pods = pods.concat(await pRes2.json());

       const searchTerms = processedQuery.split(/[\s/]+/).filter(Boolean);

       const matchedVids = vids.filter(v => {
         const title = (v.title?.rendered || '').toLowerCase();
         const content = (v.content?.rendered || '').toLowerCase();
         const desc = (v.youtube_description || '').toLowerCase();
         const combinedText = `${title} ${content} ${desc}`;
         return searchTerms.every(term => combinedText.includes(term));
       });

       const matchedPods = pods.filter(p => {
         const cats = p.category_slugs || [];
         if (cats.includes('football-podcast') || cats.includes('podcast-basketball') || cats.includes('podcast-baseball')) return false;

         const title = (p.title?.rendered || '').toLowerCase();
         const content = (p.content?.rendered || '').toLowerCase();
         const combinedText = `${title} ${content}`;
         return searchTerms.every(term => combinedText.includes(term));
       });

       const formattedVids = matchedVids.map(v => {
         const cats = v.category_slugs || [];
         const d = new Date(v.date);
         const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
         const safeDateString = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

         let contentHtml = v.content?.rendered || '';
         let youtubeId = null;
         const ytMatch = contentHtml.match(ytRegex);
         if (ytMatch && ytMatch[1]) {
             youtubeId = ytMatch[1];
             contentHtml = contentHtml.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
         }

         if (v.youtube_description) {
             contentHtml += `<br/><br/><div>${v.youtube_description.replace(/(?:\r\n|\r|\n)/g, '<br/>')}</div>`;
         }

         return {
           id: v.id.toString(),
           title: stripTags(v.title?.rendered || ''),
           excerpt: stripTags(v.excerpt?.rendered || ''),
           content: contentHtml,
           date: safeDateString,
           rawDate: d.getTime(),
           imageUrl: v._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
           author: { name: v._embedded?.author?.[0]?.name || 'FSAN Staff', avatar: v.author_avatar_url || null },
           type: cats.includes('shorts') || cats.includes('short') || cats.includes('football-shorts') ? 'short' : 'video',
           sport: activeSport, 
           slug: v.slug || v.id.toString(), 
           youtubeId
         };
       });

       const formattedPods = matchedPods.map(p => {
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
           author: { name: p._embedded?.author?.[0]?.name || 'FSAN Staff', avatar: p.author_avatar_url || null },
           type: 'podcast',
           sport: activeSport,
           slug: p.slug || p.id.toString(),
           spreakerId: p.spreaker_episode_id || null,
           spreakerShowId: p.spreaker_show_id || null
         };
       });

       posts = [...posts, ...formattedVids, ...formattedPods];
     } catch(e) {}
     
     posts.sort((a,b) => b.rawDate - a.rawDate);

  } else {
     const targetType = view === 'home' ? 'all' : (view === 'podcasts' ? 'shows' : view);
     const data = await fetchPosts(activeSport, targetType, 1);
     posts = data.posts;
     totalPages = data.totalPages;
     hasMore = 1 < totalPages;
  }

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