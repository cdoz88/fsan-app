import React from 'react';
import { Lock, ExternalLink, Book, Loader2, Download } from 'lucide-react';

export default function PerksTab({
  hasPurchasedTicket,
  guideLoading,
  rookieGuideUrl
}) {
  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        
        {/* Card 1: 1 Free Month of FSAN Pro+ ($7.99 Value) */}
        <div className="bg-gradient-to-br from-[#111] to-[#151515] border border-[#1b75bb]/40 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(27,117,187,0.15)] text-center relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 flex flex-col h-full justify-between items-center">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#1b75bb]/10 border border-[#1b75bb]/30 flex items-center justify-center mx-auto mb-6 shadow-inner overflow-hidden p-2">
                <img src="/images/dno/FSAN_Logo.png" alt="FSAN" className="w-full h-full object-contain" />
              </div>
              
              <span className="text-[#1b75bb] font-bold uppercase tracking-widest text-xs mb-1 block">
                Exclusive DNO Perk
              </span>
              <span className="inline-block bg-[#1b75bb]/20 border border-[#1b75bb]/40 text-[#27d7ff] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-3">
                $7.99 Value
              </span>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-3">
                1 Free Month of FSAN Pro+
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                As a Draft Night Out participant, your entry includes 1 free month of access to FSAN's premium rankings, trade calculator, trade value charts, and real-time draft advice.
              </p>
              
              <div className="bg-[#1b75bb]/10 border border-[#1b75bb]/30 rounded-xl p-3 mb-6 text-left">
                <span className="text-[#27d7ff] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <Lock size={12} /> Shared Credentials
                </span>
                <p className="text-xs text-gray-300 leading-tight">
                  To claim, log into FSAN.com using your exact <strong>Draft Night Out email and password</strong>. Your accounts are automatically synced!
                </p>
              </div>
            </div>

            {!hasPurchasedTicket ? (
              <button disabled className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-500 font-bold uppercase tracking-widest text-xs py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-inner">
                <Lock size={14} /> Ticket Required
              </button>
            ) : (
              <a 
                href="https://fsan.com/dno-welcome" 
                target="_blank" 
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1b75bb] hover:bg-teal-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02]"
              >
                Access FSAN Pro+ <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Card 2: Football Rookie Draft Guide ($9.99 Value) */}
        <div className="bg-gradient-to-br from-[#301012] to-[#111] border border-red-900/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-red-700 transition-all shadow-xl flex flex-col justify-between">
          <div className="absolute -right-4 -top-4 text-red-500/10 z-0 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <Book size={140} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-red-900/20 border border-red-500/30 flex items-center justify-center mb-6 shadow-inner text-red-500">
                <Book className="w-7 h-7" />
              </div>
              <span className="text-red-400 font-bold uppercase tracking-widest text-xs mb-1 block">
                Exclusive DNO Perk
              </span>
              <span className="inline-block bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-3">
                $9.99 Value
              </span>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-3">
                Football Rookie Draft Guide
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-8">
                Download the official FSAN Rookie Guide to dominate your dynasty rookie drafts with exclusive player grades and tape breakdowns.
              </p>
            </div>

            {!hasPurchasedTicket ? (
              <button disabled className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-500 font-bold uppercase tracking-widest text-xs py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-inner">
                <Lock size={14} /> Ticket Required
              </button>
            ) : guideLoading ? (
              <button disabled className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-500 font-bold uppercase tracking-widest text-xs py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-inner">
                <Loader2 size={16} className="animate-spin" /> Syncing File...
              </button>
            ) : rookieGuideUrl ? (
              <a 
                href={rookieGuideUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download PDF
              </a>
            ) : (
              <button disabled className="w-full bg-[#1a1a1a] border border-gray-700 text-gray-500 font-bold uppercase tracking-widest text-xs py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-inner">
                Not Available
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}