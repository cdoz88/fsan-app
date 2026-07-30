"use client";
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Search, Image as ImageIcon, Loader2, Download, AlertCircle } from 'lucide-react';

export default function GraphicTab() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  
  const [teamData, setTeamData] = useState(null);
  const [starters, setStarters] = useState([]);
  const [bench, setBench] = useState([]);
  const [generating, setGenerating] = useState(false);
  
  const [playerDB, setPlayerDB] = useState({});
  const [dbLoading, setDbLoading] = useState(true);

  const graphicRef = useRef(null);
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  // 🚀 Dynamic Scaling to fit the screen without scrolling
  useEffect(() => {
    const updateScale = () => {
      if (wrapperRef.current && wrapperRef.current.parentElement) {
        const parentWidth = wrapperRef.current.parentElement.clientWidth;
        // 1080 is our fixed graphic width. Scale down if parent is smaller.
        setScale(Math.min(1, (parentWidth - 32) / 1080)); 
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

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

  const fetchSleeperLeagues = async () => {
    if (!username) return;
    setLoading(true);
    setError('');
    setLeagues([]);
    setTeamData(null);
    setStarters([]);
    setBench([]);

    try {
      const userRes = await fetch(`https://api.sleeper.app/v1/user/${username.trim()}`);
      if (!userRes.ok) throw new Error('Could not find that Sleeper username.');
      const userData = await userRes.json();
      
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
      setTeamData({ userId: userData.user_id, username: userData.display_name, avatar: userData.avatar });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueSelect = async (leagueId) => {
    setSelectedLeague(leagueId);
    if (!leagueId) {
      setStarters([]);
      setBench([]);
      return;
    }

    setLoading(true);
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
        teamName: me?.metadata?.team_name || prev.username
      }));

      const allPlayers = myRoster.players ? myRoster.players.filter(id => id !== '0') : [];
      const starterIds = myRoster.starters ? myRoster.starters.filter(id => id !== '0') : [];
      const benchIds = allPlayers.filter(id => !starterIds.includes(id));
      
      if (starterIds.length === 0) {
          throw new Error('No starting lineup set for this roster yet.');
      }
      
      // Strict layout limits: 9 starters, 8 bench
      setStarters(starterIds.slice(0, 9)); 
      setBench(benchIds.slice(0, 8)); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadGraphic = async () => {
    if (!graphicRef.current) return;
    setGenerating(true);
    
    try {
      const canvas = await html2canvas(graphicRef.current, {
        useCORS: true,
        allowTaint: true, 
        scale: 2, 
        backgroundColor: '#09090b' 
      });
      
      const image = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `${teamData.teamName.replace(/\s+/g, '-')}-DNO-Roster.jpg`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const getCardStyle = (position) => {
    switch (position) {
      case 'QB': return { border: 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]', gradient: 'from-cyan-950/50 to-black', text: 'text-cyan-400', bg: 'bg-cyan-500' };
      case 'RB': return { border: 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]', gradient: 'from-emerald-950/50 to-black', text: 'text-emerald-500', bg: 'bg-emerald-500' };
      case 'WR': return { border: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]', gradient: 'from-amber-900/50 to-black', text: 'text-amber-500', bg: 'bg-amber-500' };
      // 🚀 TE IS NOW BOLD RED
      case 'TE': return { border: 'border-red-600/60 shadow-[0_0_20px_rgba(220,38,38,0.15)]', gradient: 'from-red-950/50 to-black', text: 'text-red-500', bg: 'bg-red-600' };
      case 'K': return { border: 'border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.15)]', gradient: 'from-purple-950/50 to-black', text: 'text-purple-400', bg: 'bg-purple-500' };
      case 'DEF': return { border: 'border-slate-300/60 shadow-[0_0_20px_rgba(203,213,225,0.15)]', gradient: 'from-slate-700/50 to-black', text: 'text-slate-300', bg: 'bg-slate-400' };
      default: return { border: 'border-zinc-500/60 shadow-[0_0_20px_rgba(113,113,122,0.15)]', gradient: 'from-zinc-800/50 to-black', text: 'text-zinc-400', bg: 'bg-zinc-600' };
    }
  };

  const getESPNHeadshot = (espnId) => `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${espnId}.png&w=350&h=254`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
      
      {/* Intro / Header */}
      <div className="flex items-center gap-4 mb-8">
         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1b75bb] to-sky-600 flex items-center justify-center shadow-lg shrink-0">
           <ImageIcon size={24} className="text-white" />
         </div>
         <div>
           <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Social Roster Graphic</h2>
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Generate & Share Your DNO Squad</p>
         </div>
      </div>

      {/* Inputs */}
      <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 mb-8 shadow-xl max-w-3xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSleeperLeagues()}
              placeholder="Enter Sleeper Username..." 
              disabled={dbLoading}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#1b75bb] font-bold text-sm transition-colors disabled:opacity-50"
            />
          </div>
          <button 
            onClick={fetchSleeperLeagues}
            disabled={loading || !username || dbLoading}
            className="bg-[#f5a623] hover:bg-[#e0961d] disabled:opacity-50 text-[#111] font-black uppercase tracking-widest text-xs px-8 py-3.5 rounded-xl transition-colors shrink-0 flex items-center justify-center"
          >
            {loading || dbLoading ? <Loader2 size={16} className="animate-spin" /> : 'Find DNO Leagues'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/20 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {leagues.length > 0 && (
          <div className="mt-6 animate-in fade-in duration-300">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Select Your DNO Division</label>
            <select 
              value={selectedLeague}
              onChange={(e) => handleLeagueSelect(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-[#1b75bb] font-bold text-sm appearance-none"
            >
              <option value="">-- Choose a DNO Division --</option>
              {leagues.map(l => (
                <option key={l.league_id} value={l.league_id}>{l.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Output Graphic */}
      {starters.length > 0 && teamData && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 🚀 SCALING WRAPPER: Ensures 1080x1350 perfectly scales to fit screen without scrolling */}
          <div className="w-full flex justify-center mb-6" ref={wrapperRef}>
            
            <div style={{ width: `${1080 * scale}px`, height: `${1350 * scale}px`, position: 'relative' }} className="rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-zinc-800">
                
                {/* 🚀 ACTUAL EXPORT CANVAS */}
                <div 
                  ref={graphicRef}
                  className="absolute top-0 left-0 w-[1080px] h-[1350px] bg-zinc-950 flex flex-col"
                  style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                >
                  {/* Global Background Image (Made explicit with img tag for html2canvas) */}
                  <div className="absolute inset-0 z-0 bg-zinc-950 overflow-hidden pointer-events-none">
                    <img src="/images/DNO-Background.webp" className="absolute inset-0 w-full h-full object-cover opacity-25" crossOrigin="anonymous" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
                  </div>

                  {/* Header Banner */}
                  <div className="relative z-10 p-8 flex items-center justify-between border-b border-zinc-800/80 bg-black/40 backdrop-blur-sm h-[140px] shrink-0 w-full">
                    <div className="flex items-center gap-6">
                       <img src="/images/DNO-Logo_Logo.webp" alt="DNO" className="h-16 w-auto object-contain drop-shadow-lg" crossOrigin="anonymous" />
                       <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">
                          {teamData.teamName}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[#f5a623] font-bold uppercase tracking-widest text-sm drop-shadow-md">{teamData.leagueName}</span>
                          <span className="text-zinc-600 font-bold">•</span>
                          <span className="text-zinc-400 font-bold uppercase tracking-widest text-sm drop-shadow-md">Draft Night Out Roster</span>
                        </div>
                       </div>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="relative z-10 px-10 py-8 flex-1 flex flex-col justify-start">
                     
                     {/* STARTING LINEUP */}
                     <div className="mb-6">
                       <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-6 px-1 flex items-center gap-2 drop-shadow-md relative z-20">
                         <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Starting Lineup
                       </h3>
                       
                       <div className="grid gap-x-6 gap-y-6 grid-cols-3">
                          {starters.map((playerId, idx) => {
                            const isDefense = playerId.length < 4; 
                            const dbPlayer = playerDB[playerId]; 
                            
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

                            let playerImage = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
                            if (isDefense) {
                               playerImage = `https://sleepercdn.com/images/team_logos/nfl/${playerId.toLowerCase()}.png`;
                            } else if (dbPlayer?.espn_id) {
                               playerImage = getESPNHeadshot(dbPlayer.espn_id);
                            } else {
                               playerImage = `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
                            }
                            
                            const teamLogo = `https://sleepercdn.com/images/team_logos/nfl/${team}.png`;

                            return (
                              <div key={`starter-${playerId}-${idx}`} className="relative w-full h-[220px] flex flex-col justify-end group shadow-xl">
                                
                                {/* 🚀 LAYER 1: Background Card (Overflow Hidden to crop logo) */}
                                <div className={`absolute inset-0 rounded-[20px] bg-gradient-to-b ${cardStyle.gradient} backdrop-blur-sm border-2 ${cardStyle.border} overflow-hidden z-0`}>
                                   <div className="absolute inset-x-0 top-0 z-0 flex items-start justify-center opacity-[0.25] pointer-events-none">
                                      <img src={teamLogo} className="w-[120%] max-w-none h-auto object-contain -translate-y-4 mix-blend-screen" crossOrigin="anonymous" alt="" onError={(e) => e.target.style.display = 'none'} />
                                   </div>
                                </div>

                                {/* 🚀 LAYER 2: Position Badge */}
                                <div className="absolute top-3 left-3 z-10">
                                   <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-black tracking-widest text-zinc-200 border border-zinc-700/50 shadow-md uppercase">
                                      {position}
                                   </span>
                                </div>

                                {/* 🚀 LAYER 3: Player Headshot (OUTSIDE overflow hidden, huge height, pops out!) */}
                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-center z-20 pointer-events-none h-[135%]">
                                   <img 
                                      src={playerImage} 
                                      className={isDefense ? "max-w-[70%] max-h-[85%] object-contain drop-shadow-2xl origin-bottom mb-4" : "w-auto h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter contrast-110 brightness-110 origin-bottom"} 
                                      crossOrigin="anonymous" 
                                      alt="" 
                                      onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                                   />
                                </div>

                                {/* 🚀 LAYER 4: Bottom Mask & Text (Overflow Hidden so it rounds corners perfectly) */}
                                <div className="absolute inset-0 rounded-[20px] overflow-hidden z-30 pointer-events-none">
                                  {/* The black fade covering the bottom 50% of the player's torso */}
                                  <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black via-black/85 to-transparent" />
                                  {/* The typography */}
                                  <div className="absolute inset-x-0 bottom-0 p-3 pt-8 flex flex-col items-center text-center">
                                     <div className={`text-[10px] font-bold tracking-widest uppercase leading-tight mb-0.5 ${cardStyle.text} drop-shadow-md`}>
                                        {firstName}
                                     </div>
                                     <div className="text-2xl font-black text-white tracking-tight leading-none truncate w-full drop-shadow-lg">
                                        {lastName}
                                     </div>
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                       </div>
                     </div>

                     {/* 🚀 FANCY BENCH PLAYERS */}
                     {bench.length > 0 && (
                       <div className="mt-4">
                         <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 px-1 flex items-center gap-2 drop-shadow-md">
                           <span className="w-2 h-2 rounded-full bg-zinc-600"></span> Bench
                         </h3>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {bench.map((playerId, idx) => {
                              const isDefense = playerId.length < 4; 
                              const dbPlayer = playerDB[playerId]; 
                              
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

                              let playerImage = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
                              if (isDefense) {
                                 playerImage = `https://sleepercdn.com/images/team_logos/nfl/${playerId.toLowerCase()}.png`;
                              } else if (dbPlayer?.espn_id) {
                                 playerImage = getESPNHeadshot(dbPlayer.espn_id);
                              } else {
                                 playerImage = `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
                              }

                              const teamLogo = `https://sleepercdn.com/images/team_logos/nfl/${team}.png`;

                              return (
                                <div key={`bench-${playerId}-${idx}`} className={`relative w-full h-[64px] rounded-[16px] flex items-center overflow-hidden bg-zinc-950 border border-zinc-800 shadow-md`}>
                                   
                                   {/* Faded Background Logo Watermark (Right side) */}
                                   <div className="absolute inset-y-0 right-0 flex items-center justify-end z-0 opacity-[0.2] pointer-events-none translate-x-4">
                                      <img src={teamLogo} className="h-[200%] w-auto object-contain mix-blend-screen" crossOrigin="anonymous" alt="" onError={(e) => e.target.style.display = 'none'} />
                                   </div>

                                   {/* 🚀 No Solid Background Block - Just Colored Text */}
                                   <div className={`w-14 h-full flex items-center justify-center font-black ${cardStyle.text} text-[13px] shrink-0 tracking-widest z-20`}>
                                      {position}
                                   </div>

                                   {/* 🚀 Circular Headshot */}
                                   <div className="w-11 h-11 mx-1 rounded-full bg-zinc-900 border border-zinc-700/50 flex items-center justify-center overflow-hidden shrink-0 relative z-20 shadow-inner">
                                      <img 
                                        src={playerImage} 
                                        alt="" 
                                        className={isDefense ? "w-7 h-7 object-contain" : "w-full h-full object-cover object-top scale-110 translate-y-1"}
                                        crossOrigin="anonymous" 
                                        onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                                      />
                                   </div>

                                   {/* 🚀 Player Name (No secondary small team logo, just clean text!) */}
                                   <div className="flex-1 min-w-0 pl-4 pr-3 flex items-baseline z-20">
                                      <span className="font-black text-zinc-500 mr-2 uppercase text-[15px] tracking-wide">{firstName.charAt(0)}.</span>
                                      <span className="text-white font-black text-[18px] uppercase truncate tracking-wide">{lastName}</span>
                                   </div>
                                </div>
                              );
                            })}
                         </div>
                       </div>
                     )}

                  </div>
                </div>
            </div>
          </div>

          <div className="flex justify-start">
            <button 
              onClick={downloadGraphic}
              disabled={generating}
              className="bg-[#1b75bb] hover:bg-[#155d96] disabled:opacity-50 text-white font-black uppercase tracking-widest text-sm px-8 py-4 rounded-xl transition-colors shadow-lg flex items-center gap-2 hover:-translate-y-0.5"
            >
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {generating ? 'Processing Image...' : 'Download Roster Graphic'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}