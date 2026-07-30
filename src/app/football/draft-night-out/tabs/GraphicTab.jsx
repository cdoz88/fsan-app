"use client";
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas-pro';
import { Search, Loader2, Download, AlertCircle, Share2, Copy, Check, CheckCircle2 } from 'lucide-react';

export default function GraphicTab() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  
  const [teamData, setTeamData] = useState(null);
  const [starters, setStarters] = useState([]);
  const [bench, setBench] = useState([]);
  const [draftPicks, setDraftPicks] = useState({}); 
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [graphicBlob, setGraphicBlob] = useState(null);
  
  const [playerDB, setPlayerDB] = useState({});
  const [dbLoading, setDbLoading] = useState(true);

  const graphicRef = useRef(null);
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const dnoBgUrl = `${baseUrl}/images/DNO-Background.webp`;
  const dnoLogoUrl = `${baseUrl}/images/DNO-Logo_Logo.webp`;

  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current && wrapperRef.current.parentElement) {
        const parentWidth = wrapperRef.current.parentElement.clientWidth;
        setScale(Math.min(1, (parentWidth - 2) / 1080));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    const timeout = setTimeout(updateScale, 150);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timeout);
    };
  }, [starters]);

  useEffect(() => {
    const loadPlayerDatabases = async () => {
      try {
        let customMap = {};
        
        try {
          const res = await fetch('/api/dynasty-players');
          const data = await res.json();
          if (data.success && data.players) {
            data.players.forEach(p => {
              if (p.sleeper_id) customMap[String(p.sleeper_id)] = p;
            });
          }
        } catch(e) { console.warn("Custom DB fetch failed", e); }

        const slpRes = await fetch('https://api.sleeper.app/v1/players/nfl');
        const slpData = await slpRes.json();
        
        const mergedDB = { ...slpData };
        Object.keys(customMap).forEach(key => {
           if (mergedDB[key]) {
             mergedDB[key] = { ...mergedDB[key], ...customMap[key] };
           }
        });
        
        setPlayerDB(mergedDB);
      } catch (err) {
        console.warn("Could not load player databases:", err);
      } finally {
        setDbLoading(false);
      }
    };
    
    loadPlayerDatabases();
  }, []);

  useEffect(() => {
    if (!username || username.trim().length < 3) {
       setLeagues([]);
       setSelectedLeague('');
       setTeamData(null);
       setStarters([]);
       setBench([]);
       setError('');
       return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchSleeperLeagues();
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    if (starters.length > 0 && teamData && graphicRef.current) {
      setGenerating(true);
      setGraphicBlob(null);

      const timer = setTimeout(async () => {
        try {
          const canvas = await html2canvas(graphicRef.current, {
            useCORS: true,
            allowTaint: true,
            scale: 2,
            backgroundColor: '#09090b',
            logging: false
          });
          
          canvas.toBlob((blob) => {
            setGraphicBlob(blob);
            setGenerating(false);
          }, 'image/png');
        } catch (err) {
          console.error("Pre-generation failed:", err);
          setGenerating(false);
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [starters, bench, teamData]);

  const fetchSleeperLeagues = async () => {
    setLoading(true);
    setError('');
    setLeagues([]);
    setSelectedLeague('');
    setTeamData(null);
    setStarters([]);
    setBench([]);
    setDraftPicks({});
    setGraphicBlob(null);

    try {
      const userRes = await fetch(`https://api.sleeper.app/v1/user/${username.trim()}`);
      if (!userRes.ok) throw new Error('Username not found');
      
      const userData = await userRes.json();
      if (!userData || !userData.user_id) throw new Error('Username not found');
      
      const dnoPoolRes = await fetch(`/api/scl?type=dno_pool&t=${Date.now()}`);
      const dnoPoolData = await dnoPoolRes.json();
      const validDnoLeagueIds = new Set((dnoPoolData.leagues || []).map(l => String(l.id)));

      const leaguesRes = await fetch(`https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/2026`);
      if (!leaguesRes.ok) throw new Error('Could not fetch Sleeper leagues.');
      const userLeagues = await leaguesRes.json();

      const matchingDnoLeagues = userLeagues.filter(l => {
        const inWpPool = validDnoLeagueIds.has(String(l.league_id));
        const hasDnoName = l.name && (l.name.toUpperCase().includes('DNO') || l.name.toUpperCase().includes('DRAFT NIGHT OUT'));
        return inWpPool || hasDnoName;
      });
      
      if (matchingDnoLeagues.length === 0) {
        throw new Error('No active Draft Night Out 2026 leagues found for this Sleeper account.');
      }

      setLeagues(matchingDnoLeagues);
      setTeamData({ 
        userId: userData.user_id, 
        username: userData.username || userData.display_name, 
        displayName: userData.display_name, 
        avatar: userData.avatar 
      });
    } catch (err) {
      if (err.message.includes('properties of null')) {
          setError('Username not found');
      } else {
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueSelect = async (leagueId) => {
    setSelectedLeague(leagueId);
    if (!leagueId) {
      setStarters([]);
      setBench([]);
      setDraftPicks({});
      setGraphicBlob(null);
      return;
    }

    setLoading(true);
    setGraphicBlob(null);
    try {
      const activeLeague = leagues.find(l => l.league_id === leagueId);
      
      const rostersRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
      const rosters = await rostersRes.json();
      
      const myRoster = rosters.find(r => r.owner_id === teamData.userId);
      if (!myRoster) throw new Error('Could not find your roster in this DNO division.');

      const usersRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
      const users = await usersRes.json();
      const me = users.find(u => u.user_id === teamData.userId);

      setTeamData(prev => ({
        ...prev,
        leagueName: activeLeague.name,
        teamName: me?.metadata?.team_name || prev.displayName || prev.username
      }));

      let pickMap = {};
      try {
        const draftId = activeLeague.draft_id;
        if (draftId) {
          const picksRes = await fetch(`https://api.sleeper.app/v1/draft/${draftId}/picks`);
          if (picksRes.ok) {
            const picks = await picksRes.json();
            const posCounts = {};

            picks.forEach(p => {
              if (p.player_id) {
                const pos = p.metadata?.position || playerDB[p.player_id]?.position || 'FLEX';
                posCounts[pos] = (posCounts[pos] || 0) + 1;
                
                const slotFormatted = p.draft_slot < 10 ? `0${p.draft_slot}` : `${p.draft_slot}`;
                const formattedPick = `${p.round}.${slotFormatted}`;
                const posRank = `${pos}${posCounts[pos]}`;

                pickMap[String(p.player_id)] = {
                  round: p.round,
                  slot: p.draft_slot,
                  formatted: formattedPick,
                  posRank: posRank
                };
              }
            });
          }
        }
      } catch (e) {
        console.warn("Could not fetch draft pick data:", e);
      }
      setDraftPicks(pickMap);

      const allPlayers = myRoster.players ? myRoster.players.filter(id => id !== '0') : [];
      const starterIds = myRoster.starters ? myRoster.starters.filter(id => id !== '0') : [];
      const benchIds = allPlayers.filter(id => !starterIds.includes(id));
      
      if (starterIds.length === 0) {
          throw new Error('No starting lineup set for this roster yet.');
      }
      
      setStarters(starterIds.slice(0, 9)); 
      setBench(benchIds.slice(0, 8)); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadGraphic = () => {
    if (!graphicBlob) return;
    const url = URL.createObjectURL(graphicBlob);
    const link = document.createElement('a');
    link.download = `${teamData.teamName.replace(/\s+/g, '-')}-DNO-Roster.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareGraphic = async () => {
    if (!graphicBlob) return;
    
    const file = new File([graphicBlob], `${teamData.teamName.replace(/\s+/g, '-')}-DNO-Roster.png`, { type: 'image/png' });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${teamData.teamName} - DNO Roster`,
          text: `Check out my starting lineup for Draft Night Out 2026! #DraftNightOut #FSAN`,
        });
      } catch (shareErr) {
        if (shareErr.name !== 'AbortError') {
          console.warn("Share failed:", shareErr);
        }
      }
    } else {
      const text = encodeURIComponent(`Check out my starting lineup for Draft Night Out 2026! @FSANetwork #DraftNightOut`);
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }
  };

  const handleCopyImage = async () => {
    if (!graphicBlob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': graphicBlob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn("Clipboard API failed (falling back to download):", err);
      downloadGraphic();
    }
  };

  const getCardStyle = (position) => {
    switch (position) {
      case 'QB': return { border: 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]', gradient: 'from-cyan-950/40 to-black', text: 'text-cyan-400' };
      case 'RB': return { border: 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]', gradient: 'from-emerald-950/40 to-black', text: 'text-emerald-500' };
      case 'WR': return { border: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]', gradient: 'from-amber-900/40 to-black', text: 'text-amber-500' };
      case 'TE': return { border: 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]', gradient: 'from-red-950/40 to-black', text: 'text-red-500' };
      case 'K': return { border: 'border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.15)]', gradient: 'from-purple-950/40 to-black', text: 'text-purple-400' };
      case 'DEF': return { border: 'border-slate-300/60 shadow-[0_0_20px_rgba(203,213,225,0.15)]', gradient: 'from-slate-700/40 to-black', text: 'text-slate-300' };
      default: return { border: 'border-zinc-500/60 shadow-[0_0_20px_rgba(113,113,122,0.15)]', gradient: 'from-zinc-800/40 to-black', text: 'text-zinc-400' };
    }
  };

  const getESPNHeadshot = (espnId) => `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${espnId}.png&w=350&h=254`;

  // 🚀 FIXED: Extracted the entire graphic layout into a clean JSX variable.
  // This allows us to render it ONCE visually (scaled) and ONCE hidden (unscaled) for perfect mobile screenshots.
  const rosterGraphicContent = (
    <>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-900/40" />

      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950 h-[150px] shrink-0 overflow-hidden">
        <img src={dnoBgUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" crossOrigin="anonymous" alt="Background" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/70 to-transparent" />
        
        <div className="flex items-center gap-6 relative z-10 px-10">
           <img src={dnoLogoUrl} alt="DNO" className="h-24 w-auto object-contain drop-shadow-2xl" crossOrigin="anonymous" />
           <div>
            <h2 className="text-[42px] font-black text-white tracking-tighter uppercase italic drop-shadow-md truncate max-w-[700px] leading-none mb-1">
              {teamData?.teamName}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[#f5a623] font-bold uppercase tracking-widest text-[15px] drop-shadow-md truncate max-w-[400px]">{teamData?.leagueName}</span>
              <span className="text-zinc-500 font-bold">•</span>
              <span className="text-zinc-300 font-bold uppercase tracking-widest text-[15px] drop-shadow-md">Draft Night Out Roster</span>
            </div>
           </div>
        </div>
      </div>

      <div className="relative z-10 px-10 pt-8 pb-8 flex-1 flex flex-col justify-between">
         <div className="mb-0">
           <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-6 px-1 flex items-center gap-2 drop-shadow-md relative z-20">
             <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Starting Lineup
           </h3>
           
           <div className="grid gap-x-5 gap-y-10 grid-cols-3">
              {starters.map((playerId, idx) => {
                const isDefense = playerId.length < 4; 
                const dbPlayer = playerDB[playerId]; 
                const pickInfo = draftPicks[String(playerId)];
                
                let firstName = "Unknown";
                let lastName = "Player";
                let position = "FLEX";
                let team = "fa";

                if (isDefense) {
                   firstName = playerId;
                   lastName = "DEFENSE";
                   position = "DEF";
                   team = playerId.toLowerCase();
                } else if (dbPlayer) {
                   firstName = dbPlayer.first_name || "";
                   lastName = dbPlayer.last_name || "";
                   position = dbPlayer.position || "UNK";
                   team = dbPlayer.team ? dbPlayer.team.toLowerCase() : "fa";
                }

                const cardStyle = getCardStyle(position);
                const isFA = team === 'fa';
                const teamLogo = isFA ? null : `https://sleepercdn.com/images/team_logos/nfl/${team}.png`;

                let playerImage = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
                if (isDefense && !isFA) {
                   playerImage = `https://sleepercdn.com/images/team_logos/nfl/${playerId.toLowerCase()}.png`;
                } else if (dbPlayer?.espn_id) {
                   playerImage = getESPNHeadshot(dbPlayer.espn_id);
                } else {
                   playerImage = `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
                }
                
                return (
                  <div key={`starter-${playerId}-${idx}`} className="relative w-full h-[230px] flex flex-col justify-end group shadow-xl">
                    <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-b ${cardStyle.gradient} backdrop-blur-sm border-2 ${cardStyle.border} overflow-hidden`}>
                       {teamLogo && (
                         <div className="absolute inset-x-0 top-0 z-0 flex items-start justify-center opacity-[0.25] pointer-events-none">
                            <img src={teamLogo} className="w-[120%] max-w-none h-auto object-contain -translate-y-4 mix-blend-screen" crossOrigin="anonymous" alt="" onError={(e) => e.target.style.display = 'none'} />
                         </div>
                       )}
                    </div>

                    <div className="absolute top-3 left-3 z-40">
                       <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-black tracking-widest text-zinc-200 border border-zinc-700/50 shadow-md uppercase">
                          {position}
                       </span>
                    </div>

                    <div className="absolute top-3 right-3 z-40 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-zinc-700/50 shadow-md">
                       <span className="text-[11px] font-black text-white tracking-widest leading-none mt-[1px]">
                          {pickInfo ? pickInfo.formatted : 'FA'}
                       </span>
                       {pickInfo?.posRank && (
                          <span className="text-[10px] font-bold text-zinc-400">
                             • {pickInfo.posRank}
                          </span>
                       )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-center z-10 pointer-events-none h-[125%]">
                       <img 
                          src={playerImage} 
                          className={isDefense ? "max-w-[70%] max-h-[85%] object-contain drop-shadow-2xl origin-bottom mb-2" : "w-auto h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter contrast-110 brightness-110 origin-bottom"} 
                          crossOrigin="anonymous" 
                          alt="" 
                          onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                       />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black via-black/90 to-transparent z-20 rounded-b-[20px] pointer-events-none" />

                    <div className="relative z-30 px-3 pb-3 pt-2 mt-auto flex flex-col items-center text-center bg-transparent pointer-events-none w-full min-w-0">
                       <div className={`text-[12px] font-bold tracking-widest uppercase leading-tight mb-0.5 ${cardStyle.text} drop-shadow-md`}>
                          {firstName}
                       </div>
                       <div className="text-3xl font-black text-white tracking-tight truncate w-full drop-shadow-lg leading-none">
                          {lastName}
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>
         </div>

         {bench.length > 0 && (
           <div>
             <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 px-1 flex items-center gap-2 drop-shadow-md">
               <span className="w-2 h-2 rounded-full bg-zinc-600"></span> Bench
             </h3>
             <div className="grid grid-cols-2 gap-3">
                {bench.map((playerId, idx) => {
                  const isDefense = playerId.length < 4; 
                  const dbPlayer = playerDB[playerId]; 
                  const pickInfo = draftPicks[String(playerId)];
                  
                  let firstName = "Unknown";
                  let lastName = "Player";
                  let position = "BN";
                  let team = "fa";

                  if (isDefense) {
                     firstName = playerId;
                     lastName = "DEFENSE";
                     position = "DEF";
                     team = playerId.toLowerCase();
                  } else if (dbPlayer) {
                     firstName = dbPlayer.first_name || "";
                     lastName = dbPlayer.last_name || "";
                     position = dbPlayer.position || "BN";
                     team = dbPlayer.team ? dbPlayer.team.toLowerCase() : "fa";
                  }

                  const cardStyle = getCardStyle(position);
                  const isFA = team === 'fa';
                  const teamLogo = isFA ? null : `https://sleepercdn.com/images/team_logos/nfl/${team}.png`;

                  let playerImage = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
                  if (isDefense && !isFA) {
                     playerImage = `https://sleepercdn.com/images/team_logos/nfl/${playerId.toLowerCase()}.png`;
                  } else if (dbPlayer?.espn_id) {
                     playerImage = getESPNHeadshot(dbPlayer.espn_id);
                  } else {
                     playerImage = `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
                  }

                  return (
                    <div key={`bench-${playerId}-${idx}`} className={`relative w-full h-[60px] rounded-[16px] flex items-center overflow-hidden bg-zinc-950 border border-zinc-800 shadow-md shadow-[0_3px_6px_rgba(0,0,0,0.5)]`}>
                       {teamLogo && (
                         <div className="absolute inset-y-0 right-8 flex items-center justify-center z-0 opacity-[0.2] pointer-events-none">
                            <img src={teamLogo} className="h-[250%] w-auto object-contain mix-blend-screen" crossOrigin="anonymous" alt="" onError={(e) => e.target.style.display = 'none'} />
                         </div>
                       )}

                       <div className={`w-14 h-full flex items-center justify-center font-black ${cardStyle.text} text-[13px] shrink-0 tracking-widest z-20 shadow-inner`}>
                          {position}
                       </div>

                       <div className="w-10 h-10 mx-1 rounded-full bg-zinc-900 border border-zinc-700/50 flex items-center justify-center overflow-hidden shrink-0 relative z-20 shadow-md">
                          <img 
                            src={playerImage} 
                            alt="" 
                            className={isDefense ? "w-6 h-6 object-contain" : "w-full h-full object-cover object-top scale-110 translate-y-1"}
                            crossOrigin="anonymous" 
                            onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                          />
                       </div>

                       <div className="flex-1 min-w-0 pl-4 pr-2 flex items-baseline z-20 w-full">
                          <span className="font-black text-zinc-500 mr-2 uppercase text-[15px] tracking-wide shrink-0 leading-none">{firstName.charAt(0)}.</span>
                          <span className="text-white font-black text-[19px] uppercase truncate tracking-wide flex-1 min-w-0 leading-none">{lastName}</span>
                       </div>

                       <div className="pr-4 z-20 shrink-0 text-right flex flex-col items-end justify-center h-full">
                          <span className="text-[12px] font-black text-white tracking-widest leading-none mt-[1px]">
                             {pickInfo ? pickInfo.formatted : 'FA'}
                          </span>
                          {pickInfo?.posRank && (
                             <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1 leading-none">
                                {pickInfo.posRank}
                             </span>
                          )}
                       </div>
                    </div>
                  );
                })}
             </div>
           </div>
         )}
      </div>
    </>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16 overflow-x-hidden w-full">
      
      <div className="mb-8">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Social Roster Graphic</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Generate & Share Your DNO Squad</p>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 mb-8 shadow-xl w-full">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Sleeper Username..." 
              disabled={dbLoading}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-12 focus:outline-none focus:border-[#1b75bb] font-bold text-sm transition-colors disabled:opacity-50"
            />
            {loading && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/20 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {teamData && !error && (
          <div className="mt-6 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
             <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-11 h-11 rounded-full bg-zinc-900 border-2 border-[#1b75bb] overflow-hidden shrink-0 shadow-md">
                   <img 
                     src={teamData.avatar ? `https://sleepercdn.com/avatars/thumbs/${teamData.avatar}` : 'https://sleepercdn.com/images/v2/icons/player_default.webp'} 
                     alt="" 
                     className="w-full h-full object-cover"
                     onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                   />
                </div>
                <div className="min-w-0">
                   <div className="flex items-center gap-2">
                      <h4 className="text-white font-black text-sm uppercase tracking-tight truncate">{teamData.displayName || teamData.username}</h4>
                      <CheckCircle2 size={15} className="text-emerald-400 fill-emerald-400/20 shrink-0" />
                   </div>
                   <p className="text-[11px] font-bold text-gray-500 tracking-wider">@{teamData.username}</p>
                </div>
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 sm:py-1 rounded-full whitespace-nowrap">
                Sleeper Verified
             </span>
          </div>
        )}

        {leagues.length > 0 && !error && (
          <div className="mt-6 animate-in fade-in duration-300">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Select Your DNO Division</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {leagues.map(l => {
                const isSelected = selectedLeague === l.league_id;
                return (
                  <button
                    key={l.league_id}
                    type="button"
                    onClick={() => handleLeagueSelect(l.league_id)}
                    className={`px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1b75bb] border-[#1b75bb] text-white shadow-lg shadow-[#1b75bb]/20'
                        : 'bg-[#1a1a1a] border-gray-700 text-gray-300 hover:border-[#1b75bb] hover:text-white'
                    }`}
                  >
                    <span className="line-clamp-1">{l.name}</span>
                    {isSelected && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ml-2">Active</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {starters.length > 0 && teamData && teamData.teamName && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex flex-col items-start max-w-full">
          
          {/* 🚀 VISIBLE SCALED WRAPPER (For UI Display Only) */}
          <div className="w-full max-w-full overflow-hidden mb-8" ref={wrapperRef}>
              <div 
                className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-black"
                style={{ width: `${1080 * scale}px`, height: `${1350 * scale}px` }}
              >
                  <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '1080px', height: '1350px', position: 'absolute', top: 0, left: 0 }}>
                    <div className="w-[1080px] h-[1350px] bg-zinc-950 overflow-hidden flex flex-col relative">
                      {rosterGraphicContent}
                    </div>
                  </div>
              </div>
          </div>

          {/* 🚀 HIDDEN NATIVE WRAPPER (Strictly for html2canvas to capture pixel-perfect fonts safely away from Safari subpixel bugs) */}
          <div style={{ position: 'fixed', top: '-20000px', left: '-20000px', pointerEvents: 'none' }}>
              <div ref={graphicRef} className="w-[1080px] h-[1350px] bg-zinc-950 overflow-hidden flex flex-col relative">
                 {rosterGraphicContent}
              </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-start w-full sm:max-w-none">
            <button 
              onClick={handleShareGraphic}
              disabled={generating || !graphicBlob}
              className="bg-[#1b75bb] hover:bg-[#155d96] disabled:opacity-50 text-white font-black uppercase tracking-widest text-sm px-8 py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              {generating || !graphicBlob ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
              {generating || !graphicBlob ? 'Processing Image...' : 'Share Graphic'}
            </button>

            <button 
              onClick={handleCopyImage}
              disabled={generating || !graphicBlob}
              className="bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 disabled:opacity-50 text-white font-black uppercase tracking-widest text-sm px-6 py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 w-full sm:w-auto"
            >
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
              {copied ? 'Image Copied!' : 'Copy Image'}
            </button>

            <button 
              onClick={downloadGraphic}
              disabled={generating || !graphicBlob}
              className="bg-transparent hover:bg-gray-900 border border-gray-800 disabled:opacity-50 text-gray-300 font-bold uppercase tracking-widest text-sm px-6 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
            >
              {generating || !graphicBlob ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {generating || !graphicBlob ? 'Processing...' : 'Download'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}