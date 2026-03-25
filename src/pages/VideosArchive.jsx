import React from 'react';
import { ArrowLeft, PlayCircle, Loader2 } from 'lucide-react';
import { themes } from '../utils/theme';
import Sidebar from '../components/Sidebar';

export default function VideosArchive({ videos, activeSport, setCurrentView, setSelectedItem, loadMorePosts, isLoadingMore }) {
  const theme = themes[activeSport];

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* MAIN CONTENT (Takes up 9 of the 12 columns on desktop) */}
      <div className="lg:col-span-9 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
           <button onClick={() => setCurrentView('home')} className="hover:text-white flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-wider transition-colors"><ArrowLeft size={16}/> Back to Dashboard</button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Videos</h1>
            <p className="text-gray-400 mt-2 text-sm">Browse the latest video breakdowns, mock drafts, and podcasts.</p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button className={`px-4 py-1.5 rounded-full bg-[#1e1e1e] border ${theme.border} ${theme.text} text-[10px] font-bold uppercase whitespace-nowrap`}>Latest</button>
            <button className="px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-500 text-[10px] font-bold uppercase whitespace-nowrap transition-colors">Trending</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} onClick={() => setSelectedItem(video)} className="group cursor-pointer relative rounded-lg overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg hover:border-gray-500 transition-all flex flex-col h-full">
              <div className="aspect-video bg-gradient-to-tr from-[#1c233a] to-[#111] relative flex items-center justify-center overflow-hidden">
                 {video.imageUrl && <img src={video.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />}
                 <PlayCircle size={48} className="text-white/60 group-hover:text-white group-hover:scale-110 transition-all z-10 relative" />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  {activeSport === 'All' && <span className={`w-2 h-2 rounded-full ${themes[video.sport].bg} shrink-0`}></span>}
                  <span className="text-gray-400 font-bold text-[10px]">{video.date}</span>
                </div>
                <h3 className={`font-bold text-base leading-tight group-hover:${themes[video.sport].text} transition-colors mb-2`} dangerouslySetInnerHTML={{ __html: video.title }} />
              </div>
            </div>
          ))}
          {videos.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 font-bold uppercase tracking-widest">No videos found for this sport yet.</div>
          )}
        </div>
        
        {videos.length > 0 && (
          <button 
            onClick={loadMorePosts}
            disabled={isLoadingMore}
            className={`w-full py-4 mt-8 border border-gray-700 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] flex items-center justify-center gap-3 ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : `${theme.hoverText} ${theme.hoverBorder}`}`}
          >
            {isLoadingMore ? <><Loader2 size={18} className="animate-spin" /> Fetching Older Videos...</> : 'Load More Videos'}
          </button>
        )}
      </div>

      {/* DYNAMIC SMART SIDEBAR */}
      <Sidebar activeSport={activeSport} />

    </main>
  );
}