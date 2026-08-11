"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Volume2, Flame, Award, Image as ImageIcon, Upload, Loader2, Eye, EyeOff, PlaySquare, Search, RotateCcw } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase'; 
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function MobileRemotePage() {
  const [coreyScore, setCoreyScore] = useState(0);
  const [kyleScore, setKyleScore] = useState(0);
  const [activeSound, setActiveSound] = useState(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('sounds'); // 'sounds', 'gifs', 'halftime'

  // Halftime State
  const [coreyMediaUrl, setCoreyMediaUrl] = useState(null);
  const [coreyRevealed, setCoreyRevealed] = useState(false);
  const [coreyUploading, setCoreyUploading] = useState(false);
  
  const [kyleMediaUrl, setKyleMediaUrl] = useState(null);
  const [kyleRevealed, setKyleRevealed] = useState(false);
  const [kyleUploading, setKyleUploading] = useState(false);

  const coreyFileRef = useRef(null);
  const kyleFileRef = useRef(null);

  // GIF Engine State
  const [gifSearchTerm, setGifSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [isSearchingGifs, setIsSearchingGifs] = useState(false);

  // Initial load of trending GIFs
  useEffect(() => {
    const loadTrendingGifs = async () => {
      setIsSearchingGifs(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'GlVGYHqc3SyXX10vJ1D4w4w474tT0fDI'; 
        const res = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=24&rating=pg-13`);
        const json = await res.json();
        setGifs(json.data || []);
      } catch (error) {
        console.error("Trending GIF fetch failed:", error);
      } finally {
        setIsSearchingGifs(false);
      }
    };
    
    loadTrendingGifs();
  }, []);

  // Sync state from Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stream_state', 'live'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.coreyScore !== undefined) setCoreyScore(data.coreyScore);
        if (data.kyleScore !== undefined) setKyleScore(data.kyleScore);
        
        // Sync Halftime Media
        if (data.coreyMediaUrl !== undefined) setCoreyMediaUrl(data.coreyMediaUrl);
        if (data.coreyRevealed !== undefined) setCoreyRevealed(data.coreyRevealed);
        if (data.kyleMediaUrl !== undefined) setKyleMediaUrl(data.kyleMediaUrl);
        if (data.kyleRevealed !== undefined) setKyleRevealed(data.kyleRevealed);
      }
    });
    return () => unsub();
  }, []);

  const updateFirebase = async (updates) => {
    try {
      await setDoc(doc(db, 'stream_state', 'live'), updates, { merge: true });
    } catch (err) {
      console.error("Failed to sync:", err);
    }
  };

  const handleScoreChange = (person, currentScore, change) => {
    const newScore = Math.max(0, currentScore + change);
    updateFirebase({ [`${person}Score`]: newScore });
  };

  const handleResetScores = () => {
    updateFirebase({ coreyScore: 0, kyleScore: 0 });
  };

  const handleTriggerSound = (soundId) => {
    setActiveSound(soundId);
    updateFirebase({ lastSound: soundId, soundTriggeredAt: Date.now() });
    setTimeout(() => setActiveSound(null), 400); 
  };

  const handleTriggerGif = (gifUrl) => {
    updateFirebase({ activeGif: gifUrl, gifTriggeredAt: Date.now() });
    // Visual feedback on mobile
    setActiveSound(gifUrl); 
    setTimeout(() => setActiveSound(null), 400);
  };

  const searchGiphy = async (query) => {
    if (!query) return;
    setIsSearchingGifs(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'GlVGYHqc3SyXX10vJ1D4w4w474tT0fDI'; 
      const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=24&rating=pg-13`);
      const json = await res.json();
      setGifs(json.data || []);
    } catch (error) {
      console.error("GIF search failed:", error);
    } finally {
      setIsSearchingGifs(false);
    }
  };

  // --- FIREBASE STORAGE UPLOAD LOGIC ---
  const handleFileUpload = async (e, person) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const mediaType = isVideo ? 'video' : 'image';
    
    // Hardcoded filename overwrites the old one
    const storageRef = ref(storage, `halftime/${person.toLowerCase()}_media`);

    if (person === 'COREY') setCoreyUploading(true);
    else setKyleUploading(true);

    try {
      await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Append timestamp to break cache
      const cacheBustedURL = `${downloadURL}&t=${Date.now()}`;

      await updateFirebase({
        [`${person.toLowerCase()}MediaUrl`]: cacheBustedURL,
        [`${person.toLowerCase()}MediaType`]: mediaType,
        [`${person.toLowerCase()}Revealed`]: false // Always hide upon fresh upload
      });

    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      if (person === 'COREY') setCoreyUploading(false);
      else setKyleUploading(false);
    }
  };

  // --- SOUNDBOARD CONFIGURATION ---
  // The 'id' must exactly match the file name (without .mp3)
  const SOUNDS = [
    { id: 'airhorn', label: 'Airhorn', emoji: '🚨', color: 'from-amber-600 to-red-600 border-amber-500' },
    { id: 'applause', label: 'Applause', emoji: '👏', color: 'from-emerald-600 to-teal-700 border-emerald-500' },
    { id: 'correct', label: 'Correct', emoji: '✅', color: 'from-blue-600 to-indigo-800 border-blue-500' },
    { id: 'wrong', label: 'Wrong', emoji: '❌', color: 'from-rose-700 to-pink-900 border-rose-500' },
    { id: 'cha-ching', label: 'Cha-Ching', emoji: '💰', color: 'from-green-600 to-emerald-800 border-green-400' },
    { id: 'crickets', label: 'Crickets', emoji: '🦗', color: 'from-zinc-700 to-zinc-900 border-zinc-600' },
    { id: 'ba-dum-tss', label: 'Ba-Dum-Tss', emoji: '🥁', color: 'from-purple-700 to-fuchsia-900 border-purple-500' },
    { id: 'dundundun', label: 'Dun Dun Dun', emoji: '😱', color: 'from-cyan-700 to-blue-900 border-cyan-500' },
  ];

  return (
    <div className="h-screen w-full bg-[#0a0a0c] text-white flex flex-col p-4 select-none overflow-hidden">
      
      {/* SCORES (Persistent) */}
      <div className="grid grid-cols-2 gap-4 mb-4 shrink-0 relative">
        
        {/* DISCRETE RESET BUTTON */}
        <button 
          onClick={handleResetScores}
          className="absolute left-1/2 top-3 -translate-x-1/2 z-10 bg-[#141418] border border-zinc-700 text-zinc-500 hover:text-white p-1.5 rounded-full transition-all active:scale-90 shadow-xl"
          title="Reset Scores"
        >
          <RotateCcw size={14} />
        </button>

        <div className="bg-[#141418] border-2 border-amber-500/40 rounded-2xl p-4 flex flex-col items-center justify-between shadow-xl relative overflow-hidden">
          <div className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Flame size={14} /> COREY
          </div>
          <div className="text-6xl font-black my-2 font-mono tracking-tight text-white drop-shadow-md">
            {coreyScore.toString().padStart(2, '0')}
          </div>
          <div className="grid grid-cols-2 gap-2 w-full mt-2">
            <button onClick={() => handleScoreChange('corey', coreyScore, -1)} className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 rounded-xl py-4 flex items-center justify-center border border-zinc-700 font-bold transition-all"><Minus size={24} /></button>
            <button onClick={() => handleScoreChange('corey', coreyScore, 1)} className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl py-4 flex items-center justify-center border border-amber-400 font-bold shadow-lg transition-all"><Plus size={24} /></button>
          </div>
        </div>

        <div className="bg-[#141418] border-2 border-cyan-500/40 rounded-2xl p-4 flex flex-col items-center justify-between shadow-xl relative overflow-hidden">
          <div className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Award size={14} /> KYLE
          </div>
          <div className="text-6xl font-black my-2 font-mono tracking-tight text-white drop-shadow-md">
            {kyleScore.toString().padStart(2, '0')}
          </div>
          <div className="grid grid-cols-2 gap-2 w-full mt-2">
            <button onClick={() => handleScoreChange('kyle', kyleScore, -1)} className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 rounded-xl py-4 flex items-center justify-center border border-zinc-700 font-bold transition-all"><Minus size={24} /></button>
            <button onClick={() => handleScoreChange('kyle', kyleScore, 1)} className="bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white rounded-xl py-4 flex items-center justify-center border border-cyan-400 font-bold shadow-lg transition-all"><Plus size={24} /></button>
          </div>
        </div>
      </div>

      {/* TABS MENU */}
      <div className="flex bg-[#141418] border border-zinc-800 rounded-2xl p-1.5 mb-4 shrink-0 shadow-md">
        <button onClick={() => setActiveTab('sounds')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'sounds' ? 'bg-zinc-800 text-amber-400 shadow-md' : 'text-zinc-500'}`}>
          <Volume2 size={16} /> Sounds
        </button>
        <button onClick={() => setActiveTab('gifs')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'gifs' ? 'bg-zinc-800 text-emerald-400 shadow-md' : 'text-zinc-500'}`}>
          <ImageIcon size={16} /> GIFs
        </button>
        <button onClick={() => setActiveTab('halftime')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'halftime' ? 'bg-zinc-800 text-[#1b75bb] shadow-md' : 'text-zinc-500'}`}>
          <PlaySquare size={16} /> Halftime
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 bg-[#141418] border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col min-h-0">
        
        {/* SOUNDS TAB */}
        {activeTab === 'sounds' && (
          <div className="grid grid-cols-2 gap-3 h-full overflow-y-auto custom-scrollbar pr-1 content-start">
            {SOUNDS.map((snd) => (
              <button
                key={snd.id}
                onClick={() => handleTriggerSound(snd.id)}
                className={`relative bg-gradient-to-br ${snd.color} border p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 active:brightness-125 min-h-[90px]
                  ${activeSound === snd.id ? 'ring-4 ring-white scale-95 brightness-150' : ''}
                `}
              >
                <span className="text-3xl mb-1 drop-shadow-md">{snd.emoji}</span>
                <span className="text-sm font-black uppercase tracking-wider text-white drop-shadow-md">{snd.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* GIFS TAB */}
        {activeTab === 'gifs' && (
          <div className="flex flex-col h-full overflow-hidden">
            <form 
              onSubmit={(e) => { e.preventDefault(); searchGiphy(gifSearchTerm); }}
              className="flex gap-2 mb-4 shrink-0"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="text" 
                  value={gifSearchTerm}
                  onChange={(e) => setGifSearchTerm(e.target.value)}
                  placeholder="Search GIFs..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
              <button 
                type="submit"
                disabled={isSearchingGifs}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 rounded-xl font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {isSearchingGifs ? <Loader2 size={16} className="animate-spin" /> : 'Find'}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="columns-2 gap-3 w-full pb-4">
                {gifs.map(gif => (
                  <button 
                    key={gif.id}
                    onClick={() => handleTriggerGif(gif.images.original.url)}
                    className={`w-full mb-3 break-inside-avoid relative bg-black rounded-xl overflow-hidden border-2 transition-all active:scale-90 flex items-center justify-center ${activeSound === gif.images.original.url ? 'border-emerald-400 ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'border-zinc-800 hover:border-zinc-600'}`}
                  >
                    <img src={gif.images.fixed_height.url} alt={gif.title} className="w-full h-auto object-cover" />
                  </button>
                ))}
              </div>
              
              {gifs.length === 0 && !isSearchingGifs && (
                <div className="w-full flex flex-col items-center justify-center py-12 opacity-40">
                  <ImageIcon size={48} className="mb-3 text-emerald-500" />
                  <h3 className="text-lg font-black uppercase tracking-widest text-zinc-400">GIF Engine</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1 text-center">Trending GIFs failed to load.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HALFTIME TAB */}
        {activeTab === 'halftime' && (
          <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 h-full">
            
            {/* Corey Upload Section */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex flex-col gap-3">
              <div className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center justify-between">
                <span>Corey's Halftime Media</span>
                {coreyMediaUrl && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Media Ready</span>}
              </div>
              
              <input type="file" accept="image/*,video/*" className="hidden" ref={coreyFileRef} onChange={(e) => handleFileUpload(e, 'COREY')} />
              
              <button onClick={() => coreyFileRef.current?.click()} disabled={coreyUploading} className="w-full bg-black border border-dashed border-zinc-600 hover:border-amber-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50">
                {coreyUploading ? <Loader2 size={24} className="animate-spin text-amber-500" /> : <Upload size={24} className="text-zinc-500" />}
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {coreyUploading ? "Uploading to Cloud..." : "Upload New File"}
                </span>
              </button>

              <button 
                disabled={!coreyMediaUrl}
                onClick={() => updateFirebase({ coreyRevealed: !coreyRevealed })}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-colors shadow-lg
                  ${!coreyMediaUrl ? 'bg-zinc-800 text-zinc-600' : coreyRevealed ? 'bg-zinc-200 text-black hover:bg-white' : 'bg-amber-600 text-white hover:bg-amber-500'}
                `}
              >
                {coreyRevealed ? <><EyeOff size={16} /> Hide Curtains</> : <><Eye size={16} /> Reveal on Stream!</>}
              </button>
            </div>

            {/* Kyle Upload Section */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex flex-col gap-3">
              <div className="text-xs font-black uppercase tracking-widest text-cyan-500 flex items-center justify-between">
                <span>Kyle's Halftime Media</span>
                {kyleMediaUrl && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Media Ready</span>}
              </div>
              
              <input type="file" accept="image/*,video/*" className="hidden" ref={kyleFileRef} onChange={(e) => handleFileUpload(e, 'KYLE')} />
              
              <button onClick={() => kyleFileRef.current?.click()} disabled={kyleUploading} className="w-full bg-black border border-dashed border-zinc-600 hover:border-cyan-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50">
                {kyleUploading ? <Loader2 size={24} className="animate-spin text-cyan-500" /> : <Upload size={24} className="text-zinc-500" />}
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {kyleUploading ? "Uploading to Cloud..." : "Upload New File"}
                </span>
              </button>

              <button 
                disabled={!kyleMediaUrl}
                onClick={() => updateFirebase({ kyleRevealed: !kyleRevealed })}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-colors shadow-lg
                  ${!kyleMediaUrl ? 'bg-zinc-800 text-zinc-600' : kyleRevealed ? 'bg-zinc-200 text-black hover:bg-white' : 'bg-cyan-600 text-white hover:bg-cyan-500'}
                `}
              >
                {kyleRevealed ? <><EyeOff size={16} /> Hide Curtains</> : <><Eye size={16} /> Reveal on Stream!</>}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}