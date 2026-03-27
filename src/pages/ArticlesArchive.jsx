import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { themes } from '../utils/theme';
import Sidebar from '../components/Sidebar';

export default function ArticlesArchive({ articles, activeSport, setCurrentView, setSelectedItem, loadMorePosts, isLoadingMore }) {
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
            <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Articles</h1>
            <p className="text-gray-400 mt-2 text-sm">Read the latest analysis, rankings updates, and news.</p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button className={`px-4 py-1.5 rounded-full bg-[#1e1e1e] border ${theme.border} ${theme.text} text-[10px] font-bold uppercase whitespace-nowrap`}>All Articles</button>
            <button className="px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-500 text-[10px] font-bold uppercase whitespace-nowrap transition-colors">News</button>
            <button className="px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-500 text-[10px] font-bold uppercase whitespace-nowrap transition-colors">Rankings</button>
            <button className="px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-500 text-[10px] font-bold uppercase whitespace-nowrap transition-colors">Dynasty</button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <div key={article.id} onClick={() => setSelectedItem(article)} className={`group cursor-pointer bg-[#1e1e1e] border ${themes[article.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-lg p-4 flex flex-col sm:flex-row gap-6 ${themes[article.sport]?.hoverBorder || 'hover:border-gray-500'} transition-all shadow-md`}>
              <div className="w-full sm:w-64 h-40 bg-gray-800 rounded-md shrink-0 relative overflow-hidden">
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all transform group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black"></div>
                )}
              </div>
              
              <div className="flex flex-col justify-center py-2 flex-1">
                <div className="flex gap-2 items-center mb-2">
                  {activeSport === 'All' && <span className={`w-2 h-2 rounded-full ${themes[article.sport].bg} shrink-0`}></span>}
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{article.date} • By {article.author}</span>
                </div>
                <h3 className={`font-black text-2xl mb-3 leading-tight group-hover:${themes[article.sport].text} transition-colors`} dangerouslySetInnerHTML={{ __html: article.title }} />
                <div className="text-sm text-gray-400 line-clamp-3" dangerouslySetInnerHTML={{ __html: article.excerpt }} />
              </div>
            </div>
          ))}
          {articles.length === 0 && (
            <div className="py-12 text-center text-gray-500 font-bold uppercase tracking-widest">No articles found for this sport yet.</div>
          )}
        </div>
        
        {articles.length > 0 && (
          <button 
            onClick={loadMorePosts}
            disabled={isLoadingMore}
            className={`w-full py-4 mt-8 border border-gray-700 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] flex items-center justify-center gap-3 ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : `${theme.hoverText} ${theme.hoverBorder}`}`}
          >
            {isLoadingMore ? <><Loader2 size={18} className="animate-spin" /> Fetching Older Articles...</> : 'Load Older Articles'}
          </button>
        )}
      </div>

      {/* DYNAMIC SMART SIDEBAR */}
      <Sidebar activeSport={activeSport} />

    </main>
  );
}