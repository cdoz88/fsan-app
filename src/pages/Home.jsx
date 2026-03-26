import React, { useState } from 'react';
import { PlayCircle, FileText, Film } from 'lucide-react';
import { themes } from '../utils/theme';
import Sidebar from '../components/Sidebar';

export default function Home({ videos, articles, activeSport, setActiveSport, setCurrentView, setSelectedItem }) {
  const theme = themes[activeSport];
  const [feedFilter, setFeedFilter] = useState('all'); // 'all', 'articles', 'videos'

  // Combine both arrays and sort them by the exact millisecond they were published!
  let feed = [...videos, ...articles].sort((a, b) => b.rawTimestamp - a.rawTimestamp);

  // Apply the local feed filter
  if (feedFilter === 'articles') feed = feed.filter(item => item.type === 'article');
  if (feedFilter === 'videos') feed = feed.filter(item => item.type === 'video');

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
      
      {/* LEFT SPACER (Keeps the feed centered on massive screens, like Twitter does) */}
      <div className="hidden lg:block lg:col-span-2"></div>

      {/* CENTER COLUMN: THE UNIFIED TIMELINE */}
      <div className="lg:col-span-7 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        
        {/* App-like Feed Filter Toggle */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-1.5 flex gap-2 sticky top-4 z-30 shadow-2xl backdrop-blur-md bg-opacity-90">
          <button 
            onClick={() => setFeedFilter('all')} 
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${feedFilter === 'all' ? `${theme.bg} text-white shadow-md` : 'text-gray-500 hover:text-white'}`}
          >
            Latest Feed
          </button>
          <button 
            onClick={() => setFeedFilter('articles')} 
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'articles' ? 'bg-[#252525] text-white shadow-md border border-gray-700' : 'text-gray-500 hover:text-white'}`}
          >
            <FileText size={14} /> Articles
          </button>
          <button 
            onClick={() => setFeedFilter('videos')} 
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${feedFilter === 'videos' ? 'bg-[#252525] text-white shadow-md border border-gray-700' : 'text-gray-500 hover:text-white'}`}
          >
            <Film size={14} /> Videos
          </button>
        </div>

        {/* The Timeline Feed */}
        <div className="flex flex-col gap-6">
          {feed.map((item) => {
            
            // --- VIDEO CARD LAYOUT ---
            if (item.type === 'video') {
              return (
                <div key={item.id} onClick={() => setSelectedItem(item)} className="group cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-gray-600 transition-all flex flex-col">
                  <div className="aspect-video bg-gradient-to-tr from-[#1c233a] to-[#111] relative flex items-center justify-center overflow-hidden">
                     {item.imageUrl && <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />}
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                     <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 group-hover:bg-red-600 transition-colors">
                       <PlayCircle size={32} className="text-white ml-1" />
                     </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-red-900/30 text-red-500 border border-red-900/50 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Video</span>
                      <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">{item.date}</span>
                    </div>
                    <h3 className={`font-black text-xl leading-tight group-hover:${theme.text} transition-colors`} dangerouslySetInnerHTML={{ __html: item.title }} />
                  </div>
                </div>
              );
            }

            // --- ARTICLE CARD LAYOUT ---
            return (
              <div key={item.id} onClick={() => setSelectedItem(item)} className="group cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-gray-600 transition-all flex flex-col sm:flex-row">
                <div className="w-full sm:w-2/5 aspect-video sm:aspect-auto bg-gray-800 relative overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-[#111]"></div>
                  )}
                </div>
                <div className="p-5 flex flex-col justify-center flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {activeSport === 'All' && <span className={`w-2 h-2 rounded-full ${themes[item.sport].bg} shrink-0`}></span>}
                    <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">{item.date} • By {item.author}</span>
                  </div>
                  <h3 className={`font-black text-xl mb-2 leading-tight group-hover:${theme.text} transition-colors`} dangerouslySetInnerHTML={{ __html: item.title }} />
                  <div className="text-sm text-gray-400 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
                </div>
              </div>
            );

          })}
          
          {feed.length === 0 && (
            <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-xl">
              No content found for this filter.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: SMART SIDEBAR (Sticky so it stays visible while scrolling the feed) */}
      <div className="hidden lg:block lg:col-span-3">
        <div className="sticky top-4">
          <Sidebar activeSport={activeSport} />
        </div>
      </div>

    </main>
  );
}