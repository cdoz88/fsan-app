'use client';

import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Trophy, ShieldCheck, ChevronRight } from 'lucide-react'; 
import { useLeague } from '../../../context/LeagueContext'; 
import { useOmfgTradeEngine } from '../../../hooks/useOmfgTradeEngine'; 
import OmfgTeamPane from './OmfgTeamPane'; 

export default function OmfgTradeCalculatorClient() {
  const { getActiveLeagueData, sleeperUserId } = useLeague();
  const activeLeague = getActiveLeagueData('football');

  // --- Core State Variables ---
  const [playersData, setPlayersData] = useState([]);
  const [sleeperPlayersMap, setSleeperPlayersMap] = useState({}); 
  const [isSyncing, setIsSyncing] = useState(true);

  const [leagueUsers, setLeagueUsers] = useState([]);
  const [leagueRosters, setLeagueRosters] = useState([]);
  const [leagueTradedPicks, setLeagueTradedPicks] = useState([]); 
  const [isDraftComplete, setIsDraftComplete] = useState(false); 
  const [isRefreshingLeague, setIsRefreshingLeague] = useState(false); 
  
  // Format and Navigation Toggles
  const [formatMode, setFormatMode] = useState('redraft'); 
  const [teamsCount, setTeamsCount] = useState(2); 
  const [tradeDeadline, setTradeDeadline] = useState('Week 10');
  const [isDeadlineDropdownOpen, setIsDeadlineDropdownOpen] = useState(false);
  const [activeWeekNum, setActiveWeekNum] = useState(1);

  // Asset Management
  const [tradeAssets, setTradeAssets] = useState([]); 
  const [pendingAsset, setPendingAsset] = useState(null); 

  const [teamManagers, setTeamManagers] = useState({ A: '', B: '', C: '' });
  const [teamStrategies, setTeamStrategies] = useState({ A: 'neutral', B: 'neutral', C: 'neutral' });
  const [searchQueries, setSearchQueries] = useState({ A: '', B: '', C: '' });

  // Custom Scoring Settings
  const [showSettings, setShowSettings] = useState(false);
  const [manualIsSuperflex, setManualIsSuperflex] = useState(false); 
  const [manualPprValue, setManualPprValue] = useState(1);       
  const [manualPassTdValue, setManualPassTdValue] = useState(6); 
  const [manualTePremium, setManualTePremium] = useState(0);   

  // Active Scoring Settings (League context overrides manual choices if synced)
  const isSuperflex = activeLeague?.rosterPositions ? activeLeague.rosterPositions.includes('SUPER_FLEX') : manualIsSuperflex;
  const pprValue = activeLeague?.scoringSettings?.rec ?? manualPprValue;
  const passTdValue = activeLeague?.scoringSettings?.pass_td ?? manualPassTdValue;
  const tePremium = activeLeague?.scoringSettings?.bonus_rec_te ?? manualTePremium;

  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#e42d38';
  const secondaryColor = '#8a1a20';

  // URL Sync for Format Mode
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

  // Load OMFG Database Data (SOS, WOW, ROS)
  useEffect(() => {
    async function loadAllData() {
      try {
        const dynRes = await fetch('/api/dynasty-players');
        const dynData = await dynRes.json();
        const basePlayers = (dynData.success && dynData.players) ? dynData.players : [];

        const metaRes = await fetch(`/api/omfg-data?year=2026&week=Week 1`);
        const metaData = await metaRes.json();
        let latestYear = '2026';
        let latestWeek = 'Week 1';
        
        if (metaData.available_models) {
            const activeWeekly = metaData.available_models.filter(m => m.week !== 'Season');
            if (activeWeekly.length > 0) {
                latestYear = String(activeWeekly[0].year);
                latestWeek = activeWeekly[0].week;
                setActiveWeekNum(parseInt(latestWeek.replace(/\D/g, '')) || 1);
            }
        }

        const [sosRes, wowRes, rosRes] = await Promise.all([
          fetch(`/api/omfg-data?year=${latestYear}&week=Season`),
          fetch(`/api/omfg-data?year=${latestYear}&week=${latestWeek}`),
          fetch(`/api/omfg-data?year=${latestYear}&week=${encodeURIComponent('Rest of Season')}`)
        ]);

        const sosJson = await sosRes.json();
        const wowJson = await wowRes.json();
        const rosJson = await rosRes.json();

        const sosPlayers = sosJson.success && sosJson.players ? sosJson.players : [];
        const wowPlayers = wowJson.success && wowJson.players ? wowJson.players : [];
        const rosPlayers = rosJson.success && rosJson.players ? rosJson.players : [];

        const normalizeName = (name) => name ? name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(jr|sr|ii|iii|iv|v)$/, '') : '';

        const sosMap = {}; sosPlayers.forEach(p => { if (p.Player) sosMap[normalizeName(p.Player)] = p; });
        const wowMap = {}; wowPlayers.forEach(p => { if (p.Player) wowMap[normalizeName(p.Player)] = p; });
        const rosMap = {}; rosPlayers.forEach(p => { if (p.Player) rosMap[normalizeName(p.Player)] = p; });

        const merged = basePlayers.map(p => {
            const cleanName = normalizeName(p.name);
            const sData = sosMap[cleanName] || {};
            const wData = wowMap[cleanName] || {};
            const rData = rosMap[cleanName] || {};
            
            const SOS_OMFG = Number(sData['OMFG Score']) || 50;
            const WOW_OMFG = Number(wData['In-Season OMFG Score'] ?? wData['Preseason OMFG'] ?? wData['OMFG Score']) || SOS_OMFG;
            const ROS_OMFG = Number(rData['OMFG Score'] ?? rData['ROS OMFG'] ?? rData['Preseason OMFG']) || SOS_OMFG;
            
            const P25 = Number(rData['Floor (P25)'] ?? sData['Floor (P25)']) || 0;
            const P50 = Number(rData['Base (P50)'] ?? sData['Base (P50)']) || 0;
            const P75 = Number(rData['Ceiling (P75)'] ?? sData['Ceiling (P75)']) || 0;
            const weekly_proj_pts = Number(wData['Projected Fantasy Points']) || (P50 / 17) || 0;

            const cRank = Number(wData['Consensus Rank'] ?? sData['Consensus Rank']);
            const mRank = Number(wData['Rank'] ?? wData['SOS Rank'] ?? sData['Rank'] ?? sData['SOS Rank']);
            
            let OMFG_Edge = (!isNaN(cRank) && cRank > 0 && !isNaN(mRank) && mRank > 0) ? (cRank - mRank) : (Number(wData['Consensus Rank Gap'] ?? wData['Rank Gap'] ?? sData['Consensus Rank Gap'] ?? sData['Rank Gap']) || 0);

            const pass_tds_season = Number(rData['Pass Td'] ?? sData['Pass Td'] ?? sData['Pass TD'] ?? sData['PASS TDS']) || 0;
            const receptions_season = Number(rData['Receptions'] ?? rData['Rec'] ?? sData['Receptions'] ?? sData['REC']) || 0;
            const pass_tds_week = Number(wData['Pass Td'] ?? wData['Pass TD'] ?? wData['PASS TDS']) || (pass_tds_season / 17) || 0;
            const receptions_week = Number(wData['Receptions'] ?? wData['REC']) || (receptions_season / 17) || 0;

            return {
                ...p, SOS_OMFG, WOW_OMFG, ROS_OMFG, P25, P50, P75, weekly_proj_pts, OMFG_Edge,
                pass_tds_season, receptions_season, pass_tds_week, receptions_week
            };
        }).filter(p => p.P50 > 0 || p.weekly_proj_pts > 0);

        setPlayersData(merged);
      } catch (err) {
        console.error("Error loading OMFG Trade Calculator base data", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadAllData();
  }, []);

  // Fetch Sleeper Player Map
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

  // Fetch Sleeper League Sync Data
  useEffect(() => {
    if (activeLeague && activeLeague.platform === 'sleeper') {
      const fetchSleeperData = async () => {
        try {
          const timestamp = Date.now();
          const [usersRes, rostersRes, tradedPicksRes, draftsRes] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/users?_t=${timestamp}`),
            fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/rosters?_t=${timestamp}`),
            fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/traded_picks?_t=${timestamp}`),
            fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/drafts?_t=${timestamp}`)
          ]);
          const users = await usersRes.json();
          const rosters = await rostersRes.json();
          const tradedPicks = await tradedPicksRes.json();
          const drafts = await draftsRes.json();

          setLeagueUsers(users);
          setLeagueRosters(rosters);
          setLeagueTradedPicks(tradedPicks);
          setIsDraftComplete(drafts && drafts.length > 0 ? drafts[0].status === 'complete' : false);

          if (sleeperUserId) setTeamManagers(prev => ({ ...prev, A: sleeperUserId }));
        } catch (e) {
          console.error("Failed to fetch sleeper league data", e);
        }
      };
      fetchSleeperData();
    } else {
       setLeagueUsers([]); setLeagueRosters([]); setLeagueTradedPicks([]); setIsDraftComplete(false);
       setTeamManagers({ A: '', B: '', C: '' });
    }
  }, [activeLeague, sleeperUserId]);

  const refreshLeagueData = async () => {
    if (!activeLeague || activeLeague.platform !== 'sleeper') return;
    setIsRefreshingLeague(true);
    try {
      const timestamp = Date.now();
      const [usersRes, rostersRes, tradedPicksRes, draftsRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/users?_t=${timestamp}`),
        fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/rosters?_t=${timestamp}`),
        fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/traded_picks?_t=${timestamp}`),
        fetch(`https://api.sleeper.app/v1/league/${activeLeague.id}/drafts?_t=${timestamp}`)
      ]);
      setLeagueUsers(await usersRes.json());
      setLeagueRosters(await rostersRes.json());
      setLeagueTradedPicks(await tradedPicksRes.json());
      const drafts = await draftsRes.json();
      setIsDraftComplete(drafts && drafts.length > 0 ? drafts[0].status === 'complete' : false);
    } catch (e) {
      console.error("Failed to refresh sleeper league data", e);
    } finally {
      setIsRefreshingLeague(false);
    }
  };

  // ⚡ Hook into our custom OMFG Trade Engine
  const { activeRosters, evaluations, getPlayerValue, DRAFT_PICKS } = useOmfgTradeEngine({
    playersData, sleeperPlayersMap, leagueRosters, leagueTradedPicks, leagueUsers, activeLeague,
    teamsCount, tradeAssets, teamManagers, teamStrategies, formatMode, tradeDeadline, activeWeekNum,
    isSuperflex, pprValue, passTdValue, tePremium, isDraftComplete 
  });

  const handleManagerChange = (managerId, teamId) => {
    setTeamManagers(prev => ({ ...prev, [teamId]: managerId }));
    setTradeAssets(prev => prev.filter(a => a.fromTeam !== teamId && a.toTeam !== teamId));
  };

  const removeAssetByName = (name) => {
    setTradeAssets(prev => prev.filter(a => a.name !== name));
  };

  const addAssetToTrade = (player, fromTeam, toTeam) => {
    const uniqueId = player.name + Date.now();
    setTradeAssets(prev => [...prev, { ...player, fromTeam, toTeam, uniqueId }]);
    setPendingAsset(null);
  };

  const handlePlayerClick = (player, fromTeam) => {
    if (teamsCount === 2) {
        const toTeam = fromTeam === 'A' ? 'B' : 'A';
        addAssetToTrade(player, fromTeam, toTeam);
    } else {
        setPendingAsset({ player, fromTeam });
    }
  };

  const handleManualAdd = (player, toTeam) => {
      if (teamsCount === 2) {
          const fromTeam = toTeam === 'A' ? 'B' : 'A';
          addAssetToTrade(player, fromTeam, toTeam);
      } else {
          setPendingAsset({ player, toTeam });
      }
  };

  // Dynamic Verdict Analysis
  let verdictTitle = "Select assets to evaluate trade";
  let verdictSubtitle = "Toggle players or draft picks to evaluate package balance using OMFG values.";
  let verdictColor = "text-gray-500";

  const hasAssetsFromA = tradeAssets.some(a => a.fromTeam === 'A');
  const hasAssetsFromB = tradeAssets.some(a => a.fromTeam === 'B');
  const hasAssetsFromC = tradeAssets.some(a => a.fromTeam === 'C');

  let canEvaluate = teamsCount === 2 ? (hasAssetsFromA && hasAssetsFromB) : (((hasAssetsFromA ? 1 : 0) + (hasAssetsFromB ? 1 : 0) + (hasAssetsFromC ? 1 : 0)) >= 2);

  if (teamsCount === 2) {
      const totalA = evaluations.A.receivedTotal;
      const totalB = evaluations.B.receivedTotal;
      const totalBoth = totalA + totalB;

      if (canEvaluate && totalBoth > 0) {
          const diff = Math.abs(totalA - totalB);
          const diffPct = (diff / totalBoth) * 100;
          const winner = totalA > totalB ? 'Team A' : 'Team B';
          const loser = totalA > totalB ? 'Team B' : 'Team A';
          const bestAssetTeam = totalA > totalB ? 'A' : 'B';
          
          if (diffPct <= 5) {
              verdictTitle = "🤝 Fair Trade";
              verdictColor = "text-zinc-300";
              verdictSubtitle = "Highly balanced deal. Both managers extract equitable OMFG asset value based on their strategies.";
          } else if (diffPct <= 12) {
              verdictTitle = `⚖️ Slight Edge: ${winner}`;
              verdictColor = totalA > totalB ? "text-red-400" : "text-blue-400";
              verdictSubtitle = `A viable trade, but ${winner} extracts roughly ${Math.round(diffPct)}% more OMFG value overall.`;
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
              verdictSubtitle += ` ${winner} receives a consolidation premium for acquiring ${bestAssetName}.`;
          }
      } else if (!canEvaluate && totalBoth > 0) {
          verdictTitle = "Awaiting other side...";
          verdictSubtitle = "Add assets to the other side of the trade to evaluate.";
      }
  } else {
      const totalAll = evaluations.A.receivedTotal + evaluations.B.receivedTotal + evaluations.C.receivedTotal;
      if (canEvaluate && totalAll > 0) {
          verdictTitle = "⚖️ 3-Team Trade Analysis";
          verdictColor = "text-zinc-300";
          verdictSubtitle = "Evaluate the net OMFG gains and losses for each manager to ensure structural balance.";
      } else if (!canEvaluate && totalAll > 0) {
          verdictTitle = "Awaiting other sides...";
          verdictSubtitle = "Add assets to multiple teams to evaluate.";
      }
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative">
      
      {/* 3-Team Trade Assignment Modal */}
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
      <div className="relative w-full h-[220px] md:h-[260px] flex items-center overflow-hidden rounded-2xl mb-8 shadow-2xl">
        <div className="absolute inset-0 opacity-80 z-0" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }} />
        <img src={bgImage} alt="Football Background" className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
        
        <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between h-full px-6 md:px-10 pb-4 sm:pb-0 gap-4">
          <div className="max-w-2xl w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3 shadow-inner backdrop-blur-sm">
              <ShieldCheck size={12} /> OMFG-Powered Valuations
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              Trade Calculator
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Analyze multi-player deals using OMFG role profiles and dynamic trade deadline weights.
            </p>
          </div>

          <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-2xl shrink-0 mt-4 md:mt-0 self-start md:self-end md:mb-8">
            <button onClick={() => setFormatMode('redraft')} className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${formatMode === 'redraft' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>Redraft</button>
            <button onClick={() => setFormatMode('dynasty')} className={`px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${formatMode === 'dynasty' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>Dynasty</button>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Controls Row */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 relative z-[100] w-full">
          
          <div className="flex flex-row flex-wrap items-center gap-2 xl:gap-4 w-full pb-2 -mb-2">
            
            {/* Teams Count Toggle */}
            <div className="flex bg-[#111] p-1 rounded-2xl shadow-inner border border-gray-800 w-fit shrink-0">
              <button 
                  onClick={() => { setTeamsCount(2); setTeamManagers(prev => ({ ...prev, C: '' })); setTradeAssets(prev => prev.filter(a => a.fromTeam !== 'C' && a.toTeam !== 'C')); }}
                  className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${teamsCount === 2 ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}
              >
                  2 Teams
              </button>
              <button 
                  onClick={() => setTeamsCount(3)}
                  className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${teamsCount === 3 ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}
              >
                  3 Teams
              </button>
            </div>

            {/* Styled Trade Deadline Dropdown */}
            <div className="flex items-center bg-[#111] p-1 rounded-2xl border border-gray-800 w-fit shrink-0">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest pl-3 pr-2">Trade Deadline:</span>
              
              <div className="relative" tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDeadlineDropdownOpen(false); }}>
                <button
                  type="button"
                  onClick={() => setIsDeadlineDropdownOpen(!isDeadlineDropdownOpen)}
                  className={`flex items-center justify-between gap-2 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-xl border transition-all ${isDeadlineDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-700 hover:border-gray-500'}`}
                >
                  <span>{tradeDeadline === 'None' ? 'None' : tradeDeadline.replace('Week ', 'Wk ')}</span>
                  <ChevronRight size={12} className={`transform transition-transform text-gray-400 ${isDeadlineDropdownOpen ? '-rotate-90 text-blue-400' : 'rotate-90'}`} />
                </button>
                
                {isDeadlineDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-32 bg-[#181818] border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden z-[150] animate-in fade-in slide-in-from-top-2 duration-150">
                    {['Week 10', 'Week 11', 'Week 12', 'None'].map(dl => (
                      <button
                        key={dl}
                        type="button"
                        onClick={() => { setTradeDeadline(dl); setIsDeadlineDropdownOpen(false); }}
                        className={`w-full text-left px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-l-2 ${tradeDeadline === dl ? 'bg-red-950/40 text-red-500 border-red-500' : 'text-gray-300 border-transparent hover:bg-[#222] hover:text-white'}`}
                      >
                        {dl}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Synced status / Custom Scoring toggle pushed to far right */}
          <div className="flex items-center gap-4 w-full xl:w-auto xl:justify-end shrink-0">
             {activeLeague ? (
                <div className="flex items-center bg-[#1a1a1a]/90 backdrop-blur-sm border border-green-500/30 rounded-xl overflow-hidden shadow-lg">
                  <div className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-green-500/10 text-green-400 pointer-events-none">
                    <Trophy size={14} className="sm:w-4 sm:h-4" /> Synced to {activeLeague.name}
                  </div>
                  <button 
                    onClick={(e) => { e.preventDefault(); refreshLeagueData(); }}
                    disabled={isRefreshingLeague}
                    title="Refresh Rosters"
                    className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 bg-green-500/5 hover:bg-green-500/20 text-green-500 transition-all border-l border-green-500/20 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={`sm:w-4 sm:h-4 ${isRefreshingLeague ? "animate-spin" : ""}`} />
                  </button>
                </div>
            ) : (
                <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ml-auto xl:ml-0 ${showSettings ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'}`}>
                  <Settings size={14} className="sm:w-4 sm:h-4" /> {showSettings ? 'Hide Settings' : 'Custom Scoring'}
                </button>
            )}
          </div>

        </div>

        {/* Custom Scoring Panel */}
        {showSettings && !activeLeague && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Syncing OMFG Asset Values</h3>
            </div>
        ) : (
            <div className="flex flex-col gap-6 sm:gap-8">
                
                {/* Verdict Bar */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center items-center min-h-[100px] sm:min-h-[120px]">
                    <h2 className={`text-center text-lg sm:text-2xl font-black uppercase tracking-widest mb-2 ${verdictColor}`}>
                        {verdictTitle}
                    </h2>
                    <p className="text-center text-[10px] sm:text-xs font-bold text-gray-400 max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed">
                        {verdictSubtitle}
                    </p>
                    <div className="w-full h-3 sm:h-4 rounded-full bg-[#111] flex overflow-hidden border border-gray-800 shadow-inner">
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
                </div>

                {/* Team Panes */}
                <div className="flex flex-row gap-1 sm:gap-6 w-full min-w-0">
                    {['A', 'B', 'C'].map(teamId => {
                        if (teamsCount === 2 && teamId === 'C') return null;

                        return (
                            <div key={teamId} className="flex-1 min-w-0">
                                <OmfgTeamPane 
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
                                    removeAssetByName={removeAssetByName}
                                    DRAFT_PICKS={DRAFT_PICKS}
                                    getPlayerValue={getPlayerValue} 
                                />
                            </div>
                        );
                    })}
                </div>

            </div>
        )}
      </div>
    </div>
  );
}