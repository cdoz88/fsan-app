"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X, ChevronsUpDown, User, Users, Flame, Loader2, FileText, ChevronRight, Activity, Gift, Trophy } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { themes } from '../utils/theme';
import { SelloutCrowds } from './Icons';
import AuthModal from './AuthModal';
import { useLeague } from '../context/LeagueContext';

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

  // Determine user tier based on session roles or tier property
  let userTier = 'free';
  if (session?.user) {
      const roles = session.user.roles || [];
      const isStaff = roles.some(r => r.includes('administrator') || r.includes('editor') || r.includes('author'));
      
      if (isStaff) {
        userTier = 'pro-plus';
      } else if (session.user.tier) {
        userTier = session.user.tier.replace('_', '-');
      }
  }

  const pathname = usePathname() || '';
  const router = useRouter();
  const pathParts = pathname.split('/').filter(Boolean);
  
  const currentView = pathParts.includes('home') ? 'home' : pathParts.includes('articles') ? 'articles' : pathParts.includes('videos') ? 'videos' : pathParts.includes('podcasts') ? 'podcasts' : 'home';

  const { allLeagues, setActiveLeague, getActiveLeagueData } = useLeague();
  const [isLeagueDropdownOpen, setIsLeagueDropdownOpen] = useState(false);

  const validSportsForLeagues = ['football', 'basketball', 'baseball'];
  const currentSportFormatted = activeSport?.toLowerCase() || 'all';
  const showLeagueSelector = validSportsForLeagues.includes(currentSportFormatted);
  const currentSportLeagues = allLeagues ? allLeagues.filter(l => l.sport === currentSportFormatted) : [];
  const activeLeagueData = getActiveLeagueData(currentSportFormatted);

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
    if (lower.includes('score')) return Activity;
    if (lower.includes('perk') || lower.includes('gift')) return Gift;
    return FileText; 
  };

  return (
    <>
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-3 flex justify-between items-center z-[100] sticky top-0 shadow-md">
        
        {/* Left Side: Logo & Network Selector */}
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

        {/* Right Side: Search, Profile, and League Selector */}
        <div className="flex items-center">
          
          {/* Desktop Auth & Search */}
          <div className="hidden lg:flex items-center text-xs font-bold uppercase tracking-widest text-gray-400">
            <button onClick={() => setIsSearchModalOpen(true)} className="hover:text-white transition-colors flex items-center gap-2 group">
              <Search size={18} className="group-hover:text-white transition-colors" />
              <span>Search</span>
            </button>
            
            <div className="h-5 w-px bg-gray-700 mx-6"></div>
            
            {status === "loading" ? (
              <div className="flex items-center"><Loader2 size={16} className="animate-spin text-gray-500" /></div>
            ) : session ? (
              <Link href="/account" className="text-white hover:text-gray-300 transition-colors flex items-center gap-2 no-underline">
                {session.user?.image && !session.user.image.includes('wp_user_avatar') ? (
                  <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full border border-gray-600 object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                    <User size={14} className="text-gray-400" />
                  </div>
                )}
                Hi, {session.user?.name?.split(' ')[0] || 'User'}
              </Link>
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
          
          {/* Mobile Auth */}
          <div className="lg:hidden flex items-center text-gray-400">
            {status === "loading" ? null : session ? (
              <Link href="/account" className="hover:text-white p-2 transition-colors">
                {session.user?.image && !session.user.image.includes('wp_user_avatar') ? (
                  <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full border border-gray-600 object-cover" /> 
                ) : (
                  <User size={22} />
                )}
              </Link>
            ) : (
              <button onClick={openLogin} className="hover:text-white p-2 transition-colors"><User size={22} /></button>
            )}
          </div>

          {/* Context-Aware League Selector */}
          {showLeagueSelector && (
            <div className="relative ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-800 flex items-center z-[100]">
              <button
                onClick={() => setIsLeagueDropdownOpen(!isLeagueDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#111] hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-4 sm:py-2 transition-all shadow-inner max-w-[140px] sm:max-w-[200px]"
              >
                {activeLeagueData ? (
                   activeLeagueData.avatar ? (
                      <img src={`https://sleepercdn.com/avatars/thumbs/${activeLeagueData.avatar}`} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full" alt="League" onError={(e) => e.target.style.display = 'none'} />
                   ) : (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                          <span className="text-[8px] sm:text-[10px] font-bold text-white">{activeLeagueData.name.substring(0,2).toUpperCase()}</span>
                      </div>
                   )
                ) : (
                   <Trophy size={14} className="text-gray-400 sm:w-5 sm:h-5" />
                )}
                <span className="text-[10px] sm:text-xs font-bold text-gray-300 truncate">
                  {activeLeagueData ? activeLeagueData.name : 'Select League'}
                </span>
                <ChevronsUpDown size={12} className="text-gray-500 shrink-0" />
              </button>

              {isLeagueDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-[90]" onClick={() => setIsLeagueDropdownOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-3 w-64 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-[100] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 border-b border-gray-800/50">
                      {activeSport} Context
                    </div>
                    <button
                      onClick={() => { setActiveLeague(currentSportFormatted, null); setIsLeagueDropdownOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${!activeLeagueData ? 'bg-[#252525] text-white shadow-inner' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                        <Trophy size={14} className={!activeLeagueData ? "text-blue-400" : "text-gray-400"} />
                      </div>
                      <div className="flex flex-col">
                          <span className="font-bold text-sm">Select League</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Default Rankings & Math</span>
                      </div>
                    </button>

                    {currentSportLeagues.map(league => (
                      <button
                        key={league.id}
                        onClick={() => { setActiveLeague(currentSportFormatted, league.id); setIsLeagueDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeLeagueData?.id === league.id ? 'bg-[#252525] text-white shadow-inner' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                      >
                        {league.avatar ? (
                          <img src={`https://sleepercdn.com/avatars/thumbs/${league.avatar}`} className="w-6 h-6 rounded-full shrink-0 border border-gray-700" alt="League" onError={(e) => e.target.style.display = 'none'} />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                            <span className="text-[10px] font-bold text-white">{league.name.substring(0,2).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="flex flex-col truncate">
                          <span className="font-bold text-sm truncate text-white">{league.name}</span>
                          <span className="text-[10px] uppercase tracking-widest text-gray-500">{league.totalTeams} Teams • {league.platform}</span>
                        </div>
                      </button>
                    ))}

                    {/* FREEMIUM & MANAGEMENT BUTTON */}
                    <div className="px-4 py-4 border-t border-gray-800 mt-2 text-center">
                      {!session ? (
                         <>
                          <p className="text-xs text-gray-400 mb-3">Login required to sync leagues.</p>
                          <button onClick={() => { setIsLeagueDropdownOpen(false); openLogin(); }} className="inline-block w-full bg-[#252525] hover:bg-gray-700 border border-gray-700 text-white font-bold text-[10px] uppercase tracking-widest py-2 rounded-lg transition-colors shadow-inner">
                              Log In to Sync
                          </button>
                         </>
                      ) : userTier === 'free' ? (
                         <>
                          <p className="text-xs text-gray-400 mb-3">Pro subscription required.</p>
                          <Link href="/subscribe" onClick={() => setIsLeagueDropdownOpen(false)} className="inline-block w-full bg-gradient-to-r from-[#e42d38] to-[#8a1a20] hover:from-[#f03a45] hover:to-[#a3222a] text-white font-bold text-[10px] uppercase tracking-widest py-2 rounded-lg transition-colors shadow-lg">
                              Upgrade to Sync
                          </Link>
                         </>
                      ) : currentSportLeagues.length === 0 ? (
                        <>
                          <p className="text-xs text-gray-400 mb-3">No {activeSport} leagues synced.</p>
                          <Link href="/account#synced-leagues" onClick={() => setIsLeagueDropdownOpen(false)} className="inline-block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase tracking-widest py-2 rounded-lg transition-colors">
                              Sync Leagues
                          </Link>
                        </>
                      ) : (
                        <Link href="/account#synced-leagues" onClick={() => setIsLeagueDropdownOpen(false)} className="inline-block w-full bg-[#252525] hover:bg-gray-700 border border-gray-700 text-white font-bold text-[10px] uppercase tracking-widest py-2 rounded-lg transition-colors shadow-inner">
                            Manage Leagues
                        </Link>
                      )}
                    </div>

                  </div>
                </>
              )}
            </div>
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
                // 🚀 FIXED: Removed mb-[-36px] from the container to stop pulling the text up
                <Link key={item.id} href={item.url} target={item.url.startsWith('http') ? '_blank' : '_self'} className="flex flex-col items-center group no-underline relative -top-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-[4px] border-[#0a0a0a] shadow-xl ${currentGradient} text-white transition-transform group-hover:scale-105 group-active:scale-95 no-underline`}>
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
            <Link href={`${basePath}/scores`} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors no-underline">
              <Activity size={20} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Scores</span>
            </Link>
            
            {/* 🚀 FIXED: Removed mb-[-36px] from the fallback layout as well */}
            <Link href={`${basePath}/home`} className="flex flex-col items-center group no-underline relative -top-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-[4px] border-[#0a0a0a] shadow-xl ${currentGradient} text-white transition-transform group-hover:scale-105 group-active:scale-95 no-underline`}>
                <Flame size={24} className={currentView === 'home' ? 'animate-pulse' : ''} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors mt-1 whitespace-nowrap">The Wire</span>
            </Link>
            
            <Link href="/account#my-perks" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors no-underline">
              <Gift size={20} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Perks</span>
            </Link>
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
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4">
          
          <div className="w-full max-w-4xl relative flex flex-col">
            
            <div className="flex justify-end mb-3 pr-1">
              <button 
                onClick={() => setIsSearchModalOpen(false)} 
                className="p-2 bg-[#1a1a1a] hover:bg-gray-800 rounded-full transition-all text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 shadow-2xl group"
              >
                <X size={20} className="opacity-80 group-hover:opacity-100" />
              </button>
            </div>

            <div className="p-[2px] rounded-[24px] bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-20">
              <div className="flex items-center bg-[#1e1e1e] rounded-[22px] h-16 md:h-20 w-full">
                
                <div className="relative h-full flex items-center border-r border-gray-800 bg-[#151515] rounded-l-[22px]">
                  <button 
                    onClick={() => setIsSearchSportDropdownOpen(!isSearchSportDropdownOpen)} 
                    className="flex items-center justify-center h-full px-4 md:px-5 gap-1.5 md:gap-2 text-gray-300 hover:text-white transition-colors rounded-l-[22px] group min-w-[60px] md:min-w-[80px]"
                    title={`Search within: ${searchSport}`}
                  >
                    {sportsList.find(s => s.name === searchSport) && (
                      <img 
                        src={sportsList.find(s => s.name === searchSport).icon} 
                        className="w-6 h-6 md:w-7 md:h-7 object-contain group-hover:scale-110 transition-transform" 
                        alt={searchSport} 
                      />
                    )}
                    <ChevronsUpDown size={14} className="text-gray-500 shrink-0" />
                  </button>

                  {isSearchSportDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsSearchSportDropdownOpen(false)}></div>
                      <div className="absolute top-full left-0 mt-3 w-48 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl z-20 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800/50 mb-1">Search Within</div>
                        {sportsList.map(s => (
                          <button key={s.name} onClick={() => { setSearchSport(s.name); setIsSearchSportDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${searchSport === s.name ? 'bg-[#252525] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <img src={s.icon} className="w-5 h-5 object-contain" alt="" />
                            <span className="font-bold text-xs uppercase tracking-wider">{s.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <Search size={24} className="text-gray-400 ml-4 shrink-0 hidden md:block" />
                
                <input 
                  type="text" 
                  autoFocus 
                  placeholder="Search players, articles, videos..." 
                  className="flex-1 bg-transparent text-white text-lg md:text-xl p-4 md:p-6 outline-none placeholder-gray-600 h-full w-full min-w-0" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
                
                <button onClick={handleSearch} className="h-full px-6 md:px-8 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 text-white transition-all text-xs md:text-sm font-black uppercase tracking-widest border-l border-gray-700 rounded-r-[22px] flex items-center gap-2 shadow-inner group shrink-0">
                  <span className="hidden md:inline">Search</span>
                  <Search size={20} className="md:hidden" />
                </button>
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-3 bg-[#1a1a1a] border border-gray-700 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 animate-in fade-in slide-in-from-top-2">
                <div className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800/50 bg-[#111]">
                  Suggested Players
                </div>
                {suggestions.map(s => (
                  <button 
                    key={s.slug} 
                    onClick={() => handleSuggestionClick(s.slug)} 
                    className="w-full flex items-center gap-5 p-4 md:px-6 md:py-5 border-b border-gray-800 last:border-0 hover:bg-[#252525] transition-colors text-left group"
                  >
                    <div className="w-12 h-12 rounded-full bg-black border border-gray-700 flex items-center justify-center shrink-0 group-hover:border-gray-500 group-hover:scale-110 transition-all shadow-inner overflow-hidden">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="text-gray-500 group-hover:text-white transition-colors" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-black text-lg md:text-xl group-hover:text-blue-400 transition-colors leading-tight">{s.name}</span>
                      {s.desc && <span className="text-gray-400 text-[10px] md:text-xs font-bold tracking-wide uppercase mt-1">{s.desc}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
          </div>
        </div>
      )}
    </>
  );
}