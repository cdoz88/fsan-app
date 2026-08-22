'use client';

import React, { useState, useMemo } from 'react';
import { RefreshCw, Search, Info } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const RadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl shadow-2xl z-[100] min-w-[180px]">
        <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
          <span className="font-black text-white text-sm uppercase">{data.player}</span>
          <span className="text-[10px] text-gray-400 font-bold bg-gray-800 px-2 py-0.5 rounded">{data.pos}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between gap-6 text-xs">
            <span className="text-gray-400 uppercase tracking-widest font-bold">OMFG:</span>
            <span className="text-white font-black">{data.omfg.toFixed(1)}</span>
          </div>
          <div className="flex justify-between gap-6 text-xs">
            <span className="text-gray-400 uppercase tracking-widest font-bold">PPG:</span>
            <span className="text-white font-black">{data.ppg.toFixed(1)}</span>
          </div>
        </div>
        <div className={`mt-3 pt-2 border-t border-gray-800 text-[10px] font-black uppercase tracking-widest text-center ${data.colorClass}`}>
          {data.label}
        </div>
      </div>
    );
  }
  return null;
};

const getMedian = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export default function SeasonRadar({ visibleData, isHistorical, isSyncing }) {
  const [searchQuery, setSearchQuery] = useState('');

  const radarChartData = useMemo(() => {
    const validData = visibleData.filter(p => {
      const omfg = Number(p['OMFG Score']);
      const ppg = isHistorical ? Number(p['Actual PPG']) : Number(p['Projected PPG']);
      return !isNaN(omfg) && !isNaN(ppg) && ppg >= 6.0 && omfg >= 30;
    });

    if (validData.length === 0) return { data: [], medOmfg: 0, medPpg: 0 };

    const omfgList = validData.map(p => Number(p['OMFG Score']));
    const ppgList = validData.map(p => isHistorical ? Number(p['Actual PPG']) : Number(p['Projected PPG']));

    const medOmfg = getMedian(omfgList);
    const medPpg = getMedian(ppgList);

    const data = validData.map(p => {
      const omfg = Number(p['OMFG Score']);
      const ppg = isHistorical ? Number(p['Actual PPG']) : Number(p['Projected PPG']);
      
      let fill = '#4b5563'; 
      let label = 'Expected Output';
      let colorClass = 'text-gray-400';

      if (omfg > medOmfg && ppg < medPpg) {
        fill = '#10b981'; 
        label = 'Buy Low / Positive Regression';
        colorClass = 'text-emerald-400';
      } else if (omfg < medOmfg && ppg > medPpg) {
        fill = '#ef4444'; 
        label = 'Sell High / Negative Regression';
        colorClass = 'text-red-400';
      } else if (omfg > medOmfg && ppg > medPpg) {
        fill = '#3b82f6'; 
        label = 'Elite Usage & Production';
        colorClass = 'text-blue-400';
      }

      const isSearchMatch = searchQuery.trim().length > 0 && p.Player.toLowerCase().includes(searchQuery.trim().toLowerCase());

      return {
        player: p.Player,
        pos: p.Position,
        team: p.Team,
        omfg,
        ppg,
        fill,
        label,
        colorClass,
        isSearchMatch
      };
    });

    return { data, medOmfg, medPpg };
  }, [visibleData, isHistorical, searchQuery]);

  return (
    <div className="bg-[#111] rounded-2xl shadow-2xl border border-gray-800 animate-in fade-in duration-500 relative min-h-[540px] p-6 pt-10">
      
      {/* Top Header: Search & Quadrant Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 relative z-20">
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Highlight Player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-800 text-white text-xs rounded-xl py-2 pl-9 pr-3 focus:outline-none focus:border-red-500 transition-colors font-medium placeholder:text-gray-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="relative group cursor-help flex items-center justify-center">
            <Info size={18} className="text-gray-500 hover:text-white transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-[#1a1a1a] border border-gray-700 text-gray-300 text-[11px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] w-64 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed">
              Plots Usage (OMFG) against actual fantasy production. Look for 'Buy Low' regression candidates in the bottom right (great historical profile, but lower projected output due to variance) and 'Sell High' fades in the top left.
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-xl border border-gray-800 shadow-xl">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Buy Low</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-xl border border-gray-800 shadow-xl">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Sell High</span>
          </div>
        </div>
      </div>

      {isSyncing ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-600 z-10 bg-[#111]/80 backdrop-blur-sm rounded-2xl">
          <RefreshCw className="animate-spin mb-4" size={36} />
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Calculating Medians...</h3>
        </div>
      ) : radarChartData.data.length === 0 ? (
        <div className="h-[450px] flex flex-col items-center justify-center">
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Data Available</h3>
          <p className="text-gray-500 text-xs font-bold">Try adjusting your filters or position selection.</p>
        </div>
      ) : (
        <div className="w-full h-[460px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              
              <XAxis 
                type="number" 
                dataKey="omfg" 
                name="OMFG Score" 
                domain={['auto', 'auto']} 
                stroke="#555" 
                tick={{ fill: '#aaa', fontSize: 12, fontWeight: 'bold' }}
                label={{ 
                  value: 'USAGE (OMFG SCORE)', 
                  position: 'insideBottom', 
                  offset: -18, 
                  fill: '#e5e7eb', 
                  fontSize: 13, 
                  fontWeight: '900', 
                  textAnchor: 'middle' 
                }}
              />
              
              <YAxis 
                type="number" 
                dataKey="ppg" 
                name="PPG" 
                domain={['auto', 'auto']} 
                stroke="#555" 
                tick={{ fill: '#aaa', fontSize: 12, fontWeight: 'bold' }}
                label={{ 
                  value: 'PRODUCTION (PPG)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  offset: -5, 
                  fill: '#e5e7eb', 
                  fontSize: 13, 
                  fontWeight: '900', 
                  style: { textAnchor: 'middle' } 
                }}
              />

              <RechartsTooltip content={<RadarTooltip />} cursor={{ stroke: '#555', strokeDasharray: '3 3' }} />
              
              <ReferenceLine x={radarChartData.medOmfg} stroke="#666" strokeWidth={2} strokeDasharray="4 4" />
              <ReferenceLine y={radarChartData.medPpg} stroke="#666" strokeWidth={2} strokeDasharray="4 4" />
              
              <Scatter name="Players" data={radarChartData.data}>
                {radarChartData.data.map((entry, index) => {
                  const isSearching = searchQuery.trim().length > 0;
                  const isMatch = entry.isSearchMatch;

                  let opacity = isSearching ? (isMatch ? 1 : 0.15) : 0.85;
                  let radius = isMatch ? 9 : 6;
                  let stroke = isMatch ? '#ffffff' : 'none';
                  let strokeWidth = isMatch ? 3 : 0;

                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isMatch ? '#f5a623' : entry.fill} 
                      opacity={opacity}
                      r={radius}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-200" 
                      style={{ cursor: 'pointer' }} 
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}