import ClientManager from '../../../components/ClientManager';
import { fetchPosts, getMenuBySlug } from '../../../utils/api';

export async function generateMetadata({ params }) {
  const { sport, view } = await params;
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  const viewName = view.charAt(0).toUpperCase() + view.slice(1);
  return {
    title: activeSport === 'All' ? `FSAN | The ${viewName}` : `${activeSport} | FSAN`,
  };
}

export default async function DynamicPage({ params }) {
  const { sport, view } = await params;
  
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  const targetType = view === 'home' ? 'all' : (view === 'podcasts' ? 'shows' : view);

  const { posts, totalPages } = await fetchPosts(activeSport, targetType, 1);
  const hasMore = 1 < totalPages;

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
    />
  );
}