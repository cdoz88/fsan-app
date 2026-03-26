import React, { useState } from 'react';
import { PlayCircle, FileText, Film, Mic, ChevronRight, LayoutList, Users, Calculator, ArrowLeftRight, Shirt, Flag, Star } from 'lucide-react';
import { Facebook, XIcon, Youtube, Instagram, TikTok, LinkedIn, SelloutCrowds } from '../components/Icons';
import { themes } from '../utils/theme';

export default function Home({ videos, articles, activeSport, setActiveSport, currentView = 'home', setCurrentView, setSelectedItem }) {
  const theme = themes[activeSport];
  const [feedFilter, setFeedFilter] = useState('all');

  const socialLinks = {
    All: { facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork', x: 'https://x.com/fsadvicenet', youtube: 'https://www.youtube.com/@FFAdviceNet', tiktok: 'https://www.tiktok.com/@fsadvicenetwork', linkedin: 'https://www.linkedin.com/company/fantasy-sports-advice', sellout: 'https://www.selloutcrowds.com/crowd/fsan', instagram: null },
    Football: { facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork', x: 'https://x.com/FFAdviceNet', youtube: 'https://www.youtube.com/@FFAdviceNet', instagram: 'https://www.instagram.com/ffadvicenet/', sellout: '#', tiktok: null, linkedin: null },
    Basketball: { facebook: null, x: 'https://x.com/FBBAdviceNet', youtube: 'https://www.youtube.com/@FBBAdviceNet', instagram: 'https://www.instagram.com/fbkadvicenet/', sellout: '#', tiktok: null, linkedin: null },
    Baseball: { facebook: null, x: 'https://x.com/FBAdviceNet', youtube: 'https://www.youtube.com/@FBAdviceNet', instagram: 'https://www.instagram.com/fbadvicenet/', sellout: '#', tiktok: null, linkedin: null },
  };
  const currentLinks = socialLinks[activeSport];

  const eightDaysAgo = new Date().getTime() - (8 * 24 * 60 * 60 * 1000);

  let filteredFeed = [...videos, ...articles]
    .filter(item => item.rawTimestamp >= eightDaysAgo)
    .sort((a, b) => b.rawTimestamp - a.rawTimestamp);

  if (feedFilter === 'articles') filteredFeed = filteredFeed.filter(item => item.type === 'article');
  if (feedFilter === 'videos') filteredFeed = filteredFeed.filter(item => item.type === 'video');
  if (feedFilter === 'podcasts') filteredFeed = filteredFeed.filter(item => item.type === 'podcast');

  const groupedFeed = [];
  filteredFeed.forEach(item => {
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
  // AD / FILLER COMPONENTS
  // ==========================================
  const PromoRookieGuideHorizontal = () => (
    <div className="w-full h-full bg-gradient-to-r from-red-900 to-black border border-red-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between relative overflow-hidden shadow-xl cursor-pointer hover:border-red-500 transition-colors group">
       <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]"></div>
       <div className="relative z-10 text-center sm:text-left mb-4 sm:mb-0">
         <h3 className="text-red-500 font-black text-2xl italic uppercase drop-shadow-md group-hover:scale-105 transition-transform origin-left">Dominate</h3>
         <p className="text-white text-xs font-bold uppercase tracking-widest">Get The Ultimate Rookie Breakdown!</p>
       </div>
       <button className="bg-green-600 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg relative z-10 whitespace-nowrap">
         Only $10 - Get Access
       </button>
    </div>
  );

  const PromoSelloutCrowdsSquare = () => (
    <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/40 via-[#111] to-black border border-red-900/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl cursor-pointer hover:border-red-600 transition-colors group">
       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')", mixBlendMode: 'overlay' }}></div>
       <h2 className="text-3xl font-black text-white italic tracking-tight mb-2 relative z-10 group-hover:scale-105 transition-transform">Join Sellout Crowds</h2>
       <p className="text-gray-300 font-bold text-xs tracking-wide mb-6 relative z-10">Win Your League with Real-Time Advice!</p>
       <button className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg relative z-10 flex items-center gap-2">
          Join Community <ChevronRight size={14} />
       </button>
    </div>
  );

  const PromoMerchSquare = () => (
    <div className="w-full h-full bg-[#111] border border-purple-900/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-600 transition-all group overflow-hidden relative shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-black z-0 transition-opacity group-hover:opacity-80"></div>
      <h3 className="text-purple-500 font-black text-2xl italic uppercase z-10 group-hover:scale-110 transition-transform">Fantasy Apparel</h3>
      <p className="text-gray-400 text-[10px] font-bold tracking-widest z-10 mt-2">FSAN.SHOP</p>
      <button className="mt-6 bg-transparent border-2 border-purple-600 text-purple-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-wider group-hover:bg-purple-600 group-hover:text-white transition-colors z-10">
        Shop Now
      </button>
    </div>
  );

  // ==========================================
  // CARD STYLE COMPONENTS (For the Bento Box)
  // ==========================================
  
  // Tag overlay helper
  const CardTags = ({ item }) => (
    <div className="flex items-center gap-2 mb-3 z-20 relative">
      {item.type === 'video' ? (
         <span className="bg-red-900/80 text-white border border-red-500/50 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">Video</span>
      ) : (
         <span className={`w-2 h-2 rounded-full ${themes[item.sport].bg} shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]`}></span>
      )}
      <span className="text-gray-300 font-bold text-[10px] uppercase tracking-wider drop-shadow-md">
        {item.type === 'article' ? `By ${item.author}` : item.sport}
      </span>
    </div>
  );

  // 1. STANDARD VERTICAL CARD
  const VerticalCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className="group h-full w-full cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-gray-600 transition-all flex flex-col relative">
      <div className="w-full aspect-video bg-gradient-to-tr from-[#1c233a] to-[#111] relative flex items-center justify-center overflow-hidden shrink-0">
        {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />}
        {item.type === 'video' && (
           <><div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div><PlayCircle size={48} className="text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 relative drop-shadow-lg" /></>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#161616]">
        <CardTags item={item} />
        <h3 className={`font-black text-lg leading-tight group-hover:${theme.text} transition-colors mb-3`} dangerouslySetInnerHTML={{ __html: item.title }} />
        {item.type === 'article' && <div className="text-sm text-gray-400 line-clamp-2 mt-auto" dangerouslySetInnerHTML={{ __html: item.excerpt }} />}
      </div>
    </div>
  );

  // 2. HORIZONTAL FEATURE CARD (Image left, text right)
  const HorizontalCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className="group h-full w-full cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-gray-600 transition-all flex flex-col sm:flex-row relative">
      <div className="w-full sm:w-2/5 aspect-video sm:aspect-auto bg-gray-800 relative overflow-hidden shrink-0">
        {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />}
        {item.type === 'video' && (
           <><div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div><PlayCircle size={48} className="text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 relative drop-shadow-lg" /></>
        )}
      </div>
      <div className="p-6 flex flex-col justify-center flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#161616]">
        <CardTags item={item} />
        <h3 className={`font-black text-xl lg:text-2xl leading-tight group-hover:${theme.text} transition-colors mb-3`} dangerouslySetInnerHTML={{ __html: item.title }} />
        <div className="text-sm text-gray-400 line-clamp-2 lg:line-clamp-3" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
      </div>
    </div>
  );

  // 3. MASSIVE HERO CARD (Background Image with text overlay)
  const HeroCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className="group h-full w-full min-h-[400px] cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden shadow-xl hover:border-gray-500 transition-all relative flex flex-col justify-end">
      {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
      {item.type === 'video' && (
         <div className="absolute inset-0 flex items-center justify-center"><PlayCircle size={64} className="text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 relative drop-shadow-2xl" /></div>
      )}
      <div className="relative z-10 p-6 lg:p-8 w-full md:w-4/5">
        <CardTags item={item} />
        <h3 className={`font-black text-3xl lg:text-4xl text-white leading-tight group-hover:${theme.text} transition-colors mb-3 drop-shadow-lg`} dangerouslySetInnerHTML={{ __html: item.title }} />
        {item.type === 'article' && <div className="text-sm lg:text-base text-gray-300 line-clamp-2 drop-shadow" dangerouslySetInnerHTML={{ __html: item.excerpt }} />}
      </div>
    </div>
  );


  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
      
      {/* LEFT COLUMN: STICKY DASHBOARD MENU */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">
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
                  <Mic size={18} className={theme.text} /> Podcasts
                </button>
             </div>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-xl">
             <h4 className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-4 px-2">Pro Tools</h4>
             <div className="flex flex-col gap-1">
                {[
                  { name: 'Player Rankings', icon: Users },
                  { name: 'Trade Calculator', icon: Calculator },
                  { name: 'Trade Value Chart', icon: ArrowLeftRight }
                ].map(tool => {
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
                <a href="#" className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl">
                  <SelloutCrowds size={18} className={theme.text} /> Exclusive Community
                </a>
                <a href="#" className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl">
                  <Shirt size={18} className={theme.text} /> Join A Jersey League
                </a>
                <a href="#" className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl">
                  <Flag size={18} className={theme.text} /> Compete in the Napkin League
                </a>
             </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 mt-2 mb-8">
             <div className="flex flex-wrap items-center justify-center gap-5 text-gray-500 px-2">
                {currentLinks.facebook && <a href={currentLinks.facebook} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><Facebook size={20} /></a>}
                {currentLinks.x && <a href={currentLinks.x} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><XIcon size={20} /></a>}
                {currentLinks.youtube && <a href={currentLinks.youtube} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><Youtube size={20} /></a>}
                {currentLinks.instagram && <a href={currentLinks.instagram} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><Instagram size={20} /></a>}
                {currentLinks.tiktok && <a href={currentLinks.tiktok} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><TikTok size={20} /></a>}
                {currentLinks.linkedin && <a href={currentLinks.linkedin} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><LinkedIn size={20} /></a>}
                {currentLinks.sellout && <a href={currentLinks.sellout} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><SelloutCrowds size={20} /></a>}
             </div>
             <div className="text-center mt-2">
               <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                 &copy; {new Date().getFullYear()} Fantasy Sports Advice Network
               </p>
               <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">
                 All Rights Reserved
               </p>
             </div>
          </div>

        </div>
      </div>

      {/* CENTER & RIGHT: THE UNIFIED TIMELINE BENTO BOX */}
      <div className="lg:col-span-9 flex flex-col gap-8 w-full max-w-5xl">
        
        {/* App-like Feed Filter Toggle */}
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
        <div className="flex flex-col gap-12">
          {groupedFeed.map((group, groupIndex) => {
            let displayDate = group.date;
            if (group.date === todayStr) displayDate = 'Today';
            else if (group.date === yesterdayStr) displayDate = 'Yesterday';

            const items = group.items;
            const count = items.length;

            return (
              <div key={group.date} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Date Bundle Header */}
                <div className="flex items-center gap-4">
                  <div className={`h-px flex-1 ${theme.bg} opacity-50`}></div>
                  <span className={`font-black uppercase tracking-widest text-lg md:text-xl drop-shadow-md ${theme.text}`}>
                    {displayDate}
                  </span>
                  <div className={`h-px flex-[5] ${theme.bg} opacity-50`}></div>
                </div>

                {/* THE DYNAMIC EDITORIAL GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
                  
                  {/* LAYOUT 1: Only 1 Item (Full width Horizontal + Square Ad) */}
                  {count === 1 && (
                    <>
                      <div className="lg:col-span-2 lg:row-span-1">
                        <HorizontalCard item={items[0]} />
                      </div>
                      <div className="lg:col-span-1 lg:row-span-1">
                        {groupIndex % 2 === 0 ? <PromoSelloutCrowdsSquare /> : <PromoMerchSquare />}
                      </div>
                    </>
                  )}

                  {/* LAYOUT 2: Exactly 2 Items (Vertical left, Stacked right) */}
                  {count === 2 && (
                    <>
                      <div className="lg:col-span-1 lg:row-span-2">
                        <VerticalCard item={items[0]} />
                      </div>
                      <div className="lg:col-span-2 lg:row-span-1">
                        <HorizontalCard item={items[1]} />
                      </div>
                      <div className="lg:col-span-2 lg:row-span-1 h-[200px] lg:h-auto">
                        <PromoRookieGuideHorizontal />
                      </div>
                    </>
                  )}

                  {/* LAYOUT 3: 3 or more Items (Hero top, smaller items flow below) */}
                  {count >= 3 && (
                    <>
                      <div className="lg:col-span-2 lg:row-span-2">
                        <HeroCard item={items[0]} />
                      </div>
                      <div className="lg:col-span-1 lg:row-span-1">
                        <VerticalCard item={items[1]} />
                      </div>
                      <div className="lg:col-span-1 lg:row-span-1">
                        <VerticalCard item={items[2]} />
                      </div>
                      {/* Flow the rest normally into the 3-column grid */}
                      {items.slice(3).map(item => (
                        <div key={item.id} className="lg:col-span-1">
                          <VerticalCard item={item} />
                        </div>
                      ))}
                    </>
                  )}

                </div>
              </div>
            );
          })}

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