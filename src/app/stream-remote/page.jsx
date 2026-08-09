"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Volume2, Radio, Flame, Award } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 

export default function MobileRemotePage() {
  const [coreyScore, setCoreyScore] = useState(0);
  const [kyleScore, setKyleScore] = useState(0);
  const [activeSound, setActiveSound] = useState(null);

  // Sync scores from Firebase so your phone is always accurate
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stream_state', 'live'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.coreyScore !== undefined) setCoreyScore(data.coreyScore);
        if (data.kyleScore !== undefined) setKyleScore(data.kyleScore);
      }
    });
    return () => unsub();
  }, []);

  const updateFirebaseScore = async (person, newScore) => {
    try {
      await setDoc(doc(db, 'stream_state', 'live'), {
        [`${person}Score`]: newScore
      }, { merge: true });
    } catch (err) {
      console.error("Failed to sync score:", err);
    }
  };

  const triggerFirebaseSound = async (soundId) => {
    try {
      await setDoc(doc(db, 'stream_state', 'live'), {
        lastSound: soundId,
        soundTriggeredAt: Date.now()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to trigger sound:", err);
    }
  };

  const SOUNDS = [
    { id: 'airhorn', label: 'Airhorn', emoji: '🚨', color: 'from-amber-600 to-red-600 border-amber-500' },
    { id: 'buzzer', label: 'Buzzer', emoji: '⛔', color: 'from-red-700 to-red-900 border-red-500' },
    { id: 'applause', label: 'Applause', emoji: '👏', color: 'from-emerald-600 to-teal-700 border-emerald-500' },
    { id: 'crickets', label: 'Crickets', emoji: '🦗', color: 'from-zinc-700 to-zinc-900 border-zinc-600' },
    { id: 'wrong', label: 'Wrong', emoji: '❌', color: 'from-rose-700 to-pink-900 border-rose-500' },
    { id: 'cash', label: 'Cha-Ching', emoji: '💰', color: 'from-green-600 to-emerald-800 border-green-400' },
    { id: 'drumroll', label: 'Drumroll', emoji: '🥁', color: 'from-purple-700 to-indigo-900 border-purple-500' },
    { id: 'dramatic', label: 'Dun Dun Dun', emoji: '😱', color: 'from-cyan-700 to-blue-900 border-cyan-500' },
  ];

  const handleScoreChange = (person, currentScore, change) => {
    const newScore = Math.max(0, currentScore + change);
    if (person === 'corey') {
      setCoreyScore(newScore);
      updateFirebaseScore('corey', newScore); 
    } else {
      setKyleScore(newScore);
      updateFirebaseScore('kyle', newScore);
    }
  };

  const handleTriggerSound = (soundId) => {
    setActiveSound(soundId);
    triggerFirebaseSound(soundId);
    setTimeout(() => setActiveSound(null), 400); 
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col p-4 select-none custom-scrollbar">
      
      <div className="flex items-center justify-between bg-[#141418] border border-zinc-800 rounded-2xl px-4 py-3 mb-6 shadow-xl">
        <div className="flex items-center gap-2">
          <Radio size={18} className="text-red-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300">STUDIO REMOTE</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">LIVE SYNC</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        
        <div className="bg-[#141418] border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col items-center justify-between shadow-xl relative overflow-hidden">
          <div className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Flame size={14} /> COREY
          </div>
          
          <div className="text-6xl font-black my-4 font-mono tracking-tight text-white drop-shadow-md">
            {coreyScore.toString().padStart(2, '0')}
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mt-2">
            <button 
              onClick={() => handleScoreChange('corey', coreyScore, -1)}
              className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 rounded-xl py-4 flex items-center justify-center border border-zinc-700 font-bold transition-all"
            >
              <Minus size={24} />
            </button>
            <button 
              onClick={() => handleScoreChange('corey', coreyScore, 1)}
              className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl py-4 flex items-center justify-center border border-amber-400 font-bold shadow-lg transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="bg-[#141418] border-2 border-cyan-500/40 rounded-2xl p-4 flex flex-col items-center justify-between shadow-xl relative overflow-hidden">
          <div className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Award size={14} /> KYLE
          </div>

          <div className="text-6xl font-black my-4 font-mono tracking-tight text-white drop-shadow-md">
            {kyleScore.toString().padStart(2, '0')}
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mt-2">
            <button 
              onClick={() => handleScoreChange('kyle', kyleScore, -1)}
              className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 rounded-xl py-4 flex items-center justify-center border border-zinc-700 font-bold transition-all"
            >
              <Minus size={24} />
            </button>
            <button 
              onClick={() => handleScoreChange('kyle', kyleScore, 1)}
              className="bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white rounded-xl py-4 flex items-center justify-center border border-cyan-400 font-bold shadow-lg transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

      </div>

      <div className="flex-1 bg-[#141418] border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col">
        <div className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
          <Volume2 size={16} className="text-amber-400" /> INSTANT SOUNDBOARD
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {SOUNDS.map((snd) => (
            <button
              key={snd.id}
              onClick={() => handleTriggerSound(snd.id)}
              className={`relative bg-gradient-to-br ${snd.color} border p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 active:brightness-125
                ${activeSound === snd.id ? 'ring-4 ring-white scale-95 brightness-150' : ''}
              `}
            >
              <span className="text-3xl mb-1 drop-shadow-md">{snd.emoji}</span>
              <span className="text-sm font-black uppercase tracking-wider text-white drop-shadow-md">{snd.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}