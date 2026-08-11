"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 

import QandATab from '@/components/stream/tabs/QandATab';
import BoomBustTab from '@/components/stream/tabs/BoomBustTab';
import OvertimeTab from '@/components/stream/tabs/OvertimeTab';
import HalftimeTab from '@/components/stream/tabs/HalftimeTab';
import WaiverTab from '@/components/stream/tabs/WaiverTab';
import PregameTab from '@/components/stream/tabs/PregameTab';

const TABS = [
  { id: 'PREGAME', label: 'P' },
  { id: '1ST Q', label: '1' },
  { id: '2ND Q', label: '2' },
  { id: 'HALFTIME', label: 'H' },
  { id: '3RD Q', label: '3' },
  { id: '4TH Q', label: '4' },
  { id: 'OVERTIME', label: 'OT' }
];

const DRAFT_PICKS = [
  { player_id: 'pick_2025_1', full_name: '2025 1st Round Pick', position: 'PICK', team: 'DRAFT', year: '2025', round: '1st' },
  { player_id: 'pick_2025_2', full_name: '2025 2nd Round Pick', position: 'PICK', team: 'DRAFT', year: '2025', round: '2nd' },
  { player_id: 'pick_2025_3', full_name: '2025 3rd Round Pick', position: 'PICK', team: 'DRAFT', year: '2025', round: '3rd' },
  { player_id: 'pick_2026_1', full_name: '2026 1st Round Pick', position: 'PICK', team: 'DRAFT', year: '2026', round: '1st' },
  { player_id: 'pick_2026_2', full_name: '2026 2nd Round Pick', position: 'PICK', team: 'DRAFT', year: '2026', round: '2nd' },
  { player_id: 'pick_2026_3', full_name: '2026 3rd Round Pick', position: 'PICK', team: 'DRAFT', year: '2026', round: '3rd' },
  { player_id: 'pick_2027_1', full_name: '2027 1st Round Pick', position: 'PICK', team: 'DRAFT', year: '2027', round: '1st' },
  { player_id: 'pick_2027_2', full_name: '2027 2nd Round Pick', position: 'PICK', team: 'DRAFT', year: '2027', round: '2nd' },
  { player_id: 'pick_2027_3', full_name: '2027 3rd Round Pick', position: 'PICK', team: 'DRAFT', year: '2027', round: '3rd' },
  { player_id: 'pick_2028_1', full_name: '2028 1st Round Pick', position: 'PICK', team: 'DRAFT', year: '2028', round: '1st' },
  { player_id: 'pick_2028_2', full_name: '2028 2nd Round Pick', position: 'PICK', team: 'DRAFT', year: '2028', round: '2nd' },
  { player_id: 'pick_2028_3', full_name: '2028 3rd Round Pick', position: 'PICK', team: 'DRAFT', year: '2028', round: '3rd' }
];

const getSuperChatStyle = (tier) => {
  switch(Number(tier)) {
    case 1: return "bg-blue-600 border-blue-400 text-white";
    case 2: return "bg-cyan-500 border-cyan-300 text-black";
    case 3: return "bg-emerald-500 border-emerald-300 text-black";
    case 4: return "bg-yellow-500 border-yellow-300 text-black";
    case 5: return "bg-orange-500 border-orange-300 text-black";
    case 6: return "bg-pink-500 border-pink-300 text-white";
    case 7: return "bg-red-600 border-red-400 text-white";
    default: return "bg-amber-500 border-amber-300 text-black";
  }
};

const extractVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function StreamDashboardPage() {
  const [activeTab, setActiveTab] = useState('1ST Q');
  const [coreyScore, setCoreyScore] = useState(0);
  const [kyleScore, setKyleScore] = useState(0);
  
  const [timerSeconds, setTimerSeconds] = useState(3600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTargetEndTime, setTimerTargetEndTime] = useState(null);
  
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const lastSoundTimeRef = useRef(Date.now());

  // --- GIF ENGINE STATE ---
  const [activeGifUrl, setActiveGifUrl] = useState(null);
  const lastGifTimeRef = useRef(Date.now());
  const gifTimeoutRef = useRef(null);

  const [streamUrl, setStreamUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Waiting for stream connection...');
  const [allChats, setAllChats] = useState([]);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [playerDB, setPlayerDB] = useState({});
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  const pageTokenRef = useRef("");
  const liveChatIdRef = useRef(null);
  const pollingTimeoutRef = useRef(null);
  const isDbLoadedRef = useRef(false);
  const playerDBRef = useRef({});
  const isFetchingRef = useRef(false);
  const parsedCacheRef = useRef({});
  const isFirstFetchRef = useRef(true);

  useEffect(() => {
    playerDBRef.current = playerDB;
  }, [playerDB]);

  useEffect(() => {
    isDbLoadedRef.current = isDbLoaded;
  }, [isDbLoaded]);

  useEffect(() => {
    const loadPlayerDatabases = async () => {
      try {
        let customMap = {};
        try {
          const res = await fetch('/api/dynasty-players');
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.players) {
              data.players.forEach(p => { if (p.sleeper_id) customMap[String(p.sleeper_id)] = p; });
            }
          }
        } catch(e) {}

        const slpRes = await fetch('https://api.sleeper.app/v1/players/nfl');
        if (slpRes.ok) {
          const slpData = await slpRes.json();
          const mergedDB = { ...slpData };
          Object.keys(customMap).forEach(key => {
             if (mergedDB[key]) mergedDB[key] = { ...mergedDB[key], ...customMap[key] };
          });
          setPlayerDB(mergedDB);
        }
      } catch (err) {} finally {
        setIsDbLoaded(true);
      }
    };
    loadPlayerDatabases();
  }, []);

  const resolveNameToId = (name) => {
    if (!name) return null;
    
    const isPick = name.toLowerCase().includes('pick') || /\d/.test(name);
    const cleanName = isPick 
      ? name.toLowerCase().replace(/[^a-z0-9]/g, '')
      : name.toLowerCase().replace(/[^a-z]/g, '').replace(/(jr|sr|ii|iii)$/, '');

    if (isPick) {
      const pickMatch = DRAFT_PICKS.find(p => p.full_name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanName);
      if (pickMatch) return pickMatch.player_id;
    }

    const db = playerDBRef.current;
    
    const players = Object.values(db).filter(p => 
      ['QB', 'RB', 'WR', 'TE', 'K'].includes(p.position)
    ).sort((a, b) => {
      const aActive = a.status === 'Active' ? 1 : 0;
      const bActive = b.status === 'Active' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      
      const aDepth = a.depth_chart_order || 99;
      const bDepth = b.depth_chart_order || 99;
      return aDepth - bDepth;
    });

    const cleanDBName = (str) => (str || '').toLowerCase().replace(/[^a-z]/g, '').replace(/(jr|sr|ii|iii)$/, '');

    for (const p of players) {
      const constructedName = `${p.first_name || ''}${p.last_name || ''}`;
      const dbName = cleanDBName(p.full_name) || cleanDBName(constructedName);
      if (dbName === cleanName || cleanDBName(p.search_full_name) === cleanName) {
        return String(p.player_id);
      }
    }

    for (const p of players) {
      if (cleanDBName(p.last_name) === cleanName || cleanDBName(p.search_last_name) === cleanName) {
        return String(p.player_id);
      }
    }

    for (const p of players) {
      const constructedName = `${p.first_name || ''}${p.last_name || ''}`;
      const dbName = cleanDBName(p.full_name) || cleanDBName(constructedName);
      if (dbName.includes(cleanName)) {
        return String(p.player_id);
      }
    }

    return null;
  };

  const updateFirebaseState = async (updates) => {
    try {
      await setDoc(doc(db, 'stream_state', 'live'), updates, { merge: true });
    } catch (err) {
      console.error("Failed to sync to Firebase:", err);
    }
  };

  useEffect(() => {
    const fetchChat = async () => {
      if (!isDbLoadedRef.current) {
        setConnectionStatus("Loading player databases...");
        pollingTimeoutRef.current = setTimeout(fetchChat, 2000);
        return;
      }

      if (isFetchingRef.current) return;

      const videoId = extractVideoId(streamUrl);
      if (!videoId) {
        setConnectionStatus("⚠️ Invalid YouTube URL");
        setIsConnected(false);
        return;
      }

      isFetchingRef.current = true;

      try {
        let url = `/api/youtube-chat?videoId=${videoId}`;
        if (pageTokenRef.current) url += `&pageToken=${pageTokenRef.current}`;
        if (liveChatIdRef.current) url += `&liveChatId=${liveChatIdRef.current}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (!res.ok || data.error) {
          console.warn("YouTube API Warning/Error:", data.error);
          setConnectionStatus(`⚠️ ${data.error || 'Stream issue detected.'}`);
          
          if (res.status === 404 || res.status === 401) {
            setIsConnected(false);
            liveChatIdRef.current = null;
            pageTokenRef.current = "";
            isFirstFetchRef.current = true; 
            updateFirebaseState({ qa_isConnected: false });
          } else {
            pollingTimeoutRef.current = setTimeout(fetchChat, 10000);
          }
          isFetchingRef.current = false;
          return;
        }

        setConnectionStatus(''); 
        
        if (data.liveChatId) {
          liveChatIdRef.current = data.liveChatId;
        }
        
        if (data.messages && data.messages.length > 0) {
          const messagesToParse = data.messages.slice(-10);
          const parsedMessages = [];

          for (const msg of messagesToParse) {
            
            if (parsedCacheRef.current[msg.id]) {
              parsedMessages.push(parsedCacheRef.current[msg.id]);
              continue; 
            }

            let parsedType = "chat";
            let sideA_Ids = [];
            let sideB_Ids = [];

            if (!isFirstFetchRef.current) {
              try {
                const aiRes = await fetch('/api/parse-chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: msg.text })
                });
                
                if (aiRes.ok) {
                  const aiData = await aiRes.json();
                  if (aiData && !aiData.error) {
                    parsedType = aiData.type || "chat";
                    const rawSideA = aiData.sideA || aiData.sidea || aiData.SideA || [];
                    const rawSideB = aiData.sideB || aiData.sideb || aiData.SideB || [];

                    if (rawSideA.length > 0) sideA_Ids = rawSideA.map(resolveNameToId).filter(id => id !== null);
                    if (rawSideB.length > 0) sideB_Ids = rawSideB.map(resolveNameToId).filter(id => id !== null);
                  }
                } else if (aiRes.status === 429) {
                   console.warn("Gemini Quota Exceeded (429). Bypassing AI for this message.");
                }
              } catch(e) {
                console.error("Gemini parse error:", e);
              }
            }

            const finalMsg = {
              id: msg.id,
              user: msg.user,
              avatar: msg.avatar,
              text: msg.text,
              amount: msg.amount,
              color: msg.isSuperChat ? getSuperChatStyle(msg.youtubeColorTier) : null,
              type: parsedType,
              sideA: sideA_Ids,
              sideB: sideB_Ids
            };

            parsedCacheRef.current[msg.id] = finalMsg;
            parsedMessages.push(finalMsg);
          }

          isFirstFetchRef.current = false;

          setAllChats(prev => {
            const merged = [...parsedMessages, ...prev];
            const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
            return unique.slice(0, 100);
          }); 
          
          const newSupers = parsedMessages.filter(m => m.amount);
          if (newSupers.length > 0) {
            setPriorityQueue(prev => {
              const merged = [...prev, ...newSupers];
              const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
              updateFirebaseState({ qa_priorityQueue: unique });
              return unique;
            });
          }
        }

        pageTokenRef.current = data.nextPageToken || pageTokenRef.current;
        const nextPollInterval = data.pollingIntervalMillis || 5000;
        
        isFetchingRef.current = false;
        pollingTimeoutRef.current = setTimeout(fetchChat, nextPollInterval);

      } catch (err) {
        console.error("Polling error:", err);
        setConnectionStatus("⚠️ Network error fetching chat.");
        isFetchingRef.current = false;
        pollingTimeoutRef.current = setTimeout(fetchChat, 10000); 
      }
    };

    if (isConnected && streamUrl) {
      setConnectionStatus("Connecting to YouTube API...");
      fetchChat();
    } else {
      setConnectionStatus("Waiting for stream connection...");
      clearTimeout(pollingTimeoutRef.current);
      liveChatIdRef.current = null;
      pageTokenRef.current = "";
      isFirstFetchRef.current = true; 
    }

    return () => clearTimeout(pollingTimeoutRef.current);
  }, [isConnected, streamUrl]); 

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stream_state', 'live'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        if (data.coreyScore !== undefined) setCoreyScore(data.coreyScore);
        if (data.kyleScore !== undefined) setKyleScore(data.kyleScore);
        if (data.dashboardTab !== undefined) setActiveTab(data.dashboardTab);
        if (data.isTimerRunning !== undefined) setIsTimerRunning(data.isTimerRunning);
        if (data.timerTargetEndTime !== undefined) setTimerTargetEndTime(data.timerTargetEndTime);
        if (data.timerSeconds !== undefined && !data.isTimerRunning) {
          setTimerSeconds(data.timerSeconds);
        }
        
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

        // --- GLOBAL GIF LISTENER ---
        if (data.gifTriggeredAt && data.gifTriggeredAt > lastGifTimeRef.current) {
          lastGifTimeRef.current = data.gifTriggeredAt;
          if (data.activeGif) {
            if (gifTimeoutRef.current) clearTimeout(gifTimeoutRef.current);
            setActiveGifUrl(data.activeGif);
            
            // Auto-hide GIF after 2.5 seconds (2500ms)
            gifTimeoutRef.current = setTimeout(() => {
              setActiveGifUrl(null);
            }, 2500);
          }
        }

        if (data.qa_streamUrl !== undefined) setStreamUrl(data.qa_streamUrl);
        if (data.qa_isConnected !== undefined) setIsConnected(data.qa_isConnected);
        if (data.qa_priorityQueue !== undefined) setPriorityQueue(data.qa_priorityQueue);
      }
    });

    return () => {
      unsub();
      if (gifTimeoutRef.current) clearTimeout(gifTimeoutRef.current);
    };
  }, []);

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
      if (timerSeconds > 0) {
        updateFirebaseState({ isTimerRunning: true, timerTargetEndTime: Date.now() + (timerSeconds * 1000) });
      }
    }
  };

  const handleResetClock = (e) => {
    e.stopPropagation();
    setTimerSeconds(3600);
    setIsTimerRunning(false);
    updateFirebaseState({ isTimerRunning: false, timerSeconds: 3600, timerTargetEndTime: null });
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
      className="h-screen overflow-hidden bg-[#0a0a0c] flex flex-col font-sans relative"
      onClick={handleGlobalClick}
    >
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
      
      {/* 1. TOP SCOREBOARD HEADER */}
      <div className="flex items-center justify-between px-8 pt-4 pb-4 w-full relative z-20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] bg-[#0a0a0c] border-b border-zinc-900 shrink-0 gap-6">
        
        <div className="flex-1 flex items-center justify-center">
          <img 
            src="https://admin.fsan.com/wp-content/uploads/2026/08/FFCK-Logo.webp" 
            alt="FFCK" 
            className="max-h-[65px] w-auto object-contain drop-shadow-lg"
          />
        </div>

        {/* Center Scoreboard */}
        <div className="flex items-center justify-between px-8 py-4 bg-[#0c121c] border-4 border-[#18202b] rounded-[1.25rem] shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] max-w-[850px] w-full relative overflow-hidden shrink-0">
          
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

          {/* Master Time */}
          <div className="flex flex-col items-center px-2 z-10 w-[260px] relative">
            <div 
              className="flex flex-col items-center cursor-pointer group w-full" 
              onClick={handleToggleMasterClock} 
              title="Click to Start/Pause Timer"
            >
              <span className="text-[15px] font-black text-white uppercase tracking-[0.2em] mb-1.5 drop-shadow-md">
                TIME
              </span>
              <span className="text-7xl text-amber-500 led-font leading-none drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] tracking-widest group-hover:brightness-125 transition-all">
                {formatTime(timerSeconds)}
              </span>
            </div>
            
            {!isTimerRunning && timerSeconds < 3600 && (
              <button 
                onClick={handleResetClock}
                className="absolute -bottom-1 right-2 text-zinc-500 hover:text-white bg-zinc-900/80 p-1 rounded transition-colors border border-zinc-700"
                title="Reset to 60:00"
              >
                <RotateCcw size={14} />
              </button>
            )}
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

        <div className="flex-1 flex items-center justify-center">
          <img 
            src="https://admin.fsan.com/wp-content/uploads/2026/08/Weekly-Kickoff-on-transparent.webp" 
            alt="Weekly Kickoff" 
            className="max-h-[90px] w-auto object-contain drop-shadow-lg"
          />
        </div>

      </div>

      {/* 2. ACTIVE TAB CONTENT */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0a0c] min-h-0">
        {activeTab === 'PREGAME' && <PregameTab />}
        {activeTab === '1ST Q' && <BoomBustTab />}
        
        {(activeTab === '2ND Q' || activeTab === '3RD Q') && (
          <QandATab 
            streamUrl={streamUrl}
            setStreamUrl={setStreamUrl}
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            connectionStatus={connectionStatus}
            allChats={allChats}
            priorityQueue={priorityQueue}
            setPriorityQueue={setPriorityQueue}
            playerDB={playerDB}
            updateFirebaseState={updateFirebaseState}
          />
        )}
        
        {activeTab === 'HALFTIME' && <HalftimeTab />}

        {activeTab === '4TH Q' && <WaiverTab />}

        {activeTab === 'OVERTIME' && (
          <OvertimeTab 
            streamUrl={streamUrl}
            setStreamUrl={setStreamUrl}
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            connectionStatus={connectionStatus}
            allChats={allChats}
            priorityQueue={priorityQueue}
            setPriorityQueue={setPriorityQueue}
            playerDB={playerDB}
            updateFirebaseState={updateFirebaseState}
          />
        )}
        
        {activeTab !== 'PREGAME' && activeTab !== '1ST Q' && activeTab !== '2ND Q' && activeTab !== '3RD Q' && activeTab !== 'HALFTIME' && activeTab !== '4TH Q' && activeTab !== 'OVERTIME' && (
          <div className="flex h-full items-center justify-center text-zinc-600 font-black uppercase tracking-widest text-xl">
            {activeTab} Content Area
          </div>
        )}
      </div>

      {/* 3. GLOBAL GIF OVERLAY */}
      {activeGifUrl && (
        <div className="absolute inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden pb-[5%]">
          <img 
            src={activeGifUrl} 
            alt="Reaction GIF" 
            className="relative z-10 h-[60vh] xl:h-[75vh] w-auto max-w-[95vw] object-contain rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.9)] border-[6px] border-[#18202b] animate-in zoom-in-75 slide-in-from-bottom-12 duration-500" 
          />
        </div>
      )}

    </div>
  );
}