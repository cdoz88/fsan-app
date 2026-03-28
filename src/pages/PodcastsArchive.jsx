import React from 'react';
import { ArrowLeft, Loader2, Headphones } from 'lucide-react';
import { themes } from '../utils/theme';
import Sidebar from '../components/Sidebar';

const PodcastShowCard = ({ podcast, onClick, theme }) => {
  return (
    <div 
      onClick={() => onClick(podcast)} 
      className={`cursor-pointer group relative rounded-xl overflow-hidden aspect-square border border-gray-800 ${theme.hoverBorder} transition-all shadow-xl bg-[#111]`}
    >
      {podcast.imageUrl ? (
        <img 
          src={podcast.imageUrl} 
          alt={podcast.title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c233a] to-[#111] flex items-center justify-center p-4 text-center">
          <span className="font-bold text-gray-500" dangerouslySetInnerHTML={{ __html: podcast.title }} />
        </div>
      )}
      
      {/* Dark gradient overlay for text readability and hover effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* "Listen" Pill Badge Overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="bg-black/80 backdrop-blur-md border border-gray-600 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <Headphones size={16} className={theme.text} />
          <span className="text-xs font-black uppercase tracking-widest mt-0.5">Listen</span>
        </div>
      </div>
    </div>
  );
};

export default function PodcastsArchive({ podcasts = [], activeSport = 'All', setCurrentView, setSelectedItem, loadMorePosts, isLoadingMore }) {
  const theme = themes[activeSport] || themes.All;

  const masterSlugs = ['podcast', 'podcast-basketball', 'podcast-baseball'];
  const showPodcasts = podcasts.filter(p => p.spreakerShowId || p.category_slugs?.some(slug => masterSlugs.includes(slug)));

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      <div className="lg:col-span-9 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
           <button onClick={() => setCurrentView('home')} className="hover:text-white flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-wider transition-colors">
             <ArrowLeft size={16}/> Back to Dashboard
           </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>
              {activeSport === 'All' ? 'Network' : activeSport} Podcasts
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Browse our lineup of full shows and network podcasts.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {showPodcasts.map(master => (
            <PodcastShowCard 
              key={master.id} 
              podcast={master} 
              onClick={setSelectedItem} 
              theme={themes[master.sport] || theme}
            />
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