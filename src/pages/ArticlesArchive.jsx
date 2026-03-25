import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { themes } from '../utils/theme';

export default function ArticlesArchive({ articles, activeSport, setCurrentView, setSelectedItem }) {
  const theme = themes[activeSport];

  return (
    <main className="max-w-[1200px] mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 mb-6">
         <button onClick={() => setCurrentView('home')} className="hover:text-white flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-wider transition-colors"><ArrowLeft size={16}/> Back to Dashboard</button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
        <div>
          <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Articles</h1>
          <p className="text-gray-400 mt-2 text-sm">Read the latest analysis, rankings updates, and news.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <div key={article.id} onClick={() => setSelectedItem(article)} className="group cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row gap-6 hover:border-gray-500 transition-all shadow-md">
            <div className="w-full sm:w-64 h-40 bg-gray-800 rounded-md shrink-0 relative overflow-hidden">
              {article.imageUrl && <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all transform group-hover:scale-105" />}
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
      </div>
    </main>
  );
}