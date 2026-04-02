"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Headphones, ChevronRight } from 'lucide-react';
import { themes } from '../utils/theme';

// --- GLOBAL SUB-COMPONENTS ---

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

  const renderButton = (extraClass) => (
    <div className={`px-3 py-2 ${isHeader ? '@md:px-4 @md:py-2.5' : '@2xl:px-5 @2xl:py-2.5'} rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1 ${isHeader ? '@md:gap-1.5' : '@2xl:gap-2'} shrink-0 whitespace-nowrap ${extraClass}`} style={{ backgroundColor: ad.btnColor, color: ad.btnTextColor || '#ffffff' }}>
      {ad.buttonText} <ChevronRight size={14} className={isHeader ? 'hidden @xs:block' : 'hidden @md:block'} />
    </div>
  );

  return (
    <a href={ad.buttonLink || '#'} target="_blank" rel="noreferrer" className={`@container w-full h-full rounded-2xl flex relative overflow-hidden shadow-2xl group transition-all border-2 no-underline block hover:scale-[1.01] ${isHeader ? 'p-3 @md:p-4 min-h-[80px]' : 'p-4 @2xl:p-6 min-h-[120px]'} ${ad.fgImage && !isHeader ? 'flex-col items-center justify-center text-center gap-4 min-h-[200px]' : 'flex-row items-center justify-between gap-3 @2xl:gap-6'}`} style={bgStyles}>
       {ad.bgImage && <img src={ad.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" alt="" />}
       {ad.pattern !== 'none' && <div className="absolute inset-0" style={{ backgroundImage: patternOverlay, mixBlendMode: 'overlay', backgroundSize: ad.pattern === 'grid' ? '20px 20px' : 'auto' }}></div>}
       
       {ad.fgImage && !isHeader ? (
         <>
           <div className={`relative z-10 flex flex-col justify-center shrink min-w-0 items-center text-center flex-1`}>
             <h2 className={`text-lg @md:text-2xl @2xl:text-3xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform line-clamp-2 leading-tight origin-center`}>
               {ad.headline}
             </h2>
             <p className="text-gray-300 font-bold text-[10px] @md:text-xs uppercase tracking-widest relative z-10 line-clamp-2 mt-1">
               {ad.subtext}
             </p>
           </div>
           <div className="relative z-10 flex items-center justify-center shrink-0">
             <img src={ad.fgImage} className="max-h-24 @2xl:max-h-32 w-auto max-w-[100px] @2xl:max-w-[160px] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" alt="" />
           </div>
           {renderButton("")}
         </>
       ) : (
         <>
           <div className={`relative z-10 flex flex-col justify-center shrink min-w-0 pr-2 items-center text-center ${isHeader ? '@xs:items-start @xs:text-left flex-1' : '@2xl:items-start @2xl:text-left flex-1'}`}>
             <h2 className={`${isHeader ? 'text-base @xs:text-lg @md:text-xl' : 'text-lg @md:text-2xl @2xl:text-3xl'} font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform line-clamp-1 leading-tight origin-center ${isHeader ? '@xs:origin-left' : '@2xl:origin-left'}`}>
               {ad.headline}
             </h2>
             <p className={`text-gray-300 font-bold ${isHeader ? 'text-[9px] @md:text-[10px]' : 'text-[10px] @md:text-xs'} uppercase tracking-widest relative z-10 line-clamp-1 mt-0.5`}>
               {ad.subtext}
             </p>
             {isHeader ? renderButton("mt-2 flex @sm:hidden w-max") : renderButton("mt-3 flex @2xl:hidden w-max")}
           </div>
           
           {ad.fgImage && isHeader && (
             <div className="relative z-10 flex justify-center items-center shrink-0">
               <img src={ad.fgImage} className="max-h-12 w-auto max-w-[80px] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" alt="" />
             </div>
           )}

           <div className={`relative z-10 ${isHeader ? 'hidden @sm:flex' : 'hidden @2xl:flex'} justify-end items-center shrink-0 min-w-0`}>
             {renderButton("")}
           </div>
         </>
       )}
    </a>
  );
};

const LineupCard = ({ item, setSelectedItem }) => (
  <div onClick={() => setSelectedItem(item)} className={`group w-full cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-600'} transition-all flex flex-col relative aspect-square`}>
    {item.imageUrl ? (
       <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
    ) : (
       <div className="absolute inset-0 bg-gray-800" />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
      <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 border border-white/10">
        <Headphones size={24} className="text-white" />
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20">
      <h3 className={`font-black text-sm md:text-lg text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-3 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function PodcastsArchive({ podcasts, activeSport, setSelectedItem }) {
  const theme = themes[activeSport] || themes.All;
  const [globalAds, setGlobalAds] = useState([]);

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
        console.error("Failed to fetch dynamic ads", e);
      }
    };
    fetchAds();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const activeAds = globalAds.filter(ad => {
    if (!ad.pages || !ad.pages.includes('podcasts')) return false;
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
  const headerAds = activeAds.filter(ad => ad.placements?.includes('header'));
  const sidebarAds = activeAds.filter(ad => ad.placements?.includes('inline'));

  return (
    <div className="flex flex-col w-full pt-6 pb-16 animate-in fade-in duration-300">
      
      {/* HEADER SECTION - Wider 675px container */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
        <div className="flex-1 shrink-0">
          <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Podcasts</h1>
          <p className="text-gray-400 mt-2 text-sm">Listen to the top fantasy sports audio shows in the industry.</p>
        </div>

        {/* DYNAMIC HEADER AD SLOT */}
        {headerAds.length > 0 && (
          <div className="hidden lg:block w-full max-w-[675px]">
            <DynamicAd ad={headerAds[0]} variant="header" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PODCAST GRID */}
        <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-6">
          {podcasts.map(pod => <LineupCard key={pod.id} item={pod} setSelectedItem={setSelectedItem} />)}
        </div>

        {/* AD SIDEBAR COLUMN */}
        <div className="lg:col-span-3 flex flex-col gap-6 sticky top-24">
          {sidebarAds.length > 0 ? (
            sidebarAds.map((ad) => (
              <div key={ad.id} className="w-full">
                <DynamicAd ad={ad} />
              </div>
            ))
          ) : (
            <div className="w-full h-64 bg-gray-900/20 border border-gray-800 rounded-2xl flex items-center justify-center text-[10px] uppercase font-bold text-gray-600">
              Advertisement
            </div>
          )}
        </div>

      </div>
    </div>
  );
}