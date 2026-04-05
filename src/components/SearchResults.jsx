"use client";
import React from 'react';
import { PlayCircle, FileText, Zap } from 'lucide-react';
import { themes } from '../utils/theme';

export default function SearchResults({ results, activeSport, setSelectedItem, searchQuery }) {
  const theme = themes[activeSport] || themes.All;

  return (
    <div className="flex flex-col w-full pt-6 pb-16 animate-in fade-in duration-300">
       <div className="mb-8 pb-4 border-b border-gray-800">
         <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>Search Results</h1>
         <p className="text-gray-400 mt-2 text-sm">Showing results for <span className="text-white">"{searchQuery}"</span></p>
       </div>
       
       {results.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest bg-[#1a1a1a] rounded-2xl border border-gray-800 shadow-xl">
             No articles or videos found.<br/><br/>
             <span className="text-xs">Tip: To find a specific player, search for their exact name (e.g. "Jalen Hurts")</span>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {results.map(item => {
              const itemTheme = themes[item.sport] || themes.All;
              return (
                <div key={item.id} onClick={() => setSelectedItem(item)} className={`group relative w-full h-[250px] cursor-pointer bg-[#111] border ${itemTheme.border} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${itemTheme.hoverBorder} transition-all`}>
                  {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" /> : <div className="absolute inset-0 bg-gray-900" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
                  
                  {item.type === 'video' && <PlayCircle size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-20 drop-shadow-lg" />}
                  
                  <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-white/10 flex items-center gap-1.5 z-20">
                    {item.type === 'video' || item.type === 'short' ? <PlayCircle size={12} className="text-white" /> : <FileText size={12} className="text-white" />}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white">{item.type}</span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${itemTheme.bg}`}></span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{item.date}</span>
                    </div>
                    <h3 className={`font-black text-lg text-white leading-tight group-hover:${itemTheme.text} transition-colors line-clamp-2 drop-shadow-lg`} dangerouslySetInnerHTML={{ __html: item.title }} />
                  </div>
                </div>
              )
            })}
          </div>
       )}
    </div>
  );
}