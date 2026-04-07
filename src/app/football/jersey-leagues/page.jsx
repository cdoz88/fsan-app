import React from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { getMenuBySlug } from '../../../utils/api';
import { Trophy, Shirt, Mail, Play, Medal, ArrowRight, Star } from 'lucide-react';

export const metadata = {
  title: 'Jersey Leagues | FSAN',
  description: 'Compete in a league named after your favorite NFL star to win an autographed jersey and a championship ring!',
};

export default async function JerseyLeaguesPage() {
  let proToolsMenu = [];
  let connectMenu = [];

  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
  } catch (e) {
    console.error("Menu fetch error:", e);
  }

  const steps = [
    {
      icon: <Star className="text-red-500" size={32} />,
      title: "Step 1: Sign Up",
      description: "Sign up for the Pro+ membership to gain exclusive entry into the tournament.",
      link: "/subscribe",
      linkText: "Get Pro+"
    },
    {
      icon: <Mail className="text-red-500" size={32} />,
      title: "Step 2: Check Your Email",
      description: "You'll receive a message with instructions to choose your preferred league."
    },
    {
      icon: <Shirt className="text-red-500" size={32} />,
      title: "Step 3: Join Your League",
      description: "Join the league named after your favorite player (Tyreek Hill, James Cook, Garrett Wilson, etc)."
    },
    {
      icon: <Play className="text-red-500" size={32} />,
      title: "Step 4: Play All Season",
      description: "Draft your team, manage the waiver wire, and track your progress as you climb the standings."
    },
    {
      icon: <Trophy className="text-red-500" size={32} />,
      title: "Step 5: Win a Jersey",
      description: "Dominate your league and win an autographed jersey of the player that your league is named after!"
    },
    {
      icon: <Medal className="text-red-500" size={32} />,
      title: "Step 6: The Playoff Challenge",
      description: "See below for more details on how to qualify!"
    }
  ];

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <main className="w-full animate-in fade-in duration-500">
            
            {/* HERO SECTION MATCHING TEAMS/RANKINGS */}
            <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-12 shadow-2xl">
              <div 
                className="absolute inset-0 opacity-80 z-0" 
                style={{ background: `linear-gradient(135deg, #e42d38 0%, #8a1a20 100%)` }}
              />
              <img 
                src="https://admin.fsan.com/wp-content/uploads/2025/08/Jersey-Leagues.webp" 
                alt="Jersey Leagues" 
                className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[150%] md:h-[200%] w-auto opacity-30 pointer-events-none z-0 mix-blend-overlay" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/50 to-transparent z-0" />
              
              <div className="relative z-10 w-full flex flex-col items-start justify-end h-full px-6 md:px-10 pb-8">
                <span className="inline-block py-1 px-3 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 font-bold text-[10px] uppercase tracking-widest mb-3 backdrop-blur-sm">
                  The Stakes Are Higher Than Ever
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
                  Jersey Leagues
                </h1>
                <p className="text-gray-300 font-medium md:text-lg leading-relaxed drop-shadow-md max-w-2xl">
                  Every matchup, every touchdown, every trade counts toward winning an autographed jersey of the player your league is named after.
                </p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto">
              
              {/* INTRO PARAGRAPH */}
              <div className="bg-[#111] rounded-3xl border border-gray-800 p-8 md:p-10 mb-12 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                 <p className="text-gray-300 text-lg md:text-xl leading-relaxed relative z-10">
                   The Jersey Leagues are back! We're talking <strong>Tyreek Hill, James Cook, Garrett Wilson, David Montgomery, Kenneth Walker, Kayvon Thibodeaux,</strong> and more. These aren't just jerseys – they're collector's items, conversation starters, and proof that your fantasy skills are elite.
                 </p>
              </div>

              {/* HOW IT WORKS */}
              <div className="mb-16">
                <div className="flex items-center gap-6 mb-8">
                   <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">Here's How It Works</h2>
                   <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {steps.map((step, idx) => (
                    <div key={idx} className="bg-[#1a1a1a] rounded-3xl border border-gray-800 p-8 flex flex-col items-start relative overflow-hidden group hover:border-gray-600 transition-colors shadow-lg">
                      <div className="absolute -right-4 -top-4 text-[120px] font-black text-[#222] z-0 select-none group-hover:text-[#2a2a2a] transition-colors leading-none">
                        {idx + 1}
                      </div>
                      <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#111] border border-gray-700 flex items-center justify-center mb-6 shadow-inner">
                        {step.icon}
                      </div>
                      <h3 className="relative z-10 text-xl font-black text-white uppercase tracking-wide mb-3">{step.title}</h3>
                      <p className="relative z-10 text-sm text-gray-400 leading-relaxed font-medium flex-1">
                        {step.description}
                      </p>
                      {step.link && (
                        <Link href={step.link} className="relative z-10 mt-6 text-red-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:text-red-400 transition-colors bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/30">
                          {step.linkText} <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* NEW THIS YEAR BLOCK */}
              <div className="bg-gradient-to-br from-[#1b1010] to-[#111] rounded-3xl border border-red-900/30 p-8 md:p-12 mb-12 shadow-[0_0_40px_rgba(220,38,38,0.1)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-600 to-red-900 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(220,38,38,0.4)] border-4 border-[#111]">
                  <Medal size={48} className="text-white drop-shadow-md" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-block py-1.5 px-4 rounded-full bg-red-600/20 text-red-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                    New This Year!
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">
                    The Playoff Challenge
                  </h2>
                  <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                    This year, all regular-season winners will face off in an ultimate showdown. The overall Jersey League champion will take home a <strong>championship ring or belt</strong>, proving them as the undisputed tournament champ!
                  </p>
                </div>
              </div>

              {/* CALL TO ACTION */}
              <div className="text-center py-12">
                <Link href="/subscribe" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:-translate-y-1 transition-all text-sm md:text-base">
                  Join a Jersey League Now <ArrowRight size={20} />
                </Link>
                <p className="mt-6 text-gray-500 font-bold text-xs uppercase tracking-widest">
                  Requires an active Pro+ Subscription
                </p>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}