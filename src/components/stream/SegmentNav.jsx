"use client";
import React from 'react';

const TABS = [
  { id: 'pregame', label: 'PREGAME' },
  { id: 'q1', label: '1ST Q' },
  { id: 'q2', label: '2ND Q' },
  { id: 'half', label: 'HALFTIME' },
  { id: 'q3', label: '3RD Q' },
  { id: 'q4', label: '4TH Q' },
  { id: 'ot', label: 'OVERTIME' }
];

export default function SegmentNav({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-center bg-black/60 backdrop-blur-md border-b border-zinc-800 p-3 shadow-lg relative z-40">
      <div className="flex gap-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-zinc-700 text-white shadow-[0_0_15px_rgba(161,161,170,0.4)] scale-105' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}