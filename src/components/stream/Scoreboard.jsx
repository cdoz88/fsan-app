"use client";
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

export default function Scoreboard() {
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [coreyScore, setCoreyScore] = useState(0);
  const [kyleScore, setKyleScore] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatScore = (val) => String(val).padStart(2, '0');

  return (
    <div className="w-full bg-black/80 backdrop-blur-md p-3 flex justify-center border-b border-zinc-800 relative z-50">
      
      {/* Scoreboard Main Housing (Outer White Border) */}
      <div className="bg-[#111114] border-4 border-white rounded-2xl p-3 px-6 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex items-center justify-center gap-6 md:gap-10">
        
        {/* COREY SCORE BOX */}
        <div className="flex items-center gap-3 bg-black border-2 border-white rounded-xl p-3 px-5 relative group">
          <div className="flex flex-col items-center">
            <span className="text-white text-xs font-black tracking-widest uppercase mb-1">COREY</span>
            <span className="font-mono text-amber-400 text-5xl font-black tracking-wider drop-shadow-[0_0_12px_rgba(251,191,36,0.85)] leading-none select-none">
              {formatScore(coreyScore)}
            </span>
          </div>

          {/* Quick Score Adjustment Controls */}
          <div className="flex flex-col gap-1 ml-1">
            <button 
              onClick={() => setCoreyScore(s => s + 1)} 
              className="bg-zinc-800 hover:bg-emerald-600 text-white p-1 rounded transition-colors"
              title="Add Point"
            >
              <Plus size={14}/>
            </button>
            <button 
              onClick={() => setCoreyScore(s => Math.max(0, s - 1))} 
              className="bg-zinc-800 hover:bg-red-600 text-white p-1 rounded transition-colors"
              title="Subtract Point"
            >
              <Minus size={14}/>
            </button>
          </div>
        </div>

        {/* TIME / CLOCK BOX */}
        <div className="flex flex-col items-center bg-black border-2 border-white rounded-xl p-3 px-8 relative group">
          <span className="text-white text-xs font-black tracking-widest uppercase mb-1">TIME</span>
          <span className="font-mono text-amber-400 text-5xl font-black tracking-wider drop-shadow-[0_0_12px_rgba(251,191,36,0.85)] leading-none select-none">
            {formatTime(timeLeft)}
          </span>

          {/* Clock Controls Popup on Hover */}
          <div className="absolute -bottom-10 bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
            <button 
              onClick={() => setIsRunning(!isRunning)} 
              className="bg-zinc-800 p-1.5 rounded hover:bg-zinc-600 text-white transition-colors"
              title={isRunning ? "Pause" : "Start"}
            >
              {isRunning ? <Pause size={14}/> : <Play size={14}/>}
            </button>
            <button 
              onClick={() => { setIsRunning(false); setTimeLeft(3600); }} 
              className="bg-zinc-800 p-1.5 rounded hover:bg-red-600 text-white transition-colors"
              title="Reset Clock"
            >
              <RotateCcw size={14}/>
            </button>
          </div>
        </div>

        {/* KYLE SCORE BOX */}
        <div className="flex items-center gap-3 bg-black border-2 border-white rounded-xl p-3 px-5 relative group">
          <div className="flex flex-col items-center">
            <span className="text-white text-xs font-black tracking-widest uppercase mb-1">KYLE</span>
            <span className="font-mono text-amber-400 text-5xl font-black tracking-wider drop-shadow-[0_0_12px_rgba(251,191,36,0.85)] leading-none select-none">
              {formatScore(kyleScore)}
            </span>
          </div>

          {/* Quick Score Adjustment Controls */}
          <div className="flex flex-col gap-1 ml-1">
            <button 
              onClick={() => setKyleScore(s => s + 1)} 
              className="bg-zinc-800 hover:bg-emerald-600 text-white p-1 rounded transition-colors"
              title="Add Point"
            >
              <Plus size={14}/>
            </button>
            <button 
              onClick={() => setKyleScore(s => Math.max(0, s - 1))} 
              className="bg-zinc-800 hover:bg-red-600 text-white p-1 rounded transition-colors"
              title="Subtract Point"
            >
              <Minus size={14}/>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}