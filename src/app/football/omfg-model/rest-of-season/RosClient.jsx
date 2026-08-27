'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, BarChart2, LayoutList, Target, Users, User, Info, X } from 'lucide-react'; 
import RosTable from './components/RosTable';
import RosRadar from './components/RosRadar';
import RosTeamHub from './components/RosTeamHub';
import RosPlayerHub from './components/RosPlayerHub';

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
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#111] border border-gray-800 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl py-1.5 pl-3 pr-7 flex items-center justify-between gap-1.5 shadow-inner hover:border-gray-600 transition-colors cursor-pointer min-w-[90px]">
        <span>{value || 'Select'}</span>
        <ChevronDown size={14} className={`absolute right-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[100px] bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl py-1 z-[120] max-h-60 overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-150">
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

export default function RosClient() {
  const [playersData, setPlayersData] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [currentPosition, setCurrentPosition] = useState('QB');
  const [selectedYear, setSelectedYear] = useState('');
  const [viewMode, setViewMode] = useState('table'); 

  const rosYears = useMemo(() => {
    if (!availableModels || availableModels.length === 0) return [];
    const filtered = availableModels.filter(m => strToLower(m.week).includes('rest of season') || strToLower(m.week).includes('ros')).map(m => String(m.year));
    return Array.from(new Set(filtered)).sort((a, b) => Number(b) - Number(a));
  }, [availableModels]);

  function strToLower(str) { return String(str || '').toLowerCase(); }

  useEffect(() => {
    async function loadOmfgData() {
      setIsSyncing(true);
      try {
        const res = await fetch(`/api/omfg-data?year=${selectedYear || '2026'}&week=Rest of Season&_t=${new Date().getTime()}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data.available_models) {
          setAvailableModels(data.available_models);
          
          if (!selectedYear) {
             const sortedYears = data.available_models
               .filter(m => strToLower(m.week).includes('rest of season') || strToLower(m.week).includes('ros'))
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
    return playersData.filter((player) => player.Position === currentPosition);
  }, [playersData, currentPosition]);

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative z-0">
      
      {/* Hero Banner */}
      <div className="relative w-full min-h-[260px] md:min-h-[320px] flex items-end overflow-hidden rounded-2xl mb-8 mt-0 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0 bg-gradient-to-br from-[#e42d38] to-[#8a1a20]" />
        <img src="https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp" alt="Football Background" className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-[#121212]/20 z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between w-full px-6 md:px-10 pb-8 gap-6 pt-12 md:pt-16">
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-inner backdrop-blur-sm">
              <BarChart2 size={12} /> Rest of Season Models
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-4">
              ROS OMFG
            </h1>
            <div className="space-y-4">
              <p className="text-gray-300 font-medium md:text-lg leading-snug">
                The Rest of Season (RoS) OMFG Model forecasts expected performance over the remaining weeks of the NFL schedule. It combines current-season usage, underlying opportunity trends, remaining strength of schedule, and projection distributions.
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

          <div className="flex bg-black/40 backdrop-blur-md border border-white/15 p-1 rounded-2xl shadow-2xl w-fit shrink-0 overflow-x-auto scrollbar-hide self-start md:self-end">
            <Link href="/football/omfg-model/weekly" className="px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all text-gray-300 hover:text-white">
              WoW Model
            </Link>
            <Link href="/football/omfg-model/season" className="px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all text-gray-300 hover:text-white">
              SoS Model
            </Link>
            <Link href="/football/omfg-model/rest-of-season" className="px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all bg-white text-black shadow-lg">
              RoS Model
            </Link>
          </div>

        </div>
      </div>

      <div className="w-full relative z-10">
        
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between w-full gap-y-3 gap-x-2 mb-6">
          
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <CustomDropdown options={rosYears.length > 0 ? rosYears : ['2026']} value={selectedYear || '2026'} onChange={setSelectedYear} />

            <div className="flex flex-wrap items-center gap-1 bg-[#1a1a1a] p-1 rounded-2xl shadow-inner border border-gray-800">
               {positions.map(pos => (
                  <button key={pos} onClick={() => setCurrentPosition(pos)} className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                     {pos}
                  </button>
               ))}
            </div>
          </div>

          {/* 🌟 View Buttons (Renamed Production Radar & Team Usage) 🌟 */}
          <div className="flex flex-wrap items-center bg-[#1a1a1a] p-1 rounded-2xl shadow-inner border border-gray-800 shrink-0">
            <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
              <LayoutList size={14} /> RoS Table
            </button>
            <button onClick={() => setViewMode('radar')} className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-1.5 ${viewMode === 'radar' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
              <Target size={14} /> Production Radar
            </button>
            <button onClick={() => setViewMode('team')} className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-1.5 ${viewMode === 'team' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
              <Users size={14} /> Team Usage
            </button>
            <button onClick={() => setViewMode('player')} className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-1.5 ${viewMode === 'player' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
              <User size={14} /> Player Profile
            </button>
          </div>

        </div>

        {/* View Component Switcher */}
        {viewMode === 'radar' ? (
          <RosRadar visibleData={visibleData} isSyncing={isSyncing} currentPosition={currentPosition} />
        ) : viewMode === 'team' ? (
          <RosTeamHub visibleData={playersData} isSyncing={isSyncing} />
        ) : viewMode === 'player' ? (
          <RosPlayerHub availableModels={availableModels} visibleData={playersData} isSyncing={isSyncing} />
        ) : (
          <RosTable visibleData={visibleData} isSyncing={isSyncing} />
        )}

      </div>

      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-gray-700 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-1 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">RoS OMFG Explainer</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              The Rest of Season (RoS) OMFG Model evaluates expected output across remaining games. Range bars show downside floor (P25), median expectation (P50), and upside ceiling (P75).
            </p>
            <ul className="space-y-4 text-sm md:text-base text-gray-300">
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">RoS Rank:</strong> Projected rest-of-season finish position.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">OMFG Score:</strong> Preseason or updated in-season opportunity rating (0-100).</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Rem G:</strong> Expected remaining games played.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">RoS Range (P25 - P75):</strong> Visual slider displaying Floor (P25), Base (P50), and Ceiling (P75) point outcomes.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Top Tier Probability:</strong> Probability of finishing inside position-specific top tiers over the rest of the season.</div>
              </li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}