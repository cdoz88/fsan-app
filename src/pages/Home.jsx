import React from 'react';
import { PlayCircle } from 'lucide-react';
import { themes } from '../utils/theme';
import Sidebar from '../components/Sidebar';

export default function Home({ videos, articles, activeSport, setActiveSport, setCurrentView, setSelectedItem }) {
  const theme = themes[activeSport];

  return (
    <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
      
      {/* LEFT COLUMN: VIDEOS */}
      <div className="md:col-span-1 lg:col-span-3 flex flex-col gap-4">
        <div className={`bg-[#1a1a1a] p-3 border-b-2 ${theme.border} font-bold uppercase tracking-wider text-sm shadow-md transition-colors duration-300`}>
          Latest Videos
        </div>
      
        <div className="flex flex-col gap-4">
          {videos.slice(0, 8).map((video) => (
            <div key={video.id} onClick={() => setSelectedItem(video)} className="group cursor-pointer relative rounded overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg hover:border-gray-500 transition-all">
              <div className="h-40 bg-gradient-to-tr from-[#1c233a] to-[#111] relative flex items-center justify-center overflow-hidden">
                 {video.imageUrl && <img src={video.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />}
                 <PlayCircle size={48} className="text-white/60 group-hover:text-white transition-all transform group-hover:scale-110 z-10 relative" />
              </div>
              <div className="p-3 relative z-10 bg-[#1e1e1e]">
                <span className="text-gray-400 font-bold text-xs flex items-center">
                  {activeSport === 'All' && <span className={`w-2 h-2 rounded-full ${themes[video.sport].bg} mr-2 shrink-0`}></span>}
                  {video.date}
                </span>
                <h3 className={`font-bold text-sm mt-1 leading-tight group-hover:${themes[video.sport].text} transition-colors`} dangerouslySetInnerHTML={{ __html: video.title }} />
              </div>
            </div>
          ))}

          {activeSport === 'All' ? (
            <div className="mt-2 p-3 bg-[#161616] border border-gray-800 rounded-lg flex flex-col items-center gap-3">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">View All Videos By Sport</span>
              <div className="flex gap-2 w-full">
                <button onClick={() => { setActiveSport('Football'); setCurrentView('videos'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-red-900/20 hover:text-red-500 hover:border-red-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NFL</button>
                <button onClick={() => { setActiveSport('Basketball'); setCurrentView('videos'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-orange-900/20 hover:text-orange-500 hover:border-orange-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NBA</button>
                <button onClick={() => { setActiveSport('Baseball'); setCurrentView('videos'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-blue-900/20 hover:text-blue-500 hover:border-blue-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">MLB</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setCurrentView('videos')} className={`w-full py-3 mt-2 border border-gray-700 rounded text-xs font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] ${theme.hoverText} ${theme.hoverBorder}`}>
              View All {activeSport} Videos
            </button>
          )}
        </div>
      </div>

      {/* CENTER COLUMN: ARTICLES */}
      <div className="md:col-span-2 lg:col-span-6 flex flex-col gap-4">
        <div className={`bg-[#1a1a1a] p-3 border-b-2 ${theme.border} font-bold uppercase tracking-wider text-sm shadow-md flex justify-between items-center transition-colors duration-300`}>
          <span>Latest Articles</span>
        </div>

        {articles.length > 0 && (
          <div onClick={() => setSelectedItem(articles[0])} className="group cursor-pointer rounded-lg overflow-hidden bg-[#1e1e1e] shadow-xl border border-gray-800 hover:border-gray-600 transition-all relative">
            <div className="h-[400px] w-full bg-gradient-to-b from-[#2a3044] to-[#0a0a0a] flex flex-col justify-end p-6 relative overflow-hidden">
               {articles[0].imageUrl ? (
                 <img src={articles[0].imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-30 transition-all transform group-hover:scale-105" />
               ) : (
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-gray-900 to-black"></div>
               )}
               <div className="relative z-10 bg-gradient-to-t from-black via-black/80 to-transparent p-4 -mx-6 -mb-6 mt-12">
                 <div className="flex items-center gap-2 mb-2">
                   {activeSport === 'All' && <span className={`w-2 h-2 rounded-full ${themes[articles[0].sport].bg} shrink-0`}></span>}
                   <span className="text-gray-400 font-bold text-xs">{articles[0].date}</span>
                 </div>
                 <h2 className={`text-3xl font-bold text-white mb-2 leading-tight group-hover:${themes[articles[0].sport].text} transition-colors`} dangerouslySetInnerHTML={{ __html: articles[0].title }} />
                 <div className="text-sm text-gray-300 line-clamp-2" dangerouslySetInnerHTML={{ __html: articles[0].excerpt }} />
               </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {articles.slice(1, 5).map((article) => (
            <div key={article.id} onClick={() => setSelectedItem(article)} className="group cursor-pointer rounded overflow-hidden bg-[#1e1e1e] shadow-lg border border-gray-800 flex flex-row h-32 hover:bg-[#252525] transition-colors relative">
              <div className={`w-1/3 relative overflow-hidden bg-gray-800`}>
                {article.imageUrl ? (
                  <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br from-gray-700 to-[#111]`}></div>
                )}
              </div>
              <div className="w-2/3 p-3 flex flex-col justify-center">
                 <div className="flex items-center gap-1.5 mb-1">
                   {activeSport === 'All' && <span className={`w-1.5 h-1.5 rounded-full ${themes[article.sport].bg} shrink-0`}></span>}
                   <span className="text-gray-400 font-bold text-[10px]">{article.date}</span>
                 </div>
                 <h3 className={`font-bold text-sm leading-tight group-hover:${themes[article.sport].text} transition-colors`} dangerouslySetInnerHTML={{ __html: article.title }} />
              </div>
            </div>
          ))}
        </div>

        {articles.length > 5 && (
          <div className="mt-6 flex flex-col gap-4">
            <div className={`bg-[#1a1a1a] p-3 border-b-2 ${theme.border} font-bold uppercase tracking-wider text-sm shadow-md transition-colors duration-300`}>
              More Articles
            </div>

            {articles.slice(5, 15).map((article) => (
              <div key={article.id} onClick={() => setSelectedItem(article)} className="group cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded p-3 flex gap-4 hover:border-gray-600 transition-all shadow-sm relative overflow-hidden">
                <div className="w-32 h-24 bg-gray-800 rounded shrink-0 relative overflow-hidden border border-gray-800">
                  {article.imageUrl ? (
                    <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black"></div>
                  )}
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <div className="flex gap-2 items-center mb-1.5">
                    {activeSport === 'All' && <span className={`w-2 h-2 rounded-full ${themes[article.sport].bg} shrink-0`}></span>}
                    <span className="text-gray-500 text-[10px] font-bold">{article.date}</span>
                  </div>
                  <h3 className={`font-bold text-base mb-1.5 leading-tight group-hover:${themes[article.sport].text} transition-colors`} dangerouslySetInnerHTML={{ __html: article.title }} />
                  <div className="text-xs text-gray-400 line-clamp-2" dangerouslySetInnerHTML={{ __html: article.excerpt }} />
                </div>
              </div>
            ))}
            
            {activeSport === 'All' ? (
              <div className="mt-2 p-3 bg-[#161616] border border-gray-800 rounded-lg flex flex-col items-center gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Load More Articles</span>
                <div className="flex gap-2 w-full">
                  <button onClick={() => { setActiveSport('Football'); setCurrentView('articles'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-red-900/20 hover:text-red-500 hover:border-red-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NFL Articles</button>
                  <button onClick={() => { setActiveSport('Basketball'); setCurrentView('articles'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-orange-900/20 hover:text-orange-500 hover:border-orange-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NBA Articles</button>
                  <button onClick={() => { setActiveSport('Baseball'); setCurrentView('articles'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-blue-900/20 hover:text-blue-500 hover:border-blue-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">MLB Articles</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setCurrentView('articles')} className={`w-full py-3 mt-2 border border-gray-700 rounded text-xs font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] ${theme.hoverText} ${theme.hoverBorder}`}>
                Load More {activeSport} Articles
              </button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: DYNAMIC SMART SIDEBAR */}
      <Sidebar activeSport={activeSport} />

    </main>
  );
}