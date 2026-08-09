"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 

import QandATab from '@/components/stream/tabs/QandATab';
import BoomBustTab from '@/components/stream/tabs/BoomBustTab';
import OvertimeTab from '@/components/stream/tabs/OvertimeTab';

const TABS = [
  { id: 'PREGAME', label: 'P' },
  { id: '1ST Q', label: '1' },
  { id: '2ND Q', label: '2' },
  { id: 'HALFTIME', label: 'H' },
  { id: '3RD Q', label: '3' },
  { id: '4TH Q', label: '4' },
  { id: 'OVERTIME', label: 'OT' }
];

export default function StreamDashboardPage() {
  const [activeTab, setActiveTab] = useState('1ST Q');
  const [coreyScore, setCoreyScore] = useState(0);
  const [kyleScore, setKyleScore] = useState(0);
  
  // Master Clock State
  const [timerSeconds, setTimerSeconds] = useState(3600); // 60:00 default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTargetEndTime, setTimerTargetEndTime] = useState(null);
  
  // Audio Unlock State
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const lastSoundTimeRef = useRef(Date.now());

  // --- FIREBASE SYNC LOGIC ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stream_state', 'live'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // 1. Instantly Sync Scores, Tabs & Master Clock
        if (data.coreyScore !== undefined) setCoreyScore(data.coreyScore);
        if (data.kyleScore !== undefined) setKyleScore(data.kyleScore);
        if (data.dashboardTab !== undefined) setActiveTab(data.dashboardTab);
        if (data.isTimerRunning !== undefined) setIsTimerRunning(data.isTimerRunning);
        if (data.timerTargetEndTime !== undefined) setTimerTargetEndTime(data.timerTargetEndTime);
        if (data.timerSeconds !== undefined && !data.isTimerRunning) {
          setTimerSeconds(data.timerSeconds);
        }
        
        // 2. Instantly Play Sound Effects
        if (data.soundTriggeredAt && data.soundTriggeredAt > lastSoundTimeRef.current) {
          lastSoundTimeRef.current = data.soundTriggeredAt; 
          
          if (data.lastSound) {
            try {
              const audio = new Audio(`/sounds/${data.lastSound}.mp3`);
              audio.play().catch(err => console.error("Audio playback blocked by browser:", err));
            } catch (err) {
              console.error("Audio error:", err);
            }
          }
        }
      }
    });

    return () => unsub();
  }, []);

  // --- LOCAL MASTER CLOCK COUNTDOWN LOGIC ---
  useEffect(() => {
    let interval;
    if (isTimerRunning && timerTargetEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((timerTargetEndTime - now) / 1000));
        setTimerSeconds(remaining);
        
        if (remaining === 0) {
          setIsTimerRunning(false);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTargetEndTime]);

  const updateFirebaseState = async (updates) => {
    try {
      await setDoc(doc(db, 'stream_state', 'live'), updates, { merge: true });
    } catch (err) {
      console.error("Failed to sync to Firebase:", err);
    }
  };

  const handleScoreChange = (person, currentScore, change) => {
    const newScore = Math.max(0, currentScore + change);
    if (person === 'corey') {
      setCoreyScore(newScore);
      updateFirebaseState({ coreyScore: newScore });
    } else {
      setKyleScore(newScore);
      updateFirebaseState({ kyleScore: newScore });
    }
  };

  const handleToggleMasterClock = () => {
    if (isTimerRunning) {
      updateFirebaseState({ isTimerRunning: false, timerSeconds });
    } else {
      updateFirebaseState({ isTimerRunning: true, timerTargetEndTime: Date.now() + (timerSeconds * 1000) });
    }
  };

  const handlePrevQuarter = () => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      const newTab = TABS[currentIndex - 1].id;
      setActiveTab(newTab);
      updateFirebaseState({ dashboardTab: newTab });
    }
  };

  const handleNextQuarter = () => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    if (currentIndex < TABS.length - 1) {
      const newTab = TABS[currentIndex + 1].id;
      setActiveTab(newTab);
      updateFirebaseState({ dashboardTab: newTab });
    }
  };

  const handleGlobalClick = () => {
    if (!audioUnlocked) setAudioUnlocked(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentTabLabel = TABS.find(t => t.id === activeTab)?.label || '1';

  return (
    <div 
      className="min-h-screen bg-[#0a0a0c] flex flex-col font-sans relative"
      onClick={handleGlobalClick}
    >
      {/* Import Custom Bitcount Font */}
      <style dangerouslySetInnerHTML={{__html: `
        @font-face {
          font-family: 'Bitcount';
          src: url('/BitcountGridSingle-Regular.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        
        .led-font { 
          font-family: 'Bitcount', monospace; 
        }
      `}} />
      
      {/* 1. TOP SCOREBOARD HEADER (COMPACT REDESIGN) */}
      <div className="flex justify-center pt-4 pb-4 w-full relative z-20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] bg-[#0a0a0c] border-b border-zinc-900">
        <div className="flex items-center justify-between px-8 py-4 bg-[#0c121c] border-4 border-[#18202b] rounded-[1.25rem] shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] max-w-[850px] w-full relative overflow-hidden">
          
          {/* Subtle inner grid lines to mimic a physical scoreboard panel */}
          <div className="absolute inset-0 pointer-events-none border border-zinc-800/30 m-1.5 rounded-xl"></div>

          {/* Corey Score */}
          <div className="flex items-end justify-between z-10 w-[150px]">
            <div className="w-6"></div>
            
            <div className="flex flex-col items-center">
              <span className="text-[15px] font-black text-white uppercase tracking-[0.2em] mb-1.5 drop-shadow-md">COREY</span>
              <span className="text-6xl text-amber-500 led-font leading-none drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] tracking-wider">
                {coreyScore.toString().padStart(2, '0')}
              </span>
            </div>
            
            <div className="flex flex-col gap-1.5 pb-0.5">
              <button 
                onClick={() => handleScoreChange('corey', coreyScore, 1)}
                className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded w-6 h-6 flex items-center justify-center transition-colors border border-zinc-700 shadow-md"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
              <button 
                onClick={() => handleScoreChange('corey', coreyScore, -1)}
                className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded w-6 h-6 flex items-center justify-center transition-colors border border-zinc-700 shadow-md"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="w-px h-16 bg-[#18202b] mx-2 rounded-full"></div>

          {/* Master Time (Clickable to Start/Pause) */}
          <div className="flex flex-col items-center px-2 z-10 w-[260px] cursor-pointer group" onClick={handleToggleMasterClock} title="Click to Start/Pause Timer">
            <span className="text-[15px] font-black text-white uppercase tracking-[0.2em] mb-1.5 drop-shadow-md">
              TIME
            </span>
            <span className="text-7xl text-amber-500 led-font leading-none drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] tracking-widest group-hover:brightness-125 transition-all">
              {formatTime(timerSeconds)}
            </span>
          </div>

          <div className="w-px h-16 bg-[#18202b] mx-2 rounded-full"></div>

          {/* Quarter Cycler */}
          <div className="flex flex-col items-center px-2 z-10 w-[140px]">
            <span className="text-[15px] font-black text-white uppercase tracking-[0.2em] mb-1.5 drop-shadow-md">QUARTER</span>
            <div className="flex items-center justify-center w-full gap-1.5">
              <button 
                onClick={handlePrevQuarter}
                className="text-zinc-600 hover:text-amber-500 transition-colors disabled:opacity-30 disabled:hover:text-zinc-600"
                disabled={TABS.findIndex(t => t.id === activeTab) === 0}
              >
                <ChevronLeft size={28} strokeWidth={3} />
              </button>
              <span className="text-6xl text-amber-500 led-font leading-none drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] w-[50px] text-center">
                {currentTabLabel}
              </span>
              <button 
                onClick={handleNextQuarter}
                className="text-zinc-600 hover:text-amber-500 transition-colors disabled:opacity-30 disabled:hover:text-zinc-600"
                disabled={TABS.findIndex(t => t.id === activeTab) === TABS.length - 1}
              >
                <ChevronRight size={28} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="w-px h-16 bg-[#18202b] mx-2 rounded-full"></div>

          {/* Kyle Score */}
          <div className="flex items-end justify-between z-10 w-[150px]">
            <div className="flex flex-col gap-1.5 pb-0.5">
              <button 
                onClick={() => handleScoreChange('kyle', kyleScore, 1)}
                className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded w-6 h-6 flex items-center justify-center transition-colors border border-zinc-700 shadow-md"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
              <button 
                onClick={() => handleScoreChange('kyle', kyleScore, -1)}
                className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded w-6 h-6 flex items-center justify-center transition-colors border border-zinc-700 shadow-md"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-[15px] font-black text-white uppercase tracking-[0.2em] mb-1.5 drop-shadow-md">KYLE</span>
              <span className="text-6xl text-amber-500 led-font leading-none drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] tracking-wider">
                {kyleScore.toString().padStart(2, '0')}
              </span>
            </div>

            <div className="w-6"></div>
          </div>

        </div>
      </div>

      {/* 2. ACTIVE TAB CONTENT */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0a0c]">
        {activeTab === '1ST Q' && <BoomBustTab />}
        
        {(activeTab === '2ND Q' || activeTab === '3RD Q') && <QandATab />}
        
        {activeTab === 'OVERTIME' && <OvertimeTab />}
        
        {/* Render placeholder for unbuilt tabs */}
        {activeTab !== '1ST Q' && activeTab !== '2ND Q' && activeTab !== '3RD Q' && activeTab !== 'OVERTIME' && (
          <div className="flex h-full items-center justify-center text-zinc-600 font-black uppercase tracking-widest text-xl">
            {activeTab} Content Area
          </div>
        )}
      </div>

    </div>
  );
}