import ClientManager from '../../../../components/ClientManager';
import { fetchPosts, getMenuBySlug, formatPost } from '../../../../utils/api';

// Force Vercel to dynamically process direct links so they never get stuck in a frozen state
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { sport, view, slug } = await params;
  const targetType = view === 'home' ? 'all' : (view === 'podcasts' ? 'shows' : view);
  
  let { posts: initialPosts } = await fetchPosts(sport, targetType, 1);
  let selectedPost = initialPosts.find(p => p.slug === slug);

  // CACHE-BUSTING FALLBACK: If Vercel's memory is stale, force a fresh database check
  if (!selectedPost) {
    try {
      const res = await fetch(`https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=36&page=1&sport=${sport}&type=${targetType}&bypass=${Date.now()}`, { cache: 'no-store' });
      const freshRaw = await res.json();
      const freshPosts = freshRaw.map(formatPost);
      selectedPost = freshPosts.find(p => p.slug === slug);
    } catch (e) {}
  }

  return {
    title: selectedPost ? `${selectedPost.title} | FSAN` : 'Article Not Found',
    openGraph: {
      images: [selectedPost?.imageUrl].filter(Boolean),
    },
  };
}

export default async function SingleContentPage({ params }) {
  const { sport, view, slug } = await params;
  const targetType = view === 'home' ? 'all' : (view === 'podcasts' ? 'shows' : view);
  
  let { posts: initialPosts, totalPages } = await fetchPosts(sport, targetType, 1);
  let selectedPost = initialPosts.find(p => p.slug === slug);

  // 1. CACHE-BUSTING FALLBACK
  // If the article isn't in the cached feed, Vercel's cache is stale. Fetch live data immediately!
  if (!selectedPost) {
    try {
       const res = await fetch(`https://admin.fsan.com/wp-json/fsan/v1/feed?per_page=36&page=1&sport=${sport}&type=${targetType}&bypass=${Date.now()}`, { cache: 'no-store' });
       if (res.ok) {
         const freshRaw = await res.json();
         const freshPosts = freshRaw.map(formatPost);
         selectedPost = freshPosts.find(p => p.slug === slug);
         
         if (selectedPost) {
            // We found the new article! Replace the stale background feed with the fresh one!
            initialPosts = freshPosts; 
         }
       }
    } catch(e) {}
  }

  // 2. PAGINATION ARCHIVE FALLBACK
  // If it's STILL not found, it must be an older article. Scan the archives!
  if (!selectedPost && totalPages > 1) {
    const pagesToFetch = Array.from({ length: Math.min(totalPages - 1, 15) }, (_, i) => i + 2);
    const results = await Promise.all(pagesToFetch.map(page => fetchPosts(sport, targetType, page)));
    
    for (const res of results) {
      const found = res.posts.find(p => p.slug === slug);
      if (found) {
        selectedPost = found;
        break;
      }
    }
  }

  // Ensure the found post is injected into the feed so the UI can render it
  let finalPosts = [...initialPosts];
  if (selectedPost && !initialPosts.find(p => p.id === selectedPost.id)) {
    finalPosts = [selectedPost, ...initialPosts];
  }

  const proToolsMenu = await getMenuBySlug(`pro-tools-${sport.toLowerCase()}`);
  const connectMenu = await getMenuBySlug(`connect-${sport.toLowerCase()}`);

  return (
    <ClientManager 
      initialPosts={finalPosts} 
      activeSport={sport.charAt(0).toUpperCase() + sport.slice(1)} 
      currentView={view} 
      initialHasMore={1 < totalPages}
      autoOpenItem={selectedPost} 
      proToolsMenu={proToolsMenu}
      connectMenu={connectMenu}
    />
  );
}