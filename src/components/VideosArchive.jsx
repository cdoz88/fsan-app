"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Loader2, ChevronRight, ChevronUp, PlayCircle, ChevronLeft, ArrowRight, Zap, Play } from 'lucide-react';
import { themes } from '../utils/theme';

const hideScrollbar = "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

// SEO Helper: Generates the true path for Googlebot
const getItemUrl = (item) => {
  const itemView = item.type === 'article' ? 'articles' : item.type === 'podcast' ? 'podcasts' : 'videos';
  const sportPrefix = (!item.sport || item.sport === 'All') ? '' : `/${item.sport.toLowerCase()}`;
  return `${sportPrefix}/${itemView}/${item.slug}`;
};

// --- GLOBAL SUB-COMPONENTS ---

const PostMeta = ({ item, activeSport }) => {
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

// THE TRUE UNIVERSAL AD COMPONENT
const DynamicAd = ({ ad, variant = "inline" }) => {
  if (!ad) return null;

  let patternOverlay = '';
  if (ad.pattern === 'dots') patternOverlay = "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20\\' xmlns=\\'http://www.w3.org/2000%2Fsvg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')";
  else if (ad.pattern === 'lines') patternOverlay = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)";
  else if (ad.pattern === 'grid') patternOverlay = "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)";
  else if (ad.pattern === 'crosshatch') patternOverlay = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px)";

  const bgStyles = { borderColor: ad.borderColor || ad.bgColor };
  if (ad.bgGradientType === 'solid') bgStyles.backgroundColor = ad.bgColor;
  else if (ad.bgGradientType === 'linear') bgStyles.backgroundImage = `linear-gradient(to right, ${ad.bgColor}, ${ad.bgColor2 || '#000000'})`;
  else if (ad.bgGradientType === 'radial') bgStyles.backgroundImage = `radial-gradient(ellipse at top, ${ad.bgColor}80, ${ad.bgColor2 || '#111'}, #000000)`;

  const isHeader = variant === 'header';
  const isSidebar = variant === 'sidebar'; 

  const renderButton = (extraClass) => (
    <div className={`px-3 py-2 ${isHeader ? '@md:px-4 @md:py-2.5' : '@2xl:px-5 @2xl:py-2.5'} rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1 ${isHeader ? '@md:gap-1.5' : '@2xl:gap-2'} shrink-0 whitespace-nowrap ${extraClass}`} style={{ backgroundColor: ad.btnColor, color: ad.btnTextColor || '#ffffff' }}>
      {ad.buttonText} <ChevronRight size={14} className={isHeader ? 'hidden @sm:block' : 'hidden @md:block'} />
    </div>
  );

  let wrapperClasses = `@container w-full h-full rounded-2xl flex relative overflow-hidden shadow-2xl group transition-all border-2 no-underline block hover:scale-[1.01] `;
  
  if (isHeader) {
    wrapperClasses += `p-3 @md:p-4 min-h-[80px] flex-row items-center justify-between gap-3 @2xl:gap-6`;
  } else if (isSidebar && ad.fgImage) {
    wrapperClasses += `p-4 @2xl:p-6 min-h-[200px] flex-col items-center justify-center text-center gap-4`;
  } else {
    wrapperClasses += `p-4 @2xl:p-6 min-h-[120px] gap-3 @2xl:gap-6 ${ad.fgImage ? 'flex-row items-center justify-between' : 'flex-col @4xl:flex-row items-center justify-center @4xl:justify-between'}`;
  }

  return (
    <a href={ad.buttonLink || '#'} target="_blank" rel="noreferrer" className={wrapperClasses} style={bgStyles}>
       {ad.bgImage && <img src={ad.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" alt="" />}
       {ad.pattern !== 'none' && <div className="absolute inset-0" style={{ backgroundImage: patternOverlay, mixBlendMode: 'overlay', backgroundSize: ad.pattern === 'grid' ? '20px 20px' : 'auto' }}></div>}
       
       {isHeader ? (
         <>
           <div className={`relative z-10 flex flex-col justify-center shrink min-w-0 pr-2 items-center text-center @xs:items-start @xs:text-left ${!ad.fgImage ? 'flex-1' : ''}`}>
             <h2 className={`text-base @xs:text-lg @md:text-xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform line-clamp-1 leading-tight origin-center @xs:origin-left`}>{ad.headline}</h2>
             <p className={`text-gray-300 font-bold text-[9px] @md:text-[10px] uppercase tracking-widest relative z-10 line-clamp-1 mt-0.5`}>{ad.subtext}</p>
             {renderButton("mt-2 flex @sm:hidden w-max")}
           </div>
           {ad.fgImage && (
             <div className="relative z-10 flex justify-center items-center shrink-0 mx-auto px-2">
               <img src={ad.fgImage} className="max-h-12 w-auto max-w-[80px] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" alt="" />
             </div>
           )}
           <div className={`relative z-10 hidden @sm:flex justify-end items-center shrink-0 min-w-0`}>
             {renderButton("")}
           </div>
         </>
       ) : isSidebar && ad.fgImage ? (
         <>
           <div className="relative z-10 flex flex-col justify-center shrink min-w-0 items-center text-center flex-1">
             <h2 className="text-lg @md:text-2xl @2xl:text-3xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform line-clamp-2 leading-tight origin-center">{ad.headline}</h2>
             <p className="text-gray-300 font-bold text-[10px] @md:text-xs uppercase tracking-widest relative z-10 line-clamp-2 mt-1">{ad.subtext}</p>
           </div>
           <div className="relative z-10 flex items-center justify-center shrink-0">
             <img src={ad.fgImage} className="max-h-24 @2xl:max-h-32 w-auto max-w-[100px] @2xl:max-w-[160px] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" alt="" />
           </div>
           {renderButton("")}
         </>
       ) : (
         <>
           <div className={`relative z-10 flex flex-col justify-center shrink min-w-0 pr-2 items-center text-center @4xl:items-start @4xl:text-left flex-1`}>
             <h2 className={`text-lg @md:text-2xl @2xl:text-3xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform line-clamp-2 leading-tight origin-center @4xl:origin-left`}>{ad.headline}</h2>
             <p className="text-gray-300 font-bold text-[10px] @md:text-xs uppercase tracking-widest relative z-10 line-clamp-2 mt-1">{ad.subtext}</p>
             {renderButton("mt-4 flex @4xl:hidden w-max")}
           </div>
           
           {ad.fgImage && (
              <div className="relative z-10 flex justify-end @4xl:justify-center items-center shrink-0 pl-2 @4xl:pl-0 @4xl:flex-1 mx-auto">
                 <img src={ad.fgImage} className="max-h-24 @2xl:max-h-32 w-auto max-w-[90px] @2xl:max-w-[160px] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" alt="" />
              </div>
           )}
           
           <div className={`relative z-10 hidden @4xl:flex justify-end items-center shrink-0 @5xl:flex-1 min-w-0`}>
              {renderButton("")}
           </div>
         </>
       )}
    </a>
  );
};

const WideVideoCard = ({ item, setSelectedItem, activeSport }) => {
  const cardTheme = themes[item.sport] || themes.All;
  return (
    <Link href={getItemUrl(item)} onClick={(e) => { e.preventDefault(); setSelectedItem(item); }} className={`group relative w-full aspect-video cursor-pointer bg-[#111] border ${cardTheme.border} rounded-2xl overflow-hidden shadow-2xl ${cardTheme.hoverBorder} transition-all no-underline block`}>
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" /> : <div className="absolute inset-0 bg-gray-900" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
      <PlayCircle size={64} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-20 drop-shadow-lg" />
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <PostMeta item={item} activeSport={activeSport} />
        <h3 className={`font-black text-xl lg:text-3xl text-white leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-xl`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </Link>
  );
};

const VideoListCard = ({ item, setSelectedItem, activeSport }) => {
  const cardTheme = themes[item.sport] || themes.All;
  return (
    <Link href={getItemUrl(item)} onClick={(e) => { e.preventDefault(); setSelectedItem(item); }} className={`group relative w-full flex flex-row cursor-pointer bg-[#1e1e1e] border ${cardTheme.border} border-opacity-40 rounded-2xl overflow-hidden shadow-lg ${cardTheme.hoverBorder} transition-all items-stretch h-full no-underline block`}>
      <div className="w-2/5 shrink-0 relative bg-gray-900 overflow-hidden aspect-video">
         {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />}
         <PlayCircle size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 group-hover:text-white group-hover:scale-110 transition-all z-20 drop-shadow-lg" />
      </div>
      <div className="flex-1 p-3 lg:p-4 relative z-20 flex flex-col justify-center">
        <PostMeta item={item} activeSport={activeSport} />
        <h4 className={`font-black text-xs lg:text-sm text-gray-200 leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </Link>
  );
};

const GridVideoCard = ({ item, setSelectedItem, activeSport }) => {
  const cardTheme = themes[item.sport] || themes.All;
  return (
    <Link href={getItemUrl(item)} onClick={(e) => { e.preventDefault(); setSelectedItem(item); }} className={`group relative w-full aspect-video cursor-pointer bg-[#111] border ${cardTheme.border} border-opacity-40 rounded-2xl overflow-hidden shadow-xl ${cardTheme.hoverBorder} transition-all no-underline block`}>
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
      <PlayCircle size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-20 drop-shadow-lg" />
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <PostMeta item={item} activeSport={activeSport} />
        <h3 className={`font-bold text-sm lg:text-base text-white leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </Link>
  );
};

const ShortCard = ({ item, setSelectedItem, activeSport }) => (
  <Link href={getItemUrl(item)} onClick={(e) => { e.preventDefault(); setSelectedItem(item); }} className={`group h-full w-full min-h-[300px] cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-700'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-500'} transition-all flex flex-col relative no-underline block`}>
    {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 md:p-4 border border-white/10"><Play size={24} className="text-white ml-1" fill="currentColor"/></div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
      <h3 className={`font-black text-sm text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-3 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
    </div>
  </Link>
);

// --- MAIN ARCHIVE COMPONENT ---

export default function VideosArchive({ videos, activeSport, setSelectedItem, loadMorePosts, isLoadingMore }) {
  const theme = themes[activeSport] || themes.All;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [globalAds, setGlobalAds] = useState([]);
  const shortsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Global Ads from WP
  useEffect(() => {
    const fetchAds = async () => {
      const query = `
        query GetGlobalAds {
          globalAds {
            id headline subtext buttonText buttonLink bgColor bgColor2 bgGradientType btnColor btnTextColor borderColor pattern bgImage fgImage sport pages placements startDate endDate
          }
        }
      `;
      try {
        const res = await fetch('https://admin.fsan.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const json = await res.json();
        if (json?.data?.globalAds) {
          setGlobalAds(json.data.globalAds);
        }
      } catch (e) {
        console.error("Failed to fetch ads", e);
      }
    };
    fetchAds();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const pageAds = globalAds.filter(ad => {
    if (!ad.pages || !ad.pages.includes('videos')) return false;
    if (!ad.sport || (!ad.sport.includes('All') && !ad.sport.includes(activeSport))) return false;
    if (ad.startDate) {
      const [year, month, day] = ad.startDate.split('-');
      const start = new Date(year, month - 1, day);
      if (today < start) return false;
    }
    if (ad.endDate) {
      const [year, month, day] = ad.endDate.split('-');
      const end = new Date(year, month - 1, day);
      if (today > end) return false;
    }
    return true; 
  });

  // Categorize by Placement
  const headerAds = pageAds.filter(ad => ad.placements?.includes('header'));
  const inlineAds = pageAds.filter(ad => ad.placements?.includes('inline'));

  // DATA FILTERING
  const standardVideos = videos.filter(v => v.type === 'video');
  const shorts = videos.filter(v => v.type === 'short');

  // GRID MAPPING
  const heroVideo = standardVideos.length > 0 ? standardVideos[0] : null;
  const sideVideos = standardVideos.length > 1 ? standardVideos.slice(1, 6) : [];
  const rowOfTwo = standardVideos.length > 6 ? standardVideos.slice(6, 8) : [];
  const gridVideos = standardVideos.length > 8 ? standardVideos.slice(8, 14) : [];
  const remainingVideos = standardVideos.length > 14 ? standardVideos.slice(14) : [];

  const scrollShorts = (direction) => {
    if (shortsRef.current) shortsRef.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col w-full pt-6 pb-16 animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-4 border-b border-gray-800">
        
        <div className="shrink-0 mr-4">
          <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg whitespace-nowrap`}>{activeSport === 'All' ? 'Network' : activeSport} Videos</h1>
          <p className="text-gray-400 mt-2 text-sm whitespace-nowrap">The latest film room breakdowns and highlights.</p>
        </div>

        {/* DYNAMIC HEADER AD SLOT */}
        {headerAds.length > 0 && (
          <div className="hidden lg:block flex-1 max-w-[675px] min-w-[250px] shrink overflow-hidden">
            <DynamicAd ad={headerAds[0]} variant="header" />
          </div>
        )}
      </div>

      {standardVideos.length === 0 && shorts.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest">No content found.</div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* SECTION 1: HERO + 5 SIDE VIDEOS + BANNER AD */}
          {(heroVideo || sideVideos.length > 0) && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              <div className="xl:col-span-8 flex flex-col gap-6">
                {heroVideo && <WideVideoCard item={heroVideo} setSelectedItem={setSelectedItem} activeSport={activeSport} />}
                
                {/* DYNAMIC INLINE AD SLOT 1 */}
                {inlineAds.length > 0 && (
                  <div className="w-full">
                    <DynamicAd ad={inlineAds[0]} variant="inline" />
                  </div>
                )}
              </div>
              <div className="xl:col-span-4 grid grid-cols-1 gap-4">
                {sideVideos.map(v => <VideoListCard key={v.id} item={v} setSelectedItem={setSelectedItem} activeSport={activeSport} />)}
              </div>
            </div>
          )}

          {/* SECTION 2: 2 VIDEOS 50/50 */}
          {rowOfTwo.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rowOfTwo.map(v => <WideVideoCard key={v.id} item={v} setSelectedItem={setSelectedItem} activeSport={activeSport} />)}
            </div>
          )}

          {/* SECTION 3: 3x3 GRID WITH ADS IN 3RD COLUMN */}
          {gridVideos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {gridVideos.map(v => <GridVideoCard key={v.id} item={v} setSelectedItem={setSelectedItem} activeSport={activeSport} />)}
              </div>
              <div className="xl:col-span-1 flex flex-col gap-6">
                 {/* DYNAMIC INLINE AD SLOTS 2 & 3 - Set to sidebar variant */}
                 {inlineAds.length > 1 && (
                   <div className="flex-1 w-full min-h-[200px]">
                     <DynamicAd ad={inlineAds[1]} variant="sidebar" />
                   </div>
                 )}
                 {inlineAds.length > 2 && (
                   <div className="flex-1 w-full min-h-[200px]">
                     <DynamicAd ad={inlineAds[2]} variant="sidebar" />
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* SECTION 4: SHORTS CAROUSEL */}
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
                    <ShortCard item={short} setSelectedItem={setSelectedItem} activeSport={activeSport} />
                  </div>
                ))}
                <Link href={`${activeSport === 'All' ? '' : `/${activeSport.toLowerCase()}`}/videos`} className="relative w-36 md:w-44 flex-shrink-0 snap-start aspect-[9/16] rounded-2xl overflow-hidden bg-[#111] border border-gray-800 hover:border-gray-500 transition-colors flex flex-col items-center justify-center group shadow-lg text-gray-400 hover:text-white no-underline block">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><ArrowRight size={24} /></div>
                  <span className="font-black uppercase tracking-widest text-sm text-center">See All<br/>Shorts</span>
                </Link>
              </div>
            </section>
          )}

          {/* SECTION 5: REMAINING GRID CONTENT WITH CYCLING ADS */}
          {remainingVideos.length > 0 && (
            <div className="flex flex-col gap-8">
              {Array.from({ length: Math.ceil(remainingVideos.length / 6) }).map((_, i) => {
                const cycleAdIndex = inlineAds.length > 0 ? (i % inlineAds.length) : -1;
                return (
                  <React.Fragment key={i}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {remainingVideos.slice(i * 6, (i * 6) + 6).map(v => (
                        <GridVideoCard key={v.id} item={v} setSelectedItem={setSelectedItem} activeSport={activeSport} />
                      ))}
                    </div>
                    {cycleAdIndex !== -1 && (
                      <div className="py-4">
                        <DynamicAd ad={inlineAds[cycleAdIndex]} variant="inline" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
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