"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header'; 
import Sidebar from '../../../components/Sidebar'; 
import ContentModal from '../../../components/ContentModal'; 
import { PlayCircle, FileText, Video, User, Zap, Play, ChevronLeft, ChevronRight, Headphones, Target, BarChart2, AlignLeft, TrendingUp, Activity, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { themes } from '../../../utils/theme';

// --- NFL Team Primary Colors ---
const teamColors = {
  ARI: '#97233F', ATL: '#A71930', BAL: '#241773', BUF: '#00338D', CAR: '#0085CA', CHI: '#C83803',
  CIN: '#FB4F14', CLE: '#FB4F14', DAL: '#86939E', DEN: '#FB4F14', DET: '#0076B6', GB: '#203731',
  HOU: '#03202F', IND: '#002C5F', JAX: '#006778', KC: '#E31837', LAC: '#0080C6', LAR: '#003594',
  LV: '#A5ACAF', MIA: '#008E97', MIN: '#4F2683', NE: '#002244', NO: '#D3BC8D', NYG: '#003594',
  NYJ: '#125740', PHI: '#004C54', PIT: '#FFB612', SEA: '#69BE28', SF: '#AA0000',
  TB: '#D50A0A', TEN: '#0C2340', WAS: '#5A1414'
};

// --- OMFG Metric Standardization ---
const METRICS_MAP = {
  'Games': ['Games', 'ROS Projected Games', 'Projected Games', 'Team Games Played'],
  'OMFG Score': ['Preseason OMFG', 'OMFG Score', 'ROS OMFG', 'In-Season OMFG Score'],
  'PPG': ['Actual PPG', 'ROS Projected PPG', 'Projected PPG', 'Base (P50)'],
  'Pass Attempts': ['Pass Attempts', 'Pass Att'],
  'Pass Yards': ['Pass Yards', 'Pass Yds'],
  'Pass TDs': ['Pass Td', 'Pass TDs'],
  'Interceptions': ['Interceptions', 'Ints', 'INT'],
  'Rush Attempts': ['Rush Attempts', 'Rush Att'],
  'Rush Yards': ['Rush Yards', 'Rush Yds'],
  'Rush TDs': ['Rush Td', 'Rush TDs'],
  'Targets': ['Targets'],
  'Receptions': ['Receptions', 'Rec'],
  'Receiving Yards': ['Receiving Yards', 'Rec Yds'],
  'Receiving TDs': ['Receiving Td', 'Receiving TDs', 'Rec Td'],
  'Air Yards': ['Air Yards'],
  'First Read Targets': ['First Read Targets', 'First-Read Targets'],
  'End Zone Targets': ['End Zone Targets', 'End-Zone Targets'],
  'Scrimmage Yards': ['Scrimmage Yards'],
  'Total TDs': ['Total Td', 'Total TDs']
};
const METRICS_TO_TRACK = Object.keys(METRICS_MAP);

const normalizeName = (str) => {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(jr|sr|ii|iii|iv|v)$/, '');
};

const getFlexibleValue = (player, matchRules) => {
  if (!player) return null;
  const isValid = (val) => val !== undefined && val !== null && val !== '' && val !== '-';

  for (const rule of matchRules) {
    if (Array.isArray(rule)) continue;
    const normRule = normalizeName(rule);
    for (const [key, value] of Object.entries(player)) {
      if (!isValid(value)) continue;
      if (normalizeName(key) === normRule) return value;
    }
  }

  for (const rule of matchRules) {
    if (Array.isArray(rule)) continue;
    const normRule = normalizeName(rule);
    for (const [key, value] of Object.entries(player)) {
      if (!isValid(value)) continue;
      const strippedKey = normalizeName(key).replace(/^projected/, '').replace(/^actual/, '');
      if (strippedKey === normRule) return value;
    }
  }
  
  for (const rule of matchRules) {
    for (const [key, value] of Object.entries(player)) {
      if (!isValid(value)) continue;
      const normKey = normalizeName(key);
      if (Array.isArray(rule)) {
        if (rule.every(sub => normKey.includes(normalizeName(sub)))) return value;
      } else {
        const normRule = normalizeName(rule);
        if (!normRule.includes('40') && normKey.includes('40')) continue;
        if (!normRule.includes('50') && normKey.includes('50')) continue;
        if (!normRule.includes('plus') && normKey.includes('plus')) continue;
        if (normKey.includes(normRule)) return value;
      }
    }
  }
  return null;
};

// --- Recharts Custom Tooltips ---
const RadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1a1a1a] border border-gray-700 p-3 rounded-xl shadow-2xl z-[100]">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{data.subject}</div>
        <div className="flex items-center gap-2">
          <span className="text-white font-black">{data.rawValue}</span>
          <span className="text-[9px] text-gray-500 font-bold uppercase">({data.pct.toFixed(0)}% of Pos Max)</span>
        </div>
      </div>
    );
  }
  return null;
};

const ArcTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-gray-700 p-3 rounded-xl shadow-2xl z-[100] min-w-[140px]">
        <div className="font-black text-white text-sm mb-2 border-b border-gray-800 pb-2">{label}</div>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-6 text-xs mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="uppercase tracking-widest font-bold text-gray-400">{entry.name}</span>
            </div>
            <span className="text-white font-black">{Number(entry.value).toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PlayerClient({ playerName, rawSlug, espnData, content, proToolsMenu, connectMenu, playerSport = 'All' }) {
  const [selectedItem, setSelectedItem] = useState(null);
  
  // OMFG Data States
  const [rosPlayerData, setRosPlayerData] = useState(null);
  const [rosPosGroup, setRosPosGroup] = useState([]);
  const [historicalData, setHistoricalData] = useState({});
  const [isOmfgLoading, setIsOmfgLoading] = useState(true);
  const [activeOmfgTab, setActiveOmfgTab] = useState('overview'); // overview, ros, career
  
  // Refs for carousel scrolling
  const articlesRef = useRef(null);
  const videosRef = useRef(null);
  const shortsRef = useRef(null);
  const podcastsRef = useRef(null);

  const targetPlayerName = normalizeName(espnData?.fullName || espnData?.displayName || playerName);

  const handleSetSelectedItem = (item) => {
    if (item) {
      const sportPath = item.sport.toLowerCase();
      const typePath = `${item.type}s`; 
      const itemUrl = `/${sportPath}/${typePath}/${item.slug}`;
      window.history.pushState({ modal: true }, '', itemUrl);
      setSelectedItem(item);
    } else {
      window.history.pushState(null, '', `/player/${rawSlug}`);
      setSelectedItem(null);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (selectedItem) setSelectedItem(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedItem]);

  // --- Compile OMFG Dashboard Models ---
  useEffect(() => {
    async function loadOmfgData() {
      if (playerSport.toLowerCase() !== 'football' && playerSport !== 'All') {
         setIsOmfgLoading(false);
         return;
      }
      setIsOmfgLoading(true);
      try {
        // 1. Fetch RoS Data
        const rosRes = await fetch(`/api/omfg-data?year=2026&week=${encodeURIComponent('Rest of Season')}`);
        const rosJson = await rosRes.json();
        
        let rPlayer = null;
        let rGroup = [];

        if (rosJson.success && rosJson.players) {
          rPlayer = rosJson.players.find(p => normalizeName(p.Player || p.name) === targetPlayerName);
          if (rPlayer) {
            const rPos = rPlayer.Position || rPlayer.position;
            rGroup = rosJson.players.filter(p => p.Position === rPos || p.position === rPos);
          }
        }
        setRosPlayerData(rPlayer);
        setRosPosGroup(rGroup);

        // 2. Fetch Season/Historical Data
        const metaRes = await fetch(`/api/omfg-data?year=2026&week=Season`);
        const metaJson = await metaRes.json();
        
        if (metaJson.available_models) {
           const seasonYears = metaJson.available_models
             .filter(m => m.week === 'Season')
             .map(m => m.year)
             .sort((a, b) => Number(a) - Number(b)); 

           const histPromises = seasonYears.map(year => 
              fetch(`/api/omfg-data?year=${year}&week=Season`).then(r => r.json())
           );
           const histResults = await Promise.all(histPromises);
           
           const compiledHist = {};
           histResults.forEach((res, idx) => {
              if (res.success && res.players) {
                const year = seasonYears[idx];
                const players = res.players;
                
                const thresholds = {};
                METRICS_TO_TRACK.forEach(stat => {
                   const values = players
                      .map(p => getFlexibleValue(p, METRICS_MAP[stat]))
                      .filter(v => v !== null && v !== undefined && v !== '')
                      .map(v => Number(v))
                      .filter(v => !isNaN(v))
                      .sort((a, b) => a - b);
                      
                    if (values.length > 0) {
                      thresholds[stat] = {
                        p90: values[Math.floor(values.length * 0.90)] || values[values.length - 1],
                        p75: values[Math.floor(values.length * 0.75)] || values[values.length - 1],
                        p25: values[Math.floor(values.length * 0.25)] || values[0],
                        p10: values[Math.floor(values.length * 0.10)] || values[0],
                      };
                    }
                });

                compiledHist[year] = { players, thresholds };
              }
           });
           setHistoricalData(compiledHist);
        }
      } catch (err) {
        console.error("Error loading OMFG data:", err);
      } finally {
        setIsOmfgLoading(false);
      }
    }
    loadOmfgData();
  }, [targetPlayerName, playerSport]);

  const primaryColor = espnData?.team?.color ? `#${espnData.team.color}` : '#374151';
  const secondaryColor = espnData?.team?.alternateColor ? `#${espnData.team.alternateColor}` : '#1f2937';
  const activeColor = primaryColor !== '#374151' ? primaryColor : '#1b75bb';
  const headshot = espnData?.headshot?.href || null;
  const teamLogo = espnData?.team?.logos?.[0]?.href || null;
  const teamSlug = espnData?.team?.displayName ? espnData.team.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null;

  const dob = espnData?.dateOfBirth ? new Date(espnData.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;
  let birthplace = '';
  if (espnData?.birthPlace) {
    const { city, state, country } = espnData.birthPlace;
    birthplace = [city, state, country].filter(Boolean).join(', ');
  }

  const hideScrollbar = "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

  const scroll = (ref, direction) => {
    if (ref.current) ref.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  // --- OMFG DATA PREPARATION ---
  
  const radarData = useMemo(() => {
    if (!rosPlayerData || !rosPosGroup.length) return [];

    const getMax = (keys) => {
      let max = 0;
      rosPosGroup.forEach(p => {
        const val = Number(getFlexibleValue(p, keys) || 0);
        if (val > max) max = val;
      });
      return max === 0 ? 1 : max;
    };

    const getRaw = (keys) => Number(getFlexibleValue(rosPlayerData, keys) || 0);
    const getCleanPct = (val) => {
        let n = Number(String(val).replace('%', '').trim());
        if (isNaN(n)) return 0;
        return (n <= 1 && n > 0) ? n * 100 : n;
    };

    const omfgMax = getMax(['Preseason OMFG', 'OMFG Score']);
    const floorMax = getMax(['ROS Floor Points', 'Floor (P25)']);
    const baseMax = getMax(['ROS Base Points', 'Base (P50)']);
    const ceilMax = getMax(['ROS Ceiling Points', 'Ceiling (P75)']);
    
    const probKeys = rosPlayerData.Position === 'QB' || rosPlayerData.Position === 'TE' || rosPlayerData.Position === 'K' || rosPlayerData.Position === 'DST' 
        ? ['ROS Probability Top6', 'Top 6', 'Top6', 'Adjusted Sim Prob Top6'] 
        : ['ROS Probability Top12', 'Top 12', 'Top12', 'Adjusted Sim Prob Top12'];

    const rawOmfg = getRaw(['Preseason OMFG', 'OMFG Score']);
    const rawFloor = getRaw(['ROS Floor Points', 'Floor (P25)']);
    const rawBase = getRaw(['ROS Base Points', 'Base (P50)']);
    const rawCeil = getRaw(['ROS Ceiling Points', 'Ceiling (P75)']);
    const rawProb = getCleanPct(getFlexibleValue(rosPlayerData, probKeys));

    return [
      { subject: 'Opportunity', pct: (rawOmfg / omfgMax) * 100, rawValue: rawOmfg.toFixed(1) },
      { subject: 'Safe Floor', pct: (rawFloor / floorMax) * 100, rawValue: `${rawFloor.toFixed(0)} pts` },
      { subject: 'Base Output', pct: (rawBase / baseMax) * 100, rawValue: `${rawBase.toFixed(0)} pts` },
      { subject: 'Upside Ceiling', pct: (rawCeil / ceilMax) * 100, rawValue: `${rawCeil.toFixed(0)} pts` },
      { subject: 'Elite Prob', pct: rawProb, rawValue: `${rawProb.toFixed(0)}%` },
    ];
  }, [rosPlayerData, rosPosGroup]);

  const percentileData = useMemo(() => {
    if (!rosPlayerData || !rosPosGroup.length) return [];

    const getPctile = (keys) => {
      const raw = Number(getFlexibleValue(rosPlayerData, keys) || 0);
      const allVals = rosPosGroup.map(p => Number(getFlexibleValue(p, keys) || 0));
      const below = allVals.filter(v => v < raw).length;
      const equal = allVals.filter(v => v === raw).length;
      return ((below + (0.5 * equal)) / allVals.length) * 100;
    };

    return [
      { label: 'Opportunity (OMFG)', pct: getPctile(['Preseason OMFG', 'OMFG Score']), val: Number(getFlexibleValue(rosPlayerData, ['Preseason OMFG', 'OMFG Score']) || 0) },
      { label: 'Projected RoS PPG', pct: getPctile(['ROS Projected PPG', 'Projected PPG']), val: Number(getFlexibleValue(rosPlayerData, ['ROS Projected PPG', 'Projected PPG']) || 0) },
      { label: 'Safe Floor (P25)', pct: getPctile(['ROS Floor Points', 'Floor (P25)']), val: Number(getFlexibleValue(rosPlayerData, ['ROS Floor Points', 'Floor (P25)']) || 0) },
      { label: 'Median Output (P50)', pct: getPctile(['ROS Base Points', 'Base (P50)']), val: Number(getFlexibleValue(rosPlayerData, ['ROS Base Points', 'Base (P50)']) || 0) },
      { label: 'Upside Ceiling (P75)', pct: getPctile(['ROS Ceiling Points', 'Ceiling (P75)']), val: Number(getFlexibleValue(rosPlayerData, ['ROS Ceiling Points', 'Ceiling (P75)']) || 0) },
    ];
  }, [rosPlayerData, rosPosGroup]);

  const countingStats = useMemo(() => {
    if (!rosPlayerData) return [];
    const pos = rosPlayerData.Position || rosPlayerData.position;
    let metrics = [];

    const formatNum = (val) => {
        const n = Number(val);
        return isNaN(n) ? '-' : n.toFixed(1);
    };

    if (pos === 'QB') {
      metrics = [
        { label: 'Pass Att', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Pass Attempts'])) },
        { label: 'Pass Yds', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Pass Yards'])) },
        { label: 'Pass TD', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Pass TDs'])) },
        { label: 'INTs', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Interceptions'])) },
        { label: 'Rush Att', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Rush Attempts'])) },
        { label: 'Rush Yds', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Rush Yards'])) },
        { label: 'Rush TD', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Rush TDs'])) },
      ];
    } else if (pos === 'RB') {
      metrics = [
        { label: 'Rush Att', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Rush Attempts'])) },
        { label: 'Rush Yds', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Rush Yards'])) },
        { label: 'Rush TD', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Rush TDs'])) },
        { label: 'Targets', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Targets'])) },
        { label: 'Receptions', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Receptions'])) },
        { label: 'Rec Yds', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Receiving Yards'])) },
        { label: 'Total TD', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Total TDs'])) },
      ];
    } else if (pos === 'WR' || pos === 'TE') {
      metrics = [
        { label: 'Targets', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Targets'])) },
        { label: 'Receptions', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Receptions'])) },
        { label: 'Rec Yds', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Receiving Yards'])) },
        { label: 'Air Yards', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Air Yards'])) },
        { label: '1st Reads', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['First Read Targets'])) },
        { label: 'End Zone Tgts', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['End Zone Targets'])) },
        { label: 'Total TD', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Total TDs'])) },
      ];
    } else if (pos === 'K') {
      metrics = [
          { label: 'Games', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Games'])) },
          { label: 'Projected PPG', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['PPG'])) },
      ];
    } else if (pos === 'DST') {
      metrics = [
          { label: 'Games', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['Games'])) },
          { label: 'Projected PPG', val: formatNum(getFlexibleValue(rosPlayerData, METRICS_MAP['PPG'])) },
      ];
    }

    return metrics;
  }, [rosPlayerData]);

  const { chartData, matrixTimeline } = useMemo(() => {
    if (!historicalData || Object.keys(historicalData).length === 0) return { chartData: [], matrixTimeline: [] };
    
    const ascYears = Object.keys(historicalData).sort((a, b) => Number(a) - Number(b));
    const descYears = [...ascYears].reverse();

    const chart = ascYears.map(year => {
      const yearData = historicalData[year];
      const pData = yearData.players.find(p => normalizeName(p.Player || p.name) === targetPlayerName);
      return {
        year,
        omfg: pData ? Number(getFlexibleValue(pData, METRICS_MAP['OMFG Score'])) : null,
        ppg: pData ? Number(getFlexibleValue(pData, METRICS_MAP['PPG'])) : null
      };
    }).filter(t => t.omfg !== null || t.ppg !== null);

    const matrix = descYears.map(year => {
      const yearData = historicalData[year];
      const pData = yearData.players.find(p => normalizeName(p.Player || p.name) === targetPlayerName);
      return {
        year,
        player: pData || null,
        thresholds: yearData.thresholds
      };
    });

    return { chartData: chart, matrixTimeline: matrix };
  }, [historicalData, targetPlayerName]);

  const inverseStats = useMemo(() => new Set(['Interceptions', 'Fumbles']), []);

  const getHeatmapClasses = (val, statKey, thresh) => {
    if (val === null || val === undefined || val === '-') return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';
    const num = Number(val);
    if (!thresh || isNaN(num)) return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';

    const isInverse = inverseStats.has(statKey);
    let isTop10 = num >= thresh.p90;
    let isTop25 = num >= thresh.p75 && num < thresh.p90;
    let isBot25 = num <= thresh.p25 && num > thresh.p10;
    let isBot10 = num <= thresh.p10;

    if (isInverse) {
      isTop10 = num <= thresh.p10;
      isTop25 = num <= thresh.p25 && num > thresh.p10;
      isBot25 = num >= thresh.p75 && num < thresh.p90;
      isBot10 = num >= thresh.p90;
    }

    if (thresh.p90 === thresh.p10) return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]';

    if (isTop10) return 'bg-emerald-900/30 border-emerald-800/50 text-emerald-400 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)] font-black';
    if (isTop25) return 'bg-emerald-900/10 border-emerald-800/30 text-emerald-300 font-bold';
    if (isBot10) return 'bg-red-900/30 border-red-800/50 text-red-400 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)] font-black';
    if (isBot25) return 'bg-red-900/10 border-red-800/30 text-red-300 font-bold';
    return 'bg-[#111] border-gray-900 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] font-bold';
  };

  const getAbsoluteHeatmapColor = (val) => {
    if (val === null || val === undefined || val === '') return 'text-gray-400';
    const num = Number(val);
    if (isNaN(num)) return 'text-gray-400';
    if (num >= 87.5) return 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]';
    if (num >= 75.0) return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]';
    if (num >= 62.5) return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]';
    if (num >= 50.0) return 'text-yellow-200 drop-shadow-[0_0_8px_rgba(254,240,138,0.3)]';
    if (num >= 37.5) return 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]';
    if (num >= 25.0) return 'text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.3)]';
    if (num >= 12.5) return 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]';
    return 'text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.3)]';
  };

  const formatNum = (val, decimals = 0) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? '-' : num.toFixed(decimals);
  };

  const getMetricsForPosition = (pos) => {
    switch (pos) {
      case 'QB': return ['Games', 'OMFG Score', 'PPG', 'Pass Attempts', 'Pass Yards', 'Pass TDs', 'Interceptions', 'Rush Attempts', 'Rush Yards', 'Rush TDs'];
      case 'RB': return ['Games', 'OMFG Score', 'PPG', 'Rush Attempts', 'Rush Yards', 'Targets', 'Receptions', 'Receiving Yards', 'First Read Targets', 'Scrimmage Yards', 'Total TDs'];
      case 'WR':
      case 'TE': return ['Games', 'OMFG Score', 'PPG', 'Targets', 'Receptions', 'Receiving Yards', 'Air Yards', 'First Read Targets', 'End Zone Targets', 'Total TDs'];
      default: return ['Games', 'OMFG Score', 'PPG'];
    }
  };

  const renderOmfgDashboard = () => {
    if (isOmfgLoading) {
      return (
        <div className="bg-[#111] rounded-3xl shadow-2xl border border-gray-800 min-h-[400px] flex flex-col items-center justify-center text-red-600 w-full mb-8">
          <RefreshCw className="animate-spin mb-4" size={36} />
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Compiling OMFG Player Profile...</h3>
        </div>
      );
    }

    if (!rosPlayerData && chartData.length === 0) {
      return null;
    }

    const games = rosPlayerData ? Number(getFlexibleValue(rosPlayerData, METRICS_MAP['Games']) || 0).toFixed(1) : '-';
    const ppg = rosPlayerData ? Number(getFlexibleValue(rosPlayerData, METRICS_MAP['PPG']) || 0).toFixed(1) : '-';
    const targetPlayerPos = rosPlayerData?.Position || rosPlayerData?.position || matrixTimeline.find(t => t.player)?.player?.Position || espnData?.position?.abbreviation || 'UNK';
    
    let currentSeasonData = null;
    if (historicalData['2026']) {
        currentSeasonData = historicalData['2026'].players.find(p => normalizeName(p.Player || p.name) === targetPlayerName);
    }
    const omfgScore = currentSeasonData ? Number(getFlexibleValue(currentSeasonData, ['OMFG Score', 'Preseason OMFG'])) : (rosPlayerData ? Number(getFlexibleValue(rosPlayerData, ['Preseason OMFG', 'OMFG Score'])) : 0);
    const tier = currentSeasonData ? getFlexibleValue(currentSeasonData, ['Tier']) : (rosPlayerData ? getFlexibleValue(rosPlayerData, ['ROS Tier', 'Tier']) : '-');

    return (
      <div className="flex flex-col gap-6 w-full mb-8">
        
        {/* Tab Header & Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800/50">
          <h3 className="text-2xl font-black flex items-center gap-2 text-white italic tracking-wider">
             <Zap className="text-red-500 fill-red-500" size={24} /> OMFG Profile
          </h3>
          <div className="flex items-center gap-1.5 bg-[#1a1a1a] p-1 rounded-2xl border border-gray-800 shadow-inner w-fit overflow-x-auto scrollbar-hide">
             <button onClick={() => setActiveOmfgTab('overview')} className={`px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeOmfgTab === 'overview' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>Overview</button>
             <button onClick={() => setActiveOmfgTab('ros')} className={`px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeOmfgTab === 'ros' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>Rest of Season</button>
             <button onClick={() => setActiveOmfgTab('career')} className={`px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeOmfgTab === 'career' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>Career Arc</button>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* TAB 1: SEASON OVERVIEW */}
          {activeOmfgTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* SOS OMFG Score Card */}
              <div className="xl:col-span-4 bg-[#151515] border border-gray-800 rounded-3xl p-6 shadow-inner flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 relative z-10">SOS OMFG Score</span>
                <div className={`text-7xl md:text-8xl font-black italic tracking-tighter ${getAbsoluteHeatmapColor(omfgScore)} relative z-10`}>
                  {formatNum(omfgScore, 1)}
                </div>
                <div className="mt-6 bg-[#1a1a1a] px-6 py-2 rounded-full border border-gray-700 shadow-xl relative z-10">
                   <span className="text-xs font-black text-gray-300 uppercase tracking-widest">Tier {tier}</span>
                </div>
              </div>

              {/* Positional Percentiles */}
              <div className="xl:col-span-8 bg-[#151515] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-inner flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700">
                    <AlignLeft size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-widest leading-none">Positional Percentiles</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Compared to all {targetPlayerPos}s</p>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  {percentileData.map((stat, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group">
                      <div className="w-full sm:w-48 flex justify-between sm:block shrink-0">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">{stat.label}</span>
                        <span className="sm:hidden text-xs font-black text-white">{stat.val.toFixed(1)}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-4">
                        <div className="flex-1 h-4 bg-[#111] rounded-full overflow-hidden border border-gray-800/80 relative shadow-inner">
                          <div 
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${Math.max(stat.pct, 2)}%`, 
                              backgroundColor: activeColor,
                              boxShadow: `inset 0 0 10px rgba(255,255,255,0.2)` 
                            }}
                          />
                        </div>
                        <div className="w-24 shrink-0 flex items-center justify-between">
                          <span className="text-xs font-black text-white hidden sm:block">{stat.val.toFixed(1)}</span>
                          <div className="text-right w-12">
                             <span className="text-sm font-black" style={{ color: activeColor }}>
                                {stat.pct.toFixed(0)}<span className="text-[10px]">th</span>
                             </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REST OF SEASON */}
          {activeOmfgTab === 'ros' && rosPlayerData && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#151515] border border-gray-800 rounded-2xl px-5 py-3 text-center shadow-inner">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Rem G</span>
                  <span className="text-xl font-black text-gray-200">{games}</span>
                </div>
                <div className="bg-[#151515] border border-gray-800 rounded-2xl px-5 py-3 text-center shadow-inner">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">RoS PPG</span>
                  <span className="text-xl font-black text-emerald-400">{ppg}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Positional Radar Chart */}
                <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 shadow-inner flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700">
                        <Target size={18} />
                        </div>
                        <div>
                        <h3 className="text-base font-black text-white uppercase tracking-widest leading-none">Positional Archetype</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Relative to {targetPlayerPos} Max</p>
                        </div>
                    </div>
                  </div>

                  <div className="w-full h-[300px] md:h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <RechartsTooltip content={<RadarTooltip />} cursor={{ fill: '#1a1a1a' }} />
                        <Radar 
                          name={rosPlayerData.Player} 
                          dataKey="pct" 
                          stroke={activeColor} 
                          strokeWidth={3} 
                          fill={activeColor} 
                          fillOpacity={0.3} 
                          animationDuration={1500}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Counting Stats Grid */}
                <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 shadow-inner flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700">
                      <BarChart2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-widest leading-none">Projected RoS Stats</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Counting Stat Forecast</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {countingStats.map((stat, idx) => (
                        <div key={idx} className="bg-[#111] border border-gray-800/80 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-md">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</span>
                            <span className="text-2xl font-black text-white">{stat.val}</span>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAREER ARC */}
          {activeOmfgTab === 'career' && chartData.length > 0 && matrixTimeline.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#151515] border border-gray-800 rounded-2xl px-5 py-3 text-center shadow-inner">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">SOS OMFG</span>
                  <span className={`text-xl font-black ${getAbsoluteHeatmapColor(omfgScore).split(' ')[0]}`}>{formatNum(omfgScore, 1)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Line Chart Column */}
                <div className="xl:col-span-7 bg-[#151515] border border-gray-800 rounded-3xl p-6 shadow-inner flex flex-col">
                   <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700">
                       <TrendingUp size={18} />
                     </div>
                     <div>
                       <h3 className="text-base font-black text-white uppercase tracking-widest leading-none">Usage vs Production</h3>
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Timeline Trajectory</p>
                     </div>
                   </div>

                   <div className="flex-1 w-full min-h-[350px] relative">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                         <XAxis dataKey="year" tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                         <YAxis yAxisId="left" tick={{ fill: activeColor, fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                         <YAxis yAxisId="right" orientation="right" tick={{ fill: '#ffffff', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                         <RechartsTooltip content={<ArcTooltip />} cursor={{ stroke: '#444', strokeWidth: 1, strokeDasharray: '3 3' }} />
                         <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                         <Line yAxisId="left" type="monotone" dataKey="omfg" name="OMFG Score" stroke={activeColor} strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#111' }} activeDot={{ r: 6, strokeWidth: 0, fill: activeColor }} animationDuration={1500} />
                         <Line yAxisId="right" type="monotone" dataKey="ppg" name="PPG" stroke="#ffffff" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#111' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#ffffff' }} animationDuration={1500} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                </div>

                {/* Metric Matrix Column */}
                <div className="xl:col-span-5 bg-[#151515] border border-gray-800 rounded-3xl p-6 shadow-inner flex flex-col">
                   <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700">
                       <Activity size={18} />
                     </div>
                     <div>
                       <h3 className="text-base font-black text-white uppercase tracking-widest leading-none">Metric Matrix</h3>
                       <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Year-over-Year Heatmap</p>
                     </div>
                   </div>

                   <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
                     <table className="w-full text-left whitespace-nowrap border-separate border-spacing-y-1">
                       <thead>
                         <tr>
                           <th className="px-2 pb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest sticky left-0 bg-[#151515] z-10">Metric</th>
                           {matrixTimeline.map(t => (
                             <th key={t.year} className="px-2 pb-2 text-[11px] font-black text-white uppercase tracking-widest text-center">{t.year}</th>
                           ))}
                         </tr>
                       </thead>
                       <tbody>
                         {getMetricsForPosition(targetPlayerPos).map(metricKey => (
                           <tr key={metricKey}>
                             <td className="px-2 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-0 bg-[#151515] z-10 border-r border-gray-800">
                               {metricKey}
                             </td>
                             {matrixTimeline.map(t => {
                               const val = t.player ? getFlexibleValue(t.player, METRICS_MAP[metricKey]) : null;
                               const thresh = t.thresholds ? t.thresholds[metricKey] : null;
                               const heatClass = getHeatmapClasses(val, metricKey, thresh);
                               return (
                                 <td key={`${metricKey}-${t.year}`} className="px-1 py-1">
                                   <div className={`w-full h-full min-w-[50px] flex items-center justify-center rounded-lg border text-[11px] py-1.5 transition-colors ${heatClass}`}>
                                     {val !== null ? Number(val).toFixed(1) : '-'}
                                   </div>
                                 </td>
                               );
                             })}
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };


  // --- CONTENT SECTION RENDERERS ---

  const renderContentGrid = () => {
    if (content.length === 0) {
      return (
        <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest border border-dashed border-gray-800 rounded-2xl w-full">
          No recent coverage found.
        </div>
      );
    }

    const articles = content.filter(item => item.type === 'article');
    const videos = content.filter(item => item.type === 'video');
    const shorts = content.filter(item => item.type === 'short');
    const podcasts = content.filter(item => item.type === 'podcast');

    // Standard Article Card
    const renderArticleCard = (item) => {
      const itemUrl = `/${item.sport.toLowerCase()}/${item.type}s/${item.slug}`;
      return (
        <Link 
          href={itemUrl}
          onClick={(e) => { e.preventDefault(); handleSetSelectedItem(item); }} 
          className="group h-full w-full cursor-pointer bg-[#1e1e1e] border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-colors shadow-xl flex flex-col relative no-underline block"
        >
          <div className="w-full aspect-video bg-gray-900 relative overflow-hidden shrink-0">
            {item.imageUrl && <img src={item.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent" />
          </div>
          <div className="p-5 flex flex-col flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{item.date}</span>
            <h3 className="font-black text-base text-gray-200 group-hover:text-white transition-colors leading-tight line-clamp-3 mb-2" dangerouslySetInnerHTML={{ __html: item.title }} />
            <p className="text-xs text-gray-400 line-clamp-2 mt-auto" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
          </div>
        </Link>
      );
    };

    // Cinematic 16:9 Video Card
    const renderVideoCard = (item) => {
      const cardTheme = themes[item.sport] || themes.All;
      const itemUrl = `/${item.sport.toLowerCase()}/${item.type}s/${item.slug}`;
      return (
        <Link 
          href={itemUrl}
          onClick={(e) => { e.preventDefault(); handleSetSelectedItem(item); }} 
          className={`group w-full h-full aspect-video cursor-pointer bg-[#111] border ${cardTheme.border} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${cardTheme.hoverBorder} transition-all flex flex-col relative no-underline block`}
        >
          {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
          <PlayCircle size={48} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-lg" />
          <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 z-20 flex flex-col justify-end opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${cardTheme.bg}`}></span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{item.date}</span>
            </div>
            <h3 className={`font-black text-lg lg:text-xl text-white leading-tight group-hover:${cardTheme.text} transition-colors line-clamp-2 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
          </div>
        </Link>
      );
    };

    // Short Card
    const renderShortCard = (item) => {
      const itemUrl = `/${item.sport.toLowerCase()}/${item.type}s/${item.slug}`;
      return (
        <Link 
          href={itemUrl}
          onClick={(e) => { e.preventDefault(); handleSetSelectedItem(item); }} 
          className={`group h-full w-full min-h-[300px] md:min-h-[400px] cursor-pointer bg-[#111] border ${themes[item.sport]?.border || 'border-gray-700'} border-opacity-40 hover:border-opacity-100 rounded-2xl overflow-hidden shadow-xl ${themes[item.sport]?.hoverBorder || 'hover:border-gray-500'} transition-all flex flex-col relative no-underline block`}
        >
          {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" /> : <div className="absolute inset-0 bg-gray-900" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-3 md:p-4 border border-white/10"><Play size={24} className="text-white ml-1" fill="currentColor"/></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20">
            <h3 className={`font-black text-sm md:text-lg text-white leading-tight group-hover:${themes[item.sport]?.text || 'text-white'} transition-colors line-clamp-3 drop-shadow-md`} dangerouslySetInnerHTML={{ __html: item.title }} />
          </div>
        </Link>
      );
    };

    // Podcast Booth Card
    const renderPodcastCard = (item) => {
      const itemTheme = themes[item.sport] || themes.All;
      const itemUrl = `/${item.sport.toLowerCase()}/${item.type}s/${item.slug}`;
      return (
        <Link 
          href={itemUrl}
          onClick={(e) => { e.preventDefault(); handleSetSelectedItem(item); }} 
          className={`flex items-stretch bg-[#1e1e1e] border ${itemTheme.border} border-opacity-40 rounded-2xl overflow-hidden ${itemTheme.hoverBorder} hover:-translate-y-0.5 transition-all cursor-pointer group shadow-lg h-[120px] no-underline block`}
        >
          <div className="w-28 shrink-0 relative bg-gray-900 flex items-center justify-center overflow-hidden border-r border-gray-800/50">
            {item.imageUrl ? <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> : <div className="absolute inset-0 bg-gray-800" />}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            <PlayCircle size={36} className="text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10 drop-shadow-md" />
          </div>
          <div className="flex-1 p-4 flex flex-col justify-center overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
               <span className={`w-1.5 h-1.5 rounded-full ${itemTheme.bg}`}></span>
               <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{item.date}</span>
            </div>
            <h4 className={`font-bold text-sm leading-snug mb-2 text-gray-200 group-hover:${itemTheme.text} transition-colors line-clamp-2`} dangerouslySetInnerHTML={{ __html: item.title }} />
            <div className="flex items-center gap-[3px] mt-auto h-4 opacity-70 group-hover:opacity-100 transition-opacity">
              {[4, 8, 12, 8, 16, 10, 14, 6, 10, 12, 8, 6, 14, 8, 4, 8, 12].map((h, i) => (
                <div key={i} className={`w-[2px] sm:w-[3px] shrink-0 rounded-full bg-gray-600 group-hover:${itemTheme.bg} transition-colors`} style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
        </Link>
      );
    };

    return (
      <div className="flex flex-col gap-10 w-full">
        <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="grey-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop stopColor="#d1d5db" offset="0%" /><stop stopColor="#6b7280" offset="100%" /></linearGradient>
          </defs>
        </svg>

        {articles.length > 0 && (
          <section className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><FileText stroke="url(#grey-grad)" /> The Press Box</h3>
              <div className="hidden md:flex items-center gap-2">
                 <button onClick={() => scroll(articlesRef, 'left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                 <button onClick={() => scroll(articlesRef, 'right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
              </div>
            </div>
            <div ref={articlesRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
              {articles.map(item => (
                <div key={item.id} className="relative w-72 sm:w-80 md:w-96 flex-shrink-0 snap-start">
                  {renderArticleCard(item)}
                </div>
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section className={`relative ${articles.length > 0 ? 'pt-6 border-t border-gray-800/50' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><Video stroke="url(#grey-grad)" /> The Film Room</h3>
              <div className="hidden md:flex items-center gap-2">
                 <button onClick={() => scroll(videosRef, 'left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                 <button onClick={() => scroll(videosRef, 'right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
              </div>
            </div>
            <div ref={videosRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
              {videos.map(item => (
                <div key={item.id} className="relative w-72 sm:w-80 md:w-96 flex-shrink-0 snap-start">
                  {renderVideoCard(item)}
                </div>
              ))}
            </div>
          </section>
        )}

        {shorts.length > 0 && (
          <section className={`relative ${articles.length > 0 || videos.length > 0 ? 'pt-6 border-t border-gray-800/50' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><Zap stroke="url(#grey-grad)" /> The Highlight Reel</h3>
              <div className="hidden md:flex items-center gap-2">
                 <button onClick={() => scroll(shortsRef, 'left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                 <button onClick={() => scroll(shortsRef, 'right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
              </div>
            </div>
            <div ref={shortsRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
              {shorts.map(short => (
                <div key={short.id} className="relative w-36 md:w-44 flex-shrink-0 snap-start">
                  {renderShortCard(short)}
                </div>
              ))}
            </div>
          </section>
        )}

        {podcasts.length > 0 && (
          <section className={`relative ${articles.length > 0 || videos.length > 0 || shorts.length > 0 ? 'pt-6 border-t border-gray-800/50' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-white italic"><Headphones stroke="url(#grey-grad)" /> The Booth</h3>
              <div className="hidden md:flex items-center gap-2">
                 <button onClick={() => scroll(podcastsRef, 'left')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronLeft size={18} /></button>
                 <button onClick={() => scroll(podcastsRef, 'right')} className="w-8 h-8 rounded-full border border-gray-700 bg-[#111113] hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-white"><ChevronRight size={18} /></button>
              </div>
            </div>
            <div ref={podcastsRef} className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x ${hideScrollbar}`}>
              {podcasts.map(item => (
                <div key={item.id} className="relative w-72 sm:w-80 md:w-96 flex-shrink-0 snap-start">
                  {renderPodcastCard(item)}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <>
      <Header activeSport={playerSport} />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full">
        <Sidebar currentPath={`/player/${rawSlug}`} activeSport={playerSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0">
          <main className="flex-1 overflow-y-auto relative z-0 scrollbar-hide pb-24">
            
            <div className="relative w-full h-[260px] flex items-end overflow-hidden rounded-2xl mb-6 mt-6 shadow-2xl">
              <div 
                className="absolute inset-0 opacity-80 z-0" 
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              />

              {teamLogo && (
                <img 
                  src={teamLogo} 
                  alt="Team Logo Background" 
                  className="absolute -right-[10%] md:-right-10 top-1/2 transform -translate-y-1/2 h-[200%] w-auto opacity-20 pointer-events-none z-0" 
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0" />
              
              <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-end md:justify-start gap-2 md:gap-10 h-full px-6 md:px-0">
                
                {headshot ? (
                  <div className="flex h-24 sm:h-32 md:h-[115%] items-end shrink-0 relative mb-0 md:mb-0 z-10 w-auto md:w-[55%] max-w-[400px]">
                    <img 
                      src={headshot} 
                      alt={playerName} 
                      className="h-full w-auto md:w-full lg:w-auto object-contain object-left-bottom md:object-bottom drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]" 
                      style={{ 
                        WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 15%)',
                        maskImage: 'linear-gradient(to top, transparent 0%, black 15%)' 
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 md:h-32 md:w-32 bg-black/20 rounded-full items-center justify-center border-4 border-white/10 backdrop-blur-sm shrink-0 mb-2 md:mb-4 md:ml-6">
                    <User className="w-10 h-10 md:w-12 md:h-12 text-white/40" />
                  </div>
                )}

                <div className="flex flex-col gap-1 md:gap-2 w-full z-20 justify-end md:h-full pb-4 md:px-0">
                  <div className="flex items-baseline gap-3 md:gap-4 flex-wrap">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tighter leading-none drop-shadow-2xl text-white">
                       {espnData?.fullName || espnData?.displayName || playerName}
                    </h1>
                    {espnData?.position && (
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400 uppercase tracking-widest">{espnData.position.abbreviation || espnData.position.displayName}</span>
                    )}
                  </div>
                  {espnData && (
                    <div className="flex flex-col gap-3 mt-1 md:mt-3">
                      <div className="flex items-center gap-3">
                        {teamLogo && <img src={teamLogo} alt={espnData.team?.displayName} className="h-6 md:h-8 w-auto object-contain drop-shadow-lg" />}
                        <span className="font-bold text-white/90 text-sm md:text-lg">{espnData.team?.displayName || 'Free Agent'}</span>
                        {espnData.displayExperience && (<span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 font-bold text-[10px] sm:text-xs text-white">Year {espnData.displayExperience}</span>)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 text-[11px] md:text-sm mt-1">
                        {espnData.displayHeight && espnData.displayWeight && (<div className="flex gap-1.5"><span className="text-gray-500 uppercase font-bold tracking-wider">HT/WT</span><span className="text-gray-200 font-semibold">{espnData.displayHeight}, {espnData.displayWeight}</span></div>)}
                        {espnData.age && (<div className="flex gap-1.5"><span className="text-gray-500 uppercase font-bold tracking-wider">Age</span><span className="text-gray-200 font-semibold">{espnData.age}</span></div>)}
                        {dob && (<div className="flex gap-1.5 hidden sm:flex"><span className="text-gray-500 uppercase font-bold tracking-wider">DOB</span><span className="text-gray-200 font-semibold">{dob}</span></div>)}
                        {birthplace && (<div className="flex gap-1.5"><span className="text-gray-500 uppercase font-bold tracking-wider">Born</span><span className="text-gray-200 font-semibold">{birthplace}</span></div>)}
                        {espnData.college?.name && (<div className="flex gap-1.5"><span className="text-gray-500 uppercase font-bold tracking-wider">College</span><span className="text-gray-200 font-semibold">{espnData.college.name}</span></div>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mb-8 pb-4 border-b border-gray-800 flex items-center justify-start">
              {/* SEO DIRECTORY BREADCRUMB */}
              <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <Link href={`/${playerSport.toLowerCase()}`} className="hover:text-white transition-colors">{playerSport}</Link>
                <span>/</span>
                <Link href={`/${playerSport.toLowerCase()}/teams`} className="hover:text-white transition-colors">Teams</Link>
                <span>/</span>
                {teamSlug && (
                  <>
                    <Link href={`/${playerSport.toLowerCase()}/teams/${teamSlug}`} className="hover:text-white transition-colors whitespace-nowrap">{espnData.team.displayName}</Link>
                    <span>/</span>
                  </>
                )}
                <span className="text-gray-400 whitespace-nowrap">{espnData?.fullName || espnData?.displayName || playerName}</span>
              </div>
            </div>

            <div className="max-w-7xl mx-auto pb-12 flex flex-col gap-12 w-full">
              {renderOmfgDashboard()}
              {renderContentGrid()}
            </div>
          </main>
        </div>
      </div>
      
      {selectedItem && (
        <ContentModal 
           selectedItem={selectedItem} 
           setSelectedItem={handleSetSelectedItem} 
           videos={content.filter(p => p.type === 'video' || p.type === 'short')} 
        />
      )}
    </>
  );
}