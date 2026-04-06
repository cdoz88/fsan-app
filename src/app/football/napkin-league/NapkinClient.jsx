"use client";
import React from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import NapkinLeaderboard from '../../../components/NapkinLeaderboard';
import { HeartHandshake, Trophy, Gift, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react';

export default function NapkinClient({ proToolsMenu, connectMenu, initialLeaderboard }) {
  const activeSport = 'Football';

  return (
    <>
      <Header activeSport={activeSport} />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        <div className="flex-1 w-full pt-6 min-w-0">
          <div className="relative w-full rounded-3xl overflow-hidden mb-12 shadow-2xl border border-gray-800/50 bg-[#111] animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-white/5 to-blue-600/20 opacity-90"></div>
            <div className="relative z-10 p-8 md:p-16 flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm"><HeartHandshake size={14} /> Fantasy For A Cause</div>
              <h1 className="text-5xl md:text-7xl font-black italic text-white mb-6 leading-none drop-shadow-2xl">THE NAPKIN LEAGUE</h1>
              <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl drop-shadow-md">A community-driven fantasy football league dedicated to competition and charitable giving. Support Mission 22, earn collectibles, and dominate.</p>
              <a href="http://donate.mission22.org/campaign/702655/donate" target="_blank" rel="noreferrer" className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 text-white font-black py-4 px-10 rounded-xl transition-all shadow-xl flex items-center gap-3 no-underline uppercase text-sm tracking-widest">Join The League ($5) <ArrowRight size={18} /></a>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in duration-700 delay-150">
            <div className="lg:col-span-8 flex flex-col gap-12">
              <section className="bg-[#1a1a1a] rounded-3xl p-8 border border-gray-800 shadow-xl relative overflow-hidden"><div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Trophy size={160} /></div><h2 className="text-2xl font-black uppercase text-white mb-4">Our Origin Story</h2><p className="text-gray-400 leading-relaxed">The Napkin League was born from acts of camaraderie for a neighbor battling cancer. What started as a small gesture grown into a vibrant community of fantasy enthusiasts united by a commitment to impact. Our premier trophy, crowned with a pound of .999 pure silver, honors our champions each season.</p></section>
              <section><h2 className="text-3xl font-black italic text-white mb-6 uppercase">Rewards & Features</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] p-8 rounded-3xl border border-gray-800 shadow-lg"><ShieldCheck size={24} className="text-blue-500 mb-6" /><h3 className="text-xl font-bold text-white mb-3 uppercase">Trading Napkins</h3><p className="text-gray-400 text-sm leading-relaxed">Top weekly performers are immortalized with custom digital trading cards to commemorate their victories.</p></div><div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] p-8 rounded-3xl border border-gray-800 shadow-lg"><BarChart3 size={24} className="text-orange-500 mb-6" /><h3 className="text-xl font-bold text-white mb-3 uppercase">NapStats Analytics</h3><p className="text-gray-400 text-sm leading-relaxed">Dive deep into your performance with personalized weekly report cards and deep statistical analytics.</p></div></div></section>
            </div>
            <div className="lg:col-span-4" id="join-now">
              <div className="sticky top-24 bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-700 rounded-3xl p-6 shadow-2xl">
                <div className="text-center pb-6 border-b border-gray-800 mb-6"><img src="https://admin.fsan.com/wp-content/uploads/2026/04/Mission-22-Logo.webp" alt="Mission 22" className="h-16 mx-auto mb-4 object-contain drop-shadow-lg" /><h3 className="text-2xl font-black uppercase text-white mb-2">Join Today</h3><p className="text-gray-400 text-sm font-bold">Your entry fee directly contributes to Mission 22.</p></div>
                <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-4 mb-8 flex gap-4"><Gift size={24} className="text-red-500 shrink-0" /><div><h4 className="text-white font-bold text-sm mb-1 uppercase tracking-tight">Instant $5 Credit</h4><p className="text-xs text-gray-400">Get a $5 FSAN Shop certificate instantly when you donate for your entry!</p></div></div>
                <div className="space-y-6 mb-8">{[ {s: 1, t: "Get The App", d: "Install Sleeper Fantasy app."}, {s: 2, t: "Donate $5", d: "Click the link below to donate."}, {s: 3, t: "Get Your Invite", d: "Our commissioner will send your link."}, {s: 4, t: "Compete!", d: "Draft your team and battle."} ].map(i => (<div key={i.s} className="flex gap-4"><div className={`w-8 h-8 rounded-full ${i.s === 2 ? 'bg-red-600' : 'bg-gray-800'} flex items-center justify-center font-black text-white shrink-0 shadow-inner border border-gray-700`}>{i.s}</div><div className="pt-1"><h5 className="font-bold text-sm text-white mb-1 uppercase">{i.t}</h5><p className="text-xs text-gray-400">{i.d}</p></div></div>))}</div>
                <a href="http://sleeper.com/i/89LZ1pyL1QE5" target="_blank" rel="noreferrer" className="w-full bg-[#111] border border-gray-600 hover:border-gray-400 text-white font-black py-4 rounded-xl text-xs uppercase no-underline text-center flex justify-center shadow-inner tracking-widest">Join League Chat</a>
              </div>
            </div>
          </div>
          <NapkinLeaderboard initialLeaderboard={initialLeaderboard} />
        </div>
      </div>
    </>
  );
}