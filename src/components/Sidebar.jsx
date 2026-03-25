import React from 'react';

// --- 1. HOME / NETWORK SIDEBAR ---
const HomeSidebar = () => (
  <>
    <div>
      <div className="bg-[#1a1a1a] p-3 border-b-2 border-red-600 font-bold uppercase tracking-wider text-sm shadow-md mb-4">
        2026 Rookie Guide
      </div>
      <div className="bg-gradient-to-b from-red-900 to-black border border-red-800 p-4 rounded-lg text-center cursor-pointer hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_20px)]"></div>
         <div className="relative z-10">
           <h3 className="text-red-500 font-black text-2xl italic tracking-tighter mb-1 uppercase drop-shadow-md">Dominate</h3>
           <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-3">Your Draft With The Ultimate<br/>Rookie Breakdown!</p>
           <div className="bg-black/50 p-2 rounded text-left text-[10px] text-green-400 font-bold mb-3 border border-gray-800">
              <p>✓ Detailed Scouting Reports</p><p>✓ Positional Rankings</p><p>✓ Team Fit Analysis</p>
           </div>
           <button className="bg-green-600 hover:bg-green-500 text-white w-full py-2 rounded-full font-black text-xs uppercase tracking-wider transform transition hover:scale-105 shadow-lg">
             Only $10 - Get Access
           </button>
         </div>
      </div>
    </div>

    <div>
      <div className="bg-[#1a1a1a] p-3 border-b-2 border-gray-600 font-bold uppercase tracking-wider text-sm shadow-md mb-4">
        Get Merch!
      </div>
      <div className="bg-[#111] border border-gray-800 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-purple-600 transition-all group overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-black z-0"></div>
        <h3 className="text-purple-500 font-black text-xl italic uppercase z-10 group-hover:scale-110 transition-transform">Fantasy Apparel</h3>
        <p className="text-gray-400 text-xs z-10 mt-2">FSAN.SHOP</p>
        <button className="mt-4 bg-transparent border-2 border-purple-600 text-purple-400 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-purple-600 hover:text-white transition-colors z-10">
          Shop Now
        </button>
      </div>
    </div>
  </>
);

// --- 2. FOOTBALL SIDEBAR ---
const FootballSidebar = () => (
  <>
    <div>
      <div className="bg-[#1a1a1a] p-3 border-b-2 border-red-600 font-bold uppercase tracking-wider text-sm shadow-md mb-4 text-red-500">
        NFL Draft Kit
      </div>
      <div className="bg-[#111] border border-red-900/50 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition-all text-center">
        <h3 className="text-white font-black text-xl uppercase mb-2">Dynasty Rankings</h3>
        <p className="text-gray-400 text-xs mb-4">Updated daily for the 2026 season. Get the edge on your league.</p>
        <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors w-full">
          View Rankings
        </button>
      </div>
    </div>
  </>
);

// --- 3. BASKETBALL SIDEBAR ---
const BasketballSidebar = () => (
  <>
    <div>
      <div className="bg-[#1a1a1a] p-3 border-b-2 border-orange-500 font-bold uppercase tracking-wider text-sm shadow-md mb-4 text-orange-500">
        NBA Tools
      </div>
      <div className="bg-[#111] border border-orange-900/50 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-all text-center">
        <h3 className="text-white font-black text-xl uppercase mb-2">DFS Optimizer</h3>
        <p className="text-gray-400 text-xs mb-4">Build winning lineups with our custom NBA projections.</p>
        <button className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors w-full">
          Start Optimizing
        </button>
      </div>
    </div>
  </>
);

// --- 4. BASEBALL SIDEBAR ---
const BaseballSidebar = () => (
  <>
    <div>
      <div className="bg-[#1a1a1a] p-3 border-b-2 border-blue-500 font-bold uppercase tracking-wider text-sm shadow-md mb-4 text-blue-500">
        MLB Analysis
      </div>
      <div className="bg-[#111] border border-blue-900/50 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all text-center">
        <h3 className="text-white font-black text-xl uppercase mb-2">Trade Analyzer</h3>
        <p className="text-gray-400 text-xs mb-4">Don't get fleeced. Evaluate 2-for-1 and 3-for-2 MLB trades instantly.</p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors w-full">
          Analyze Trade
        </button>
      </div>
    </div>
  </>
);

// --- SMART CONTROLLER ---
// This component automatically picks the right sidebar based on the active sport!
export default function Sidebar({ activeSport }) {
  return (
    <div className="hidden lg:flex lg:col-span-3 flex-col gap-6 w-full">
      {activeSport === 'Football' && <FootballSidebar />}
      {activeSport === 'Basketball' && <BasketballSidebar />}
      {activeSport === 'Baseball' && <BaseballSidebar />}
      {activeSport === 'All' && <HomeSidebar />}
    </div>
  );
}