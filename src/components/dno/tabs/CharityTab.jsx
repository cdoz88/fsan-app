"use client";
import React, { useState, useEffect } from 'react';
import { HeartHandshake, ExternalLink, Users, DollarSign, Loader2, Trophy } from 'lucide-react';

export default function CharityTab() {
  const [charityData, setCharityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the live charity calculation from the WordPress API
  useEffect(() => {
    fetch('/api/scl?action=dno_get_charity_total', { cache: 'no-store' })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setCharityData(json.data);
        }
      })
      .catch(err => console.error("Failed to fetch charity data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const raised = charityData?.total_raised || 0;
  const players = charityData?.total_players || 0;
  const wallOfFame = charityData?.wall_of_fame || [];
  
  // Static Goal for the Endzone
  const GOAL_AMOUNT = 1000;
  const percentComplete = Math.min(100, (raised / GOAL_AMOUNT) * 100);
  const showProgressBorder = percentComplete > 0 && percentComplete < 100;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
      <div className="flex items-center gap-6 mb-8">
          <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Charity</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
      </div>

      <div className="bg-[#1b75bb]/10 border border-[#1b75bb]/30 rounded-xl p-4 mb-8 flex items-start gap-3 shadow-md">
        <HeartHandshake size={20} className="text-[#f5a623] shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-black text-[#1b75bb] uppercase tracking-widest mb-1">Playing for a Purpose</h5>
          <p className="text-sm text-gray-300 leading-relaxed">
            Draft Night Out isn't just about winning a championship—it's about giving back. A portion of every online draft entry will be directly donated to Mission 22 to support Veterans and their families.
          </p>
        </div>
      </div>

      {/* CHARITY PROGRESS FOOTBALL FIELD */}
      <div className="bg-gradient-to-b from-[#151515] to-[#111] border border-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 relative z-10">
          <div>
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter drop-shadow-sm">Mission 22 Fundraiser</h3>
            <p className="text-sm text-gray-400 mt-1">Help us march down the field to reach our $1,000 goal! Every dollar goes directly to supporting Veterans.</p>
          </div>
          <div className="text-right shrink-0 bg-[#1a1a1a] px-5 py-3 rounded-xl border border-gray-700 w-full md:w-auto flex justify-between md:flex-col items-center md:items-end shadow-inner">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest md:mb-1">Current Progress</p>
            <p className="text-xl md:text-2xl font-black text-[#f5a623] drop-shadow-md">
                {isLoading ? <Loader2 size={20} className="animate-spin text-[#f5a623] mt-1" /> : `${percentComplete.toFixed(1)}%`}
            </p>
          </div>
        </div>

        {/* Football Field Layout */}
        <div className="relative w-full h-28 md:h-36 bg-gradient-to-b from-green-600 to-green-900 rounded-xl border-2 border-white/20 shadow-[0_10px_30px_rgba(22,101,52,0.4)] flex overflow-hidden ring-4 ring-green-900/30">

            {/* Playing Field (0% to 100%) */}
            <div className="flex-1 relative">
                
                {/* Generative Hash Marks (50 intervals to look like a football field) */}
                <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
                    {Array.from({ length: 50 }).map((_, i) => {
                        if (i === 0) return null; // No hash at 0
                        if (i % 5 === 0) return null; // Skip where major yard lines go
                        return (
                            <div 
                                key={`hash-${i}`} 
                                className="absolute top-0 w-0.5 h-3 md:h-4 bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]" 
                                style={{ left: `${(i / 50) * 100}%` }}
                            ></div>
                        );
                    })}
                </div>
                
                {/* Progress Bar Fill */}
                <div 
                    className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-1000 ease-out z-10 shadow-[8px_0_25px_rgba(56,189,248,0.5)] ${showProgressBorder ? 'border-r-2 border-white/80' : ''}`} 
                    style={{ width: `${percentComplete}%` }}
                ></div>

                {/* Evenly Spaced Major Yard Lines */}
                {Array.from({ length: 9 }).map((_, idx) => {
                    const leftPercent = (idx + 1) * 10;
                    return (
                        <div 
                            key={`yardline-${idx}`} 
                            className="absolute top-0 bottom-0 z-20 flex flex-col items-center pb-3 md:pb-4 -translate-x-1/2"
                            style={{ left: `${leftPercent}%` }}
                        >
                            <div className="w-[3px] bg-white/30 flex-1"></div>
                        </div>
                    );
                })}
            </div>

            {/* Right Endzone - Modern Gradient */}
            <div className="w-[18%] md:w-[12%] bg-gradient-to-b from-amber-400 to-orange-600 border-l border-white/40 z-30 shrink-0 shadow-inner flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-black/5 mix-blend-overlay"></div>
               <span className="text-white font-black text-sm md:text-xl tracking-tighter -rotate-90 md:rotate-0 drop-shadow-md relative z-10">
                  $1,000
               </span>
            </div>
        </div>
      </div>

      {/* LIVE COUNTER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
         <div className="bg-gradient-to-br from-[#151515] to-[#111] border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-[#1b75bb]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Online Players</p>
              <div className="text-3xl font-black text-white drop-shadow-sm">
                {isLoading ? <Loader2 size={24} className="animate-spin text-gray-600 mt-1" /> : players.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 bg-[#1a1a1a] border border-gray-700 rounded-full flex items-center justify-center shrink-0 shadow-inner relative z-10">
              <Users size={20} className="text-[#1b75bb]" />
            </div>
         </div>

         <div className="bg-gradient-to-br from-emerald-900/20 to-[#111] border border-emerald-900/50 rounded-2xl p-6 flex items-center justify-between shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Raised</p>
              <div className="text-3xl font-black text-emerald-500 drop-shadow-sm">
                {isLoading ? <Loader2 size={24} className="animate-spin text-emerald-900 mt-1" /> : `$${raised.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-900/30 border border-emerald-500/30 rounded-full flex items-center justify-center shrink-0 shadow-inner relative z-10">
              <DollarSign size={20} className="text-emerald-400" />
            </div>
         </div>
      </div>

      {/* WALL OF FAME (Only renders if there are public donors) */}
      {!isLoading && wallOfFame.length > 0 && (
        <div className="bg-gradient-to-b from-[#151515] to-[#111] border border-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl mb-8 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-[#f5a623] w-6 h-6" />
            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Wall of Fame</h3>
          </div>
          <p className="text-sm text-gray-400 mb-6">A huge thank you to the managers who went above and beyond with an extra donation to Mission 22!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallOfFame.map((donor, index) => (
              <div key={index} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 flex items-center justify-between shadow-inner hover:border-gray-700 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[#f5a623] font-black text-lg w-6">#{index + 1}</span>
                  <span className="text-white font-bold text-sm truncate">{donor.username}</span>
                </div>
                <span className="text-emerald-400 font-black text-sm bg-emerald-900/20 px-3 py-1 rounded-lg border border-emerald-900/50 shrink-0">
                  +${donor.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* MISSION 22 BLURB */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl p-8 md:p-10 border border-gray-800 shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5a623]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

         <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
           {/* Left Col: Logo & Action */}
           <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left shrink-0">
             <div className="w-full max-w-[240px] flex items-center justify-center mb-6">
                <img src="https://admin.fsan.com/wp-content/uploads/2026/04/Mission-22-Logo.webp" alt="Mission 22 Logo" className="w-full h-auto drop-shadow-md" />
             </div>
             <a href="https://mission22.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#111] border border-gray-700 text-gray-300 hover:text-white hover:border-[#1b75bb] font-black uppercase tracking-widest text-xs transition-colors w-full md:w-auto shadow-md hover:-translate-y-0.5">
                Visit Mission 22 <ExternalLink size={14}/>
             </a>
           </div>

           {/* Right Col: Provided Text */}
           <div className="w-full md:w-2/3 flex flex-col gap-5 text-sm text-gray-300 leading-relaxed">
             <p><strong className="text-white text-base">At Mission 22, our commitment could not be more personal.</strong> Mission 22 was founded by Veterans. Most of our staff are Veterans, spouses of Veterans, or have immediate family members who have served in the US military.</p>
             <p>We provide extensive, personalized support and resources to help Veterans and their families thrive. Mission 22’s programs for Veterans and military spouses offer everything from biometric monitoring of stress, sleep, and activity levels; to meditation and coaching; to exercise programs and a wellness supplement regimen; to books and learning resources to help Veterans put their experience in context.</p>
             <p>Mission 22 recognizes that a Veteran’s experience is a family’s experience – families live through all of the ups and downs that soldiers returning home do. We’ve developed a support program exclusively for spouses to take positive steps that renew their identities as individuals and the strengths they bring to their household.</p>
             <p>Our Ambassador program further supports Veterans and military families – a network of more than 3,500 Veterans and civilians in all 50 states and around the world. We work to advance society’s collective understanding of the issues faced by active service members, Veterans, and their families.</p>
             <p>At Mission 22, we know firsthand that Veterans and service members bring extensive skills and assets to any situation. Their leadership capabilities, experiences, and sense of teamwork and integrity are unmatched. Veterans know how to rise to a challenge.</p>
             <p>America’s Veterans make our society stronger. They deserve a community worthy of all they have given, and all they will yet achieve. We are proud to continue designing programs for Veterans and their families, and to welcome them into our community.</p>
           </div>
         </div>
      </div>

    </div>
  );
}