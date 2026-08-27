'use client';

import React, { useState, useMemo } from 'react';
import { Search, Info, RefreshCw } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export default function RosRadar({ visibleData, isSyncing, currentPosition }) {
  const [searchTerm, setSearchTerm] = useState('');

  const { chartData, xAvg, yAvg } = useMemo(() => {
    if (!visibleData || visibleData.length === 0) return { chartData: [], xAvg: 0, yAvg: 0 };

    let totalX = 0;
    let totalY = 0;

    const data = visibleData.map(p => {
      const omfg = Number(p['Preseason OMFG'] || p['OMFG Score'] || 0);
      const ppg = Number(p['ROS Projected PPG'] || p['Projected PPG'] || 0);
      totalX += omfg;
      totalY += ppg;

      return {
        name: p.Player,
        team: p.Team,
        x: omfg, // X-Axis = Opportunity
        y: ppg,  // Y-Axis = Production
      };
    });

    return {
      chartData: data,
      xAvg: totalX / data.length || 50,
      yAvg: totalY / data.length || 10
    };
  }, [visibleData]);

  if (isSyncing) {
    return (
      <div className="bg-[#111] rounded-2xl p-20 text-center border border-gray-800 shadow-2xl">
        <RefreshCw className="animate-spin mb-4 text-red-600 mx-auto" size={36} />
        <h3 className="text-sm font-black text-white uppercase tracking-wider">Rendering Radar Plot...</h3>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1a1a1a] border border-gray-700 p-3 rounded-xl shadow-2xl z-50">
          <p className="text-sm font-black text-white uppercase tracking-wide mb-1">{data.name} <span className="text-gray-500 text-[10px]">{data.team}</span></p>
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-xs font-bold text-gray-300">RoS PPG: <span className="text-emerald-400">{data.y.toFixed(1)}</span></p>
            <p className="text-xs font-bold text-gray-300">OMFG Score: <span className="text-red-400">{data.x.toFixed(1)}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111] rounded-2xl shadow-2xl border border-gray-800 p-6 animate-in fade-in duration-500">
      
      {/* Controls / Legend */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Highlight Player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-white text-xs font-bold focus:outline-none focus:border-gray-600 transition-colors"
          />
          <Info className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-help" size={16} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-full border border-gray-800">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Elite Upside</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1.5 rounded-full border border-gray-800">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Fade / Bust</span>
          </div>
        </div>
      </div>

      {/* Recharts Scatter Plot */}
      <div className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          {/* 🌟 ADJUSTED MARGINS TO MAKE ROOM FOR LABELS 🌟 */}
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            
            <XAxis 
              type="number" 
              dataKey="x" 
              name="OMFG Score" 
              domain={['dataMin - 5', 'dataMax + 5']} 
              tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
              // 🌟 ENHANCED X-AXIS LABEL 🌟
              label={{ 
                value: 'OPPORTUNITY (OMFG SCORE)', 
                position: 'bottom', 
                offset: 15, 
                fill: '#e5e7eb', 
                fontSize: 12, 
                fontWeight: 900, 
                textAnchor: 'middle',
                letterSpacing: '0.05em'
              }}
            />
            
            <YAxis 
              type="number" 
              dataKey="y" 
              name="RoS PPG" 
              domain={['dataMin - 2', 'dataMax + 2']} 
              tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
              // 🌟 ENHANCED Y-AXIS LABEL 🌟
              label={{ 
                value: 'PRODUCTION (ROS PPG)', 
                angle: -90, 
                position: 'insideLeft', 
                offset: -5,
                fill: '#e5e7eb', 
                fontSize: 12, 
                fontWeight: 900, 
                textAnchor: 'middle',
                letterSpacing: '0.05em'
              }}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#444' }} />
            
            {/* Quadrant Lines */}
            <ReferenceLine x={xAvg} stroke="#555" strokeDasharray="4 4" />
            <ReferenceLine y={yAvg} stroke="#555" strokeDasharray="4 4" />

            <Scatter data={chartData} shape="circle">
              {chartData.map((entry, index) => {
                const isHighlighted = searchTerm && entry.name.toLowerCase().includes(searchTerm.toLowerCase());
                const isFaded = searchTerm && !isHighlighted;
                
                // Coloring logic: Green if above average in both, Red if below average in both, Blue otherwise
                let fill = '#3b82f6'; 
                if (entry.x >= xAvg && entry.y >= yAvg) fill = '#10b981'; // Elite
                else if (entry.x < xAvg && entry.y < yAvg) fill = '#dc2626'; // Bust

                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={fill} 
                    opacity={isFaded ? 0.1 : 0.9} 
                    stroke={isHighlighted ? '#fff' : 'transparent'}
                    strokeWidth={isHighlighted ? 2 : 0}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}