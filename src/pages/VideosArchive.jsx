import React from 'react';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { themes } from '../utils/theme';

export default function VideosArchive({ videos, activeSport, setCurrentView, setSelectedItem }) {
  const theme = themes[activeSport];

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </main>
  );
}