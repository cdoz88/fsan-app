'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RefreshCw, Search, TrendingUp, Activity, AlertCircle, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

// --- NFL Team Primary Colors ---
const teamColors = {
  ARI: '#97233F', ATL: '#A71930', BAL: '#241773', BUF: '#00338D', CAR: '#0085CA', CHI: '#C83803',
  CIN: '#FB4F14', CLE: '#FB4F14', DAL: '#86939E', DEN: '#FB4F14', DET: '#0076B6', GB: '#203731',
  HOU: '#03202F', IND: '#002C5F', JAX: '#006778', KC: '#E31837', LAC: '#0080C6', LAR: '#003594',
  LV: '#A5ACAF', MIA: '#008E97', MIN: '#4F2683', NE: '#002244', NO: '#D3BC8D', NYG: '#003594',
  NYJ: '#125740', PHI: '#004C54', PIT: '#FFB612', SEA: '#69BE28', SF: '#AA0000',
  TB: '#D50A0A', TEN: '#0C2340', WAS: '#5A1414'
};

const METRICS_TO_TRACK = [
  'OMFG Score', 'PPG', 'Games',
  'Pass Attempts', 'Pass Yards', 'Pass TDs', 'Interceptions',
  'Rush Attempts', 'Rush Yards', 'Rush TDs',
  'Targets', 'Receptions', 'Receiving Yards', 'Receiving TDs',
  'Air Yards', 'First Read Targets', 'End Zone Targets', 'Scrimmage Yards', 'Total TDs'
];

const inverseStats = new Set(['Interceptions', 'Fumbles']);

// --- Safe Stat Extractor across Historical & Projected Years ---
const getStat = (player, stat) => {
  if (!player) return null;
  if (stat === 'PPG') return player['Actual PPG'] ?? player['Projected PPG'] ?? player['Base (P50)'] ?? null;
  if (player[stat] !== undefined) return player[stat];
  if (player[`Projected ${stat}`] !== undefined) return player[`Projected ${stat}`];
  if (player[`Actual ${stat}`] !== undefined) return player[`Actual ${stat}`];
  return null;
};

// --- Custom LineChart Tooltip ---
const ArcTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-gray-700 p-3 rounded-xl shadow-2xl z-[100] min-w-[140px]">
        <div className="font-black text-white text-sm mb-2 border-b border-gray-800 pb-2">{label}</div>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-6 text-xs mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="uppercase tracking-widest font-bold text-gray-400">{entry.name}</span>
            </div>
            <span className="text-white font-black">{Number(entry.value).toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SeasonPlayerHub({ availableModels }) {
  const [playerDB, setPlayerDB] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [isBuildingHistory, setIsBuildingHistory] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPlayerName, setSelectedPlayerName] = useState(null);

  const searchRef = useRef(null);

  // --- 1. Load Sleeper Player Database for Headshots ---
  useEffect(() => {
    async function loadMasterPlayerDB() {
      try {
        const res = await fetch('https://api.sleeper.app/v1/players/nfl');
        if (res.ok) {
          const slpData = await res.json();
          const map = {};
          Object.values(slpData).forEach(p => {
            if (p.full_name) {
              map[p.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')] = p;
            }
          });
          setPlayerDB(map);
        }
      } catch (err) {
        console.warn("Could not load Sleeper DB:", err);
      }
    }
    loadMasterPlayerDB();
  }, []);

  // --- 2. Parallel Fetch All Available Years ---
  useEffect(() => {
    async function fetchAllHistory() {
      setIsBuildingHistory(true);
      try {
        // Find unique years that have a 'Season' period published
        const seasonYears = availableModels
          .filter(m => m.week === 'Season')
          .map(m => m.year)
          .sort((a, b) => Number(a) - Number(b)); // Sort ascending for line charts

        const fetchPromises = seasonYears.map(year => 
          fetch(`/api/omfg-data?year=${year}&week=Season`).then(r => r.json())
        );
        const results = await Promise.all(fetchPromises);

        const compiledData = {};
        
        results.forEach((res, index) => {
          if (res.success && res.players) {
            const year = seasonYears[index];
            const players = res.players;
            
            // Pre-calculate percentile thresholds
            const thresholds = {};
            METRICS_TO_TRACK.forEach(stat => {
               const values = players
                  .map(p => getStat(p, stat))
                  .filter(v => v !== null && v !== undefined && v !== '')
                  .map(v => Number(v))
                  .filter(v => !isNaN(v))
                  .sort((a, b) => a - b);
                  
                if (values.length > 0) {
                  thresholds[stat] = {
                    p90: values[Math.floor(values.length * 0.90)] || values[values.length - 1],
                    p75: values[Math.floor(values.length * 0.75)] || values[values.length - 1],
                    p25: values[Math.floor(values.length * 0.25)] || values[0],
                    p10: values[Math.floor(values.length * 0.10)] || values[0],
                  };
                }
            });

            compiledData[year] = { players, thresholds };
          }
        });

        setHistoricalData(compiledData);
      } catch (err) {
        console.error("Failed to build historical database:", err);
      } finally {
        setIsBuildingHistory(false);
      }
    }

    if (availableModels.length > 0) {
      fetchAllHistory();
    }
  }, [availableModels]);

  // --- 3. Close Dropdown on Outside Click ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- 4. Prepare Master Player List for Search ---
  const allUniquePlayers = useMemo(() => {
    const playerMap = new Map();
    Object.values(historicalData).forEach(yearData => {
      yearData.players.forEach(p => {
        if (!playerMap.has(p.Player)) {
          playerMap.set(p.Player, p);
        }
      });
    });
    return Array.from(playerMap.values()).sort((a, b) => a.Player.localeCompare(b.Player));
  }, [historicalData]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return allUniquePlayers.filter(p => p.Player.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery, allUniquePlayers]);

  // --- 5. Compile Selected Player's Timeline ---
  const selectedPlayerData = useMemo(() => {
    if (!selectedPlayerName) return null;
    
    // Ascending years for the Line Chart (2021 -> 2026)
    const ascYears = Object.keys(historicalData).sort((a, b) => Number(a) - Number(b));
    // Descending years for the Heatmap Matrix (2026 -> 2021)
    const descYears = [...ascYears].reverse();

    let latestMeta = null;
    
    const chartData = ascYears.map(year => {
      const yearData = historicalData[year];
      const pData = yearData.players.find(p => p.Player === selectedPlayerName);
      if (pData) latestMeta = pData;
      return {
        year,
        omfg: pData ? Number(getStat(pData, 'OMFG Score')) : null,
        ppg: pData ? Number(getStat(pData, 'PPG')) : null
      };
    }).filter(t => t.omfg !== null || t.ppg !== null);

    const matrixTimeline = descYears.map(year => {
      const yearData = historicalData[year];
      const pData = yearData.players.find(p => p.Player === selectedPlayerName);
      return {
        year,
        player: pData || null,
        thresholds: yearData.thresholds
      };
    });

    if (!latestMeta) return null;

    return {
      name: selectedPlayerName,
      meta: latestMeta,
      matrixTimeline,
      chartData
    };
  }, [selectedPlayerName, historicalData]);

  // --- 6. Heatmap Styling Engine ---
  const getHeatmapClasses = (val, statKey, thresh) => {
    if (val === null || val === undefined || val === '-') {
      return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';
    }
    
    const num = Number(val);
    if (!thresh || isNaN(num)) {
      return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';
    }

    const isInverse = inverseStats.has(statKey);

    let isTop10 = num >= thresh.p90;
    let isTop25 = num >= thresh.p75 && num < thresh.p90;
    let isBot25 = num <= thresh.p25 && num > thresh.p10;
    let isBot10 = num <= thresh.p10;

    if (isInverse) {
      isTop10 = num <= thresh.p10;
      isTop25 = num <= thresh.p25 && num > thresh.p10;
      isBot25 = num >= thresh.p75 && num < thresh.p90;
      isBot10 = num >= thresh.p90;
    }

    if (thresh.p90 === thresh.p10) {
      return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';
    }

    if (isTop10) return 'bg-emerald-900/30 border-emerald-800/50 text-emerald-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)] font-black';
    if (isTop25) return 'bg-emerald-900/10 border-emerald-800/30 text-emerald-300 font-bold';
    if (isBot10) return 'bg-red-900/30 border-red-800/50 text-red-400 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)] font-black';
    if (isBot25) return 'bg-red-900/10 border-red-800/30 text-red-300 font-bold';
    return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-bold';
  };

  // --- 7. Positional Metric Configuration ---
  const getMetricsForPosition = (pos) => {
    switch (pos) {
      case 'QB': return ['Games', 'OMFG Score', 'PPG', 'Pass Attempts', 'Pass Yards', 'Pass TDs', 'Interceptions', 'Rush Attempts', 'Rush Yards', 'Rush TDs'];
      case 'RB': return ['Games', 'OMFG Score', 'PPG', 'Rush Attempts', 'Rush Yards', 'Targets', 'Receptions', 'Receiving Yards', 'First Read Targets', 'Scrimmage Yards', 'Total TDs'];
      case 'WR':
      case 'TE': return ['Games', 'OMFG Score', 'PPG', 'Targets', 'Receptions', 'Receiving Yards', 'Air Yards', 'First Read Targets', 'End Zone Targets', 'Total TDs'];
      default: return ['Games', 'OMFG Score', 'PPG'];
    }
  };

  if (isBuildingHistory) {
    return (
      <div className="bg-[#111] rounded-2xl shadow-2xl border border-gray-800 min-h-[500px] flex flex-col items-center justify-center text-red-600 p-6">
        <RefreshCw className="animate-spin mb-4" size={36} />
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Compiling Historical Database...</h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">Fetching thousands of player records to build career arcs.</p>
      </div>
    );
  }

  const activeColor = selectedPlayerData && teamColors[selectedPlayerData.meta.Team] ? teamColors[selectedPlayerData.meta.Team] : '#1b75bb';
  const dbPlayer = selectedPlayerData ? playerDB[selectedPlayerData.name.toLowerCase().replace(/[^a-z0-9]/g, '')] : null;
  
  let headshotUrl = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
  if (dbPlayer?.espn_id) {
    headshotUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${dbPlayer.espn_id}.png&w=350&h=254`;
  } else if (dbPlayer?.player_id) {
    headshotUrl = `https://sleepercdn.com/content/nfl/players/thumb/${dbPlayer.player_id}.jpg`;
  }

  return (
    <div className="bg-[#111] rounded-2xl shadow-2xl border border-gray-800 animate-in fade-in duration-500 relative min-h-[600px] p-6">
      
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-800/50">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80" ref={searchRef}>
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for any player..."
            value={searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            className="w-full bg-[#1a1a1a] border border-gray-700 text-white text-sm font-bold rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-red-500 transition-colors shadow-inner placeholder:text-gray-500"
          />
          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl py-2 z-[120] max-h-72 overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-150">
              {searchResults.map((p, idx) => (
                <button
                  key={`${p.Player}-${idx}`}
                  onClick={() => {
                    setSelectedPlayerName(p.Player);
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between hover:bg-[#252525] group border-b border-gray-800/50 last:border-0"
                >
                  <span className="text-xs font-black uppercase tracking-wider text-gray-300 group-hover:text-white">{p.Player}</span>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">{p.Position}</span>
                     {p.Team && <span className="text-[9px] font-bold text-gray-500">{p.Team}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-right hidden md:flex items-center gap-3">
          <div className="relative group cursor-help">
            <Info size={18} className="text-gray-500 hover:text-white transition-colors" />
            <div className="absolute bottom-full right-0 mb-3 px-4 py-3 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-[11px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] w-64 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed">
              Fantasy production is sticky. Reviewing a player's previous seasonal profiles helps us predict what information will carry into the next season.
              <div className="absolute top-full right-1 border-4 border-transparent border-t-gray-700"></div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Career Arc</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Year-Over-Year Utilization</p>
          </div>
        </div>
      </div>

      {!selectedPlayerData ? (
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl bg-[#151515]">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 mb-4 shadow-inner">
            <Search size={24} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Select a Player</h3>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest text-center max-w-sm px-4">
            Search for a player above to unlock their complete year-over-year utilization timeline and heatmap matrix.
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          
          {/* Player Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
            <div className="w-28 h-28 rounded-full border-4 shadow-2xl bg-gray-800 overflow-hidden shrink-0" style={{ borderColor: activeColor }}>
              <img 
                src={headshotUrl} 
                alt={selectedPlayerData.name} 
                className="w-full h-full object-cover pt-2"
                onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
              />
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
               <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                 {selectedPlayerData.meta.Team && (
                   <img 
                     src={`https://sleepercdn.com/images/team_logos/nfl/${selectedPlayerData.meta.Team.toLowerCase()}.png`} 
                     alt={selectedPlayerData.meta.Team}
                     className="w-8 h-8 object-contain drop-shadow-md"
                     onError={(e) => e.target.style.display = 'none'}
                   />
                 )}
                 <span className="text-[10px] font-black uppercase tracking-widest text-white px-2.5 py-1 rounded shadow-inner" style={{ backgroundColor: activeColor }}>
                   {selectedPlayerData.meta.Position}
                 </span>
               </div>
               <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter italic truncate leading-none">
                 {selectedPlayerData.name}
               </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Chart Column */}
            <div className="xl:col-span-7 bg-[#151515] border border-gray-800 rounded-2xl p-5 shadow-inner flex flex-col">
               <div className="flex items-center gap-2 mb-6">
                 <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700">
                   <TrendingUp size={16} />
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Usage vs Production</h3>
                   <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Timeline Trajectory</p>
                 </div>
               </div>

               <div className="flex-1 w-full min-h-[300px] relative">
                 {selectedPlayerData.chartData.length < 1 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-xs font-bold uppercase">
                       <AlertCircle size={24} className="mb-2" /> No Timeline Data Available
                    </div>
                 ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedPlayerData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis 
                          dataKey="year" 
                          tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} 
                          axisLine={false} 
                          tickLine={false} 
                          dy={10} 
                        />
                        <YAxis 
                          yAxisId="left" 
                          tick={{ fill: activeColor, fontSize: 10, fontWeight: 'bold' }} 
                          axisLine={false} 
                          tickLine={false} 
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          tick={{ fill: '#ffffff', fontSize: 10, fontWeight: 'bold' }} 
                          axisLine={false} 
                          tickLine={false} 
                        />
                        <RechartsTooltip content={<ArcTooltip />} cursor={{ stroke: '#444', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="omfg" 
                          name="OMFG Score" 
                          stroke={activeColor} 
                          strokeWidth={4} 
                          dot={{ r: 4, strokeWidth: 2, fill: '#111' }} 
                          activeDot={{ r: 6, strokeWidth: 0, fill: activeColor }} 
                          animationDuration={1500}
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="ppg" 
                          name="PPG" 
                          stroke="#ffffff" 
                          strokeWidth={4} 
                          dot={{ r: 4, strokeWidth: 2, fill: '#111' }} 
                          activeDot={{ r: 6, strokeWidth: 0, fill: '#ffffff' }} 
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                 )}
               </div>
            </div>

            {/* Metric Matrix Column (Reversed Order: Newest Year First) */}
            <div className="xl:col-span-5 bg-[#151515] border border-gray-800 rounded-2xl p-5 shadow-inner flex flex-col">
               <div className="flex items-center gap-2 mb-6">
                 <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700">
                   <Activity size={16} />
                 </div>
                 <div>
                   <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Metric Matrix</h3>
                   <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Year-over-Year Heatmap</p>
                 </div>
               </div>

               <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
                 <table className="w-full text-left whitespace-nowrap border-separate border-spacing-y-1">
                   <thead>
                     <tr>
                       <th className="px-2 pb-2 text-[9px] font-black text-gray-500 uppercase tracking-widest sticky left-0 bg-[#151515] z-10">Metric</th>
                       {selectedPlayerData.matrixTimeline.map(t => (
                         <th key={t.year} className="px-2 pb-2 text-[10px] font-black text-white uppercase tracking-widest text-center">{t.year}</th>
                       ))}
                     </tr>
                   </thead>
                   <tbody>
                     {getMetricsForPosition(selectedPlayerData.meta.Position).map(metricKey => (
                       <tr key={metricKey}>
                         <td className="px-2 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-0 bg-[#151515] z-10 border-r border-gray-800">
                           {metricKey}
                         </td>
                         {selectedPlayerData.matrixTimeline.map(t => {
                           const val = t.player ? getStat(t.player, metricKey) : null;
                           const thresh = t.thresholds ? t.thresholds[metricKey] : null;
                           const heatClass = getHeatmapClasses(val, metricKey, thresh);
                           
                           return (
                             <td key={`${metricKey}-${t.year}`} className="px-1 py-1">
                               <div className={`w-full h-full min-w-[50px] flex items-center justify-center rounded-lg border text-[11px] py-1.5 transition-colors ${heatClass}`}>
                                 {val !== null ? Number(val).toFixed(1) : '-'}
                               </div>
                             </td>
                           );
                         })}
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}