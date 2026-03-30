import ClientManager from '../../../../components/ClientManager';
import { fetchPosts } from '../../../../utils/api';

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
  
  // 1. Fetch the data for the background (the archive)
  const targetType = view === 'home' ? 'all' : (view === 'podcasts' ? 'shows' : view);
  const { posts, totalPages } = await fetchPosts(sport, targetType, 1);
  
  // 2. Find the specific post to open in the "Modal" automatically
  const selectedPost = posts.find(p => p.slug === slug);

  return (
    <ClientManager 
      initialPosts={posts} 
      activeSport={sport.charAt(0).toUpperCase() + sport.slice(1)} 
      currentView={view} 
      initialHasMore={1 < totalPages}
      autoOpenItem={selectedPost} // This tells the modal to be open on arrival!
    />
  );
}