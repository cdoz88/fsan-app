import ClientManager from '../../../../components/ClientManager';
import { fetchPosts, getMenuBySlug } from '../../../../utils/api';

export async function generateMetadata({ params }) {
  const { sport, view, slug } = await params;
  const { posts } = await fetchPosts(sport, view === 'home' ? 'all' : view);
  const post = posts.find(p => p.slug === slug);
  
  return {
    title: post ? `${post.title} | FSAN` : 'Article Not Found',
    openGraph: {
      images: [post?.imageUrl],
    },
  };
}

export default async function SingleContentPage({ params }) {
  const { sport, view, slug } = await params;
  
  const targetType = view === 'home' ? 'all' : (view === 'podcasts' ? 'shows' : view);
  const { posts, totalPages } = await fetchPosts(sport, targetType, 1);
  const selectedPost = posts.find(p => p.slug === slug);

  // FETCH WORDPRESS MENUS DYNAMICALLY BASED ON CURRENT SPORT
  const proToolsMenu = await getMenuBySlug(`pro-tools-${sport.toLowerCase()}`);
  const connectMenu = await getMenuBySlug(`connect-${sport.toLowerCase()}`);

  return (
    <ClientManager 
      initialPosts={posts} 
      activeSport={sport.charAt(0).toUpperCase() + sport.slice(1)} 
      currentView={view} 
      initialHasMore={1 < totalPages}
      autoOpenItem={selectedPost} 
      proToolsMenu={proToolsMenu}
      connectMenu={connectMenu}
    />
  );
}