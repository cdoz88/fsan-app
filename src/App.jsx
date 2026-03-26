import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import Header from './components/Header';
import ToolsBar from './components/ToolsBar';
import ContentModal from './components/ContentModal';
import Home from './pages/Home';
import VideosArchive from './pages/VideosArchive';
import ArticlesArchive from './pages/ArticlesArchive';

// Helpers to read the URL when the app first loads
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
  // 1. Core State (Initialized from the URL!)
  const [activeSport, setActiveSport] = useState(getInitialSport);
  const [currentView, setCurrentView] = useState(getInitialView); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [wpPosts, setWpPosts] = useState([]);

  // 2. Loading & Pagination State
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 3. Category & Cache State
  const [categoryMap, setCategoryMap] = useState({});
  const [isCategoriesReady, setIsCategoriesReady] = useState(false);
  const [postsCache, setPostsCache] = useState({}); 

  // --- NATIVE URL ROUTING SYNC ---
  // Updates the URL bar seamlessly whenever the sport or view changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let changed = false;
    
    if (params.get('sport') !== activeSport) {
      params.set('sport', activeSport);
      changed = true;
    }
    if (params.get('view') !== currentView) {
      params.set('view', currentView);
      changed = true;
    }
    
    if (changed) {
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
    }
  }, [activeSport, currentView]);

  // Listen for the browser's "Back" and "Forward" buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveSport(params.get('sport') || 'All');
      setCurrentView(params.get('view') || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- FETCH CATEGORIES ONCE ON MOUNT ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await fetch('https://fsan.com/wp-json/wp/v2/categories?per_page=100&_fields=id,slug');
        if (!catRes.ok) throw new Error("Network Error");
        const categories = await catRes.json();

        const map = {};
        categories.forEach(c => map[c.id] = c.slug);
        setCategoryMap(map);
        setIsCategoriesReady(true);
      } catch (e) {
        console.warn("Failed to fetch categories");
        setIsCategoriesReady(true); 
      }
    };
    fetchCategories();
  }, []);

  // --- FETCH POSTS WHEN SPORT OR PAGE CHANGES ---
  useEffect(() => {
    if (!isCategoriesReady) return;

    if (currentPage === 1 && postsCache[activeSport]) {
      setWpPosts(postsCache[activeSport]);
      setIsLoading(false);
      return; 
    }

    const fetchWordPressData = async () => {
      try {
        if (currentPage === 1) setIsLoading(true);

        let catQuery = '';
        if (activeSport !== 'All' && Object.keys(categoryMap).length > 0) {
          let targetIds = [];
          if (activeSport === 'Basketball') {
            targetIds = Object.keys(categoryMap).filter(id => categoryMap[id].includes('basketball'));
          } else if (activeSport === 'Baseball') {
            targetIds = Object.keys(categoryMap).filter(id => categoryMap[id].includes('baseball'));
          } else if (activeSport === 'Football') {
            targetIds = Object.keys(categoryMap).filter(id => 
              !categoryMap[id].includes('basketball') && 
              !categoryMap[id].includes('baseball') &&
              categoryMap[id] !== 'uncategorized'
            );
          }

          if (targetIds.length > 0) {
            catQuery = `&categories=${targetIds.join(',')}`;
          }
        }

        // OPTIMIZED FETCH: 15 Articles, 12 Videos
        const [articlesRes, videosRes] = await Promise.all([
          fetch(`https://fsan.com/wp-json/wp/v2/posts?_embed&per_page=15&page=${currentPage}${catQuery}`).catch(e => null),
          fetch(`https://fsan.com/wp-json/wp/v2/yt2posts_youtube?_embed&per_page=12&page=${currentPage}${catQuery}`).catch(e => null)
        ]);

        if (!articlesRes && !videosRes) throw new Error("Network connection dropped.");

        const rawArticles = articlesRes?.ok ? await articlesRes.json() : [];
        const rawVideos = videosRes?.ok ? await videosRes.json() : [];

        const formatPost = (post, defaultType) => {
          const slugs = (post.categories || []).map(id => categoryMap[id] || '');
          let sport = 'Football'; 
          if (slugs.some(s => s.includes('basketball'))) sport = 'Basketball';
          if (slugs.some(s => s.includes('baseball'))) sport = 'Baseball';

          const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
          const date = new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
          const rawTimestamp = new Date(post.date).getTime();
          
          const author = defaultType === 'video' ? null : (post._embedded?.author?.[0]?.name || 'FSAN Staff');

          let youtubeId = null;
          let cleanContent = post.content?.rendered || '';
          const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
          const match = cleanContent.match(ytRegex);
          if (match && match[1]) {
            youtubeId = match[1];
            cleanContent = cleanContent.replace(/<iframe.*?<\/iframe>/i, '');
          }

          return {
            id: post.id,
            title: post.title?.rendered || 'Untitled',
            content: cleanContent,
            excerpt: post.excerpt?.rendered || '',
            date,
            rawTimestamp,
            sport,
            type: defaultType,
            imageUrl,
            author,
            youtubeId,
            link: post.link
          };
        };

        const formattedArticles = rawArticles.map(post => formatPost(post, 'article'));
        const formattedVideos = rawVideos.map(post => formatPost(post, 'video'));
        const newPosts = [...formattedArticles, ...formattedVideos];

        if (currentPage === 1) {
          newPosts.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
          setWpPosts(newPosts);
          setPostsCache(prev => ({ ...prev, [activeSport]: newPosts }));
        } else {
          setWpPosts(prev => {
            const combined = [...prev, ...newPosts];
            const uniqueIds = new Set();
            const filteredCombined = combined.filter(p => {
              if (uniqueIds.has(p.id)) return false;
              uniqueIds.add(p.id);
              return true;
            }).sort((a, b) => b.rawTimestamp - a.rawTimestamp);
            
            setPostsCache(cache => ({ ...cache, [activeSport]: filteredCombined }));
            return filteredCombined;
          });
        }

      } catch (error) {
        console.warn("API failed: ", error);
        if (currentPage === 1) generateMockData();
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchWordPressData();
  }, [activeSport, currentPage, isCategoriesReady]);

  // --- HANDLERS ---
  const handleSportChange = (sport) => {
    if (sport !== activeSport) {
      setActiveSport(sport);
      setCurrentPage(1);
      
      if (!postsCache[sport]) {
        setWpPosts([]); 
      }
    }
  };

  const loadMorePosts = () => {
    if (!isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  };

  const generateMockData = () => {
    const mock = [];
    for(let i=0; i<15; i++) {
      mock.push({
        id: `mock-${i}`,
        title: `MOCKUP: Check Your Internet Connection`,
        content: '<p>It looks like your network dropped while loading FSAN.</p>',
        excerpt: '<p>Please refresh the page to try again.</p>',
        date: `MARCH 25, 2026`,
        sport: 'Football',
        type: i % 3 === 0 ? 'video' : 'article',
        imageUrl: null,
        author: i % 3 === 0 ? null : 'System'
      });
    }
    setWpPosts(mock);
  };

  const filteredPosts = wpPosts.filter(post => activeSport === 'All' || post.sport === activeSport);
  const videos = filteredPosts.filter(p => p.type === 'video');
  const articles = filteredPosts.filter(p => p.type === 'article' || p.type === 'podcast');

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-sans">
      <Header activeSport={activeSport} setActiveSport={handleSportChange} setCurrentView={setCurrentView} />
      <ToolsBar activeSport={activeSport} />

      {isLoading && currentView === 'home' && wpPosts.length === 0 && (
        <div className="max-w-[1600px] mx-auto p-12 flex flex-col items-center justify-center text-gray-500 min-h-[50vh]">
          <Loader2 size={48} className="animate-spin text-red-600 mb-4" />
          <p className="font-bold uppercase tracking-widest text-sm">Fetching {activeSport === 'All' ? 'Live Data' : `${activeSport} Data`}...</p>
        </div>
      )}

      {!isLoading && currentView === 'home' && (
        <Home videos={videos} articles={articles} activeSport={activeSport} setActiveSport={handleSportChange} setCurrentView={setCurrentView} setSelectedItem={setSelectedItem} />
      )}

      {!isLoading && currentView === 'videos' && (
        <VideosArchive videos={videos} activeSport={activeSport} setCurrentView={setCurrentView} setSelectedItem={setSelectedItem} loadMorePosts={loadMorePosts} isLoadingMore={isLoadingMore} />
      )}

      {!isLoading && currentView === 'articles' && (
        <ArticlesArchive articles={articles} activeSport={activeSport} setCurrentView={setCurrentView} setSelectedItem={setSelectedItem} loadMorePosts={loadMorePosts} isLoadingMore={isLoadingMore} />
      )}

      {selectedItem && (
        <ContentModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} videos={videos} />
      )}
    </div>
  );
}