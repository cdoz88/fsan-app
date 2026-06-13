'use client';

import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Trophy } from 'lucide-react'; 
import { useLeague } from '../../../context/LeagueContext'; 
import { useTradeEngine, DRAFT_PICKS } from '../../../hooks/useTradeEngine'; 
import TeamPane from './TeamPane';

export default function TradeCalculatorClient() {
  const { getActiveLeagueData, sleeperUserId } = useLeague();
  const activeLeague = getActiveLeagueData('football');

  const [playersData, setPlayersData] = useState([]);
  const [sleeperPlayersMap, setSleeperPlayersMap] = useState({}); 
  const [isSyncing, setIsSyncing] = useState(true);

  // --- League Roster Sync State ---
  const [leagueUsers, setLeagueUsers] = useState([]);
  const [leagueRosters, setLeagueRosters] = useState([]);
  const [teamAManager, setTeamAManager] = useState(''); 
  const [teamBManager, setTeamBManager] = useState('');
  const [isRefreshingLeague, setIsRefreshingLeague] = useState(false); 
  
  // --- Trade Teams State ---
  const [formatMode, setFormatMode] = useState('dynasty'); 
  const [teamAStrategy, setTeamAStrategy] = useState('neutral');
  const [teamBStrategy, setTeamBStrategy] = useState('neutral');
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');

  // --- Scoring Format Settings (Fallback for non-synced) ---
  const [showSettings, setShowSettings] = useState(false);
  const [manualIsSuperflex, setManualIsSuperflex] = useState(true); 
  const [manualPprValue, setManualPprValue] = useState(1);       
  const [manualPassTdValue, setManualPassTdValue] = useState(4); 
  const [manualTePremium, setManualTePremium] = useState(0);     

  const isSuperflex = activeLeague?.rosterPositions ? activeLeague.rosterPositions.includes('SUPER_FLEX') : manualIsSuperflex;
  const pprValue = activeLeague?.scoringSettings?.rec ?? manualPprValue;
  const passTdValue = activeLeague?.scoringSettings?.pass_td ?? manualPassTdValue;
  const tePremium = activeLeague?.scoringSettings?.bonus_rec_te ?? manualTePremium;

  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#e42d38';
  const secondaryColor = '#8a1a20';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'redraft' || modeParam === 'dynasty') setFormatMode(modeParam);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('mode', formatMode);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  }, [formatMode]);

  useEffect(() => {
    async function loadLiveDatabase() {
      try {
        const res = await fetch('/api/dynasty-players');
        const data = await res.json();
        if (data.success && data.players) setPlayersData(data.players);
      } catch (err) {
        console.error("Error connecting to database api", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadLiveDatabase();
  }, []);

  useEffect(() => {
    if (activeLeague && activeLeague.platform === 'sleeper') {
        const fetchSleeperMap = async () => {
            const cached = localStorage.getItem('fsan_sleeper_players');
            if (cached) { setSleeperPlayersMap(JSON.parse(cached)); return; }
            try {
                const res = await fetch('https://api.sleeper.app/v1/players/nfl');
                const data = await res.json();
                setSleeperPlayersMap(data);
                try { localStorage.setItem('fsan_sleeper_players', JSON.stringify(data)); } catch(e){}
            } catch (err) {
                console.error("Failed to load sleeper master players list", err);
            }
        };
        fetchSleeperMap();
    }
  }, [activeLeague]);

  useEffect(() => {
    if (activeLeague && activeLeague.platform === 'sleeper') {
      const fetchSleeperData = async () => {
        try {
          const timestamp = Date.now();
          const [usersRes, rostersRes] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/users?_t=${timestamp}`),
            fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/rosters?_t=${timestamp}`)
          ]);
          const users = await usersRes.json();
          const rosters = await rostersRes.json();
          setLeagueUsers(users);
          setLeagueRosters(rosters);

          if (sleeperUserId) setTeamAManager(sleeperUserId);
        } catch (e) {
          console.error("Failed to fetch sleeper league data", e);
        }
      };
      fetchSleeperData();
    } else {
       setLeagueUsers([]);
       setLeagueRosters([]);
       setTeamAManager('');
       setTeamBManager('');
    }
  }, [activeLeague, sleeperUserId]);

  const refreshLeagueData = async () => {
    if (!activeLeague || activeLeague.platform !== 'sleeper') return;
    setIsRefreshingLeague(true);
    try {
      const timestamp = Date.now();
      const [usersRes, rostersRes, _] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/users?_t=${timestamp}`),
        fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/rosters?_t=${timestamp}`),
        new Promise(resolve => setTimeout(resolve, 750)) 
      ]);
      const users = await usersRes.json();
      const rosters = await rostersRes.json();
      setLeagueUsers(users);
      setLeagueRosters(rosters);
    } catch (e) {
      console.error("Failed to refresh sleeper league data", e);
    } finally {
      setIsRefreshingLeague(false);
    }
  };

  const handleManagerChange = (newManagerId, teamId) => {
    if (teamId === 'B') {
        setTeamBManager(newManagerId);
        setTeamAPlayers([]);
        setTeamBPlayers([]);
    } else {
        setTeamAManager(newManagerId);
        setTeamAPlayers([]);
        setTeamBPlayers([]);
    }
  };

  const { activeRosterA, activeRosterB, tradeEvaluation, getPlayerValue } = useTradeEngine({
    playersData, sleeperPlayersMap, leagueRosters, teamAManager, teamBManager, teamAPlayers, teamBPlayers,
    teamAStrategy, teamBStrategy, formatMode, isSuperflex, pprValue, passTdValue, tePremium
  });

  const { totalA, totalB, bestAsset, bestAssetSide, premium, hasPenaltyA, hasPenaltyB, isOneForOne } = tradeEvaluation;
  const totalBoth = totalA + totalB;
  const diff = Math.abs(totalA - totalB);
  const diffPct = totalBoth > 0 ? (diff / totalBoth) * 100 : 0;

  const togglePlayerInTrade = (playerObj, team) => {
    if (team === 'A') {
      const isSelected = teamBPlayers.some(p => p.name === playerObj.name);
      if (isSelected) setTeamBPlayers(teamBPlayers.filter(p => p.name !== playerObj.name));
      else setTeamBPlayers([...teamBPlayers, playerObj]);
    } else {
      const isSelected = teamAPlayers.some(p => p.name === playerObj.name);
      if (isSelected) setTeamAPlayers(teamAPlayers.filter(p => p.name !== playerObj.name));
      else setTeamAPlayers([...teamAPlayers, playerObj]);
    }
  };

  const addPlayer = (item, team) => {
      const newItem = { ...item, uniqueId: item.name + Date.now() }; 
      if (item.position !== 'PICK' || item.id.includes('.')) {
          if (teamAPlayers.some(p => p.name === item.name) || teamBPlayers.some(p => p.name === item.name)) return; 
      }
      if (team === 'A') setTeamAPlayers([...teamAPlayers, newItem]);
      else setTeamBPlayers([...teamBPlayers, newItem]);
  };

  const removePlayer = (uniqueId, team) => {
      if (team === 'A') setTeamAPlayers(teamAPlayers.filter(p => p.uniqueId !== uniqueId));
      else setTeamBPlayers(teamBPlayers.filter(p => p.uniqueId !== uniqueId));
  };

  const handlePickSelect = (e, team) => {
      if (!e.target.value) return;
      const pick = DRAFT_PICKS.find(p => p.id === e.target.value);
      if (activeLeague) {
        if (pick) addPlayer(pick, team === 'A' ? 'B' : 'A');
      } else {
        if (pick) addPlayer(pick, team);
      }
      e.target.value = ""; 
  };

  let verdictTitle = "Select assets to evaluate trade";
  let verdictSubtitle = "Toggle players to see the package analysis.";
  let verdictColor = "text-gray-500";
  let barAWidth = 50;
  let barBWidth = 50;

  if (totalBoth > 0) {
      barAWidth = (totalA / totalBoth) * 100;
      barBWidth = (totalB / totalBoth) * 100;
      const winner = totalA > totalB ? 'Team A' : 'Team B';
      const loser = totalA > totalB ? 'Team B' : 'Team A';
      
      if (diffPct <= 5) {
          verdictTitle = "🤝 Fair Trade";
          verdictColor = "text-zinc-300";
          verdictSubtitle = "Highly balanced deal. Both managers extract equitable value based on their current roster strategies.";
      } else if (diffPct <= 12) {
          verdictTitle = `⚖️ Slight Edge: ${winner}`;
          verdictColor = totalA > totalB ? "text-red-400" : "text-blue-400";
          verdictSubtitle = `A viable trade, but ${winner} extracts roughly ${Math.round(diffPct)}% more value overall.`;
      } else if (diffPct <= 22) {
          verdictTitle = `🏆 Clear Win: ${winner}`;
          verdictColor = totalA > totalB ? "text-red-500" : "text-blue-500";
          verdictSubtitle = `${loser} is sacrificing too much value. Consider adding a draft pick or prospect to balance the scales.`;
      } else {
          verdictTitle = `🚨 Major Overpay by ${loser}`;
          verdictColor = totalA > totalB ? "text-red-600" : "text-blue-600";
          verdictSubtitle = `This trade is heavily lopsided. ${winner} completely dominates the value exchange.`;
      }

      if (bestAsset && diffPct > 5) {
          const receivesBest = bestAssetSide === (totalA > totalB ? 'A' : 'B');
          if (!isOneForOne) {
              verdictSubtitle += ` ${receivesBest ? winner : loser} receives a structural premium for acquiring ${bestAsset.name}, consolidating elite value in this multi-player deal.`;
          }
      }
  }

  const myUser = leagueUsers.find(u => u.user_id === teamAManager);
  const myTeamName = myUser?.metadata?.team_name || myUser?.display_name || 'My Team';
  const myAvatar = myUser?.avatar ? `https://sleepercdn.com/avatars/thumbs/${myUser.avatar}` : 'https://placehold.co/40x40/383838/ffffff?text=?';
  const selectedUserB = leagueUsers.find(u => u.user_id === teamBManager);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative pt-6 lg:pt-8">
      
      {/* Hero Section */}
      <div className="relative w-full h-[220px] md:h-[260px] flex items-end overflow-hidden rounded-2xl mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }} />
        <img src={bgImage} alt="Football Background" className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between h-full px-6 md:px-10 pb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              Trade Calculator
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Analyze multi-player deals using live VORP projections and asymmetric league scoring.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex bg-[#111] p-1.5 rounded-2xl shadow-inner border border-gray-800 w-fit">
            <button onClick={() => setFormatMode('redraft')} className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formatMode === 'redraft' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-white'}`}>Redraft</button>
            <button onClick={() => setFormatMode('dynasty')} className={`px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formatMode === 'dynasty' ? 'bg-zinc-700 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>Dynasty</button>
          </div>
          
          {activeLeague ? (
            <div className="flex items-center bg-[#1a1a1a] border border-green-500/20 rounded-xl overflow-hidden shadow-inner">
              <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 font-bold text-xs uppercase tracking-widest bg-green-500/10 text-green-400 pointer-events-none">
                <Trophy size={16} /> Synced to {activeLeague.name}
              </div>
              
              <button 
                onClick={(e) => { e.preventDefault(); refreshLeagueData(); }}
                disabled={isRefreshingLeague}
                title="Refresh Rosters"
                className="flex items-center justify-center px-4 py-2.5 bg-green-500/5 hover:bg-green-500/20 text-green-500 transition-all border-l border-green-500/20 disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshingLeague ? "animate-spin" : ""} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${showSettings ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'}`}>
              <Settings size={16} /> {showSettings ? 'Hide Settings' : 'Custom League Scoring'}
            </button>
          )}
        </div>

        {/* Custom Scoring Panel */}
        {showSettings && !activeLeague && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">League Type</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  <button onClick={() => setManualIsSuperflex(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!manualIsSuperflex ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>1QB</button>
                  <button onClick={() => setManualIsSuperflex(true)} className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${manualIsSuperflex ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>SUPERFLEX</button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Receptions (PPR)</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: 'STD', val: 0 }, { label: 'HALF', val: 0.5 }, { label: 'FULL', val: 1 }].map(opt => (
                    <button key={opt.label} onClick={() => setManualPprValue(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualPprValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Passing TDs</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: '4 PTS', val: 4 }, { label: '6 PTS', val: 6 }].map(opt => (
                    <button key={opt.label} onClick={() => setManualPassTdValue(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualPassTdValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">TE Premium</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: 'NONE', val: 0 }, { label: '+0.5', val: 0.5 }, { label: '+1.0', val: 1 }].map(opt => (
                    <button key={opt.label} onClick={() => setManualTePremium(opt.val)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualTePremium === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {isSyncing ? (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="animate-spin mb-4 text-red-500" size={36} />
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Syncing Live Player Data</h3>
            </div>
        ) : (
            <div className="flex flex-col gap-8">
                
                {/* VERDICT BAR */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <h2 className={`text-center text-2xl font-black uppercase tracking-widest mb-2 ${verdictColor}`}>
                        {verdictTitle}
                    </h2>
                    <p className="text-center text-xs font-bold text-gray-400 max-w-2xl mx-auto mb-6 leading-relaxed">
                        {verdictSubtitle}
                    </p>
                    <div className="w-full h-4 rounded-full bg-[#111] flex overflow-hidden border border-gray-800 shadow-inner">
                        <div className="h-full bg-red-600 transition-all duration-500 relative" style={{ width: `${barAWidth}%` }} />
                        <div className="h-full bg-blue-600 transition-all duration-500 relative" style={{ width: `${barBWidth}%` }} />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* TEAM A PANE */}
                    <TeamPane 
                      isSynced={!!activeLeague}
                      teamId="A"
                      isMyTeam={true}
                      formatMode={formatMode}
                      leagueUsers={leagueUsers}
                      sleeperUserId={sleeperUserId}
                      managerId={teamAManager}
                      onManagerChange={handleManagerChange}
                      strategy={teamAStrategy}
                      setStrategy={setTeamAStrategy}
                      totalReceived={totalA}
                      premium={premium}
                      bestAssetSide={bestAssetSide}
                      hasPenalty={hasPenaltyA}
                      isOneForOne={isOneForOne}
                      query={queryA}
                      setQuery={setQueryA}
                      playersData={playersData}
                      activeRoster={activeRosterA}
                      receivedPlayers={teamAPlayers}
                      sentPlayers={teamBPlayers}
                      togglePlayerInTrade={togglePlayerInTrade}
                      addPlayer={addPlayer}
                      removePlayer={removePlayer}
                      handlePickSelect={handlePickSelect}
                      getPlayerValue={getPlayerValue}
                      DRAFT_PICKS={DRAFT_PICKS}
                      myTeamName={myTeamName}
                      myAvatar={myAvatar}
                      selectedUser={null}
                    />

                    {/* TEAM B PANE */}
                    <TeamPane 
                      isSynced={!!activeLeague}
                      teamId="B"
                      isMyTeam={false}
                      formatMode={formatMode}
                      leagueUsers={leagueUsers}
                      sleeperUserId={sleeperUserId}
                      managerId={teamBManager}
                      onManagerChange={handleManagerChange}
                      strategy={teamBStrategy}
                      setStrategy={setTeamBStrategy}
                      totalReceived={totalB}
                      premium={premium}
                      bestAssetSide={bestAssetSide}
                      hasPenalty={hasPenaltyB}
                      isOneForOne={isOneForOne}
                      query={queryB}
                      setQuery={setQueryB}
                      playersData={playersData}
                      activeRoster={activeRosterB}
                      receivedPlayers={teamBPlayers}
                      sentPlayers={teamAPlayers}
                      togglePlayerInTrade={togglePlayerInTrade}
                      addPlayer={addPlayer}
                      removePlayer={removePlayer}
                      handlePickSelect={handlePickSelect}
                      getPlayerValue={getPlayerValue}
                      DRAFT_PICKS={DRAFT_PICKS}
                      myTeamName={null}
                      myAvatar={null}
                      selectedUser={selectedUserB}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}