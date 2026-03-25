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

  useEffect(() => {
    const fetchWordPressData = async () => {
      try {
        setIsLoading(true);
        const catRes = await fetch('https://fsan.com/wp-json/wp/v2/categories?per_page=100&_fields=id,slug');
        if (!catRes.ok) throw new Error("CORS or Network Error");
        const categories = await catRes.json();
        const categoryMap = {};
        categories.forEach(c => categoryMap[c.id] = c.slug);

        // We use .catch(e => null) so a failure doesn't crash the whole Promise
        const [articlesRes, videosRes] = await Promise.all([
          fetch('https://fsan.com/wp-json/wp/v2/posts?_embed&per_page=30').catch(e => null),
          fetch('https://fsan.com/wp-json/wp/v2/yt2posts_youtube?_embed&per_page=30').catch(e => null)
        ]);

        // NEW SAFETY NET: If BOTH return null, the user's internet dropped completely!
        if (!articlesRes && !videosRes) {
          throw new Error("Network connection dropped entirely.");
        }

        // Only parse the JSON if the response exists and was successful
        const rawArticles = articlesRes?.ok ? await articlesRes.json() : [];
        const rawVideos = videosRes?.ok ? await videosRes.json() : [];

        const formatPost = (post, defaultType) => {
          const slugs = (post.categories || []).map(id => categoryMap[id] || '');
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

        const formattedArticles = rawArticles.map(post => formatPost(post, 'article'));
        const formattedVideos = rawVideos.map(post => formatPost(post, 'video'));
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
        <VideosArchive videos={videos} activeSport={activeSport} setCurrentView={setCurrentView} setSelectedItem={setSelectedItem} />
      )}

      {!isLoading && currentView === 'articles' && (
        <ArticlesArchive articles={articles} activeSport={activeSport} setCurrentView={setCurrentView} setSelectedItem={setSelectedItem} />
      )}

      {selectedItem && (
        <ContentModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} videos={videos} />
      )}
    </div>
  );
}