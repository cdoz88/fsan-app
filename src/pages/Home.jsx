import React, { useState } from 'react';
import { PlayCircle, FileText, Film, Mic, Wrench, ChevronRight, LayoutList } from 'lucide-react';
import { Facebook, XIcon, Youtube, Instagram, TikTok, LinkedIn, SelloutCrowds } from '../components/Icons';
import { themes } from '../utils/theme';

export default function Home({ videos, articles, activeSport, setActiveSport, currentView = 'home', setCurrentView, setSelectedItem }) {
  const theme = themes[activeSport];
  const [feedFilter, setFeedFilter] = useState('all');

  // Dynamic social links dictionary
  const socialLinks = {
    All: {
      facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork',
      x: 'https://x.com/fsadvicenet',
      youtube: 'https://www.youtube.com/@FFAdviceNet',
      tiktok: 'https://www.tiktok.com/@fsadvicenetwork',
      linkedin: 'https://www.linkedin.com/company/fantasy-sports-advice',
      sellout: 'https://www.selloutcrowds.com/crowd/fsan',
      instagram: null
    },
    Football: {
      facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork',
      x: 'https://x.com/FFAdviceNet',
      youtube: 'https://www.youtube.com/@FFAdviceNet',
      instagram: 'https://www.instagram.com/ffadvicenet/',
      sellout: '#',
      tiktok: null,
      linkedin: null
    },
    Basketball: {
      facebook: null,
      x: 'https://x.com/FBBAdviceNet',
      youtube: 'https://www.youtube.com/@FBBAdviceNet',
      instagram: 'https://www.instagram.com/fbkadvicenet/',
      sellout: '#',
      tiktok: null,
      linkedin: null
    },
    Baseball: {
      facebook: null,
      x: 'https://x.com/FBAdviceNet',
      youtube: 'https://www.youtube.com/@FBAdviceNet',
      instagram: 'https://www.instagram.com/fbadvicenet/',
      sellout: '#',
      tiktok: null,
      linkedin: null
    },
  };
  const currentLinks = socialLinks[activeSport];

  // 1. Calculate the timestamp for exactly 8 days ago
  const eightDaysAgo = new Date().getTime() - (8 * 24 * 60 * 60 * 1000);

  // 2. Combine, filter out anything older than 8 days, and sort chronologically
  let filteredFeed = [...videos, ...articles]
    .filter(item => item.rawTimestamp >= eightDaysAgo)
    .sort((a, b) => b.rawTimestamp - a.rawTimestamp);

  if (feedFilter === 'articles') filteredFeed = filteredFeed.filter(item => item.type === 'article');
  if (feedFilter === 'videos') filteredFeed = filteredFeed.filter(item => item.type === 'video');

  const groupedFeed = [];
  filteredFeed.forEach(item => {
    let group = groupedFeed.find(g => g.date === item.date);
    if (!group) {
      group = { date: item.date, items: [] };
      groupedFeed.push(group);
    }
    group.items.push(item);
  });

  const PromoRookieGuide = () => (
    <div className="w-full bg-gradient-to-r from-red-900 to-black border border-red-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-xl mt-2 mb-6">
       <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]"></div>
       <div className="relative z-10 mb-6 md:mb-0 text-center md:text-left">
         <h3 className="text-red-500 font-black text-3xl md:text-4xl italic tracking-tighter uppercase drop-shadow-md mb-1">Dominate</h3>
         <p className="text-white text-sm font-bold uppercase tracking-widest">Your Draft With The Ultimate Rookie Breakdown!</p>
       </div>
       <button className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-wider transform transition hover:scale-105 shadow-lg relative z-10 shrink-0">
         Only $10 - Get Access
       </button>
    </div>
  );

  const PromoSelloutCrowds = () => (
    <div className="w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/40 via-[#111] to-black border border-red-900/50 rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-2xl mt-2 mb-6">
       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')", mixBlendMode: 'overlay' }}></div>
       
       <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tight mb-3 relative z-10 drop-shadow-lg">Join Sellout Crowds</h2>
       <p className="text-gray-300 font-bold md:text-xl tracking-wide mb-8 relative z-10">Win Your League with Real-Time Advice!</p>
       <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-lg font-black uppercase tracking-wider transition-transform hover:scale-105 shadow-lg relative z-10 flex items-center gap-2">
          Join the Community <ChevronRight size={18} />
       </button>
    </div>
  );

  const PromoMerch = () => (
    <div className="w-full bg-[#111] border border-purple-900/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-600 transition-all group overflow-hidden relative mt-2 mb-6 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-black z-0 transition-opacity group-hover:opacity-80"></div>
      <h3 className="text-purple-500 font-black text-2xl italic uppercase z-10 group-hover:scale-110 transition-transform">Fantasy Apparel</h3>
      <p className="text-gray-400 text-sm font-bold tracking-widest z-10 mt-2">FSAN.SHOP</p>
      <button className="mt-6 bg-transparent border-2 border-purple-600 text-purple-400 px-8 py-2 rounded-full text-xs font-black uppercase tracking-wider hover:bg-purple-600 hover:text-white transition-colors z-10">
        Shop Now
      </button>
    </div>
  );

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
      
      {/* LEFT COLUMN: STICKY DASHBOARD MENU */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">
        <div className="sticky top-6 flex flex-col gap-6">
          
          {/* Submenu: Content */}
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

          {/* Submenu: Pro Tools */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-4 shadow-xl">
             <h4 className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-4 px-2">Pro Tools</h4>
             <div className="flex flex-col gap-1">
                {['Trade Analyzer', 'Dynasty Rankings', 'Rookie Mock Draft', 'Start / Sit Optimizer', 'DFS Projections'].map(tool => (
                  <a href="#" key={tool} className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white transition-colors p-2.5 hover:bg-gray-800/50 rounded-xl">
                    <Wrench size={18} className={theme.text} /> {tool}
                  </a>
                ))}
             </div>
          </div>

          {/* Social Links & Footer */}
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

      {/* CENTER & RIGHT: THE UNIFIED TIMELINE BUNDLES */}
      <div className="lg:col-span-9 flex flex-col gap-8 w-full max-w-5xl">
        
        {/* App-like Feed Filter Toggle */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-1.5 flex gap-2 shadow-xl z-30">
          <button 
            onClick={() => setFeedFilter('all')} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${feedFilter === 'all' ? `${theme.bg} text-white shadow-md` : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}
          >
            Latest Feed
          </button>
          <button 
            onClick={() => setFeedFilter('articles')} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'articles' ? 'bg-[#252525] text-white shadow-md border border-gray-700' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}
          >
            <FileText size={14} /> Articles
          </button>
          <button 
            onClick={() => setFeedFilter('videos')} 
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'videos' ? 'bg-[#252525] text-white shadow-md border border-gray-700' : 'text-gray-500 hover:text-white hover:bg-gray-800/50'}`}
          >
            <Film size={14} /> Videos
          </button>
        </div>

        {/* The Chronological Bundles */}
        <div className="flex flex-col gap-10">
          {groupedFeed.map((group, groupIndex) => (
            <div key={group.date} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Date Bundle Header */}
              <div className="flex items-center gap-4">
                <div className={`h-px flex-1 ${theme.bg} opacity-50`}></div>
                <span className={`font-black uppercase tracking-widest text-lg md:text-xl drop-shadow-md ${theme.text}`}>
                  {group.date}
                </span>
                <div className={`h-px flex-[5] ${theme.bg} opacity-50`}></div>
              </div>

              {/* Grid of items for this specific date */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {group.items.map((item, itemIndex) => {
                  
                  // FEATURED HERO LOGIC: The very first article of a busy day spans 2 columns!
                  const isHero = itemIndex === 0 && item.type === 'article' && group.items.length >= 3;

                  return (
                    <div key={item.id} onClick={() => setSelectedItem(item)} className={`group cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-gray-600 transition-all flex flex-col ${isHero ? 'md:col-span-2 xl:col-span-2' : 'col-span-1'}`}>
                      
                      {/* Media Area */}
                      <div className={`w-full aspect-video bg-gradient-to-tr from-[#1c233a] to-[#111] relative flex items-center justify-center overflow-hidden shrink-0`}>
                        {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />}
                        {item.type === 'video' && (
                           <>
                             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                             <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 group-hover:bg-red-600 transition-colors shadow-lg">
                               <PlayCircle size={32} className="text-white ml-1" />
                             </div>
                           </>
                        )}
                      </div>
                      
                      {/* Content Area */}
                      <div className="p-5 flex flex-col justify-center flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#161616]">
                        <div className="flex items-center gap-2 mb-3">
                          {item.type === 'video' ? (
                             <span className="bg-red-900/30 text-red-500 border border-red-900/50 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Video</span>
                          ) : (
                             <span className={`w-2 h-2 rounded-full ${themes[item.sport].bg} shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.3)]`}></span>
                          )}
                          <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                            {item.type === 'article' ? `By ${item.author}` : item.sport}
                          </span>
                        </div>
                        <h3 className={`font-black ${isHero ? 'text-2xl md:text-3xl' : 'text-lg'} leading-tight group-hover:${theme.text} transition-colors mb-3`} dangerouslySetInnerHTML={{ __html: item.title }} />
                        
                        {item.type === 'article' && (
                           <div className={`text-sm text-gray-400 leading-relaxed mt-auto ${isHero ? 'line-clamp-3' : 'line-clamp-2'}`} dangerouslySetInnerHTML={{ __html: item.excerpt }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DYNAMIC IN-FEED ADS: Inject promos directly between the daily bundles! */}
              {groupIndex === 0 && <PromoRookieGuide />}
              {groupIndex === 1 && <PromoSelloutCrowds />}
              {groupIndex === 2 && <PromoMerch />}
              
            </div>
          ))}

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