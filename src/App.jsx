import React, { useState, useEffect } from 'react';
import PlaybookLoader from './components/PlaybookLoader';
import Header from './components/Header';
import ContentModal from './components/ContentModal';
import Home from './pages/Home';
import VideosArchive from './pages/VideosArchive';
import ArticlesArchive from './pages/ArticlesArchive';
import PodcastsArchive from './pages/PodcastsArchive';

const getInitialSport = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('sport') || 'All';
  }
  return 'All';
};

const getInitialView = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'home';
  }
  return 'home';
};

export default function App() {
  const [activeSport, setActiveSport] = useState(getInitialSport);
  const [currentView, setCurrentView] = useState(getInitialView); 
  const [feedFilter, setFeedFilter] = useState('all'); 
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [wpPosts, setWpPosts] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [postsCache, setPostsCache] = useState({}); 

  // URL Syncing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let changed = false;
    if (params.get('sport') !== activeSport) { params.set('sport', activeSport); changed = true; }
    if (params.get('view') !== currentView) { params.set('view', currentView); changed = true; }
    if (selectedItem) {
      if (params.get('id') !== selectedItem.id.toString()) { params.set('id', selectedItem.id); changed = true; }
    } else {
      if (params.has('id')) { params.delete('id'); changed = true; }
    }
    if (changed) window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [activeSport, currentView, selectedItem]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveSport(params.get('sport') || 'All');
      setCurrentView(params.get('view') || 'home');
      if (!params.get('id')) setSelectedItem(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- INFINITE FETCH ENGINE ---
  useEffect(() => {
    // NEW: Explicitly ask the API for 'shows' when on the Podcasts archive
    let targetType = currentView;
    if (currentView === 'home') targetType = feedFilter;
    if (currentView === 'podcasts') targetType = 'shows';

    const cacheKey = `${activeSport}-${targetType}`;

    if (currentPage === 1) {
      if (postsCache[cacheKey]) {
        setWpPosts(postsCache[cacheKey]);
        setIsLoading(false);
        return; 
      } else {
        setWpPosts([]); 
        setIsLoading(true);
      }
    }

    const fetchWordPressData = async () => {
      try {
        const res = await fetch(`https://fsan.com/wp-json/fsan/v1/feed?per_page=10&page=${currentPage}&sport=${activeSport}&type=${targetType}&t=${Date.now()}`);
        if (!res.ok) throw new Error("API failed");
        
        const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
        setHasMore(currentPage < totalPages);

        const rawPosts = await res.json();

        const formatPost = (post) => {
          const slugs = post.category_slugs || []; 
          let sport = 'Football'; 
          if (slugs.some(s => s.includes('basketball'))) sport = 'Basketball';
          if (slugs.some(s => s.includes('baseball'))) sport = 'Baseball';

          let defaultType = post.post_type === 'yt2posts_youtube' ? 'video' : 'article';
          let type = defaultType;
          if (slugs.some(s => s.includes('shorts'))) type = 'short';

          let cleanContent = post.content?.rendered || '';
          let excerpt = post.excerpt?.rendered || '';

          const decodeWP = (text) => {
            return text.replace(/\[vc_raw_html[^\]]*\](.*?)\[\/vc_raw_html\]/gi, (match, b64) => {
              try { return decodeURIComponent(atob(b64.replace(/\s/g, ''))); } catch(e) { return ''; }
            });
          };
          cleanContent = decodeWP(cleanContent);
          excerpt = decodeWP(excerpt);

          const showMatch = cleanContent.match(/show_id=([0-9]+)/);
          const epMatch = cleanContent.match(/episode_id=([0-9]+)/);
          
          let spreakerShowId = post.spreaker_show_id || (showMatch ? showMatch[1] : null);
          let spreakerId = post.spreaker_episode_id || (epMatch ? epMatch[1] : null);

          const isMasterCategory = slugs.some(s => ['podcast', 'podcast-basketball', 'podcast-baseball'].includes(s));
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
          const author = defaultType === 'video' ? null : (post._embedded?.author?.[0]?.name || 'FSAN Staff');

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
            author,
            youtubeId,
            spreakerId,
            spreakerShowId, 
            link: post.link
          };
        };

        const newPosts = rawPosts.map(formatPost);

        if (currentPage === 1) {
          setWpPosts(newPosts);
          setPostsCache(prev => ({ ...prev, [cacheKey]: newPosts }));
        } else {
          setWpPosts(prev => {
            const combined = [...prev, ...newPosts];
            const uniqueIds = new Set();
            const finalPosts = combined.filter(p => {
              if (uniqueIds.has(p.id)) return false;
              uniqueIds.add(p.id);
              return true;
            });
            setPostsCache(cache => ({ ...cache, [cacheKey]: finalPosts }));
            return finalPosts;
          });
        }

      } catch (error) {
        console.warn("API failed: ", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchWordPressData();
  }, [activeSport, currentPage, currentView, feedFilter]);

  const handleSportChange = (sport) => { if (sport !== activeSport) { setActiveSport(sport); setCurrentPage(1); } };
  const handleViewChange = (view) => { if (view !== currentView) { setCurrentView(view); setCurrentPage(1); } };
  const handleFeedFilterChange = (filter) => { if (filter !== feedFilter) { setFeedFilter(filter); setCurrentPage(1); } };

  const loadMorePosts = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  };

  const isInitialLoad = isLoading && wpPosts.length === 0;
  
  const timelinePosts = wpPosts.filter(p => !p.isMasterShow);
  const articlePosts = timelinePosts.filter(p => p.type === 'article');
  const videoPosts = timelinePosts.filter(p => p.type === 'video' || p.type === 'short');
  const podcastEpisodes = timelinePosts.filter(p => p.type === 'podcast');

  let homeFeed = timelinePosts;
  if (feedFilter === 'articles') homeFeed = articlePosts;
  if (feedFilter === 'videos') homeFeed = videoPosts;
  if (feedFilter === 'podcasts') homeFeed = podcastEpisodes;

  // Master Podcasts are now safely isolated!
  const masterPodcasts = wpPosts.filter(p => p.isMasterShow);

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-sans">
      <Header activeSport={activeSport} setActiveSport={handleSportChange} setCurrentView={handleViewChange} />

      {isInitialLoad && (
        <div className="max-w-[1600px] mx-auto p-12 flex flex-col items-center justify-center text-gray-500 min-h-[50vh]">
          <PlaybookLoader className="mb-8 scale-150" />
          <p className="font-bold uppercase tracking-widest text-sm">Drawing up {activeSport === 'All' ? 'Game Plan' : `${activeSport} Data`}...</p>
        </div>
      )}

      {!isInitialLoad && currentView === 'home' && (
        <Home wpPosts={homeFeed} activeSport={activeSport} currentView={currentView} setCurrentView={handleViewChange} feedFilter={feedFilter} setFeedFilter={handleFeedFilterChange} setSelectedItem={setSelectedItem} loadMorePosts={loadMorePosts} isLoadingMore={isLoadingMore} hasMore={hasMore} isLoading={isLoading} />
      )}

      {!isInitialLoad && currentView === 'videos' && (
        <VideosArchive videos={videoPosts} activeSport={activeSport} setCurrentView={handleViewChange} setSelectedItem={setSelectedItem} loadMorePosts={loadMorePosts} isLoadingMore={isLoadingMore} />
      )}

      {!isInitialLoad && currentView === 'articles' && (
        <ArticlesArchive articles={articlePosts} activeSport={activeSport} setCurrentView={handleViewChange} setSelectedItem={setSelectedItem} loadMorePosts={loadMorePosts} isLoadingMore={isLoadingMore} />
      )}

      {!isInitialLoad && currentView === 'podcasts' && (
        <PodcastsArchive podcasts={masterPodcasts} activeSport={activeSport} setCurrentView={handleViewChange} setSelectedItem={setSelectedItem} loadMorePosts={loadMorePosts} isLoadingMore={isLoadingMore} />
      )}

      {selectedItem && (
        <ContentModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} videos={timelinePosts} />
      )}
    </div>
  );
}