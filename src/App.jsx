import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Trophy, PlayCircle, ChevronDown, Menu, X, ArrowLeft, Loader2 } from 'lucide-react';

// Custom SVG components for brand icons
const Facebook = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const Twitter = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
);
const Youtube = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 7.1C2.5 7.1 2.3 5.3 3.1 4.5 4 3.5 5.1 3.5 5.6 3.4 8.7 3.1 12 3.1 12 3.1s3.3 0 6.4.3c.5.1 1.6.1 2.5 1.1.8.8 1 2.6 1 2.6s.2 2.1.2 4.2v1.8c0 2.1-.2 4.2-.2 4.2s-.2 1.8-1 2.6c-.9.9-2.1.9-2.6 1-3.3.3-6.4.3-6.4.3s-3.3 0-6.4-.3c-.5-.1-1.6-.1-2.5-1.1-.8-.8-1-2.6-1-2.6s-.2-2.1-.2-4.2v-1.8c0-2.1.2-4.2.2-4.2z"></path><polygon points="9.8 15.4 15.9 11.8 9.8 8.1 9.8 15.4"></polygon></svg>
);
const Instagram = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

export default function App() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSport, setActiveSport] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  
  // LIVE WORDPRESS STATE
  const [wpPosts, setWpPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic theme colors
  const themes = {
    All: { text: 'text-gray-300', border: 'border-gray-500', hoverText: 'hover:text-white', hoverBorder: 'hover:border-gray-400', bg: 'bg-gradient-to-r from-gray-500 to-gray-700', toolsBg: 'bg-[#1a1a1a] border-gray-800' },
    Football: { text: 'text-red-500', border: 'border-red-600', hoverText: 'hover:text-red-400', hoverBorder: 'hover:border-red-500', bg: 'bg-red-600', toolsBg: 'bg-red-900/20 border-red-900/50' },
    Basketball: { text: 'text-orange-500', border: 'border-orange-500', hoverText: 'hover:text-orange-400', hoverBorder: 'hover:border-orange-500', bg: 'bg-orange-500', toolsBg: 'bg-orange-900/20 border-orange-900/50' },
    Baseball: { text: 'text-blue-500', border: 'border-blue-500', hoverText: 'hover:text-blue-400', hoverBorder: 'hover:border-blue-500', bg: 'bg-blue-500', toolsBg: 'bg-blue-900/20 border-blue-900/50' },
  };
  const theme = themes[activeSport];

  // ==========================================
  // API FETCH LOGIC
  // ==========================================
  useEffect(() => {
    const fetchWordPressData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch Categories FASTER by limiting fields to just ID and Slug
        const catRes = await fetch('https://fsan.com/wp-json/wp/v2/categories?per_page=100&_fields=id,slug');
        if (!catRes.ok) throw new Error("CORS or Network Error");
        const categories = await catRes.json();
        
        const categoryMap = {};
        const videoCategoryIds = [];
        
        categories.forEach(c => {
          categoryMap[c.id] = c.slug;
          // Capture the exact ID for any category slug that has 'video' in it
          if (c.slug.includes('video')) {
            videoCategoryIds.push(c.id);
          }
        });

        const videoIdsParam = videoCategoryIds.join(',');

        // 2. Fetch Videos and Articles in PARALLEL to slash load times
        // We limit per_page to exactly what we need so the WordPress server doesn't choke on _embed
        const [videosRes, articlesRes] = await Promise.all([
          fetch(`https://fsan.com/wp-json/wp/v2/posts?categories=${videoIdsParam}&_embed&per_page=10`),
          fetch(`https://fsan.com/wp-json/wp/v2/posts?categories_exclude=${videoIdsParam}&_embed&per_page=15`)
        ]);

        const rawVideos = await videosRes.json();
        const rawArticles = await articlesRes.json();
        const posts = [...rawVideos, ...rawArticles];

        // 3. Format and Sort the Data based on your exact category slugs
        const formattedData = posts.map(post => {
          const slugs = post.categories.map(id => categoryMap[id] || '');
          
          let sport = 'Football'; // Default
          if (slugs.some(s => s.includes('basketball'))) sport = 'Basketball';
          if (slugs.some(s => s.includes('baseball'))) sport = 'Baseball';

          let type = 'article';
          if (slugs.some(s => s.includes('video'))) type = 'video';
          if (slugs.some(s => s.includes('podcast'))) type = 'podcast';

          const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
          const author = post._embedded?.author?.[0]?.name || 'FSAN Staff';
          const date = new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
          const rawTimestamp = new Date(post.date).getTime(); // For accurate sorting

          // SMART YOUTUBE EXTRACTOR: Finds the YouTube ID from the YT2Posts plugin output
          let youtubeId = null;
          let cleanContent = post.content.rendered;
          const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
          const match = post.content.rendered.match(ytRegex);
          
          if (match && match[1]) {
            youtubeId = match[1];
            // Remove the raw iframe from the text description so it doesn't show up twice
            cleanContent = cleanContent.replace(/<iframe.*?<\/iframe>/i, '');
          }

          return {
            id: post.id,
            title: post.title.rendered,
            content: cleanContent,
            excerpt: post.excerpt.rendered,
            date,
            rawTimestamp,
            sport,
            type,
            imageUrl,
            author,
            youtubeId, // Extracted ID
            link: post.link
          };
        });

        // Sort everything by date so the 'All' views mix correctly
        formattedData.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
        setWpPosts(formattedData);

      } catch (error) {
        console.warn("Using Mock Data. WordPress API blocked by CORS or unavailable: ", error);
        generateMockData(); // Fallback if API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordPressData();
  }, []);

  // FAKE DATA GENERATOR (Runs only if real WP API is blocked)
  const generateMockData = () => {
    const mock = [];
    for(let i=0; i<30; i++) {
      const type = i % 3 === 0 ? 'video' : 'article';
      const sport = i % 2 === 0 ? 'Football' : i % 5 === 0 ? 'Basketball' : 'Baseball';
      mock.push({
        id: `mock-${i}`,
        title: `MOCKUP: 2026 ${sport} Strategy Guide & Breakdown Part ${i}`,
        content: '<p>This is mockup fallback content because the live WordPress API is currently blocking the connection via CORS.</p>',
        excerpt: '<p>A quick summary of the article...</p>',
        date: `MARCH ${25 - (i % 10)}, 2026`,
        sport: sport,
        type: type,
        imageUrl: null,
        author: 'John Doe'
      });
    }
    setWpPosts(mock);
  };

  // ==========================================
  // DATA FILTERING FOR THE UI
  // ==========================================
  const filteredPosts = wpPosts.filter(post => activeSport === 'All' || post.sport === activeSport);
  const videos = filteredPosts.filter(p => p.type === 'video');
  const articles = filteredPosts.filter(p => p.type === 'article' || p.type === 'podcast');

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-sans">
      
      {/* --- TOP BAR (Utility Nav) --- */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-2 flex justify-between items-center text-xs font-semibold tracking-wide z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-black rounded-lg border border-gray-600 flex items-center justify-center shadow-lg">
            <span className="font-bold text-2xl text-white italic">F</span>
          </div>
          <div className="hidden sm:flex flex-col uppercase">
            <span className="text-white text-lg leading-none tracking-widest font-bold">Fantasy Sports</span>
            <span className="text-gray-400 text-[10px] tracking-[0.2em]">Advice Network</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-gray-400 uppercase">
          <a href="#" className="hover:text-white transition-colors">Join Our Community</a>
          <a href="#" className="hover:text-white transition-colors">Join The Napkin League</a>
          <a href="#" className="hover:text-white transition-colors">Join A Jersey League</a>
          <a href="#" className="hover:text-white transition-colors">Subscribe</a>
          <a href="#" className="hover:text-white transition-colors">Log In</a>
        </div>
        
        <div className="lg:hidden flex items-center gap-3">
          <div className="hidden md:flex bg-[#121212] p-1 rounded-full border border-gray-800 items-center shadow-inner relative">
            {['All', 'Football', 'Basketball', 'Baseball'].map((sport) => (
              <button 
                key={`tablet-${sport}`}
                onClick={() => { setActiveSport(sport); setCurrentView('home'); }}
                className={`relative z-10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeSport === sport ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {activeSport === sport && <span className={`absolute inset-0 rounded-full opacity-20 ${themes[sport].bg}`}></span>}
                {sport}
              </button>
            ))}
          </div>
          <button onClick={() => setIsSearchModalOpen(true)} className="text-gray-400 hover:text-white p-2 transition-colors"><Search size={20} /></button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2 hover:text-gray-300 transition-colors"><Menu size={24} /></button>
        </div>
      </div>

      {/* --- MAIN NAVIGATION BAR --- */}
      <div className="bg-[#1e1e1e] border-b border-gray-800 px-4 py-3 hidden lg:flex justify-between items-center text-sm font-bold uppercase tracking-wider z-40 relative">
        <div className="flex items-center gap-4">
          <div className="bg-[#121212] p-1 rounded-full border border-gray-800 flex items-center shadow-inner relative">
            {['All', 'Football', 'Basketball', 'Baseball'].map((sport) => (
              <button 
                key={sport}
                onClick={() => { setActiveSport(sport); setCurrentView('home'); }}
                className={`relative z-10 px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeSport === sport ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {activeSport === sport && <span className={`absolute inset-0 rounded-full opacity-20 ${themes[sport].bg}`}></span>}
                {sport}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 text-gray-400">
          <button onClick={() => setIsSearchModalOpen(true)} className="hover:text-white transition-colors flex items-center gap-2 group">
            <Search size={18} className="group-hover:text-red-500 transition-colors" />
            <span className="text-xs">Search</span>
          </button>
          <div className="h-4 w-px bg-gray-700"></div>
          <div className="flex items-center gap-4">
            <Facebook size={16} className="hover:text-blue-600 cursor-pointer" />
            <Twitter size={16} className="hover:text-blue-400 cursor-pointer" />
            <Youtube size={16} className="hover:text-red-600 cursor-pointer" />
            <Instagram size={16} className="hover:text-pink-600 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* --- DYNAMIC TOOLS BAR --- */}
      <div className={`${theme.toolsBg} text-xs py-2.5 px-6 overflow-x-auto flex items-center gap-6 border-b transition-colors duration-300 scrollbar-hide shadow-inner z-30 relative`}>
        <span className={`font-black uppercase tracking-widest ${theme.text} shrink-0`}>Tools</span>
        <div className="h-4 w-px bg-gray-600 shrink-0"></div>
        <div className="flex items-center gap-8 whitespace-nowrap text-gray-400 font-bold uppercase tracking-wider">
          <a href="#" className={`hover:${theme.text} transition-colors`}>Trade Analyzer</a>
          <a href="#" className={`hover:${theme.text} transition-colors`}>Dynasty Rankings</a>
          <a href="#" className={`hover:${theme.text} transition-colors`}>Rookie Mock Draft</a>
          <a href="#" className={`hover:${theme.text} transition-colors`}>Start / Sit Optimizer</a>
          <a href="#" className={`hover:${theme.text} transition-colors`}>DFS Projections</a>
        </div>
      </div>

      {/* --- API LOADING INDICATOR --- */}
      {isLoading && currentView === 'home' && (
        <div className="max-w-[1600px] mx-auto p-12 flex flex-col items-center justify-center text-gray-500">
          <Loader2 size={48} className="animate-spin text-red-600 mb-4" />
          <p className="font-bold uppercase tracking-widest text-sm">Fetching Live Data from FSAN...</p>
        </div>
      )}

      {/* --- CONDITIONAL RENDERING FOR VIEWS --- */}
      {!isLoading && currentView === 'home' && (
        <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
          
          {/* LEFT COLUMN: VIDEOS */}
          <div className="md:col-span-1 lg:col-span-3 flex flex-col gap-4">
            <div className={`bg-[#1a1a1a] p-3 border-b-2 ${theme.border} font-bold uppercase tracking-wider text-sm shadow-md transition-colors duration-300`}>
              Latest Videos
            </div>
          
            <div className="flex flex-col gap-4">
              {videos.slice(0, 5).map((video) => (
                <div key={video.id} onClick={() => setSelectedItem(video)} className="group cursor-pointer relative rounded overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg hover:border-gray-500 transition-all">
                  <div className="h-40 bg-gradient-to-tr from-[#1c233a] to-[#111] relative flex items-center justify-center overflow-hidden">
                     {video.imageUrl && <img src={video.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />}
                     <PlayCircle size={48} className="text-white/60 group-hover:text-white transition-all transform group-hover:scale-110 z-10 relative" />
                  </div>
                  <div className="p-3 relative z-10 bg-[#1e1e1e]">
                    <span className="text-gray-400 font-bold text-xs flex items-center">
                      {activeSport === 'All' && <span className={`w-2 h-2 rounded-full ${themes[video.sport].bg} mr-2 shrink-0`}></span>}
                      {video.date}
                    </span>
                    {/* dangerouslySetInnerHTML handles WP's funky apostrophes like &#8217; */}
                    <h3 className={`font-bold text-sm mt-1 leading-tight group-hover:${themes[video.sport].text} transition-colors`} dangerouslySetInnerHTML={{ __html: video.title }} />
                  </div>
                </div>
              ))}

              {activeSport === 'All' ? (
                <div className="mt-2 p-3 bg-[#161616] border border-gray-800 rounded-lg flex flex-col items-center gap-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">View All Videos By Sport</span>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => { setActiveSport('Football'); setCurrentView('videos'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-red-900/20 hover:text-red-500 hover:border-red-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NFL</button>
                    <button onClick={() => { setActiveSport('Basketball'); setCurrentView('videos'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-orange-900/20 hover:text-orange-500 hover:border-orange-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NBA</button>
                    <button onClick={() => { setActiveSport('Baseball'); setCurrentView('videos'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-blue-900/20 hover:text-blue-500 hover:border-blue-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">MLB</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setCurrentView('videos')} className={`w-full py-3 mt-2 border border-gray-700 rounded text-xs font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] ${theme.hoverText} ${theme.hoverBorder}`}>
                  View All {activeSport} Videos
                </button>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: ARTICLES */}
          <div className="md:col-span-2 lg:col-span-6 flex flex-col gap-4">
            <div className={`bg-[#1a1a1a] p-3 border-b-2 ${theme.border} font-bold uppercase tracking-wider text-sm shadow-md flex justify-between items-center transition-colors duration-300`}>
              <span>Latest Articles</span>
            </div>

            {articles.length > 0 && (
              <div onClick={() => setSelectedItem(articles[0])} className="group cursor-pointer rounded-lg overflow-hidden bg-[#1e1e1e] shadow-xl border border-gray-800 hover:border-gray-600 transition-all relative">
                <div className="h-[400px] w-full bg-gradient-to-b from-[#2a3044] to-[#0a0a0a] flex flex-col justify-end p-6 relative overflow-hidden">
                   {articles[0].imageUrl ? (
                     <img src={articles[0].imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-30 transition-all transform group-hover:scale-105" />
                   ) : (
                     <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-gray-900 to-black"></div>
                   )}
                   <div className="relative z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-4 -mx-6 -mb-6 mt-12">
                     <div className="flex items-center gap-2 mb-2">
                       {activeSport === 'All' && <span className={`w-2 h-2 rounded-full ${themes[articles[0].sport].bg} shrink-0`}></span>}
                       <span className="text-gray-400 font-bold text-xs">{articles[0].date}</span>
                     </div>
                     <h2 className={`text-3xl font-bold text-white mb-2 leading-tight group-hover:${themes[articles[0].sport].text} transition-colors`} dangerouslySetInnerHTML={{ __html: articles[0].title }} />
                     <div className="text-sm text-gray-300 line-clamp-2" dangerouslySetInnerHTML={{ __html: articles[0].excerpt }} />
                   </div>
                </div>
              </div>
            )}

            {/* Sub Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {articles.slice(1, 5).map((article) => (
                <div key={article.id} onClick={() => setSelectedItem(article)} className="group cursor-pointer rounded overflow-hidden bg-[#1e1e1e] shadow-lg border border-gray-800 flex flex-row h-32 hover:bg-[#252525] transition-colors relative">
                  <div className={`w-1/3 relative overflow-hidden bg-gray-800`}>
                    {article.imageUrl ? (
                      <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br from-gray-700 to-[#111]`}></div>
                    )}
                  </div>
                  <div className="w-2/3 p-3 flex flex-col justify-center">
                     <div className="flex items-center gap-1.5 mb-1">
                       {activeSport === 'All' && <span className={`w-1.5 h-1.5 rounded-full ${themes[article.sport].bg} shrink-0`}></span>}
                       <span className="text-gray-400 font-bold text-[10px]">{article.date}</span>
                     </div>
                     <h3 className={`font-bold text-sm leading-tight group-hover:${themes[article.sport].text} transition-colors`} dangerouslySetInnerHTML={{ __html: article.title }} />
                  </div>
                </div>
              ))}
            </div>

            {/* --- NEW MORE ARTICLES LIST --- */}
            {articles.length > 5 && (
              <div className="mt-6 flex flex-col gap-4">
                <div className={`bg-[#1a1a1a] p-3 border-b-2 ${theme.border} font-bold uppercase tracking-wider text-sm shadow-md transition-colors duration-300`}>
                  More Articles
                </div>

                {articles.slice(5, 15).map((article) => (
                  <div key={article.id} onClick={() => setSelectedItem(article)} className="group cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded p-3 flex gap-4 hover:border-gray-600 transition-all shadow-sm relative overflow-hidden">
                    <div className="w-32 h-24 bg-gray-800 rounded shrink-0 relative overflow-hidden border border-gray-800">
                      {article.imageUrl ? (
                        <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black"></div>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center flex-1">
                      <div className="flex gap-2 items-center mb-1.5">
                        {activeSport === 'All' && <span className={`w-2 h-2 rounded-full ${themes[article.sport].bg} shrink-0`}></span>}
                        <span className="text-gray-500 text-[10px] font-bold">{article.date}</span>
                      </div>
                      <h3 className={`font-bold text-base mb-1.5 leading-tight group-hover:${themes[article.sport].text} transition-colors`} dangerouslySetInnerHTML={{ __html: article.title }} />
                      <div className="text-xs text-gray-400 line-clamp-2" dangerouslySetInnerHTML={{ __html: article.excerpt }} />
                    </div>
                  </div>
                ))}
                
                {activeSport === 'All' ? (
                  <div className="mt-2 p-3 bg-[#161616] border border-gray-800 rounded-lg flex flex-col items-center gap-3">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Load More Articles</span>
                    <div className="flex gap-2 w-full">
                      <button onClick={() => { setActiveSport('Football'); setCurrentView('articles'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-red-900/20 hover:text-red-500 hover:border-red-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NFL Articles</button>
                      <button onClick={() => { setActiveSport('Basketball'); setCurrentView('articles'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-orange-900/20 hover:text-orange-500 hover:border-orange-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NBA Articles</button>
                      <button onClick={() => { setActiveSport('Baseball'); setCurrentView('articles'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-blue-900/20 hover:text-blue-500 hover:border-blue-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">MLB Articles</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setCurrentView('articles')} className={`w-full py-3 mt-2 border border-gray-700 rounded text-xs font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] ${theme.hoverText} ${theme.hoverBorder}`}>
                    Load More {activeSport} Articles
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ADS & PROMOS (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">
            <div>
              <div className="bg-[#1a1a1a] p-3 border-b-2 border-red-600 font-bold uppercase tracking-wider text-sm shadow-md mb-4">
                2026 Rookie Guide
              </div>
              <div className="bg-gradient-to-b from-red-900 to-black border border-red-800 p-4 rounded-lg text-center cursor-pointer hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]"></div>
                 <div className="relative z-10">
                   <h3 className="text-red-500 font-black text-2xl italic tracking-tighter mb-1 uppercase drop-shadow-md">Dominate</h3>
                   <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">Your Draft With The Ultimate<br/>Rookie Breakdown!</p>
                   <div className="bg-black/50 p-2 rounded text-left text-[10px] text-green-400 font-bold mb-3 border border-gray-800">
                      <p>✓ Detailed Scouting Reports</p><p>✓ Positional Rankings</p><p>✓ Team Fit Analysis</p>
                   </div>
                   <button className="bg-green-600 hover:bg-green-500 text-white w-full py-2 rounded-full font-black text-xs uppercase tracking-wider transform transition hover:scale-105 shadow-lg">
                     Only $10 - Get Access
                   </button>
                 </div>
              </div>
            </div>

            <div>
              <div className="bg-[#1a1a1a] p-3 border-b-2 border-gray-600 font-bold uppercase tracking-wider text-sm shadow-md mb-4">
                Get Merch!
              </div>
              <div className="bg-[#111] border border-gray-800 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-purple-600 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-black z-0"></div>
                <h3 className="text-purple-500 font-black text-xl italic uppercase z-10 group-hover:scale-110 transition-transform">Fantasy Apparel</h3>
                <p className="text-gray-400 text-xs z-10 mt-2">FSAN.SHOP</p>
                <button className="mt-4 bg-transparent border-2 border-purple-600 text-purple-400 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-purple-600 hover:text-white transition-colors z-10">
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* --- CONTENT MODALS (Articles / Videos) --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-sm flex justify-center p-4 sm:p-8 overflow-y-auto">
          <div className="fixed inset-0" onClick={() => setSelectedItem(null)}></div>
          
          <button onClick={() => setSelectedItem(null)} className="fixed top-6 right-6 z-50 p-2 bg-[#1a1a1a] border border-gray-700 hover:bg-red-600 hover:border-red-600 rounded-full text-white transition-all shadow-xl">
            <X size={24} />
          </button>

          <div className={`relative z-10 w-full animate-in fade-in zoom-in-95 duration-200 ${selectedItem.type === 'video' ? 'max-w-6xl' : 'max-w-4xl'} my-auto bg-[#121212] border border-gray-800 rounded-xl shadow-2xl overflow-hidden`}>
            
            {/* --- VIDEO MODAL LAYOUT --- */}
            {selectedItem.type === 'video' && (
              <div className="flex flex-col lg:flex-row h-full max-h-[85vh]">
                <div className="lg:w-3/4 flex flex-col bg-black">
                  <div className="w-full aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative border-b border-gray-800 overflow-hidden">
                     
                     {/* YOUTUBE IFRAME GENERATOR */}
                     {selectedItem.youtubeId ? (
                       <iframe 
                         src={`https://www.youtube.com/embed/${selectedItem.youtubeId}?autoplay=1`} 
                         className="absolute inset-0 w-full h-full"
                         frameBorder="0" 
                         allow="autoplay; encrypted-media; picture-in-picture" 
                         allowFullScreen
                       ></iframe>
                     ) : (
                       <>
                         {selectedItem.imageUrl && <img src={selectedItem.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" alt="" />}
                         <PlayCircle size={64} className="text-white/80 z-10 hover:scale-110 transition-transform cursor-pointer" />
                         <div className="absolute bottom-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase rounded z-10">Video Link Unavailable</div>
                       </>
                     )}

                  </div>
                  <div className="p-6 bg-[#121212] flex-1 overflow-y-auto">
                    <div className="flex gap-2 items-center mb-2">
                      <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport].bg}`}></span>
                      <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">{selectedItem.sport} • {selectedItem.date}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
                    <div className="flex items-center gap-4 border-t border-gray-800 pt-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700 border border-gray-600"></div>
                      <div>
                        <p className="font-bold text-sm">{selectedItem.author}</p>
                        <p className="text-xs text-gray-500">FSAN Network</p>
                      </div>
                      <button className="ml-auto bg-white text-black px-4 py-1.5 rounded-full font-bold text-xs hover:bg-gray-200">Subscribe</button>
                    </div>
                    <div className="text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
                  </div>
                </div>
                
                <div className="lg:w-1/4 bg-[#161616] border-l border-gray-800 flex flex-col max-h-[85vh]">
                  <div className="p-4 border-b border-gray-800 font-bold text-sm uppercase tracking-wider">Up Next</div>
                  <div className="overflow-y-auto p-4 flex flex-col gap-4">
                    {videos.filter(v => v.id !== selectedItem.id).slice(0,5).map(v => (
                      <div key={v.id} onClick={() => setSelectedItem(v)} className="flex gap-3 group cursor-pointer">
                        <div className="w-24 h-16 bg-gray-800 rounded shrink-0 relative flex items-center justify-center overflow-hidden">
                          {v.imageUrl && <img src={v.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />}
                          <PlayCircle size={16} className="text-white/50 z-10" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className={`text-xs font-bold leading-tight group-hover:${themes[v.sport].text} line-clamp-2`} dangerouslySetInnerHTML={{ __html: v.title }} />
                          <span className="text-[10px] text-gray-500 mt-1">{v.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- ARTICLE MODAL LAYOUT --- */}
            {selectedItem.type === 'article' && (
              <div className="flex flex-col max-h-[85vh] overflow-y-auto">
                <div className="w-full h-64 md:h-96 bg-gray-800 relative overflow-hidden">
                  {selectedItem.imageUrl ? (
                    <img src={selectedItem.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900/80 to-[#121212]"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
                </div>
                
                <div className="p-6 md:p-10 -mt-24 relative z-10 max-w-4xl mx-auto w-full">
                  <div className="flex gap-2 items-center mb-3">
                    <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport].bg}`}></span>
                    <span className="text-gray-300 font-bold text-xs uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-gray-700">
                      {selectedItem.sport} • {selectedItem.date}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight drop-shadow-lg" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
                  
                  <div className="flex items-center gap-4 border-b border-gray-800 pb-6 mb-8 bg-[#121212]/80 p-4 rounded-xl backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center font-bold text-gray-400">
                      {selectedItem.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{selectedItem.author}</p>
                      <p className={`text-xs ${themes[selectedItem.sport].text} font-bold`}>FSAN Network</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <button className="w-8 h-8 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors"><Twitter size={14} /></button>
                      <button className="w-8 h-8 rounded-full bg-[#4267B2]/10 text-[#4267B2] flex items-center justify-center hover:bg-[#4267B2] hover:text-white transition-colors"><Facebook size={14} /></button>
                    </div>
                  </div>

                  {/* Render Live WP Content Here */}
                  <div className={`prose prose-invert prose-lg max-w-none text-gray-300 space-y-6 prose-a:${themes[selectedItem.sport].text} hover:prose-a:text-white`} dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
                  
                  <div className="mt-12 pt-8 border-t border-gray-800">
                    <a href={selectedItem.link} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-white flex items-center gap-2">
                      View Original Post on WordPress <ArrowLeft size={12} className="rotate-135" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- OFFCANVAS MENUS (Search / Mobile Nav) --- */}
      {/* Search Overlay */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
          <div className="w-full max-w-3xl">
            <div className="flex items-center gap-4 bg-[#1e1e1e] border border-gray-700 p-2 rounded-lg shadow-2xl">
              <Search size={24} className="text-red-500 ml-3" />
              <input type="text" autoFocus placeholder="Search players, articles, videos..." className="flex-1 bg-transparent text-white text-xl p-2 outline-none placeholder-gray-500" />
              <button onClick={() => setIsSearchModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex justify-end p-4 border-b border-gray-800 bg-[#121212]">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={32} /></button>
          </div>
          <div className="flex flex-col items-center gap-6 text-lg font-bold uppercase tracking-widest p-8 overflow-y-auto h-full">
            <div className="md:hidden w-full mb-6 flex justify-center">
              <div className="bg-[#1e1e1e] p-1.5 rounded-full border border-gray-700 flex flex-wrap justify-center gap-1 shadow-inner w-full max-w-xs">
                {['All', 'Football', 'Basketball', 'Baseball'].map((sport) => (
                  <button key={`mobile-${sport}`} onClick={() => { setActiveSport(sport); setCurrentView('home'); setIsMobileMenuOpen(false); }} className={`relative z-10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex-1 ${activeSport === sport ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
                    {activeSport === sport && <span className={`absolute inset-0 rounded-full opacity-30 ${themes[sport].bg}`}></span>}
                    {sport}
                  </button>
                ))}
              </div>
            </div>
            <a href="#" className="hover:text-red-500 transition-colors">Subscribe</a>
            <a href="#" className="hover:text-red-500 transition-colors">Log In</a>
            <div className="w-16 h-px bg-gray-800 my-2"></div>
            <a href="#" className="hover:text-red-500 transition-colors text-center">Join Our Community</a>
          </div>
        </div>
      )}
    </div>
  );
}
