import React from 'react';
import { X, PlayCircle, ArrowLeft } from 'lucide-react';
import { Facebook, XIcon } from './Icons';
import { themes } from '../utils/theme';

export default function ContentModal({ selectedItem, setSelectedItem, videos }) {
  if (!selectedItem) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-sm flex justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="fixed inset-0" onClick={() => setSelectedItem(null)}></div>
      
      <button onClick={() => setSelectedItem(null)} className="fixed top-6 right-6 z-50 p-2 bg-[#1a1a1a] border border-gray-700 hover:bg-red-600 hover:border-red-600 rounded-full text-white transition-all shadow-xl">
        <X size={24} />
      </button>

      <div className={`relative z-10 w-full animate-in fade-in zoom-in-95 duration-200 ${selectedItem.type === 'video' ? 'max-w-6xl' : 'max-w-4xl'} my-auto bg-[#121212] border border-gray-800 rounded-xl shadow-2xl overflow-hidden`}>
        
        {selectedItem.type === 'video' && (
          <div className="flex flex-col lg:flex-row h-full max-h-[85vh]">
            <div className="lg:w-3/4 flex flex-col bg-black">
              <div className="w-full aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative border-b border-gray-800 overflow-hidden">
                 {selectedItem.youtubeId ? (
                   <iframe src={`https://www.youtube.com/embed/${selectedItem.youtubeId}?autoplay=1`} className="absolute inset-0 w-full h-full" frameBorder="0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
                 ) : (
                   <>
                     {selectedItem.imageUrl && <img src={selectedItem.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" alt="" />}
                     <PlayCircle size={64} className="text-white/80 z-10 hover:scale-110 transition-transform cursor-pointer" />
                   </>
                 )}
              </div>
              <div className="p-6 bg-[#121212] flex-1 overflow-y-auto">
                <div className="flex gap-2 items-center mb-2">
                  <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport].bg}`}></span>
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">{selectedItem.sport} • {selectedItem.date}</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
                <div className="text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
              </div>
            </div>
            
            <div className="lg:w-1/4 bg-[#161616] border-l border-gray-800 flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-gray-800 font-bold text-sm uppercase tracking-wider">Up Next</div>
              <div className="overflow-y-auto p-4 flex flex-col gap-4">
                {videos.filter(v => v.id !== selectedItem.id).slice(0,5).map(v => (
                  <div key={v.id} onClick={() => setSelectedItem(v)} className="flex gap-3 group cursor-pointer">
                    <div className="w-24 h-16 bg-gray-800 rounded shrink-0 relative flex items-center justify-center overflow-hidden">
                      {v.imageUrl && <img src={v.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />}
                      <PlayCircle size={16} className="text-white/50 z-10" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className={`text-xs font-bold leading-tight group-hover:${themes[v.sport].text} line-clamp-2`} dangerouslySetInnerHTML={{ __html: v.title }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedItem.type === 'article' && (
          <div className="flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="w-full h-64 md:h-96 bg-gray-800 relative overflow-hidden">
              {selectedItem.imageUrl && <img src={selectedItem.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
            </div>
            
            <div className="p-6 md:p-10 -mt-24 relative z-10 max-w-4xl mx-auto w-full">
              <div className="flex gap-2 items-center mb-3">
                <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport].bg}`}></span>
                <span className="text-gray-300 font-bold text-xs uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-gray-700">
                  {selectedItem.sport} • {selectedItem.date}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight drop-shadow-lg" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
              
              <div className="flex items-center gap-4 border-b border-gray-800 pb-6 mb-8 bg-[#121212]/80 p-4 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center font-bold text-gray-400">
                  {selectedItem.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm">{selectedItem.author}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors"><XIcon size={14} /></button>
                  <button className="w-8 h-8 rounded-full bg-[#4267B2]/10 text-[#4267B2] flex items-center justify-center hover:bg-[#4267B2] hover:text-white transition-colors"><Facebook size={14} /></button>
                </div>
              </div>

              <div className={`prose prose-invert prose-lg max-w-none text-gray-300 space-y-6 prose-a:${themes[selectedItem.sport].text} hover:prose-a:text-white`} dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
              
              <div className="mt-12 pt-8 border-t border-gray-800">
                <a href={selectedItem.link} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-white flex items-center gap-2">
                  View Original Post on WordPress <ArrowLeft size={12} className="rotate-135" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}