"use client";
import React from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { HeartHandshake, Trophy, Smartphone, Gift, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';

export default function NapkinClient({ proToolsMenu, connectMenu }) {
  const activeSport = 'Football';

  return (
    <>
      <Header activeSport={activeSport} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6 relative">
          
          {/* HERO SECTION */}
          <div className="relative w-full rounded-3xl overflow-hidden mb-12 shadow-2xl border border-gray-800/50 bg-[#111] animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#e42d38]/20 via-[#111] to-[#111] opacity-80 z-0"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#e42d38]/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>

            <div className="relative z-10 p-8 md:p-16 flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e42d38]/10 border border-[#e42d38]/30 text-[#e42d38] text-xs font-bold uppercase tracking-widest mb-6 shadow-inner">
                <HeartHandshake size={14} /> Fantasy For A Cause
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white mb-6 leading-none drop-shadow-2xl">
                THE NAPKIN LEAGUE
              </h1>
              
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
                A community-driven fantasy football league dedicated to spirited competition and charitable giving. Support Mission 22, earn custom collectibles, and dominate the gridiron.
              </p>
              
              <a 
                href="#join-now" 
                className="bg-gradient-to-r from-[#e42d38] to-[#8a1a20] hover:from-[#f03a45] hover:to-[#a3222a] text-white font-black uppercase tracking-widest py-4 px-10 rounded-xl transition-all shadow-[0_0_30px_rgba(228,45,56,0.3)] hover:shadow-[0_0_40px_rgba(228,45,56,0.5)] hover:-translate-y-1 flex items-center gap-3 text-sm md:text-base no-underline"
              >
                Join The League ($5) <ArrowRight size={18} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in duration-700 delay-150">
            
            {/* LEFT COLUMN: STORY & PERKS */}
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
            </div>

            {/* RIGHT COLUMN: THE FUNNEL / HOW TO PLAY */}
            <div className="lg:col-span-4" id="join-now">
              <div className="sticky top-24 bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-700 rounded-3xl p-6 shadow-2xl">
                <div className="text-center pb-6 border-b border-gray-800 mb-6">
                   <h3 className="text-2xl font-black uppercase tracking-wider text-white mb-2">Join The League</h3>
                   <p className="text-gray-400 text-sm">Your $5 donation directly contributes to Mission 22.</p>
                </div>
                
                <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 mb-8 flex items-start gap-4">
                   <Gift size={24} className="text-[#e42d38] shrink-0 mt-1" />
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
                    <div className="w-8 h-8 rounded-full bg-[#e42d38] flex items-center justify-center font-black text-white shrink-0 shadow-[0_0_10px_rgba(228,45,56,0.5)]">2</div>
                    <div className="pt-1">
                      <h5 className="font-bold text-sm text-white mb-1">Make Your Donation</h5>
                      <p className="text-xs text-gray-400 mb-2">Submit your $5 entry fee directly to Mission 22.</p>
                      {/* Replace this href with your actual Mission 22 donation link */}
                      <a href="#" target="_blank" rel="noreferrer" className="inline-block bg-[#111] hover:bg-gray-800 border border-gray-600 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-lg transition-colors no-underline">Donate Here</a>
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
                  href="#" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full bg-[#111] border border-gray-600 hover:border-gray-400 text-white font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 no-underline"
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