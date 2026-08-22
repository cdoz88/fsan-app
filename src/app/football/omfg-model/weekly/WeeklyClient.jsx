'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, BarChart2, LayoutList, Target, Users, User, Info, X } from 'lucide-react'; 
import WeeklyTable from './components/WeeklyTable';
import WeeklyRadar from './components/WeeklyRadar';
import WeeklyTeamHub from './components/WeeklyTeamHub';
import WeeklyPlayerHub from './components/WeeklyPlayerHub';

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

export default function WeeklyClient() {
  const [playersData, setPlayersData] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [currentPosition, setCurrentPosition] = useState('QB');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [viewMode, setViewMode] = useState('table'); 

  const weeklyModels = useMemo(() => {
    return availableModels.filter(m => m.week !== 'Season');
  }, [availableModels]);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(weeklyModels.map(m => String(m.year))));
    return years.sort((a, b) => Number(b) - Number(a));
  }, [weeklyModels]);

  const availableWeeks = useMemo(() => {
    if (!selectedYear) return [];
    const weeks = Array.from(new Set(weeklyModels.filter(m => String(m.year) === selectedYear).map(m => m.week)));
    return weeks.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [selectedYear, weeklyModels]);

  useEffect(() => {
    async function loadInitialMetadata() {
      try {
        const res = await fetch(`/api/omfg-data?year=2026&week=Week 1`);
        const data = await res.json();
        if (data.available_models) {
          setAvailableModels(data.available_models);
          const activeWeekly = data.available_models.filter(m => m.week !== 'Season');
          if (activeWeekly.length > 0) {
            setSelectedYear(String(activeWeekly[0].year));
            setSelectedWeek(activeWeekly[0].week);
          }
        }
      } catch (err) {
        console.error("Failed to load models list", err);
      }
    }
    if (availableModels.length === 0) loadInitialMetadata();
  }, []);

  useEffect(() => {
    async function loadWeeklyData() {
      if (!selectedYear || !selectedWeek) return;
      setIsSyncing(true);
      try {
        const res = await fetch(`/api/omfg-data?year=${selectedYear}&week=${selectedWeek}`);
        const data = await res.json();
        setPlayersData(data.success && data.players ? data.players : []);
      } catch (err) {
        console.error("Error connecting to OMFG database", err);
        setPlayersData([]);
      } finally {
        setIsSyncing(false);
      }
    }
    loadWeeklyData();
  }, [selectedYear, selectedWeek]);

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    const validWeeks = Array.from(new Set(weeklyModels.filter(m => String(m.year) === newYear).map(m => m.week)));
    if (validWeeks.length > 0) setSelectedWeek(validWeeks[0]);
  };

  const visibleData = useMemo(() => {
    if (!playersData) return [];
    return playersData.filter((player) => player.Position === currentPosition);
  }, [playersData, currentPosition]);

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];
  const isHistorical = playersData.length > 0 && 'Actual Fantasy Points' in playersData[0];

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative z-0">
      
      {/* Hero Banner */}
      <div className="relative w-full min-h-[220px] md:h-[280px] flex items-end overflow-hidden rounded-2xl mb-8 mt-6 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0 bg-gradient-to-br from-[#e42d38] to-[#8a1a20]" />
        <img src="https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp" alt="Football Background" className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-[#121212]/20 z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between h-full px-6 md:px-10 pb-8 gap-4 pt-16 md:pt-0">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-inner backdrop-blur-sm">
              <BarChart2 size={12} /> Week-Over-Week Models
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-4">
              WoW OMFG
            </h1>
            <div className="space-y-4">
              <p className="text-gray-300 font-medium md:text-lg leading-snug">
                The Week-Over-Week OMFG Model forecasts performance for one specific NFL week. It combines the player’s established season profile with recent usage, expected opportunity, depth-chart position, opponent matchup, injuries, team context, and projected game environment.
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
        </div>
      </div>

      <div className="w-full relative z-10">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            
            <CustomDropdown options={availableYears} value={selectedYear} onChange={handleYearChange} />
            <CustomDropdown options={availableWeeks} value={selectedWeek} onChange={setSelectedWeek} />

            <div className="flex flex-wrap bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit md:ml-2">
              <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'table' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                <LayoutList size={14} /> Weekly Table
              </button>
              <button onClick={() => setViewMode('radar')} className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'radar' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                <Target size={14} /> Matchup Radar
              </button>
              <button onClick={() => setViewMode('team')} className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'team' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                <Users size={14} /> Team Usage
              </button>
              <button onClick={() => setViewMode('player')} className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'player' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                <User size={14} /> Player Momentum
              </button>
            </div>

            {viewMode !== 'team' && viewMode !== 'player' && (
              <div className="flex flex-wrap gap-1.5 bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
                 {positions.map(pos => (
                    <button key={pos} onClick={() => setCurrentPosition(pos)} className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>
                       {pos}
                    </button>
                 ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic View Selector */}
        {viewMode === 'radar' ? (
          <WeeklyRadar visibleData={playersData} isSyncing={isSyncing} />
        ) : viewMode === 'team' ? (
          <WeeklyTeamHub visibleData={playersData} isSyncing={isSyncing} />
        ) : viewMode === 'player' ? (
          <WeeklyPlayerHub visibleData={playersData} isSyncing={isSyncing} />
        ) : (
          <WeeklyTable visibleData={visibleData} isHistorical={isHistorical} isSyncing={isSyncing} />
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
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Weekly OMFG Explainer</h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
              OMFG measures the quality of the player’s underlying opportunity. Projected fantasy points determine the weekly rank. A strong OMFG Score does not automatically guarantee a high weekly ranking when matchup, availability, or expected opportunity creates additional risk.
            </p>
            <ul className="space-y-4 text-sm md:text-base text-gray-300">
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Rank:</strong> The player’s projected finish at the position for that week, ordered by projected fantasy points.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">OMFG Score:</strong> The player’s underlying usage and opportunity score based only on information available before the projected week. Week 1 uses the preseason OMFG profile; later weeks use updated in-season information.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Opponent:</strong> The defense or offense the player will face that week.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Matchup Score:</strong> A 0-100 measure of matchup quality. Higher scores represent more favorable matchups.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Opportunity Factor:</strong> The expected share of the team’s available touches, targets, attempts, or scoring opportunities.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Projected Fantasy Points:</strong> The model’s base fantasy-point forecast for the week.</div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-black">•</span> 
                <div><strong className="text-white">Finish Probability:</strong> The estimated chance of finishing inside the listed position-specific tier, such as Top 6, Top 12, or Top 24.</div>
              </li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}