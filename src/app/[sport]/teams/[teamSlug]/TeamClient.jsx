"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Sidebar from '../../../../components/Sidebar';
import { Search, User } from 'lucide-react';

export default function TeamClient({ activeSport, teamInfo, rosterGroups, proToolsMenu, connectMenu }) {
  const [searchQuery, setSearchQuery] = useState('');

  const primaryColor = `#${teamInfo.color}`;
  const secondaryColor = `#${teamInfo.alternateColor}`;

  // Filter players based on search within the roster
  const filteredGroups = rosterGroups.map(group => ({
    ...group,
    players: group.players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(group => group.players.length > 0);

  return (
    <>
      <Header activeSport={activeSport} />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full">
        <Sidebar currentPath={`/${activeSport.toLowerCase()}/teams`} activeSport={activeSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0">
          <main className="flex-1 overflow-y-auto relative z-0 scrollbar-hide pb-24">
            
            {/* TEAM HERO HEADER */}
            <div className="relative w-full h-[240px] md:h-[300px] flex items-end overflow-hidden rounded-2xl mb-6 mt-6 shadow-2xl border border-gray-800/50">
              <div 
                className="absolute inset-0 opacity-90 z-0" 
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              />
              
              {teamInfo.logo && (
                <img 
                  src={teamInfo.logo} 
                  alt={`${teamInfo.name} Logo`} 
                  className="absolute -right-10 md:-right-20 top-1/2 transform -translate-y-1/2 h-[250%] md:h-[300%] w-auto opacity-[0.15] pointer-events-none z-0 drop-shadow-2xl" 
                  style={{ filter: 'grayscale(100%) contrast(200%)' }} // Adds a cool textured look to the background logo
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/50 to-transparent z-0" />
              
              <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-start gap-4 md:gap-8 h-full px-6 md:px-10 pb-8">
                
                {/* FOREGROUND LOGO */}
                {teamInfo.logo && (
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center shrink-0 mb-2 md:mb-0 p-4 shadow-2xl">
                     <img src={teamInfo.logo} alt={teamInfo.name} className="w-full h-full object-contain drop-shadow-xl" />
                  </div>
                )}

                <div className="flex flex-col gap-1 w-full z-20 justify-end md:h-full md:pb-2">
                  {/* SEO DIRECTORY BREADCRUMB */}
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-300 mb-1">
                    <Link href={`/${activeSport.toLowerCase()}`} className="hover:text-white transition-colors">{activeSport}</Link>
                    <span>/</span>
                    <Link href={`/${activeSport.toLowerCase()}/teams`} className="hover:text-white transition-colors">Teams</Link>
                    <span>/</span>
                    <span className="text-white drop-shadow-md">{teamInfo.name}</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase">
                    {teamInfo.name}
                  </h1>
                  
                  {/* TEAM STATS SUMMARY */}
                  <div className="flex items-center gap-4 mt-2 md:mt-3">
                    {teamInfo.record && (
                      <span className="bg-black/40 px-4 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 font-bold text-[10px] sm:text-xs text-white uppercase tracking-widest shadow-inner">
                        {teamInfo.record}
                      </span>
                    )}
                    {teamInfo.standingSummary && (
                      <span className="text-gray-300 font-bold text-xs uppercase tracking-wider drop-shadow-md">
                        {teamInfo.standingSummary}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto">
              
              {/* ROSTER SEARCH BAR */}
              <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                <h2 className="text-2xl font-black text-white italic">Active Roster</h2>
                <div className="relative w-full md:w-72">
                  <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search roster..." 
                    className="w-full bg-[#1a1a1a] border border-gray-700 focus:border-gray-500 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none transition-colors shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* ROSTER LISTINGS */}
              {filteredGroups.length === 0 ? (
                <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-2xl bg-[#111]">
                  No players found matching "{searchQuery}"
                </div>
              ) : (
                <div className="flex flex-col gap-10">
                  {filteredGroups.map((group, idx) => (
                    <div key={idx} className="flex flex-col">
                      <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800/50 pb-2">
                        {group.groupName}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {group.players.map(player => (
                          
                          // THE SEO TROJAN HORSE: Every player is a clean HTML link to their dynamic hub!
                          <Link 
                            key={player.id} 
                            href={`/player/${player.slug}`}
                            className="flex items-center gap-4 bg-[#1a1a1a] border border-gray-800 hover:border-gray-600 rounded-xl p-3 transition-all hover:-translate-y-0.5 shadow-lg group no-underline"
                          >
                            {/* PLAYER HEADSHOT */}
                            <div className="w-14 h-14 bg-[#111] rounded-full flex items-center justify-center shrink-0 border border-gray-700 group-hover:border-gray-500 transition-colors overflow-hidden">
                              {player.headshot ? (
                                <img src={player.headshot} alt={player.name} className="w-full h-full object-cover object-top" />
                              ) : (
                                <User size={20} className="text-gray-600" />
                              )}
                            </div>
                            
                            {/* PLAYER INFO */}
                            <div className="flex flex-col justify-center flex-1 min-w-0">
                              <span className="font-bold text-white text-sm truncate group-hover:text-blue-400 transition-colors">
                                {player.name}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                  {player.position}
                                </span>
                                {player.jersey && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                    <span className="text-[10px] font-bold text-gray-400">
                                      #{player.jersey}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                          
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </main>
        </div>
      </div>
    </>
  );
}