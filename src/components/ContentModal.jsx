"use client";
import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, PlayCircle, Link as LinkIcon, Check, ChevronRight, Lock } from 'lucide-react';
import { Facebook, XIcon, Reddit } from './Icons.jsx';
import { themes } from '../utils/theme.js';
import { useSession } from 'next-auth/react';
import AuthModal from './AuthModal';

// --- GLOBAL SUB-COMPONENTS ---

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

const DynamicAd = ({ ad }) => {
  if (!ad) return null;

  let patternOverlay = '';
  if (ad.pattern === 'dots') patternOverlay = "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20\\' xmlns=\\'http://www.w3.org/2000%2Fsvg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'0.4\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')";
  else if (ad.pattern === 'lines') patternOverlay = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)";
  else if (ad.pattern === 'grid') patternOverlay = "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)";
  else if (ad.pattern === 'crosshatch') patternOverlay = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 11px)";

  const bgStyles = { borderColor: ad.borderColor || ad.bgColor };
  if (ad.bgGradientType === 'solid') bgStyles.backgroundColor = ad.bgColor;
  else if (ad.bgGradientType === 'linear') bgStyles.backgroundImage = `linear-gradient(to right, ${ad.bgColor}, ${ad.bgColor2 || '#000000'})`;
  else if (ad.bgGradientType === 'radial') bgStyles.backgroundImage = `radial-gradient(ellipse at top, ${ad.bgColor}80, ${ad.bgColor2 || '#111'}, #000000)`;

  const renderButton = (extraClass) => (
    <div className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full sm:rounded-lg font-black text-[10px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-1 shrink-0 whitespace-nowrap ${extraClass}`} style={{ backgroundColor: ad.btnColor, color: ad.btnTextColor || '#ffffff' }}>
       {ad.buttonText} <ChevronRight size={14} className="hidden sm:block" />
    </div>
  );

  return (
    <a href={ad.buttonLink || '#'} target="_blank" rel="noreferrer" className={`@container w-full rounded-xl p-3 sm:p-4 flex relative overflow-hidden shadow-2xl group transition-all border-2 no-underline block hover:scale-[1.01] ${ad.fgImage ? 'flex-row items-center justify-between' : 'flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4'}`} style={bgStyles}>
       {ad.bgImage && <img src={ad.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" alt="" />}
       {ad.pattern !== 'none' && <div className="absolute inset-0" style={{ backgroundImage: patternOverlay, mixBlendMode: 'overlay', backgroundSize: ad.pattern === 'grid' ? '20px 20px' : 'auto' }}></div>}
       
       <div className={`relative z-10 flex flex-col justify-center shrink min-w-0 items-center text-center sm:items-start sm:text-left ${!ad.fgImage ? 'flex-1' : ''}`}>
         <h2 className={`text-base sm:text-xl lg:text-2xl font-black text-white italic tracking-tight mb-0.5 relative z-10 group-hover:scale-105 transition-transform line-clamp-1 leading-tight origin-center sm:origin-left`}>
           {ad.headline}
         </h2>
         <p className="text-gray-300 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest relative z-10 line-clamp-1 mt-0.5">
           {ad.subtext}
         </p>
         {!ad.fgImage && renderButton("mt-2 flex sm:hidden w-max")}
       </div>

       {ad.fgImage && (
          <div className="relative z-10 hidden sm:flex justify-center items-center shrink-0 pr-4 sm:flex-1">
             <img src={ad.fgImage} className="max-h-12 lg:max-h-16 w-auto object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" alt="" />
          </div>
       )}

       <div className={`relative z-10 hidden sm:flex justify-end items-center shrink-0 min-w-0 ${!ad.fgImage && 'sm:flex-1'}`}>
          {renderButton("")}
       </div>
    </a>
  );
};

// --- MODAL LAYOUTS ---

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
            <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">{selectedItem.date}</span>
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
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{selectedItem.date}</span>
        </div>
        <ShareButtons handleShare={handleShare} handleCopy={handleCopy} copied={copied} />
      </div>
    </div>
  </div>
);

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
            <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{selectedItem.date}</span>
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

const PodcastModalLayout = ({ selectedItem, handleShare, handleCopy, copied }) => (
  <div className="flex flex-col lg:flex-row h-full min-h-0 overflow-y-auto lg:overflow-hidden">
    <div className="flex-none lg:flex-1 bg-[#0a0a0a] flex flex-col items-center justify-center lg:border-r border-gray-800 p-4 sm:p-6 relative min-h-0">
      <div className="w-full h-[380px] sm:h-[400px] lg:h-full lg:min-h-[400px] bg-[#111] rounded-2xl overflow-hidden shadow-2xl relative border border-gray-800 shrink-0">
        {selectedItem.spreakerShowId ? (
          <iframe src={`https://widget.spreaker.com/player?show_id=${selectedItem.spreakerShowId}&theme=dark&playlist=show&playlist-continuous=true&chapters-image=true&episode_image_position=right&hide-logo=true&hide-likes=true&hide-comments=true&hide-sharing=false&hide-download=true`} width="100%" height="100%" frameBorder="0" allow="autoplay; picture-in-picture" style={{ display: 'block', width: '100%', height: '100%' }}></iframe>
        ) : selectedItem.spreakerId ? (
          <iframe src={`https://widget.spreaker.com/player?episode_id=${selectedItem.spreakerId}&theme=dark&playlist=false&playlist-continuous=false&chapters-image=true&episode_image_position=right&hide-logo=true&hide-likes=true&hide-comments=true&hide-sharing=false&hide-download=true`} width="100%" height="100%" frameBorder="0" allow="autoplay; picture-in-picture" style={{ display: 'block', width: '100%', height: '100%' }}></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs">Audio Unavailable</div>
        )}
      </div>
    </div>
    <div className="flex-none lg:w-[400px] xl:w-[450px] shrink-0 p-6 sm:p-10 bg-[#121212] flex flex-col lg:overflow-y-auto border-t lg:border-t-0 border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport]?.bg || 'bg-gray-500'}`}></span>
          <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{selectedItem.date}</span>
        </div>
        <ShareButtons handleShare={handleShare} handleCopy={handleCopy} copied={copied} btnSize="w-8 h-8" iconSize={14} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-white mb-6 leading-tight drop-shadow-lg" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
      <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed flex-1 pb-4" dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
    </div>
  </div>
);

// --- ARTICLE GATING IMPLEMENTATION ---
const ArticleModalLayout = ({ selectedItem, handleShare, handleCopy, copied, isAuthed, authStatus, openAuth }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Getty script needs a stable DOM and manual execution for dynamic content
    const runScripts = () => {
      const container = document.getElementById('article-content-container');
      if (!container) return;

      const scripts = container.getElementsByTagName('script');
      Array.from(scripts).forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        if (oldScript.innerHTML) {
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        }
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      // Dedicated Getty Trigger
      if (container.querySelector('.gettyimages-embed') && !document.getElementById('getty-script')) {
        const script = document.createElement('script');
        script.id = 'getty-script';
        script.src = "https://embed.gettyimages.com/embed/5/2";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    // Delay slightly to ensure React has painted the initial dangerouslySetInnerHTML
    const timeoutId = setTimeout(runScripts, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedItem, isAuthed]);

  // FIX: Explicitly wait for 'unauthenticated' status to avoid roadblock flashing for logged-in users
  const showGating = !isAuthed && authStatus === 'unauthenticated';

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="w-full h-64 md:h-96 bg-gray-800 relative overflow-hidden shrink-0">
        {selectedItem.imageUrl && <img src={selectedItem.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-top opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent"></div>
      </div>
      <div className="p-6 md:p-10 -mt-24 relative z-10 max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex gap-2 items-center mb-3">
          <span className={`w-2 h-2 rounded-full ${themes[selectedItem.sport]?.bg || 'bg-gray-500'}`}></span>
          <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">
            {selectedItem.date}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight drop-shadow-lg" dangerouslySetInnerHTML={{ __html: selectedItem.title }} />
        <div className="flex items-center gap-4 border-b border-gray-800 pb-6 mb-8 bg-[#121212]/80 p-4 rounded-xl backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center font-bold text-gray-400 overflow-hidden shrink-0">
            {selectedItem.author?.avatar ? (
              <img src={selectedItem.author.avatar} alt={selectedItem.author.name} className="w-full h-full object-cover" />
            ) : (
              selectedItem.author?.name?.charAt(0) || "F"
            )}
          </div>
          <div><p className="font-bold text-sm">{selectedItem.author?.name || "FSAN Staff"}</p></div>
          <div className="ml-auto"><ShareButtons handleShare={handleShare} handleCopy={handleCopy} copied={copied} /></div>
        </div>
        
        <div className="relative flex-1">
          <div 
            id="article-content-container" 
            className={`prose prose-invert prose-lg max-w-none text-gray-300 space-y-6 prose-a:${themes[selectedItem.sport]?.text || 'text-white'} hover:prose-a:text-white transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'} ${showGating ? 'max-h-[500px] overflow-hidden' : ''}`} 
            dangerouslySetInnerHTML={{ __html: mounted ? selectedItem.content : "" }} 
          />
          
          {showGating && (
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent z-10 pointer-events-none" />
          )}
        </div>

        {showGating && (
          <div className="mt-2 pb-8 flex flex-col items-center justify-center relative z-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* CONIC GRADIENT BORDER: Blue -> Red (#c30b16) -> Orange -> Blue */}
            <div className="p-[2px] rounded-[24px] bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_33%,#f5a623_66%,#1b75bb_100%)] max-w-md w-full shadow-2xl">
              <div className="bg-[#1a1a1a] p-8 rounded-[22px] text-center w-full h-full">
                <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Keep Reading</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">Create a free account to read the rest of this article and get the advice you need to win your league.</p>
                <button 
                  onClick={() => openAuth('subscribe')} 
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all transform hover:scale-[1.02] mb-4 text-sm"
                >
                  Create Free Account
                </button>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                  Already have an account? <button onClick={() => openAuth('login')} className="text-white hover:text-gray-300 transition-colors ml-1">Log In</button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN EXPORT COMPONENT ---

export default function ContentModal({ selectedItem, setSelectedItem, videos }) {
  const [copied, setCopied] = useState(false);
  const [globalAds, setGlobalAds] = useState([]);
  
  const { data: session, status } = useSession();
  const isAuthed = status === 'authenticated';
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('subscribe');

  const openAuth = (view) => {
    setAuthView(view);
    setIsAuthOpen(true);
  };

  useEffect(() => {
    if (selectedItem && !isAuthOpen) { 
      document.body.style.overflow = 'hidden'; 
    } else if (!selectedItem) { 
      document.body.style.overflow = 'unset'; 
    }
  }, [selectedItem, isAuthOpen]);

  useEffect(() => {
    const fetchAds = async () => {
      const query = `
        query GetGlobalAds {
          globalAds {
            id headline subtext buttonText buttonLink bgColor bgColor2 bgGradientType btnColor btnTextColor borderColor pattern bgImage fgImage sport pages placements startDate endDate
          }
        }
      `;
      try {
        const res = await fetch('https://admin.fsan.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        const json = await res.json();
        if (json?.data?.globalAds) {
          setGlobalAds(json.data.globalAds);
        }
      } catch (e) {
        console.error("Failed to fetch ads", e);
      }
    };
    fetchAds();
  }, []);

  if (!selectedItem) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  const popupAds = globalAds.filter(ad => {
    if (!ad.placements || !ad.placements.includes('content-popup')) return false;
    if (!ad.sport || (!ad.sport.includes('All') && !ad.sport.includes(selectedItem.sport))) return false;
    if (ad.startDate) {
      const [year, month, day] = ad.startDate.split('-');
      const start = new Date(year, month - 1, day);
      if (today < start) return false;
    }
    if (ad.endDate) {
      const [year, month, day] = ad.endDate.split('-');
      const end = new Date(year, month - 1, day);
      if (today > end) return false;
    }
    return true; 
  });

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
      <div className={`relative z-10 w-full animate-in fade-in zoom-in-95 duration-200 ${selectedItem.type === 'article' ? 'max-w-4xl' : 'max-w-6xl'} h-[95vh] flex flex-col`}>
        
        {popupAds.length > 0 && (
          <div className="w-full shrink-0 mb-3 sm:mb-4">
            <DynamicAd ad={popupAds[0]} />
          </div>
        )}

        <div className="relative w-full flex-1 flex flex-col min-h-0">
          <button onClick={() => setSelectedItem(null)} className="absolute -top-3 -right-3 z-[150] p-2.5 bg-[#1a1a1a] border border-gray-600 hover:border-gray-500 rounded-full text-white transition-all shadow-2xl group">
            <X size={20} className="text-white opacity-80 group-hover:opacity-100" />
          </button>
          <div className="w-full flex-1 bg-[#121212] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col min-h-0">
            {selectedItem.type === 'video' && <VideoModalLayout selectedItem={selectedItem} videos={videos} setSelectedItem={setSelectedItem} handleShare={handleShare} handleCopy={handleCopy} copied={copied} />}
            {selectedItem.type === 'short' && <ShortModalLayout selectedItem={selectedItem} videos={videos} setSelectedItem={setSelectedItem} handleShare={handleShare} handleCopy={handleCopy} copied={copied} />}
            {selectedItem.type === 'podcast' && <PodcastModalLayout selectedItem={selectedItem} handleShare={handleShare} handleCopy={handleCopy} copied={copied} />}
            
            {selectedItem.type === 'article' && (
              <ArticleModalLayout 
                selectedItem={selectedItem} 
                handleShare={handleShare} 
                handleCopy={handleCopy} 
                copied={copied} 
                isAuthed={isAuthed}
                authStatus={status}
                openAuth={openAuth}
              />
            )}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialView={authView} 
      />
    </div>
  );
}