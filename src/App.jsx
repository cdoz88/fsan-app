import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import Header from './components/Header';
import ToolsBar from './components/ToolsBar';
import ContentModal from './components/ContentModal';
import Home from './pages/Home';
import VideosArchive from './pages/VideosArchive';
import ArticlesArchive from './pages/ArticlesArchive';

export default function App() {
  const [activeSport, setActiveSport] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  const [wpPosts, setWpPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: Track which page of data we are on
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});

  // Helper function to format raw WordPress data
  const formatPost = (post, defaultType, catMap) => {
    const slugs = (post.categories || []).map(id => catMap[id] || '');
    let sport = 'Football'; 
    if (slugs.some(s => s.includes('basketball'))) sport = 'Basketball';
    if (slugs.some(s => s.includes('baseball'))) sport = 'Baseball';

    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
    const author = post._embedded?.author?.[0]?.name || 'FSAN Staff';
    const date = new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
    const rawTimestamp = new Date(post.date).getTime();

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

  // 1. INITIAL LOAD (Page 1)
  useEffect(() => {
    const fetchWordPressData = async () => {
      try {
        setIsLoading(true);
        const catRes = await fetch('https://fsan.com/wp-json/wp/v2/categories?per_page=100&_fields=id,slug');
        if (!catRes.ok) throw new Error("CORS or Network Error");
        const categories = await catRes.json();
        
        const newCatMap = {};
        categories.forEach(c => newCatMap[c.id] = c.slug);
        setCategoryMap(newCatMap); // Save for later pagination

        const [articlesRes, videosRes] = await Promise.all([
          fetch('https://fsan.com/wp-json/wp/v2/posts?_embed&per_page=30&page=1').catch(e => null),
          fetch('https://fsan.com/wp-json/wp/v2/yt2posts_youtube?_embed&per_page=30&page=1').catch(e => null)
        ]);

        if (!articlesRes && !videosRes) throw new Error("Network connection dropped entirely.");

        const rawArticles = articlesRes?.ok ? await articlesRes.json() : [];
        const rawVideos = videosRes?.ok ? await videosRes.json() : [];

        const formattedArticles = rawArticles.map(post => formatPost(post, 'article', newCatMap));
        const formattedVideos = rawVideos.map(post => formatPost(post, 'video', newCatMap));
        const allPosts = [...formattedArticles, ...formattedVideos];
        allPosts.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
        
        setWpPosts(allPosts);
      } catch (error) {
        console.warn("Using Mock Data. API failed: ", error);
        generateMockData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordPressData();
  }, []);

  // 2. LOAD MORE FUNCTION (Page 2, 3, 4...)
  const loadMorePosts = async () => {
    if (isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;

      const [articlesRes, videosRes] = await Promise.all([
        fetch(`https://fsan.com/wp-json/wp/v2/posts?_embed&per_page=30&page=${nextPage}`).catch(e => null),
        fetch(`https://fsan.com/wp-json/wp/v2/yt2posts_youtube?_embed&per_page=30&page=${nextPage}`).catch(e => null)
      ]);

      const rawArticles = articlesRes?.ok ? await articlesRes.json() : [];
      const rawVideos = videosRes?.ok ? await videosRes.json() : [];

      const formattedArticles = rawArticles.map(post => formatPost(post, 'article', categoryMap));
      const formattedVideos = rawVideos.map(post => formatPost(post, 'video', categoryMap));
      
      const newPosts = [...formattedArticles, ...formattedVideos];
      
      // Combine old posts with new posts and sort them!
      setWpPosts(prevPosts => {
        const combined = [...prevPosts, ...newPosts];
        return combined.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
      });
      
      setCurrentPage(nextPage);

    } catch (error) {
      console.warn("Failed to load more posts.", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const generateMockData = () => {
    const mock = [];
    for(let i=0; i<30; i++) {
      mock.push({
        id: `mock-${i}`,
        title: `MOCKUP: Check Your Internet Connection`,
        content: '<p>It looks like your network dropped while loading FSAN.</p>',
        excerpt: '<p>Please refresh the page to try again.</p>',
        date: `MARCH 25, 2026`,
        sport: 'Football',
        type: i % 3 === 0 ? 'video' : 'article',
        imageUrl: null,
        author: 'System'
      });
    }
    setWpPosts(mock);
  };

  const filteredPosts = wpPosts.filter(post => activeSport === 'All' || post.sport === activeSport);
  const videos = filteredPosts.filter(p => p.type === 'video');
  const articles = filteredPosts.filter(p => p.type === 'article' || p.type === 'podcast');

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-sans">
      <Header activeSport={activeSport} setActiveSport={setActiveSport} setCurrentView={setCurrentView} />
      <ToolsBar activeSport={activeSport} />

      {isLoading && currentView === 'home' && (
        <div className="max-w-[1600px] mx-auto p-12 flex flex-col items-center justify-center text-gray-500">
          <Loader2 size={48} className="animate-spin text-red-600 mb-4" />
          <p className="font-bold uppercase tracking-widest text-sm">Fetching Live Data from FSAN...</p>
        </div>
      )}

      {!isLoading && currentView === 'home' && (
        <Home videos={videos} articles={articles} activeSport={activeSport} setActiveSport={setActiveSport} setCurrentView={setCurrentView} setSelectedItem={setSelectedItem} />
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