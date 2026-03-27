import React from 'react';
import { ArrowLeft, Loader2, Mic } from 'lucide-react';

// Inlined to resolve preview compilation errors
const themes = {
  All: { text: 'text-gray-300', border: 'border-gray-500', hoverText: 'hover:text-white', hoverBorder: 'hover:border-gray-400', bg: 'bg-gradient-to-r from-gray-500 to-gray-700', toolsBg: 'bg-[#1a1a1a] border-gray-800' },
  Football: { text: 'text-red-500', border: 'border-red-600', hoverText: 'hover:text-red-400', hoverBorder: 'hover:border-red-500', bg: 'bg-red-600', toolsBg: 'bg-red-900/20 border-red-900/50' },
  Basketball: { text: 'text-orange-500', border: 'border-orange-500', hoverText: 'hover:text-orange-400', hoverBorder: 'hover:border-orange-500', bg: 'bg-orange-500', toolsBg: 'bg-orange-900/20 border-orange-900/50' },
  Baseball: { text: 'text-blue-500', border: 'border-blue-500', hoverText: 'hover:text-blue-400', hoverBorder: 'hover:border-blue-500', bg: 'bg-blue-500', toolsBg: 'bg-blue-900/20 border-blue-900/50' },
};

// Inlined to resolve preview compilation errors
const Sidebar = ({ activeSport }) => (
  <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 w-full">
    <div className="bg-[#1a1a1a] p-4 border border-gray-800 rounded-xl shadow-xl text-center text-gray-500 h-full min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col gap-2">
        <h4 className="font-bold uppercase tracking-widest text-[10px]">{activeSport || 'All'} Sidebar</h4>
        <p className="text-xs">Placeholder for standalone preview</p>
      </div>
    </div>
  </div>
);

export default function PodcastsArchive({ podcasts = [], activeSport = 'All', setCurrentView, setSelectedItem, loadMorePosts, isLoadingMore }) {
  const theme = themes[activeSport] || themes.All;

  // ONLY grab the Master Show categories!
  const masterSlugs = ['podcast', 'podcast-basketball', 'podcast-baseball'];
  const showPodcasts = podcasts.filter(p => p.category_slugs?.some(slug => masterSlugs.includes(slug)));

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* MAIN CONTENT */}
      <div className="lg:col-span-9 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
           <button onClick={() => setCurrentView('home')} className="hover:text-white flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-wider transition-colors"><ArrowLeft size={16}/> Back to Dashboard</button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Podcasts</h1>
            <p className="text-gray-400 mt-2 text-sm">Browse our lineup of full shows and network podcasts.</p>
          </div>
        </div>

        {/* --- MASTER SHOWS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {showPodcasts.map(master => (
            <div key={master.id} onClick={() => setSelectedItem(master)} className="bg-[#1e1e1e] border border-gray-800 rounded-2xl shadow-xl flex flex-col cursor-pointer group hover:bg-[#252525] transition-colors relative overflow-hidden">
              <div className="p-6 lg:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4 z-20 relative">
                  <Mic className={`${themes[master.sport]?.text || theme.text}`} size={18} />
                  <span className={`font-black uppercase tracking-widest ${themes[master.sport]?.text || theme.text} text-[10px]`}>Full Show Playlist</span>
                </div>
                <h3 className={`font-black text-2xl md:text-3xl leading-tight group-hover:${themes[master.sport]?.text || 'text-white'} transition-colors mb-4 drop-shadow-md z-10 relative`} dangerouslySetInnerHTML={{ __html: master.title }} />
                <div className="text-gray-400 text-sm line-clamp-4 z-10 relative" dangerouslySetInnerHTML={{ __html: master.excerpt }} />
              </div>
            </div>
          ))}
          
          {showPodcasts.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 font-bold uppercase tracking-widest border-2 border-dashed border-gray-800 rounded-2xl">
              No podcast shows found yet.
            </div>
          )}
        </div>
        
        {showPodcasts.length > 0 && (
          <button 
            onClick={loadMorePosts}
            disabled={isLoadingMore}
            className={`w-full py-4 mt-8 border border-gray-700 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] flex items-center justify-center gap-3 ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : `${theme.hoverText} ${theme.hoverBorder}`}`}
          >
            {isLoadingMore ? <><Loader2 size={18} className="animate-spin" /> Fetching Older Podcasts...</> : 'Load More Podcasts'}
          </button>
        )}
      </div>

      <Sidebar activeSport={activeSport} />
    </main>
  );
}