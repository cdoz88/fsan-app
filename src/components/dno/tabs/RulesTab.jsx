import React from 'react';

export default function RulesTab() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
      <section className="bg-[#1a1a1a] rounded-3xl p-8 md:p-10 border border-gray-800 shadow-xl mb-16">
         <h2 className="text-3xl font-black italic text-white mb-8">OFFICIAL LEAGUE RULES</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
               <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">The Golden Rules</h3>
               <ul className="space-y-4 text-sm text-gray-400 font-medium">
                 <li className="flex gap-3 items-center"><span className="text-[#1b75bb] font-black text-lg">1.</span> Be Cool.</li>
                 <li className="flex gap-3 items-center"><span className="text-[#1b75bb] font-black text-lg">2.</span> No Colluding.</li>
                 <li className="flex gap-3 items-center"><span className="text-[#1b75bb] font-black text-lg">3.</span> Max 1 Team per League.</li>
               </ul>
            </div>
            <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
               <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">Draft Settings</h3>
               <ul className="space-y-4 text-sm text-gray-400 font-medium">
                 <li className="flex gap-3 items-center"><span className="text-[#f5a623] font-black text-lg">•</span> Hosted on Sleeper App</li>
                 <li className="flex gap-3 items-center"><span className="text-[#f5a623] font-black text-lg">•</span> 12 Teams Per League</li>
                 <li className="flex gap-3 items-center"><span className="text-[#f5a623] font-black text-lg">•</span> Randomized Pick Order</li>
                 <li className="flex gap-3 items-center"><span className="text-[#f5a623] font-black text-lg">•</span> Snake Draft</li>
               </ul>
            </div>
            <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
               <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">Scoring & Format</h3>
               <ul className="space-y-4 text-sm text-gray-400 font-medium">
                 <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">PPR</span></li>
                 <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Start: 1 QB 2 RB 3 WR 1 TE 3 FLEX 1 DST</span></li>
                 <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Bench: 8 Players plus 1 IR</span></li>
                 <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Playoffs: Top 4 advance in Wk 15</span></li>
                 <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Two-Week Championship (Wks 16 & 17)</span></li>
                 <li className="flex gap-3 items-start"><span className="text-[#f5a623] font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">League winner advances to the Playoff Challenge</span></li>
               </ul>
            </div>
         </div>
         <div className="mt-6 bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
           <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-3 border-b border-gray-800 pb-3">Specialty Leagues</h3>
           <p className="text-sm text-gray-400 font-medium leading-relaxed">Leagues featuring specialty scoring or alternative formats (such as Dynasty or Superflex) are not included on the global Draft Night Out leaderboard due to point variances. However, the winners of these leagues are still fully eligible to advance and compete in the Playoff Challenge!</p>
         </div>
      </section>
    </div>
  );
}