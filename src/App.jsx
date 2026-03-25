import React, { useState } from 'react';
import { Search, ShoppingBag, Trophy, PlayCircle, Youtube, Twitter, Facebook, Instagram, ChevronDown, Menu, X, ArrowLeft } from 'lucide-react';

export default function App() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSport, setActiveSport] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'videos', 'articles'

  // Dynamic theme colors for the "App" feel
  const themes = {
    All: { text: 'text-gray-300', border: 'border-gray-500', hoverText: 'hover:text-white', hoverBorder: 'hover:border-gray-400', bg: 'bg-gradient-to-r from-gray-500 to-gray-700', toolsBg: 'bg-[#1a1a1a] border-gray-800' },
    Football: { text: 'text-red-500', border: 'border-red-600', hoverText: 'hover:text-red-400', hoverBorder: 'hover:border-red-500', bg: 'bg-red-600', toolsBg: 'bg-red-900/20 border-red-900/50' },
    Basketball: { text: 'text-orange-500', border: 'border-orange-500', hoverText: 'hover:text-orange-400', hoverBorder: 'hover:border-orange-500', bg: 'bg-orange-500', toolsBg: 'bg-orange-900/20 border-orange-900/50' },
    Baseball: { text: 'text-blue-500', border: 'border-blue-500', hoverText: 'hover:text-blue-400', hoverBorder: 'hover:border-blue-500', bg: 'bg-blue-500', toolsBg: 'bg-blue-900/20 border-blue-900/50' },
  };
  const theme = themes[activeSport];

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 font-sans">
      
      {/* --- TOP BAR (Utility Nav) --- */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-2 flex justify-between items-center text-xs font-semibold tracking-wide">
        
        {/* Logo Area */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-black rounded-lg border border-gray-600 flex items-center justify-center shadow-lg">
            <span className="font-bold text-2xl text-white italic">F</span>
          </div>
          <div className="hidden sm:flex flex-col uppercase">
            <span className="text-white text-lg leading-none tracking-widest font-bold">Fantasy Sports</span>
            <span className="text-gray-400 text-[10px] tracking-[0.2em]">Advice Network</span>
          </div>
        </div>

        {/* Desktop Top Links */}
        <div className="hidden lg:flex items-center gap-6 text-gray-400 uppercase">
          <a href="#" className="hover:text-white transition-colors">Join Our Community</a>
          <a href="#" className="hover:text-white transition-colors">Join The Napkin League</a>
          <a href="#" className="hover:text-white transition-colors">Join A Jersey League</a>
          <a href="#" className="hover:text-white transition-colors">Subscribe</a>
          <a href="#" className="hover:text-white transition-colors">Log In</a>
        </div>
        
        {/* Tablet / Mobile Right Controls */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Tablet Sports Switcher (Hidden on Mobile, Hidden on Desktop) */}
          <div className="hidden md:flex bg-[#121212] p-1 rounded-full border border-gray-800 items-center shadow-inner relative">
            {['All', 'Football', 'Basketball', 'Baseball'].map((sport) => (
              <button 
                key={`tablet-${sport}`}
                onClick={() => {
                  setActiveSport(sport);
                  setCurrentView('home'); 
                }}
                className={`relative z-10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeSport === sport ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {activeSport === sport && (
                  <span className={`absolute inset-0 rounded-full opacity-20 ${themes[sport].bg}`}></span>
                )}
                {sport}
              </button>
            ))}
          </div>

          <button onClick={() => setIsSearchModalOpen(true)} className="text-gray-400 hover:text-white p-2 transition-colors">
            <Search size={20} />
          </button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2 hover:text-gray-300 transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* --- MAIN NAVIGATION BAR --- */}
      <div className="bg-[#1e1e1e] border-b border-gray-800 px-4 py-3 hidden lg:flex justify-between items-center text-sm font-bold uppercase tracking-wider">
        
        {/* Left - App Mode Switcher */}
        <div className="flex items-center gap-4">
          <div className="bg-[#121212] p-1 rounded-full border border-gray-800 flex items-center shadow-inner relative">
            {['All', 'Football', 'Basketball', 'Baseball'].map((sport) => (
              <button 
                key={sport}
                onClick={() => {
                  setActiveSport(sport);
                  setCurrentView('home'); // Reset to home dashboard when changing sports
                }}
                className={`relative z-10 px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeSport === sport ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {activeSport === sport && (
                  <span className={`absolute inset-0 rounded-full opacity-20 ${themes[sport].bg}`}></span>
                )}
                {sport}
              </button>
            ))}
          </div>
        </div>

        {/* Right - Search Icon & Social Icons */}
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

      {/* --- DYNAMIC TOOLS BAR (Replaced Ticker) --- */}
      <div className={`${theme.toolsBg} text-xs py-2.5 px-6 overflow-x-auto flex items-center gap-6 border-b transition-colors duration-300 scrollbar-hide shadow-inner`}>
        <span className={`font-black uppercase tracking-widest ${theme.text} shrink-0`}>
          Tools
        </span>
        <div className="h-4 w-px bg-gray-600 shrink-0"></div>
        <div className="flex items-center gap-8 whitespace-nowrap text-gray-400 font-bold uppercase tracking-wider">
          <a href="#" className={`hover:${theme.text} transition-colors`}>Trade Analyzer</a>
          <a href="#" className={`hover:${theme.text} transition-colors`}>Dynasty Rankings</a>
          <a href="#" className={`hover:${theme.text} transition-colors`}>Rookie Mock Draft</a>
          <a href="#" className={`hover:${theme.text} transition-colors`}>Start / Sit Optimizer</a>
          <a href="#" className={`hover:${theme.text} transition-colors`}>DFS Projections</a>
        </div>
      </div>

      {/* --- CONDITIONAL RENDERING FOR VIEWS --- */}
      {currentView === 'home' && (
        <main className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
          
          {/* LEFT COLUMN: VIDEOS (1/3 on tablet, 3/12 on desktop) */}
          <div className="md:col-span-1 lg:col-span-3 flex flex-col gap-4">
            <div className={`bg-[#1a1a1a] p-3 border-b-2 ${theme.border} font-bold uppercase tracking-wider text-sm shadow-md transition-colors duration-300`}>
              Latest Videos
            </div>
          
            <div className="flex flex-col gap-4">
              {/* Video Item 1 */}
              <div onClick={() => setSelectedItem({ type: 'video', title: 'Rookie WR Tiers Exposed!', date: 'MARCH 21, 2026', sport: 'Football' })} className="group cursor-pointer relative rounded overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg hover:border-red-600 transition-all">
                <div className="h-40 bg-gradient-to-tr from-[#3a1c1c] to-[#111] relative flex items-center justify-center">
                   <PlayCircle size={48} className="text-white/60 group-hover:text-white transition-all transform group-hover:scale-110 z-10" />
                </div>
                <div className="p-3">
                  <span className="text-gray-400 font-bold text-xs flex items-center">
                    {activeSport === 'All' && <span className="w-2 h-2 rounded-full bg-red-500 mr-2 shrink-0"></span>}
                    MARCH 21, 2026
                  </span>
                  <h3 className="font-bold text-sm mt-1 leading-tight group-hover:text-red-500 transition-colors">Rookie WR Tiers Exposed!</h3>
                </div>
              </div>

              {/* Video Item 2 */}
              <div onClick={() => setSelectedItem({ type: 'video', title: 'Trade Him! dynasty strategy', date: 'MARCH 21, 2026', sport: 'Football' })} className="group cursor-pointer relative rounded overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg hover:border-red-600 transition-all">
                <div className="h-40 bg-gradient-to-tr from-[#1c233a] to-[#111] relative flex items-center justify-center">
                   <PlayCircle size={48} className="text-white/60 group-hover:text-white transition-all transform group-hover:scale-110 z-10" />
                </div>
                <div className="p-3">
                  <span className="text-gray-400 font-bold text-xs flex items-center">
                    {activeSport === 'All' && <span className="w-2 h-2 rounded-full bg-red-500 mr-2 shrink-0"></span>}
                    MARCH 21, 2026
                  </span>
                  <h3 className="font-bold text-sm mt-1 leading-tight group-hover:text-red-500 transition-colors">Trade Him! dynasty strategy</h3>
                </div>
              </div>
               {/* Video Item 3 */}
               <div onClick={() => setSelectedItem({ type: 'video', title: 'Weekly Tipoff: Playoff Push', date: 'MARCH 20, 2026', sport: 'Basketball' })} className="group cursor-pointer relative rounded overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg hover:border-orange-500 transition-all">
                <div className="h-40 bg-gradient-to-tr from-[#3a2f1c] to-[#111] relative flex items-center justify-center">
                   <PlayCircle size={48} className="text-white/60 group-hover:text-white transition-all transform group-hover:scale-110 z-10" />
                </div>
                <div className="p-3">
                  <span className="text-gray-400 font-bold text-xs flex items-center">
                    {activeSport === 'All' && <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 shrink-0"></span>}
                    MARCH 20, 2026
                  </span>
                  <h3 className="font-bold text-sm mt-1 leading-tight group-hover:text-orange-500 transition-colors">Weekly Tipoff: Playoff Push</h3>
                </div>
              </div>

              {/* Video Item 4 */}
              <div onClick={() => setSelectedItem({ type: 'video', title: 'Spring Training Standouts', date: 'MARCH 19, 2026', sport: 'Baseball' })} className="group cursor-pointer relative rounded overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg hover:border-blue-500 transition-all">
                <div className="h-40 bg-gradient-to-tr from-[#1c2a3a] to-[#111] relative flex items-center justify-center">
                   <PlayCircle size={48} className="text-white/60 group-hover:text-white transition-all transform group-hover:scale-110 z-10" />
                </div>
                <div className="p-3">
                  <span className="text-gray-400 font-bold text-xs flex items-center">
                    {activeSport === 'All' && <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shrink-0"></span>}
                    MARCH 19, 2026
                  </span>
                  <h3 className="font-bold text-sm mt-1 leading-tight group-hover:text-blue-500 transition-colors">Spring Training Standouts</h3>
                </div>
              </div>

               {/* Video Item 5 */}
               <div onClick={() => setSelectedItem({ type: 'video', title: 'Rookie Draft Mock 3.0', date: 'MARCH 18, 2026', sport: 'Football' })} className="group cursor-pointer relative rounded overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg hover:border-red-600 transition-all">
                <div className="h-40 bg-gradient-to-tr from-[#3a1c2f] to-[#111] relative flex items-center justify-center">
                   <PlayCircle size={48} className="text-white/60 group-hover:text-white transition-all transform group-hover:scale-110 z-10" />
                </div>
                <div className="p-3">
                  <span className="text-gray-400 font-bold text-xs flex items-center">
                    {activeSport === 'All' && <span className="w-2 h-2 rounded-full bg-red-500 mr-2 shrink-0"></span>}
                    MARCH 18, 2026
                  </span>
                  <h3 className="font-bold text-sm mt-1 leading-tight group-hover:text-red-500 transition-colors">Rookie Draft Mock 3.0</h3>
                </div>
              </div>

              {activeSport === 'All' ? (
                <div className="mt-2 p-3 bg-[#161616] border border-gray-800 rounded-lg flex flex-col items-center gap-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">View All Videos By Sport</span>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => { setActiveSport('Football'); setCurrentView('videos'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-red-900/20 hover:text-red-500 hover:border-red-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NFL</button>
                    <button onClick={() => { setActiveSport('Basketball'); setCurrentView('videos'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-orange-900/20 hover:text-orange-500 hover:border-orange-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NBA</button>
                    <button onClick={() => { setActiveSport('Baseball'); setCurrentView('videos'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-blue-900/20 hover:text-blue-500 hover:border-blue-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">MLB</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setCurrentView('videos')} className={`w-full py-3 mt-2 border border-gray-700 rounded text-xs font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] ${theme.hoverText} ${theme.hoverBorder}`}>
                  View All {activeSport} Videos
                </button>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: ARTICLES (2/3 on tablet, 6/12 on desktop) */}
          <div className="md:col-span-2 lg:col-span-6 flex flex-col gap-4">
            <div className={`bg-[#1a1a1a] p-3 border-b-2 ${theme.border} font-bold uppercase tracking-wider text-sm shadow-md flex justify-between items-center transition-colors duration-300`}>
              <span>Latest Articles</span>
            </div>

            {/* Hero Article */}
            <div onClick={() => setSelectedItem({ type: 'article', title: '2026 Fantasy Coaching Impacts: 3 Game-Changers', date: 'MARCH 23, 2026', sport: 'Football' })} className="group cursor-pointer rounded-lg overflow-hidden bg-[#1e1e1e] shadow-xl border border-gray-800 hover:border-gray-600 transition-all relative">
              <div className="h-[400px] w-full bg-gradient-to-b from-[#2a3044] to-[#0a0a0a] flex flex-col justify-end p-6 relative">
                 {/* Decorative background element indicating image placement */}
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-gray-900 to-black"></div>

                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2">
                     {activeSport === 'All' && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>}
                     <span className="text-gray-400 font-bold text-xs">MARCH 23, 2026</span>
                   </div>
                   <h2 className="text-3xl font-bold text-white mb-2 leading-tight group-hover:text-red-400 transition-colors">
                     2026 Fantasy Coaching Impacts: 3 Game-Changers
                   </h2>
                   <p className="text-sm text-gray-300 line-clamp-2">
                     Kevin Stefanski, Klint Kubiak, and John Harbaugh reshape fantasy value fast. The 2026 Fantasy Football Coaching Impacts look massive already. Falcons, Raiders, and Giants lead the surge...
                   </p>
                 </div>
              </div>
            </div>

            {/* Sub Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              
              {/* Sub Article 1 */}
              <div onClick={() => setSelectedItem({ type: 'article', title: 'Fantasy Football Account Security Crisis On X', date: 'MARCH 22, 2026', sport: 'Football' })} className="group cursor-pointer rounded overflow-hidden bg-[#1e1e1e] shadow-lg border border-gray-800 flex flex-row h-32 hover:bg-[#252525] transition-colors">
                <div className="w-1/3 bg-gradient-to-br from-red-900 to-[#111] relative">
                </div>
                <div className="w-2/3 p-3 flex flex-col justify-center">
                   <div className="flex items-center gap-1.5 mb-1">
                     {activeSport === 'All' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>}
                     <span className="text-gray-400 font-bold text-[10px]">MARCH 22, 2026</span>
                   </div>
                   <h3 className="font-bold text-sm leading-tight group-hover:text-red-400 transition-colors">Fantasy Football Account Security Crisis On X</h3>
                </div>
              </div>

              {/* Sub Article 2 */}
              <div onClick={() => setSelectedItem({ type: 'article', title: 'Top 5 Rookie TE Prospects for 2026', date: 'MARCH 20, 2026', sport: 'Football' })} className="group cursor-pointer rounded overflow-hidden bg-[#1e1e1e] shadow-lg border border-gray-800 flex flex-row h-32 hover:bg-[#252525] transition-colors">
                <div className="w-1/3 bg-gradient-to-br from-blue-900 to-[#111] relative">
                </div>
                <div className="w-2/3 p-3 flex flex-col justify-center">
                   <div className="flex items-center gap-1.5 mb-1">
                     {activeSport === 'All' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>}
                     <span className="text-gray-400 font-bold text-[10px]">MARCH 20, 2026</span>
                   </div>
                   <h3 className="font-bold text-sm leading-tight group-hover:text-red-400 transition-colors">Top 5 Rookie TE Prospects for 2026</h3>
                </div>
              </div>

              {/* Sub Article 3 */}
              <div onClick={() => setSelectedItem({ type: 'article', title: 'Top 5 Rookie RB Prospects for 2026', date: 'MARCH 19, 2026', sport: 'Football' })} className="group cursor-pointer rounded overflow-hidden bg-[#1e1e1e] shadow-lg border border-gray-800 flex flex-row h-32 hover:bg-[#252525] transition-colors">
                <div className="w-1/3 bg-gradient-to-br from-green-900 to-[#111] relative">
                </div>
                <div className="w-2/3 p-3 flex flex-col justify-center">
                   <div className="flex items-center gap-1.5 mb-1">
                     {activeSport === 'All' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>}
                     <span className="text-gray-400 font-bold text-[10px]">MARCH 19, 2026</span>
                   </div>
                   <h3 className="font-bold text-sm leading-tight group-hover:text-red-400 transition-colors">Top 5 Rookie RB Prospects for 2026</h3>
                </div>
              </div>

               {/* Sub Article 4 */}
               <div onClick={() => setSelectedItem({ type: 'article', title: '2026 NFL Free Agency Day 1: Risers & Fallers', date: 'MARCH 18, 2026', sport: 'Football' })} className="group cursor-pointer rounded overflow-hidden bg-[#1e1e1e] shadow-lg border border-gray-800 flex flex-row h-32 hover:bg-[#252525] transition-colors">
                <div className="w-1/3 bg-gradient-to-br from-yellow-900 to-[#111] relative">
                </div>
                <div className="w-2/3 p-3 flex flex-col justify-center">
                   <div className="flex items-center gap-1.5 mb-1">
                     {activeSport === 'All' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>}
                     <span className="text-gray-400 font-bold text-[10px]">MARCH 18, 2026</span>
                   </div>
                   <h3 className="font-bold text-sm leading-tight group-hover:text-red-400 transition-colors">2026 NFL Free Agency Day 1: Risers & Fallers</h3>
                </div>
              </div>

            </div>

            {/* --- NEW MORE ARTICLES LIST --- */}
            <div className="mt-6 flex flex-col gap-4">
              <div className={`bg-[#1a1a1a] p-3 border-b-2 ${theme.border} font-bold uppercase tracking-wider text-sm shadow-md transition-colors duration-300`}>
                More Articles
              </div>

              {[1, 2, 3, 4, 5].map((item) => {
                const mockSport = item === 1 || item === 4 ? 'Football' : item === 2 ? 'Basketball' : 'Baseball';
                const sportColor = mockSport === 'Football' ? 'bg-red-500' : mockSport === 'Basketball' ? 'bg-orange-500' : 'bg-blue-500';
                const titles = [
                  "Dynasty Players To Trade For Before NFL Free Agency",
                  "NBA Trade Deadline: Biggest Winners and Losers",
                  "Spring Training: Top 10 Prospects to Watch",
                  "Week 16 Waiver Wire: Must-Add Players & Deep Sleepers",
                  "The Post-Combine Landscape: Dynasty Rookie Mock Draft"
                ];
                
                return (
                  <div key={item} onClick={() => setSelectedItem({ type: 'article', title: titles[item-1], date: `MARCH ${18 - item}, 2026`, sport: mockSport })} className="group cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded p-3 flex gap-4 hover:border-gray-600 transition-all shadow-sm relative overflow-hidden">
                    <div className="w-32 h-24 bg-gradient-to-br from-gray-700 to-black rounded shrink-0 relative overflow-hidden border border-gray-800">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                    </div>
                    
                    <div className="flex flex-col justify-center flex-1">
                      <div className="flex gap-2 items-center mb-1.5">
                        {activeSport === 'All' && <span className={`w-2 h-2 rounded-full ${sportColor} shrink-0`}></span>}
                        <span className="text-gray-500 text-[10px] font-bold">MARCH {18 - item}, 2026</span>
                      </div>
                      <h3 className="font-bold text-base mb-1.5 leading-tight group-hover:text-red-400 transition-colors">
                        {titles[item-1]}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        Check out our latest strategy breakdown and see how you can beat the market in your fantasy leagues this season...
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {activeSport === 'All' ? (
                <div className="mt-2 p-3 bg-[#161616] border border-gray-800 rounded-lg flex flex-col items-center gap-3">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Load More Articles</span>
                  <div className="flex gap-2 w-full">
                    <button onClick={() => { setActiveSport('Football'); setCurrentView('articles'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-red-900/20 hover:text-red-500 hover:border-red-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NFL Articles</button>
                    <button onClick={() => { setActiveSport('Basketball'); setCurrentView('articles'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-orange-900/20 hover:text-orange-500 hover:border-orange-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">NBA Articles</button>
                    <button onClick={() => { setActiveSport('Baseball'); setCurrentView('articles'); }} className="flex-1 py-2 bg-[#1e1e1e] hover:bg-blue-900/20 hover:text-blue-500 hover:border-blue-800 border border-gray-700 rounded text-[10px] font-bold uppercase transition-all">MLB Articles</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setCurrentView('articles')} className={`w-full py-3 mt-2 border border-gray-700 rounded text-xs font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] ${theme.hoverText} ${theme.hoverBorder}`}>
                  Load More {activeSport} Articles
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ADS & PROMOS (Hidden on mobile/tablet, 3/12 on desktop) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">
            
            {/* Rookie Guide Promo */}
            <div>
              <div className="bg-[#1a1a1a] p-3 border-b-2 border-red-600 font-bold uppercase tracking-wider text-sm shadow-md mb-4">
                2026 Rookie Guide
              </div>
              <div className="bg-gradient-to-b from-red-900 to-black border border-red-800 p-4 rounded-lg text-center cursor-pointer hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all relative overflow-hidden">
                 {/* Diagonal stripes background */}
                 <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]"></div>
                 
                 <div className="relative z-10">
                   <h3 className="text-red-500 font-black text-2xl italic tracking-tighter mb-1 uppercase drop-shadow-md">Dominate</h3>
                   <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">Your Draft With The Ultimate<br/>Rookie Breakdown!</p>
                   
                   <div className="bg-black/50 p-2 rounded text-left text-[10px] text-green-400 font-bold mb-3 border border-gray-800">
                      <p>✓ Detailed Scouting Reports</p>
                      <p>✓ Positional Rankings</p>
                      <p>✓ Team Fit Analysis</p>
                   </div>

                   <button className="bg-green-600 hover:bg-green-500 text-white w-full py-2 rounded-full font-black text-xs uppercase tracking-wider transform transition hover:scale-105 shadow-lg">
                     Only $10 - Get Access
                   </button>
                 </div>
              </div>
            </div>

            {/* Merch Promo */}
            <div>
              <div className="bg-[#1a1a1a] p-3 border-b-2 border-gray-600 font-bold uppercase tracking-wider text-sm shadow-md mb-4">
                Get Merch!
              </div>
              <div className="bg-[#111] border border-gray-800 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-purple-600 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-black z-0"></div>
                <h3 className="text-purple-500 font-black text-xl italic uppercase z-10 group-hover:scale-110 transition-transform">Fantasy Apparel</h3>
                <p className="text-gray-400 text-xs z-10 mt-2">FSAN.SHOP</p>
                <button className="mt-4 bg-transparent border-2 border-purple-600 text-purple-400 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-purple-600 hover:text-white transition-colors z-10">
                  Shop Now
                </button>
              </div>
            </div>

            {/* Social Links Panel */}
            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-between bg-[#c4302b] hover:bg-red-700 text-white p-3 rounded shadow transition-colors group">
                <div className="flex items-center gap-3">
                  <Youtube size={20} />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-sm uppercase leading-none">YouTube</span>
                    <span className="text-[10px] text-red-200">SUBSCRIBE</span>
                  </div>
                </div>
                <ChevronDown size={16} className="-rotate-90 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button className="flex items-center justify-between bg-[#1DA1F2] hover:bg-blue-500 text-white p-3 rounded shadow transition-colors group">
                <div className="flex items-center gap-3">
                  <Twitter size={20} />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-sm uppercase leading-none">Twitter</span>
                    <span className="text-[10px] text-blue-200">FOLLOW US</span>
                  </div>
                </div>
                <ChevronDown size={16} className="-rotate-90 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button className="flex items-center justify-between bg-[#4267B2] hover:bg-blue-700 text-white p-3 rounded shadow transition-colors group">
                <div className="flex items-center gap-3">
                  <Facebook size={20} />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-sm uppercase leading-none">Facebook</span>
                    <span className="text-[10px] text-blue-200">LIKE OUR PAGE</span>
                  </div>
                </div>
                <ChevronDown size={16} className="-rotate-90 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

          </div>
        </main>
      )}

      {/* --- VIDEOS ARCHIVE VIEW --- */}
      {currentView === 'videos' && (
        <main className="max-w-[1600px] mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-4 mb-6">
             <button onClick={() => setCurrentView('home')} className="hover:text-white flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-wider transition-colors"><ArrowLeft size={16}/> Back to Dashboard</button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
            <div>
              <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Videos</h1>
              <p className="text-gray-400 mt-2 text-sm">Browse the latest video breakdowns, mock drafts, and podcasts.</p>
            </div>
            
            {/* Archive Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button className={`px-4 py-1.5 rounded-full bg-[#1e1e1e] border ${theme.border} ${theme.text} text-[10px] font-bold uppercase whitespace-nowrap`}>Latest</button>
              <button className="px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-500 text-[10px] font-bold uppercase whitespace-nowrap transition-colors">Trending</button>
              <button className="px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-500 text-[10px] font-bold uppercase whitespace-nowrap transition-colors">Live Streams</button>
              <button className="px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-500 text-[10px] font-bold uppercase whitespace-nowrap transition-colors">Shorts</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} onClick={() => setSelectedItem({ type: 'video', title: `Archive Video Title ${i}`, date: 'MARCH 15, 2026', sport: activeSport === 'All' ? 'Football' : activeSport })} className="group cursor-pointer relative rounded-lg overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg hover:border-gray-500 transition-all flex flex-col h-full">
                <div className="aspect-video bg-gradient-to-tr from-gray-900 to-black relative flex items-center justify-center">
                   <PlayCircle size={48} className="text-white/40 group-hover:text-white group-hover:scale-110 transition-all z-10" />
                   {/* Thumbnail overlay gradient */}
                   <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    {activeSport === 'All' && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>}
                    <span className="text-gray-400 font-bold text-[10px]">MARCH 15, 2026</span>
                  </div>
                  <h3 className={`font-bold text-base leading-tight ${theme.hoverText} transition-colors mb-2`}>
                    In-Depth {activeSport === 'All' ? 'Fantasy' : activeSport} Strategy Session & Mock Draft
                  </h3>
                  <p className="text-xs text-gray-500 mt-auto line-clamp-2">Join the crew as they break down everything you need to know for your upcoming drafts...</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className={`w-full py-4 mt-8 border border-gray-700 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] ${theme.hoverText} ${theme.hoverBorder}`}>
            Load More Videos
          </button>
        </main>
      )}

      {/* --- ARTICLES ARCHIVE VIEW --- */}
      {currentView === 'articles' && (
        <main className="max-w-[1200px] mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-4 mb-6">
             <button onClick={() => setCurrentView('home')} className="hover:text-white flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-wider transition-colors"><ArrowLeft size={16}/> Back to Dashboard</button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
            <div>
              <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Articles</h1>
              <p className="text-gray-400 mt-2 text-sm">Read the latest analysis, rankings updates, and news.</p>
            </div>
            
            {/* Archive Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button className={`px-4 py-1.5 rounded-full bg-[#1e1e1e] border ${theme.border} ${theme.text} text-[10px] font-bold uppercase whitespace-nowrap`}>All Articles</button>
              <button className="px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-500 text-[10px] font-bold uppercase whitespace-nowrap transition-colors">News</button>
              <button className="px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-500 text-[10px] font-bold uppercase whitespace-nowrap transition-colors">Rankings</button>
              <button className="px-4 py-1.5 rounded-full bg-[#1e1e1e] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-500 text-[10px] font-bold uppercase whitespace-nowrap transition-colors">Dynasty</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} onClick={() => setSelectedItem({ type: 'article', title: `Archive Article Title ${i}`, date: 'MARCH 14, 2026', sport: activeSport === 'All' ? 'Football' : activeSport })} className="group cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row gap-6 hover:border-gray-500 transition-all shadow-md">
                <div className="w-full sm:w-64 h-40 bg-gradient-to-br from-gray-800 to-black rounded-md shrink-0 relative overflow-hidden">
                  {/* Image placeholder */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                </div>
                
                <div className="flex flex-col justify-center py-2">
                  <div className="flex gap-2 items-center mb-2">
                    {activeSport === 'All' && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>}
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">MARCH 14, 2026 • By FSAN Staff</span>
                  </div>
                  <h3 className={`font-black text-2xl mb-3 leading-tight ${theme.hoverText} transition-colors`}>
                    The Ultimate {activeSport === 'All' ? 'Fantasy' : activeSport} Strategy Guide for 2026
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-3">
                    We break down everything you need to know heading into the new season. From deep sleepers to high-profile busts, our analysts cover the entire landscape so you can dominate your leagues with confidence and the right data.
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className={`w-full py-4 mt-8 border border-gray-700 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors bg-[#1a1a1a] ${theme.hoverText} ${theme.hoverBorder}`}>
            Load Older Articles
          </button>
        </main>
      )}

      {/* --- CONTENT MODALS (Articles / Videos) --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-sm flex justify-center p-4 sm:p-8 overflow-y-auto">
          {/* Background Click to Close */}
          <div className="fixed inset-0" onClick={() => setSelectedItem(null)}></div>
          
          {/* Close Button */}
          <button onClick={() => setSelectedItem(null)} className="fixed top-6 right-6 z-50 p-2 bg-[#1a1a1a] border border-gray-700 hover:bg-red-600 hover:border-red-600 rounded-full text-white transition-all shadow-xl">
            <X size={24} />
          </button>

          {/* Modal Container */}
          <div className={`relative z-10 w-full animate-in fade-in zoom-in-95 duration-200 ${selectedItem.type === 'video' ? 'max-w-6xl' : 'max-w-4xl'} my-auto bg-[#121212] border border-gray-800 rounded-xl shadow-2xl overflow-hidden`}>
            
            {/* --- VIDEO MODAL LAYOUT --- */}
            {selectedItem.type === 'video' && (
              <div className="flex flex-col lg:flex-row h-full max-h-[85vh]">
                {/* Left: Video Player Area */}
                <div className="lg:w-3/4 flex flex-col bg-black">
                  <div className="w-full aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative border-b border-gray-800">
                     <PlayCircle size={64} className="text-white/30" />
                     <div className="absolute bottom-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase rounded">YouTube API Demo Placeholder</div>
                  </div>
                  <div className="p-6 bg-[#121212] flex-1 overflow-y-auto">
                    <div className="flex gap-2 items-center mb-2">
                      <span className={`w-2 h-2 rounded-full ${selectedItem.sport === 'Football' ? 'bg-red-500' : selectedItem.sport === 'Basketball' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                      <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">{selectedItem.sport} • {selectedItem.date}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">{selectedItem.title}</h1>
                    <div className="flex items-center gap-4 border-t border-gray-800 pt-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700 border border-gray-600"></div>
                      <div>
                        <p className="font-bold text-sm">FSAN Official</p>
                        <p className="text-xs text-gray-500">125K Subscribers</p>
                      </div>
                      <button className="ml-auto bg-white text-black px-4 py-1.5 rounded-full font-bold text-xs hover:bg-gray-200">Subscribe</button>
                    </div>
                  </div>
                </div>
                
                {/* Right: Up Next Playlist Area */}
                <div className="lg:w-1/4 bg-[#161616] border-l border-gray-800 flex flex-col max-h-[85vh]">
                  <div className="p-4 border-b border-gray-800 font-bold text-sm uppercase tracking-wider">Up Next</div>
                  <div className="overflow-y-auto p-4 flex flex-col gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex gap-3 group cursor-pointer">
                        <div className="w-24 h-16 bg-gray-800 rounded shrink-0 relative flex items-center justify-center">
                          <PlayCircle size={16} className="text-white/50" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="text-xs font-bold leading-tight group-hover:text-red-400 line-clamp-2">More {selectedItem.sport} content coming up next in the playlist...</h4>
                          <span className="text-[10px] text-gray-500 mt-1">FSAN Official</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- ARTICLE MODAL LAYOUT --- */}
            {selectedItem.type === 'article' && (
              <div className="flex flex-col max-h-[85vh] overflow-y-auto">
                {/* Article Hero Image */}
                <div className="w-full h-64 md:h-80 bg-gradient-to-br from-gray-800 to-black relative">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900/80 to-[#121212]"></div>
                </div>
                
                {/* Article Content */}
                <div className="p-6 md:p-10 -mt-16 relative z-10 max-w-3xl mx-auto w-full">
                  <div className="flex gap-2 items-center mb-3">
                    <span className={`w-2 h-2 rounded-full ${selectedItem.sport === 'Football' ? 'bg-red-500' : selectedItem.sport === 'Basketball' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                    <span className="text-gray-300 font-bold text-xs uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-gray-700">
                      {selectedItem.sport} • {selectedItem.date}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight drop-shadow-lg">
                    {selectedItem.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 border-b border-gray-800 pb-6 mb-8">
                    <div className="w-12 h-12 rounded-full bg-gray-700 border border-gray-600"></div>
                    <div>
                      <p className="font-bold text-sm">By John Doe</p>
                      <p className="text-xs text-red-500 font-bold">Senior {selectedItem.sport} Analyst</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <button className="w-8 h-8 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors"><Twitter size={14} /></button>
                      <button className="w-8 h-8 rounded-full bg-[#4267B2]/10 text-[#4267B2] flex items-center justify-center hover:bg-[#4267B2] hover:text-white transition-colors"><Facebook size={14} /></button>
                    </div>
                  </div>

                  <div className="prose prose-invert prose-red max-w-none text-gray-300 space-y-6">
                    <p className="text-lg font-medium text-gray-200">
                      The landscape of fantasy {selectedItem.sport.toLowerCase()} is shifting rapidly. With recent changes in coaching and free agency, managers need to be prepared for massive value swings.
                    </p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                    <div className="bg-[#1a1a1a] p-6 border-l-4 border-red-600 my-8 italic text-gray-400">
                      "This is the exact type of rapid-fire insight that wins championships. Don't sleep on these depth chart changes."
                    </div>
                    <p>
                      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- SEARCH MODAL OVERLAY --- */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4">
          <div className="w-full max-w-3xl">
            <div className="flex items-center gap-4 bg-[#1e1e1e] border border-gray-700 p-2 rounded-lg shadow-2xl">
              <Search size={24} className="text-red-500 ml-3" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search players, articles, videos..." 
                className="flex-1 bg-transparent text-white text-xl p-2 outline-none placeholder-gray-500"
              />
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mt-4 bg-[#1e1e1e] border border-gray-800 rounded-lg p-4 shadow-xl">
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-wider">Trending Searches</h4>
              <div className="flex flex-wrap gap-2">
                {['2026 Rookie Draft', 'Justin Fields Trade', 'Dynasty Rankings', 'Free Agency Winners', 'Trade Calculator'].map(term => (
                  <span key={term} className="bg-[#2a2a2a] hover:bg-red-900/40 hover:text-red-400 cursor-pointer text-xs font-bold px-3 py-1.5 rounded-full transition-colors border border-gray-700 hover:border-red-800">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex justify-end p-4 border-b border-gray-800 bg-[#121212]">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X size={32} />
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-6 text-lg font-bold uppercase tracking-widest p-8 overflow-y-auto h-full">
            
            {/* Mobile Only Sport Switcher */}
            <div className="md:hidden w-full mb-6 flex justify-center">
              <div className="bg-[#1e1e1e] p-1.5 rounded-full border border-gray-700 flex flex-wrap justify-center gap-1 shadow-inner w-full max-w-xs">
                {['All', 'Football', 'Basketball', 'Baseball'].map((sport) => (
                  <button 
                    key={`mobile-${sport}`}
                    onClick={() => {
                      setActiveSport(sport);
                      setCurrentView('home');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`relative z-10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex-1 ${activeSport === sport ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {activeSport === sport && (
                      <span className={`absolute inset-0 rounded-full opacity-30 ${themes[sport].bg}`}></span>
                    )}
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            <a href="#" className="hover:text-red-500 transition-colors">Subscribe</a>
            <a href="#" className="hover:text-red-500 transition-colors">Log In</a>
            
            <div className="w-16 h-px bg-gray-800 my-2"></div>
            
            <a href="#" className="hover:text-red-500 transition-colors text-center">Join Our Community</a>
            <a href="#" className="hover:text-red-500 transition-colors text-center">Join The Napkin League</a>
            <a href="#" className="hover:text-red-500 transition-colors text-center">Join A Jersey League</a>
            
            <div className="w-16 h-px bg-gray-800 my-2"></div>
            
            <div className="flex gap-8 mt-4">
              <Facebook size={28} className="text-gray-400 hover:text-[#4267B2] transition-colors cursor-pointer" />
              <Twitter size={28} className="text-gray-400 hover:text-[#1DA1F2] transition-colors cursor-pointer" />
              <Youtube size={28} className="text-gray-400 hover:text-[#c4302b] transition-colors cursor-pointer" />
              <Instagram size={28} className="text-gray-400 hover:text-pink-600 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}