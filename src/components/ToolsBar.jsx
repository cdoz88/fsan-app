import React from 'react';
import { themes } from '../utils/theme';

export default function ToolsBar({ activeSport }) {
  const theme = themes[activeSport];
  
  return (
    <div className={`${theme.toolsBg} text-xs py-2.5 px-6 overflow-x-auto flex items-center gap-6 border-b transition-colors duration-300 scrollbar-hide shadow-inner z-30 relative`}>
      <span className={`font-black uppercase tracking-widest ${theme.text} shrink-0`}>Tools</span>
      <div className="h-4 w-px bg-gray-600 shrink-0"></div>
      <div className="flex items-center gap-8 whitespace-nowrap text-gray-400 font-bold uppercase tracking-wider">
        <a href="#" className={`hover:${theme.text} transition-colors`}>Trade Analyzer</a>
        <a href="#" className={`hover:${theme.text} transition-colors`}>Dynasty Rankings</a>
        <a href="#" className={`hover:${theme.text} transition-colors`}>Rookie Mock Draft</a>
        <a href="#" className={`hover:${theme.text} transition-colors`}>Start / Sit Optimizer</a>
        <a href="#" className={`hover:${theme.text} transition-colors`}>DFS Projections</a>
      </div>
    </div>
  );
}