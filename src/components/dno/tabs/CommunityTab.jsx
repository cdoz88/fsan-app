"use client";
import React from 'react';
import { ExternalLink, Users, MessageSquare, Trophy, Flame, Sparkles } from 'lucide-react';

export default function CommunityTab() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16 max-w-4xl mx-auto">
      <div className="bg-[#151515] border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-center">
        
        {/* Glow Backdrops */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#1b75bb]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#f5a623]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Sellout Crowds Logo */}
        <div className="flex justify-center mb-8 relative z-10">
          <img 
            src="/images/dno/SC Logo White.png" 
            alt="Sellout Crowds Logo" 
            className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          />
        </div>

        {/* Category Pill */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b75bb]/10 border border-[#1b75bb]/30 text-[#1b75bb] text-xs font-black uppercase tracking-widest mb-4 relative z-10">
          <Users size={14} /> Official DNO Clubhouse
        </span>

        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tight mb-6 relative z-10">
          Where Fantasy Managers <span className="text-[#f5a623]">Unite</span> (and Trash Talk)
        </h2>

        {/* Community Blurb */}
        <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-10 relative z-10">
          Draft Night Out isn't just a 17-round battle—it’s a full-contact sport. Jump into the official <strong>DNO Crowd on Sellout Crowds</strong> to steal high-stakes draft tips, flex your championship roster, keep up with weekly prize rewards, vent about heart-wrenching stat corrections, and make lifelong friends... or bitter new nemeses.
        </p>

        {/* Community Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-left relative z-10">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center text-center">
            <Sparkles className="w-8 h-8 text-[#1b75bb] mb-2" />
            <h4 className="text-xs font-black uppercase text-white tracking-wider mb-1">Tips & Tricks</h4>
            <p className="text-[11px] text-gray-400">Get the competitive edge straight from fellow managers.</p>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center text-center">
            <Flame className="w-8 h-8 text-[#f5a623] mb-2" />
            <h4 className="text-xs font-black uppercase text-white tracking-wider mb-1">Roster Flexing</h4>
            <p className="text-[11px] text-gray-400">Brag about your squad or vent about brutal bad beats.</p>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center text-center">
            <Trophy className="w-8 h-8 text-emerald-400 mb-2" />
            <h4 className="text-xs font-black uppercase text-white tracking-wider mb-1">Weekly Rewards</h4>
            <p className="text-[11px] text-gray-400">Stay updated on live giveaways and prize drops.</p>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center text-center">
            <MessageSquare className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="text-xs font-black uppercase text-white tracking-wider mb-1">Friends & Nemeses</h4>
            <p className="text-[11px] text-gray-400">Build rivalries that span far beyond draft night.</p>
          </div>
        </div>

        {/* CTA Button */}
        <a 
          href="https://www.selloutcrowds.com/crowd/dno" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-[#1b75bb] to-teal-500 hover:from-[#155d96] hover:to-teal-600 text-white font-black uppercase tracking-widest text-xs md:text-sm px-10 py-5 rounded-2xl transition-all shadow-xl hover:scale-105 relative z-10"
        >
          <span>Join The DNO Crowd</span>
          <ExternalLink size={18} />
        </a>

      </div>
    </div>
  );
}