'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, BarChart2, LayoutList, Target, Users, User } from 'lucide-react'; 
import OmfgTable from './components/OmfgTable';
import OmfgRadar from './components/OmfgRadar';
import OmfgTeamHub from './components/OmfgTeamHub';
import OmfgPlayerHub from './components/OmfgPlayerHub';

// --- Custom Dark Dropdown Component ---
function CustomDropdown({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#111] border border-gray-800 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl py-2 pl-3 pr-8 flex items-center justify-between gap-2 shadow-inner hover:border-gray-600 transition-colors cursor-pointer min-w-[110px]"
      >
        <span>{value || 'Select'}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[130px] bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl py-1 z-[120] max-h-60 overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[10px] text-gray-500 italic">No options</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  value === opt
                    ? 'bg-red-600/20 text-red-500 border-l-2 border-red-500'
                    : 'text-gray-300 hover:bg-[#252525] hover:text-white'
                }`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function OmfgClient() {
  const [playersData, setPlayersData] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);

  // --- UI State Variables ---
  const [currentPosition, setCurrentPosition] = useState('All');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table', 'radar', 'team', or 'player'

  const availableYears = useMemo(() => {
    if (!availableModels || availableModels.length === 0) return [];
    const yearsSet = new Set(availableModels.map(m => String(m.year)));
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [availableModels]);

  const availableWeeks = useMemo(() => {
    if (!availableModels || !selectedYear) return [];
    const weeksForYear = availableModels
      .filter(m => String(m.year) === String(selectedYear))
      .map(m => m.week);
    
    return Array.from(new Set(weeksForYear)).sort((a, b) => {
      if (a === 'Season') return -1;
      if (b === 'Season') return 1;
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [availableModels, selectedYear]);

  useEffect(() => {
    async function loadOmfgData() {
      setIsSyncing(true);
      try {
        const res = await fetch(`/api/omfg-data?year=${selectedYear}&week=${selectedWeek}`);
        const data = await res.json();
        
        if (data.available_models && data.available_models.length > 0) {
          setAvailableModels(data.available_models);

          if (!selectedYear) {
            const latestYear = String(data.available_models[0].year);
            setSelectedYear(latestYear);
            setSelectedWeek(data.available_models[0].week || 'Season');
            return;
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
  }, [selectedYear, selectedWeek]);

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    const matchingWeeks = availableModels
      .filter(m => String(m.year) === String(newYear))
      .map(m => m.week);
    if (matchingWeeks.length > 0) {
      setSelectedWeek(matchingWeeks[0]);
    } else {
      setSelectedWeek('Season');
    }
  };

  const visibleData = useMemo(() => {
    if (!playersData) return [];
    return playersData.filter((player) => {
      if (currentPosition === 'All') return true;
      return player.Position === currentPosition;
    });
  }, [playersData, currentPosition]);

  const positions = ['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DST'];
  const isHistorical = playersData.length > 0 && ('SOS Rank' in playersData[0] || 'Actual PPG' in playersData[0]);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative z-0">

      {/* Hero Section */}
      <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-8 mt-6 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0 bg-gradient-to-br from-[#e42d38] to-[#8a1a20]" />
        <img 
          src="https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp" 
          alt="Football Background" 
          className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between h-full px-6 md:px-10 pb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-inner backdrop-blur-sm">
              <BarChart2 size={12} /> Utilization Metrics
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              OMFG Score
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Identify underlying player usage, high-value opportunities, and positive regression candidates before your league-mates do.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full relative z-10">
        {/* Controls Row */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          
          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            
            {viewMode !== 'player' && (
              <>
                <CustomDropdown
                  options={availableYears}
                  value={selectedYear}
                  onChange={handleYearChange}
                />
                <CustomDropdown
                  options={availableWeeks}
                  value={selectedWeek}
                  onChange={setSelectedWeek}
                />
              </>
            )}

            {/* View Mode Toggles */}
            <div className="flex flex-wrap bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit md:ml-2">
              <button 
                onClick={() => setViewMode('table')}
                className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                  viewMode === 'table' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'
                }`}
              >
                <LayoutList size={14} /> Table
              </button>
              <button 
                onClick={() => setViewMode('radar')}
                className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                  viewMode === 'radar' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'
                }`}
              >
                <Target size={14} /> Radar
              </button>
              <button 
                onClick={() => setViewMode('team')}
                className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                  viewMode === 'team' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'
                }`}
              >
                <Users size={14} /> Team
              </button>
              <button 
                onClick={() => setViewMode('player')}
                className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                  viewMode === 'player' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white hover:bg-[#252525]'
                }`}
              >
                <User size={14} /> Player
              </button>
            </div>

            {/* Position Filters (Only show if not in Team or Player mode) */}
            {viewMode !== 'team' && viewMode !== 'player' && (
              <div className="flex flex-wrap gap-1.5 bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
                 {positions.map(pos => (
                    <button 
                       key={pos} 
                       onClick={() => setCurrentPosition(pos)}
                       className={`px-3 py-1 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                         currentPosition === pos 
                          ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                          : 'text-gray-500 hover:text-white hover:bg-[#252525]'
                       }`}
                    >
                       {pos}
                    </button>
                 ))}
              </div>
            )}
          </div>
        </div>

        {/* Modular View Switcher */}
        {viewMode === 'radar' ? (
          <OmfgRadar 
            visibleData={visibleData} 
            isHistorical={isHistorical} 
            isSyncing={isSyncing} 
          />
        ) : viewMode === 'team' ? (
          <OmfgTeamHub
            visibleData={playersData} 
            isHistorical={isHistorical} 
            isSyncing={isSyncing} 
          />
        ) : viewMode === 'player' ? (
          <OmfgPlayerHub
            availableModels={availableModels} 
          />
        ) : (
          <OmfgTable 
            visibleData={visibleData} 
            isHistorical={isHistorical} 
            isSyncing={isSyncing} 
          />
        )}

        <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">OMFG Methodology</h3>
          <div className="text-[11px] text-gray-400 space-y-1.5 font-medium leading-relaxed">
            <p>• The OMFG Score evaluates under-the-hood usage metrics rather than raw fantasy point outcomes.</p>
            <p>• Players with a <strong>High OMFG Score</strong> but low Projected/Actual PPG are prime positive regression candidates (Buy Low).</p>
            <p>• Players with a <strong>Low OMFG Score</strong> but high PPG are relying on unsustainable efficiency or luck (Sell High).</p>
          </div>
        </div>

      </div>
    </div>
  );
}