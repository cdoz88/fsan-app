import React from 'react';
import { HeartHandshake } from 'lucide-react';

export default function CharityTab() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
      <div className="flex items-center gap-6 mb-8">
          <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Charity</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
      </div>
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl p-8 md:p-12 border border-gray-800 shadow-xl text-center flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5a623]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
         <div className="w-20 h-20 bg-[#111] border border-gray-700 rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10"><HeartHandshake size={32} className="text-[#f5a623]" /></div>
         <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-4 relative z-10">Playing for a Purpose</h3>
         <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed relative z-10">Draft Night Out isn't just about winning a championship—it's about giving back. More details regarding our 2026 charity partnerships and donation initiatives will be announced here soon!</p>
      </div>
    </div>
  );
}