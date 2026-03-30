"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Headphones } from 'lucide-react';
import { themes } from '../utils/theme';

export default function PodcastsArchive({ podcasts, activeSport, setSelectedItem }) {
  const theme = themes[activeSport] || themes.All;

  const LineupCard = ({ item }) => (
    <div onClick={() => setSelectedItem(item)} className={`group w-full cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-800'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-600'} transition-all flex flex-col relative aspect-square`}>
      {item.imageUrl ? (
         <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
      ) : (
         <div className="absolute inset-0 bg-gray-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 border border-white/10">
          <Headphones size={24} className="text-white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20">
        <h3 className={`font-black text-sm md:text-lg text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-3 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full pt-6 pb-16">
      <div className="flex items-center gap-4 mb-6">
         <Link href={`/${activeSport.toLowerCase()}/home`} className="hover:text-white flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-wider transition-colors no-underline">
           <ArrowLeft size={16}/> Back to Dashboard
         </Link>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-gray-800">
        <div>
          <h1 className={`text-4xl font-black uppercase tracking-wider ${theme.text} drop-shadow-lg`}>{activeSport === 'All' ? 'Network' : activeSport} Podcasts</h1>
          <p className="text-gray-400 mt-2 text-sm">Listen to the top fantasy sports audio shows in the industry.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {podcasts.map(pod => <LineupCard key={pod.id} item={pod} />)}
      </div>
    </div>
  );
}