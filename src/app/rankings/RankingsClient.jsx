"use client";
import React from 'react';
import Link from 'next/link';
import { FootballIcon, BasketballIcon, BaseballIcon } from '../../components/icons';
import { ChevronRight } from 'lucide-react';

export default function RankingsClient() {
  const sports = [
    {
      name: 'Football',
      href: '/football/rankings',
      icon: <FootballIcon />,
      colorClass: 'text-red-500',
      bgClass: 'bg-red-500/10',
      borderClass: 'border-red-500/30',
      hoverClass: 'hover:border-red-500/50 hover:bg-red-500/20',
      // This overrides the default grey gradient on your custom SVGs
      fillOverride: '[&>svg]:!fill-red-500'
    },
    {
      name: 'Basketball',
      href: '/basketball/coming-soon',
      icon: <BasketballIcon />,
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-500/10',
      borderClass: 'border-blue-500/30',
      hoverClass: 'hover:border-blue-500/50 hover:bg-blue-500/20',
      fillOverride: '[&>svg]:!fill-blue-500'
    },
    {
      name: 'Baseball',
      href: '/baseball/coming-soon',
      icon: <BaseballIcon />,
      colorClass: 'text-orange-500',
      bgClass: 'bg-orange-500/10',
      borderClass: 'border-orange-500/30',
      hoverClass: 'hover:border-orange-500/50 hover:bg-orange-500/20',
      fillOverride: '[&>svg]:!fill-orange-500'
    }
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-4">
          Player Rankings
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Select a sport to view the latest consensus and expert player rankings to help you dominate your draft.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {sports.map((sport) => (
          <Link 
            key={sport.name} 
            href={sport.href}
            className={`group flex flex-col items-center justify-center p-10 rounded-3xl border border-gray-800 bg-[#1a1a1a] shadow-xl transition-all duration-300 ${sport.hoverClass} no-underline`}
          >
            <div className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center border shadow-inner transition-colors duration-300 ${sport.bgClass} ${sport.borderClass}`}>
              <div className={`w-12 h-12 transition-transform duration-300 group-hover:scale-110 ${sport.fillOverride}`}>
                {sport.icon}
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-2">
              {sport.name}
            </h2>
            
            <div className={`flex items-center gap-1 text-sm font-bold uppercase tracking-widest transition-colors ${sport.colorClass}`}>
              View Rankings <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}