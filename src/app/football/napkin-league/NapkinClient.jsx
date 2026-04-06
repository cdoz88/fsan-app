"use client";
import React from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import NapkinLeaderboard from '../../../components/NapkinLeaderboard'; // <-- IMPORTED HERE
import { HeartHandshake, Trophy, Gift, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';

export default function NapkinClient({ proToolsMenu, connectMenu }) {
  const activeSport = 'Football';

  return (
    <>
      <Header activeSport={activeSport} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6 relative">
          
          {/* HERO SECTION - RED, WHITE & BLUE THEME */}
          <div className="relative w-full rounded-3xl overflow-hidden mb-12 shadow-2xl border border-gray-800/50 bg-[#111] animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Ambient Red, White, and Blue Gradients */}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in duration-700 delay-150">
            
            {/* LEFT COLUMN: STORY, PERKS, & RULES */}
            <div className="lg:col-span-8 flex flex-col gap-12">
              
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

              <section>
                 <h2 className="text-3xl font-black italic text-white mb-6">MORE THAN JUST A GAME</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] p-8 rounded-3xl border border-gray-800 hover:border-gray-600 transition-colors shadow-lg">
                       <div className="w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                         <ShieldCheck size={24} className="text-blue-500" />
                       </div>
                       <h3 className="text-xl font-bold text-white mb-3">Custom Collectibles</h3>
                       <p className="text-gray-400 text-sm leading-relaxed">
                         Each week, top performers and tournament leaders will be immortalized with their own custom <strong>"Trading Napkins,"</strong> unique digital trading cards to commemorate their victories.
                       </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] p-8 rounded-3xl border border-gray-800 hover:border-gray-600 transition-colors shadow-lg">
                       <div className="w-12 h-12 bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
                         <BarChart3 size={24} className="text-orange-500" />
                       </div>
                       <h3 className="text-xl font-bold text-white mb-3">In-Depth Analytics</h3>
                       <p className="text-gray-400 text-sm leading-relaxed">
                         Dive deep into your performance with our weekly statistical reports and track your progress throughout the season with a personalized <strong>"Report Card,"</strong> inspired by the classic WinAMP interface.
                       </p>
                    </div>
                 </div>
              </section>

              {/* INTEGRATED RULES SECTION */}
              <section className="mb-8">
                 <h2 className="text-3xl font-black italic text-white mb-6">OFFICIAL LEAGUE RULES</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-gray-800 shadow-lg">
                       <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-4 border-b border-gray-800 pb-2">The Golden Rules</h3>
                       <ul className="space-y-3 text-sm text-gray-400">
                         <li className="flex gap-2"><span className="text-red-500 font-bold">1.</span> Be Cool.</li>
                         <li className="flex gap-2"><span className="text-red-500 font-bold">2.</span> Must be over 18 to play.</li>
                         <li className="flex gap-2"><span className="text-red-500 font-bold">3.</span> No Colluding.</li>
                         <li className="flex gap-2"><span className="text-red-500 font-bold">4.</span> Max 5 Teams per Owner.</li>
                         <li className="flex gap-2"><span className="text-red-500 font-bold">5.</span> Max 1 Team per League.</li>
                       </ul>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-gray-800 shadow-lg">
                       <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-4 border-b border-gray-800 pb-2">Draft Settings</h3>
                       <ul className="space-y-3 text-sm text-gray-400">
                         <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Hosted on Sleeper App</li>
                         <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> 12 Teams Per League</li>
                         <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Randomized Pick Order</li>
                         <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Slow Draft, Snake format</li>
                         <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> 8 Hour Pick Clock (Off 12p-10a ET)</li>
                         <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Draft starts once league fills</li>
                       </ul>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-3xl p-6 border border-gray-800 shadow-lg">
                       <h3 className="text-lg font-black uppercase tracking-widest text-gray-300 mb-4 border-b border-gray-800 pb-2">Scoring & Format</h3>
                       <ul className="space-y-3 text-sm text-gray-400">
                         <li className="flex gap-2"><span className="text-white font-bold">»</span> PPR PPFD "Big Plays"</li>
                         <li className="flex gap-2"><span className="text-white font-bold">»</span> Start: 1QB 2RB 3WR 1TE 1FLEX 1DST</li>
                         <li className="flex gap-2"><span className="text-white font-bold">»</span> Bench: 5 Players (Plus 1 IR)</li>
                         <li className="flex gap-2"><span className="text-white font-bold">»</span> Playoffs: Top 4 advance in Wk 15</li>
                         <li className="flex gap-2"><span className="text-white font-bold">»</span> Two-Week Championship (Wks 16 & 17)</li>
                         <li className="flex gap-2"><span className="text-white font-bold">»</span> Winner: Most points among league champs</li>
                       </ul>
                    </div>
                 </div>
              </section>

            </div>

            {/* RIGHT COLUMN: THE FUNNEL / HOW TO PLAY */}
            <div className="lg:col-span-4" id="join-now">
              <div className="sticky top-24 bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-700 rounded-3xl p-6 shadow-2xl">
                <div className="text-center pb-6 border-b border-gray-800 mb-6">
                   <img 
                      src="https://admin.fsan.com/wp-content/uploads/2026/04/Mission-22-Logo.webp" 
                      alt="Mission 22" 
                      className="h-16 mx-auto mb-4 object-contain drop-shadow-lg" 
                   />
                   <h3 className="text-2xl font-black uppercase tracking-wider text-white mb-2">Join The League</h3>
                   <p className="text-gray-400 text-sm">Your $5 donation directly contributes to Mission 22.</p>
                </div>
                
                <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 mb-8 flex items-start gap-4">
                   <Gift size={24} className="text-red-500 shrink-0 mt-1" />
                   <div>
                     <h4 className="text-white font-bold text-sm mb-1">Instant $5 Shop Credit</h4>
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
                  href="http://sleeper.com/i/89LZ1pyL1QE5" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full bg-[#111] border border-gray-600 hover:border-gray-400 text-white font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 no-underline shadow-inner"
                >
                  Join League Chat
                </a>
              </div>
            </div>

          </div>

          {/* DYNAMIC LEADERBOARD INJECTED HERE */}
          <NapkinLeaderboard />

        </div>
      </div>
    </>
  );
}