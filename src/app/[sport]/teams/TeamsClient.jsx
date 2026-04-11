"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { Search, Users } from 'lucide-react';

export default function TeamsClient({ activeSport, teams, proToolsMenu, connectMenu }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    team.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bgImages = {
    All: 'https://admin.fsan.com/wp-content/uploads/2023/11/FSAN-Icon.webp',
    Football: 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp',
    Basketball: 'https://admin.fsan.com/wp-content/uploads/2026/04/nba-logo.webp',
    Baseball: 'https://admin.fsan.com/wp-content/uploads/2026/04/Major_League_Baseball_logo.webp'
  };

  const sportColors = {
    All: { primary: '#374151', secondary: '#1f2937' },
    Football: { primary: '#e42d38', secondary: '#8a1a20' },
    Basketball: { primary: '#e85d22', secondary: '#a33308' },
    Baseball: { primary: '#1b75bb', secondary: '#1e3b8a' },
  };

  const bgImage = bgImages[activeSport] || bgImages.All;
  const primaryColor = sportColors[activeSport]?.primary || sportColors.All.primary;
  const secondaryColor = sportColors[activeSport]?.secondary || sportColors.All.secondary;

  const leagueCards = [
    { id: 'nfl', name: 'NFL Rosters', sport: 'football', logo: 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp', gradient: 'from-red-600 to-red-900', shadow: 'hover:shadow-[0_0_40px_rgba(228,45,56,0.3)]' },
    { id: 'nba', name: 'NBA Rosters', sport: 'basketball', logo: 'https://admin.fsan.com/wp-content/uploads/2026/04/NBA-Logo.webp', gradient: 'from-orange-500 to-orange-800', shadow: 'hover:shadow-[0_0_40px_rgba(232,93,34,0.3)]' },
    { id: 'mlb', name: 'MLB Rosters', sport: 'baseball', logo: 'https://admin.fsan.com/wp-content/uploads/2026/04/Major_League_Baseball_logo.webp', gradient: 'from-blue-600 to-blue-900', shadow: 'hover:shadow-[0_0_40px_rgba(27,117,187,0.3)]' }
  ];

  return (
    <>
      <Header activeSport={activeSport} />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full">
        <Sidebar currentPath={`/${activeSport.toLowerCase()}/teams`} activeSport={activeSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0">
          <main className="flex-1 overflow-y-auto relative z-0 scrollbar-hide pb-24 pt-6">
            
            {activeSport === 'All' ? (
              // ALL SPORTS LANDING PAGE
              <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500 pt-8 lg:pt-16">
                <div className="text-center mb-12">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-700 shadow-inner">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-4">
                    Team Rosters
                  </h1>
                  <p className="text-gray-400 font-medium max-w-xl mx-auto">
                    Select a league below to view active rosters, depth charts, and player news for your favorite franchises.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  {leagueCards.map((league) => (
                    <Link
                      key={league.id}
                      href={`/${league.sport}/teams`}
                      className={`group relative bg-[#1a1a1a] rounded-3xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-500 hover:-translate-y-2 ${league.shadow} flex flex-col items-center p-8`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-b ${league.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      
                      <div className="w-32 h-32 sm:w-40 sm:h-40 mb-6 relative z-10 flex items-center justify-center">
                        <img 
                          src={league.logo} 
                          alt={league.name} 
                          className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      
                      <h2 className="text-xl font-black text-white uppercase tracking-wider relative z-10 group-hover:text-gray-200 transition-colors text-center w-full">
                        {league.name}
                      </h2>
                      <div className="h-1 w-12 bg-gray-700 mt-4 rounded-full group-hover:w-24 transition-all duration-500 relative z-10" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              // SPORT SPECIFIC TEAM GRID
              <>
                {/* HERO HEADER */}
                <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-6 shadow-2xl">
                  <div 
                    className="absolute inset-0 opacity-80 z-0" 
                    style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                  />
                  <img 
                    src={bgImage} 
                    alt={`${activeSport} Background`} 
                    className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
                  
                  <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start justify-end h-full px-6 md:px-10 pb-8">
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                      <Link href={`/${activeSport.toLowerCase()}/home`} className="hover:text-white transition-colors">{activeSport}</Link>
                      <span>/</span>
                      <span className="text-gray-200">Teams</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase">
                      {activeSport} Teams
                    </h1>
                  </div>
                </div>

                <div className="max-w-7xl mx-auto">
                  
                  {/* SEARCH/FILTER BAR */}
                  <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest hidden md:block">
                      Select a franchise to view active rosters and depth charts
                    </p>
                    <div className="relative w-full md:w-72">
                      <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Find a team..." 
                        className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-gray-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition-colors shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* TEAM GRID */}
                  {filteredTeams.length === 0 ? (
                    <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-2xl">
                      No teams found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                      {filteredTeams.map(team => (
                        <Link 
                          key={team.id} 
                          href={`/${team.sport.toLowerCase()}/teams/${team.slug}`}
                          className="group flex flex-col items-center bg-[#1a1a1a] border border-gray-800 hover:border-gray-600 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl relative overflow-hidden no-underline"
                        >
                          {/* Subtle Team Color Glow */}
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                            style={{ background: `radial-gradient(circle at center, #${team.color} 0%, transparent 70%)` }}
                          />
                          
                          <div className="w-16 h-16 md:w-20 md:h-20 mb-4 relative z-10 flex items-center justify-center">
                            {team.logo ? (
                              <img 
                                src={team.logo} 
                                alt={team.name} 
                                className="w-full h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center text-white font-black text-xl">
                                {team.abbreviation}
                              </div>
                            )}
                          </div>
                          
                          <h3 className="font-black text-white text-center text-[11px] md:text-xs tracking-wider uppercase leading-tight relative z-10 group-hover:text-gray-200 transition-colors">
                            {team.name}
                          </h3>
                          
                          {/* Bottom Team Color Bar */}
                          <div 
                            className="absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                            style={{ backgroundColor: `#${team.color}` }}
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </>
  );
}