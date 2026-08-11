import React from 'react';
import { Mail } from 'lucide-react';

export default function SponsorsTab() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
      <div className="flex items-center gap-6 mb-8">
         <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Partner With Us</h2>
         <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
      </div>
      <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 p-8 md:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1b75bb]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="max-w-3xl relative z-10">
          <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-4">Become a Sponsor</h3>
          <p className="text-gray-300 leading-relaxed mb-8">We are always looking to collaborate with brands and individuals who want to make Draft Night Out the ultimate fantasy football experience. Whether you're interested in location hosting, providing prize giveaways, donating raffle items, or exploring other partnership opportunities, we'd love to hear from you!</p>
          <a href="mailto:info@fsannetwork.com" className="inline-block relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(27,117,187,0.2)] transition-transform hover:-translate-y-0.5">
            <div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-8 py-4 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs"><Mail size={16} /> Contact Us About Sponsorships</div>
          </a>
        </div>
      </div>
    </div>
  );
}