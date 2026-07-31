"use client";
import React, { useState, useEffect } from 'react';
import { HeartHandshake, ExternalLink, Users, DollarSign, Loader2, TrendingUp } from 'lucide-react';

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

      {/* NEW HERO: COMMUNITY IMPACT TRACKER */}
      <div className="bg-gradient-to-b from-[#151515] to-[#111] border border-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl mb-8 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="text-center mb-10 relative z-10">
          <h3 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-sm flex items-center justify-center gap-3">
            <TrendingUp className="text-emerald-500" size={28} />
            Community Impact Tracker
          </h3>
          <p className="text-sm text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            Watch our collective impact grow! Every roster drafted helps provide extensive, personalized support and resources to Veterans and their families through Mission 22.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
           {/* Total Raised Odometer */}
           <div className="bg-gradient-to-br from-emerald-900/20 to-[#111] border border-emerald-900/50 rounded-2xl p-8 md:p-10 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-emerald-900/30 border border-emerald-500/30 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <DollarSign size={32} className="text-emerald-400" />
              </div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 text-center">Total Raised for Mission 22</p>
              <div className="text-5xl md:text-6xl font-black text-emerald-500 drop-shadow-md tracking-tighter">
                {isLoading ? (
                  <Loader2 size={40} className="animate-spin text-emerald-900 mx-auto" />
                ) : (
                  `$${raised.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                )}
              </div>
           </div>

           {/* Total Players Odometer */}
           <div className="bg-gradient-to-br from-[#1b75bb]/10 to-[#111] border border-[#1b75bb]/30 rounded-2xl p-8 md:p-10 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#1b75bb]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-[#1a1a1a] border border-[#1b75bb]/30 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <Users size={32} className="text-[#1b75bb]" />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 text-center">Total Draft Night Out Players</p>
              <div className="text-5xl md:text-6xl font-black text-white drop-shadow-md tracking-tighter">
                {isLoading ? (
                  <Loader2 size={40} className="animate-spin text-gray-600 mx-auto" />
                ) : (
                  players.toLocaleString()
                )}
              </div>
           </div>
        </div>
      </div>
      
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