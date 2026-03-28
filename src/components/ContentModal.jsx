import React, { useState } from 'react';
import { X, ArrowLeft, PlayCircle, Link as LinkIcon, Check } from 'lucide-react';
import { Facebook, XIcon, Reddit } from './Icons.jsx';
import { themes } from '../utils/theme.js';

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

// --- FLOATING MODAL AD ---
const ModalBannerAd = () => (
  <div className="w-full shrink-0 mb-3 sm:mb-4 bg-gradient-to-r from-red-900 to-black border border-red-800 rounded-xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group cursor-pointer hover:border-red-500 transition-colors relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]"></div>
    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 flex-1">
      <h3 className="text-red-500 font-black text-xl lg:text-2xl italic uppercase drop-shadow-md group-hover:scale-105 transition-transform origin-left leading-none shrink-0">Dominate</h3>
      <p className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest text-left">Get The Ultimate Rookie Breakdown!</p>
    </div>
    <button className="bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-black text-[10px] uppercase tracking-wider shadow-lg relative z-10 shrink-0 whitespace-nowrap w-full sm:w-auto">
      Only $10 - Get Access
    </button>
  </div>
);

// --- 1. VIDEO MODAL LAYOUT ---
const VideoModalLayout = ({ selectedItem, videos, setSelectedItem, handleShare, handleCopy, copied }) => (
  <div className="flex flex-col lg:flex-row h-full min-h-0">
    <div className="flex-1 lg:w-3/4 flex flex-col bg-[#121212] overflow-y-auto lg:overflow-hidden min-h-0">
      <div className="w-full aspect-video bg-black flex items-center justify-center relative border-b border-gray-800 overflow-hidden shrink-0">
         {selectedItem.youtubeId ? (
           <iframe src={`https://www.youtube.com/embed/${selectedItem.youtubeId}?autoplay=1`} className="absolute inset-0 w-full h-full" frameBorder="0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen></iframe>
         ) : (
           <>
             {selectedItem.imageUrl && <img src={selectedItem.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" alt="" />}
             <PlayCircle size={64} className="text-white/80 z-10 hover:scale-110 transition-transform cursor-pointer" />
           </>
         )}
      </div>
      <div className="p-6 md:p-8 flex-1 lg:overflow-y-auto">
        <div className="flex lg:hidden flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-800">
          <div className="flex gap-2 items-center">
            <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport]?.bg || 'bg-gray-500'}`}></span>
            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">{selectedItem.sport} • {selectedItem.date}</span>
          </div>
          <ShareButtons handleShare={handleShare} handleCopy={handleCopy} copied={copied} />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-6 leading-tight drop-shadow-lg" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
        <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
      </div>
    </div>
    
    <div className="lg:hidden bg-[#1a1a1a] border-t border-gray-800 shrink-0 flex flex-col">
      <div className="px-6 py-3 border-b border-gray-800 font-bold text-[10px] uppercase tracking-wider text-gray-500 flex justify-between items-center">
        <span>Up Next</span>
      </div>
      <div className="flex overflow-x-auto p-4 md:px-6 gap-4 scrollbar-hide">
        {videos.filter(v => v.type === 'video' && v.id !== selectedItem.id).slice(0, 10).map(v => (
          <div key={v.id} onClick={() => setSelectedItem(v)} className="w-48 sm:w-64 shrink-0 flex flex-col gap-3 group cursor-pointer">
            <div className="w-full aspect-video bg-[#111] rounded-xl relative flex items-center justify-center overflow-hidden border border-gray-800 group-hover:border-gray-500 transition-colors shadow-lg">
              {v.imageUrl && <img src={v.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity" alt="" />}
              <PlayCircle size={32} className="text-white/60 z-10 group-hover:text-white group-hover:scale-110 transition-all" />
              <div className="absolute top-2 left-2 flex items-center bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${themes[v.sport]?.bg || 'bg-gray-500'}`}></span>
              </div>
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-bold leading-tight text-gray-300 group-hover:${themes[v.sport]?.text || 'text-white'} transition-colors line-clamp-2`} dangerouslySetInnerHTML={{ __html: v.title }} />
              <p className="text-[10px] text-gray-500 mt-1">{v.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="hidden lg:flex lg:w-1/4 bg-[#161616] border-l border-gray-800 flex-col min-h-0">
      <div className="p-4 border-b border-gray-800 font-bold text-sm uppercase tracking-wider shrink-0">Up Next</div>
      <div className="overflow-y-auto p-4 flex flex-col gap-4 flex-1">
        {videos.filter(v => v.type === 'video' && v.id !== selectedItem.id).slice(0, 10).map(v => (
          <div key={v.id} onClick={() => setSelectedItem(v)} className="flex gap-3 group cursor-pointer">
            <div className="w-24 h-16 bg-gray-800 rounded shrink-0 relative flex items-center justify-center overflow-hidden">
              {v.imageUrl && <img src={v.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />}
              <PlayCircle size={16} className="text-white/50 z-10" />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className={`text-xs font-bold leading-tight group-hover:${themes[v.sport]?.text || 'text-white'} line-clamp-2`} dangerouslySetInnerHTML={{ __html: v.title }} />
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] shrink-0">
        <div className="flex gap-2 items-center mb-4">
          <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport]?.bg || 'bg-gray-500'}`}></span>
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{selectedItem.sport} • {selectedItem.date}</span>
        </div>
        <ShareButtons handleShare={handleShare} handleCopy={handleCopy} copied={copied} />
      </div>
    </div>
  </div>
);

// --- 2. SHORT MODAL LAYOUT ---
const ShortModalLayout = ({ selectedItem, videos, setSelectedItem, handleShare, handleCopy, copied }) => {
  const shorts = videos.filter(v => v.type === 'short' && v.id !== selectedItem.id);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
        <div className="lg:w-[400px] xl:w-[450px] shrink-0 bg-black flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-800 p-4 sm:p-6 relative min-h-0">
          <div className="w-full max-w-[260px] sm:max-w-[320px] lg:max-w-none lg:w-auto lg:h-full aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative border border-gray-800 mx-auto">
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
        <div className="flex-1 p-6 sm:p-10 bg-[#121212] flex flex-col overflow-y-auto">
          <div className="flex gap-2 items-center mb-4">
            <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport]?.bg || 'bg-gray-500'}`}></span>
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{selectedItem.sport} • {selectedItem.date}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-6 leading-tight drop-shadow-lg" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
          <div className="mb-6 pb-6 border-b border-gray-800">
            <ShareButtons handleShare={handleShare} handleCopy={handleCopy} copied={copied} btnSize="w-10 h-10" iconSize={16} />
          </div>
          <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
        </div>
      </div>
      <div className="bg-[#1a1a1a] border-t border-gray-800 shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-800 font-bold text-[10px] uppercase tracking-wider text-gray-500 flex justify-between items-center">
          <span>More Shorts</span>
        </div>
        <div className="flex overflow-x-auto p-4 gap-4 scrollbar-hide">
          {shorts.slice(0, 10).map(v => (
            <div key={v.id} onClick={() => setSelectedItem(v)} className="w-20 md:w-24 shrink-0 flex flex-col gap-2 group cursor-pointer">
              <div className="w-full aspect-[9/16] bg-[#111] rounded-xl relative flex items-center justify-center overflow-hidden border border-gray-800 group-hover:border-gray-500 transition-colors shadow-lg">
                {v.imageUrl && <img src={v.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity" alt="" />}
                <PlayCircle size={24} className="text-white/60 z-10 group-hover:text-white group-hover:scale-110 transition-all" />
              </div>
              <div>
                <h4 className={`text-[10px] font-bold leading-tight text-gray-300 group-hover:${themes[v.sport]?.text || 'text-white'} transition-colors line-clamp-2`} dangerouslySetInnerHTML={{ __html: v.title }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 3. PODCAST MODAL LAYOUT ---
const PodcastModalLayout = ({ selectedItem, handleShare, handleCopy, copied }) => (
  <div className="flex flex-col lg:flex-row h-full min-h-0 overflow-y-auto lg:overflow-hidden">
    
    {/* Left Side: Dynamic Podcast Player Embed */}
    <div className="flex-none lg:flex-1 bg-[#0a0a0a] flex flex-col items-center justify-center lg:border-r border-gray-800 p-4 sm:p-6 relative min-h-0">
      <div className="w-full h-[380px] sm:h-[400px] lg:h-full lg:min-h-[400px] bg-[#111] rounded-2xl overflow-hidden shadow-2xl relative border border-gray-800 shrink-0">
        {selectedItem.spreakerShowId ? (
          <iframe 
            src={`https://widget.spreaker.com/player?show_id=${selectedItem.spreakerShowId}&theme=dark&playlist=show&playlist-continuous=true&chapters-image=true&episode_image_position=right&hide-logo=true&hide-likes=true&hide-comments=true&hide-sharing=false&hide-download=true`} 
            width="100%" 
            height="100%"
            frameBorder="0" 
            allow="autoplay; picture-in-picture"
            style={{ display: 'block', width: '100%', height: '100%' }}
          ></iframe>
        ) : selectedItem.spreakerId ? (
          <iframe 
            src={`https://widget.spreaker.com/player?episode_id=${selectedItem.spreakerId}&theme=dark&playlist=false&playlist-continuous=false&chapters-image=true&episode_image_position=right&hide-logo=true&hide-likes=true&hide-comments=true&hide-sharing=false&hide-download=true`} 
            width="100%" 
            height="100%"
            frameBorder="0" 
            allow="autoplay; picture-in-picture"
            style={{ display: 'block', width: '100%', height: '100%' }}
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs">Audio Unavailable</div>
        )}
      </div>
    </div>

    {/* Right Side: Description and Share */}
    <div className="flex-none lg:w-[400px] xl:w-[450px] shrink-0 p-6 sm:p-10 bg-[#121212] flex flex-col lg:overflow-y-auto border-t lg:border-t-0 border-gray-800">
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport]?.bg || 'bg-gray-500'}`}></span>
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{selectedItem.sport} Podcast</span>
        </div>
        {/* Inline Share Buttons right-justified */}
        <ShareButtons handleShare={handleShare} handleCopy={handleCopy} copied={copied} btnSize="w-8 h-8" iconSize={14} />
      </div>
      
      <h1 className="text-2xl sm:text-3xl font-black text-white mb-6 leading-tight drop-shadow-lg" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
      
      <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed flex-1 pb-4" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
      
    </div>
  </div>
);

// --- 4. ARTICLE MODAL LAYOUT ---
const ArticleModalLayout = ({ selectedItem, handleShare, handleCopy, copied }) => (
  <div className="flex flex-col h-full overflow-y-auto">
    <div className="w-full h-64 md:h-96 bg-gray-800 relative overflow-hidden shrink-0">
      {selectedItem.imageUrl && <img src={selectedItem.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
    </div>
    
    <div className="p-6 md:p-10 -mt-24 relative z-10 max-w-4xl mx-auto w-full">
      <div className="flex gap-2 items-center mb-3">
        <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport]?.bg || 'bg-gray-500'}`}></span>
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

      {/* TEXT CONTENT */}
      <div className={`prose prose-invert prose-lg max-w-none text-gray-300 space-y-6 prose-a:${themes[selectedItem.sport]?.text || 'text-white'} hover:prose-a:text-white`} dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
      
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
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 overflow-hidden">
      <div className="fixed inset-0" onClick={() => setSelectedItem(null)}></div>
      
      <button onClick={() => setSelectedItem(null)} className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[120] p-2 bg-[#1a1a1a] border border-gray-700 hover:bg-red-600 hover:border-red-600 rounded-full text-white transition-all shadow-xl">
        <X size={24} />
      </button>

      <div className={`relative z-10 w-full animate-in fade-in zoom-in-95 duration-200 ${selectedItem.type === 'article' ? 'max-w-4xl' : 'max-w-6xl'} h-[95vh] flex flex-col`}>
        
        <ModalBannerAd />

        <div className="w-full flex-1 bg-[#121212] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col min-h-0">
          {selectedItem.type === 'video' && <VideoModalLayout selectedItem={selectedItem} videos={videos} setSelectedItem={setSelectedItem} handleShare={handleShare} handleCopy={handleCopy} copied={copied} />}
          {selectedItem.type === 'short' && <ShortModalLayout selectedItem={selectedItem} videos={videos} setSelectedItem={setSelectedItem} handleShare={handleShare} handleCopy={handleCopy} copied={copied} />}
          {selectedItem.type === 'podcast' && <PodcastModalLayout selectedItem={selectedItem} handleShare={handleShare} handleCopy={handleCopy} copied={copied} />}
          {selectedItem.type === 'article' && <ArticleModalLayout selectedItem={selectedItem} handleShare={handleShare} handleCopy={handleCopy} copied={copied} />}
        </div>
        
      </div>
    </div>
  );
}