import React, { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { Facebook, Twitter, Youtube, Instagram } from './Icons';
import { themes } from '../utils/theme';

export default function Header({ activeSport, setActiveSport, setCurrentView }) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Utility Nav */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-2 flex justify-between items-center text-xs font-semibold tracking-wide z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-black rounded-lg border border-gray-600 flex items-center justify-center shadow-lg cursor-pointer" onClick={() => setCurrentView('home')}>
            <span className="font-bold text-2xl text-white italic">F</span>
          </div>
          <div className="hidden sm:flex flex-col uppercase cursor-pointer" onClick={() => setCurrentView('home')}>
            <span className="text-white text-lg leading-none tracking-widest font-bold">Fantasy Sports</span>
            <span className="text-gray-400 text-[10px] tracking-[0.2em]">Advice Network</span>
          </div>
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
            {['All', 'Football', 'Basketball', 'Baseball'].map((sport) => (
              <button 
                key={sport}
                onClick={() => { setActiveSport(sport); setCurrentView('home'); }}
                className={`relative z-10 px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeSport === sport ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {activeSport === sport && <span className={`absolute inset-0 rounded-full opacity-20 ${themes[sport].bg}`}></span>}
                {sport}
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
          <div className="flex items-center gap-4">
            <Facebook size={16} className="hover:text-blue-600 cursor-pointer" />
            <Twitter size={16} className="hover:text-blue-400 cursor-pointer" />
            <Youtube size={16} className="hover:text-red-600 cursor-pointer" />
            <Instagram size={16} className="hover:text-pink-600 cursor-pointer" />
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
                {['All', 'Football', 'Basketball', 'Baseball'].map((sport) => (
                  <button key={`mobile-${sport}`} onClick={() => { setActiveSport(sport); setCurrentView('home'); setIsMobileMenuOpen(false); }} className={`relative z-10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex-1 ${activeSport === sport ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
                    {activeSport === sport && <span className={`absolute inset-0 rounded-full opacity-30 ${themes[sport].bg}`}></span>}
                    {sport}
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