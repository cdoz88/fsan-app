import ClientManager from '../../../../components/ClientManager';
import { fetchPosts, getMenuBySlug } from '../../../../utils/api';
import { cache } from 'react';

// Highly optimized, memoized function to locate an article, even if it's buried in the archives
const getPostData = cache(async (sport, view, slug) => {
  const targetType = view === 'home' ? 'all' : (view === 'podcasts' ? 'shows' : view);
  
  const { posts: initialPosts, totalPages } = await fetchPosts(sport, targetType, 1);
  let selectedPost = initialPosts.find(p => p.slug === slug);

  // If the article isn't on Page 1, parallel-search up to 15 pages of archives!
  // Thanks to WPGraphQL Smart Cache, this fetches instantly without hurting the server.
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
  
  return { initialPosts, totalPages, selectedPost };
});

export async function generateMetadata({ params }) {
  const { sport, view, slug } = await params;
  const { selectedPost } = await getPostData(sport, view, slug);
  
  return {
    title: selectedPost ? `${selectedPost.title} | FSAN` : 'Article Not Found',
    openGraph: {
      images: [selectedPost?.imageUrl].filter(Boolean),
    },
  };
}

export default async function SingleContentPage({ params }) {
  const { sport, view, slug } = await params;
  
  const { initialPosts, totalPages, selectedPost } = await getPostData(sport, view, slug);

  // Ensure the found post is injected into the feed so the ClientManager can render it!
  let finalPosts = [...initialPosts];
  if (selectedPost && !initialPosts.find(p => p.id === selectedPost.id)) {
    finalPosts = [selectedPost, ...initialPosts];
  }

  // FETCH WORDPRESS MENUS DYNAMICALLY BASED ON CURRENT SPORT
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