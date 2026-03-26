import React, { useState } from 'react';
import { X, PlayCircle, ArrowLeft, Link as LinkIcon, Check } from 'lucide-react';
import { Facebook, XIcon, Reddit } from './Icons';
import { themes } from '../utils/theme';

// --- REUSABLE SHARE BUTTONS COMPONENT ---
const ShareButtons = ({ handleShare, handleCopy, copied, btnSize = "w-8 h-8", iconSize = 14 }) => (
  <div className="flex gap-2">
    <button onClick={() => handleShare('facebook')} className={`${btnSize} rounded-full bg-[#4267B2]/10 text-[#4267B2] flex items-center justify-center hover:bg-[#4267B2] hover:text-white transition-colors`} title="Share on Facebook"><Facebook size={iconSize} /></button>
    <button onClick={() => handleShare('x')} className={`${btnSize} rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors`} title="Share on X"><XIcon size={iconSize} /></button>
    <button onClick={() => handleShare('reddit')} className={`${btnSize} rounded-full bg-[#FF4500]/10 text-[#FF4500] flex items-center justify-center hover:bg-[#FF4500] hover:text-white transition-colors`} title="Share on Reddit"><Reddit size={iconSize} /></button>
    <button onClick={handleCopy} className={`${btnSize} rounded-full ${copied ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600 hover:text-white'} flex items-center justify-center transition-colors`} title="Copy Link">
      {copied ? <Check size={iconSize} /> : <LinkIcon size={iconSize} />}
    </button>
  </div>
);

// --- 1. VIDEO MODAL LAYOUT ---
const VideoModalLayout = ({ selectedItem, videos, setSelectedItem, handleShare, handleCopy, copied }) => (
  <div className="flex flex-col lg:flex-row h-full max-h-[85vh]">
    <div className="lg:w-3/4 flex flex-col bg-black">
      <div className="w-full aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative border-b border-gray-800 overflow-hidden shrink-0">
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
        <h1 className="text-2xl font-bold text-white mb-4" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
        <div className="text-gray-400 text-sm whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
      </div>
    </div>
    
    <div className="lg:w-1/4 bg-[#161616] border-l border-gray-800 flex flex-col max-h-[85vh]">
      <div className="p-4 border-b border-gray-800 font-bold text-sm uppercase tracking-wider shrink-0">Up Next</div>
      
      <div className="overflow-y-auto p-4 flex flex-col gap-4 flex-1">
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

      <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] shrink-0">
        <div className="flex gap-2 items-center mb-4">
          <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport].bg}`}></span>
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{selectedItem.sport} • {selectedItem.date}</span>
        </div>
        <ShareButtons handleShare={handleShare} handleCopy={handleCopy} copied={copied} />
      </div>
    </div>
  </div>
);

// --- 2. SHORT MODAL LAYOUT ---
const ShortModalLayout = ({ selectedItem, videos, setSelectedItem, handleShare, handleCopy, copied }) => (
  <div className="flex flex-col h-full max-h-[85vh]">
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
      
      <div className="lg:w-1/2 bg-black flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-800 shrink-0 p-6 sm:p-10 relative">
        <div className="w-full max-w-[340px] aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative border border-gray-800">
           {selectedItem.youtubeId ? (
             <iframe src={`https://www.youtube.com/embed/${selectedItem.youtubeId}?autoplay=1`} className="absolute inset-0 w-full h-full" frameBorder="0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
           ) : (
             <>
               {selectedItem.imageUrl && <img src={selectedItem.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" alt="" />}
               <PlayCircle size={64} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 z-10 hover:scale-110 transition-transform cursor-pointer" />
             </>
           )}
        </div>
      </div>
      
      <div className="lg:w-1/2 p-6 sm:p-10 bg-[#121212] flex flex-col overflow-y-auto">
        <div className="flex gap-2 items-center mb-4">
          <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport].bg}`}></span>
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{selectedItem.sport} • {selectedItem.date}</span>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-6 leading-tight drop-shadow-lg" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
        
        <div className="mb-6 pb-6 border-b border-gray-800">
          <ShareButtons handleShare={handleShare} handleCopy={handleCopy} copied={copied} btnSize="w-10 h-10" iconSize={16} />
        </div>

        <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
      </div>
    </div>

    <div className="bg-[#1a1a1a] border-t border-gray-800 shrink-0 flex flex-col hidden sm:flex">
      <div className="px-6 py-3 border-b border-gray-800 font-bold text-[10px] uppercase tracking-wider text-gray-500 flex justify-between items-center">
        <span>More Videos & Shorts</span>
      </div>
      <div className="flex overflow-x-auto p-4 px-6 gap-4 scrollbar-hide">
        {videos.filter(v => v.id !== selectedItem.id).slice(0, 10).map(v => (
          <div key={v.id} onClick={() => setSelectedItem(v)} className="w-48 shrink-0 flex flex-col gap-2 group cursor-pointer">
            <div className="w-full aspect-video bg-[#111] rounded-lg relative flex items-center justify-center overflow-hidden border border-gray-800 group-hover:border-gray-500 transition-colors shadow-md">
              {v.imageUrl && <img src={v.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" alt="" />}
              <PlayCircle size={24} className="text-white/50 z-10 group-hover:text-white group-hover:scale-110 transition-all" />
              {v.type === 'short' && <span className="absolute bottom-2 right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-md uppercase tracking-wider">Short</span>}
            </div>
            <div>
              <h4 className={`text-xs font-bold leading-tight text-gray-300 group-hover:${themes[v.sport]?.text || 'text-white'} transition-colors line-clamp-2`} dangerouslySetInnerHTML={{ __html: v.title }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- 3. ARTICLE MODAL LAYOUT ---
const ArticleModalLayout = ({ selectedItem, handleShare, handleCopy, copied }) => (
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
        <div className="ml-auto">
          <ShareButtons handleShare={handleShare} handleCopy={handleCopy} copied={copied} />
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
);

// --- MAIN MODAL WRAPPER (The Router) ---
export default function ContentModal({ selectedItem, setSelectedItem, videos }) {
  const [copied, setCopied] = useState(false);

  if (!selectedItem) return null;

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = selectedItem.title;
    let shareUrl = '';

    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (platform === 'x') shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    if (platform === 'reddit') shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-sm flex justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="fixed inset-0" onClick={() => setSelectedItem(null)}></div>
      
      <button onClick={() => setSelectedItem(null)} className="fixed top-6 right-6 z-50 p-2 bg-[#1a1a1a] border border-gray-700 hover:bg-red-600 hover:border-red-600 rounded-full text-white transition-all shadow-xl">
        <X size={24} />
      </button>

      <div className={`relative z-10 w-full animate-in fade-in zoom-in-95 duration-200 ${selectedItem.type === 'article' ? 'max-w-4xl' : 'max-w-6xl'} my-auto bg-[#121212] border border-gray-800 rounded-xl shadow-2xl overflow-hidden`}>
        {selectedItem.type === 'video' && <VideoModalLayout selectedItem={selectedItem} videos={videos} setSelectedItem={setSelectedItem} handleShare={handleShare} handleCopy={handleCopy} copied={copied} />}
        {selectedItem.type === 'short' && <ShortModalLayout selectedItem={selectedItem} videos={videos} setSelectedItem={setSelectedItem} handleShare={handleShare} handleCopy={handleCopy} copied={copied} />}
        {selectedItem.type === 'article' && <ArticleModalLayout selectedItem={selectedItem} handleShare={handleShare} handleCopy={handleCopy} copied={copied} />}
      </div>
    </div>
  );
}