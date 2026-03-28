import React, { useState } from 'react';
import { Search, Menu, X, ChevronsUpDown } from 'lucide-react';
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
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);
  
  const theme = themes[activeSport];

  // DYNAMIC MAIN LOGOS!
  const logos = {
    All: 'https://fsan.com/wp-content/uploads/2023/12/Horizontal-White.webp',
    Football: 'https://fsan.com/wp-content/uploads/2023/11/Horizontal-White-2.webp',
    Basketball: 'https://fsan.com/wp-content/uploads/2023/11/Horizontal-white.webp',
    Baseball: 'https://fsan.com/wp-content/uploads/2023/11/Horizontal-white-1.webp',
  };

  return (
    <>
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-3 flex justify-between items-center z-[100] sticky top-0 shadow-md">
        
        {/* Left Side: Logo & Dropdown Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsSportDropdownOpen(!isSportDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-800/50 p-1.5 -ml-1.5 rounded-xl transition-colors cursor-pointer group"
          >
            <img 
              src={logos[activeSport]} 
              alt="FSAN Logo" 
              className="h-8 md:h-10 object-contain transition-all duration-300" 
            />
            <ChevronsUpDown size={20} className="text-gray-500 group-hover:text-white transition-colors" />
          </button>

          {/* The Sport Dropdown Menu */}
          {isSportDropdownOpen && (
            <>
              {/* Invisible overlay to close dropdown when clicking outside */}
              <div className="fixed inset-0 z-[90]" onClick={() => setIsSportDropdownOpen(false)}></div>
              
              <div className="absolute top-full left-0 mt-3 w-64 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-[100] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 border-b border-gray-800/50">
                  Select Network
                </div>
                {sportsConfig.map((sport) => (
                  <button 
                    key={sport.name}
                    onClick={() => { 
                      setActiveSport(sport.name); 
                      // Removed setCurrentView('home') so you stay on your current tab!
                      setIsSportDropdownOpen(false); 
                      window.scrollTo(0, 0); // Auto-scroll to top on sport change
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                      activeSport === sport.name ? 'bg-[#252525] text-white shadow-inner' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <img src={sport.icon} alt={sport.name} className="w-6 h-6 object-contain" />
                    <span className="font-bold text-sm uppercase tracking-wider">{sport.name}</span>
                    {activeSport === sport.name && (
                      <span className={`ml-auto w-2 h-2 rounded-full ${themes[sport.name].bg} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Search, Subscribe, Log In (Desktop) */}
        <div className="hidden lg:flex items-center text-xs font-bold uppercase tracking-widest text-gray-400">
          <button onClick={() => setIsSearchModalOpen(true)} className="hover:text-white transition-colors flex items-center gap-2 pr-6 group">
            <Search size={18} className="group-hover:text-white transition-colors" />
            <span>Search</span>
          </button>
          
          <div className="h-5 w-px bg-gray-700"></div>
          
          <a href="#" className="hover:text-white transition-colors px-6">Subscribe</a>
          <a href="#" className="hover:text-white transition-colors">Log In</a>
        </div>
        
        {/* Right Side: Search & Menu Icons (Mobile) */}
        <div className="lg:hidden flex items-center gap-3">
          <button onClick={() => setIsSearchModalOpen(true)} className="text-gray-400 hover:text-white p-2 transition-colors"><Search size={22} /></button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2 hover:text-gray-300 transition-colors"><Menu size={26} /></button>
        </div>

      </div>

      {/* --- OFFCANVAS MODALS --- */}
      
      {/* Search Overlay */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
          <div className="w-full max-w-3xl">
            <div className="flex items-center gap-4 bg-[#1e1e1e] border border-gray-700 p-2 rounded-lg shadow-2xl">
              <Search size={24} className="text-gray-400 ml-3" />
              <input type="text" autoFocus placeholder="Search players, articles, videos..." className="flex-1 bg-transparent text-white text-xl p-2 outline-none placeholder-gray-500" />
              <button onClick={() => setIsSearchModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex justify-end p-4 border-b border-gray-800 bg-[#121212]">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={32} /></button>
          </div>
          <div className="flex flex-col items-center gap-6 text-lg font-bold uppercase tracking-widest p-8 overflow-y-auto h-full mt-8">
            <a href="#" className="hover:text-white transition-colors">Subscribe</a>
            <a href="#" className="hover:text-white transition-colors">Log In</a>
            <div className="w-16 h-px bg-gray-800 my-4"></div>
            <a href="#" className="hover:text-white transition-colors text-center">Join Our Community</a>
          </div>
        </div>
      )}
    </>
  );
}