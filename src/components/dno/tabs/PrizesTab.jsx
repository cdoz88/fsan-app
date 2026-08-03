"use client";
import React from 'react';
import { Trophy, Medal, Gift, Star, Crown, Sparkles } from 'lucide-react';

export default function PrizesTab() {
  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 mb-16 relative z-10">
      
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">The Prizes</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
      </div>

      {/* 1. League Champion (Mini Belt) */}
      <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-gradient-to-br from-[#151515] to-[#0a0a0a] border border-gray-800 rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-blue-900/50 transition-colors duration-500">
        
        {/* Subtle Background Glow for the Card */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        {/* Image Section - Tilted & Glowing */}
        <div className="w-full md:w-1/2 relative flex justify-center items-center py-10 md:py-0">
          <div className="absolute w-[250px] h-[250px] bg-blue-500/20 blur-[80px] rounded-full group-hover:bg-blue-500/40 group-hover:scale-125 transition-all duration-700 pointer-events-none"></div>
          <img 
            src="/images/dno/mini-belt.png" 
            alt="League Champion Mini Belt" 
            className="relative z-10 w-full max-w-[320px] object-contain -rotate-6 group-hover:rotate-2 group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-900/30 text-blue-400 border border-blue-500/30 rounded-2xl mb-6 shadow-inner">
            <Medal size={28} />
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-md">
            League Champion
          </h3>
          <p className="text-gray-300 leading-relaxed mb-8 text-sm md:text-base">
            Win your individual 12-team online division and take home the official Draft Night Out Mini Title Belt. It is the absolute perfect desk piece to constantly remind your coworkers exactly who dominates the gridiron.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest shadow-inner">
            <Star size={16} /> 1 Winner Per Division
          </div>
        </div>
      </div>

      {/* 2. Season Champion (Full Belt) - Reversed Layout */}
      <div className="relative flex flex-col md:flex-row-reverse items-center gap-8 md:gap-12 bg-gradient-to-bl from-[#1a1500] to-[#0a0a0a] border border-yellow-900/30 rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-yellow-600/50 transition-colors duration-500">
        
        {/* Subtle Background Glow for the Card */}
        <div className="absolute inset-0 bg-gradient-to-l from-yellow-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        {/* Image Section - Tilted & Glowing */}
        <div className="w-full md:w-1/2 relative flex justify-center items-center py-10 md:py-0">
          <div className="absolute w-[300px] h-[300px] bg-yellow-500/20 blur-[100px] rounded-full group-hover:bg-yellow-400/30 group-hover:scale-125 transition-all duration-700 pointer-events-none"></div>
          <img 
            src="/images/dno/championship-belt.png" 
            alt="Overall Season Championship Belt" 
            className="relative z-10 w-full max-w-[400px] object-contain rotate-3 group-hover:-rotate-2 group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-[0_25px_35px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 rounded-2xl mb-6 shadow-inner">
            <Crown size={28} />
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-md">
            Overall Season Champion
          </h3>
          <p className="text-gray-300 leading-relaxed mb-8 text-sm md:text-base">
            Outscore everyone. Beat the best of the best across the entire Draft Night Out platform, and you will be crowned the undisputed Season Champion. Your prize? A massive, heavy-duty, full-sized customized Championship Belt.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-widest shadow-inner">
            <Trophy size={16} /> 1 Overall Winner
          </div>
        </div>
      </div>

      {/* 3. Grand Prize Bundle */}
      <div id="grand-prize" className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-gradient-to-br from-[#150a1a] to-[#0a0a0a] border border-purple-900/30 rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group hover:border-purple-600/50 transition-colors duration-500">
        
        {/* Subtle Background Glow for the Card */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        {/* Image Section - Tilted & Glowing */}
        <div className="w-full md:w-1/2 relative flex justify-center items-center py-10 md:py-0">
          <div className="absolute w-[280px] h-[280px] bg-purple-600/20 blur-[90px] rounded-full group-hover:bg-purple-500/30 group-hover:scale-125 transition-all duration-700 pointer-events-none"></div>
          <img 
            src="/images/dno/prize-bundle.png" 
            alt="Grand Prize Bundle" 
            className="relative z-10 w-full max-w-[350px] object-contain -rotate-3 group-hover:rotate-3 group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
          />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-900/30 text-purple-400 border border-purple-500/30 rounded-2xl mb-6 shadow-inner">
            <Gift size={28} />
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-md">
            The Ultimate Grand Prize
          </h3>
          <p className="text-gray-300 leading-relaxed mb-8 text-sm md:text-base">
            Survive the gauntlet and win the Playoff Challenge to secure the ultimate gaming and fantasy package. You will walk away with a brand new PlayStation 5, the latest edition of Madden, and a stunning Championship Ring by TrophySmack!
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest shadow-inner">
            <Sparkles size={16} /> Playoff Challenge Winner
          </div>
        </div>
      </div>

    </div>
  );
}