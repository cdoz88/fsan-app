"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Settings, X, MessageSquare, Rocket, PlaySquare, TrendingUp, Upload, Loader2, Trash2, Maximize2 } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const RUN_OF_SHOW = [
  { title: 'The Pregame', desc: 'Roll Call & Rundown', icon: MessageSquare, color: 'text-zinc-400' },
  { title: '1st Quarter', desc: 'Boom / Bust', icon: Rocket, color: 'text-emerald-500' },
  { title: '2nd Quarter', desc: 'Live Q&A', icon: MessageSquare, color: 'text-[#1b75bb]' },
  { title: 'Halftime', desc: 'Entertainment & DNO Standings', icon: PlaySquare, color: 'text-amber-500' },
  { title: '3rd Quarter', desc: 'Live Q&A', icon: MessageSquare, color: 'text-[#1b75bb]' },
  { title: '4th Quarter', desc: 'The Waiver Wire', icon: TrendingUp, color: 'text-red-500' },
  { title: 'Overtime', desc: 'Final Q&A - Super Chats Only', icon: MessageSquare, color: 'text-cyan-400' }
];

export default function PregameTab() {
  const [showSettings, setShowSettings] = useState(false);
  const [expandedAd, setExpandedAd] = useState(null); // Tracks which ad is full-screen
  
  // Ad Spaces State
  const [ad1Url, setAd1Url] = useState(null);
  const [ad2Url, setAd2Url] = useState(null);
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  const ad1FileRef = useRef(null);
  const ad2FileRef = useRef(null);

  // Sync Ads from Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stream_state', 'live'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.pregameAd1 !== undefined) setAd1Url(data.pregameAd1);
        if (data.pregameAd2 !== undefined) setAd2Url(data.pregameAd2);
        
        // Sync expanded ad state across clients
        if (data.pregameExpandedAd !== undefined) setExpandedAd(data.pregameExpandedAd);
      }
    });
    return () => unsub();
  }, []);

  const updateFirebaseState = async (updates) => {
    try {
      await setDoc(doc(db, 'stream_state', 'live'), updates, { merge: true });
    } catch (err) {
      console.error("Failed to sync state to Firebase:", err);
    }
  };

  // Handle Image Uploads
  const handleFileUpload = async (e, slot) => {
    const file = e.target.files[0];
    if (!file) return;

    // We overwrite the same file path so it stays clean in Firebase Storage
    const storageRef = ref(storage, `pregame/ad_space_${slot}`);

    if (slot === 1) setUploading1(true);
    else setUploading2(true);

    try {
      await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Append timestamp to break browser cache so the new image shows instantly
      const cacheBustedURL = `${downloadURL}&t=${Date.now()}`;

      await updateFirebaseState({ [`pregameAd${slot}`]: cacheBustedURL });

    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      if (slot === 1) setUploading1(false);
      else setUploading2(false);
      
      // Reset input value so the same file can be uploaded again if needed
      e.target.value = null;
    }
  };

  const handleClearAd = async (slot) => {
    await updateFirebaseState({ [`pregameAd${slot}`]: null });
  };

  const handleToggleExpand = (adUrl) => {
    const newAdState = expandedAd === adUrl ? null : adUrl;
    setExpandedAd(newAdState);
    updateFirebaseState({ pregameExpandedAd: newAdState });
  };

  return (
    <div className="h-full w-full bg-[#0a0a0c] flex flex-col p-8 relative overflow-hidden font-sans select-none animate-in fade-in duration-500">
      
      {/* Super Discreet Settings Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-4 right-4 z-50 text-zinc-800 hover:text-zinc-600 p-2 transition-colors"
        title="Setup Pregame"
      >
        <Settings size={20} />
      </button>

      <div className="flex-1 flex w-full max-w-6xl mx-auto gap-12 relative z-10 pt-4 pb-4 h-full">
        
        {/* LEFT SIDE: RUN OF SHOW TIMELINE */}
        <div className="flex-1 flex flex-col justify-center h-full">
          <div className="bg-black/40 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1b75bb]/10 rounded-full blur-[100px] pointer-events-none" />
            
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
              <span className="w-3 h-8 bg-[#1b75bb] rounded-full"></span> Run of Show
            </h2>

            <div className="flex flex-col gap-6 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-zinc-800 z-0" />

              {RUN_OF_SHOW.map((segment, idx) => {
                const Icon = segment.icon;
                return (
                  <div key={idx} className="flex items-center gap-6 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center shrink-0 shadow-md">
                      <Icon size={18} className={segment.color} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-black uppercase tracking-widest text-lg leading-tight">
                        {segment.title}
                      </span>
                      <span className="text-zinc-500 font-bold uppercase tracking-wider text-xs">
                        {segment.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: TWO AD SPACES */}
        <div className="flex-1 flex flex-col justify-center gap-6 h-full">
          
          {/* Ad Space 1 */}
          {ad1Url && (
            <div 
              onClick={() => handleToggleExpand(ad1Url)}
              className="flex-1 bg-black/40 border border-zinc-800/80 rounded-3xl p-2 shadow-2xl relative overflow-hidden flex items-center justify-center group cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <img src={ad1Url} alt="Sponsor 1" className="w-full h-full object-contain drop-shadow-xl" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-6">
                <div className="bg-black/80 p-3 rounded-full text-white backdrop-blur-sm border border-zinc-700 shadow-xl">
                  <Maximize2 size={24} />
                </div>
              </div>
            </div>
          )}

          {/* Ad Space 2 */}
          {ad2Url && (
            <div 
              onClick={() => handleToggleExpand(ad2Url)}
              className="flex-1 bg-black/40 border border-zinc-800/80 rounded-3xl p-2 shadow-2xl relative overflow-hidden flex items-center justify-center group cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <img src={ad2Url} alt="Sponsor 2" className="w-full h-full object-contain drop-shadow-xl" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-6">
                <div className="bg-black/80 p-3 rounded-full text-white backdrop-blur-sm border border-zinc-700 shadow-xl">
                  <Maximize2 size={24} />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* FULL SCREEN AD MODAL */}
      {expandedAd && (
        <div 
          onClick={() => handleToggleExpand(null)}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300 cursor-pointer"
        >
          <button 
            onClick={(e) => { e.stopPropagation(); handleToggleExpand(null); }}
            className="absolute top-8 right-8 bg-zinc-900/80 p-3 rounded-full text-zinc-400 hover:text-white border border-zinc-700 transition-colors z-50 shadow-2xl"
          >
            <X size={32} />
          </button>
          <img 
            src={expandedAd} 
            alt="Expanded Sponsor" 
            className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl pointer-events-none" 
          />
        </div>
      )}

      {/* SETUP MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6 relative">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Setup Pregame Ads</h2>
              <button onClick={() => setShowSettings(false)} className="bg-zinc-800 p-2 rounded-full text-zinc-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              
              {/* Top Ad Upload */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Top Ad Space</span>
                  {ad1Url && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded uppercase font-bold tracking-widest">Active</span>}
                </div>
                
                <input type="file" accept="image/*" className="hidden" ref={ad1FileRef} onChange={(e) => handleFileUpload(e, 1)} />
                
                <button 
                  onClick={() => ad1FileRef.current?.click()} 
                  disabled={uploading1} 
                  className="w-full bg-black border border-dashed border-zinc-600 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {uploading1 ? <Loader2 size={24} className="animate-spin text-emerald-500" /> : <Upload size={24} className="text-zinc-500" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {uploading1 ? "Uploading to Cloud..." : "Upload Top Image"}
                  </span>
                </button>

                {ad1Url && (
                  <button 
                    onClick={() => handleClearAd(1)}
                    className="w-full flex items-center justify-center gap-2 py-2 mt-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} /> Clear Image
                  </button>
                )}
              </div>

              {/* Bottom Ad Upload */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Bottom Ad Space</span>
                  {ad2Url && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded uppercase font-bold tracking-widest">Active</span>}
                </div>
                
                <input type="file" accept="image/*" className="hidden" ref={ad2FileRef} onChange={(e) => handleFileUpload(e, 2)} />
                
                <button 
                  onClick={() => ad2FileRef.current?.click()} 
                  disabled={uploading2} 
                  className="w-full bg-black border border-dashed border-zinc-600 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {uploading2 ? <Loader2 size={24} className="animate-spin text-emerald-500" /> : <Upload size={24} className="text-zinc-500" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {uploading2 ? "Uploading to Cloud..." : "Upload Bottom Image"}
                  </span>
                </button>

                {ad2Url && (
                  <button 
                    onClick={() => handleClearAd(2)}
                    className="w-full flex items-center justify-center gap-2 py-2 mt-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} /> Clear Image
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}