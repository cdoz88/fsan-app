"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PlayCircle, FileText, Video, Mic, Play, Zap, Flame, ChevronLeft, ChevronRight, ChevronUp, Headphones, ArrowRight } from 'lucide-react';
import { themes } from '../utils/theme';

export default function Home({ wpPosts, masterPodcasts, activeSport, setSelectedItem, isLoading }) {
  const theme = themes[activeSport] || themes.All;
  const shortsRef = useRef(null);
  const lineupRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [globalAds, setGlobalAds] = useState([]);
  
  const hideScrollbar = "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      const query = `
        query GetGlobalAds {
          globalAds {
            id headline subtext buttonText buttonLink bgColor bgColor2 bgGradientType btnColor btnTextColor borderColor pattern bgImage fgImage sport pages startDate endDate
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
        console.error("Failed to fetch dynamic ads", e);
      }
    };
    fetchAds();
  }, []);

  const PostMeta = ({ item }) => (
    <div className="flex items-center gap-2 mb-3 z-20 relative">
      {activeSport === 'All' && (
        <span className={`w-2 h-2 rounded-full ${themes[item.sport]?.bg || 'bg-gray-500'} shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]`}></span>
      )}
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 drop-shadow-md">{item.date}</span>
    </div>
  );

  const scrollShorts = (direction) => {
    if (shortsRef.current) shortsRef.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  const scrollLineup = (direction) => {
    if (lineupRef.current) lineupRef.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  const shieldMaskStyle = {
    WebkitMaskImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20viewBox%3D%220%200%20706.29%20800%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M404.07%2C303.86c.61%2C0%2C1.22-.04%2C1.83-.04%2C1%2C0%2C1.98.06%2C2.98.07-1.26-.02-2.52-.03-3.78-.03-.34%2C0-.68%2C0-1.02%2C0%22%2F%3E%3Cpath%20d%3D%22M624.47%2C522.59c-59.75%2C113.25-148.42%2C205.88-256.42%2C267.9l-10.35%2C5.95-6.21%2C3.57-6.31-3.38-10.51-5.63c-112.29-60.12-203.01-153.79-262.36-270.88C13%2C403.11-10.51%2C271.58%2C4.32%2C139.75l1.34-11.89.8-7.14%2C5.92-3.54%2C9.87-5.91C147.41%2C36.4%2C258.58%2C0%2C362.11%2C0c109.19%2C0%2C213.33%2C38.89%2C327.73%2C122.4l9.02%2C6.58%2C5.41%2C3.95.37%2C6.93.61%2C11.56c6.89%2C129.58-21.04%2C257.92-80.79%2C371.16Z%22%2F%3E%3C%2Fsvg%3E")',
    maskImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20viewBox%3D%220%200%20706.29%20800%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M404.07%2C303.86c.61%2C0%2C1.22-.04%2C1.83-.04%2C1%2C0%2C1.98.06%2C2.98.07-1.26-.02-2.52-.03-3.78-.03-.34%2C0-.68%2C0-1.02%2C0%22%2F%3E%3Cpath%20d%3D%22M624.47%2C522.59c-59.75%2C113.25-148.42%2C205.88-256.42%2C267.9l-10.35%2C5.95-6.21%2C3.57-6.31-3.38-10.51-5.63c-112.29-60.12-203.01-153.79-262.36-270.88C13%2C403.11-10.51%2C271.58%2C4.32%2C139.75l1.34-11.89.8-7.14%2C5.92-3.54%2C9.87-5.91C147.41%2C36.4%2C258.58%2C0%2C362.11%2C0c109.19%2C0%2C213.33%2C38.89%2C327.73%2C122.4l9.02%2C6.58%2C5.41%2C3.95.37%2C6.93.61%2C11.56c6.89%2C129.58-21.04%2C257.92-80.79%2C371.16Z%22%2F%3E%3C%2Fsvg%3E")',
    WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
    maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center'
  };

  const allPosts = [...wpPosts];
  const usedIds = new Set();
  
  const wireFeed = allPosts.filter(p => p.type !== 'podcast').slice(0, 10);

  const mainFeature = allPosts.find(p => p.type === 'video' || p.type === 'article');
  if (mainFeature) usedIds.add(mainFeature.id);

  const sideTopFeature = allPosts.find(p => (p.type === 'article' || p.type === 'video') && !usedIds.has(p.id));
  if (sideTopFeature) usedIds.add(sideTopFeature.id);

  const sideBottomFeature = allPosts.find(p => (p.type === 'article' || p.type === 'video') && !usedIds.has(p.id));
  if (sideBottomFeature) usedIds.add(sideBottomFeature.id);

  const pressBoxArticles = allPosts.filter(p => p.type === 'article' && !usedIds.has(p.id)).slice(0, 4);
  pressBoxArticles.forEach(p => usedIds.add(p.id));

  const boothPodcasts = allPosts.filter(p => p.type === 'podcast' && !p.isMasterShow && !usedIds.has(p.id)).slice(0, 4);
  boothPodcasts.forEach(p => usedIds.add(p.id));

  const filmRoomVideos = allPosts.filter(p => p.type === 'video' && !usedIds.has(p.id)).slice(0, 6);
  filmRoomVideos.forEach(p => usedIds.add(p.id));

  const highlightShorts = allPosts.filter(p => p.type === 'short' && !usedIds.has(p.id)).slice(0, 8);

  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const activeAds = globalAds.filter(ad => {
    if (!ad.pages || !ad.pages.includes('home')) return false;
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

  const DynamicAd = ({ ad }) => {
    if (!ad) return null;

    let patternOverlay = '';
    if (ad.pattern === 'dots') {
        patternOverlay = "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20\\' xmlns=\\'http://www.w3.org/2000%2Fsvg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')";
    } else if (ad.pattern === 'lines') {
        patternOverlay = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)";
    } else if (ad.pattern === 'grid') {
        patternOverlay = "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)";
    } else if (ad.pattern === 'crosshatch') {
        patternOverlay = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px)";
    }

    const bgStyles = {};
    if (ad.bgGradientType === 'solid') {
        bgStyles.backgroundColor = ad.bgColor;
    } else if (ad.bgGradientType === 'linear') {
        bgStyles.backgroundImage = `linear-gradient(to right, ${ad.bgColor}, ${ad.bgColor2 || '#000000'})`;
    } else if (ad.bgGradientType === 'radial') {
        bgStyles.backgroundImage = `radial-gradient(ellipse at top, ${ad.bgColor}80, ${ad.bgColor2 || '#111'}, #000000)`;
    }

    return (
      <a href={ad.buttonLink || '#'} target="_blank" rel="noreferrer" className="@container w-full h-full rounded-2xl p-4 @2xl:p-6 flex flex-row items-center justify-between text-left relative overflow-hidden shadow-2xl group min-h-[120px] transition-all border-2 gap-3 @2xl:gap-6 no-underline block hover:scale-[1.01]" style={{ ...bgStyles, borderColor: ad.borderColor || ad.bgColor }}>
         {ad.bgImage && <img src={ad.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" alt="Background" />}
         {ad.pattern !== 'none' && <div className="absolute inset-0" style={{ backgroundImage: patternOverlay, mixBlendMode: 'overlay', backgroundSize: ad.pattern === 'grid' ? '20px 20px' : 'auto' }}></div>}
         
         {/* 1. TEXT: No flex-1 ghost padding! It just shrinks naturally. */}
         <div className="relative z-10 flex flex-col justify-center shrink pr-2 text-center @4xl:text-left items-center @4xl:items-start min-w-0">
           <h2 className="text-lg @md:text-2xl @2xl:text-3xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform origin-center @4xl:origin-left line-clamp-2 leading-tight">
             {ad.headline}
           </h2>
           <p className="text-gray-300 font-bold text-[10px] @md:text-xs uppercase tracking-widest relative z-10 line-clamp-2 mt-1">
             {ad.subtext}
           </p>
         </div>

         {/* 2. IMAGE: Perfectly centered between the text and button thanks to justify-between */}
         {ad.fgImage && (
            <div className="relative z-10 hidden @sm:flex justify-center items-center shrink-0">
               <img src={ad.fgImage} className="max-h-16 @2xl:max-h-24 w-auto max-w-[80px] @2xl:max-w-[160px] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" alt="Foreground" />
            </div>
         )}

         {/* 3. BUTTON: Takes exactly the space it needs, destroying the ghost padding gap */}
         <div className="relative z-10 flex justify-end items-center shrink-0">
            <div className="px-3 py-2 @2xl:px-5 @2xl:py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1 @2xl:gap-2 shrink-0 whitespace-nowrap" style={{ backgroundColor: ad.btnColor, color: ad.btnTextColor || '#ffffff' }}>
               {ad.buttonText} <ChevronRight size={14} className="hidden @md:block" />
            </div>
         </div>
      </a>
    );
  };

  const VideoCard = ({ item, isHero }) => (
    <div onClick={() => setSelectedItem(item)} className={`group w-full h-full aspect-video cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-700'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-500'} transition-all flex flex-col relative`}>
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
      <PlayCircle size={isHero ? 64 : 48} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-lg" />
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <PostMeta item={item} />
        <h3 className={`font-black ${isHero ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'} text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-2 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </div>
  );

  const ShortCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className={`group h-full w-full min-h-[300px] md:min-h-[400px] cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-700'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-500'} transition-all flex flex-col relative`}>
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 md:p-4 border border-white/10"><Play size={24} className="text-white ml-1" fill="currentColor"/></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20">
        <h3 className={`font-black text-sm md:text-lg text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-3 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </div>
  );

  const VerticalCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className={`group h-full w-full cursor-pointer bg-[#1e1e1e] border ${themes[item.sport]?.border || 'border-gray-700'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-lg ${themes[item.sport]?.hoverBorder || 'hover:border-gray-500'} transition-all flex flex-col relative`}>
      <div className="w-full aspect-video relative flex items-center justify-center overflow-hidden shrink-0 bg-[#111]">
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#1e1e1e] via-[#1e1e1e]/80 to-transparent z-10" />
        {item.type === 'video' && <PlayCircle size={32} className="absolute text-white/80 z-20" />}
      </div>
      <div className="px-5 pb-5 flex flex-col flex-1 relative z-20 -mt-10 pt-2">
        <PostMeta item={item} />
        <h3 className={`font-black text-lg leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors mb-2 line-clamp-2 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
        <div className="text-sm text-gray-400 line-clamp-2 mt-auto drop-shadow-md" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
      </div>
    </div>
  );

  const PressBoxCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className={`bg-[#1e1e1e] border ${themes[item.sport]?.border || 'border-gray-700'} border-opacity-40 rounded-2xl flex flex-col md:flex-row overflow-hidden ${themes[item.sport]?.hoverBorder || 'hover:border-gray-500'} hover:-translate-y-0.5 transition-all cursor-pointer group shadow-lg min-h-[220px] items-stretch`}>
      <div className="w-full md:w-64 lg:w-80 aspect-video md:aspect-auto bg-gray-900 flex-shrink-0 relative overflow-hidden">
          {item.imageUrl && <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover object-left-bottom opacity-90 group-hover:scale-105 transition-transform duration-500"/>}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1e1e1e] to-transparent md:hidden z-10" />
          <div className="hidden md:block absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#1e1e1e] z-10" />
      </div>
      <div className="relative z-10 px-5 pb-5 md:p-6 md:pl-2 flex flex-col justify-center h-full flex-1 -mt-8 md:mt-0 bg-[#1e1e1e] md:bg-transparent">
        <PostMeta item={item} />
        <h4 className={`text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-2 text-gray-200 group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors drop-shadow-lg`} dangerouslySetInnerHTML={{ __html: item.title }} />
        <div className="text-sm text-gray-400 line-clamp-2 leading-relaxed drop-shadow" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
      </div>
    </div>
  );

  const BoothCard = ({ item }) => {
    const itemTheme = themes[item.sport] || themes.All;
    const [fetchedImage, setFetchedImage] = useState(null);
    
    let displayImage = item.imageUrl;
    if (!displayImage && masterPodcasts) {
       const genericSlugs = [
          'all', 'football', 'basketball', 'baseball', 'podcast', 'podcasts', 
          'pod-episode', 'football-pod-episode', 'basketball-pod-episode', 
          'baseball-pod-episode', 'football-podcast', 'podcast-basketball', 'podcast-baseball', 'uncategorized'
       ];
       
       const parentShow = masterPodcasts.find(m => {
          if (m.spreakerShowId && item.spreakerShowId && m.spreakerShowId === item.spreakerShowId) {
            return true;
          }
          if (m.category_slugs && item.category_slugs) {
             const mSpecific = m.category_slugs.filter(s => !genericSlugs.includes(s.toLowerCase()));
             return mSpecific.some(slug => item.category_slugs.includes(slug));
          }
          return false;
       });
       
       if (parentShow?.imageUrl) {
          displayImage = parentShow.imageUrl;
       }
    }

    useEffect(() => {
      if (!displayImage && item.spreakerId) {
        fetch(`https://api.spreaker.com/v2/episodes/${item.spreakerId}`)
          .then(res => res.json())
          .then(data => {
            if (data?.response?.episode?.image_original_url) {
              setFetchedImage(data.response.episode.image_original_url);
            }
          })
          .catch(e => console.error("Failed to fetch fallback Spreaker image", e));
      }
    }, [displayImage, item.spreakerId]);

    const finalImage = displayImage || fetchedImage;

    return (
      <div onClick={() => setSelectedItem(item)} className={`flex items-stretch bg-[#1e1e1e] border ${itemTheme.border} border-opacity-40 rounded-2xl overflow-hidden ${itemTheme.hoverBorder} hover:-translate-y-0.5 transition-all cursor-pointer group shadow-lg min-h-[100px]`}>
        <div className="w-24 sm:w-28 shrink-0 relative bg-gray-900 flex items-center justify-center overflow-hidden border-r border-gray-800/50">
          {finalImage ? (
            <img src={finalImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          ) : (
            <div className="absolute inset-0 bg-gray-800" />
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
          <PlayCircle size={36} className="text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-md" />
        </div>

        <div className="flex-1 p-4 flex flex-col justify-center overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
             {activeSport === 'All' && <span className={`w-1.5 h-1.5 rounded-full ${itemTheme.bg}`}></span>}
             <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{item.date}</span>
          </div>
          
          <h4 className={`font-bold text-sm leading-snug mb-2 text-gray-200 group-hover:${itemTheme.text} transition-colors line-clamp-2`} dangerouslySetInnerHTML={{ __html: item.title }} />
          
          <div className="flex items-center gap-[3px] mt-auto h-4 opacity-70 group-hover:opacity-100 transition-opacity">
            {[4, 8, 12, 8, 16, 10, 14, 6, 10, 12, 8, 6, 14, 8, 4, 8, 12, 10, 16, 12, 8, 14, 10, 6, 12, 8, 16, 10, 6, 4].map((h, i) => (
              <div key={i} className={`w-[2px] sm:w-[3px] shrink-0 rounded-full bg-gray-600 group-hover:${itemTheme.bg} transition-colors`} style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const LineupCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className={`group h-full w-full min-w-[160px] md:min-w-[200px] cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-700'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-500'} transition-all flex flex-col relative aspect-square`}>
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 border border-white/10"><Headphones size={24} className="text-white" /></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20">
        <h3 className={`font-black text-sm md:text-lg text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-3 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col w-full pt-6 pb-16 animate-in fade-in duration-300 ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      
      <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="grey-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop stopColor="#d1d5db" offset="0%" /><stop stopColor="#6b7280" offset="100%" /></linearGradient>
          <linearGradient id="fire-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop stopColor="#ef4444" offset="0%" /><stop stopColor="#f97316" offset="50%" /><stop stopColor="#eab308" offset="100%" /></linearGradient>
        </defs>
      </svg>

      {wireFeed.length > 0 && (
        <div className="w-full flex items-center pb-6 border-b border-gray-800/80 mb-8">
          <div className="flex flex-col items-center justify-center shrink-0 pr-4 md:pr-6 border-r border-gray-800/60">
            <Flame size={32} stroke="url(#fire-grad)" className="mb-1 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">The Wire</span>
          </div>
          
          <div className={`flex-1 min-w-0 flex items-center gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory ${hideScrollbar} pl-4 md:pl-6`}>
            {wireFeed.map((item) => {
              const itemTheme = themes[item.sport] || themes.All;
              return (
                <div key={`wire-${item.id}`} onClick={() => setSelectedItem(item)} className="flex flex-col items-center gap-2 shrink-0 snap-start group cursor-pointer relative pt-2 pr-2">
                  <div className="relative">
                    <div className={`w-[84px] h-[94px] p-[2px] ${itemTheme.bg} relative transition-transform duration-300 group-hover:scale-105 flex items-center justify-center`} style={shieldMaskStyle}>
                      <div className="w-full h-full relative bg-gray-900" style={shieldMaskStyle}>
                        {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover bg-gray-900" />}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-2 bg-[#0A0A0A] rounded-full p-2 border border-gray-700 shadow-xl z-20 flex items-center justify-center">
                      {item.type === 'video' && <Video size={14} stroke="url(#grey-grad)" />}
                      {item.type === 'article' && <FileText size={14} stroke="url(#grey-grad)" />}
                      {item.type === 'short' && <Zap size={14} stroke="url(#grey-grad)" />}
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 group-hover:text-white transition-colors text-center w-[90px] line-clamp-2 leading-tight" dangerouslySetInnerHTML={{ __html: item.title }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-12">
        <section className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mainFeature && (
              <div className="lg:col-span-2 w-full shrink-0 h-full flex flex-col">
                 <VideoCard item={mainFeature} isHero={true} />
              </div>
            )}
            <div className="flex flex-col gap-6 h-full">
              {sideTopFeature && (
                <div className={sideTopFeature.type === 'video' ? "w-full shrink-0" : "flex-1 w-full min-h-[200px]"}>
                   {sideTopFeature.type === 'video' ? <VideoCard item={sideTopFeature} isHero={false} /> : <VerticalCard item={sideTopFeature} />}
                </div>
              )}
              {sideBottomFeature && (
                <div className={sideBottomFeature.type === 'video' ? "w-full shrink-0" : "flex-1 w-full min-h-[200px]"}>
                   {sideBottomFeature.type === 'video' ? <VideoCard item={sideBottomFeature} isHero={false} /> : <VerticalCard item={sideBottomFeature} />}
                </div>
              )}
            </div>
          </div>
          
          {/* Dynamic Ad Slot 1 - Stretches 100% across the bottom of the grid */}
          {activeAds[0] && (
             <div className="w-full min-h-[120px]">
               <DynamicAd ad={activeAds[0]} />
             </div>
          )}
        </section>

        {(pressBoxArticles.length > 0 || boothPodcasts.length > 0) && (
          <section className="pt-6 border-t border-gray-800/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {pressBoxArticles.length > 0 && (
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><FileText stroke="url(#grey-grad)" /> The Press Box</h3>
                    <Link href={`/${activeSport.toLowerCase()}/articles`} className={`text-xs font-bold text-gray-400 ${theme.hoverText} transition-colors no-underline`}>View All Articles</Link>
                  </div>
                  <div className="flex flex-col gap-4">
                    {pressBoxArticles.map(article => <PressBoxCard key={article.id} item={article} />)}
                  </div>
                </div>
              )}
              {boothPodcasts.length > 0 && (
                <div className="lg:col-span-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><Headphones stroke="url(#grey-grad)" /> The Booth</h3>
                    <Link href={`/${activeSport.toLowerCase()}/podcasts`} className={`text-xs font-bold text-gray-400 ${theme.hoverText} transition-colors no-underline`}>View All Podcasts</Link>
                  </div>
                  <div className="flex flex-col gap-6 flex-1">
                    <div className="flex flex-col gap-4">
                      {boothPodcasts.map(pod => <BoothCard key={pod.id} item={pod} />)}
                    </div>
                    {/* Dynamic Ad Slots 2 & 3 */}
                    <div className="flex flex-col gap-6 flex-1">
                      {activeAds[1] && (
                         <div className="flex-1 min-h-[120px]">
                           <DynamicAd ad={activeAds[1]} />
                         </div>
                      )}
                      {activeAds[2] && (
                         <div className="flex-1 min-h-[120px]">
                           <DynamicAd ad={activeAds[2]} />
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {filmRoomVideos.length > 0 && (
          <section className="pt-6 border-t border-gray-800/50 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><Video stroke="url(#grey-grad)" /> The Film Room</h3>
              <Link href={`/${activeSport.toLowerCase()}/videos`} className={`text-xs font-bold text-gray-400 ${theme.hoverText} transition-colors no-underline`}>View All Videos</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filmRoomVideos.map(video => <VideoCard key={video.id} item={video} isHero={false} />)}
            </div>
            {/* Dynamic Ad Slot 4 */}
            {activeAds[3] && (
               <div className="w-full">
                 <DynamicAd ad={activeAds[3]} />
               </div>
            )}
          </section>
        )}

        {highlightShorts.length > 0 && (
          <section className="relative pt-6 border-t border-gray-800/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><Zap stroke="url(#grey-grad)" /> The Highlight Reel</h3>
              <div className="hidden md:flex items-center gap-2">
                 <button onClick={() => scrollShorts('left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                 <button onClick={() => scrollShorts('right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
              </div>
            </div>
            <div ref={shortsRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
              {highlightShorts.map(short => (
                <div key={short.id} className="relative w-36 md:w-44 flex-shrink-0 snap-start"><ShortCard item={short} /></div>
              ))}
              <Link href={`/${activeSport.toLowerCase()}/videos`} className="relative w-36 md:w-44 flex-shrink-0 snap-start aspect-[9/16] rounded-2xl overflow-hidden bg-[#111] border border-gray-700 hover:border-gray-500 transition-colors flex flex-col items-center justify-center group cursor-pointer shadow-lg text-gray-400 hover:text-white no-underline">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><ArrowRight size={24} /></div>
                <span className="font-black uppercase tracking-widest text-sm text-center">See All<br/>Shorts</span>
              </Link>
            </div>
          </section>
        )}

        {masterPodcasts.length > 0 && (
          <section className="relative pt-6 border-t border-gray-800/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><Mic stroke="url(#grey-grad)" /> The Lineup</h3>
              <div className="hidden md:flex items-center gap-2">
                 <button onClick={() => scrollLineup('left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                 <button onClick={() => scrollLineup('right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
              </div>
            </div>
            <div ref={lineupRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
              {masterPodcasts.map(podcast => (
                <div key={podcast.id} className="relative w-40 md:w-56 flex-shrink-0 snap-start"><LineupCard item={podcast} /></div>
              ))}
            </div>
          </section>
        )}
      </div>

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-50 p-3 bg-gray-700 text-white rounded-full shadow-[0_0_15px_rgba(75,85,99,0.5)] hover:bg-gray-600 hover:scale-110 transition-all duration-300" aria-label="Scroll to top">
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}