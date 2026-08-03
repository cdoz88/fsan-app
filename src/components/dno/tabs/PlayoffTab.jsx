"use client";
import React from 'react';
import Link from 'next/link';
import { Lock, Unlock, Swords, Trophy, TrendingUp, ShieldAlert, ChevronRight, Gift } from 'lucide-react';

export default function PlayoffTab({ isQualified = false }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mb-16 relative z-10">
      
      {/* Header */}
      <div className="flex items-center gap-6 mb-4">
        <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Playoff Challenge</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
      </div>

      {/* Dynamic Status Banner */}
      {isQualified ? (
        <div className="relative bg-gradient-to-r from-green-900/40 to-[#111] border border-green-500/50 rounded-2xl p-6 md:p-8 overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.15)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -left-6 -top-6 text-green-500/10 pointer-events-none">
            <Unlock size={140} />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <Unlock size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Status: Qualified!</h3>
              <p className="text-sm text-green-400 font-medium mt-1">Congratulations Champion, your portal is unlocked.</p>
            </div>
          </div>
          <button className="relative z-10 w-full md:w-auto bg-green-600 hover:bg-green-500 text-white font-black text-sm uppercase tracking-widest py-4 px-8 rounded-xl transition-all shadow-[0_5px_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 group">
            Enter Portal <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="relative bg-[#151515] border border-gray-800 rounded-2xl p-6 md:p-8 overflow-hidden shadow-inner flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -left-6 -top-6 text-gray-800/30 pointer-events-none">
            <Lock size={140} />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 bg-gray-900 text-gray-500 border border-gray-700 rounded-full flex items-center justify-center shrink-0 shadow-inner">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-300 uppercase tracking-wider">Status: Locked</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Win a DNO division to unlock the Playoff Portal.</p>
            </div>
          </div>
          <button disabled className="relative z-10 w-full md:w-auto bg-gray-800 border border-gray-700 text-gray-500 font-black text-xs uppercase tracking-widest py-4 px-8 rounded-xl cursor-not-allowed shadow-inner flex items-center justify-center gap-2">
            Awaiting Qualification
          </button>
        </div>
      )}

      {/* The Teaser Content */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-gray-800 rounded-3xl p-8 md:p-12 shadow-xl">
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-6 text-center md:text-left">The Ultimate Gauntlet</h3>
        <p className="text-gray-300 leading-relaxed mb-10 text-sm md:text-base">
          Winning your 12-team division is just the beginning. The Draft Night Out Playoff Challenge pits every single divisional winner from across the entire platform against one another in a massive postseason showdown to determine who takes home the Grand Prize bundle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-900/50 transition-colors">
            <div className="w-10 h-10 bg-blue-900/20 text-blue-400 border border-blue-500/30 rounded-lg flex items-center justify-center mb-4">
              <Swords size={20} />
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-wider mb-2">1. Win Your League</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dominate your 12-team regular season and secure the championship. Every league winner automatically earns a golden ticket into the Playoff Challenge.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-900/50 transition-colors">
            <div className="w-10 h-10 bg-yellow-900/20 text-yellow-400 border border-yellow-500/30 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-wider mb-2">2. Maximize Odds</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Want an edge? Play in multiple leagues to increase your odds of qualifying for the Playoff Challenge. While you can only secure one entry into the postseason tournament, drafting more teams gives you more paths to a divisional title!
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-900/50 transition-colors">
            <div className="w-10 h-10 bg-purple-900/20 text-purple-400 border border-purple-500/30 rounded-lg flex items-center justify-center mb-4">
              <Trophy size={20} />
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-wider mb-2">3. The Showdown</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              When the NFL Playoffs begin, the portal will unlock. Format and platform details will be revealed exclusively to qualified managers late in the season.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-red-900/10 border border-red-900/30 rounded-xl p-4">
        <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
        <p className="text-xs text-red-400/80 leading-relaxed">
          <strong>Note:</strong> The Playoff Challenge is an exclusive postseason event. Only users who officially win a verified Draft Night Out league will have their dashboard unlocked. Entering multiple leagues increases your chances of securing a qualifying spot.
        </p>
      </div>

      {/* Hype / Call to Action */}
      <div className="flex flex-col items-center justify-center mt-12 mb-4 animate-in fade-in zoom-in duration-500 delay-300">
        <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-5 text-center drop-shadow-md">
          What happens if you win it all?
        </h3>
        <Link 
          href="?tab=prizes" 
          scroll={false} 
          className="relative group p-[2px] rounded-xl bg-gradient-to-r from-purple-500 to-[#1b75bb] shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-transform hover:-translate-y-1"
        >
          <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-8 py-4 flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-sm">
            <Gift size={20} className="text-purple-400 group-hover:text-white transition-colors" /> 
            See the Grand Prize Package
          </div>
        </Link>
      </div>

    </div>
  );
}