"use client";
import React, { useRef } from 'react';
import Link from 'next/link';
import { PlayCircle, FileText, Video, Zap, Play, ChevronLeft, ChevronRight, Headphones } from 'lucide-react';
import { themes } from '../utils/theme';

// SEO Helper: Generates the true path for Googlebot
const getItemUrl = (item) => {
  const itemView = item.type === 'article' ? 'articles' : item.type === 'podcast' ? 'podcasts' : 'videos';
  const sportPrefix = (!item.sport || item.sport === 'All') ? '' : `/${item.sport.toLowerCase()}`;
  return `${sportPrefix}/${itemView}/${item.slug}`;
};

export default function SearchResults({ results, activeSport, setSelectedItem, searchQuery }) {
  // Refs for carousel scrolling
  const articlesRef = useRef(null);
  const videosRef = useRef(null);
  const shortsRef = useRef(null);
  const podcastsRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) ref.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  const hideScrollbar = "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

  // Dynamic Assets based on activeSport
  const bgImages = {
    All: 'https://admin.fsan.com/wp-content/uploads/2023/11/FSAN-Icon.webp',
    Football: 'https://admin.fsan.com/wp-content/uploads/2023/11/FFAN-Icon.webp',
    Basketball: 'https://admin.fsan.com/wp-content/uploads/2023/11/FBBAN-Icon.webp',
    Baseball: 'https://admin.fsan.com/wp-content/uploads/2023/11/FBAN-Icon.webp'
  };

  const sportColors = {
    All: { primary: '#374151', secondary: '#1f2937' },
    Football: { primary: '#e42d38', secondary: '#8a1a20' },
    Basketball: { primary: '#e85d22', secondary: '#a33308' },
    Baseball: { primary: '#1b75bb', secondary: '#1e3b8a' },
  };

  const bgImage = bgImages[activeSport] || bgImages.All;
  const primaryColor = sportColors[activeSport]?.primary || sportColors.All.primary;
  const secondaryColor = sportColors[activeSport]?.secondary || sportColors.All.secondary;

  // Filter content
  const articles = results.filter(item => item.type === 'article');
  const videos = results.filter(item => item.type === 'video');
  const shorts = results.filter(item => item.type === 'short');
  const podcasts = results.filter(item => item.type === 'podcast');

  // Standard Article Card
  const renderArticleCard = (item) => (
    <Link 
      href={getItemUrl(item)}
      onClick={(e) => { e.preventDefault(); setSelectedItem(item); }} 
      className="group h-full w-full cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-colors shadow-xl flex flex-col relative no-underline block"
    >
      <div className="w-full aspect-video bg-gray-900 relative overflow-hidden shrink-0">
        {item.imageUrl && <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{item.date}</span>
        <h3 className="font-black text-base text-gray-200 group-hover:text-white transition-colors leading-tight line-clamp-3 mb-2" dangerouslySetInnerHTML={{ __html: item.title }} />
        <p className="text-xs text-gray-400 line-clamp-2 mt-auto" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
      </div>
    </Link>
  );

  // Cinematic 16:9 Video Card
  const renderVideoCard = (item) => {
    const cardTheme = themes[item.sport] || themes.All;
    return (
      <Link 
        href={getItemUrl(item)}
        onClick={(e) => { e.preventDefault(); setSelectedItem(item); }} 
        className={`group w-full h-full aspect-video cursor-pointer bg-[#111] border ${cardTheme.border} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${cardTheme.hoverBorder} transition-all flex flex-col relative no-underline block`}
      >
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <PlayCircle size={48} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-lg" />
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full ${cardTheme.bg}`}></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{item.date}</span>
          </div>
          <h3 className={`font-black text-lg lg:text-xl text-white leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
        </div>
      </Link>
    );
  };

  // Short Card
  const renderShortCard = (item) => (
    <Link 
      href={getItemUrl(item)}
      onClick={(e) => { e.preventDefault(); setSelectedItem(item); }} 
      className={`group h-full w-full min-h-[300px] md:min-h-[400px] cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-700'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-500'} transition-all flex flex-col relative no-underline block`}
    >
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 md:p-4 border border-white/10"><Play size={24} className="text-white ml-1" fill="currentColor"/></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20">
        <h3 className={`font-black text-sm md:text-lg text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-3 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </Link>
  );

  // Podcast Booth Card
  const renderPodcastCard = (item) => {
    const itemTheme = themes[item.sport] || themes.All;
    return (
      <Link 
        href={getItemUrl(item)}
        onClick={(e) => { e.preventDefault(); setSelectedItem(item); }} 
        className={`flex items-stretch bg-[#1e1e1e] border ${itemTheme.border} border-opacity-40 rounded-2xl overflow-hidden ${itemTheme.hoverBorder} hover:-translate-y-0.5 transition-all cursor-pointer group shadow-lg h-[120px] no-underline block`}
      >
        <div className="w-28 shrink-0 relative bg-gray-900 flex items-center justify-center overflow-hidden border-r border-gray-800/50">
          {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> : <div className="absolute inset-0 bg-gray-800" />}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
          <PlayCircle size={36} className="text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-md" />
        </div>
        <div className="flex-1 p-4 flex flex-col justify-center overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
             <span className={`w-1.5 h-1.5 rounded-full ${itemTheme.bg}`}></span>
             <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{item.date}</span>
          </div>
          <h4 className={`font-bold text-sm leading-snug mb-2 text-gray-200 group-hover:${itemTheme.text} transition-colors line-clamp-2`} dangerouslySetInnerHTML={{ __html: item.title }} />
          <div className="flex items-center gap-[3px] mt-auto h-4 opacity-70 group-hover:opacity-100 transition-opacity">
            {[4, 8, 12, 8, 16, 10, 14, 6, 10, 12, 8, 6, 14, 8, 4, 8, 12].map((h, i) => (
              <div key={i} className={`w-[2px] sm:w-[3px] shrink-0 rounded-full bg-gray-600 group-hover:${itemTheme.bg} transition-colors`} style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col w-full pb-16 animate-in fade-in duration-300">
      
      {/* THE HERO HEADER */}
      <div className="relative w-full h-[260px] flex items-end overflow-hidden rounded-2xl mb-6 mt-6">
        <div 
          className="absolute inset-0 opacity-80 z-0" 
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        />

        <img 
          src={bgImage} 
          alt={`${activeSport} Background`} 
          className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" 
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-end md:justify-start gap-2 md:gap-10 h-full px-6 md:px-0 pb-8 md:pl-10">
          <div className="flex flex-col gap-1 md:gap-2 w-full z-20 justify-end md:h-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase">
              Search Results
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-bold tracking-wide mt-2">
              Showing results for <span className="text-white">"{searchQuery}"</span>
            </p>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
         <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-2xl mt-8">
            No coverage found.
            <br/><br/>
            <span className="text-xs">Tip: To find a specific player, search for their exact name (e.g. "Jalen Hurts")</span>
         </div>
      ) : (
        <div className="flex flex-col gap-10 mt-8">
          <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="grey-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop stopColor="#d1d5db" offset="0%" /><stop stopColor="#6b7280" offset="100%" /></linearGradient>
            </defs>
          </svg>

          {/* Articles Carousel */}
          {articles.length > 0 && (
            <section className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><FileText stroke="url(#grey-grad)" /> The Press Box</h3>
                <div className="hidden md:flex items-center gap-2">
                   <button onClick={() => scroll(articlesRef, 'left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                   <button onClick={() => scroll(articlesRef, 'right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div ref={articlesRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
                {articles.map(item => (
                  <div key={item.id} className="relative w-72 sm:w-80 md:w-96 flex-shrink-0 snap-start">
                    {renderArticleCard(item)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Videos Carousel */}
          {videos.length > 0 && (
            <section className={`relative ${articles.length > 0 ? 'pt-6 border-t border-gray-800/50' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><Video stroke="url(#grey-grad)" /> The Film Room</h3>
                <div className="hidden md:flex items-center gap-2">
                   <button onClick={() => scroll(videosRef, 'left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                   <button onClick={() => scroll(videosRef, 'right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div ref={videosRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
                {videos.map(item => (
                  <div key={item.id} className="relative w-72 sm:w-80 md:w-96 flex-shrink-0 snap-start">
                    {renderVideoCard(item)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Shorts Carousel */}
          {shorts.length > 0 && (
            <section className={`relative ${articles.length > 0 || videos.length > 0 ? 'pt-6 border-t border-gray-800/50' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><Zap stroke="url(#grey-grad)" /> The Highlight Reel</h3>
                <div className="hidden md:flex items-center gap-2">
                   <button onClick={() => scroll(shortsRef, 'left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                   <button onClick={() => scroll(shortsRef, 'right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div ref={shortsRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
                {shorts.map(short => (
                  <div key={short.id} className="relative w-36 md:w-44 flex-shrink-0 snap-start">
                    {renderShortCard(short)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Podcasts Carousel */}
          {podcasts.length > 0 && (
            <section className={`relative ${articles.length > 0 || videos.length > 0 || shorts.length > 0 ? 'pt-6 border-t border-gray-800/50' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><Headphones stroke="url(#grey-grad)" /> The Booth</h3>
                <div className="hidden md:flex items-center gap-2">
                   <button onClick={() => scroll(podcastsRef, 'left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                   <button onClick={() => scroll(podcastsRef, 'right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div ref={podcastsRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
                {podcasts.map(item => (
                  <div key={item.id} className="relative w-72 sm:w-80 md:w-96 flex-shrink-0 snap-start">
                    {renderPodcastCard(item)}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}