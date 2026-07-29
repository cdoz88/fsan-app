"use client";
import React, { useState, useRef, useEffect } from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import html2canvas from 'html2canvas';
import { Search, Image as ImageIcon, Loader2, Download, AlertCircle } from 'lucide-react';

export default function RosterGraphicClient({ proToolsMenu, connectMenu }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  
  const [teamData, setTeamData] = useState(null);
  const [rosterPlayers, setRosterPlayers] = useState([]);
  const [generating, setGenerating] = useState(false);
  
  // Master database mapping
  const [playerDB, setPlayerDB] = useState({});
  const [dbLoading, setDbLoading] = useState(true);

  const graphicRef = useRef(null);

  // 🚀 HYBRID FETCH: Pull your custom DB first, fallback to Sleeper master list to prevent missing IDs
  useEffect(() => {
    const loadPlayerDatabases = async () => {
      try {
        let customMap = {};
        
        // 1. Fetch your existing API
        try {
          const res = await fetch('/api/dynasty-players');
          const data = await res.json();
          if (data.success && data.players) {
            data.players.forEach(p => {
              if (p.sleeper_id) customMap[String(p.sleeper_id)] = p;
            });
          }
        } catch(e) { console.warn("Custom DB fetch failed", e); }

        // 2. Fetch Sleeper Master List
        const slpRes = await fetch('https://api.sleeper.app/v1/players/nfl');
        const slpData = await slpRes.json();
        
        // Merge them together (Your custom data overrides Sleeper defaults)
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
    setRosterPlayers([]);

    try {
      const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
      if (!userRes.ok) throw new Error('Could not find that Sleeper username.');
      const userData = await userRes.json();
      
      const leaguesRes = await fetch(`https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/2026`);
      if (!leaguesRes.ok) throw new Error('Could not fetch leagues.');
      const leaguesData = await leaguesRes.json();
      
      if (leaguesData.length === 0) {
        throw new Error('No leagues found for this user in the current season.');
      }

      setLeagues(leaguesData);
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
      setRosterPlayers([]);
      return;
    }

    setLoading(true);
    try {
      const activeLeague = leagues.find(l => l.league_id === leagueId);
      
      const rostersRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
      const rosters = await rostersRes.json();
      
      const myRoster = rosters.find(r => r.owner_id === teamData.userId);
      if (!myRoster) throw new Error('Could not find your roster in this league.');

      const usersRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
      const users = await usersRes.json();
      const me = users.find(u => u.user_id === teamData.userId);

      setTeamData(prev => ({
        ...prev,
        leagueName: activeLeague.name,
        teamName: me?.metadata?.team_name || prev.username
      }));

      const starters = myRoster.starters ? myRoster.starters.filter(id => id !== '0') : [];
      
      if (starters.length === 0) {
          throw new Error('No starting lineup set for this roster yet.');
      }
      
      setRosterPlayers(starters);

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
      link.download = `${teamData.teamName.replace(/\s+/g, '-')}-Starting-Lineup.jpg`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Failed to generate the image. Ensure your browser allows image downloads.");
    } finally {
      setGenerating(false);
    }
  };

  // 🚀 Playoff Challenge Cinematic Styling
  const getCardStyle = (position) => {
    switch (position) {
      case 'QB': return { border: 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]', gradient: 'from-cyan-950/40 to-black', text: 'text-cyan-400' };
      case 'RB': return { border: 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)]', gradient: 'from-emerald-950/40 to-black', text: 'text-emerald-400' };
      case 'WR': return { border: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]', gradient: 'from-amber-900/40 to-black', text: 'text-amber-400' };
      case 'TE': return { border: 'border-fuchsia-500/60 shadow-[0_0_20px_rgba(217,70,239,0.15)]', gradient: 'from-fuchsia-900/40 to-black', text: 'text-fuchsia-400' };
      case 'K': return { border: 'border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.15)]', gradient: 'from-purple-950/40 to-black', text: 'text-purple-400' };
      case 'DEF': return { border: 'border-slate-300/60 shadow-[0_0_20px_rgba(203,213,225,0.15)]', gradient: 'from-slate-700/40 to-black', text: 'text-slate-300' };
      default: return { border: 'border-zinc-500/60 shadow-[0_0_20px_rgba(113,113,122,0.15)]', gradient: 'from-zinc-800/40 to-black', text: 'text-zinc-300' };
    }
  };

  const getESPNHeadshot = (espnId) => `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${espnId}.png&w=350&h=254`;
  const getESPNTeamLogo = (team) => `https://a.espncdn.com/i/teamlogos/nfl/500/${team}.png`;

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24 pt-6">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1b75bb] to-sky-600 flex items-center justify-center shadow-lg shrink-0">
               <ImageIcon size={24} className="text-white" />
             </div>
             <div>
               <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Social Roster Graphic</h1>
               <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Generate & Share Your Squad</p>
             </div>
          </div>

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
                {loading || dbLoading ? <Loader2 size={16} className="animate-spin" /> : 'Find Leagues'}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-900/20 border border-red-500/30 p-3 rounded-lg flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {leagues.length > 0 && (
              <div className="mt-6 animate-in fade-in duration-300">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Select Your League</label>
                <select 
                  value={selectedLeague}
                  onChange={(e) => handleLeagueSelect(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-[#1b75bb] font-bold text-sm appearance-none"
                >
                  <option value="">-- Choose a League --</option>
                  {leagues.map(l => (
                    <option key={l.league_id} value={l.league_id}>{l.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {rosterPlayers.length > 0 && teamData && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* 🚀 EXPORTABLE GRAPHIC CONTAINER (1080x1350 IG Portrait Square) */}
              <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
                  <div 
                    ref={graphicRef}
                    className="relative w-[1080px] h-[1350px] bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col shrink-0"
                  >
                    {/* Cinematic Background */}
                    <div className="absolute inset-0 z-0 opacity-20 mix-blend-luminosity bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2000&auto=format&fit=crop')" }} crossOrigin="anonymous" />
                    <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent" />
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-900/10 to-zinc-950/30 pointer-events-none" />

                    {/* Header Banner */}
                    <div className="relative z-10 p-8 flex items-center justify-between border-b border-zinc-800/50 bg-black/40 backdrop-blur-md h-[180px] shrink-0">
                      <div className="flex items-center gap-6">
                         <img src="https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png" alt="NFL" className="w-16 h-16 opacity-90" crossOrigin="anonymous" />
                         <div>
                          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic drop-shadow-md">
                            {teamData.teamName}
                          </h2>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[#f5a623] font-bold uppercase tracking-widest text-sm">{teamData.leagueName}</span>
                            <span className="text-zinc-600 font-bold">•</span>
                            <span className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Starting Lineup</span>
                          </div>
                         </div>
                      </div>

                      {/* FSAN Branding Right Side */}
                      <div className="flex items-center gap-4">
                         <div className="text-right">
                            <h4 className="text-[#1b75bb] font-black italic text-2xl uppercase tracking-tighter drop-shadow-md">
                               <span className="text-white">FSAN</span> NETWORK
                            </h4>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fantasy Football Advice</p>
                         </div>
                         <img src="https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp" alt="FSAN" className="w-16 h-auto opacity-80" crossOrigin="anonymous" />
                      </div>
                    </div>

                    {/* Cinematic Roster Grid */}
                    <div className="relative z-10 p-8 flex-1 flex flex-col justify-center">
                       <div className={`grid gap-6 ${rosterPlayers.length <= 9 ? 'grid-cols-3' : 'grid-cols-3'}`}>
                          {rosterPlayers.map((playerId, idx) => {
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

                            // Resolve Images (Prefer High Res ESPN if available via your DB)
                            let playerImage = 'https://sleepercdn.com/images/v2/icons/player_default.webp';
                            if (isDefense) {
                               playerImage = `https://sleepercdn.com/images/team_logos/nfl/${playerId.toLowerCase()}.png`;
                            } else if (dbPlayer?.espn_id) {
                               playerImage = getESPNHeadshot(dbPlayer.espn_id);
                            } else {
                               playerImage = `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
                            }
                            
                            const teamLogo = `https://sleepercdn.com/images/team_logos/nfl/${team}.png`;
                            
                            // Adjust card height dynamically based on roster size to ensure perfect fit
                            const cardHeight = rosterPlayers.length <= 9 ? 'h-[320px]' : 'h-[240px]';

                            return (
                              <div key={`${playerId}-${idx}`} className={`relative w-full ${cardHeight} rounded-[24px] flex flex-col justify-end bg-gradient-to-b ${cardStyle.gradient} backdrop-blur-sm border-2 ${cardStyle.border} overflow-hidden group shadow-xl`}>
                                
                                {/* Top Left Position Badge */}
                                <div className="absolute top-4 left-4 z-40">
                                   <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded text-[11px] font-black tracking-widest text-zinc-200 border border-zinc-700/50 shadow-md uppercase">
                                      {position}
                                   </span>
                                </div>

                                {/* Background Team Logo Watermark */}
                                <div className="absolute inset-x-0 top-0 z-0 flex items-start justify-center opacity-[0.25] overflow-hidden pointer-events-none">
                                   <img src={teamLogo} className="w-[120%] max-w-none h-auto object-contain -translate-y-6 mix-blend-screen" crossOrigin="anonymous" alt="" onError={(e) => e.target.style.display = 'none'} />
                                </div>

                                {/* 🚀 FIX: PERFECTLY ALIGNED IMAGE CONTAINER */}
                                <div className="absolute inset-x-0 bottom-[80px] top-12 flex items-end justify-center z-10 pointer-events-none">
                                   <img 
                                      src={playerImage} 
                                      className={isDefense ? "max-w-[70%] max-h-full object-contain drop-shadow-2xl origin-bottom mb-4" : "max-w-[140%] max-h-[120%] w-auto object-contain object-bottom drop-shadow-2xl filter contrast-125 brightness-110 origin-bottom"} 
                                      crossOrigin="anonymous" 
                                      alt="" 
                                      onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                                   />
                                </div>

                                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

                                {/* Typography Footer */}
                                <div className="relative z-20 px-4 pb-5 pt-8 mt-auto flex flex-col items-center text-center bg-transparent">
                                   <div className={`text-[12px] font-bold tracking-widest uppercase leading-tight mb-0.5 ${cardStyle.text} drop-shadow-md`}>
                                      {firstName}
                                   </div>
                                   <div className="text-3xl font-black text-white tracking-tight leading-none truncate w-full drop-shadow-lg">
                                      {lastName}
                                   </div>
                                </div>

                              </div>
                            );
                          })}
                       </div>
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
                       <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                         Generated securely via <strong className="text-white">Fantasy Football Advice Network</strong>
                       </p>
                    </div>

                  </div>
              </div>

              {/* ACTION BUTTON */}
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
      </div>
    </>
  );
}