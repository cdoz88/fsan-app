'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RefreshCw, ChevronDown, Target, Crosshair, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

// --- NFL Team Primary Colors ---
const teamColors = {
  ARI: '#97233F', ATL: '#A71930', BAL: '#241773', BUF: '#00338D', CAR: '#0085CA', CHI: '#C83803',
  CIN: '#FB4F14', CLE: '#FB4F14', DAL: '#86939E', DEN: '#FB4F14', DET: '#0076B6', GB: '#203731',
  HOU: '#03202F', IND: '#002C5F', JAX: '#006778', KC: '#E31837', LAC: '#0080C6', LAR: '#003594',
  LV: '#A5ACAF', MIA: '#008E97', MIN: '#4F2683', NE: '#002244', NO: '#D3BC8D', NYG: '#003594',
  NYJ: '#125740', PHI: '#004C54', PIT: '#FFB612', SEA: '#69BE28', SF: '#AA0000',
  TB: '#D50A0A', TEN: '#0C2340', WAS: '#5A1414'
};

// --- Helper: Convert Hex to RGBA for Monochromatic Opacities ---
const hexToRgba = (hex, alpha) => {
  let c = (hex || '#1b75bb').replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// --- Custom Headshot X-Axis Component ---
const CustomXAxisTick = ({ x, y, payload, alphaData, playerDB }) => {
  const fullName = payload.value;
  const dataObj = alphaData.find(d => d.fullName === fullName);
  const lastName = dataObj?.name || fullName.split(' ').pop();

  const cleanKey = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const dbPlayer = playerDB[cleanKey];

  let headshotUrl = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
  if (dbPlayer?.espn_id) {
    headshotUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${dbPlayer.espn_id}.png&w=350&h=254`;
  } else if (dbPlayer?.player_id) {
    headshotUrl = `https://sleepercdn.com/content/nfl/players/thumb/${dbPlayer.player_id}.jpg`;
  }

  const clipId = `clip-${fullName.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <g transform={`translate(${x},${y})`}>
      <clipPath id={clipId}>
        <circle cx="0" cy="15" r="16" />
      </clipPath>
      <circle cx="0" cy="15" r="16" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
      <image 
        href={headshotUrl} 
        x="-16" 
        y="-1" 
        height="32" 
        width="32" 
        clipPath={`url(#${clipId})`}
        onError={(e) => { e.target.setAttribute('href', 'https://sleepercdn.com/images/v2/icons/player_default.webp'); }}
      />
      <text x="0" y="45" dy={0} textAnchor="middle" fill="#888" fontSize="10px" fontWeight="bold">
        {lastName}
      </text>
    </g>
  );
};

// --- Custom Dropdown for Team Selection ---
function TeamDropdown({ options, value, onChange }) {
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
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1a1a1a] border border-gray-700 text-white font-black text-sm uppercase tracking-widest rounded-xl py-3 pl-4 pr-10 flex items-center justify-between gap-3 shadow-xl hover:border-gray-500 transition-colors w-56 md:w-64"
      >
        <div className="flex items-center gap-3">
          {value && (
            <img 
              src={`https://sleepercdn.com/images/team_logos/nfl/${value.toLowerCase()}.png`} 
              alt={value}
              className="w-6 h-6 object-contain drop-shadow-md"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <span>{value || 'Select Team'}</span>
        </div>
        <ChevronDown size={16} className={`absolute right-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 md:w-64 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl py-2 z-[120] max-h-72 overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-150">
          {options.map((team) => (
            <button
              key={team}
              onClick={() => {
                onChange(team);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-3 ${
                value === team
                  ? 'bg-red-600/20 text-red-500 border-l-2 border-red-500'
                  : 'text-gray-300 hover:bg-[#252525] hover:text-white'
              }`}
            >
              <img 
                src={`https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png`} 
                alt={team}
                className="w-5 h-5 object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
              {team}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Custom Bar Chart Tooltip ---
const AlphaTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1a1a1a] border border-gray-700 p-3 rounded-xl shadow-2xl z-[100]">
        <div className="flex items-center gap-2 mb-2 border-b border-gray-800 pb-2">
          <span className="font-black text-white text-xs uppercase tracking-wider">{data.fullName}</span>
          <span className="text-[9px] text-gray-400 font-bold bg-gray-800 px-1.5 py-0.5 rounded">{data.pos}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">OMFG Score</span>
          <span className="text-sm font-black text-white">{data.omfg.toFixed(1)}</span>
        </div>
      </div>
    );
  }
  return null;
};

// --- Rich Donut Chart Tooltip (with Headshot) ---
const DonutTooltip = ({ active, payload, playerDB }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isOther = data.name === 'Others';
    
    const cleanKey = data.fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dbPlayer = playerDB[cleanKey];

    let headshotUrl = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
    if (dbPlayer?.espn_id) {
      headshotUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${dbPlayer.espn_id}.png&w=350&h=254`;
    } else if (dbPlayer?.player_id) {
      headshotUrl = `https://sleepercdn.com/content/nfl/players/thumb/${dbPlayer.player_id}.jpg`;
    }

    return (
      <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl shadow-2xl z-[999] min-w-[200px]">
        <div className="flex items-center gap-3 mb-3 border-b border-gray-800 pb-3">
          {!isOther && (
            <div className="w-10 h-10 rounded-full bg-gray-800 border-2 overflow-hidden shrink-0" style={{ borderColor: data.fill }}>
              <img 
                src={headshotUrl} 
                alt={data.name} 
                className="w-full h-full object-cover pt-1"
                onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm uppercase tracking-wider">{data.fullName}</span>
              {!isOther && <span className="text-[9px] text-white font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: data.fill }}>{data.pos}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Volume</span>
          <span className="text-lg font-black text-white">{Number(data.value).toFixed(1)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SeasonTeamHub({ visibleData, isHistorical, isSyncing }) {
  const [playerDB, setPlayerDB] = useState({});
  const [dbLoading, setDbLoading] = useState(true);

  // --- Load Sleeper Player Database ---
  useEffect(() => {
    async function loadMasterPlayerDB() {
      try {
        const res = await fetch('https://api.sleeper.app/v1/players/nfl');
        if (res.ok) {
          const slpData = await res.json();
          const map = {};
          
          Object.values(slpData).forEach(p => {
            if (p.full_name) {
              const key = p.full_name.toLowerCase().replace(/[^a-z0-9]/g, '');
              map[key] = p;
            }
            if (p.search_full_name) {
              const key = p.search_full_name.toLowerCase().replace(/[^a-z0-9]/g, '');
              map[key] = p;
            }
          });
          
          setPlayerDB(map);
        }
      } catch (err) {
        console.warn("Could not load Sleeper player database:", err);
      } finally {
        setDbLoading(false);
      }
    }
    loadMasterPlayerDB();
  }, []);

  const availableTeams = useMemo(() => {
    const teams = new Set(visibleData.map(p => p.Team).filter(Boolean));
    return Array.from(teams).sort();
  }, [visibleData]);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [donutMetric, setDonutMetric] = useState('First Read Targets');
  const [teamPosition, setTeamPosition] = useState('All');

  useEffect(() => {
    if (availableTeams.length > 0 && (!selectedTeam || !availableTeams.includes(selectedTeam))) {
      setSelectedTeam(availableTeams[0]);
    }
  }, [availableTeams, selectedTeam]);

  const getStat = (player, statName) => {
     const hyphenated = statName.replace(' ', '-');
     return Number(
       player[`Projected ${statName}`] ?? 
       player[statName] ?? 
       player[`Actual ${statName}`] ?? 
       player[hyphenated] ?? 
       player[`Projected ${hyphenated}`] ?? 
       0
     );
  };

  const activeColor = selectedTeam && teamColors[selectedTeam] ? teamColors[selectedTeam] : '#1b75bb';

  // --- PREP DATA FOR ALPHA BAR CHART (Top 5 OMFG) ---
  const alphaData = useMemo(() => {
    if (!selectedTeam) return [];
    
    const teamPlayers = visibleData.filter(p => p.Team === selectedTeam && (teamPosition === 'All' || p.Position === teamPosition));
    
    return teamPlayers
      .map(p => ({
        name: p.Player.split(' ').pop(),
        fullName: p.Player,
        pos: p.Position,
        omfg: Number(p['OMFG Score']) || 0,
        playerId: p['Player ID'] || null, 
      }))
      .filter(p => p.omfg > 0)
      .sort((a, b) => b.omfg - a.omfg)
      .slice(0, 5); 
  }, [visibleData, selectedTeam, teamPosition]);

  // --- PREP DATA FOR DONUT CHART (Monochromatic Opacities) ---
  const donutData = useMemo(() => {
    if (!selectedTeam) return [];

    const teamPlayers = visibleData.filter(p => p.Team === selectedTeam && (teamPosition === 'All' || p.Position === teamPosition));

    let mapped = teamPlayers.map(p => ({
      name: p.Player.split(' ').pop(),
      fullName: p.Player,
      value: getStat(p, donutMetric),
      pos: p.Position,
      playerId: p['Player ID'] || null,
    })).filter(p => p.value > 0).sort((a, b) => b.value - a.value);

    if (mapped.length > 6) {
      const top6 = mapped.slice(0, 6);
      const othersVal = mapped.slice(6).reduce((acc, curr) => acc + curr.value, 0);
      mapped = [...top6, { name: 'Others', fullName: 'Other Players', value: othersVal, pos: 'MIX', playerId: null }];
    }

    const opacities = [1.0, 0.82, 0.65, 0.50, 0.38, 0.27, 0.18];

    return mapped.map((item, index) => ({
      ...item,
      fill: hexToRgba(activeColor, opacities[index] || 0.2)
    }));
  }, [visibleData, selectedTeam, donutMetric, activeColor, teamPosition]);

  const metricLabels = {
    'First Read Targets': 'First Read',
    'End Zone Targets': 'End Zone',
    'Rush Attempts': 'Rush'
  };

  const positions = ['All', 'QB', 'RB', 'WR', 'TE'];

  if (isSyncing || dbLoading) {
    return (
      <div className="bg-[#111] rounded-2xl shadow-2xl border border-gray-800 min-h-[500px] flex flex-col items-center justify-center text-red-600">
        <RefreshCw className="animate-spin mb-4" size={36} />
        <h3 className="text-sm font-black text-white uppercase tracking-wider">Syncing Player Headshots...</h3>
      </div>
    );
  }

  if (availableTeams.length === 0) {
    return (
      <div className="bg-[#111] rounded-2xl shadow-2xl border border-gray-800 min-h-[500px] flex flex-col items-center justify-center">
        <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Team Data Available</h3>
        <p className="text-gray-500 text-xs font-bold">Try adjusting your period filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111] rounded-2xl shadow-2xl border border-gray-800 animate-in fade-in duration-500 relative min-h-[500px] p-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-800/50">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <TeamDropdown 
            options={availableTeams} 
            value={selectedTeam} 
            onChange={setSelectedTeam} 
          />
          <div className="flex flex-wrap bg-[#1a1a1a] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit shrink-0">
            {positions.map(pos => (
              <button 
                key={pos} 
                onClick={() => setTeamPosition(pos)} 
                className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                  teamPosition === pos 
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                    : 'text-gray-500 hover:text-white hover:bg-[#252525]'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-right hidden xl:flex items-center gap-3">
          <div className="relative group cursor-help">
            <Info size={18} className="text-gray-500 hover:text-white transition-colors" />
            <div className="absolute bottom-full right-0 mb-3 px-4 py-3 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-[11px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] w-64 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed">
              Visualize how a team's total offense is distributed. Use the Donut Chart to see which players dominate their team's high-value scoring and volume opportunities.
              <div className="absolute top-full right-1 border-4 border-transparent border-t-gray-700"></div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Team Utilization</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Target High-Value Opportunities</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Top Utilization (Alpha Bar Chart) */}
        <div className="bg-[#151515] border border-gray-800 rounded-2xl p-5 shadow-inner flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700">
              <Target size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Top Season Utilization</h3>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Highest SOS OMFG Scores</p>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px] relative">
            {alphaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alphaData} margin={{ top: 20, right: 0, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="fullName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={<CustomXAxisTick alphaData={alphaData} playerDB={playerDB} />} 
                    interval={0}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#555', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <RechartsTooltip content={<AlphaTooltip />} cursor={{ fill: '#222' }} />
                  <Bar 
                    dataKey="omfg" 
                    fill={activeColor} 
                    radius={[6, 6, 0, 0]}
                    animationDuration={1000}
                  >
                    {alphaData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? activeColor : hexToRgba(activeColor, 0.55)} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs font-bold uppercase">
                No Players Found
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: High Value Opportunities (Monochromatic Donut Chart) */}
        <div className="bg-[#151515] border border-gray-800 rounded-2xl p-5 shadow-inner flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700 shrink-0">
                <Crosshair size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">High-Value Ops</h3>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Opportunity Share</p>
              </div>
            </div>

            {/* Metric Toggle */}
            <div className="flex bg-[#111] p-1 rounded-xl border border-gray-800 w-fit shrink-0 relative z-50">
              {['First Read Targets', 'End Zone Targets', 'Rush Attempts'].map(metric => (
                <button
                  key={metric}
                  onClick={() => setDonutMetric(metric)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
                    donutMetric === metric ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {metricLabels[metric]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px] relative flex items-center justify-center">
            {donutData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-3xl font-black text-white leading-none">
                  {Number(donutData[0]?.value || 0).toFixed(1)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                  Team High
                </span>
              </div>
            )}
            
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1000}
                  >
                    {donutData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.fill} 
                        className="hover:opacity-80 transition-opacity" 
                        style={{ cursor: 'pointer' }} 
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<DonutTooltip playerDB={playerDB} />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs font-bold uppercase">
                No Stats Found
              </div>
            )}
          </div>

          {/* Donut Legend */}
          {donutData.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-gray-800/50">
              {donutData.map(entry => (
                <div key={entry.fullName} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: entry.fill }}></div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}