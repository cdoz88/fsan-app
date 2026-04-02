"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, ChevronRight, ChevronUp } from 'lucide-react';
import { themes } from '../utils/theme';

// --- GLOBAL SUB-COMPONENTS (Hoisted outside main component) ---

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

const DynamicAd = ({ ad }) => {
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

  const renderButton = (extraClass) => (
    <div className={`px-3 py-2 @2xl:px-5 @2xl:py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1 @2xl:gap-2 shrink-0 whitespace-nowrap ${extraClass}`} style={{ backgroundColor: ad.btnColor, color: ad.btnTextColor || '#ffffff' }}>
       {ad.buttonText} <ChevronRight size={14} className="hidden @md:block" />
    </div>
  );

  return (
    <a href={ad.buttonLink || '#'} target="_blank" rel="noreferrer" className={`@container w-full h-full rounded-2xl p-4 @2xl:p-6 flex relative overflow-hidden shadow-2xl group transition-all border-2 no-underline block hover:scale-[1.01] ${ad.fgImage ? 'flex-col items-center justify-center text-center gap-4 min-h-[200px]' : 'flex-col @4xl:flex-row items-center justify-center @4xl:justify-between gap-3 @2xl:gap-6 min-h-[120px]'}`} style={bgStyles}>
       {ad.bgImage && <img src={ad.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" alt="" />}
       {ad.pattern !== 'none' && <div className="absolute inset-0" style={{ backgroundImage: patternOverlay, mixBlendMode: 'overlay', backgroundSize: ad.pattern === 'grid' ? '20px 20px' : 'auto' }}></div>}
       
       {ad.fgImage ? (
         // STACKED LAYOUT (Headline -> Image -> Button)
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
         // RESPONSIVE LAYOUT FOR NO-IMAGE ADS
         <>
           <div className={`relative z-10 flex flex-col justify-center shrink min-w-0 pr-2 items-center text-center @4xl:items-start @4xl:text-left flex-1`}>
             <h2 className={`text-lg @md:text-2xl @2xl:text-3xl font-black text-white italic tracking-tight mb-1 relative z-10 group-hover:scale-105 transition-transform line-clamp-2 leading-tight origin-center @4xl:origin-left`}>
               {ad.headline}
             </h2>
             <p className="text-gray-300 font-bold text-[10px] @md:text-xs uppercase tracking-widest relative z-10 line-clamp-2 mt-1">
               {ad.subtext}
             </p>
             {renderButton("mt-4 flex @4xl:hidden w-max")}
           </div>
           <div className={`relative z-10 hidden @4xl:flex justify-end items-center shrink-0 @5xl:flex-1 min-w-0`}>
             {renderButton("")}
           </div>
         </>
       )}
    </a>
  );
};

const HeroCard = ({ item, setSelectedItem, activeSport }) => {
  const cardTheme = themes[item.sport] || themes.All;
  return (
    <div onClick={() => setSelectedItem(item)} className={`group relative w-full h-full min-h-[400px] lg:min-h-[500px] cursor-pointer bg-[#111] border ${cardTheme.border} rounded-2xl overflow-hidden shadow-2xl ${cardTheme.hoverBorder} transition-all`}>
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" /> : <div className="absolute inset-0 bg-gray-900" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-20 flex flex-col justify-end">
        <PostMeta item={item} activeSport={activeSport} />
        <h3 className={`font-black text-2xl lg:text-4xl text-white leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-3 drop-shadow-xl mb-3`} dangerouslySetInnerHTML={{ __html: item.title }} />
        <div className="text-sm text-gray-300 line-clamp-2 max-w-3xl drop-shadow-md" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
      </div>
    </div>
  );
};

const SideListCard = ({ item, setSelectedItem, activeSport }) => {
  const cardTheme = themes[item.sport] || themes.All;
  return (
    <div onClick={() => setSelectedItem(item)} className={`group relative w-full flex flex-row cursor-pointer bg-[#1e1e1e] border ${cardTheme.border} border-opacity-40 rounded-2xl overflow-hidden shadow-lg ${cardTheme.hoverBorder} transition-all items-stretch min-h-[140px]`}>
      <div className="w-1/3 lg:w-2/5 shrink-0 relative bg-gray-900 overflow-hidden">
         {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />}
         <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-[#1e1e1e] z-10" />
      </div>
      <div className="flex-1 p-4 lg:p-5 relative z-20 flex flex-col justify-center bg-[#1e1e1e]">
        <PostMeta item={item} activeSport={activeSport} />
        <h4 className={`font-black text-sm lg:text-base text-gray-200 leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-md mb-1`} dangerouslySetInnerHTML={{ __html: item.title }} />
        <div className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed opacity-80" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
      </div>
    </div>
  );
};

const MidCard = ({ item, setSelectedItem, activeSport }) => {
  const cardTheme = themes[item.sport] || themes.All;
  return (
    <div onClick={() => setSelectedItem(item)} className={`group relative w-full h-[250px] md:h-[300px] cursor-pointer bg-[#111] border ${cardTheme.border} rounded-2xl overflow-hidden shadow-xl ${cardTheme.hoverBorder} transition-all`}>
      {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" /> : <div className="absolute inset-0 bg-gray-900" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col justify-end">
        <PostMeta item={item} activeSport={activeSport} />
        <h3 className={`font-black text-lg lg:text-xl text-white leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-lg mb-2`} dangerouslySetInnerHTML={{ __html: item.title }} />
        <div className="text-xs text-gray-300 line-clamp-1 drop-shadow-md" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
      </div>
    </div>
  );
};

const StackedCard = ({ item, setSelectedItem, activeSport }) => {
  const cardTheme = themes[item.sport] || themes.All;
  return (
    <div onClick={() => setSelectedItem(item)} className={`group relative w-full flex flex-col md:flex-row cursor-pointer bg-[#1e1e1e] border ${cardTheme.border} border-opacity-40 rounded-2xl overflow-hidden shadow-lg ${cardTheme.hoverBorder} transition-all items-stretch`}>
       <div className="w-full md:w-2/5 shrink-0 relative bg-gray-900 overflow-hidden min-h-[160px] md:min-h-[200px]">
          {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#1e1e1e] to-transparent md:hidden z-10" />
          <div className="hidden md:block absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-[#1e1e1e] z-10" />
       </div>
       <div className="flex-1 p-5 relative z-20 flex flex-col justify-center bg-[#1e1e1e]">
         <PostMeta item={item} activeSport={activeSport} />
         <h3 className={`font-black text-lg lg:text-2xl text-gray-200 leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 mb-2`} dangerouslySetInnerHTML={{ __html: item.title }} />
         <div className="text-sm text-gray-400 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
       </div>
    </div>
  );
};

// --- MAIN COMPONENT EXPORT ---

export default function ArticlesArchive({ articles, activeSport, setSelectedItem, loadMorePosts, isLoadingMore }) {
  const theme = themes[activeSport] || themes.All;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [globalAds, setGlobalAds] = useState([]);

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
    if (!ad.pages?.includes('articles')) return false;
    if (!ad.sport?.includes('All') && !ad.sport?.includes(activeSport)) return false;
    if (ad.startDate) {
      const start = new Date(ad.startDate.split('-')[0], ad.startDate.split('-')[1] - 1, ad.startDate.split('-')[2]);
      if (today < start) return false;
    }
    if (ad.endDate) {
      const end = new Date(ad.endDate.split('-')[0], ad.endDate.split('-')[1] - 1, ad.endDate.split('-')[2]);
      if (today > end) return false;
    }
    return true; 
  });

  // Categorize by Placement
  const headerAds = pageAds.filter(ad => ad.placements?.includes('header'));
  const inlineAds = pageAds.filter(ad => ad.placements?.includes('inline'));

  const heroArticle = articles.length > 0 ? articles[0] : null;
  const sideArticles = articles.length > 1 ? articles.slice(1, 4) : [];
  const midArticles = articles.length > 4 ? articles.slice(4, 6) : [];
  const stackedArticles = articles.length > 6 ? articles.slice(6, 9) : [];
  const listArticles = articles.length > 9 ? articles.slice(9) : [];

  return (
    <div className="flex flex-col w-full pt-6 pb-16 animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
        <div className="flex-1">
          <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Articles</h1>
          <p className="text-gray-400 mt-2 text-sm">Read the latest analysis, rankings updates, and news.</p>
        </div>

        {/* DYNAMIC HEADER AD SLOT */}
        {headerAds.length > 0 && (
          <div className="hidden lg:block w-full max-w-[500px] h-[100px]">
            <DynamicAd ad={headerAds[0]} />
          </div>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest">No articles found for this sport yet.</div>
      ) : (
        <div className="flex flex-col gap-8">
          {(heroArticle || sideArticles.length > 0) && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              {heroArticle && (
                <div className="xl:col-span-7 h-full">
                  <HeroCard item={heroArticle} setSelectedItem={setSelectedItem} activeSport={activeSport} />
                </div>
              )}
              {sideArticles.length > 0 && (
                <div className="xl:col-span-5 flex flex-col justify-between gap-4">
                  {sideArticles.map(article => (
                    <SideListCard key={article.id} item={article} setSelectedItem={setSelectedItem} activeSport={activeSport} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC INLINE AD SLOT 1 */}
          {inlineAds.length > 0 && (
            <div className="w-full">
              <DynamicAd ad={inlineAds[0]} />
            </div>
          )}

          {midArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {midArticles.map(article => (
                <MidCard key={article.id} item={article} setSelectedItem={setSelectedItem} activeSport={activeSport} />
              ))}
            </div>
          )}

          {stackedArticles.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              <div className="xl:col-span-8 flex flex-col gap-4">
                {stackedArticles.map(article => (
                  <StackedCard key={article.id} item={article} setSelectedItem={setSelectedItem} activeSport={activeSport} />
                ))}
              </div>
              <div className="xl:col-span-4 flex flex-col gap-4">
                {/* DYNAMIC INLINE AD SLOTS 2 & 3 */}
                {inlineAds.length > 1 && (
                  <div className="flex-1 w-full min-h-[200px]">
                    <DynamicAd ad={inlineAds[1]} />
                  </div>
                )}
                {inlineAds.length > 2 && (
                  <div className="flex-1 w-full min-h-[200px]">
                    <DynamicAd ad={inlineAds[2]} />
                  </div>
                )}
              </div>
            </div>
          )}

          {listArticles.length > 0 && (
            <div className="flex flex-col gap-4 pt-4 border-t border-gray-800/50">
              {listArticles.map((article, index) => {
                const cardTheme = themes[article.sport] || themes.All;
                const showAd = (index + 1) % 5 === 0; 
                
                // Cycles through all inline ads infinitely
                const adIndex = inlineAds.length > 0 ? (Math.floor(index / 5) % inlineAds.length) : -1;

                return (
                  <React.Fragment key={article.id}>
                    <div onClick={() => setSelectedItem(article)} className={`bg-[#1e1e1e] border ${cardTheme.border} border-opacity-40 rounded-2xl flex flex-col md:flex-row overflow-hidden ${cardTheme.hoverBorder} hover:-translate-y-0.5 transition-all cursor-pointer group shadow-lg min-h-[200px] items-stretch`}>
                      <div className="w-full md:w-72 lg:w-80 shrink-0 relative bg-gray-900 overflow-hidden min-h-[200px]">
                          {article.imageUrl && <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"/>}
                          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#1e1e1e] to-transparent md:hidden z-10" />
                          <div className="hidden md:block absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#1e1e1e] z-10" />
                      </div>
                      <div className="relative z-10 px-5 pb-5 md:p-6 flex flex-col justify-center flex-1 bg-[#1e1e1e]">
                        <PostMeta item={article} activeSport={activeSport} />
                        <h3 className={`text-xl lg:text-2xl font-black leading-tight mb-2 text-gray-200 group-hover:${cardTheme.text} transition-colors drop-shadow-lg`} dangerouslySetInnerHTML={{ __html: article.title }} />
                        <div className="text-sm text-gray-400 line-clamp-2 leading-relaxed drop-shadow" dangerouslySetInnerHTML={{ __html: article.excerpt }} />
                      </div>
                    </div>
                    {showAd && adIndex !== -1 && (
                      <div className="py-4">
                        <DynamicAd ad={inlineAds[adIndex]} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {articles.length > 0 && (
        <button 
          onClick={loadMorePosts}
          disabled={isLoadingMore}
          className={`w-full py-4 mt-8 border border-gray-700 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] flex items-center justify-center gap-3 ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : `${theme.hoverText} ${theme.hoverBorder}`}`}
        >
          {isLoadingMore ? <><Loader2 size={18} className="animate-spin" /> Fetching Older Articles...</> : 'Load Older Articles'}
        </button>
      )}

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 z-50 p-3 bg-gray-700 text-white rounded-full shadow-[0_0_15px_rgba(75,85,99,0.5)] hover:bg-gray-600 hover:scale-110 transition-all duration-300" aria-label="Scroll to top">
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}