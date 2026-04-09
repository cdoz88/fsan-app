"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FileText, Video, Mic, Flame, Users, Calculator, ArrowLeftRight, Shirt, HeartHandshake, ShoppingCart, X } from 'lucide-react';
import { Facebook, XIcon, Youtube, Instagram, TikTok, LinkedIn, SelloutCrowds } from './Icons';
import { themes } from '../utils/theme';

export default function Sidebar({ activeSport = 'All', proToolsMenu = [], connectMenu = [] }) {
  const { data: session, status } = useSession();
  const pathname = usePathname() || '';
  const pathParts = pathname.split('/').filter(Boolean);
  
  let currentView = '';
  if (pathParts.includes('home')) currentView = 'home';
  else if (pathParts.includes('articles')) currentView = 'articles';
  else if (pathParts.includes('videos')) currentView = 'videos';
  else if (pathParts.includes('podcasts')) currentView = 'podcasts';
  else if (pathParts.includes('teams') || pathParts.includes('player')) currentView = 'teams';

  const [isMobileOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  
  // Initialize tier as free, but add a loading state so we don't flash the wrong button
  const [userTier, setUserTier] = useState('free');
  const [isTierLoading, setIsTierLoading] = useState(true);

  const theme = themes[activeSport] || themes.All;
  const accentColor = theme.text;

  const sportGradients = {
    All: 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border-transparent',
    Football: 'bg-gradient-to-r from-[#e42d38] to-[#8a1a20] hover:from-[#f03a45] hover:to-[#a3222a] border-[#e42d38]',
    Basketball: 'bg-gradient-to-r from-[#e85d22] to-[#a33308] hover:from-[#f26d35] hover:to-[#bc4010] border-[#e85d22]',
    Baseball: 'bg-gradient-to-r from-[#1b75bb] to-[#1e3b8a] hover:from-[#2587d0] hover:to-[#2546a1] border-[#1b75bb]',
  };
  const currentGradient = sportGradients[activeSport] || sportGradients.All;

  const basePath = activeSport === 'All' ? '' : `/${activeSport.toLowerCase()}`;

  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
    window.addEventListener('toggleMobileMenu', handleToggle);
    return () => window.removeEventListener('toggleMobileMenu', handleToggle);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileOpen]);

  // Fetch the user's role to control the Go Pro button
  useEffect(() => {
    // If next-auth is still figuring out if the user is logged in, wait.
    if (status === 'loading') return;

    // If we know they aren't logged in, they are free. Stop loading.
    if (status === 'unauthenticated') {
      setUserTier('free');
      setIsTierLoading(false);
      return;
    }

    if (status === 'authenticated' && session?.user?.token) {
      const fetchUserRole = async () => {
        const query = `
          query GetViewerRole {
            viewer {
              roles {
                nodes {
                  name
                }
              }
            }
          }
        `;
        try {
          const res = await fetch('https://admin.fsan.com/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.user.token}`,
            },
            body: JSON.stringify({ query }),
            cache: 'no-store' 
          });
          const json = await res.json();
          if (json?.data?.viewer) {
            const roles = json.data.viewer.roles?.nodes?.map(r => {
                let roleName = r.name.toLowerCase();
                roleName = roleName.replace(/&#043;/g, '+');
                return roleName;
            }) || [];
            
            if (roles.some(r => r.includes('pro+') || r.includes('pro plus') || r.includes('pro_plus') || r.includes('pro-plus'))) {
              setUserTier('pro-plus');
            } else if (roles.some(r => r.includes('pro') || r.includes('pro member') || r.includes('fsan_pro'))) {
              setUserTier('pro');
            } else {
              setUserTier('free');
            }
          } else {
            setUserTier('free');
          }
        } catch (error) {
          console.error("Failed to fetch user role on sidebar.");
          setUserTier('free');
        } finally {
          // Whether it succeeds or fails, stop loading so a button can render
          setIsTierLoading(false);
        }
      };
      
      fetchUserRole();
    } else if (status === 'authenticated') {
      setIsTierLoading(false);
    }
  }, [status, session]);

  const getNavStyle = (viewName) => {
    const isActive = currentView === viewName;
    return isActive
      ? "flex items-center gap-3 text-[13px] font-bold transition-colors px-3 py-2.5 rounded-xl w-full text-left bg-[#252525] text-white shadow-inner border border-gray-700/50 no-underline"
      : "flex items-center gap-3 text-[13px] font-bold text-gray-400 hover:text-white transition-colors px-3 py-2.5 hover:bg-gray-800/30 rounded-xl w-full text-left no-underline";
  };

  const isDynamicActive = (url) => {
    const lowerUrl = url?.toLowerCase() || '';
    if (currentView === 'teams' && lowerUrl.includes('/teams')) return true;
    if (lowerUrl !== '/' && lowerUrl !== 'http://dummy.com/') {
       try {
          const urlPath = new URL(url, 'http://dummy.com').pathname;
          if (urlPath.length > 1 && pathname.includes(urlPath)) return true;
       } catch(e) {}
    }
    return false;
  };

  const getIconForLabel = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes('rank') || lower.includes('player') || lower.includes('team') || lower.includes('roster')) return Users;
    if (lower.includes('calc')) return Calculator;
    if (lower.includes('value') || lower.includes('trade')) return ArrowLeftRight;
    if (lower.includes('communit') || lower.includes('crowd')) return SelloutCrowds;
    if (lower.includes('jersey') || lower.includes('league')) return Shirt;
    if (lower.includes('charity')) return HeartHandshake;
    if (lower.includes('merch') || lower.includes('shop')) return ShoppingCart;
    return FileText; 
  };

  const socialLinksData = {
    All: { facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork', x: 'https://x.com/fsadvicenet', youtube: 'https://www.youtube.com/@FFAdviceNet', tiktok: 'https://www.tiktok.com/@fsadvicenetwork', linkedin: 'https://www.linkedin.com/company/fantasy-sports-advice', sellout: 'https://www.selloutcrowds.com/crowd/fsan', instagram: null },
    Football: { facebook: 'https://www.facebook.com/fantasyfootballadvicenetwork', x: 'https://x.com/FFAdviceNet', youtube: 'https://www.youtube.com/@FFAdviceNet', instagram: 'https://www.instagram.com/ffadvicenet/', sellout: '#', tiktok: null, linkedin: null },
    Basketball: { facebook: null, x: 'https://x.com/FBBAdviceNet', youtube: 'https://www.youtube.com/@FBBAdviceNet', instagram: 'https://www.instagram.com/fbkadvicenet/', sellout: 'https://www.selloutcrowds.com/crowd/fbban', tiktok: null, linkedin: null },
    Baseball: { facebook: null, x: 'https://x.com/FBAdviceNet', youtube: 'https://www.youtube.com/@FBAdviceNet', instagram: 'https://www.instagram.com/fbadvicenet/', sellout: 'https://www.selloutcrowds.com/crowd/fban', tiktok: null, linkedin: null },
  };
  const currentLinks = socialLinksData[activeSport] || socialLinksData.All;

  const sidebarMenus = {
    All: {
      proTools: [
        { name: 'Player Rankings', icon: Users, href: '#' },
        { name: 'Trade Calculator', icon: Calculator, href: '#' },
        { name: 'Trade Value Chart', icon: ArrowLeftRight, href: '#' },
      ],
      connect: [
        { name: 'Exclusive Community', icon: SelloutCrowds, href: '#' },
        { name: 'Join A Jersey League', icon: Shirt, href: '#' },
        { name: 'Play for Charity', icon: HeartHandshake, href: '#' },
        { name: 'Merch Shop', icon: ShoppingCart, href: 'https://fsan.shop', external: true },
      ]
    },
    Football: {
      proTools: [
        { name: 'Player Rankings', icon: Users, href: '#' },
        { name: 'Trade Calculator', icon: Calculator, href: '#' },
        { name: 'Trade Value Chart', icon: ArrowLeftRight, href: '#' },
      ],
      connect: [
        { name: 'Exclusive Community', icon: SelloutCrowds, href: '#' },
        { name: 'Join A Jersey League', icon: Shirt, href: '#' },
        { name: 'Play for Charity', icon: HeartHandshake, href: '#' },
        { name: 'Merch Shop', icon: ShoppingCart, href: 'https://fsan.shop', external: true },
      ]
    },
    Basketball: {
      proTools: [
        { name: 'Player Rankings', icon: Users, href: '#' },
        { name: 'Trade Calculator', icon: Calculator, href: '#' },
      ],
      connect: [
        { name: 'Exclusive Community', icon: SelloutCrowds, href: '#' },
        { name: 'Join A Jersey League', icon: Shirt, href: '#' },
        { name: 'Merch Shop', icon: ShoppingCart, href: 'https://fsan.shop', external: true },
      ]
    },
    Baseball: {
      proTools: [
        { name: 'Player Rankings', icon: Users, href: '#' },
      ],
      connect: [
        { name: 'Exclusive Community', icon: SelloutCrowds, href: '#' },
        { name: 'Merch Shop', icon: ShoppingCart, href: 'https://fsan.shop', external: true },
      ]
    }
  };

  const currentMenu = sidebarMenus[activeSport] || sidebarMenus.All;

  const SocialIcon = ({ id, href, IconComponent }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer" 
      onMouseEnter={() => setHoveredSocial(id)}
      onMouseLeave={() => setHoveredSocial(null)}
      style={{ color: hoveredSocial === id ? theme.hex : '#6b7280' }}
      className="transition-colors duration-200"
    >
      <IconComponent size={18} />
    </a>
  );

  return (
    <>
      <div 
        className={`lg:hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div className={`
        fixed inset-y-0 left-0 z-[101] w-[280px] bg-[#0a0a0a] border-r border-gray-800 overflow-y-auto px-4 py-8 shadow-2xl
        transform transition-transform duration-300 ease-in-out flex flex-col gap-4
        lg:static lg:w-[240px] lg:z-auto lg:transform-none lg:border-none lg:bg-transparent lg:overflow-visible lg:px-0 lg:py-0 lg:shadow-none lg:pt-4 lg:translate-x-0 lg:flex-shrink-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="lg:hidden flex justify-end mb-4">
           <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-900 rounded-full border border-gray-700 text-gray-400 hover:text-white">
             <X size={20} />
           </button>
        </div>

        <div className="lg:sticky lg:top-20 flex flex-col gap-4 pb-24 lg:pb-0">
          
          {/* BROWSE NETWORK */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 shadow-xl">
             <h4 className="text-gray-500 font-black uppercase tracking-widest text-[9px] mb-3 px-1 italic">Browse Network</h4>
             <div className="flex flex-col gap-1">
                <Link href={`${basePath}/home`} onClick={() => setIsMobileMenuOpen(false)} className={getNavStyle('home')}>
                  <Flame size={18} className={currentView === 'home' ? 'text-white' : accentColor} /> The Wire
                </Link>
                <Link href={`${basePath}/articles`} onClick={() => setIsMobileMenuOpen(false)} className={getNavStyle('articles')}>
                  <FileText size={18} className={currentView === 'articles' ? 'text-white' : accentColor} /> All Articles
                </Link>
                <Link href={`${basePath}/videos`} onClick={() => setIsMobileMenuOpen(false)} className={getNavStyle('videos')}>
                  <Video size={18} className={currentView === 'videos' ? 'text-white' : accentColor} /> All Videos
                </Link>
                <Link href={`${basePath}/podcasts`} onClick={() => setIsMobileMenuOpen(false)} className={getNavStyle('podcasts')}>
                  <Mic size={18} className={currentView === 'podcasts' ? 'text-white' : accentColor} /> All Podcasts
                </Link>
             </div>
          </div>

          {/* DYNAMIC PRO TOOLS */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 shadow-xl">
             <h4 className="text-gray-500 font-black uppercase tracking-widest text-[9px] mb-3 px-1 italic">Pro Tools</h4>
             <div className="flex flex-col gap-1">
                {proToolsMenu && proToolsMenu.length > 0 ? (
                  proToolsMenu.map((item) => {
                    const Icon = getIconForLabel(item.label);
                    const active = isDynamicActive(item.url);
                    return (
                      <Link 
                        key={item.id} 
                        href={item.url} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        target={item.url.startsWith('http') ? "_blank" : undefined}
                        rel={item.url.startsWith('http') ? "noopener noreferrer" : undefined}
                        className={active ? getNavStyle('home') : "flex items-center gap-3 text-[13px] font-bold text-gray-400 hover:text-white transition-colors px-3 py-2.5 hover:bg-gray-800/30 rounded-xl w-full text-left no-underline group"}
                      >
                        <Icon size={18} className={`${active ? 'text-white' : theme.text} group-hover:text-white transition-colors`} /> {item.label}
                      </Link>
                    );
                  })
                ) : (
                  currentMenu.proTools.map((tool, idx) => {
                    const Icon = tool.icon;
                    const active = isDynamicActive(tool.href);
                    return (
                      <Link key={idx} href={tool.href} onClick={() => setIsMobileMenuOpen(false)} className={active ? getNavStyle('home') : "flex items-center gap-3 text-[13px] font-bold text-gray-400 hover:text-white transition-colors px-3 py-2.5 hover:bg-gray-800/30 rounded-xl w-full text-left no-underline group"}>
                        <Icon size={18} className={`${active ? 'text-white' : theme.text} group-hover:text-white transition-colors`} /> {tool.name}
                      </Link>
                    );
                  })
                )}
             </div>
          </div>
          
          {/* DYNAMIC CONNECT */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 shadow-xl">
             <h4 className="text-gray-500 font-black uppercase tracking-widest text-[9px] mb-3 px-1 italic">Connect</h4>
             <div className="flex flex-col gap-1">
                {connectMenu && connectMenu.length > 0 ? (
                  connectMenu.map((item) => {
                    const Icon = getIconForLabel(item.label);
                    const active = isDynamicActive(item.url);
                    return (
                      <Link 
                        key={item.id} 
                        href={item.url} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        target={item.url.startsWith('http') ? "_blank" : undefined}
                        rel={item.url.startsWith('http') ? "noopener noreferrer" : undefined}
                        className={active ? getNavStyle('home') : "flex items-center gap-3 text-[13px] font-bold text-gray-400 hover:text-white transition-colors px-3 py-2.5 hover:bg-gray-800/30 rounded-xl w-full text-left no-underline group"}
                      >
                        <Icon size={18} className={`${active ? 'text-white' : theme.text} group-hover:text-white transition-colors`} /> {item.label}
                      </Link>
                    );
                  })
                ) : (
                  currentMenu.connect.map((item, idx) => {
                    const Icon = item.icon;
                    const active = isDynamicActive(item.href);
                    return (
                      <Link 
                        key={idx} 
                        href={item.href} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className={active ? getNavStyle('home') : "flex items-center gap-3 text-[13px] font-bold text-gray-400 hover:text-white transition-colors px-3 py-2.5 hover:bg-gray-800/30 rounded-xl w-full text-left no-underline group"}
                      >
                        <Icon size={18} className={`${active ? 'text-white' : theme.text} group-hover:text-white transition-colors`} /> {item.name}
                      </Link>
                    );
                  })
                )}
             </div>
          </div>

          {/* GO PRO BUTTON */}
          {!isTierLoading && userTier !== 'pro-plus' && (
            <div className="mt-2 mb-4 animate-in fade-in duration-300">
              {activeSport === 'All' ? (
                <div className="p-[2px] rounded-[14px] bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-shadow">
                  <Link 
                    href="/subscribe" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex justify-center items-center py-3.5 rounded-xl text-white font-black uppercase tracking-widest text-sm transition-all no-underline ${currentGradient} border-none`}
                  >
                    {userTier === 'pro' ? 'UPGRADE TO PRO+' : 'GO PRO'}
                  </Link>
                </div>
              ) : (
                <Link 
                  href="/subscribe" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full flex justify-center items-center py-3.5 rounded-xl text-white font-black uppercase tracking-widest text-sm shadow-lg border transition-all no-underline ${currentGradient}`}
                >
                  {userTier === 'pro' ? 'UPGRADE TO PRO+' : 'GO PRO'}
                </Link>
              )}
            </div>
          )}

          {/* FOOTER / SOCIALS */}
          <div className="flex flex-col items-center justify-center gap-3 mt-1 mb-4">
             <div className="flex flex-wrap items-center justify-center gap-4 px-2">
                {currentLinks.sellout && <SocialIcon id="sellout" href={currentLinks.sellout} IconComponent={SelloutCrowds} />}
                {currentLinks.facebook && <SocialIcon id="fb" href={currentLinks.facebook} IconComponent={Facebook} />}
                {currentLinks.x && <SocialIcon id="x" href={currentLinks.x} IconComponent={XIcon} />}
                {currentLinks.youtube && <SocialIcon id="yt" href={currentLinks.youtube} IconComponent={Youtube} />}
                {currentLinks.instagram && <SocialIcon id="ig" href={currentLinks.instagram} IconComponent={Instagram} />}
                {currentLinks.tiktok && <SocialIcon id="tt" href={currentLinks.tiktok} IconComponent={TikTok} />}
                {currentLinks.linkedin && <SocialIcon id="li" href={currentLinks.linkedin} IconComponent={LinkedIn} />}
             </div>
             <div className="text-center">
               <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} FSAN Network</p>
               <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest italic">All Rights Reserved</p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}