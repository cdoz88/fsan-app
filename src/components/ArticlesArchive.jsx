"use client";
import React, { useState, useEffect } from 'react';
import { Loader2, ChevronRight, ChevronUp } from 'lucide-react';
import { themes } from '../utils/theme';

export default function ArticlesArchive({ articles, activeSport, setSelectedItem, loadMorePosts, isLoadingMore }) {
  const theme = themes[activeSport] || themes.All;
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const heroArticle = articles.length > 0 ? articles[0] : null;
  const sideArticles = articles.length > 1 ? articles.slice(1, 4) : [];
  const midArticles = articles.length > 4 ? articles.slice(4, 6) : [];
  const stackedArticles = articles.length > 6 ? articles.slice(6, 9) : [];
  const listArticles = articles.length > 9 ? articles.slice(9) : [];

  const PromoAd = ({ shape = "banner", title = "Join Sellout Crowds", subtitle = "Win Your League with Real-Time Advice!", cta = "Join Community", link = 'https://www.selloutcrowds.com/crowd/fsan' }) => (
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
  
  const HeroCard = ({ item }) => {
    const cardTheme = themes[item.sport] || themes.All;
    return (
      <div onClick={() => setSelectedItem(item)} className={`group relative w-full h-full min-h-[400px] lg:min-h-[500px] cursor-pointer bg-[#111] border ${cardTheme.border} rounded-2xl overflow-hidden shadow-2xl ${cardTheme.hoverBorder} transition-all`}>
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" /> : <div className="absolute inset-0 bg-gray-900" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 z-20 flex flex-col justify-end">
          <PostMeta item={item} />
          <h3 className={`font-black text-2xl lg:text-4xl text-white leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-3 drop-shadow-xl mb-3`} dangerouslySetInnerHTML={{ __html: item.title }} />
          <div className="text-sm text-gray-300 line-clamp-2 max-w-3xl drop-shadow-md" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
        </div>
      </div>
    );
  };

  const SideListCard = ({ item }) => {
    const cardTheme = themes[item.sport] || themes.All;
    return (
      <div onClick={() => setSelectedItem(item)} className={`group relative w-full flex flex-row cursor-pointer bg-[#1e1e1e] border ${cardTheme.border} border-opacity-40 rounded-2xl overflow-hidden shadow-lg ${cardTheme.hoverBorder} transition-all items-stretch min-h-[140px]`}>
        <div className="w-1/3 lg:w-2/5 shrink-0 relative bg-gray-900 overflow-hidden">
           {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />}
           <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-[#1e1e1e] z-10" />
        </div>
        <div className="flex-1 p-4 lg:p-5 relative z-20 flex flex-col justify-center bg-[#1e1e1e]">
          <PostMeta item={item} />
          <h4 className={`font-black text-sm lg:text-base text-gray-200 leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-md mb-1`} dangerouslySetInnerHTML={{ __html: item.title }} />
          <div className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed opacity-80" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
        </div>
      </div>
    );
  };

  const MidCard = ({ item }) => {
    const cardTheme = themes[item.sport] || themes.All;
    return (
      <div onClick={() => setSelectedItem(item)} className={`group relative w-full h-[250px] md:h-[300px] cursor-pointer bg-[#111] border ${cardTheme.border} rounded-2xl overflow-hidden shadow-xl ${cardTheme.hoverBorder} transition-all`}>
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" /> : <div className="absolute inset-0 bg-gray-900" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col justify-end">
          <PostMeta item={item} />
          <h3 className={`font-black text-lg lg:text-xl text-white leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-lg mb-2`} dangerouslySetInnerHTML={{ __html: item.title }} />
          <div className="text-xs text-gray-300 line-clamp-1 drop-shadow-md" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
        </div>
      </div>
    );
  };

  const StackedCard = ({ item }) => {
    const cardTheme = themes[item.sport] || themes.All;
    return (
      <div onClick={() => setSelectedItem(item)} className={`group relative w-full flex flex-col md:flex-row cursor-pointer bg-[#1e1e1e] border ${cardTheme.border} border-opacity-40 rounded-2xl overflow-hidden shadow-lg ${cardTheme.hoverBorder} transition-all items-stretch`}>
         <div className="w-full md:w-2/5 shrink-0 relative bg-gray-900 overflow-hidden min-h-[160px] md:min-h-[200px]">
            {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#1e1e1e] to-transparent md:hidden z-10" />
            <div className="hidden md:block absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-[#1e1e1e] z-10" />
         </div>
         <div className="flex-1 p-5 relative z-20 flex flex-col justify-center bg-[#1e1e1e]">
           <PostMeta item={item} />
           <h3 className={`font-black text-lg lg:text-2xl text-gray-200 leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 mb-2`} dangerouslySetInnerHTML={{ __html: item.title }} />
           <div className="text-sm text-gray-400 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
         </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full pt-6 pb-16 animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
        <div>
          <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Articles</h1>
          <p className="text-gray-400 mt-2 text-sm">Read the latest analysis, rankings updates, and news.</p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest">No articles found for this sport yet.</div>
      ) : (
        <div className="flex flex-col gap-8">
          {(heroArticle || sideArticles.length > 0) && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              {heroArticle && (
                <div className="xl:col-span-7 h-full">
                  <HeroCard item={heroArticle} />
                </div>
              )}
              {sideArticles.length > 0 && (
                <div className="xl:col-span-5 flex flex-col justify-between gap-4">
                  {sideArticles.map(article => (
                    <SideListCard key={article.id} item={article} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="w-full">
            <PromoAd shape="banner" title="Dominate Your Draft" subtitle="Get the ultimate rookie breakdown!" cta="Get Access" link="#" />
          </div>

          {midArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {midArticles.map(article => (
                <MidCard key={article.id} item={article} />
              ))}
            </div>
          )}

          {stackedArticles.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
              <div className="xl:col-span-8 flex flex-col gap-4">
                {stackedArticles.map(article => (
                  <StackedCard key={article.id} item={article} />
                ))}
              </div>
              <div className="xl:col-span-4 flex flex-col gap-4">
                <div className="flex-1 w-full min-h-[200px]">
                  <PromoAd shape="square" title="Fantasy Apparel Drop" subtitle="Shop the new FSAN collection!" cta="Shop Now" link="https://fsan.shop" />
                </div>
                <div className="flex-1 w-full min-h-[200px]">
                  <PromoAd shape="square" title="Join Sellout Crowds" subtitle="Win Your League with Real-Time Advice!" cta="Join Community" link="https://www.selloutcrowds.com/crowd/fsan" />
                </div>
              </div>
            </div>
          )}

          {listArticles.length > 0 && (
            <div className="flex flex-col gap-4 pt-4 border-t border-gray-800/50">
              {listArticles.map((article) => {
                const cardTheme = themes[article.sport] || themes.All;
                return (
                  <div key={article.id} onClick={() => setSelectedItem(article)} className={`bg-[#1e1e1e] border ${cardTheme.border} border-opacity-40 rounded-2xl flex flex-col md:flex-row overflow-hidden ${cardTheme.hoverBorder} hover:-translate-y-0.5 transition-all cursor-pointer group shadow-lg min-h-[200px] items-stretch`}>
                    <div className="w-full md:w-72 lg:w-80 shrink-0 relative bg-gray-900 overflow-hidden min-h-[200px]">
                        {article.imageUrl && <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"/>}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#1e1e1e] to-transparent md:hidden z-10" />
                        <div className="hidden md:block absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[#1e1e1e] z-10" />
                    </div>
                    <div className="relative z-10 px-5 pb-5 md:p-6 flex flex-col justify-center flex-1 bg-[#1e1e1e]">
                      <PostMeta item={article} />
                      <h3 className={`text-xl lg:text-2xl font-black leading-tight mb-2 text-gray-200 group-hover:${cardTheme.text} transition-colors drop-shadow-lg`} dangerouslySetInnerHTML={{ __html: article.title }} />
                      <div className="text-sm text-gray-400 line-clamp-2 leading-relaxed drop-shadow" dangerouslySetInnerHTML={{ __html: article.excerpt }} />
                    </div>
                  </div>
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