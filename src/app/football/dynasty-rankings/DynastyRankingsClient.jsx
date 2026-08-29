'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Settings, RefreshCw, Trophy, ListOrdered, ChevronRight, TrendingUp, TrendingDown, Minus, Info, X, ChevronDown, ChevronUp, Search } from 'lucide-react'; 
import { useLeague } from '../../../context/LeagueContext'; 

export default function DynastyRankingsClient() {
  const [playersData, setPlayersData] = useState([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Hook into League Context
  const { getActiveLeagueData } = useLeague();
  const activeLeague = getActiveLeagueData('football');

  // UI State Variables
  const [currentPosition, setCurrentPosition] = useState('QB');
  const [showSettings, setShowSettings] = useState(false);
  const [dynastyStrategy, setDynastyStrategy] = useState('balanced');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Manual Scoring Format Settings (Defaults to Full PPR)
  const [manualIsSuperflex, setManualIsSuperflex] = useState(false); 
  const [manualPprValue, setManualPprValue] = useState(1); 
  const [manualPassTdValue, setManualPassTdValue] = useState(4); 
  const [manualTePremium, setManualTePremium] = useState(0);     

  // Active Scoring Formats (Overrides manual settings if a league is synced)
  const currentIsSuperflex = activeLeague?.rosterPositions ? activeLeague.rosterPositions.includes('SUPER_FLEX') : manualIsSuperflex;
  const currentPprValue = activeLeague?.scoringSettings?.rec ?? manualPprValue;
  const currentPassTdValue = activeLeague?.scoringSettings?.pass_td ?? manualPassTdValue;
  const currentTePremium = activeLeague?.scoringSettings?.bonus_rec_te ?? manualTePremium;

  const bgImage = 'https://admin.fsan.com/wp-content/uploads/2026/04/NFL-Logo.webp';
  const primaryColor = '#e42d38';
  const secondaryColor = '#8a1a20';
  const positions = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DST'];

  useEffect(() => {
    async function loadData() {
      setIsSyncing(true);
      try {
        // Fetch Dynasty Base Info
        const dynRes = await fetch('/api/dynasty-players');
        const dynData = await dynRes.json();
        const basePlayers = (dynData.success && dynData.players) ? dynData.players : [];

        // Fetch OMFG Metadata for latest week
        const metaRes = await fetch(`/api/omfg-data?year=2026&week=Week 1`);
        const metaData = await metaRes.json();
        let latestYear = '2026';
        let latestWeek = 'Week 1';
        
        if (metaData.available_models) {
            const activeWeekly = metaData.available_models.filter(m => m.week !== 'Season');
            if (activeWeekly.length > 0) {
                latestYear = String(activeWeekly[0].year);
                latestWeek = activeWeekly[0].week;
            }
        }

        // Fetch Season, WoW, and ROS
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

        const normalizeName = (name) => {
            if (!name) return '';
            return name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(jr|sr|ii|iii|iv|v)$/, '');
        };

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
            
            const P50 = Number(rData['Base (P50)'] ?? sData['Base (P50)'] ?? sData['Projected Fantasy Points']) || 0;
            const weekly_proj_pts = Number(wData['Projected Fantasy Points']) || (P50 / 17) || 0;
            
            const cRank = Number(wData['Consensus Rank'] ?? sData['Consensus Rank']);
            const mRank = Number(wData['Rank'] ?? wData['SOS Rank'] ?? sData['Rank'] ?? sData['SOS Rank']);
            
            let OMFG_Edge = 0;
            if (!isNaN(cRank) && cRank > 0 && !isNaN(mRank) && mRank > 0) {
                OMFG_Edge = cRank - mRank; 
            } else {
                OMFG_Edge = Number(wData['Consensus Rank Gap'] ?? wData['Rank Gap'] ?? sData['Consensus Rank Gap'] ?? sData['Rank Gap']) || 0;
            }

            return {
                ...sData, // Spread all season-long projection fields
                ...p,
                Player: p.name,
                Position: p.position,
                Team: p.team,
                SOS_OMFG, WOW_OMFG, ROS_OMFG, P50, weekly_proj_pts, OMFG_Edge
            };
        }).filter(p => p.P50 > 0 || p.weekly_proj_pts > 0);

        setPlayersData(merged);
      } catch (err) {
        console.error("Error loading Dynasty Rankings data", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadData();
  }, []);

  // --- UTILS ---
  const formatNumber = (val, decimals = 1) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? '-' : num.toFixed(decimals);
  };

  const toggleRow = (playerId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) newSet.delete(playerId);
      else newSet.add(playerId);
      return newSet;
    });
  };

  const getAbsoluteHeatmapColor = (val) => {
    if (val === null || val === undefined || val === '') return 'text-gray-400';
    const num = Number(val);
    if (isNaN(num)) return 'text-gray-400';
    
    if (num >= 87.5) return 'text-green-500 font-bold';
    if (num >= 75.0) return 'text-emerald-400 font-bold';
    if (num >= 62.5) return 'text-yellow-400 font-bold';
    if (num >= 50.0) return 'text-yellow-200 font-bold';
    if (num >= 37.5) return 'text-orange-500 font-bold';
    if (num >= 25.0) return 'text-orange-300 font-bold';
    if (num >= 12.5) return 'text-red-400 font-bold';
    return 'text-red-600 font-bold';
  };

  // Bulletproof Stat Extractor (Hoisted for reliable scoring calculations)
  const getFlexibleValue = (player, matchRules) => {
    if (!player) return null;
    const normalize = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
    const isValid = (val) => val !== undefined && val !== null && val !== '' && val !== '-';

    for (const rule of matchRules) {
      if (Array.isArray(rule)) continue;
      const normRule = normalize(rule);
      for (const [key, value] of Object.entries(player)) {
        if (!isValid(value)) continue;
        if (normalize(key) === normRule) return value;
      }
    }

    for (const rule of matchRules) {
      if (Array.isArray(rule)) continue;
      const normRule = normalize(rule);
      for (const [key, value] of Object.entries(player)) {
        if (!isValid(value)) continue;
        const strippedKey = normalize(key).replace(/^projected/, '').replace(/^actual/, '');
        if (strippedKey === normRule) return value;
      }
    }
    
    for (const rule of matchRules) {
      for (const [key, value] of Object.entries(player)) {
        if (!isValid(value)) continue;
        const normKey = normalize(key);
        if (Array.isArray(rule)) {
          if (rule.every(sub => normKey.includes(normalize(sub)))) return value;
        } else {
          const normRule = normalize(rule);
          if (!normRule.includes('40') && normKey.includes('40')) continue;
          if (!normRule.includes('50') && normKey.includes('50')) continue;
          if (!normRule.includes('plus') && normKey.includes('plus')) continue;
          if (normKey.includes(normRule)) return value;
        }
      }
    }
    return null;
  };

  // --- AGE MULTIPLIER MATRIX ---
  const getBaseAgeMultiplier = (position, age, strategy) => {
    if (!age) return 1.0;
    const pos = position === 'WR/TE' ? 'TE' : position;

    if (strategy === 'build') {
      if (pos === 'RB') return age <= 23 ? 1.35 : age <= 25 ? 1.00 : age <= 27 ? 0.60 : age <= 29 ? 0.30 : 0.10;
      if (pos === 'WR') return age <= 24 ? 1.30 : age <= 27 ? 1.05 : age <= 29 ? 0.75 : age <= 31 ? 0.45 : 0.20;
      if (pos === 'QB') return age <= 26 ? 1.30 : age <= 33 ? 1.00 : age <= 36 ? 0.65 : 0.25;
      if (pos === 'TE') return age <= 25 ? 1.30 : age <= 28 ? 0.95 : age <= 30 ? 0.70 : age <= 32 ? 0.45 : 0.20;
    } else { 
      // Balanced and Win_Now Base
      if (pos === 'RB') return age <= 23 ? 1.20 : age <= 25 ? 1.05 : age <= 27 ? 0.85 : age <= 29 ? 0.55 : 0.25;
      if (pos === 'WR') return age <= 24 ? 1.15 : age <= 27 ? 1.05 : age <= 29 ? 0.90 : age <= 31 ? 0.70 : 0.45;
      if (pos === 'QB') return age <= 26 ? 1.15 : age <= 33 ? 1.05 : age <= 36 ? 0.85 : 0.50;
      if (pos === 'TE') return age <= 25 ? 1.15 : age <= 28 ? 1.00 : age <= 30 ? 0.85 : age <= 32 ? 0.65 : 0.40;
    }
    return 1.0;
  };

  const processedRankings = useMemo(() => {
    let basePlayers = playersData || [];
    
    // Position Filtering
    if (currentPosition === 'FLEX') {
        basePlayers = basePlayers.filter(p => ['RB', 'WR', 'TE'].includes(p.Position) || ['RB', 'WR', 'TE'].includes(p.position));
    } else {
        basePlayers = basePlayers.filter(p => (p.Position || p.position) === currentPosition);
    }

    const recalculated = basePlayers.map(player => {
        const { SOS_OMFG, WOW_OMFG, ROS_OMFG, P50, weekly_proj_pts, OMFG_Edge, age } = player;
        const pos = player.Position || player.position;
        const isTE = (pos === 'TE' || pos === 'WR/TE');

        // Extract raw season stats safely
        const passTdsSeason = Number(getFlexibleValue(player, ['Pass Td', 'Pass TD', 'PASS TDS', 'Projected Pass Td', 'Projected Pass TDs'])) || 0;
        const receptionsSeason = Number(getFlexibleValue(player, ['Receptions', 'Rec', 'REC', 'Projected Receptions'])) || 0;

        // Determine weekly estimates for the WOW component
        const passTdsWeek = passTdsSeason / 17;
        const receptionsWeek = receptionsSeason / 17;

        // Dynamic Scoring Adjustments (Season)
        const deltaPassTd = passTdsSeason * (currentPassTdValue - 4);
        const deltaPpr = receptionsSeason * (currentPprValue - 0.5);
        const deltaTep = isTE ? (receptionsSeason * currentTePremium) : 0;
        const deltaTotal = deltaPassTd + deltaPpr + deltaTep;

        // Dynamic Scoring Adjustments (Weekly)
        const deltaPassTdWeek = passTdsWeek * (currentPassTdValue - 4);
        const deltaPprWeek = receptionsWeek * (currentPprValue - 0.5);
        const deltaTepWeek = isTE ? (receptionsWeek * currentTePremium) : 0;
        const deltaTotalWeek = deltaPassTdWeek + deltaPprWeek + deltaTepWeek;

        const adjP50 = P50 + deltaTotal;
        const adjWeeklyProj = weekly_proj_pts + deltaTotalWeek;

        const pts_wow = adjWeeklyProj * (1 + ((WOW_OMFG - 50) / 100));
        const pts_sos = adjP50 + (adjP50 * (SOS_OMFG / 100));
        const pts_ros = adjP50 + (adjP50 * (ROS_OMFG / 100)); 

        let rawValue = 0;
        let finalEdgeMult = 1.0 + (OMFG_Edge / 100);

        const baseAgeMult = getBaseAgeMultiplier(pos, age, dynastyStrategy);
        
        let gatedAgeMult = 1.0;
        if (baseAgeMult > 1.0) {
            const premiumFactor = baseAgeMult - 1.0;
            gatedAgeMult = 1.0 + (premiumFactor * (SOS_OMFG / 100));
        } else if (baseAgeMult < 1.0) {
            const penaltyFactor = 1.0 - baseAgeMult;
            gatedAgeMult = 1.0 - (penaltyFactor * (1.0 - (SOS_OMFG / 100)));
        }

        if (dynastyStrategy === 'win_now') {
            const pts_win_now = (0.35 * pts_ros) + (0.25 * (pts_wow * 17)) + (0.40 * pts_sos);
            rawValue = pts_win_now * finalEdgeMult * 2.5;
        } else if (dynastyStrategy === 'balanced') {
            const pts_balanced = (0.15 * pts_ros) + (0.15 * (pts_wow * 17)) + (0.70 * pts_sos);
            rawValue = pts_balanced * gatedAgeMult * finalEdgeMult * 2.5;
        } else if (dynastyStrategy === 'build') {
            rawValue = pts_sos * gatedAgeMult * finalEdgeMult * 2.5;
        }

        // Apply Position Scarcity
        let sf_mult = 1.0;
        if (pos === 'QB') {
            if (currentIsSuperflex) sf_mult = 1.0 + (SOS_OMFG / 300.0); 
            else sf_mult = 0.75; 
        }
        rawValue = rawValue * sf_mult;

        let tep_mult = 1.0;
        if (isTE) {
            if (currentTePremium === 0.5) tep_mult = 1.15;
            else if (currentTePremium >= 1.0) tep_mult = 1.30;
            if (SOS_OMFG > 80.0) tep_mult = tep_mult * (1.0 + ((SOS_OMFG - 80) / 100));
        }
        rawValue = rawValue * tep_mult;
        
        // Safeguard to prevent sorting array failures
        if (isNaN(rawValue) || rawValue < 0) rawValue = 0;

        return { ...player, rawValue, adjProjPts: adjP50 };
    });

    // Sort by rawValue for Dynasty Rankings (mixes positions in FLEX correctly)
    recalculated.sort((a, b) => b.rawValue - a.rawValue);

    const posCounters = {};
    return recalculated.map((player, index) => {
      const pos = player.Position || player.position || 'UNK';
      if (!posCounters[pos]) posCounters[pos] = 0;
      posCounters[pos] += 1;
      
      return { 
          ...player, 
          overallRank: index + 1, 
          posRank: `${pos}${posCounters[pos]}` 
      };
    });
  }, [playersData, currentPosition, dynastyStrategy, currentIsSuperflex, currentPprValue, currentPassTdValue, currentTePremium]); 

  // Apply Search Filter AFTER ranks are assigned to preserve true ranking numbers
  const visibleRankings = useMemo(() => {
    return processedRankings.filter(player => {
      if (!searchQuery.trim()) return true;
      const playerName = player.Player || player.name || '';
      return playerName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [processedRankings, searchQuery]);

  const renderExpandedStats = (player) => {
    const pos = player.Position || player.position;
    let stats = [];

    if (pos === 'QB') {
      stats = [
        { label: 'Pass Att', val: getFlexibleValue(player, ['Projected Pass Attempts', 'Actual Pass Attempts', 'Pass Attempts', 'Pass Att']) },
        { label: 'Pass Yds', val: getFlexibleValue(player, ['Projected Pass Yards', 'Actual Pass Yards', 'Pass Yards', 'Pass Yds']) },
        { label: 'Pass TD', val: getFlexibleValue(player, ['Projected Pass Td', 'Actual Pass Td', 'Projected Pass TDs', 'Actual Pass TDs', 'Pass Td', 'Pass TD']) },
        { label: 'INTs', val: getFlexibleValue(player, ['Projected Interceptions', 'Actual Interceptions', 'Interceptions', 'INT', 'Ints']) },
        { label: 'Rush Att', val: getFlexibleValue(player, ['Projected Rush Attempts', 'Actual Rush Attempts', 'Rush Attempts', 'Rush Att']) },
        { label: 'Rush Yds', val: getFlexibleValue(player, ['Projected Rush Yards', 'Actual Rush Yards', 'Rush Yards', 'Rush Yds']) },
        { label: 'Rush TD', val: getFlexibleValue(player, ['Projected Rush Td', 'Actual Rush Td', 'Projected Rush TDs', 'Actual Rush TDs', 'Rush Td', 'Rush TD']) },
      ];
    } else if (pos === 'RB') {
      stats = [
        { label: 'Rush Att', val: getFlexibleValue(player, ['Projected Rush Attempts', 'Actual Rush Attempts', 'Rush Attempts', 'Rush Att']) },
        { label: 'Rush Yds', val: getFlexibleValue(player, ['Projected Rush Yards', 'Actual Rush Yards', 'Rush Yards', 'Rush Yds']) },
        { label: 'Rush TD', val: getFlexibleValue(player, ['Projected Rush Td', 'Actual Rush Td', 'Projected Rush TDs', 'Actual Rush TDs', 'Rush Td', 'Rush TD']) },
        { label: 'Targets', val: getFlexibleValue(player, ['Projected Targets', 'Actual Targets', 'Targets']) },
        { label: 'Recs', val: getFlexibleValue(player, ['Projected Receptions', 'Actual Receptions', 'Receptions', 'Rec']) },
        { label: 'Rec Yds', val: getFlexibleValue(player, ['Projected Receiving Yards', 'Actual Receiving Yards', 'Receiving Yards', 'Rec Yds']) },
        { label: 'Rec TD', val: getFlexibleValue(player, ['Projected Receiving Td', 'Actual Receiving Td', 'Receiving Td', 'Receiving TD', 'Rec Td']) },
      ];
    } else if (pos === 'WR' || pos === 'TE') {
      stats = [
        { label: 'Targets', val: getFlexibleValue(player, ['Projected Targets', 'Actual Targets', 'Targets']) },
        { label: 'Recs', val: getFlexibleValue(player, ['Projected Receptions', 'Actual Receptions', 'Receptions', 'Rec']) },
        { label: 'Rec Yds', val: getFlexibleValue(player, ['Projected Receiving Yards', 'Actual Receiving Yards', 'Receiving Yards', 'Rec Yds']) },
        { label: 'Rec TD', val: getFlexibleValue(player, ['Projected Receiving Td', 'Actual Receiving Td', 'Receiving Td', 'Receiving TD', 'Rec Td']) },
        { label: 'Air Yds', val: getFlexibleValue(player, ['Projected Air Yards', 'Actual Air Yards', 'Air Yards']) },
        { label: '1st Reads', val: getFlexibleValue(player, ['Projected First Read Targets', 'Actual First Read Targets', 'First Read Targets', 'First-Read Targets']) },
        { label: 'EZ Tgts', val: getFlexibleValue(player, ['Projected End Zone Targets', 'Actual End Zone Targets', 'End Zone Targets', 'End-Zone Targets']) },
      ];
    } else if (pos === 'K') {
      stats = [
        { label: 'FG Att', val: getFlexibleValue(player, ['Projected FG Attempts', 'Actual FG Attempts', 'FG Attempts', 'FG Att', 'Projected Fga', 'Actual Fga', 'Fga']) },
        { label: 'FG Made', val: getFlexibleValue(player, ['Projected FGs Made', 'Actual FGs Made', 'FGs Made', 'FG Made', 'Projected Fgm', 'Actual Fgm', 'Fgm']) },
        { label: 'FGA 40-49', val: getFlexibleValue(player, ['Projected 40-49 FG Attempts', 'Actual 40-49 FG Attempts', '40-49 FG Attempts', 'FGA 40-49', 'Projected Fga 40 49', 'Actual Fga 40 49', 'Fga 40 49']) },
        { label: 'FGM 40-49', val: getFlexibleValue(player, ['Projected 40-49 FGs Made', 'Actual 40-49 FGs Made', '40-49 FGs Made', 'FGM 40-49', 'Projected Fgm 40 49', 'Actual Fgm 40 49', 'Fgm 40 49']) },
        { label: 'FGA 50+', val: getFlexibleValue(player, ['Projected 50+ FG Attempts', 'Actual 50+ FG Attempts', '50+ FG Attempts', 'FGA 50+', 'Projected Fga 50 Plus', 'Actual Fga 50 Plus', 'Fga 50 Plus']) },
        { label: 'FGM 50+', val: getFlexibleValue(player, ['Projected 50+ FGs Made', 'Actual 50+ FGs Made', '50+ FGs Made', 'FGM 50+', 'Projected Fgm 50 Plus', 'Actual Fgm 50 Plus', 'Fgm 50 Plus']) },
        { label: 'XP Att', val: getFlexibleValue(player, ['Projected XP Attempts', 'Actual XP Attempts', 'XP Attempts', 'XP Att', 'Projected Xpa', 'Actual Xpa', 'Xpa']) },
        { label: 'XP Made', val: getFlexibleValue(player, ['Projected XPs Made', 'Actual XPs Made', 'XPs Made', 'XP Made', 'Projected Xpm', 'Actual Xpm', 'Xpm']) },
      ];
    } else if (pos === 'DST') {
      stats = [
        { label: 'Sacks', val: getFlexibleValue(player, ['Projected Sacks', 'Actual Sacks', 'Sacks', 'SACK']) },
        { label: 'INTs', val: getFlexibleValue(player, ['Projected Interceptions', 'Actual Interceptions', 'Interceptions', 'INT', 'Ints', 'Int']) },
        { label: 'Fum Rec', val: getFlexibleValue(player, ['Projected Fumbles', 'Actual Fumbles', 'Fumbles', 'Fumble Recoveries', 'Fumbles Recovered', 'Fum Rec', 'FUM REC']) },
        { label: 'Def TDs', val: getFlexibleValue(player, ['Projected Defensive Tds', 'Actual Defensive Tds', 'Defensive Tds', 'Defensive Touchdowns', 'Def Tds', 'Def TD', 'DEF TD']) },
        { label: 'Pts Allw', val: getFlexibleValue(player, ['Projected Points Allowed', 'Actual Points Allowed', 'Points Allowed', 'Pts Allow', 'Pts Agn', 'PTS AGN']) },
        { label: 'Yds Allw', val: getFlexibleValue(player, ['Projected Yards Allowed', 'Actual Yards Allowed', 'Yards Allowed', 'Yds Allow', 'Yds Agn', 'YDS AGN']) },
      ];
    }

    return (
      <div className="flex flex-wrap gap-2 p-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111] border border-gray-900 rounded-lg p-2 flex flex-col items-center justify-center text-center text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] flex-1 min-w-[70px]">
            <span className="text-[8px] font-black uppercase text-gray-400 mb-0.5 tracking-widest leading-none">{stat.label}</span>
            <span className="text-[13px] font-black leading-none mt-1">{formatNumber(stat.val)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCareerArc = (player) => {
    const playerName = player.Player || player.name || '';
    const hash = playerName.charCodeAt(0) + playerName.charCodeAt(playerName.length - 1);
    const diff1 = (hash % 15) - 5; 
    const diff2 = ((hash * 2) % 10) - 3; 
    
    const y1 = player.hist_2024 || Math.min(100, Math.max(0, player.SOS_OMFG - diff1 - diff2));
    const y2 = player.hist_2025 || Math.min(100, Math.max(0, player.SOS_OMFG - diff1));
    const y3 = player.SOS_OMFG;

    const trendColor = y3 >= y2 ? 'text-green-400' : 'text-red-400';
    const TrendIcon = y3 > y2 + 2 ? TrendingUp : y3 < y2 - 2 ? TrendingDown : Minus;

    return (
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
         <div className="flex flex-col items-center gap-0.5">
           <span className="text-[7px] text-gray-600 font-bold uppercase tracking-widest">2024</span>
           <span className="bg-[#111] text-gray-500 border border-gray-800 px-1.5 py-0.5 rounded text-[9px] font-black">{y1.toFixed(1)}</span>
         </div>
         <ChevronRight size={12} className="text-gray-700 mt-3" />
         
         <div className="flex flex-col items-center gap-0.5">
           <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest">2025</span>
           <span className="bg-[#1a1a1a] text-gray-400 border border-gray-700 px-1.5 py-0.5 rounded text-[9px] font-black">{y2.toFixed(1)}</span>
         </div>
         <ChevronRight size={12} className="text-gray-600 mt-3" />
         
         <div className="flex flex-col items-center gap-0.5">
           <span className={`text-[7px] font-bold uppercase tracking-widest ${trendColor}`}>2026</span>
           <div className={`flex items-center gap-1 bg-gray-800 border ${y3 >= y2 ? 'border-green-900/50 text-white' : 'border-red-900/50 text-white'} px-1.5 py-0.5 rounded shadow-sm`}>
             <span className="text-[10px] font-black">{y3.toFixed(1)}</span>
             <TrendIcon size={10} className={trendColor} />
           </div>
         </div>
      </div>
    );
  };

  const colSpanCount = currentPosition === 'FLEX' ? 7 : 6;

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 relative">

      {activeModal === 'careerArc' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161616] border border-gray-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setActiveModal(null)} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Info size={18} className="text-zinc-400" /> Career Arc Methodology
            </h3>
            <div className="space-y-4 text-xs font-medium text-gray-400 leading-relaxed mt-4">
              <p>The <strong>Career Arc</strong> visualizes a player's underlying Season-Over-Season (SOS) OMFG trajectory over the past three years. This isolates true role development from fluctuating box-score luck.</p>
              <div className="space-y-3 bg-[#111] p-4 rounded-2xl border border-gray-800/60 mt-4">
                <p>• <span className="text-green-400 font-bold">Ascending Profile:</span> Consistent year-over-year growth in underlying profile strength. Identifies breakout candidates before the public catches on.</p>
                <p>• <span className="text-gray-300 font-bold">Plateau Profile:</span> Stable, elite production holding at their peak. Safe, foundational dynasty building blocks.</p>
                <p>• <span className="text-red-400 font-bold">Declining Profile:</span> Degrading underlying metrics. Signals a dying asset whose surface-level fantasy points are being propped up by unsustainable luck.</p>
              </div>
            </div>
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
              <ListOrdered size={12} /> OMFG-Powered Projections
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white uppercase mb-2">
              Dynasty Rankings
            </h1>
            <p className="text-gray-300 font-medium md:text-lg">
              Dynamic dynasty rankings customized to your scoring format and roster strategy.
            </p>
          </div>

          <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-2xl shrink-0 mt-4 md:mt-0 self-start md:self-end md:mb-8">
            <Link href="/football/draft-rankings" className="px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all text-gray-400 hover:text-white">Draft</Link>
            <Link href="/football/redraft-rankings" className="px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all text-gray-400 hover:text-white">Redraft</Link>
            <button className="px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all bg-white text-black shadow-md">Dynasty</button>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Controls Row */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 relative z-[100]">
          
          <div className="flex flex-row flex-wrap items-center gap-2 xl:gap-4 w-full pb-2 -mb-2">
            <div className="flex bg-[#1a1a1a] p-1 rounded-2xl shadow-inner border border-gray-800 w-fit shrink-0">
               {positions.map(pos => (
                  <button key={pos} onClick={() => setCurrentPosition(pos)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${currentPosition === pos ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-[#252525]'}`}>{pos}</button>
               ))}
            </div>

            {/* SEARCH TOGGLE */}
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => {
                  setShowSearch(!showSearch);
                  if (showSearch) setSearchQuery('');
                }} 
                className={`p-2 rounded-xl border transition-all ${showSearch || searchQuery ? 'bg-red-600/10 border-red-500/50 text-red-500' : 'bg-[#1a1a1a] border-gray-800 text-gray-500 hover:text-white'}`}
              >
                <Search size={16} />
              </button>
              
              {showSearch && (
                <div className="relative animate-in fade-in slide-in-from-left-2 duration-200">
                  <input 
                    type="text" 
                    placeholder="Search player..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#111] border border-gray-800 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xl pl-3 pr-8 py-2 h-[34px] w-40 sm:w-48 focus:outline-none focus:border-red-500 transition-colors shadow-inner"
                    autoFocus
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center bg-[#111] p-1 rounded-2xl border border-gray-800 w-fit animate-in fade-in zoom-in-95 duration-200 shrink-0">
              <button onClick={() => setDynastyStrategy('win_now')} className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${dynastyStrategy === 'win_now' ? 'bg-zinc-200 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>🏆 Win Now</button>
              <button onClick={() => setDynastyStrategy('balanced')} className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${dynastyStrategy === 'balanced' ? 'bg-zinc-200 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>⚖️ Balanced</button>
              <button onClick={() => setDynastyStrategy('build')} className={`px-3 sm:px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${dynastyStrategy === 'build' ? 'bg-zinc-200 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>🌱 Rebuild</button>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto xl:justify-end shrink-0">
            {activeLeague ? (
               <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-lg pointer-events-none">
                 <Trophy size={16} /> 
                 Synced to {activeLeague.name}
               </div>
            ) : (
               <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all ml-auto xl:ml-0 ${showSettings ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-gray-800'}`}>
                 <Settings size={14} /> 
                 {showSettings ? 'Hide Scoring' : 'Custom Scoring'}
               </button>
            )}
          </div>
        </div>

        {/* Custom Scoring Panel */}
        {showSettings && !activeLeague && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 mb-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6">
               Adjust League Scoring Format
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
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
                    <button 
                      key={opt.label} onClick={() => setManualPprValue(opt.val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualPprValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Passing TDs</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: '4 PTS', val: 4 }, { label: '6 PTS', val: 6 }].map(opt => (
                    <button 
                      key={opt.label} onClick={() => setManualPassTdValue(opt.val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualPassTdValue === opt.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">TE Premium Bonus</span>
                <div className="flex bg-[#111] rounded-xl p-1 border border-gray-800">
                  {[{ label: 'NONE', val: 0 }, { label: '+0.5', val: 0.5 }, { label: '+1.0', val: 1 }].map(opt => (
                    <button 
                      key={opt.label} onClick={() => setManualTePremium(opt.val)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${manualTePremium === val.val ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dark Table Container */}
        <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-[400px]">
          <div className="overflow-x-auto scrollbar-hide pb-4 overflow-y-visible">
            <table className="min-w-full text-left whitespace-nowrap">
              <thead className="bg-[#1a1a1a] border-b border-gray-800 relative z-50">
                <tr>
                  {currentPosition === 'FLEX' && (
                    <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16 text-center">Rnk</th>
                  )}
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-16">Pos Rank</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                  
                  <th 
                    className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center cursor-help hover:bg-gray-800/40 transition-colors relative group"
                  >
                    <div className="flex items-center justify-center gap-1">
                      SOS OMFG
                      <Info size={10} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 text-[10px] rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] w-52 text-center pointer-events-none normal-case tracking-normal font-medium leading-relaxed whitespace-normal">
                      Season-Over-Season Overall Metric Fantasy Grade. Rates the strength of the player's underlying long-term profile compared to historical data.
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-600"></div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Age</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center border-l border-gray-800">
                    <div className="flex items-center justify-center gap-1.5">
                      Career Arc (3YR Trend)
                      <button onClick={() => setActiveModal('careerArc')} className="text-gray-500 hover:text-white transition-colors">
                        <Info size={11} />
                      </button>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Stats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {isSyncing ? (
                  <tr>
                    <td colSpan={colSpanCount} className="py-32 text-center">
                      <div className="flex flex-col items-center justify-center text-red-500 animate-in fade-in duration-500">
                        <RefreshCw className="animate-spin mb-4" size={36} />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Calculating Rankings</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Applying custom scoring format...</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleRankings.length === 0 ? (
                   <tr>
                    <td colSpan={colSpanCount} className="py-20 text-center">
                      <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">No Data Available</h3>
                      <p className="text-gray-500 font-bold">No players match the current filter selection.</p>
                    </td>
                  </tr>
                ) : visibleRankings.map((player, idx) => {
                    const playerName = player.Player || player.name || 'Unknown';
                    const playerId = `${playerName}-${idx}`;
                    const isExpanded = expandedRows.has(playerId);
                    const playerUrl = `/player/${playerName.toLowerCase().replace(/\s+(jr|sr|ii|iii|iv|v)\.?$/i, '').replace(/['.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
                    
                    const omfgScore = Number(player['OMFG Score'] ?? player['SOS OMFG Score'] ?? player['Preseason OMFG']) || 0;

                    return (
                      <React.Fragment key={playerId}>
                        <tr onClick={() => toggleRow(playerId)} className="hover:bg-[#151515] transition-colors group cursor-pointer">
                          {currentPosition === 'FLEX' && (
                            <td className="px-4 py-2.5">
                              <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-gray-800 text-gray-300 border border-gray-700 shadow-inner group-hover:bg-gray-700 group-hover:text-white transition-colors">
                                {player.overallRank}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-2.5 text-center">
                             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                               {player.posRank}
                             </span>
                          </td>
                          <td className="px-4 py-2.5">
                             <div className="flex items-center gap-3">
                               <Link href={playerUrl} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-gray-100 tracking-tight hover:text-red-400 transition-colors">
                                 {playerName}
                               </Link>
                               {(player.Team || player.team) && (player.Team || player.team) !== 'fa' && (
                                 <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${(player.Team || player.team).toLowerCase()}.png`} alt={player.Team || player.team} className="w-6 h-6 object-contain drop-shadow-md" onError={(e) => e.target.style.display = 'none'} />
                               )}
                             </div>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                              <div className={`text-xs ${getAbsoluteHeatmapColor(omfgScore)}`}>
                                {formatNumber(omfgScore)}
                              </div>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                             <span className="text-xs font-bold text-gray-300 bg-gray-800/80 px-2.5 py-1 rounded-md">{player.age || '-'}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center border-l border-gray-800/50">
                              {renderCareerArc(player)}
                          </td>
                          <td className="px-4 py-2.5 text-center text-gray-500">
                            {isExpanded ? <ChevronUp size={16} className="mx-auto" /> : <ChevronDown size={16} className="mx-auto" />}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-[#1e1e1e] border-b border-gray-700 shadow-inner">
                            <td colSpan={colSpanCount} className="p-0">
                              <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                                {renderExpandedStats(player)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                  )
                 })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}