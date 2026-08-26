'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, BarChart2, LayoutList, Target, Users, User, Info, X } from 'lucide-react'; 
import SeasonTable from './components/SeasonTable';
import SeasonRadar from './components/SeasonRadar';
import SeasonTeamHub from './components/SeasonTeamHub';
import SeasonPlayerHub from './components/SeasonPlayerHub';

function CustomDropdown({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#111] border border-gray-800 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl py-2 pl-3 pr-8 flex items-center justify-between gap-2 shadow-inner hover:border-gray-600 transition-colors cursor-pointer min-w-[110px]">
        <span>{value || 'Select'}</span>
        <ChevronDown size={14} className={`absolute right-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[130px] bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl py-1 z-[120] max-h-60 overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${value === opt ? 'bg-red-600/20 text-red-500 border-l-2 border-red-500' : 'text-gray-300 hover:bg-[#252525] hover:text-white'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SeasonClient() {
  const [playersData, setPlayersData] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [currentPosition, setCurrentPosition] = useState('All');
  const [selectedYear, setSelectedYear] = useState('');
  const [viewMode, setViewMode] = useState('table'); 

  const seasonYears = useMemo(() => {
    if (!availableModels || availableModels.length === 0) return [];
    const filtered = availableModels.filter(m => m.week === 'Season').map(m => String(m.year));
    return Array.from(new Set(filtered)).sort((a, b) => Number(b) - Number(a));
  }, [availableModels]);

  useEffect(() => {
    async function loadOmfgData() {
      setIsSyncing(true);
      try {
        const res = await fetch(`/api/omfg-data?year=${selectedYear}&week=Season`);
        const data = await res.json();
        
        if (data.available_models) {
          setAvailableModels(data.available_models);
          
          if (!selectedYear) {
             const sortedYears = data.available_models
               .filter(m => m.week === 'Season')
               .map(m => Number(m.year))
               .sort((a, b) => b - a);

             if (sortedYears.length > 0) {
               setSelectedYear(String(sortedYears[0]));
               return;
             }
          }
        }

        if (data.success && data.players) {
          setPlayersData(data.players);
        } else {
          setPlayersData([]);
        }
      } catch (err) {
        console.error("Error connecting to OMFG database", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadOmfgData();
  }, [selectedYear]);

  const visibleData = useMemo(() => {
    if (!playersData) return [];
    return playersData.filter((player) => currentPosition === 'All' || player.Position === currentPosition);
  }, [playersData, currentPosition]);

  const positions = ['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'];
  const isHistorical = playersData.length > 0 && ('SOS Rank' in playersData[0] || 'Actual PPG' in playersData[0]);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative z-0">
      
      {/* Hero Section with Embedded Glassmorphism Switcher */}
      <div className="relative w-full min-h-[260px] md:min-h-[320px] flex items-end overflow-hidden rounded-2xl mb-8 mt-0 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0 bg-gradient-to-br from-[#e42d38] to-[#8a1a20]" />
        <img src="https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp" alt="Football Background" className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-[#121212]/20 z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between w-full px-6 md:px-10 pb-8 gap-6 pt-12 md:pt-16">
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-inner backdrop-blur-sm">
              <BarChart2 size={12} /> Season-Over-Season Models
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-4">
              SOS OMFG
            </h1>
            <div className="space-y-4">
              <p className="text-gray-300 font-medium md:text-lg leading-snug">
                The Season OMFG Model evaluates a player’s expected value across the full season. It combines underlying opportunity and role indicators with projected production, historical performance, team context, market information, and availability risk.
              </p>
              <button 
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-xl transition-colors shadow-lg"
              >
                <Info size={14} />
                Learn More
              </button>
            </div>
          </div>

          {/* 🌟 HERO-EMBEDDED MODEL SWITCHER 🌟 */}
          <div className="flex bg-black/40 backdrop-blur-md border border-white/15 p-1 rounded-2xl shadow-2xl w-fit shrink-0 overflow-x-auto scrollbar-hide self-start md:self-end">
            <Link href="/football/omfg-model/weekly" className="px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all text-gray-300 hover:text-white">
              WoW Model
            </Link>
            <Link href="/football/omfg-model/season" className="px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all bg-white text-black shadow-lg">
              SoS Model
            </Link>
            <Link href="/football/omfg-model/rest-of-season" className="px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all text-gray-400 hover:text-white pointer-events-none opacity-50">
              RoS Model (Soon)
            </Link>
          </div>

        </div>
      </div>

      <div className="w-full relative z-10">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            
            {viewMode !== 'player' && (
              <CustomDropdown options={seasonYears} value={selectedYear} onChange={setSelectedYear} />
            )}

            <div className="flex flex-wrap bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit md:ml-2">
              <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'table' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                <LayoutList size={14} /> Season Table
              </button>
              <button onClick={() => setViewMode('radar')} className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'radar' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                <Target size={14} /> Value Radar
              </button>
              <button onClick={() => setViewMode('team')} className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'team' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                <Users size={14} /> Team Utilization
              </button>
              <button onClick={() => setViewMode('player')} className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'player' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                <User size={14} /> Career Arc
              </button>
            </div>

            {viewMode !== 'team' && viewMode !== 'player' && (
              <div className="flex flex-wrap gap-1.5 bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
                 {positions.map(pos => (
                    <button key={pos} onClick={() => setCurrentPosition(pos)} className={`px-3 py-1 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                       {pos}
                    </button>
                 ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Modular Renderer */}
        {viewMode === 'radar' ? (
          <SeasonRadar visibleData={visibleData} isHistorical={isHistorical} isSyncing={isSyncing} />
        ) : viewMode === 'team' ? (
          <SeasonTeamHub visibleData={playersData} isHistorical={isHistorical} isSyncing={isSyncing} />
        ) : viewMode === 'player' ? (
          <SeasonPlayerHub availableModels={availableModels} />
        ) : (
          <SeasonTable visibleData={visibleData} isHistorical={isHistorical} isSyncing={isSyncing} />
        )}

      </div>

      {/* Explainer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-gray-700 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Season OMFG Explainer</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              OMFG measures the quality of the player’s underlying opportunity. Projected fantasy points determine the weekly rank. A strong OMFG Score does not automatically guarantee a high weekly ranking when matchup, availability, or expected opportunity creates additional risk.
            </p>
            <ul className="space-y-4 text-sm md:text-base text-gray-300">
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Rank:</strong> Final position or overall season ranking. Rank is not determined by OMFG Score alone.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">OMFG Score:</strong> A 0-100 rating of the strength of a player’s underlying role, usage, opportunity, and production profile. Higher is better. Compare scores primarily within the same position.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">G:</strong> Projected games played.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">PPG:</strong> Projected fantasy points per game.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Floor (P25):</strong> A conservative outcome that the player is expected to exceed approximately 75% of the time.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Base (P50):</strong> The median and most representative season projection.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Ceiling (P75):</strong> An optimistic but realistic outcome that the player reaches or exceeds approximately 25% of the time.</div>
              </li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}