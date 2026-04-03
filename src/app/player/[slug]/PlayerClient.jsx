"use client";
import React, { useState } from 'react';
import Header from '../../../components/Header'; 
import Sidebar from '../../../components/Sidebar'; 
import ContentModal from '../../../components/ContentModal'; 
import { PlayCircle, FileText, Mic, Video, User } from 'lucide-react';

export default function PlayerClient({ playerName, rawSlug, espnData, content, proToolsMenu, connectMenu }) {
  const [selectedItem, setSelectedItem] = useState(null);

  // Layout Colors
  const primaryColor = espnData?.team?.color ? `#${espnData.team.color}` : '#374151';
  const secondaryColor = espnData?.team?.alternateColor ? `#${espnData.team.alternateColor}` : '#1f2937';
  const headshot = espnData?.headshot?.href || null;
  const teamLogo = espnData?.team?.logos?.[0]?.href || null;

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full">
        {/* FIX: Passed the currentPath prop so the Sidebar knows where it is! */}
        <Sidebar currentPath={`/player/${rawSlug}`} activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0">
          <main className="flex-1 overflow-y-auto relative z-0 scrollbar-hide pb-24">
            
            {/* THE HERO HEADER */}
            <div className="relative w-full h-80 sm:h-96 md:h-[450px] flex items-end overflow-hidden rounded-2xl mb-8 mt-6">
              <div 
                className="absolute inset-0 opacity-80" 
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />
              
              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 pb-8 flex items-end justify-between">
                
                {/* Left Side: Name and Info */}
                <div className="flex flex-col gap-4 max-w-3xl">
                  {/* FIX: Removed the "Back to Hub" link here as requested */}
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white">
                    {playerName}
                  </h1>
                  
                  {espnData && (
                    <div className="flex items-center gap-4 mt-2">
                      {teamLogo && <img src={teamLogo} alt={espnData.team.displayName} className="h-8 md:h-12 w-auto object-contain drop-shadow-lg" />}
                      <div className="flex items-center gap-3 font-bold text-sm md:text-base text-white/90">
                        <span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">{espnData.position?.displayName || 'NFL'}</span>
                        {espnData.displayExperience && <span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">Year {espnData.displayExperience}</span>}
                        {espnData.height && <span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 hidden sm:block">{espnData.height}, {espnData.weight}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: High-Res Headshot */}
                {headshot ? (
                  <img 
                    src={headshot} 
                    alt={playerName} 
                    className="hidden md:block absolute right-8 bottom-0 h-[110%] w-auto object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] z-10" 
                  />
                ) : (
                  <div className="hidden md:flex absolute right-8 bottom-0 h-64 w-64 bg-black/20 rounded-full items-center justify-center border-4 border-white/10 backdrop-blur-sm mb-8">
                    <User size={64} className="text-white/40" />
                  </div>
                )}
              </div>
            </div>

            {/* THE CONTENT GRID */}
            <div className="max-w-7xl mx-auto py-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
                <h2 className="text-2xl font-black uppercase tracking-wider text-white">Latest on {playerName.split(' ')[0]}</h2>
              </div>

              {content.length === 0 ? (
                <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-2xl">
                  No recent coverage found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {content.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedItem(item)} 
                      className="group cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-colors shadow-xl flex flex-col h-full"
                    >
                      <div className="w-full aspect-video bg-gray-900 relative overflow-hidden shrink-0">
                        {item.imageUrl && <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent" />
                        
                        <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                          {item.type === 'video' || item.type === 'short' ? <Video size={12} className="text-white" /> : item.type === 'podcast' ? <Mic size={12} className="text-white" /> : <FileText size={12} className="text-white" />}
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white">{item.type}</span>
                        </div>
                        
                        {(item.type === 'video' || item.type === 'podcast') && (
                          <PlayCircle size={32} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10" />
                        )}
                      </div>
                      
                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{item.date}</span>
                        <h3 className="font-black text-base text-gray-200 group-hover:text-white transition-colors leading-tight line-clamp-3 mb-2" dangerouslySetInnerHTML={{ __html: item.title }} />
                        <p className="text-xs text-gray-400 line-clamp-2 mt-auto" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {selectedItem && (
        <ContentModal 
           selectedItem={selectedItem} 
           setSelectedItem={setSelectedItem} 
           videos={content.filter(p => p.type === 'video' || p.type === 'short')} 
        />
      )}
    </>
  );
}