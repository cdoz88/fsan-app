import React, { useEffect, useRef } from 'react';
import { PlayCircle, FileText, Film, Mic, ChevronRight, LayoutList, Users, Calculator, ArrowLeftRight, Shirt, HeartHandshake } from 'lucide-react';
import { Facebook, XIcon, Youtube, Instagram, TikTok, LinkedIn, SelloutCrowds } from '../components/Icons';
import { themes } from '../utils/theme';
import PlaybookLoader from '../components/PlaybookLoader';

export default function Home({ wpPosts, activeSport, currentView, setCurrentView, feedFilter, setFeedFilter, setSelectedItem, loadMorePosts, isLoadingMore, hasMore, isLoading }) {
  const theme = themes[activeSport];
  const observerTarget = useRef(null);

  const socialLinks = {
    All: { facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork', x: 'https://x.com/fsadvicenet', youtube: 'https://www.youtube.com/@FFAdviceNet', tiktok: 'https://www.tiktok.com/@fsadvicenetwork', linkedin: 'https://www.linkedin.com/company/fantasy-sports-advice', sellout: 'https://www.selloutcrowds.com/crowd/fsan', instagram: null },
    Football: { facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork', x: 'https://x.com/FFAdviceNet', youtube: 'https://www.youtube.com/@FFAdviceNet', instagram: 'https://www.instagram.com/ffadvicenet/', sellout: '#', tiktok: null, linkedin: null },
    Basketball: { facebook: null, x: 'https://x.com/FBBAdviceNet', youtube: 'https://www.youtube.com/@FBBAdviceNet', instagram: 'https://www.instagram.com/fbkadvicenet/', sellout: '#', tiktok: null, linkedin: null },
    Baseball: { facebook: null, x: 'https://x.com/FBAdviceNet', youtube: 'https://www.youtube.com/@FBAdviceNet', instagram: 'https://www.instagram.com/fbadvicenet/', sellout: '#', tiktok: null, linkedin: null },
  };
  const currentLinks = socialLinks[activeSport];

  // --- INFINITE SCROLL OBSERVER ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [isLoadingMore, hasMore, loadMorePosts]);

  // Group the posts
  const groupedFeed = [];
  wpPosts.forEach(item => {
    let group = groupedFeed.find(g => g.date === item.date);
    if (!group) {
      group = { date: item.date, items: [] };
      groupedFeed.push(group);
    }
    group.items.push(item);
  });

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  // ==========================================
  // UNIVERSAL FLUID AD DISPENSER
  // ==========================================
  const PromoAd = ({ type, shape }) => {
    if (type === 'rookie') {
      return (
        <div className={`w-full h-full bg-gradient-to-br from-red-900 to-black border border-red-800 rounded-2xl ${shape === 'banner' ? 'p-3 md:p-4 flex-col sm:flex-row' : 'p-4 md:p-6 flex-col'} flex items-center justify-center text-center relative overflow-hidden shadow-xl cursor-pointer hover:border-red-500 transition-colors group`}>
           <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]"></div>
           <div className={`relative z-10 flex-1 flex flex-col justify-center ${shape === 'banner' ? 'sm:text-left sm:mr-4' : 'mb-2 md:mb-4'}`}>
             <h3 className="text-red-500 font-black text-xl lg:text-2xl italic uppercase drop-shadow-md group-hover:scale-105 transition-transform origin-left leading-none">Dominate</h3>
             <p className="text-white text-[10px] font-bold uppercase tracking-widest mt-1 line-clamp-1 md:line-clamp-2">Get The Ultimate Rookie Breakdown!</p>
           </div>
           <button className="bg-green-600 text-white px-4 py-2 lg:px-5 lg:py-2.5 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg relative z-10 shrink-0 whitespace-nowrap mt-2 sm:mt-0">
             Only $10 - Get Access
           </button>
        </div>
      );
    }

    if (type === 'sellout') {
      return (
        <div className={`w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/40 via-[#111] to-black border border-red-900/50 rounded-2xl ${shape === 'banner' ? 'p-3 md:p-4 flex-col sm:flex-row' : 'p-4 md:p-6 flex-col'} flex items-center justify-center text-center relative overflow-hidden shadow-2xl cursor-pointer hover:border-red-600 transition-colors group`}>
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')", mixBlendMode: 'overlay' }}></div>
           <div className={`relative z-10 flex-1 flex flex-col justify-center ${shape === 'banner' ? 'sm:text-left sm:mr-4' : 'mb-2 md:mb-4'}`}>
             <h2 className="text-xl lg:text-2xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform origin-left line-clamp-1">Join Sellout Crowds</h2>
             <p className="text-gray-300 font-bold text-[10px] tracking-wide relative z-10 line-clamp-1 md:line-clamp-2">Win Your League with Real-Time Advice!</p>
           </div>
           <button className="bg-red-600 text-white px-4 py-2 lg:px-5 lg:py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg relative z-10 flex items-center justify-center gap-2 shrink-0 whitespace-nowrap mt-2 sm:mt-0">
              Join Community <ChevronRight size={14} />
           </button>
        </div>
      );
    }

    return (
      <div className={`w-full h-full bg-[#111] border border-purple-900/50 rounded-2xl ${shape === 'banner' ? 'p-3 md:p-4 flex-col sm:flex-row' : 'p-4 md:p-6 flex-col'} flex items-center justify-center text-center cursor-pointer hover:border-purple-600 transition-all group overflow-hidden relative shadow-xl`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-black z-0 transition-opacity group-hover:opacity-80"></div>
        <div className={`relative z-10 flex-1 flex flex-col justify-center ${shape === 'banner' ? 'sm:text-left sm:mr-4' : 'mb-2 md:mb-4'}`}>
          <h3 className="text-purple-500 font-black text-xl lg:text-2xl italic uppercase z-10 group-hover:scale-110 transition-transform origin-left line-clamp-1 leading-none">Fantasy Apparel</h3>
          <p className="text-gray-400 text-[10px] font-bold tracking-widest z-10 mt-1 line-clamp-1">FSAN.SHOP</p>
        </div>
        <button className="bg-transparent border-2 border-purple-600 text-purple-400 px-4 py-2 lg:px-5 lg:py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider group-hover:bg-purple-600 group-hover:text-white transition-colors z-10 shrink-0 whitespace-nowrap mt-2 sm:mt-0">
          Shop Now
        </button>
      </div>
    );
  };

  // ==========================================
  // CONTENT CARD COMPONENTS
  // ==========================================
  const CardTags = ({ item }) => (
    <div className="flex items-center gap-2 mb-3 z-20 relative">
      <span className={`w-2 h-2 rounded-full ${themes[item.sport]?.bg || 'bg-gray-500'} shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]`}></span>
      <span className="text-gray-300 font-bold text-[10px] uppercase tracking-wider drop-shadow-md">
        {item.type === 'article' ? `By ${item.author}` : (item.playlist || 'Featured Video')}
      </span>
    </div>
  );

  const ShortCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className={`group h-full w-full min-h-[400px] cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-600'} transition-all flex flex-col relative`}>
      {item.imageUrl ? (
         <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
      ) : (
         <div className="absolute inset-0 bg-gray-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      <PlayCircle size={48} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-lg" />
      <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
        <CardTags item={item} />
        <h3 className={`font-black text-lg text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-3 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </div>
  );

  // BRAND NEW: The Cinematic Video Overlay Card!
  // Removed h-full and min-h-[250px]. Added aspect-video to strictly lock it to 16:9!
  const VideoCard = ({ item, isHero }) => (
    <div onClick={() => setSelectedItem(item)} className={`group w-full aspect-video cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-600'} transition-all flex flex-col relative`}>
      {item.imageUrl ? (
         <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
      ) : (
         <div className="absolute inset-0 bg-gray-800" />
      )}
      
      {/* Hidden by default! Slides up on hover! */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <PlayCircle size={isHero ? 64 : 48} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-lg" />
      
      {/* Hidden by default! Slides up on hover! */}
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <CardTags item={item} />
        <h3 className={`font-black ${isHero ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'} text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-2 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </div>
  );

  // UPDATED: Now strictly for Articles (No more video logic inside)
  const VerticalCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className={`group h-full w-full cursor-pointer bg-[#1e1e1e] border ${themes[item.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-lg ${themes[item.sport]?.hoverBorder || 'hover:border-gray-600'} transition-all flex flex-col relative`}>
      <div className="w-full aspect-video relative flex items-center justify-center overflow-hidden shrink-0 bg-[#111]">
        {item.imageUrl ? (
           <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
        ) : (
           <div className="absolute inset-0 bg-gray-800" />
        )}
      </div>
      <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#161616]">
        <CardTags item={item} />
        <h3 className={`font-black text-lg leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors mb-3`} dangerouslySetInnerHTML={{ __html: item.title }} />
        <div className="text-sm text-gray-400 line-clamp-2 mt-auto" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
      </div>
    </div>
  );

  // UPDATED: Now strictly for Articles (No more video logic inside)
  const HorizontalCard = ({ item, isHero }) => (
    <div onClick={() => setSelectedItem(item)} className={`group w-full h-full cursor-pointer bg-[#1e1e1e] border ${themes[item.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-lg ${themes[item.sport]?.hoverBorder || 'hover:border-gray-600'} transition-all flex flex-col sm:flex-row relative`}>
      <div className={`w-full ${isHero ? 'sm:w-3/5 lg:w-2/3' : 'sm:w-1/2'} relative shrink-0 bg-[#111] overflow-hidden`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-auto aspect-video object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 block" />
        ) : (
          <div className="w-full aspect-video bg-gray-800 block" />
        )}
      </div>
      <div className="w-full sm:flex-1 relative bg-gradient-to-b from-[#1e1e1e] to-[#161616]">
        <div className="sm:absolute sm:inset-0 p-4 lg:p-6 flex flex-col justify-center overflow-hidden">
          <CardTags item={item} />
          <h3 className={`font-black ${isHero ? 'text-2xl lg:text-4xl' : 'text-xl lg:text-2xl'} leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors mb-2 line-clamp-2 lg:line-clamp-3`} dangerouslySetInnerHTML={{ __html: item.title }} />
          <div className={`text-sm text-gray-400 ${isHero ? 'line-clamp-3 lg:line-clamp-4' : 'line-clamp-2 lg:line-clamp-3'}`} dangerouslySetInnerHTML={{ __html: item.excerpt }} />
        </div>
      </div>
    </div>
  );

  // UPDATED: The router that intercepts Videos and assigns the cinematic card
  const RenderCard = ({ item, layoutType }) => {
    if (layoutType === 'short') return <ShortCard item={item} />;
    
    // Intercept videos immediately, giving them the cinematic overlay layout!
    if (item.type === 'video') return <VideoCard item={item} isHero={layoutType === 'hero'} />;
    
    if (layoutType === 'horizontal') return <HorizontalCard item={item} isHero={false} />;
    if (layoutType === 'hero') return <HorizontalCard item={item} isHero={true} />;
    return <VerticalCard item={item} />;
  };

  return (
    // UPDATED GRID: From 12 columns down to 5 columns so the sidebar takes exactly 20%
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-300">
      
      {/* LEFT COLUMN: STICKY DASHBOARD MENU (Now takes 1 of 5 columns) */}
      <div className="hidden lg:flex lg:col-span-1 flex-col gap-6">
        <div className="sticky top-6 flex flex-col gap-6">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-xl">
             <h4 className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-4 px-2">Browse Network</h4>
             <div className="flex flex-col gap-1">
                <button onClick={() => setCurrentView('home')} className={`flex items-center gap-3 text-sm font-bold transition-colors p-2.5 rounded-xl w-full text-left ${currentView === 'home' ? 'bg-[#252525] text-white shadow-inner border border-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>
                  <LayoutList size={18} className={theme.text} /> Timeline Feed
                </button>
                <button onClick={() => setCurrentView('articles')} className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl w-full text-left">
                  <FileText size={18} className={theme.text} /> All Articles
                </button>
                <button onClick={() => setCurrentView('videos')} className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl w-full text-left">
                  <Film size={18} className={theme.text} /> All Videos
                </button>
                <button className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl w-full text-left">
                  <Mic size={18} className={theme.text} /> All Podcasts
                </button>
             </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-xl">
             <h4 className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-4 px-2">Pro Tools</h4>
             <div className="flex flex-col gap-1">
                {[{ name: 'Player Rankings', icon: Users }, { name: 'Trade Calculator', icon: Calculator }, { name: 'Trade Value Chart', icon: ArrowLeftRight }].map(tool => {
                  const Icon = tool.icon;
                  return (
                    <a href="#" key={tool.name} className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl">
                      <Icon size={18} className={theme.text} /> {tool.name}
                    </a>
                  );
                })}
             </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-xl">
             <h4 className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-4 px-2">Connect</h4>
             <div className="flex flex-col gap-1">
                <a href="#" className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl"><SelloutCrowds size={18} className={theme.text} /> Exclusive Community</a>
                <a href="#" className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl"><Shirt size={18} className={theme.text} /> Join A Jersey League</a>
                <a href="#" className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl"><HeartHandshake size={18} className={theme.text} /> Play for Charity</a>
             </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 mt-2 mb-8">
             <div className="flex flex-wrap items-center justify-center gap-5 text-gray-500 px-2">
                {currentLinks.sellout && <a href={currentLinks.sellout} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><SelloutCrowds size={20} /></a>}
                {currentLinks.facebook && <a href={currentLinks.facebook} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><Facebook size={20} /></a>}
                {currentLinks.x && <a href={currentLinks.x} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><XIcon size={20} /></a>}
                {currentLinks.youtube && <a href={currentLinks.youtube} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><Youtube size={20} /></a>}
                {currentLinks.instagram && <a href={currentLinks.instagram} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><Instagram size={20} /></a>}
                {currentLinks.tiktok && <a href={currentLinks.tiktok} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><TikTok size={20} /></a>}
                {currentLinks.linkedin && <a href={currentLinks.linkedin} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><LinkedIn size={20} /></a>}
             </div>
             <div className="text-center mt-2">
               <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} Fantasy Sports Advice Network</p>
               <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">All Rights Reserved</p>
             </div>
          </div>
        </div>
      </div>

      {/* CENTER & RIGHT: THE UNIFIED TIMELINE BENTO BOX (Now takes 4 of 5 columns) */}
      <div className="lg:col-span-4 flex flex-col gap-8 w-full max-w-5xl">
        
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-1.5 flex gap-2 shadow-xl z-30 overflow-x-auto scrollbar-hide">
          <button onClick={() => setFeedFilter('all')} className={`flex-1 min-w-[max-content] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'all' ? `${theme.bg} text-white shadow-md` : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}>
            <LayoutList size={14} /> All
          </button>
          <button onClick={() => setFeedFilter('articles')} className={`flex-1 min-w-[max-content] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'articles' ? 'bg-[#252525] text-white shadow-md border border-gray-700' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}>
            <FileText size={14} /> Articles
          </button>
          <button onClick={() => setFeedFilter('videos')} className={`flex-1 min-w-[max-content] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'videos' ? 'bg-[#252525] text-white shadow-md border border-gray-700' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}>
            <Film size={14} /> Videos
          </button>
          <button onClick={() => setFeedFilter('podcasts')} className={`flex-1 min-w-[max-content] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'podcasts' ? 'bg-[#252525] text-white shadow-md border border-gray-700' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}>
            <Mic size={14} /> Podcasts
          </button>
        </div>

        {/* The Chronological Bento Box Bundles */}
        <div className={`flex flex-col gap-12 transition-opacity duration-300 ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          {groupedFeed.map((group, groupIndex) => {
            let displayDate = group.date;
            if (group.date === todayStr) displayDate = 'Today';
            else if (group.date === yesterdayStr) displayDate = 'Yesterday';

            const items = group.items;
            const count = items.length;
            const adTypes = ['sellout', 'rookie', 'merch'];
            const adTypeForThisDay = adTypes[groupIndex % adTypes.length]; 

            const hasShort = items.some(i => i.type === 'short');
            const shortItem = hasShort ? items.find(i => i.type === 'short') : null;
            const otherItems = hasShort ? items.filter(i => i.id !== shortItem.id) : items;

            return (
              <div key={group.date} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className={`h-px flex-1 ${theme.bg} opacity-50`}></div>
                  <span className={`font-black uppercase tracking-widest text-lg md:text-xl drop-shadow-md ${theme.text}`}>{displayDate}</span>
                  <div className={`h-px flex-[5] ${theme.bg} opacity-50`}></div>
                </div>

                {hasShort ? (
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Col: The Short */}
                    <div className="w-full lg:w-1/3 shrink-0">
                      <RenderCard item={shortItem} layoutType="short" />
                    </div>
                    
                    {/* Right Col: The Grid */}
                    {otherItems.length > 0 && (
                      <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                        {otherItems.map(item => (
                          <div key={item.id} className="col-span-1">
                            <RenderCard item={item} />
                          </div>
                        ))}
                        {/* If odd number of other items, perfectly fill the hole with a Square ad! */}
                        {otherItems.length % 2 !== 0 && (
                          <div className="col-span-1 min-h-[250px] h-full">
                            <PromoAd type={adTypeForThisDay} shape="square" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* The Pure Mathematical 3-Column Grid Layout */}
                    
                    {count === 1 && (
                      <>
                        <div className="sm:col-span-2 lg:col-span-2"><RenderCard item={items[0]} layoutType="hero" /></div>
                        <div className="sm:col-span-1 lg:col-span-1 min-h-[250px] h-full"><PromoAd type={adTypeForThisDay} shape="square" /></div>
                      </>
                    )}

                    {count === 2 && (
                      <>
                        <div className="col-span-1"><RenderCard item={items[0]} /></div>
                        <div className="col-span-1"><RenderCard item={items[1]} /></div>
                        <div className="col-span-1 min-h-[250px] h-full"><PromoAd type={adTypeForThisDay} shape="square" /></div>
                      </>
                    )}

                    {count === 3 && items.map(item => (
                      <div key={item.id} className="col-span-1"><RenderCard item={item} /></div>
                    ))}

                    {count === 4 && (
                      <>
                        <div className="sm:col-span-2 lg:col-span-2"><RenderCard item={items[0]} layoutType="hero" /></div>
                        <div className="col-span-1 min-h-[250px] h-full"><PromoAd type={adTypeForThisDay} shape="square" /></div>
                        {items.slice(1).map(item => (
                          <div key={item.id} className="col-span-1"><RenderCard item={item} /></div>
                        ))}
                      </>
                    )}

                    {count > 4 && (
                      <>
                        <div className="sm:col-span-2 lg:col-span-2"><RenderCard item={items[0]} layoutType="hero" /></div>
                        <div className="col-span-1"><RenderCard item={items[1]} /></div>
                        {items.slice(2).map(item => (
                          <div key={item.id} className="col-span-1"><RenderCard item={item} /></div>
                        ))}
                        
                        {/* Pad the final row to keep the grid perfectly rectangular */}
                        {(count - 2) % 3 === 1 && (
                          <div className="sm:col-span-2 lg:col-span-2 min-h-[150px] h-full"><PromoAd type={adTypeForThisDay} shape="banner" /></div>
                        )}
                        {(count - 2) % 3 === 2 && (
                          <div className="col-span-1 min-h-[250px] h-full"><PromoAd type={adTypeForThisDay} shape="square" /></div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* INFINITE SCROLL LOADER / TRIPWIRE */}
          {hasMore && (
            <div ref={observerTarget} className="w-full py-12 flex justify-center items-center">
              {isLoadingMore && <PlaybookLoader className="scale-125" />}
            </div>
          )}

          {groupedFeed.length === 0 && (
            <div className="py-16 text-center text-gray-500 font-bold uppercase tracking-widest border-2 border-dashed border-gray-800 rounded-2xl">
              No recent content found for this filter.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}