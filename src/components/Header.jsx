"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ChevronsUpDown, User, LogOut, Users, Flame, Loader2 } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { themes } from '../utils/theme';
import { SelloutCrowds } from './Icons';
import AuthModal from './AuthModal';

const sportsList = [
  { name: 'All', icon: 'https://admin.fsan.com/wp-content/uploads/2023/11/FSAN-Icon.webp' },
  { name: 'Football', icon: 'https://admin.fsan.com/wp-content/uploads/2023/11/FFAN-Icon.webp' },
  { name: 'Basketball', icon: 'https://admin.fsan.com/wp-content/uploads/2023/11/FBBAN-Icon.webp' },
  { name: 'Baseball', icon: 'https://admin.fsan.com/wp-content/uploads/2023/11/FBAN-Icon.webp' },
];

export default function Header({ activeSport }) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); 
  
  const { data: session, status } = useSession();
  
  const theme = themes[activeSport] || themes.All;
  const pathname = usePathname() || '';
  const pathParts = pathname.split('/').filter(Boolean);
  const currentView = pathParts.length > 1 ? pathParts[1] : 'home';

  const logos = {
    All: 'https://admin.fsan.com/wp-content/uploads/2023/12/Horizontal-White.webp',
    Football: 'https://admin.fsan.com/wp-content/uploads/2023/11/Horizontal-White-2.webp',
    Basketball: 'https://admin.fsan.com/wp-content/uploads/2023/11/Horizontal-white.webp',
    Baseball: 'https://admin.fsan.com/wp-content/uploads/2023/11/Horizontal-white-1.webp',
  };

  const currentLogo = logos[activeSport] || logos.All;

  const sportGradients = {
    All: 'bg-gradient-to-b from-gray-400 to-gray-700',
    Football: 'bg-gradient-to-b from-[#e42d38] to-[#8a1a20]',
    Basketball: 'bg-gradient-to-b from-[#e85d22] to-[#a33308]',
    Baseball: 'bg-gradient-to-b from-[#1b75bb] to-[#1e3b8a]',
  };
  
  const currentGradient = sportGradients[activeSport] || sportGradients.All;

  const toggleMobileSidebar = () => {
    window.dispatchEvent(new Event('toggleMobileMenu'));
  };

  const openLogin = () => {
    setAuthModalView('login');
    setIsAuthModalOpen(true);
  };

  const openSubscribe = () => {
    setAuthModalView('subscribe');
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-3 flex justify-between items-center z-[100] sticky top-0 shadow-md">
        
        <div className="relative flex items-center">
          <Link href={`/${(activeSport || 'All').toLowerCase()}/home`} className="flex items-center hover:opacity-80 transition-opacity">
            <img src={currentLogo} alt={`${activeSport} Logo`} className="h-8 md:h-10 object-contain transition-all duration-300" />
          </Link>

          <button onClick={() => setIsSportDropdownOpen(!isSportDropdownOpen)} className="flex items-center justify-center p-2 ml-1 rounded-xl hover:bg-gray-800/50 transition-colors cursor-pointer group">
            <ChevronsUpDown size={20} className="text-gray-500 group-hover:text-white transition-colors" />
          </button>

          {isSportDropdownOpen && (
            <>
              <div className="fixed inset-0 z-[90]" onClick={() => setIsSportDropdownOpen(false)}></div>
              <div className="absolute top-full left-0 mt-3 w-64 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-[100] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 border-b border-gray-800/50">Select Network</div>
                {sportsList.map((sport) => {
                  const targetPath = `/${sport.name.toLowerCase()}/${currentView}`;
                  return (
                    <Link key={sport.name} href={targetPath} onClick={() => setIsSportDropdownOpen(false)} className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors no-underline ${activeSport === sport.name ? 'bg-[#252525] text-white shadow-inner' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                      <img src={sport.icon} alt={sport.name} className="w-6 h-6 object-contain" />
                      <span className="font-bold text-sm uppercase tracking-wider">{sport.name}</span>
                      {activeSport === sport.name && <span className={`ml-auto w-2 h-2 rounded-full ${themes[sport.name].bg} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></span>}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Desktop Nav */}
        <div className="hidden lg:flex items-center text-xs font-bold uppercase tracking-widest text-gray-400">
          <button onClick={() => setIsSearchModalOpen(true)} className="hover:text-white transition-colors flex items-center gap-2 pr-6 group">
            <Search size={18} className="group-hover:text-white transition-colors" />
            <span>Search</span>
          </button>
          
          <div className="h-5 w-px bg-gray-700 mr-6"></div>
          
          {status === "loading" ? (
            <div className="px-6 flex items-center"><Loader2 size={16} className="animate-spin text-gray-500" /></div>
          ) : session ? (
            <>
              <Link href="/account" className="px-6 text-white hover:text-gray-300 transition-colors flex items-center gap-2 no-underline">
                {session.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full border border-gray-600" />
                ) : (
                  <User size={16} />
                )}
                Hi, {session.user?.name?.split(' ')[0] || 'User'}
              </Link>
              <button onClick={() => signOut()} className="hover:text-red-400 transition-colors no-underline">Log Out</button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={openSubscribe} 
                className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all shadow-lg"
              >
                Subscribe
              </button>
              <button 
                onClick={openLogin} 
                className="bg-[#111] hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all shadow-inner"
              >
                Log In
              </button>
            </div>
          )}
        </div>
        
        {/* Right Side: Mobile Icons */}
        <div className="lg:hidden flex items-center gap-1 text-gray-400">
          {session ? (
            <>
              <Link href="/account" className="hover:text-white p-2 transition-colors">
                {session.user?.image ? <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full border border-gray-600" /> : <User size={22} />}
              </Link>
              <button onClick={() => signOut()} className="hover:text-red-400 p-2 transition-colors"><LogOut size={22} /></button>
            </>
          ) : (
            <button onClick={openLogin} className="hover:text-white p-2 transition-colors"><User size={22} /></button>
          )}
        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="flex lg:hidden fixed bottom-0 left-0 right-0 z-[100] w-full h-16 bg-[#0a0a0a] border-t border-gray-800 items-center justify-between px-6 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <button onClick={toggleMobileSidebar} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
          <Menu size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Menu</span>
        </button>
        <Link href={`/${(activeSport || 'All').toLowerCase()}/rankings`} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors no-underline">
          <Users size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Ranks</span>
        </Link>
        <Link href={`/${(activeSport || 'All').toLowerCase()}/home`} className="flex flex-col items-center group no-underline">
          <div className={`relative -top-5 mb-[-16px] w-14 h-14 rounded-full flex items-center justify-center border-[4px] border-[#0a0a0a] shadow-xl ${currentGradient} text-white transition-transform group-hover:scale-105 group-active:scale-95 no-underline`}>
            <Flame size={24} className={currentView === 'home' ? 'animate-pulse' : ''} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors mt-1 whitespace-nowrap">The Wire</span>
        </Link>
        <a href="https://www.selloutcrowds.com/crowd/fsan" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors no-underline">
          <SelloutCrowds size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Crowd</span>
        </a>
        <button onClick={() => setIsSearchModalOpen(true)} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
          <Search size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Search</span>
        </button>
      </nav>

      {/* Render the Custom Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView} 
      />

      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
          <div className="w-full max-w-3xl">
            <div className="flex items-center gap-4 bg-[#1e1e1e] border border-gray-700 p-2 rounded-lg shadow-2xl">
              <Search size={24} className="text-gray-400 ml-3" />
              <input type="text" autoFocus placeholder="Search players, articles, videos..." className="flex-1 bg-transparent text-white text-xl p-2 outline-none placeholder-gray-500" />
              <button onClick={() => setIsSearchModalOpen(false)} className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}