import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { themes } from '../utils/theme';
import Sidebar from '../components/Sidebar';

// --- NEW: Dynamic Spreaker Card Component ---
const PodcastShowCard = ({ podcast, onClick }) => {
  const [spreakerData, setSpreakerData] = useState(null);

  useEffect(() => {
    // Fetch rich data directly from Spreaker using the ID from your REST API
    if (podcast.spreakerShowId) {
      fetch(`https://api.spreaker.com/v2/shows/${podcast.spreakerShowId}`)
        .then(res => res.json())
        .then(data => {
          if (data.response && data.response.show) {
            setSpreakerData(data.response.show);
          }
        })
        .catch(console.error);
    }
  }, [podcast.spreakerShowId]);

  // Override WordPress data with Spreaker data if available
  const title = spreakerData?.title || podcast.title;
  const imageUrl = spreakerData?.image_original_url || podcast.imageUrl;
  
  let description = podcast.content;
  if (spreakerData?.description) {
    // Format plain text newlines into HTML breaks for the ContentModal
    description = spreakerData.description.replace(/(?:\r\n|\r|\n)/g, '<br/>');
  }

  const handleCardClick = () => {
    // Pass the enriched data to your existing ContentModal!
    onClick({
      ...podcast,
      title: title,
      content: description,
      imageUrl: imageUrl,
    });
  };

  return (
    <div 
      onClick={handleCardClick} 
      className="cursor-pointer group relative rounded-xl overflow-hidden aspect-square border border-gray-800 hover:border-gray-500 transition-all shadow-xl bg-[#111]"
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c233a] to-[#111] flex items-center justify-center p-4 text-center">
          <span className="font-bold text-gray-500">{title}</span>
        </div>
      )}
      {/* Subtle overlay on hover to indicate clickability */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
    </div>
  );
};

export default function PodcastsArchive({ podcasts = [], activeSport = 'All', setCurrentView, setSelectedItem, loadMorePosts, isLoadingMore }) {
  const theme = themes[activeSport] || themes.All;

  // Filter for Master Shows using your category slugs or spreakerShowId
  const masterSlugs = ['podcast', 'podcast-basketball', 'podcast-baseball'];
  const showPodcasts = podcasts.filter(p => p.spreakerShowId || p.category_slugs?.some(slug => masterSlugs.includes(slug)));

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* MAIN CONTENT */}
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

        {/* --- 1:1 MASTER SHOWS GRID --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {showPodcasts.map(master => (
            <PodcastShowCard 
              key={master.id} 
              podcast={master} 
              onClick={setSelectedItem} 
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