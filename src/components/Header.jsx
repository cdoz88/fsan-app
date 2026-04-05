"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X, ChevronsUpDown, User, LogOut, Users, Flame, Loader2, FileText } from 'lucide-react';
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
  const [mobileMenu, setMobileMenu] = useState(null); 
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); 
  
  // --- NEW SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSport, setSearchSport] = useState(activeSport || 'All');
  
  const { data: session, status } = useSession();
  
  const pathname = usePathname() || '';
  const router = useRouter();
  const pathParts = pathname.split('/').filter(Boolean);
  
  const currentView = pathParts.includes('home') ? 'home' : pathParts.includes('articles') ? 'articles' : pathParts.includes('videos') ? 'videos' : pathParts.includes('podcasts') ? 'podcasts' : 'home';

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
  const basePath = activeSport === 'All' || !activeSport ? '' : `/${activeSport.toLowerCase()}`;

  // Keep searchSport synced if activeSport prop changes while navigating
  useEffect(() => {
    setSearchSport(activeSport || 'All');
  }, [activeSport]);

  // FETCH WORDPRESS MOBILE MENU
  useEffect(() => {
    const fetchMobileMenu = async () => {
      const query = `
        query GetMobileMenu {
          menu(id: "mobile-nav", idType: SLUG) {
            menuItems {
              nodes {
                id
                label
                url
              }
            }
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
        if (json?.data?.menu?.menuItems?.nodes) {
          setMobileMenu(json.data.menu.menuItems.nodes);
        }
      } catch (e) {
        console.error('Failed to fetch mobile menu', e);
      }
    };
    fetchMobileMenu();
  }, []);

  const toggleMobileSidebar = () => {
    window.dispatchEvent(new Event('toggleMobileMenu'));
  };

  const openLogin = () => {
    setAuthModalView('login');
    setIsAuthModalOpen(true);
  };

  // --- EXECUTE SEARCH ROUTING ---
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearchModalOpen(false);
    const searchBasePath = searchSport === 'All' ? '' : `/${searchSport.toLowerCase()}`;
    router.push(`${searchBasePath}/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const getMobileIcon = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes('menu')) return Menu;
    if (lower.includes('rank') || lower.includes('user')) return Users;
    if (lower.includes('wire') || lower.includes('home') || lower.includes('flame')) return Flame;
    if (lower.includes('crowd') || lower.includes('sellout')) return SelloutCrowds;
    if (lower.includes('search')) return Search;
    return FileText; 
  };

  return (
    <>
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-3 flex justify-between items-center z-[100] sticky top-0 shadow-md">
        
        <div className="relative flex items-center">
          <Link href={`${basePath}/home`} className="flex items-center hover:opacity-80 transition-opacity">
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
                  const targetPath = sport.name === 'All' ? `/${currentView}` : `/${sport.name.toLowerCase()}/${currentView}`;
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
              <button onClick={() => signOut({ callbackUrl: '/home' })} className="hover:text-red-400 transition-colors no-underline">Log Out</button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/subscribe" 
                className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border border-gray-600 text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all shadow-lg no-underline"
              >
                Subscribe
              </Link>
              <button 
                onClick={openLogin} 
                className="bg-[#111] hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all shadow-inner"
              >
                Log In
              </button>
            </div>
          )}
        </div>
        
        <div className="lg:hidden flex items-center gap-1 text-gray-400">
          {session ? (
            <>
              <Link href="/account" className="hover:text-white p-2 transition-colors">
                {session.user?.image ? <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full border border-gray-600" /> : <User size={22} />}
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/home' })} className="hover:text-red-400 p-2 transition-colors"><LogOut size={22} /></button>
            </>
          ) : (
            <button onClick={openLogin} className="hover:text-white p-2 transition-colors"><User size={22} /></button>
          )}
        </div>

      </div>

      <nav className="flex lg:hidden fixed bottom-0 left-0 right-0 z-[100] w-full h-16 bg-[#0a0a0a] border-t border-gray-800 items-center justify-between px-6 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        {mobileMenu ? (
          mobileMenu.map((item, index) => {
            const Icon = getMobileIcon(item.label);
            const isMenuBtn = item.url.includes('#menu');
            const isSearchBtn = item.url.includes('#search');
            const isCenterBtn = index === Math.floor(mobileMenu.length / 2);

            if (isMenuBtn) {
              return (
                <button key={item.id} onClick={toggleMobileSidebar} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                  <Icon size={20} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                </button>
              );
            }

            if (isSearchBtn) {
              return (
                <button key={item.id} onClick={() => setIsSearchModalOpen(true)} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
                  <Icon size={20} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
                </button>
              );
            }

            if (isCenterBtn) {
              return (
                <Link key={item.id} href={item.url} target={item.url.startsWith('http') ? '_blank' : '_self'} className="flex flex-col items-center group no-underline">
                  <div className={`relative -top-5 mb-[-16px] w-14 h-14 rounded-full flex items-center justify-center border-[4px] border-[#0a0a0a] shadow-xl ${currentGradient} text-white transition-transform group-hover:scale-105 group-active:scale-95 no-underline`}>
                    <Icon size={24} className={pathname.includes(item.url) ? 'animate-pulse' : ''} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors mt-1 whitespace-nowrap">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link key={item.id} href={item.url} target={item.url.startsWith('http') ? '_blank' : '_self'} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors no-underline">
                <Icon size={20} />
                <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })
        ) : (
          <>
            <button onClick={toggleMobileSidebar} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors">
              <Menu size={20} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Menu</span>
            </button>
            <Link href={`${basePath}/rankings`} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors no-underline">
              <Users size={20} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Ranks</span>
            </Link>
            <Link href={`${basePath}/home`} className="flex flex-col items-center group no-underline">
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
          </>
        )}
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView} 
      />

      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
          <div className="w-full max-w-3xl">
            {/* UPDATED SEARCH BOX WITH SPORT DROPDOWN */}
            <div className="flex items-center bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl overflow-hidden focus-within:border-gray-500 transition-colors">
              <Search size={24} className="text-gray-400 ml-4 shrink-0" />
              
              <input 
                type="text" 
                autoFocus 
                placeholder="Search players, articles, videos..." 
                className="flex-1 bg-transparent text-white text-lg md:text-xl p-4 outline-none placeholder-gray-600" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              
              <div className="relative border-l border-gray-700 bg-[#151515] flex items-center h-full">
                <select
                  value={searchSport}
                  onChange={(e) => setSearchSport(e.target.value)}
                  className="bg-transparent text-gray-300 hover:text-white text-[10px] sm:text-xs font-black uppercase tracking-widest outline-none cursor-pointer appearance-none pl-4 pr-10 py-5 w-full h-full"
                >
                  <option value="All" className="bg-[#1a1a1a]">All Sports</option>
                  <option value="Football" className="bg-[#1a1a1a]">Football</option>
                  <option value="Basketball" className="bg-[#1a1a1a]">Basketball</option>
                  <option value="Baseball" className="bg-[#1a1a1a]">Baseball</option>
                </select>
                <ChevronsUpDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

            </div>
            
            <div className="mt-4 flex justify-end gap-2 px-2">
              <button onClick={() => setIsSearchModalOpen(false)} className="px-4 py-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest border border-transparent hover:border-gray-700">Cancel</button>
              <button onClick={handleSearch} className="px-6 py-2 bg-white text-black rounded-md transition-colors hover:bg-gray-200 text-xs font-black uppercase tracking-widest shadow-lg">Search</button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}