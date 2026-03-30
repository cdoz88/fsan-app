"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Loader2, ChevronRight, ChevronUp, PlayCircle, ChevronLeft, ArrowRight, Zap, Play } from 'lucide-react';
import { themes } from '../utils/theme';

export default function VideosArchive({ videos, activeSport, setSelectedItem, loadMorePosts, isLoadingMore }) {
  const theme = themes[activeSport] || themes.All;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const shortsRef = useRef(null);
  const hideScrollbar = "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const PostMeta = ({ item }) => {
    const itemSport = item.sport || 'All';
    const itemTheme = themes[itemSport] || themes.All;
    return (
      <div className="flex items-center gap-2 mb-2 relative z-20">
        <span className={`w-1.5 h-1.5 rounded-full ${itemTheme.bg} shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.4)]`}></span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 drop-shadow-md">
          {item.date}
        </span>
      </div>
    );
  };

  const scrollShorts = (direction) => {
    if (shortsRef.current) shortsRef.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  const PromoAd = ({ shape = "square", title = "Join Sellout Crowds", subtitle = "Win Your League with Real-Time Advice!", cta = "Join Community", link = 'https://www.selloutcrowds.com/crowd/fsan' }) => (
    <a href={link} target="_blank" rel="noreferrer" className={`w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/40 via-[#111] to-black border border-red-900/50 rounded-2xl p-4 md:p-6 flex ${shape === 'banner' ? 'flex-col sm:flex-row items-center justify-between text-left' : 'flex-col items-center justify-center text-center'} relative overflow-hidden shadow-2xl cursor-pointer hover:border-red-600 transition-colors group min-h-[120px] no-underline`}>
       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20\\' xmlns=\\'http://www.w3.org/2000%2Fsvg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')", mixBlendMode: 'overlay' }}></div>
       <div className={`relative z-10 flex flex-col justify-center ${shape === 'banner' ? 'mb-0' : 'mb-2'}`}>
         <h2 className="text-xl md:text-2xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform origin-center line-clamp-1">{title}</h2>
         <p className="text-gray-300 font-bold text-[10px] tracking-wide relative z-10 line-clamp-1 md:line-clamp-2">{subtitle}</p>
       </div>
       <div className={`bg-red-600 text-white px-4 py-2 lg:px-5 lg:py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg relative z-10 flex items-center justify-center gap-2 shrink-0 whitespace-nowrap ${shape === 'banner' ? 'mt-3 sm:mt-0' : 'mt-2 sm:mt-0'}`}>
          {cta} <ChevronRight size={14} />
       </div>
    </a>
  );

  const WideVideoCard = ({ item }) => {
    const cardTheme = themes[item.sport] || themes.All;
    return (
      <div onClick={() => setSelectedItem(item)} className={`group relative w-full aspect-video cursor-pointer bg-[#111] border ${cardTheme.border} rounded-2xl overflow-hidden shadow-2xl ${cardTheme.hoverBorder} transition-all`}>
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" /> : <div className="absolute inset-0 bg-gray-900" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <PlayCircle size={64} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-20 drop-shadow-lg" />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <PostMeta item={item} />
          <h3 className={`font-black text-xl lg:text-3xl text-white leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-xl`} dangerouslySetInnerHTML={{ __html: item.title }} />
        </div>
      </div>
    );
  };

  const VideoListCard = ({ item }) => {
    const cardTheme = themes[item.sport] || themes.All;
    return (
      <div onClick={() => setSelectedItem(item)} className={`group relative w-full flex flex-row cursor-pointer bg-[#1e1e1e] border ${cardTheme.border} border-opacity-40 rounded-2xl overflow-hidden shadow-lg ${cardTheme.hoverBorder} transition-all items-stretch h-full`}>
        <div className="w-2/5 shrink-0 relative bg-gray-900 overflow-hidden aspect-video">
           {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />}
           <PlayCircle size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 group-hover:text-white group-hover:scale-110 transition-all z-20 drop-shadow-lg" />
        </div>
        <div className="flex-1 p-3 lg:p-4 relative z-20 flex flex-col justify-center">
          <PostMeta item={item} />
          <h4 className={`font-black text-xs lg:text-sm text-gray-200 leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
        </div>
      </div>
    );
  };

  const GridVideoCard = ({ item }) => {
    const cardTheme = themes[item.sport] || themes.All;
    return (
      <div onClick={() => setSelectedItem(item)} className={`group relative w-full aspect-video cursor-pointer bg-[#111] border ${cardTheme.border} border-opacity-40 rounded-2xl overflow-hidden shadow-xl ${cardTheme.hoverBorder} transition-all`}>
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <PlayCircle size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-20 drop-shadow-lg" />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <PostMeta item={item} />
          <h3 className={`font-bold text-sm lg:text-base text-white leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
        </div>
      </div>
    );
  };

  const ShortCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className={`group h-full w-full min-h-[300px] cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-700'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-500'} transition-all flex flex-col relative`}>
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 border border-white/10"><Play size={24} className="text-white ml-1" fill="currentColor"/></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className={`font-black text-sm text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-3 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </div>
  );

  // DATA FILTERING: Standard long-form videos vs Shorts
  const standardVideos = videos.filter(v => v.type === 'video');
  const shorts = videos.filter(v => v.type === 'short');

  // GRID MAPPING
  const heroVideo = standardVideos.length > 0 ? standardVideos[0] : null;
  const sideVideos = standardVideos.length > 1 ? standardVideos.slice(1, 6) : [];
  const rowOfTwo = standardVideos.length > 6 ? standardVideos.slice(6, 8) : [];
  const gridVideos = standardVideos.length > 8 ? standardVideos.slice(8, 14) : [];
  const remainingVideos = standardVideos.length > 14 ? standardVideos.slice(14) : [];

  return (
    <div className="flex flex-col w-full pt-6 pb-16 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
        <div>
          <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Videos</h1>
          <p className="text-gray-400 mt-2 text-sm">The latest film room breakdowns and highlights.</p>
        </div>
      </div>

      {standardVideos.length === 0 && shorts.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest">No content found.</div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* SECTION 1: HERO + 5 SIDE VIDEOS + BANNER AD */}
          {(heroVideo || sideVideos.length > 0) && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              <div className="xl:col-span-8 flex flex-col gap-6">
                {heroVideo && <WideVideoCard item={heroVideo} />}
                <div className="w-full">
                  <PromoAd shape="banner" title="Rookie Draft Guide" subtitle="Get the edge with our breakdown" cta="Dominate Now" />
                </div>
              </div>
              <div className="xl:col-span-4 grid grid-cols-1 gap-4">
                {sideVideos.map(v => <VideoListCard key={v.id} item={v} />)}
              </div>
            </div>
          )}

          {/* SECTION 2: 2 VIDEOS 50/50 */}
          {rowOfTwo.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rowOfTwo.map(v => <WideVideoCard key={v.id} item={v} />)}
            </div>
          )}

          {/* SECTION 3: 3x3 GRID WITH ADS IN 3RD COLUMN */}
          {gridVideos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {gridVideos.map(v => <GridVideoCard key={v.id} item={v} />)}
              </div>
              <div className="xl:col-span-1 flex flex-col gap-6">
                 <PromoAd shape="square" title="Fantasy Apparel" subtitle="Shop the collection" cta="Shop Now" />
                 <PromoAd shape="square" title="Real Time Advice" subtitle="Join Sellout Crowds" cta="Join Now" />
              </div>
            </div>
          )}

          {/* SECTION 4: SHORTS CAROUSEL (EXCLUSIVELY FOR SHORTS) */}
          {shorts.length > 0 && (
            <section className="relative py-8 border-y border-gray-800/50 my-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white"><Zap className="text-yellow-500" /> The Highlight Reel</h3>
                <div className="hidden md:flex items-center gap-2">
                   <button onClick={() => scrollShorts('left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                   <button onClick={() => scrollShorts('right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div ref={shortsRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
                {shorts.slice(0, 10).map(short => (
                  <div key={short.id} className="relative w-36 md:w-44 flex-shrink-0 snap-start">
                    <ShortCard item={short} />
                  </div>
                ))}
                <div className="relative w-36 md:w-44 flex-shrink-0 snap-start aspect-[9/16] rounded-2xl overflow-hidden bg-[#111] border border-gray-800 hover:border-gray-500 transition-colors flex flex-col items-center justify-center group cursor-pointer shadow-lg text-gray-400 hover:text-white">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><ArrowRight size={24} /></div>
                  <span className="font-black uppercase tracking-widest text-sm text-center">See All<br/>Shorts</span>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 5: REMAINING GRID CONTENT (NO SHORTS) */}
          {remainingVideos.length > 0 && (
            <div className="flex flex-col gap-8">
              {Array.from({ length: Math.ceil(remainingVideos.length / 6) }).map((_, i) => (
                <React.Fragment key={i}>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {remainingVideos.slice(i * 6, (i * 6) + 6).map(v => (
                      <GridVideoCard key={v.id} item={v} />
                    ))}
                  </div>
                  {remainingVideos.length > (i * 6) + 6 && (
                    <PromoAd shape="banner" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}

      {standardVideos.length > 0 && (
        <button 
          onClick={loadMorePosts}
          disabled={isLoadingMore}
          className={`w-full py-4 mt-8 border border-gray-700 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] flex items-center justify-center gap-3 ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : `${theme.hoverText} ${theme.hoverBorder}`}`}
        >
          {isLoadingMore ? <><Loader2 size={18} className="animate-spin" /> Fetching More Videos...</> : 'Load More Videos'}
        </button>
      )}

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-50 p-3 bg-gray-700 text-white rounded-full shadow-2xl hover:bg-gray-600 hover:scale-110 transition-all duration-300">
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}