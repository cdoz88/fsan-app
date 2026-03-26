import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { Facebook, XIcon, Youtube, Instagram, TikTok, LinkedIn, SelloutCrowds } from './Icons';
import { themes } from '../utils/theme';

const sportsConfig = [
  { name: 'All', icon: 'https://fsan.com/wp-content/uploads/2023/11/FSAN-Icon.webp' },
  { name: 'Football', icon: 'https://fsan.com/wp-content/uploads/2023/11/FFAN-Icon.webp' },
  { name: 'Basketball', icon: 'https://fsan.com/wp-content/uploads/2023/11/FBBAN-Icon.webp' },
  { name: 'Baseball', icon: 'https://fsan.com/wp-content/uploads/2023/11/FBAN-Icon.webp' },
];

export default function Header({ activeSport, setActiveSport, setCurrentView }) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const theme = themes[activeSport];

  // DYNAMIC MAIN LOGOS! Just drop the exact image URLs here for each sport
  const logos = {
    All: 'https://fsan.com/wp-content/uploads/2023/12/Horizontal-White.webp',
    Football: 'https://fsan.com/wp-content/uploads/2023/12/Horizontal-White.webp', // Add FFAN Logo here later
    Basketball: 'https://fsan.com/wp-content/uploads/2023/12/Horizontal-White.webp', // Add FBBAN Logo here later
    Baseball: 'https://fsan.com/wp-content/uploads/2023/12/Horizontal-White.webp', // Add FBAN Logo here later
  };

  // Dynamic social links dictionary
  const socialLinks = {
    All: {
      facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork',
      x: 'https://x.com/fsadvicenet',
      youtube: 'https://www.youtube.com/@FFAdviceNet',
      tiktok: 'https://www.tiktok.com/@fsadvicenetwork',
      linkedin: 'https://www.linkedin.com/company/fantasy-sports-advice',
      sellout: 'https://www.selloutcrowds.com/crowd/fsan',
      instagram: null
    },
    Football: {
      facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork',
      x: 'https://x.com/FFAdviceNet',
      youtube: 'https://www.youtube.com/@FFAdviceNet',
      instagram: 'https://www.instagram.com/ffadvicenet/',
      sellout: '#',
      tiktok: null,
      linkedin: null
    },
    Basketball: {
      facebook: null,
      x: 'https://x.com/FBBAdviceNet',
      youtube: 'https://www.youtube.com/@FBBAdviceNet',
      instagram: 'https://www.instagram.com/fbkadvicenet/',
      sellout: '#',
      tiktok: null,
      linkedin: null
    },
    Baseball: {
      facebook: null,
      x: 'https://x.com/FBAdviceNet',
      youtube: 'https://www.youtube.com/@FBAdviceNet',
      instagram: 'https://www.instagram.com/fbadvicenet/',
      sellout: '#',
      tiktok: null,
      linkedin: null
    },
  };
  const currentLinks = socialLinks[activeSport];

  return (
    <>
      {/* Utility Nav */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-2 flex justify-between items-center text-xs font-semibold tracking-wide z-50 relative">
        <div className="flex items-center gap-3">
          <img 
            src={logos[activeSport]} 
            alt="FSAN Logo" 
            className="h-8 md:h-10 cursor-pointer object-contain transition-all duration-300" 
            onClick={() => setCurrentView('home')} 
          />
        </div>

        <div className="hidden lg:flex items-center gap-6 text-gray-400 uppercase">
          <a href="#" className="hover:text-white transition-colors">Join Our Community</a>
          <a href="#" className="hover:text-white transition-colors">Join The Napkin League</a>
          <a href="#" className="hover:text-white transition-colors">Join A Jersey League</a>
          <a href="#" className="hover:text-white transition-colors">Subscribe</a>
          <a href="#" className="hover:text-white transition-colors">Log In</a>
        </div>
        
        <div className="lg:hidden flex items-center gap-3">
          <button onClick={() => setIsSearchModalOpen(true)} className="text-gray-400 hover:text-white p-2 transition-colors"><Search size={20} /></button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2 hover:text-gray-300 transition-colors"><Menu size={24} /></button>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="bg-[#1e1e1e] border-b border-gray-800 px-4 py-3 hidden lg:flex justify-between items-center text-sm font-bold uppercase tracking-wider z-40 relative">
        <div className="flex items-center gap-4">
          <div className="bg-[#121212] p-1 rounded-full border border-gray-800 flex items-center shadow-inner relative">
            {sportsConfig.map((sport) => (
              <button 
                key={sport.name}
                onClick={() => { setActiveSport(sport.name); setCurrentView('home'); }}
                className={`relative z-10 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${activeSport === sport.name ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {activeSport === sport.name && <span className={`absolute inset-0 rounded-full opacity-20 ${themes[sport.name].bg}`}></span>}
                <img src={sport.icon} alt={sport.name} className="w-4 h-4 object-contain relative z-10" />
                <span className="relative z-10">{sport.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 text-gray-400">
          <button onClick={() => setIsSearchModalOpen(true)} className="hover:text-white transition-colors flex items-center gap-2 group">
            <Search size={18} className="group-hover:text-red-500 transition-colors" />
            <span className="text-xs">Search</span>
          </button>
          <div className="h-4 w-px bg-gray-700"></div>
          
          {/* Dynamically render ONLY the icons that have links for this specific sport */}
          <div className="flex items-center gap-4">
            {currentLinks.facebook && <a href={currentLinks.facebook} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><Facebook size={16} /></a>}
            {currentLinks.x && <a href={currentLinks.x} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><XIcon size={16} /></a>}
            {currentLinks.youtube && <a href={currentLinks.youtube} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><Youtube size={16} /></a>}
            {currentLinks.instagram && <a href={currentLinks.instagram} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><Instagram size={16} /></a>}
            {currentLinks.tiktok && <a href={currentLinks.tiktok} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><TikTok size={16} /></a>}
            {currentLinks.linkedin && <a href={currentLinks.linkedin} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><LinkedIn size={16} /></a>}
            {currentLinks.sellout && <a href={currentLinks.sellout} target="_blank" rel="noreferrer" className={`transition-colors cursor-pointer ${theme.hoverText}`}><SelloutCrowds size={16} /></a>}
          </div>
        </div>
      </div>

      {/* Offcanvas Modals */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
          <div className="w-full max-w-3xl">
            <div className="flex items-center gap-4 bg-[#1e1e1e] border border-gray-700 p-2 rounded-lg shadow-2xl">
              <Search size={24} className="text-red-500 ml-3" />
              <input type="text" autoFocus placeholder="Search players, articles, videos..." className="flex-1 bg-transparent text-white text-xl p-2 outline-none placeholder-gray-500" />
              <button onClick={() => setIsSearchModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex justify-end p-4 border-b border-gray-800 bg-[#121212]">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={32} /></button>
          </div>
          <div className="flex flex-col items-center gap-6 text-lg font-bold uppercase tracking-widest p-8 overflow-y-auto h-full">
            <div className="w-full mb-6 flex justify-center">
              <div className="bg-[#1e1e1e] p-1.5 rounded-full border border-gray-700 flex flex-wrap justify-center gap-1 shadow-inner w-full max-w-xs">
                {sportsConfig.map((sport) => (
                  <button 
                    key={`mobile-${sport.name}`} 
                    onClick={() => { setActiveSport(sport.name); setCurrentView('home'); setIsMobileMenuOpen(false); }} 
                    className={`relative z-10 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex-1 flex items-center justify-center gap-1.5 ${activeSport === sport.name ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {activeSport === sport.name && <span className={`absolute inset-0 rounded-full opacity-30 ${themes[sport.name].bg}`}></span>}
                    <img src={sport.icon} alt={sport.name} className="w-3.5 h-3.5 object-contain relative z-10" />
                    <span className="relative z-10">{sport.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <a href="#" className="hover:text-red-500 transition-colors">Subscribe</a>
            <a href="#" className="hover:text-red-500 transition-colors">Log In</a>
            <div className="w-16 h-px bg-gray-800 my-2"></div>
            <a href="#" className="hover:text-red-500 transition-colors text-center">Join Our Community</a>
          </div>
        </div>
      )}
    </>
  );
}