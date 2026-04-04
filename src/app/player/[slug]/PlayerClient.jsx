"use client";
import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header'; 
import Sidebar from '../../../components/Sidebar'; 
import ContentModal from '../../../components/ContentModal'; 
import { PlayCircle, FileText, Mic, Video, User, Activity, AlertCircle, LayoutGrid, Check } from 'lucide-react';

export default function PlayerClient({ playerName, rawSlug, espnData, content, proToolsMenu, connectMenu }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('Content');

  const handleSetSelectedItem = (item) => {
    if (item) {
      const sportPath = item.sport.toLowerCase();
      const typePath = `${item.type}s`; 
      const itemUrl = `/${sportPath}/${typePath}/${item.slug}`;
      
      window.history.pushState({ modal: true }, '', itemUrl);
      setSelectedItem(item);
    } else {
      window.history.pushState(null, '', `/player/${rawSlug}`);
      setSelectedItem(null);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (selectedItem) {
        setSelectedItem(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedItem]);

  const primaryColor = espnData?.team?.color ? `#${espnData.team.color}` : '#374151';
  const secondaryColor = espnData?.team?.alternateColor ? `#${espnData.team.alternateColor}` : '#1f2937';
  const headshot = espnData?.headshot?.href || null;
  const teamLogo = espnData?.team?.logos?.[0]?.href || null;

  // --- BIO DATA PREP ---
  let birthplace = '';
  if (espnData?.birthPlace) {
    const { city, state, country } = espnData.birthPlace;
    birthplace = [city, state, country].filter(Boolean).join(', ');
  }
  const dob = espnData?.dateOfBirth ? new Date(espnData.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;


  // --- TAB RENDERERS ---

  const renderContentGrid = () => {
    if (content.length === 0) {
      return (
        <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-2xl">
          No recent coverage found.
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {content.map(item => (
          <div 
            key={item.id} 
            onClick={() => handleSetSelectedItem(item)} 
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
    );
  };

  const renderInjuries = () => {
    const injuries = espnData?.injuries;
    if (!injuries || injuries.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-center border border-gray-800 rounded-2xl bg-[#111]">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <Check size={28} className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Healthy</h3>
          <p className="text-gray-400 max-w-md">No current injuries or status updates reported for this athlete.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {injuries.map((inj, idx) => (
          <div key={idx} className="bg-red-900/10 border border-red-900/30 p-5 rounded-xl flex gap-4 items-start">
            <AlertCircle size={24} className="text-red-500 shrink-0 mt-1" />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-lg text-white capitalize">{inj.status}</span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{new Date(inj.date).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-300 leading-relaxed">{inj.details || "No further details provided."}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStatistics = () => {
    const findStatTables = (obj, tables = [], currentTitle = "Career Stats") => {
      if (!obj || typeof obj !== 'object') return tables;

      if (Array.isArray(obj.labels) && Array.isArray(obj.stats)) {
        tables.push({ title: obj.text || obj.name || currentTitle, type: 'table', labels: obj.labels, stats: obj.stats });
        return tables;
      }
      
      if (Array.isArray(obj) && obj.length > 0 && obj[0].displayValue !== undefined) {
        tables.push({ title: currentTitle, type: 'list', stats: obj });
        return tables;
      }

      if (Array.isArray(obj)) {
        obj.forEach(child => findStatTables(child, tables, child.displayName || child.name || currentTitle));
      } else {
        for (const key in obj) {
          if (key === 'athlete' || key === 'team') continue; 
          const nextTitle = obj[key]?.displayName || obj[key]?.name || obj.displayName || obj.name || currentTitle;
          findStatTables(obj[key], tables, nextTitle);
        }
      }
      return tables;
    };

    const allTables = findStatTables(espnData);

    const uniqueTables = [];
    const seen = new Set();
    allTables.forEach(t => {
      const hash = t.title + JSON.stringify(t.labels || (t.stats && t.stats[0]));
      if (!seen.has(hash)) {
        seen.add(hash);
        uniqueTables.push(t);
      }
    });

    if (uniqueTables.length === 0) {
      return (
        <div className="py-16 text-center text-gray-500 font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-2xl bg-[#111]">
          Detailed statistics are currently unavailable for this athlete.
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-8">
        {uniqueTables.map((table, idx) => (
          <div key={idx} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-[#222] px-6 py-4 border-b border-gray-800">
              <h3 className="font-black text-white text-lg tracking-wide uppercase">{table.title}</h3>
            </div>
            
            <div className="overflow-x-auto">
              {table.type === 'table' ? (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#151515] text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <tr>
                      {table.labels.map((label, labelIdx) => (
                        <th key={labelIdx} className="px-6 py-4 border-b border-gray-800">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {(Array.isArray(table.stats[0]) ? table.stats : [table.stats]).map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-[#222] transition-colors">
                        {table.labels.map((_, colIdx) => {
                           let val = row[colIdx];
                           if (val && typeof val === 'object') val = val.displayValue || val.value;
                           return (
                             <td key={colIdx} className={`px-6 py-4 text-gray-300 ${colIdx === 0 ? 'font-bold text-white' : ''}`}>
                               {val ?? '-'}
                             </td>
                           );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                  {table.stats.map((stat, statIdx) => (
                    <div key={statIdx} className="flex flex-col">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.displayName || stat.label || stat.name}</span>
                      <span className="text-lg font-semibold text-white">{stat.displayValue || stat.value || '-'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'Content', icon: <LayoutGrid size={16} /> },
    { id: 'Statistics', icon: <Activity size={16} /> },
    { id: 'Injury Report', icon: <AlertCircle size={16} /> }
  ];

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full">
        <Sidebar currentPath={`/player/${rawSlug}`} activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0">
          <main className="flex-1 overflow-y-auto relative z-0 scrollbar-hide pb-24">
            
            {/* THE HERO HEADER */}
            <div className="relative w-full h-[260px] flex items-end overflow-hidden rounded-2xl mb-6 mt-6">
              <div 
                className="absolute inset-0 opacity-80 z-0" 
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              />

              {/* HUGE BACKGROUND LOGO: 20% Opacity, Far Right, 200% Size */}
              {teamLogo && (
                <img 
                  src={teamLogo} 
                  alt="Team Logo Background" 
                  className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" 
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
              
              <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-end md:justify-start gap-2 md:gap-10 h-full px-6 md:px-0">
                
                {/* Responsive Image Container */}
                {headshot ? (
                  <div className="flex h-24 sm:h-32 md:h-[115%] items-end shrink-0 relative mb-0 md:mb-0 z-10 w-auto md:w-[55%] max-w-[400px]">
                    <img 
                      src={headshot} 
                      alt={playerName} 
                      className="h-full w-auto md:w-full lg:w-auto object-contain object-left-bottom md:object-bottom drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]" 
                      style={{ 
                        WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%)',
                        maskImage: 'linear-gradient(to top, transparent 0%, black 15%)' 
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 md:h-32 md:w-32 bg-black/20 rounded-full items-center justify-center border-4 border-white/10 backdrop-blur-sm shrink-0 mb-2 md:mb-4 md:ml-6">
                    <User className="w-10 h-10 md:w-12 md:h-12 text-white/40" />
                  </div>
                )}

                <div className="flex flex-col gap-1 md:gap-2 w-full z-20 justify-end md:h-full pb-4 md:px-0">
                  
                  {/* Name and Position Inline */}
                  <div className="flex items-baseline gap-3 md:gap-4 flex-wrap">
                    <h1 className="text-4xl sm:text-5xl md:text-4xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white">
                      {playerName}
                    </h1>
                    {espnData?.position && (
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400 uppercase tracking-widest">
                        {espnData.position.abbreviation || espnData.position.displayName}
                      </span>
                    )}
                  </div>
                  
                  {espnData && (
                    <div className="flex flex-col gap-3 mt-1 md:mt-3">
                      
                      <div className="flex items-center gap-3">
                        {teamLogo && <img src={teamLogo} alt={espnData.team?.displayName} className="h-6 md:h-8 w-auto object-contain drop-shadow-lg" />}
                        <span className="font-bold text-white/90 text-sm md:text-lg">{espnData.team?.displayName || 'Free Agent'}</span>
                        
                        {espnData.displayExperience && (
                           <span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 font-bold text-[10px] sm:text-xs text-white">
                             Year {espnData.displayExperience}
                           </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 text-[11px] md:text-sm mt-1">
                        {espnData.displayHeight && espnData.displayWeight && (
                          <div className="flex gap-1.5">
                            <span className="text-gray-500 uppercase font-bold tracking-wider">HT/WT</span> 
                            <span className="text-gray-200 font-semibold">{espnData.displayHeight}, {espnData.displayWeight}</span>
                          </div>
                        )}
                        {espnData.age && (
                          <div className="flex gap-1.5">
                            <span className="text-gray-500 uppercase font-bold tracking-wider">Age</span> 
                            <span className="text-gray-200 font-semibold">{espnData.age}</span>
                          </div>
                        )}
                        {dob && (
                          <div className="flex gap-1.5 hidden sm:flex">
                            <span className="text-gray-500 uppercase font-bold tracking-wider">DOB</span> 
                            <span className="text-gray-200 font-semibold">{dob}</span>
                          </div>
                        )}
                        {birthplace && (
                          <div className="flex gap-1.5">
                            <span className="text-gray-500 uppercase font-bold tracking-wider">Born</span> 
                            <span className="text-gray-200 font-semibold">{birthplace}</span>
                          </div>
                        )}
                        {espnData.college?.name && (
                          <div className="flex gap-1.5">
                            <span className="text-gray-500 uppercase font-bold tracking-wider">College</span> 
                            <span className="text-gray-200 font-semibold">{espnData.college.name}</span>
                          </div>
                        )}
                        {espnData.draft?.displayText && (
                          <div className="flex gap-1.5 hidden lg:flex">
                            <span className="text-gray-500 uppercase font-bold tracking-wider">Draft</span> 
                            <span className="text-gray-200 font-semibold">{espnData.draft.displayText}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="max-w-7xl mx-auto mb-8 border-b border-gray-800">
              <div className="flex overflow-x-auto scrollbar-hide gap-2 sm:gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-4 px-2 whitespace-nowrap transition-all duration-200 border-b-2 font-bold text-sm uppercase tracking-wider
                      ${activeTab === tab.id 
                        ? 'border-white text-white' 
                        : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                      }`}
                  >
                    {tab.icon} {tab.id}
                  </button>
                ))}
              </div>
            </div>

            {/* DYNAMIC TAB CONTENT */}
            <div className="max-w-7xl mx-auto pb-12">
              {activeTab === 'Content' && renderContentGrid()}
              {activeTab === 'Statistics' && renderStatistics()}
              {activeTab === 'Injury Report' && renderInjuries()}
            </div>
          </main>
        </div>
      </div>
      
      {selectedItem && (
        <ContentModal 
           selectedItem={selectedItem} 
           setSelectedItem={handleSetSelectedItem} 
           videos={content.filter(p => p.type === 'video' || p.type === 'short')} 
        />
      )}
    </>
  );
}