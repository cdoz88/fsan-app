import ClientManager from '../../../components/ClientManager';
import { fetchPosts } from '../../../utils/api';

// This function gives you perfect SEO metadata for Twitter & iMessage!
export async function generateMetadata({ params }) {
  const { sport, view } = await params;
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  const viewName = view.charAt(0).toUpperCase() + view.slice(1);
  return {
    title: `${activeSport === 'All' ? 'Network' : activeSport} ${viewName} | Fantasy Sports Advice Network`,
  };
}

// THIS IS THE SERVER! It fetches the data instantly before handing it to the client.
export default async function DynamicPage({ params }) {
  const { sport, view } = await params;
  
  // Format the URL strings back into proper nouns
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  const targetType = view === 'home' ? 'all' : (view === 'podcasts' ? 'shows' : view);

  // Fetch the data on the Vercel server
  const { posts, totalPages } = await fetchPosts(activeSport, targetType, 1);
  const hasMore = 1 < totalPages;

  // Pass the finished data to the interactive Client Manager
  return (
    <ClientManager 
      initialPosts={posts} 
      activeSport={activeSport} 
      currentView={view} 
      initialHasMore={hasMore} 
    />
  );
}