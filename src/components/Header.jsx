"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X, ChevronsUpDown, User, LogOut, Users, Flame, Loader2, FileText, ChevronRight } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { themes } from '../utils/theme';
import { SelloutCrowds } from './Icons';
import AuthModal from './AuthModal';

const sportsList = [
  { name: 'All', icon: 'https://admin.fsan.com/wp-content/uploads/2023/11/FSAN-Icon.webp' },
  { name: 'Football', icon: 'https://admin.fsan.com/wp-content/uploads/2023/11/FFAN-Icon.webp' },
  { name: 'Basketball', icon: 'https://admin.fsan.com/wp-content/uploads/2023/11/FBBAN-Icon.webp' },
  { name: 'Baseball', icon: 'https://admin.fsan.com/wp-content/uploads/2023/11/FBAN-Icon.webp' },
  { name: 'Racing', icon: 'https://admin.fsan.com/wp-content/uploads/2026/05/FRAN-Icons_Logo.webp' },
  { name: 'Golf', icon: 'https://admin.fsan.com/wp-content/uploads/2026/05/FGAN-Icons_Logo.webp' },
];

export default function Header({ activeSport }) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSportDropdownOpen, setIsSportDropdownOpen] = useState(false);
  const [isSearchSportDropdownOpen, setIsSearchSportDropdownOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(null); 
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSport, setSearchSport] = useState(activeSport || 'All');
  
  const [suggestions, setSuggestions] = useState([]);
  
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
    Racing: 'https://admin.fsan.com/wp-content/uploads/2026/05/FRAN.webp',
    Golf: 'https://admin.fsan.com/wp-content/uploads/2026/05/FGAN.webp',
  };

  const currentLogo = logos[activeSport] || logos.All;

  const sportGradients = {
    All: 'bg-gradient-to-b from-gray-400 to-gray-700',
    Football: 'bg-gradient-to-b from-[#e42d38] to-[#8a1a20]',
    Basketball: 'bg-gradient-to-b from-[#e85d22] to-[#a33308]',
    Baseball: 'bg-gradient-to-b from-[#1b75bb] to-[#1e3b8a]',
    Racing: 'bg-gradient-to-b from-[#eab308] to-[#a16207]',
    Golf: 'bg-gradient-to-b from-[#019c9e] to-[#015e5f]',
  };
  
  const currentGradient = sportGradients[activeSport] || sportGradients.All;
  const basePath = activeSport === 'All' || !activeSport ? '' : `/${activeSport.toLowerCase()}`;

  useEffect(() => {
    setSearchSport(activeSport || 'All');
  }, [activeSport]);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://site.web.api.espn.com/apis/search/v2?query=${encodeURIComponent(searchQuery)}&limit=15`);
        
        if (res.ok) {
          const data = await res.json();
          const contents = data?.results?.flatMap(r => r.contents || []) || [];
          
          const athletes = contents.filter(c => {
            if (!c.uid || !c.uid.includes('~a:')) return false;
            
            let isAllowed = false;
            let isTargetSport = false;
            
            if (c.uid.includes('s:20~l:28')) { 
              isAllowed = true;
              if (searchSport === 'All' || searchSport === 'Football') isTargetSport = true;
            } else if (c.uid.includes('s:40~l:46')) { 
              isAllowed = true;
              if (searchSport === 'All' || searchSport === 'Basketball') isTargetSport = true;
            } else if (c.uid.includes('s:1~l:10')) { 
              isAllowed = true;
              if (searchSport === 'All' || searchSport === 'Baseball') isTargetSport = true;
            }
            
            return isAllowed && isTargetSport;
          });
          
          const mapped = athletes.map(a => {
             const slug = a.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
             
             let imageUrl = null;
             if (a.image && typeof a.image === 'string') imageUrl = a.image;
             else if (a.image?.url) imageUrl = a.image.url;
             else if (a.image?.default) imageUrl = a.image.default;
             else if (a.headshot && typeof a.headshot === 'string') imageUrl = a.headshot;
             else if (a.headshot?.href) imageUrl = a.headshot.href;

             return { name: a.displayName, slug, desc: a.description || '', image: imageUrl };
          });
          
          const unique = Array.from(new Map(mapped.map(item => [item.slug, item])).values()).slice(0, 4);
          setSuggestions(unique);
        }
      } catch(e) {}
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchSport]);

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
      const queryParams = new URLSearchParams({ query: query.trim() });
      try {
        const res = await fetch(`https://admin.fsan.com/graphql?${queryParams.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
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

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearchModalOpen(false);
    const searchBasePath = searchSport === 'All' ? '' : `/${searchSport.toLowerCase()}`;
    router.push(`${searchBasePath}/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleSuggestionClick = (slug) => {
    setIsSearchModalOpen(false);
    router.push(`/player/${slug}`);
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
        
        <div className="flex items-center gap-6">
          <Link href={basePath || '/'} className="shrink-0 flex items-center justify-center">
            <img src={currentLogo} alt="FSAN Logo" className="h-6 sm:h-8 w-auto object-contain transition-transform hover:scale-105" />
          </Link>
          
          <div className="hidden lg:flex items-center text-xs font-bold uppercase tracking-wider relative group">
            <button onClick={() => setIsSportDropdownOpen(!isSportDropdownOpen)} className="flex items-center gap-2 bg-[#252525] border border-gray-700 hover:border-gray-500 rounded-xl px-4 py-2 text-white transition-colors shadow-inner">
              <img src={sportsList.find(s => s.name === activeSport)?.icon || sportsList[0].icon} className="w-5 h-5 object-contain" alt="" />
              {activeSport || 'All'} Network
              <ChevronsUpDown size={14} className="text-gray-500 ml-2" />
            </button>
            
            {isSportDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSportDropdownOpen(false)}></div>
                <div className="absolute top-full left-0 mt-3 w-64 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-20 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 border-b border-gray-800/50">Select Network</div>
                  {sportsList.map((sport) => {
                    const targetPath = sport.name === 'All' ? `/${currentView}` : `/${sport.name.toLowerCase()}/${currentView}`;
                    return (
                      <Link 
                        key={sport.name} 
                        href={targetPath} 
                        onClick={() => setIsSportDropdownOpen(false)}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors no-underline ${activeSport === sport.name ? 'bg-[#252525] text-white shadow-inner' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                      >
                        <img src={sport.icon} alt={sport.name} className="w-6 h-6 object-contain" />
                        <span className="font-bold text-sm uppercase tracking-wider">{sport.name}</span>
                        {/* BULLETPROOF FALLBACK: Added || themes.All to prevent crashes if a sport isn't mapped properly */}
                        {activeSport === sport.name && <span className={`ml-auto w-2 h-2 rounded-full ${(themes[sport.name] || themes.All).bg} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></span>}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:flex flex-1 max-w-2xl px-8">
          <div className="relative w-full group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-500 group-focus-within:text-red-500 transition-colors" />
             </div>
             <input 
               type="text" 
               placeholder="Search athletes, teams, or fantasy advice..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               className="w-full bg-[#111] border border-gray-800 focus:border-red-500 text-white rounded-full py-2.5 pl-12 pr-4 outline-none transition-all shadow-inner text-sm font-medium placeholder-gray-600"
             />
             
             {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-800 bg-[#111]">
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Player Profiles</span>
                  </div>
                  <div className="flex flex-col">
                     {suggestions.map((athlete, idx) => (
                        <button 
                           key={idx}
                           onClick={() => handleSuggestionClick(athlete.slug)}
                           className="flex items-center gap-3 px-4 py-3 hover:bg-[#222] transition-colors border-b border-gray-800/50 last:border-0 text-left"
                        >
                           <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                              {athlete.image ? <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover" /> : <User size={14} className="text-gray-500" />}
                           </div>
                           <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-sm font-bold text-gray-200 truncate">{athlete.name}</span>
                              {athlete.desc && <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold truncate">{athlete.desc}</span>}
                           </div>
                           <ChevronRight size={14} className="text-gray-600" />
                        </button>
                     ))}
                  </div>
                  <button 
                     onClick={handleSearch}
                     className="w-full p-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-colors text-xs font-black uppercase tracking-widest border-t border-red-500/20"
                  >
                     View Full Results for "{searchQuery}"
                  </button>
                </div>
             )}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={() => setIsSearchModalOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-full transition-colors">
            <Search size={18} />
          </button>
          
          <button onClick={toggleMobileSidebar} className="lg:hidden p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-full transition-colors">
            <Menu size={18} />
          </button>

          {status === 'loading' ? (
            <div className="hidden lg:flex w-10 h-10 rounded-full bg-gray-800 animate-pulse" />
          ) : session ? (
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/account" className="flex items-center gap-3 group bg-[#111] border border-gray-800 hover:border-gray-600 rounded-full p-1 pr-4 transition-all no-underline">
                 <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-700 shadow-inner bg-gray-800 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
                   {session.user.image ? <img src={session.user.image} alt={session.user.name} className="w-full h-full object-cover" /> : <User size={16} />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight group-hover:text-gray-400 transition-colors">My Account</span>
                    <span className="text-xs font-black text-gray-200 leading-tight group-hover:text-white transition-colors truncate max-w-[100px]">{session.user.name?.split(' ')[0]}</span>
                 </div>
              </Link>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={() => { setAuthModalView('login'); setIsAuthModalOpen(true); }} className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-colors px-2">
                Log In
              </button>
              <button onClick={() => { setAuthModalView('signup'); setIsAuthModalOpen(true); }} className={`px-5 py-2.5 rounded-full text-xs font-black text-white shadow-lg transition-all hover:scale-105 uppercase tracking-widest border-none ${currentGradient}`}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={(success) => {
          setIsAuthModalOpen(false);
          if (success) {
            router.refresh();
          }
        }} 
        initialView={authModalView} 
      />

      {isSearchModalOpen && (
        <div className="lg:hidden fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center p-4 border-b border-gray-800 bg-[#121212]">
            <Search size={20} className="text-gray-500 mr-3" />
            <input 
              type="text" 
              placeholder="Search athletes, teams, or news..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent text-white text-base outline-none font-medium placeholder-gray-600"
              autoFocus
            />
            <button onClick={() => setIsSearchModalOpen(false)} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-full transition-colors ml-2">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
             {suggestions.length > 0 ? (
                <div className="flex flex-col">
                   <div className="px-4 py-3 bg-[#111] border-b border-gray-800">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Player Profiles</span>
                   </div>
                   {suggestions.map((athlete, idx) => (
                      <button 
                         key={idx}
                         onClick={() => handleSuggestionClick(athlete.slug)}
                         className="flex items-center gap-3 px-4 py-4 border-b border-gray-800 hover:bg-[#1a1a1a] transition-colors text-left"
                      >
                         <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                            {athlete.image ? <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover" /> : <User size={16} className="text-gray-500" />}
                         </div>
                         <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-base font-bold text-gray-200 truncate">{athlete.name}</span>
                            {athlete.desc && <span className="text-xs text-gray-500 uppercase tracking-widest font-bold truncate">{athlete.desc}</span>}
                         </div>
                         <ChevronRight size={16} className="text-gray-600" />
                      </button>
                   ))}
                   <button 
                      onClick={handleSearch}
                      className="w-full p-4 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-colors text-sm font-black uppercase tracking-widest border-b border-red-500/20"
                   >
                      View All Results
                   </button>
                </div>
             ) : searchQuery.trim().length >= 3 ? (
                <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest flex flex-col items-center gap-4">
                   <Loader2 size={24} className="animate-spin text-gray-600" />
                   Searching Database...
                </div>
             ) : (
                <div className="p-8 text-center text-gray-600 font-bold uppercase tracking-widest text-sm">
                   Type at least 3 characters to search.
                </div>
             )}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90]">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none h-32 -top-16" />
        <div className="flex h-16 bg-[#0a0a0a] border-t border-gray-800 items-center justify-between px-6 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
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
                <Link key={item.id} href={item.url} target={item.url.startsWith('http') ? '_blank' : '_self'} className={`flex flex-col items-center gap-1 transition-colors no-underline ${pathname.includes(item.url) ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                  <Icon size={20} />
                  <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })
          ) : (
             <div className="w-full flex items-center justify-center py-4">
                <Loader2 size={24} className="animate-spin text-gray-600" />
             </div>
          )}
        </div>
      </div>
    </>
  );
}