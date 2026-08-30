"use client";
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Play, Trophy, Eye, EyeOff } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import NapkinLeaderboard from '@/components/dno/DNOLeaderboard';

export default function HalftimeTab() {
  const [activeSubTab, setActiveSubTab] = useState('COREY');

  // --- STATE LISTENING TO FIREBASE ---
  const [host1Name, setHost1Name] = useState('COREY');
  const [host2Name, setHost2Name] = useState('KYLE');

  const [coreyMediaUrl, setCoreyMediaUrl] = useState(null);
  const [coreyMediaType, setCoreyMediaType] = useState('image');
  const [coreyRevealed, setCoreyRevealed] = useState(false);

  const [kyleMediaUrl, setKyleMediaUrl] = useState(null);
  const [kyleMediaType, setKyleMediaType] = useState('image');
  const [kyleRevealed, setKyleRevealed] = useState(false);

  // Sync state from Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stream_state', 'live'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Sync Display Names
        if (data.host1Name !== undefined) setHost1Name(data.host1Name);
        if (data.host2Name !== undefined) setHost2Name(data.host2Name);

        // Sync Corey's Media
        if (data.coreyMediaUrl !== undefined) setCoreyMediaUrl(data.coreyMediaUrl);
        if (data.coreyMediaType !== undefined) setCoreyMediaType(data.coreyMediaType);
        if (data.coreyRevealed !== undefined) setCoreyRevealed(data.coreyRevealed);
        
        // Sync Kyle's Media
        if (data.kyleMediaUrl !== undefined) setKyleMediaUrl(data.kyleMediaUrl);
        if (data.kyleMediaType !== undefined) setKyleMediaType(data.kyleMediaType);
        if (data.kyleRevealed !== undefined) setKyleRevealed(data.kyleRevealed);
      }
    });
    return () => unsub();
  }, []);

  const handleToggleReveal = async (person, isRevealed) => {
    const field = person === 'COREY' ? 'coreyRevealed' : 'kyleRevealed';
    try {
      await setDoc(doc(db, 'stream_state', 'live'), { [field]: !isRevealed }, { merge: true });
    } catch (err) {
      console.error("Failed to toggle reveal state:", err);
    }
  };

  const renderMemeStage = (person, mediaUrl, mediaType, isRevealed) => {
    return (
      <div className="flex h-full w-full gap-6 animate-in fade-in duration-300">
        
        {/* LEFT PANEL: Single Action Button */}
        <div className="w-72 flex flex-col justify-center">
          <button 
            disabled={!mediaUrl}
            onClick={() => handleToggleReveal(person, isRevealed)}
            className={`w-full py-16 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all border-2 active:scale-95 ${
              !mediaUrl 
                ? 'bg-transparent text-zinc-800 border-zinc-900 cursor-not-allowed' 
                : isRevealed 
                  ? 'bg-transparent text-zinc-400 border-zinc-600 hover:text-white hover:border-zinc-400 shadow-lg' 
                  : 'bg-black/60 backdrop-blur-xl text-emerald-500 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:bg-emerald-500/10 hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]'
            }`}
          >
            {isRevealed ? (
              <>
                <EyeOff size={48} strokeWidth={1.5} />
                <span className="text-2xl font-black uppercase tracking-widest">Hide</span>
              </>
            ) : (
              <>
                <Eye size={48} strokeWidth={1.5} />
                <span className="text-2xl font-black uppercase tracking-widest">Show</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT PANEL: The Stage & Curtains */}
        <div className="flex-1 bg-black border-4 border-zinc-800 rounded-2xl shadow-2xl relative overflow-hidden flex items-center justify-center">
          
          {/* Background Media */}
          {mediaUrl ? (
            mediaType === 'video' ? (
              <video 
                src={mediaUrl} 
                autoPlay 
                loop 
                controls 
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <img 
                src={mediaUrl} 
                alt="Meme" 
                className="w-full h-full object-contain p-2"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center opacity-20">
              <Play size={64} className="text-zinc-500 mb-4" />
              <span className="text-2xl font-black uppercase tracking-widest text-zinc-500">Awaiting Upload</span>
            </div>
          )}

          {/* LEFT CURTAIN */}
          <div 
            className={`absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-zinc-900 to-[#18181b] border-r-4 border-amber-500/80 shadow-[10px_0_30px_rgba(0,0,0,0.9)] z-20 transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-end pr-2 ${
              isRevealed ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="w-2 h-full bg-black/30 blur-[1px]"></div>
          </div>

          {/* RIGHT CURTAIN */}
          <div 
            className={`absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-zinc-900 to-[#18181b] border-l-4 border-amber-500/80 shadow-[-10px_0_30px_rgba(0,0,0,0.9)] z-20 transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-start pl-2 ${
              isRevealed ? 'translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="w-2 h-full bg-black/30 blur-[1px]"></div>
          </div>

          {/* Curtain Center Seal (Hides the seam when closed) */}
          <div 
            className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-amber-500/20 blur-md z-30 transition-opacity duration-500 ${
              isRevealed ? 'opacity-0' : 'opacity-100'
            }`}
          ></div>

        </div>

      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full p-4 overflow-hidden relative min-h-0 bg-[#0a0a0c]">
      
      {/* Sub-Navigation Menu */}
      <div className="flex bg-[#141418] border border-zinc-800 rounded-2xl overflow-hidden p-1.5 gap-1.5 shrink-0 mb-4 mx-auto w-full max-w-2xl shadow-lg">
        <button
          onClick={() => setActiveSubTab('COREY')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'COREY' ? 'bg-[#1b75bb] text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
        >
          <ImageIcon size={16} /> {host1Name}&apos;s Play
        </button>
        
        <button
          onClick={() => setActiveSubTab('KYLE')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'KYLE' ? 'bg-[#1b75bb] text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
        >
          <Video size={16} /> {host2Name}&apos;s Play
        </button>
        
        <button
          onClick={() => setActiveSubTab('DNO')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'DNO' ? 'bg-amber-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
        >
          <Trophy size={16} /> DNO Standings
        </button>
      </div>

      {/* Sub-Tab Content Area */}
      <div className="flex-1 relative overflow-hidden min-h-0 flex flex-col">
        
        {activeSubTab === 'COREY' && renderMemeStage('COREY', coreyMediaUrl, coreyMediaType, coreyRevealed)}
        
        {activeSubTab === 'KYLE' && renderMemeStage('KYLE', kyleMediaUrl, kyleMediaType, kyleRevealed)}

        {/* Render the full DNO Leaderboard here */}
        {activeSubTab === 'DNO' && (
          <div className="flex-1 h-full w-full animate-in fade-in duration-300 overflow-y-auto custom-scrollbar pr-2 pb-8">
             <NapkinLeaderboard overrideSeasonLabel="Halftime Leaderboard" />
          </div>
        )}

      </div>
    </div>
  );
}