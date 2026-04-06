"use client";
import React, { useState } from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import NapkinLeaderboard from '../../../components/NapkinLeaderboard';
import { HeartHandshake, Trophy, Gift, BarChart3, ShieldCheck, ArrowRight, ListOrdered, BookOpen, Heart } from 'lucide-react';

export default function NapkinClient({ proToolsMenu, connectMenu, initialLeaderboard }) {
  const activeSport = 'Football';
  const [activeTab, setActiveTab] = useState('leaderboard');

  // Unified Dark Blue styling for active tabs
  const activeTabStyle = "bg-blue-800 text-white shadow-[0_0_15px_rgba(30,64,175,0.5)] border border-blue-600";
  const inactiveTabStyle = "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent";

  return (
    <>
      <Header activeSport={activeSport} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6 relative">
          
          {/* HERO SECTION - CONSTANT */}
          <div className="relative w-full rounded-3xl overflow-hidden mb-8 shadow-2xl border border-gray-800/50 bg-[#111] animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-white/5 to-blue-600/20 opacity-90 z-0"></div>
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

            <div className="relative z-10 p-8 md:p-16 flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6 shadow-inner backdrop-blur-sm">
                <HeartHandshake size={14} /> Fantasy For A Cause
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white mb-6 leading-none drop-shadow-2xl">
                THE NAPKIN LEAGUE
              </h1>
              
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl drop-shadow-md">
                A community-driven fantasy football league dedicated to spirited competition and charitable giving. Support Mission 22, earn custom collectibles, and dominate the gridiron.
              </p>
              
              <a 
                href="http://donate.mission22.org/campaign/702655/donate" 
                target="_blank" 
                rel="noreferrer"
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest py-4 px-10 rounded-xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] hover:-translate-y-1 flex items-center gap-3 text-sm md:text-base no-underline"
              >
                Join The League ($5) <ArrowRight size={18} />
              </a>
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-2 mb-8 bg-[#151515] p-2 rounded-2xl border border-gray-800/50 w-fit mx-auto shadow-inner animate-in fade-in duration-500 delay-100">
             <button 
                onClick={() => setActiveTab('leaderboard')} 
                className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'leaderboard' ? activeTabStyle : inactiveTabStyle}`}
             >
               <ListOrdered size={16} /> Leaderboard
             </button>
             <button 
                onClick={() => setActiveTab('cause')} 
                className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'cause' ? activeTabStyle : inactiveTabStyle}`}
             >
               <Heart size={16} /> The Cause
             </button>
             <button 
                onClick={() => setActiveTab('rules')} 
                className={`px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${activeTab === 'rules' ? activeTabStyle : inactiveTabStyle}`}
             >
               <BookOpen size={16} /> League Rules
             </button>
          </div>

          {/* MAIN GRID LAYOUT: Content on Left (8 cols), Funnel on Right (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in duration-700 delay-150">
            
            {/* LEFT COLUMN: TAB CONTENT */}
            <div className="lg:col-span-8 flex flex-col gap-8 min-w-0">
              
              {/* TAB 1: LEADERBOARD */}
              {activeTab === 'leaderboard' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <NapkinLeaderboard initialLeaderboard={initialLeaderboard} />
                 </div>
              )}

              {/* TAB 2: THE CAUSE */}
              {activeTab === 'cause' && (
                 <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section className="bg-[#1a1a1a] rounded-3xl p-8 md:p-10 border border-gray-800 shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Trophy size={160} /></div>
                       <h2 className="text-2xl font-black uppercase tracking-wider text-white mb-4 relative z-10">Our Origin Story</h2>
                       <p className="text-gray-400 leading-relaxed mb-4 relative z-10">
                         The Napkin League was born from a simple act of camaraderie: a fantasy league created to offer a welcome distraction and entertainment for a neighbor battling cancer. What started as a small gesture of support has grown into a vibrant community of fantasy football enthusiasts united by a passion for the game and a commitment to making a positive impact.
                       </p>
                       <p className="text-gray-400 leading-relaxed relative z-10">
                         Our name, and our premier trophy, pay homage to the legendary Stanley Cup. While Lord Stanley forged his iconic trophy from 459 ounces of silver, our tradition celebrates <strong>"Stanley's Napkin,"</strong> a symbol of our league's unique origins, crowned with a pound of .999 pure silver. This, along with a host of custom-designed awards crafted by the renowned Glass Panther, honors our champions each season.
                       </p>
                    </section>

                    <section className="bg-[#1a1a1a] rounded-3xl p-8 md:p-10 border border-gray-800 shadow-xl">
                       <h2 className="text-2xl font-black italic text-white mb-6 uppercase">Rewards & Features</h2>
                       <div className="flex flex-col gap-6">
                          <div className="bg-gradient-to-br from-[#151515] to-[#111] p-6 rounded-2xl border border-gray-800 shadow-inner flex flex-col sm:flex-row items-start gap-5">
                             <div className="w-12 h-12 shrink-0 bg-blue-900/20 rounded-full flex items-center justify-center">
                               <ShieldCheck size={24} className="text-blue-500" />
                             </div>
                             <div>
                               <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">Trading Napkins</h3>
                               <p className="text-gray-400 text-sm leading-relaxed">
                                 Top weekly performers and tournament leaders will be immortalized with their own custom <strong>"Trading Napkins,"</strong> unique digital trading cards to commemorate their victories.
                               </p>
                             </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-[#151515] to-[#111] p-6 rounded-2xl border border-gray-800 shadow-inner flex flex-col sm:flex-row items-start gap-5">
                             <div className="w-12 h-12 shrink-0 bg-orange-900/20 rounded-full flex items-center justify-center">
                               <BarChart3 size={24} className="text-orange-500" />
                             </div>
                             <div className="flex flex-col items-start">
                               <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest">In-Depth Analytics</h3>
                               <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                 Dive deep into your performance with our weekly statistical reports and track your progress throughout the season with our leaderboard interface.
                               </p>
                               <button 
                                 onClick={() => setActiveTab('leaderboard')}
                                 className="bg-[#111] hover:bg-gray-800 border border-gray-700 text-gray-200 hover:text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm"
                               >
                                 View Leaderboard <ArrowRight size={14}/>
                               </button>
                             </div>
                          </div>
                       </div>
                    </section>
                 </div>
              )}

              {/* TAB 3: LEAGUE RULES */}
              {activeTab === 'rules' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section className="bg-[#1a1a1a] rounded-3xl p-8 md:p-10 border border-gray-800 shadow-xl">
                       <h2 className="text-3xl font-black italic text-white mb-8">OFFICIAL LEAGUE RULES</h2>
                       <div className="flex flex-col gap-8">
                          
                          <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
                             <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">The Golden Rules</h3>
                             <ul className="space-y-4 text-sm text-gray-400 font-medium">
                               <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">1.</span> Be Cool.</li>
                               <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">2.</span> Must be over 18 to play.</li>
                               <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">3.</span> No Colluding.</li>
                               <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">4.</span> Max 5 Teams per Owner.</li>
                               <li className="flex gap-3 items-center"><span className="text-red-500 font-black text-lg">5.</span> Max 1 Team per League.</li>
                             </ul>
                          </div>

                          <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
                             <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">Draft Settings</h3>
                             <ul className="space-y-4 text-sm text-gray-400 font-medium grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                               <li className="flex gap-3 items-center"><span className="text-blue-500 font-black text-lg">•</span> Hosted on Sleeper App</li>
                               <li className="flex gap-3 items-center"><span className="text-blue-500 font-black text-lg">•</span> 12 Teams Per League</li>
                               <li className="flex gap-3 items-center"><span className="text-blue-500 font-black text-lg">•</span> Randomized Pick Order</li>
                               <li className="flex gap-3 items-center"><span className="text-blue-500 font-black text-lg">•</span> Slow Draft, Snake format</li>
                               <li className="flex gap-3 items-center"><span className="text-blue-500 font-black text-lg">•</span> 8 Hour Pick Clock (Off 12p-10a ET)</li>
                               <li className="flex gap-3 items-center"><span className="text-blue-500 font-black text-lg">•</span> Draft starts once league fills</li>
                             </ul>
                          </div>

                          <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 shadow-inner">
                             <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-6 border-b border-gray-800 pb-3">Scoring & Format</h3>
                             <ul className="space-y-4 text-sm text-gray-400 font-medium grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                               <li className="flex gap-3 items-start"><span className="text-orange-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">PPR PPFD "Big Plays"</span></li>
                               <li className="flex gap-3 items-start"><span className="text-orange-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Start: 1QB 2RB 3WR 1TE 1FLEX 1DST</span></li>
                               <li className="flex gap-3 items-start"><span className="text-orange-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Bench: 5 Players (Plus 1 IR)</span></li>
                               <li className="flex gap-3 items-start"><span className="text-orange-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Playoffs: Top 4 advance in Wk 15</span></li>
                               <li className="flex gap-3 items-start"><span className="text-orange-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Two-Week Championship (Wks 16 & 17)</span></li>
                               <li className="flex gap-3 items-start"><span className="text-orange-500 font-black text-lg leading-none mt-1">»</span> <span className="pt-0.5">Winner: Most points among league champs</span></li>
                             </ul>
                          </div>
                       </div>
                    </section>
                 </div>
              )}

            </div>

            {/* RIGHT COLUMN: PERMANENT JOIN FUNNEL */}
            <div className="lg:col-span-4 relative">
              <div className="sticky top-24 bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-700 rounded-3xl p-6 shadow-2xl">
                
                {/* 2-Column Desktop layout for Mission 22 Join Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 pb-6 border-b border-gray-800 mb-6">
                   <div className="flex-1">
                     <h3 className="text-2xl font-black uppercase tracking-wider text-white mb-2">Join Today</h3>
                     <p className="text-gray-400 text-sm font-bold">Your entry fee directly contributes to Mission 22.</p>
                   </div>
                   <div className="shrink-0 flex items-center h-full">
                     <img 
                        src="https://admin.fsan.com/wp-content/uploads/2026/04/Mission-22-Logo.webp" 
                        alt="Mission 22" 
                        className="w-20 md:w-28 h-auto object-contain drop-shadow-lg" 
                     />
                   </div>
                </div>
                
                <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 mb-8 flex items-start gap-4">
                   <Gift size={24} className="text-red-500 shrink-0 mt-1" />
                   <div>
                     <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">Instant $5 Shop Credit</h4>
                     <p className="text-xs text-gray-400 leading-relaxed">When you donate to enter, you instantly receive a $5 Gift Certificate to the FSAN Shop to purchase the Rookie Draft Guide or apply to any merch!</p>
                   </div>
                </div>

                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">How To Enter</h4>
                
                <div className="space-y-6 mb-8">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-black text-white shrink-0 shadow-inner border border-gray-700">1</div>
                    <div className="pt-1">
                      <h5 className="font-bold text-sm text-white mb-1">Get The App</h5>
                      <p className="text-xs text-gray-400">Make sure you have the Sleeper Fantasy app installed.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-black text-white shrink-0 shadow-[0_0_10px_rgba(220,38,38,0.5)]">2</div>
                    <div className="pt-1">
                      <h5 className="font-bold text-sm text-white mb-1">Make Your Donation</h5>
                      <p className="text-xs text-gray-400 mb-2">Submit your $5 entry fee directly to Mission 22.</p>
                      <a 
                        href="http://donate.mission22.org/campaign/702655/donate" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-block bg-[#111] hover:bg-gray-800 border border-gray-600 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-lg transition-colors no-underline shadow-md"
                      >
                        Donate Here
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-black text-white shrink-0 shadow-inner border border-gray-700">3</div>
                    <div className="pt-1">
                      <h5 className="font-bold text-sm text-white mb-1">Get Your Invite</h5>
                      <p className="text-xs text-gray-400">Once processed, our commissioner will send your Sleeper invite.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-black text-white shrink-0 shadow-inner border border-gray-700">4</div>
                    <div className="pt-1">
                      <h5 className="font-bold text-sm text-white mb-1">Compete!</h5>
                      <p className="text-xs text-gray-400">Draft your team and battle for Stanley's Napkin.</p>
                    </div>
                  </div>
                </div>

                <a 
                  href="https://www.selloutcrowds.com/sp-fanfeed/napkin-league" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full bg-[#111] border border-gray-600 hover:border-gray-400 text-white font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 no-underline shadow-inner"
                >
                  Join League Chat
                </a>
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </>
  );
}