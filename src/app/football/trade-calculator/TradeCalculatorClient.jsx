'use client';

import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Trophy, Plus, X } from 'lucide-react'; 
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
  const [isRefreshingLeague, setIsRefreshingLeague] = useState(false); 
  
  // --- Master Trade State ---
  const [formatMode, setFormatMode] = useState('dynasty'); 
  const [teamsCount, setTeamsCount] = useState(2); 
  const [tradeAssets, setTradeAssets] = useState([]); 
  const [pendingAsset, setPendingAsset] = useState(null); 

  const [teamManagers, setTeamManagers] = useState({ A: '', B: '', C: '' });
  const [teamStrategies, setTeamStrategies] = useState({ A: 'neutral', B: 'neutral', C: 'neutral' });
  const [searchQueries, setSearchQueries] = useState({ A: '', B: '', C: '' });

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
            } catch (err) { console.error("Failed to load sleeper master players list", err); }
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

          if (sleeperUserId) setTeamManagers(prev => ({ ...prev, A: sleeperUserId }));
        } catch (e) {
          console.error("Failed to fetch sleeper league data", e);
        }
      };
      fetchSleeperData();
    } else {
       setLeagueUsers([]);
       setLeagueRosters([]);
       setTeamManagers({ A: '', B: '', C: '' });
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

  const { activeRosters, evaluations } = useTradeEngine({
    playersData, sleeperPlayersMap, leagueRosters, teamsCount, tradeAssets,
    teamManagers, teamStrategies, formatMode, isSuperflex, pprValue, passTdValue, tePremium
  });

  const handleManagerChange = (managerId, teamId) => {
    setTeamManagers(prev => ({ ...prev, [teamId]: managerId }));
    setTradeAssets(prev => prev.filter(a => a.fromTeam !== teamId && a.toTeam !== teamId));
  };

  const removeAsset = (uniqueId) => {
    setTradeAssets(prev => prev.filter(a => a.uniqueId !== uniqueId));
  };

  const addAssetToTrade = (player, fromTeam, toTeam) => {
    const uniqueId = player.id + Date.now();
    setTradeAssets(prev => [...prev, { ...player, fromTeam, toTeam, uniqueId }]);
    setPendingAsset(null);
  };

  // 🚀 Synced Roster Selection
  const handlePlayerClick = (player, fromTeam) => {
    if (teamsCount === 2) {
        const toTeam = fromTeam === 'A' ? 'B' : 'A';
        addAssetToTrade(player, fromTeam, toTeam);
    } else {
        setPendingAsset({ player, fromTeam });
    }
  };

  // 🚀 Manual Search Selection
  const handleManualAdd = (player, toTeam) => {
      if (teamsCount === 2) {
          const fromTeam = toTeam === 'A' ? 'B' : 'A';
          addAssetToTrade(player, fromTeam, toTeam);
      } else {
          setPendingAsset({ player, toTeam });
      }
  };

  // 🚀 Pick Selection
  const handlePickSelect = (pickId, paneTeamId, isSyncedPane) => {
    if (!pickId) return;
    const pick = DRAFT_PICKS.find(p => p.id === pickId);
    if (!pick) return;

    if (isSyncedPane) {
        if (teamsCount === 2) {
            const toTeam = paneTeamId === 'A' ? 'B' : 'A';
            addAssetToTrade(pick, paneTeamId, toTeam);
        } else {
            setPendingAsset({ player: pick, fromTeam: paneTeamId });
        }
    } else {
        if (teamsCount === 2) {
            const fromTeam = paneTeamId === 'A' ? 'B' : 'A';
            addAssetToTrade(pick, fromTeam, paneTeamId);
        } else {
            setPendingAsset({ player: pick, toTeam: paneTeamId });
        }
    }
  };

  // 🚀 Restore the Missing Verdict Text Logic
  let verdictTitle = "Select assets to evaluate trade";
  let verdictSubtitle = "Toggle players to see the package analysis.";
  let verdictColor = "text-gray-500";

  if (teamsCount === 2) {
      const totalA = evaluations.A.receivedTotal;
      const totalB = evaluations.B.receivedTotal;
      const totalBoth = totalA + totalB;

      if (totalBoth > 0) {
          const diff = Math.abs(totalA - totalB);
          const diffPct = (diff / totalBoth) * 100;
          const winner = totalA > totalB ? 'Team A' : 'Team B';
          const loser = totalA > totalB ? 'Team B' : 'Team A';
          const bestAssetTeam = totalA > totalB ? 'A' : 'B';
          
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

          if (diffPct > 5 && evaluations[bestAssetTeam].premium > 0 && evaluations[bestAssetTeam].receivedAssets.length > 0) {
              const bestAssetName = evaluations[bestAssetTeam].receivedAssets[0].name;
              verdictSubtitle += ` ${winner} receives a structural premium for acquiring ${bestAssetName}, consolidating elite value in this multi-player deal.`;
          }
      }
  } else {
      const totalAll = evaluations.A.receivedTotal + evaluations.B.receivedTotal + evaluations.C.receivedTotal;
      if (totalAll > 0) {
          verdictTitle = "⚖️ 3-Team Trade Analysis";
          verdictColor = "text-zinc-300";
          verdictSubtitle = "Evaluate the net gains and losses for each manager to ensure structural balance.";
      }
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative pt-6 lg:pt-8">
      
      {/* 🚀 Modal Pop-Up for 3-Team Trade Assignments */}
      {pendingAsset && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-[#1a1a1a] border border-gray-700 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
              <h3 className="text-xl font-black text-white uppercase mb-2">
                  {pendingAsset.fromTeam ? 'Send Asset To:' : 'Receive Asset From:'}
              </h3>
              <p className="text-sm font-bold text-gray-400 mb-6">{pendingAsset.player.name}</p>
              <div className="flex flex-col gap-3">
                 {['A', 'B', 'C']
                    .filter(t => (pendingAsset.fromTeam ? t !== pendingAsset.fromTeam : t !== pendingAsset.toTeam) && (teamsCount === 3 || t !== 'C'))
                    .map(t => {
                    const manager = leagueUsers.find(u => u.user_id === teamManagers[t]);
                    const nameLabel = manager ? (manager.metadata?.team_name || manager.display_name) : `Team ${t}`;
                    return (
                        <button 
                            key={t}
                            onClick={() => {
                                if (pendingAsset.fromTeam) addAssetToTrade(pendingAsset.player, pendingAsset.fromTeam, t);
                                else addAssetToTrade(pendingAsset.player, t, pendingAsset.toTeam);
                            }} 
                            className="w-full py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-black uppercase tracking-widest rounded-xl border border-gray-600 transition-colors"
                        >
                           {nameLabel}
                        </button>
                    );
                 })}
              </div>
              <button 
                  onClick={() => setPendingAsset(null)} 
                  className="mt-6 w-full py-3 text-gray-500 hover:text-white font-bold uppercase text-xs tracking-widest transition-colors"
              >
                  Cancel
              </button>
           </div>
        </div>
      )}

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
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#1a1a1a] border border-green-500/20 rounded-xl overflow-hidden shadow-inner hidden sm:flex">
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
                
                {/* 🚀 RESTORED VERDICT BARS & MOVED BUTTON */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center items-center min-h-[140px]">
                    <h2 className={`text-center text-2xl font-black uppercase tracking-widest mb-2 ${verdictColor}`}>
                        {verdictTitle}
                    </h2>
                    <p className="text-center text-xs font-bold text-gray-400 max-w-2xl mx-auto mb-6 leading-relaxed">
                        {verdictSubtitle}
                    </p>
                    <div className="w-full h-4 rounded-full bg-[#111] flex overflow-hidden border border-gray-800 shadow-inner">
                        {teamsCount === 2 ? (
                            <>
                                <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${(evaluations.A.receivedTotal / ((evaluations.A.receivedTotal + evaluations.B.receivedTotal) || 1)) * 100}%` }} />
                                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(evaluations.B.receivedTotal / ((evaluations.A.receivedTotal + evaluations.B.receivedTotal) || 1)) * 100}%` }} />
                            </>
                        ) : (
                            <>
                                <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${(evaluations.A.receivedTotal / ((evaluations.A.receivedTotal + evaluations.B.receivedTotal + evaluations.C.receivedTotal) || 1)) * 100}%` }} />
                                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(evaluations.B.receivedTotal / ((evaluations.A.receivedTotal + evaluations.B.receivedTotal + evaluations.C.receivedTotal) || 1)) * 100}%` }} />
                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(evaluations.C.receivedTotal / ((evaluations.A.receivedTotal + evaluations.B.receivedTotal + evaluations.C.receivedTotal) || 1)) * 100}%` }} />
                            </>
                        )}
                    </div>

                    {/* 🚀 ADD 3RD TEAM BUTTON (Moved into the corner of the verdict box) */}
                    <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
                        {teamsCount === 2 ? (
                            <button 
                                onClick={() => setTeamsCount(3)}
                                className="flex items-center gap-2 bg-[#111] hover:bg-gray-800 border border-gray-700 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm"
                            >
                                <Plus size={14} /> Add 3rd Team
                            </button>
                        ) : (
                            <button 
                                onClick={() => { setTeamsCount(2); setTeamManagers(prev => ({ ...prev, C: '' })); setTradeAssets(prev => prev.filter(a => a.fromTeam !== 'C' && a.toTeam !== 'C')); }}
                                className="flex items-center gap-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500 text-red-500 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm"
                            >
                                <X size={14} /> Remove 3rd Team
                            </button>
                        )}
                    </div>
                </div>

                {/* 🚀 DYNAMIC TEAM GRID */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {['A', 'B', 'C'].map(teamId => {
                        if (teamsCount === 2 && teamId === 'C') return null;

                        return (
                            <TeamPane 
                                key={teamId}
                                isSynced={!!activeLeague}
                                teamId={teamId}
                                isMyTeam={teamId === 'A'}
                                formatMode={formatMode}
                                leagueUsers={leagueUsers}
                                sleeperUserId={sleeperUserId}
                                managerId={teamManagers[teamId]}
                                onManagerChange={handleManagerChange}
                                strategy={teamStrategies[teamId]}
                                setStrategy={(val) => setTeamStrategies(prev => ({ ...prev, [teamId]: val }))}
                                evaluation={evaluations[teamId]}
                                query={searchQueries[teamId]}
                                setQuery={(val) => setSearchQueries(prev => ({ ...prev, [teamId]: val }))}
                                playersData={playersData}
                                activeRoster={activeRosters[teamId]}
                                teamsCount={teamsCount}
                                onPlayerClick={handlePlayerClick}
                                onManualAdd={handleManualAdd}
                                onPickSelect={handlePickSelect}
                                removeAsset={removeAsset}
                                DRAFT_PICKS={DRAFT_PICKS}
                            />
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}