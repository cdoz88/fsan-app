import React from 'react';
import { Medal, Gift, Trophy, Shield } from 'lucide-react';

export default function PrizesTab() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
      <div className="flex items-center gap-6 mb-8">
         <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">What's on the Line?</h2>
         <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
           <Medal className="text-gray-400 mb-4" size={40} />
           <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">League Winners</h4>
           <p className="text-sm text-gray-400 leading-relaxed">Mini Championship Belt from <strong className="text-white">TrophySmack</strong>.</p>
         </div>
         <div className="bg-[#111] p-8 rounded-3xl border border-gray-800 flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
           <Gift className="text-[#f5a623] mb-4" size={40} />
           <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2">Overall Regular Season Champ</h4>
           <p className="text-sm text-gray-400 leading-relaxed">Ultimate 6lb Custom Championship Belt from <strong className="text-[#f5a623]">TrophySmack</strong>.</p>
         </div>
         <div className="bg-gradient-to-b from-[#0a1220] to-[#111] p-8 rounded-3xl border border-[#1b75bb]/30 flex flex-col items-center text-center shadow-[0_0_30px_rgba(27,117,187,0.15)] hover:-translate-y-1 transition-transform relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#1b75bb]/10 blur-2xl rounded-full"></div>
           <Trophy className="text-yellow-500 mb-4 relative z-10" size={40} />
           <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2 relative z-10">Playoff Challenge Champion</h4>
           <p className="text-sm text-gray-300 leading-relaxed relative z-10">Playstation 5, Madden 2027, and championship ring from <strong className="text-white">TrophySmack</strong>!</p>
         </div>
      </div>
      <div className="bg-gradient-to-br from-[#0a1220] to-[#111] rounded-3xl border border-[#1b75bb]/30 p-8 md:p-12 mb-12 shadow-[0_0_40px_rgba(27,117,187,0.1)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="absolute -right-4 -top-4 text-[120px] md:text-[180px] font-black text-[#1b75bb]/10 z-0 select-none transition-colors leading-none pointer-events-none">🏆</div>
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#1b75bb] to-[#0d4a7a] rounded-full flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(27,117,187,0.4)] border-4 border-[#111] relative z-10"><Shield size={48} className="text-white drop-shadow-md" /></div>
        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="inline-block px-3 py-1 bg-[#f5a623] text-black font-black text-[10px] uppercase tracking-widest rounded-full mb-3 shadow-md">New in 2026!</div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">The Playoff Challenge</h2>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">We are hosting a massive playoff challenge for <strong>all league winners</strong> from the regular season. Qualify for the playoffs to compete for the ultimate prize package and prove you are the undisputed champion!</p>
        </div>
      </div>
    </div>
  );
}