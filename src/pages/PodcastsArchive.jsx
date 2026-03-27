import React from 'react';
import { ArrowLeft, Loader2, Mic } from 'lucide-react';

const themes = {
  All: { text: 'text-gray-300', border: 'border-gray-500', hoverText: 'hover:text-white', hoverBorder: 'hover:border-gray-400', bg: 'bg-gradient-to-r from-gray-500 to-gray-700', toolsBg: 'bg-[#1a1a1a] border-gray-800' },
  Football: { text: 'text-red-500', border: 'border-red-600', hoverText: 'hover:text-red-400', hoverBorder: 'hover:border-red-500', bg: 'bg-red-600', toolsBg: 'bg-red-900/20 border-red-900/50' },
  Basketball: { text: 'text-orange-500', border: 'border-orange-500', hoverText: 'hover:text-orange-400', hoverBorder: 'hover:border-orange-500', bg: 'bg-orange-500', toolsBg: 'bg-orange-900/20 border-orange-900/50' },
  Baseball: { text: 'text-blue-500', border: 'border-blue-500', hoverText: 'hover:text-blue-400', hoverBorder: 'hover:border-blue-500', bg: 'bg-blue-500', toolsBg: 'bg-blue-900/20 border-blue-900/50' },
};

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

  // The exact slugs from your WP Categories screenshot
  const masterSlugs = ['podcast', 'podcast-basketball', 'podcast-baseball'];

  // Separate the manual "Master Playlist" posts from the future "Individual Episode" posts
  const masterPlaylists = podcasts.filter(p => p.category_slugs?.some(slug => masterSlugs.includes(slug)) && !p.spreakerId);
  const individualEpisodes = podcasts.filter(p => p.spreakerId || !p.category_slugs?.some(slug => masterSlugs.includes(slug)));

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Dynamic CSS to ensure whatever iframe you paste into WP forces itself to fill the container perfectly */}
      <style dangerouslySetInnerHTML={{__html: `
        .podcast-master-container iframe {
          width: 100% !important;
          height: 100% !important;
          min-height: 350px !important;
          border: none;
          display: block;
        }
      `}} />

      {/* MAIN CONTENT */}
      <div className="lg:col-span-9 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
           <button onClick={() => setCurrentView('home')} className="hover:text-white flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-wider transition-colors"><ArrowLeft size={16}/> Back to Dashboard</button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Podcasts</h1>
            <p className="text-gray-400 mt-2 text-sm">Listen to the full shows and latest individual episodes.</p>
          </div>
        </div>

        {/* --- MASTER SHOWS (Manual WP Posts rendered as Hero elements) --- */}
        {masterPlaylists.map(master => (
          <div key={master.id} className="mb-12 bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col xl:flex-row">
            <div onClick={() => setSelectedItem(master)} className="p-6 lg:p-10 flex flex-col flex-1 cursor-pointer group hover:bg-[#252525] transition-colors relative">
              <div className="flex items-center gap-2 mb-4 z-20 relative">
                <Mic className={`${themes[master.sport]?.text || theme.text}`} size={18} />
                <span className={`font-black uppercase tracking-widest ${themes[master.sport]?.text || theme.text} text-xs`}>Full Show Playlist</span>
              </div>
              <h3 className={`font-black text-3xl md:text-4xl leading-tight group-hover:${themes[master.sport]?.text || 'text-white'} transition-colors mb-4 drop-shadow-md z-10 relative`} dangerouslySetInnerHTML={{ __html: master.title }} />
              <div className="text-gray-400 text-sm line-clamp-4 z-10 relative" dangerouslySetInnerHTML={{ __html: master.excerpt }} />
            </div>
            
            {/* The Master Iframe Container: Simply executes the WP Post's Raw HTML (which contains your Spreaker embed code) */}
            <div className="w-full xl:w-1/2 bg-[#0a0a0a] border-t xl:border-t-0 xl:border-l border-gray-800 shrink-0 flex items-center min-h-[350px] relative podcast-master-container" dangerouslySetInnerHTML={{ __html: master.content }}>
            </div>
          </div>
        ))}

        {/* --- INDIVIDUAL EPISODES GRID --- */}
        <h3 className="font-black uppercase tracking-widest text-gray-500 text-sm mb-6">Recent Episodes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {individualEpisodes.map((podcast) => (
             <div key={podcast.id} className={`group w-full bg-[#1e1e1e] border ${themes[podcast.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[podcast.sport]?.hoverBorder || 'hover:border-gray-600'} transition-all flex flex-col relative`}>
              
              <div onClick={() => setSelectedItem(podcast)} className="p-5 lg:p-6 flex flex-col flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-3 z-20 relative">
                  <span className={`w-2 h-2 rounded-full ${themes[podcast.sport]?.bg || 'bg-gray-500'} shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.8)]`}></span>
                  <span className="text-gray-300 font-bold text-[10px] uppercase tracking-wider drop-shadow-md">{podcast.date} • By {podcast.author}</span>
                </div>
                <h3 className={`font-black text-xl leading-tight group-hover:${themes[podcast.sport]?.text || 'text-white'} transition-colors mb-3 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: podcast.title }} />
              </div>
              
              <div className="w-full bg-[#111] border-t border-gray-800 shrink-0 flex items-center">
                {podcast.spreakerId ? (
                  <iframe 
                    src={`https://widget.spreaker.com/player?episode_id=${podcast.spreakerId}&theme=dark&playlist=false&playlist-continuous=false&chapters-image=true&episode_image_position=right&hide-logo=false&hide-likes=false&hide-comments=false&hide-sharing=false&hide-download=true`} 
                    width="100%" 
                    height="200px"
                    frameBorder="0" 
                    allow="autoplay; picture-in-picture"
                  ></iframe>
                ) : (
                   <div className="w-full h-[200px] flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs">Audio Unavailable</div>
                )}
              </div>
            </div>
          ))}
          {individualEpisodes.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 font-bold uppercase tracking-widest">No individual episodes found yet.</div>
          )}
        </div>
        
        {individualEpisodes.length > 0 && (
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