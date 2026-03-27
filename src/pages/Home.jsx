import React, { useEffect, useRef, useState } from 'react';
import { PlayCircle, FileText, Film, Mic, ChevronRight, LayoutList, Users, Calculator, ArrowLeftRight, Shirt, HeartHandshake, ShoppingCart, ChevronUp } from 'lucide-react';
import { Facebook, XIcon, Youtube, Instagram, TikTok, LinkedIn, SelloutCrowds } from '../components/Icons';
import { themes } from '../utils/theme';
import PlaybookLoader from '../components/PlaybookLoader';

export default function Home({ wpPosts, activeSport, currentView, setCurrentView, feedFilter, setFeedFilter, setSelectedItem, loadMorePosts, isLoadingMore, hasMore, isLoading }) {
  const theme = themes[activeSport] || themes.All;
  const observerTarget = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const socialLinks = {
    All: { facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork', x: 'https://x.com/fsadvicenet', youtube: 'https://www.youtube.com/@FFAdviceNet', tiktok: 'https://www.tiktok.com/@fsadvicenetwork', linkedin: 'https://www.linkedin.com/company/fantasy-sports-advice', sellout: 'https://www.selloutcrowds.com/crowd/fsan', instagram: null },
    Football: { facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork', x: 'https://x.com/FFAdviceNet', youtube: 'https://www.youtube.com/@FFAdviceNet', instagram: 'https://www.instagram.com/ffadvicenet/', sellout: '#', tiktok: null, linkedin: null },
    Basketball: { facebook: null, x: 'https://x.com/FBBAdviceNet', youtube: 'https://www.youtube.com/@FBBAdviceNet', instagram: 'https://www.instagram.com/fbkadvicenet/', sellout: '#', tiktok: null, linkedin: null },
    Baseball: { facebook: null, x: 'https://x.com/FBAdviceNet', youtube: 'https://www.youtube.com/@FBAdviceNet', instagram: 'https://www.instagram.com/fbadvicenet/', sellout: '#', tiktok: null, linkedin: null },
  };
  const currentLinks = socialLinks[activeSport];

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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const PromoAd = ({ type, shape }) => {
    const heightClass = shape === 'banner' ? 'min-h-[120px]' : 'min-h-[250px]';

    if (type === 'rookie') {
      return (
        <div className={`w-full ${heightClass} bg-gradient-to-br from-red-900 to-black border border-red-800 rounded-2xl ${shape === 'banner' ? 'p-3 md:p-4 flex-col sm:flex-row' : 'p-4 md:p-6 flex-col'} flex items-center justify-center text-center relative overflow-hidden shadow-xl cursor-pointer hover:border-red-500 transition-colors group`}>
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
        <div className={`w-full ${heightClass} bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/40 via-[#111] to-black border border-red-900/50 rounded-2xl ${shape === 'banner' ? 'p-3 md:p-4 flex-col sm:flex-row' : 'p-4 md:p-6 flex-col'} flex items-center justify-center text-center relative overflow-hidden shadow-2xl cursor-pointer hover:border-red-600 transition-colors group`}>
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
      <div className={`w-full ${heightClass} bg-[#111] border border-purple-900/50 rounded-2xl ${shape === 'banner' ? 'p-3 md:p-4 flex-col sm:flex-row' : 'p-4 md:p-6 flex-col'} flex items-center justify-center text-center cursor-pointer hover:border-purple-600 transition-all group overflow-hidden relative shadow-xl`}>
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

  const CardTags = ({ item }) => (
    <div className="flex items-center gap-2 mb-3 z-20 relative">
      <span className={`w-2 h-2 rounded-full ${themes[item.sport]?.bg || 'bg-gray-500'} shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]`}></span>
      <span className="text-gray-300 font-bold text-[10px] uppercase tracking-wider drop-shadow-md">
        {item.type === 'article' ? `By ${item.author}` : (item.playlist || 'Featured Video')}
      </span>
    </div>
  );

  const ShortCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className={`group w-full min-h-[400px] cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-600'} transition-all flex flex-col relative`}>
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

  // RESTORED: Pure strictly-constrained 16:9 Video Card with slide-up cinematic overlay!
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

  // PURE IFRAME PODCAST: Title and description stripped. Perfectly bordered audio player with precise 200px height.
  // Updated URL Parameters to show Info & Share, but hide Transcript, Likes, Comments, Logo.
  const PodcastCard = ({ item }) => (
    <div className={`w-full bg-[#111] border ${themes[item.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-center`}>
      {item.spreakerId ? (
        <iframe 
          src={`https://widget.spreaker.com/player?episode_id=${item.spreakerId}&theme=dark&playlist=false&playlist-continuous=false&chapters-image=true&episode_image_position=right&hide-logo=true&hide-likes=true&hide-comments=true&hide-sharing=false&hide-episode-description=false&hide-transcript=true&hide-download=true`} 
          width="100%" 
          height="200px"
          frameBorder="0" 
          allow="autoplay; picture-in-picture"
          style={{ display: 'block' }}
        ></iframe>
      ) : (
         <div className="w-full h-[200px] flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs">Audio Unavailable</div>
      )}
    </div>
  );

  const VerticalCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className={`group w-full cursor-pointer bg-[#1e1e1e] border ${themes[item.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-lg ${themes[item.sport]?.hoverBorder || 'hover:border-gray-600'} transition-all flex flex-col relative`}>
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

  const HorizontalCard = ({ item, isHero }) => (
    <div onClick={() => setSelectedItem(item)} className={`group w-full cursor-pointer bg-[#1e1e1e] border ${themes[item.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-lg ${themes[item.sport]?.hoverBorder || 'hover:border-gray-600'} transition-all flex flex-col sm:flex-row relative`}>
      <div className={`w-full ${isHero ? 'sm:w-3/5 lg:w-2/3' : 'sm:w-1/2'} relative shrink-0 bg-[#111] overflow-hidden min-h-[200px]`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 block" />
        ) : (
          <div className="absolute inset-0 bg-gray-800 block" />
        )}
      </div>
      <div className="w-full sm:flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#161616] p-4 lg:p-6 flex flex-col justify-center">
        <CardTags item={item} />
        <h3 className={`font-black ${isHero ? 'text-2xl lg:text-4xl' : 'text-xl lg:text-2xl'} leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors mb-2 line-clamp-2 lg:line-clamp-3`} dangerouslySetInnerHTML={{ __html: item.title }} />
        <div className={`text-sm text-gray-400 ${isHero ? 'line-clamp-3 lg:line-clamp-4' : 'line-clamp-2 lg:line-clamp-3'}`} dangerouslySetInnerHTML={{ __html: item.excerpt }} />
      </div>
    </div>
  );

  const RenderCard = ({ item, layoutType }) => {
    if (layoutType === 'short') return <ShortCard item={item} />;
    if (item.type === 'video') return <VideoCard item={item} isHero={layoutType === 'hero'} />;
    if (item.type === 'podcast') return <PodcastCard item={item} />;
    if (layoutType === 'horizontal') return <HorizontalCard item={item} isHero={false} />;
    if (layoutType === 'hero') return <HorizontalCard item={item} isHero={true} />;
    return <VerticalCard item={item} />;
  };

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-300">
      <div className="hidden lg:flex lg:col-span-1 flex-col gap-6">
        <div className="sticky top-[88px] flex flex-col gap-6">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-xl">
             <h4 className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-4 px-2">Browse Network</h4>
             <div className="flex flex-col gap-1">
                <button onClick={() => { setCurrentView('home'); window.scrollTo(0, 0); }} className={`flex items-center gap-3 text-sm font-bold transition-colors p-2.5 rounded-xl w-full text-left ${currentView === 'home' ? 'bg-[#252525] text-white shadow-inner border border-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>
                  <LayoutList size={18} className={theme.text} /> Timeline Feed
                </button>
                <button onClick={() => { setCurrentView('articles'); window.scrollTo(0, 0); }} className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl w-full text-left">
                  <FileText size={18} className={theme.text} /> All Articles
                </button>
                <button onClick={() => { setCurrentView('videos'); window.scrollTo(0, 0); }} className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl w-full text-left">
                  <Film size={18} className={theme.text} /> All Videos
                </button>
                <button onClick={() => { setCurrentView('podcasts'); window.scrollTo(0, 0); }} className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl w-full text-left">
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
                <a href="https://fsan.shop" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl"><ShoppingCart size={18} className={theme.text} /> Merch Shop</a>
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
               <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} FSAN</p>
               <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">All Rights Reserved</p>
             </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-8 w-full max-w-5xl">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-1.5 flex gap-2 shadow-xl z-30 overflow-x-auto scrollbar-hide">
          <button onClick={() => { setFeedFilter('all'); window.scrollTo(0, 0); }} className={`flex-1 min-w-[max-content] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'all' ? `${theme.bg} text-white shadow-md` : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}>
            <LayoutList size={14} /> All
          </button>
          <button onClick={() => { setFeedFilter('articles'); window.scrollTo(0, 0); }} className={`flex-1 min-w-[max-content] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'articles' ? 'bg-[#252525] text-white shadow-md border border-gray-700' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}>
            <FileText size={14} /> Articles
          </button>
          <button onClick={() => { setFeedFilter('videos'); window.scrollTo(0, 0); }} className={`flex-1 min-w-[max-content] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'videos' ? 'bg-[#252525] text-white shadow-md border border-gray-700' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}>
            <Film size={14} /> Videos
          </button>
          <button onClick={() => { setFeedFilter('podcasts'); window.scrollTo(0, 0); }} className={`flex-1 min-w-[max-content] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'podcasts' ? 'bg-[#252525] text-white shadow-md border border-gray-700' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}>
            <Mic size={14} /> Podcasts
          </button>
        </div>

        <div className={`flex flex-col gap-12 transition-opacity duration-300 ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          {groupedFeed.map((group, groupIndex) => {
            let displayDate = group.date;
            if (group.date === todayStr) displayDate = 'Today';
            else if (group.date === yesterdayStr) displayDate = 'Yesterday';

            // DYNAMIC SMART ALLOCATOR
            const shorts = [...group.items.filter(i => i.type === 'short')];
            const podcasts = [...group.items.filter(i => i.type === 'podcast')];
            const standards = [...group.items.filter(i => i.type !== 'short' && i.type !== 'podcast')];
            
            const adTypes = ['sellout', 'rookie', 'merch'];
            const adTypeForThisDay = adTypes[groupIndex % adTypes.length]; 
            
            const rows = [];
            let layoutCounter = groupIndex; 

            while (shorts.length > 0) {
              const shortItem = shorts.shift();
              const rightItems = [];
              for (let i = 0; i < 2; i++) {
                if (podcasts.length > 0) rightItems.push({ type: 'item', item: podcasts.shift() });
                else if (standards.length > 0) rightItems.push({ type: 'item', item: standards.shift() });
                else rightItems.push({ type: 'ad', adType: 'banner' });
              }

              const isFlipped = layoutCounter % 2 !== 0;
              layoutCounter++;

              rows.push(
                // CHANGED: items-start instead of items-stretch prevents artificial stretching / black gaps!
                <div key={`row-short-${shortItem.id}`} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* CHANGED: Removed h-full padding here too! */}
                  <div className={`lg:col-span-1 ${isFlipped ? 'order-last lg:order-last' : ''}`}>
                    <RenderCard item={shortItem} layoutType="short" />
                  </div>
                  <div className={`lg:col-span-2 flex flex-col gap-6 ${isFlipped ? 'order-first lg:order-first' : ''}`}>
                    {rightItems.map((ri, idx) => (
                      <div key={idx} className="w-full flex flex-col">
                        {ri.type === 'item' ? (
                          <RenderCard item={ri.item} layoutType="horizontal" />
                        ) : (
                          <PromoAd type={adTypeForThisDay} shape="banner" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            while (podcasts.length > 0) {
              const podItem = podcasts.shift();
              const pairItem = standards.length > 0 ? { type: 'item', item: standards.shift() } : { type: 'ad', adType: 'square' };
              
              const isFlipped = layoutCounter % 2 !== 0;
              layoutCounter++;

              rows.push(
                <div key={`row-pod-${podItem.id}`} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className={`lg:col-span-2 ${isFlipped ? 'order-last lg:order-last' : ''}`}>
                    <RenderCard item={podItem} layoutType="podcast" />
                  </div>
                  <div className={`lg:col-span-1 flex flex-col ${isFlipped ? 'order-first lg:order-first' : ''}`}>
                    {pairItem.type === 'item' ? (
                      <RenderCard item={pairItem.item} layoutType="vertical" />
                    ) : (
                      <PromoAd type={adTypeForThisDay} shape="square" />
                    )}
                  </div>
                </div>
              );
            }

            if (standards.length > 3) {
              const heroItem = standards.shift();
              rows.push(
                <div key={`row-hero-${heroItem.id}`} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-3 w-full">
                    <RenderCard item={heroItem} layoutType="hero" />
                  </div>
                </div>
              );
            }

            while (standards.length > 0) {
              if (standards.length >= 3) {
                const chunk = [standards.shift(), standards.shift(), standards.shift()];
                rows.push(
                  <div key={`row-std-3-${chunk[0].id}`} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {chunk.map(c => (
                      <div key={c.id} className="lg:col-span-1">
                        <RenderCard item={c} layoutType="vertical" />
                      </div>
                    ))}
                  </div>
                );
              } else if (standards.length === 2) {
                const chunk = [standards.shift(), standards.shift()];
                const isFlipped = layoutCounter % 2 !== 0;
                layoutCounter++;
                rows.push(
                  <div key={`row-std-2-${chunk[0].id}`} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className={`lg:col-span-1 ${isFlipped ? 'order-last lg:order-last' : ''}`}>
                      <RenderCard item={chunk[0]} layoutType="vertical" />
                    </div>
                    <div className={`lg:col-span-2 flex flex-col gap-6 ${isFlipped ? 'order-first lg:order-first' : ''}`}>
                      <div className="w-full">
                        <RenderCard item={chunk[1]} layoutType="horizontal" />
                      </div>
                      <div className="w-full flex flex-col">
                        <PromoAd type={adTypeForThisDay} shape="banner" />
                      </div>
                    </div>
                  </div>
                );
              } else if (standards.length === 1) {
                const item = standards.shift();
                const isFlipped = layoutCounter % 2 !== 0;
                layoutCounter++;
                rows.push(
                  <div key={`row-std-1-${item.id}`} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className={`lg:col-span-2 ${isFlipped ? 'order-last lg:order-last' : ''}`}>
                      <RenderCard item={item} layoutType="horizontal" />
                    </div>
                    <div className={`lg:col-span-1 flex flex-col ${isFlipped ? 'order-first lg:order-last' : ''}`}>
                      <PromoAd type={adTypeForThisDay} shape="square" />
                    </div>
                  </div>
                );
              }
            }

            return (
              <div key={group.date} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className={`h-px flex-1 ${theme.bg} opacity-50`}></div>
                  <span className={`font-black uppercase tracking-widest text-lg md:text-xl drop-shadow-md ${theme.text}`}>{displayDate}</span>
                  <div className={`h-px flex-[5] ${theme.bg} opacity-50`}></div>
                </div>

                <div className="flex flex-col gap-6">
                  {rows}
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div ref={observerTarget} className="w-full py-12 flex justify-center items-center">
              <PlaybookLoader className="scale-125" />
            </div>
          )}

          {groupedFeed.length === 0 && (
            <div className="py-16 text-center text-gray-500 font-bold uppercase tracking-widest border-2 border-dashed border-gray-800 rounded-2xl">
              No recent content found for this filter.
            </div>
          )}
        </div>
      </div>

      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-3 bg-gray-700 text-white rounded-full shadow-[0_0_15px_rgba(75,85,99,0.5)] hover:bg-gray-600 hover:scale-110 transition-all duration-300"
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}

    </main>
  );
}