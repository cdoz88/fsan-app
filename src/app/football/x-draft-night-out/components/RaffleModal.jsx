"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Ticket, Gift, X, ExternalLink, Star, Shirt } from 'lucide-react';

const Youtube = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 7.1C2.6 5.8 3.8 4.8 5 4.7 7.3 4.5 12 4.5 12 4.5s4.7 0 7 .2c1.2.1 2.4 1.1 2.5 2.4.2 1.6.2 3.8.2 4.9 0 1.1 0 3.3-.2 4.9-.1 1.3-1.3 2.3-2.5 2.4-2.3.2-7 .2-7 .2s-4.7 0-7-.2c-1.2-.1-2.4-1.1-2.5-2.4-.2-1.6-.2-3.8-.2-4.9 0-1.1 0-3.3.2-4.9z" />
    <path d="m10 15 5-3-5-3v6z" />
  </svg>
);

export default function RaffleModal({ setShowRaffleModal }) {
  const [raffleTab, setRaffleTab] = useState('tickets');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
       <div className="bg-[#151515] border border-gray-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
          <button onClick={() => setShowRaffleModal(false)} className="absolute top-4 right-4 p-2 bg-gray-900 border border-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors z-20">
            <X size={20} />
          </button>

          <div className="p-6 md:p-8 border-b border-gray-800 bg-[#111] shrink-0 sticky top-0 z-10">
             <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
               <Ticket className="text-[#f5a623]" size={32} />
               2026 Draft Night Out Drawings
             </h2>
             <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-3xl">
               Drawing tickets are available for purchase or for free through the promos below. Each item will have its own cup for tickets, so put all your tickets towards one item or spread them across all prizes!
             </p>
             <div className="mt-6 flex w-full sm:w-fit items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-xl border border-gray-800">
                <button onClick={() => setRaffleTab('tickets')} className={`flex-1 sm:flex-none justify-center px-2 sm:px-5 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 sm:gap-2 ${raffleTab === 'tickets' ? 'bg-[#111] border border-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
                   <Ticket size={16} /> Get Tickets
                </button>
                <button onClick={() => setRaffleTab('prizes')} className={`flex-1 sm:flex-none justify-center px-2 sm:px-5 py-2.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5 sm:gap-2 ${raffleTab === 'prizes' ? 'bg-[#111] border border-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
                   <Gift size={16} /> Prize Vault
                </button>
             </div>
          </div>

          <div className="p-6 md:p-8 overflow-y-auto scrollbar-hide flex-1">
             {raffleTab === 'tickets' && (
                <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                   <div className="bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] p-[2px] rounded-2xl shadow-lg">
                      <div className="bg-[#151515] p-6 md:p-8 rounded-[14px] flex flex-col items-center text-center h-full">
                         <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white mb-2">Buy Tickets</h3>
                         <p className="text-sm text-gray-400 mb-6">Skip the promos and buy tickets directly at the event!</p>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                           <div className="bg-[#111] border border-gray-800 rounded-xl p-4"><div className="text-[#f5a623] font-black md:text-lg mb-1">1 Ticket</div><div className="text-white font-bold">$5</div></div>
                           <div className="bg-[#111] border border-gray-800 rounded-xl p-4"><div className="text-[#f5a623] font-black md:text-lg mb-1">3 Tickets</div><div className="text-white font-bold">$10</div></div>
                           <div className="bg-[#111] border border-gray-800 rounded-xl p-4"><div className="text-[#f5a623] font-black md:text-lg mb-1">7 Tickets</div><div className="text-white font-bold">$20</div></div>
                           <div className="bg-[#111] border border-gray-800 rounded-xl p-4"><div className="text-[#f5a623] font-black md:text-lg mb-1">17 Tickets</div><div className="text-white font-bold">$40</div></div>
                         </div>
                      </div>
                   </div>

                   <div>
                      <h3 className="text-xl font-black uppercase tracking-wider text-white border-b border-gray-800 pb-3 mb-6">Earn Free Tickets</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="flex flex-col gap-6">
                            <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 shadow-inner flex flex-col h-full">
                               <div className="flex items-center gap-3 mb-5">
                                 <img src="https://admin.fsan.com/wp-content/uploads/2025/05/App-Icons-Border.webp" alt="FSAN Logo" className="w-7 h-7 rounded-lg shadow-sm" />
                                 <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-sm leading-tight">Fantasy Sports<br className="hidden lg:block"/> Advice Network</h4>
                               </div>
                               <div className="space-y-6 flex-1">
                                  <div className="flex gap-3 items-start">
                                    <div className="bg-[#111] border border-gray-700 rounded-lg px-2 py-1 text-xs font-black text-[#f5a623] shrink-0 mt-0.5">5 Tix</div>
                                    <div className="w-full">
                                      <p className="text-sm text-gray-300 font-medium mb-1">Get a FSAN Pro+ Membership for $1 with code <strong className="text-white">DNO1</strong>.</p>
                                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-bold">*Required for entry into the grand prize drawing</p>
                                      <a href="/subscribe" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#111] border border-gray-700 text-gray-300 hover:text-white hover:border-[#1b75bb] font-black uppercase tracking-widest text-xs transition-colors">
                                        Upgrade to Pro+
                                      </a>
                                    </div>
                                  </div>
                                  <div className="flex gap-3 items-start">
                                    <div className="bg-[#111] border border-gray-700 rounded-lg px-2 py-1 text-xs font-black text-[#f5a623] shrink-0 mt-0.5">2 Tix</div>
                                    <div className="w-full">
                                      <p className="text-sm text-gray-300 font-medium mb-3">Subscribe to all FSAN YouTube Channels:</p>
                                      <div className="grid grid-cols-2 gap-2">
                                        <a href="https://www.youtube.com/@FSANHQ" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#111] border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold text-gray-400 hover:text-red-400 transition-all"><Youtube size={14}/> HQ</a>
                                        <a href="https://www.youtube.com/@FSANFootball" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#111] border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold text-gray-400 hover:text-red-400 transition-all"><Youtube size={14}/> Football</a>
                                        <a href="https://www.youtube.com/@FSANBasketball" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#111] border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold text-gray-400 hover:text-red-400 transition-all"><Youtube size={14}/> Basketball</a>
                                        <a href="https://www.youtube.com/@FSANBaseball" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#111] border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold text-gray-400 hover:text-red-400 transition-all"><Youtube size={14}/> Baseball</a>
                                        <a href="https://www.youtube.com/@FSANRacing" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#111] border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold text-gray-400 hover:text-red-400 transition-all"><Youtube size={14}/> Racing</a>
                                        <a href="https://www.youtube.com/@FSANGolf" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#111] border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold text-gray-400 hover:text-red-400 transition-all"><Youtube size={14}/> Golf</a>
                                      </div>
                                    </div>
                                  </div>
                               </div>
                            </div>
                            <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 shadow-inner flex flex-col h-full">
                               <div className="flex items-center gap-3 mb-4">
                                 <img src="https://pbs.twimg.com/profile_images/1932082445278400512/MFL7TT8y_400x400.jpg" alt="In-Between Media Logo" className="w-7 h-7 rounded-lg shadow-sm" />
                                 <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-sm">In-Between Media</h4>
                               </div>
                               <div className="flex gap-3 items-start flex-1">
                                  <div className="bg-[#111] border border-gray-700 rounded-lg px-2 py-1 text-xs font-black text-[#f5a623] shrink-0 mt-0.5">1 Tix</div>
                                  <div className="w-full">
                                    <p className="text-sm text-gray-300 font-medium mb-3">Subscribe to both IBT YouTube Channels:</p>
                                    <div className="flex flex-col gap-2">
                                      <a href="https://www.youtube.com/@IBT_Media" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111] border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold text-gray-400 hover:text-red-400 transition-all"><Youtube size={16}/> IBT Channel</a>
                                      <a href="https://www.youtube.com/@IBT-Entertainment" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111] border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-xs font-bold text-gray-400 hover:text-red-400 transition-all"><Youtube size={16}/> IBT Entertainment</a>
                                    </div>
                                  </div>
                               </div>
                            </div>
                            <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 shadow-inner flex flex-col h-full">
                               <div className="flex items-center gap-3 mb-4">
                                 <img src="https://admin.beasellout.com/wp-content/uploads/2025/04/Icon.webp" alt="Sellout Crowds Logo" className="w-7 h-7 rounded-lg shadow-sm bg-white" />
                                 <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-sm">Sellout Crowds</h4>
                               </div>
                               <div className="flex gap-3 items-start mb-4 flex-1">
                                 <div className="bg-[#111] border border-gray-700 rounded-lg px-2 py-1 text-xs font-black text-[#f5a623] shrink-0 mt-0.5">2 Tix</div>
                                 <p className="text-sm text-gray-300 leading-relaxed">Join our Sellout Crowds community for free to earn tickets.</p>
                               </div>
                               <a href="https://www.selloutcrowds.com/crowd/dno" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#111] border border-gray-700 text-gray-300 hover:text-white hover:border-[#1b75bb] font-black uppercase tracking-widest text-xs transition-colors mt-auto"><ExternalLink size={14}/> Join Community</a>
                            </div>
                         </div>
                         <div className="flex flex-col gap-6">
                            <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 shadow-inner flex flex-col h-full">
                               <div className="flex items-center gap-3 mb-4">
                                 <img src="https://fantasysixpack.net/wp-content/uploads/2023/08/F6P_Square-optimized.jpg" alt="Fantasy Six Pack Logo" className="w-7 h-7 rounded-lg shadow-sm" />
                                 <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-sm">Fantasy Six Pack</h4>
                               </div>
                               <div className="flex-1 mb-4">
                                 <p className="text-sm text-gray-300 font-medium mb-3">Use promo code <strong className="text-white">F6PDNO26</strong> to get 20% off membership.</p>
                                 <div className="flex flex-wrap gap-2">
                                   <span className="bg-[#111] border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-300"><strong className="text-[#f5a623]">2 Tix:</strong> 1 Month</span>
                                   <span className="bg-[#111] border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-300"><strong className="text-[#f5a623]">4 Tix:</strong> 3 Months</span>
                                   <span className="bg-[#111] border border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-300"><strong className="text-[#f5a623]">6 Tix:</strong> 6 Months</span>
                                 </div>
                               </div>
                               <a href="https://fantasysixpack.net/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#111] border border-gray-700 text-gray-300 hover:text-white hover:border-[#1b75bb] font-black uppercase tracking-widest text-xs transition-colors mt-auto"><ExternalLink size={14}/> Visit Website</a>
                            </div>
                            <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 shadow-inner flex flex-col h-full">
                               <div className="flex items-center gap-3 mb-4">
                                 <img src="https://play-lh.googleusercontent.com/StS9Sjf6QrFGmgqlJ_IIH1c-cIviRMa2PqrZEAcWbxPYjoKGjdAnDEHtBe49NAEvtwjwKgRUquKGraKYEPKg=w240-h480-rw" alt="FastDraft Fantasy Logo" className="w-7 h-7 rounded-lg shadow-sm" />
                                 <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-sm">FastDraft Fantasy</h4>
                               </div>
                               <div className="flex gap-3 items-start mb-3 flex-1">
                                 <div className="bg-[#111] border border-gray-700 rounded-lg px-2 py-1 text-xs font-black text-[#f5a623] shrink-0 mt-0.5">2 Tix</div>
                                 <div>
                                   <p className="text-sm text-gray-300 leading-relaxed mb-2">100% first-time deposit match up to $50. Use promo code <strong className="text-white">IBT</strong>.</p>
                                   <p className="text-[9px] text-gray-500 leading-tight uppercase font-bold">*Min $5 Deposit. Legal in AL, AK, AR, AZ, CA, CO, DC, FL, GA, IL, KS, KY, MA, MD, MN, MO, NC, NH, ND, NJ, NM, OH, OK, OR, PA, RI, SC, SD, TN, UT, WI, WV, WY</p>
                                 </div>
                               </div>
                               <a href="https://fastdraft.app/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#111] border border-gray-700 text-gray-300 hover:text-white hover:border-[#1b75bb] font-black uppercase tracking-widest text-xs transition-colors mt-auto"><ExternalLink size={14}/> Download FastDraft</a>
                            </div>
                            <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 shadow-inner flex flex-col h-full">
                               <div className="flex items-center gap-3 mb-4">
                                 <img src="https://play-lh.googleusercontent.com/JcpdG8Ipl2oCGFDa7KuyTQ-7E3EVAZJ4-evx6va-bZ9ziXYISLSlvYaaAErOYNTtUqPzGqrMGFD7U5m7O6aE" alt="Wanna Parlay Logo" className="w-7 h-7 rounded-lg shadow-sm" />
                                 <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-sm">Wanna Parlay</h4>
                               </div>
                               <div className="flex gap-3 items-start mb-3 flex-1">
                                 <div className="bg-[#111] border border-gray-700 rounded-lg px-2 py-1 text-xs font-black text-[#f5a623] shrink-0 mt-0.5">2 Tix</div>
                                 <div>
                                   <p className="text-sm text-gray-300 leading-relaxed mb-2">100% first-time deposit match up to $250. Use promo code <strong className="text-white">IBT</strong>.</p>
                                   <p className="text-[9px] text-gray-500 leading-tight uppercase font-bold">*Min $5 Deposit. Legal in AK, AR, CA, FL, GA, IL, KS, KY, MN, NE, NM, ND, OK, OR, RI, SC, SD, TX, UT, WV, WI, WY</p>
                                 </div>
                               </div>
                               <a href="https://wannaparlay.com/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#111] border border-gray-700 text-gray-300 hover:text-white hover:border-[#1b75bb] font-black uppercase tracking-widest text-xs transition-colors mt-auto"><ExternalLink size={14}/> Get App</a>
                            </div>
                            <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 shadow-inner flex flex-col h-full">
                               <div className="flex items-center gap-3 mb-4">
                                 <img src="https://media.licdn.com/dms/image/v2/D560BAQF1mF_kTUja6A/company-logo_200_200/B56ZpQf6WEJYAI-/0/1762287134397?e=2147483647&v=beta&t=fcj7XdzFLiV1wP-nhKdLRPeLVfynlp-Q0fFrZ0TF46E" alt="BlueChip Fantasy Logo" className="w-7 h-7 rounded-lg shadow-sm" />
                                 <h4 className="font-black text-[#1b75bb] uppercase tracking-widest text-sm">BlueChip Fantasy</h4>
                               </div>
                               <div className="flex-1 mb-4">
                                 <p className="text-xs text-gray-400 font-bold mb-1">Sponsored by BlueChip Fantasy Football</p>
                                 <p className="text-sm text-gray-300 leading-snug">College Fantasy Football, Devy & Campus-to-Canton (C2C)</p>
                               </div>
                               <a href="https://playbluechip.com/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#111] border border-gray-700 text-gray-300 hover:text-white hover:border-[#1b75bb] font-black uppercase tracking-widest text-xs transition-colors mt-auto"><ExternalLink size={14}/> Download App</a>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {raffleTab === 'prizes' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                   <h3 className="text-xl font-black uppercase tracking-wider text-white border-b border-gray-800 pb-2">The Prize Vault</h3>
                   <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Andre Reed</strong> (Buffalo Bills) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Josh Hines-Allen</strong> (Jacksonville Jaguars) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Tyreek Hill</strong> (Miami Dolphins) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Troy Franklin</strong> (Denver Broncos) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Hollywood Brown</strong> (Kansas City Chiefs) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Amari Cooper</strong> (Cleveland Browns) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Rico Dowdle</strong> (Dallas Cowboys) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Damar Hamlin</strong> (Buffalo Bills) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Christian Kirk</strong> (Jacksonville Jaguars) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Antonio Gibson</strong> (Washington Commanders) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Ben Skowronek</strong> (Los Angeles Rams) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Shirt size={16} className="text-[#f5a623] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Autographed <strong className="text-white">Treylon Burks</strong> (Tennessee Titans) Jersey</span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Star size={16} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Draft Night Out Shirt <strong className="text-white">(Black)</strong></span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Star size={16} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Draft Night Out Shirt <strong className="text-white">(Green)</strong></span>
                      </li>
                      <li className="flex items-start gap-3 bg-[#111] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-inner">
                        <Ticket size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-gray-300 leading-snug">Entry Into Draft Night Out Online <strong className="text-[#1b75bb]">(2 Winners)</strong></span>
                      </li>
                   </ul>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}