"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  
  // 🚀 NEW: State to hold your site's internal player database
  const [playerDB, setPlayerDB] = useState({});

  const graphicRef = useRef(null);

  // 🚀 NEW: Fetch your existing internal player data on component mount!
  useEffect(() => {
    const fetchInternalPlayerData = async () => {
      try {
        // Adjust this endpoint to wherever your Trade Calculator/Rankings gets its player list!
        const res = await fetch('/api/dynasty-players'); 
        if (res.ok) {
          const data = await res.json();
          // Convert array to a lookup dictionary keyed by Sleeper ID for instant O(1) lookups
          const dbMap = {};
          data.forEach(player => {
             if (player.sleeper_id) {
               dbMap[player.sleeper_id] = player;
             }
          });
          setPlayerDB(dbMap);
        }
      } catch (err) {
        console.warn("Could not load internal player DB:", err);
      }
    };
    
    fetchInternalPlayerData();
  }, []);

  const fetchSleeperLeagues = async () => {
    if (!username) return;
    setLoading(true);
    setError('');
    setLeagues([]);
    setTeamData(null);
    setRosterPlayers([]);

    try {
      // 1. Get User ID from Username
      const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
      if (!userRes.ok) throw new Error('Could not find that Sleeper username.');
      const userData = await userRes.json();
      
      // 2. Get 2026 NFL Leagues for User
      const leaguesRes = await fetch(`https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/2026`);
      if (!leaguesRes.ok) throw new Error('Could not fetch leagues.');
      const leaguesData = await leaguesRes.json();
      
      if (leaguesData.length === 0) {
        throw new Error('No 2026 leagues found for this user.');
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

      const validPlayers = myRoster.players.filter(id => id !== '0');
      setRosterPlayers(validPlayers.slice(0, 15)); 

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
        scale: 2, 
        backgroundColor: '#0a0a0a'
      });
      
      const image = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.download = `${teamData.teamName.replace(/\s+/g, '-')}-Roster-2026.jpg`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Failed to generate the image. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Position color coding helper
  const getPositionColor = (position, index) => {
    if (position === 'QB') return 'bg-red-500'; 
    if (position === 'RB') return 'bg-emerald-500'; 
    if (position === 'WR') return 'bg-[#1b75bb]'; 
    if (position === 'TE') return 'bg-[#f5a623]'; 
    if (position === 'DEF') return 'bg-sky-400';
    if (position === 'K') return 'bg-purple-500';
    
    // Fallbacks if position is unknown
    if (index === 0) return 'bg-red-500'; 
    if (index > 0 && index <= 3) return 'bg-emerald-500'; 
    if (index > 3 && index <= 7) return 'bg-[#1b75bb]'; 
    if (index > 7 && index <= 9) return 'bg-[#f5a623]'; 
    return 'bg-gray-500'; 
  };

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
                  className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#1b75bb] font-bold text-sm transition-colors"
                />
              </div>
              <button 
                onClick={fetchSleeperLeagues}
                disabled={loading || !username}
                className="bg-[#f5a623] hover:bg-[#e0961d] disabled:opacity-50 text-[#111] font-black uppercase tracking-widest text-xs px-8 py-3.5 rounded-xl transition-colors shrink-0 flex items-center justify-center"
              >
                {loading && !leagues.length ? <Loader2 size={16} className="animate-spin" /> : 'Find Leagues'}
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
                  <option value="">-- Choose a 2026 League --</option>
                  {leagues.map(l => (
                    <option key={l.league_id} value={l.league_id}>{l.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {rosterPlayers.length > 0 && teamData && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
                  <div 
                    ref={graphicRef}
                    className="relative w-[1200px] h-[630px] bg-[#0a0a0a] border-2 border-gray-800 overflow-hidden flex flex-col p-10 shrink-0"
                  >
                    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                       <img src="https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_Logo.webp" alt="Watermark" className="w-[800px] h-auto object-contain" crossOrigin="anonymous" />
                    </div>

                    <div className="absolute top-8 right-10 z-20 opacity-80">
                       <h4 className="text-[#1b75bb] font-black italic text-xl uppercase tracking-tighter flex items-center gap-2">
                         <span className="text-white">FSAN</span> NETWORK
                       </h4>
                    </div>

                    <div className="relative z-10 mb-10 mt-2">
                       <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter mb-2 drop-shadow-lg">
                         {teamData.teamName}
                       </h2>
                       <div className="flex items-center gap-3">
                         <span className="text-[#f5a623] font-bold uppercase tracking-widest text-lg">{teamData.leagueName}</span>
                         <span className="text-gray-500 font-bold">•</span>
                         <span className="text-gray-400 font-bold uppercase tracking-widest text-lg">2026 Roster</span>
                       </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-3 gap-x-6 gap-y-4 flex-1">
                       {rosterPlayers.map((playerId, idx) => {
                         const isDefense = playerId.length < 4; 
                         const internalPlayer = playerDB[playerId]; // Lookup player in your database
                         
                         // Determine Player Details
                         const playerName = isDefense ? `${playerId} DEF` : (internalPlayer ? `${internalPlayer.first_name} ${internalPlayer.last_name}` : `Player ${playerId}`);
                         const position = isDefense ? 'DEF' : (internalPlayer?.position || 'UNK');
                         const team = isDefense ? playerId : (internalPlayer?.team || 'FA');
                         const accentColor = getPositionColor(position, idx);

                         // Use internal images if available, otherwise fallback to Sleeper CDN
                         const imageUrl = internalPlayer?.image_url 
                            ? internalPlayer.image_url 
                            : (isDefense 
                                ? `https://sleepercdn.com/images/team_logos/nfl/${playerId.toLowerCase()}.png`
                                : `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`);

                         return (
                           <div key={`${playerId}-${idx}`} className="bg-[#151515] border border-gray-800 rounded-xl h-[84px] flex relative overflow-hidden shadow-md">
                             <div className={`w-2 h-full ${accentColor}`}></div>
                             
                             <div className="w-[84px] h-[84px] bg-[#1a1a1a] flex items-end justify-center shrink-0 border-r border-gray-800 overflow-hidden">
                               <img 
                                 src={imageUrl} 
                                 alt={playerName} 
                                 className={isDefense ? "w-12 h-12 object-contain mb-4" : "w-full h-auto object-cover"}
                                 crossOrigin="anonymous" 
                                 onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                               />
                             </div>

                             {/* 🚀 Render mapped names, positions, and teams! */}
                             <div className="flex-1 p-3 flex flex-col justify-center">
                                <h3 className="text-white font-black text-[15px] uppercase tracking-wide truncate">{playerName}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{position}</span>
                                  {!isDefense && <span className="text-[10px] font-bold text-gray-600">|</span>}
                                  {!isDefense && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{team}</span>}
                                </div>
                             </div>
                             
                             <div className={`absolute bottom-0 right-0 w-1/3 h-1.5 ${accentColor} rounded-tl-md`}></div>
                           </div>
                         );
                       })}
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                         Generated securely via <strong className="text-white">Fantasy Football Advice Network</strong>
                       </p>
                    </div>
                  </div>
              </div>

              <div className="flex justify-start">
                <button 
                  onClick={downloadGraphic}
                  disabled={generating}
                  className="bg-[#1b75bb] hover:bg-[#155d96] disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-colors shadow-lg flex items-center gap-2 hover:-translate-y-0.5"
                >
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {generating ? 'Generating Image...' : 'Download Roster Graphic'}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}