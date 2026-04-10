import React from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { getMenuBySlug } from '../../../utils/api';
import { Wrench, ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }) {
  const { sport } = await params;
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  return {
    title: `Coming Soon | ${activeSport} | FSAN`,
  };
}

export default async function ComingSoonPage({ params }) {
  const { sport } = await params;
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  
  let proToolsMenu = [];
  let connectMenu = [];

  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug(`pro-tools-${sport.toLowerCase()}`);
      connectMenu = await getMenuBySlug(`connect-${sport.toLowerCase()}`);
    }
  } catch (e) {
    console.error(e);
  }

  // Determine the correct home link based on the sport
  const homeLink = activeSport === 'All' ? '/home' : `/${sport.toLowerCase()}/home`;

  return (
    <>
      <Header activeSport={activeSport} />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <div className="bg-[#111] border border-gray-800 rounded-3xl p-10 md:p-20 flex flex-col items-center justify-center text-center shadow-2xl min-h-[50vh] relative overflow-hidden">
             
             {/* Subtle Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-800/20 rounded-full blur-3xl pointer-events-none"></div>
             
             <div className="relative z-10 w-20 h-20 bg-[#1a1a1a] text-gray-400 border border-gray-700 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Wrench size={40} />
             </div>
             
             <h1 className="relative z-10 text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-4 drop-shadow-md">
               Under Construction
             </h1>
             
             <p className="relative z-10 text-gray-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed mb-8">
               We're working hard behind the scenes to bring this feature to the <span className="text-white font-bold">{activeSport}</span> network. Check back soon!
             </p>
             
             <Link href={homeLink} className="relative z-10 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-bold uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2">
                <ArrowLeft size={16} /> Back to {activeSport} Hub
             </Link>
          </div>
        </div>
      </div>
    </>
  );
}