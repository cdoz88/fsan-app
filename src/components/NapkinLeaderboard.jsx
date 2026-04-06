"use client";
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Info, X, ChevronDown } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

// --- ASSETS (FULL SVGS) ---
const WeeklyScorerSVG = () => (
  <svg viewBox="0 0 100 100" className="w-5 h-5 shrink-0 drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
    <linearGradient id="grad1" gradientUnits="userSpaceOnUse" x1="50" x2="50" y1="38.457" y2="98.241"><stop offset="0" stopColor="#27d7ff"/><stop offset=".044" stopColor="#29d2ff"/><stop offset=".437" stopColor="#3db3ff"/><stop offset=".769" stopColor="#49a0ff"/><stop offset="1" stopColor="#4e9aff"/></linearGradient>
    <linearGradient id="grad2" x1="50" x2="50" href="#grad1" y1=".76" y2="43.088"/>
    <path d="m50 38.457c-16.482 0-29.892 13.409-29.892 29.892s13.41 29.893 29.892 29.893 29.893-13.41 29.893-29.893-13.41-29.892-29.893-29.892zm17.707 29.892c0 9.764-7.943 17.707-17.707 17.707s-17.707-7.943-17.707-17.707 7.943-17.706 17.707-17.706 17.707 7.943 17.707 17.706zm-11.057 6.827v2.333c0 .442-.358.8-.8.8h-11.237c-.442 0-.8-.358-.8-.8v-2.333c0-.442.358-.8.8-.8h2.715c.442 0 .8-.358-.8-.8v-9.954c0-.442-.358-.8-.8-.8h-2.142c-.442 0-.8-.358-.8-.8v-1.551c0-.38.273-.703.645-.783 1.74-.375 2.979-.864 4.194-1.587.122-.073.262-.113.404-.113h2.561c.442 0 .8.358.8.8v14.788c0 .442.358.8.8.8h2.06c.442 0 .8.358.8.8z" fill="url(#grad1)"/>
    <path d="m59.73 20.01h-19.459c-3.503-5.383-12.524-19.25-12.524-19.25h44.507s-9.726 14.949-12.524 19.25zm-12.009 16.036c-6.659-10.235-22.513-34.605-22.513-34.605-.247-.379-.651-.626-1.101-.674-.455-.045-.897.111-1.217.432l-11.491 11.49c-.501.501-.583 1.284-.197 1.879 3.301 5.074 10.932 16.803 18.555 28.52 4.994-4.01 11.194-6.568 17.963-7.042zm29.389-34.847c-.319-.32-.766-.473-1.217-.432-.45.048-.854.295-1.101.674 0 0-16.617 25.541-22.513 34.605 6.769.473 12.97 3.032 17.963 7.042 7.584-11.657 15.178-23.329 18.555-28.519.387-.595.305-1.378-.197-1.879z" fill="url(#grad2)"/>
  </svg>
);
const LitchSVG = () => (
  <svg viewBox="0 0 512 512" className="w-5 h-5 shrink-0 drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="litchGrad"><stop stopOpacity="1" stopColor="#b89905" offset="0.02"/><stop stopOpacity="1" stopColor="#e6d604" offset="1"/></linearGradient></defs>
    <path d="m434.6 30.2h-76.4c-6.9 50.2-50.1 89.1-102.2 89.1s-95.3-38.8-102.2-89.1h-76.4c-26 0-47.2 21.2-47.2 47.2v115h51.7v-49.4c0-7.8 6.3-14.1 14.1-14.1s14.1 6.3 14.1 14.1v338.8h291.7v-338.8c0-7.8 6.3-14.1 14.1-14.1s14.1 6.3 14.1 14.1v49.4h51.7v-115c.1-26-21.1-47.2-47.1-47.2z" fill="url(#litchGrad)"/>
    <path d="m434.6 2h-89.5c-7.8 0-14.1 6.3-14.1 14.1 0 41.3-33.6 75-75 75-41.3 0-75-33.6-75-75 0-7.8-6.3-14.1-14.1-14.1h-89.5c-41.6 0-75.4 33.8-75.4 75.4v129.1c0 7.8 6.3 14.1 14.1 14.1h65.8v275.3c0 7.8 6.3 14.1 14.1 14.1h319.9c7.8 0 14.1-6.3 14.1-14.1v-275.3h65.8c7.8 0 14.1-6.3 14.1-14.1v-129.1c.1-41.6-33.7-75.4-75.3-75.4zm47.2 190.4h-51.7v-49.4c0-7.8-6.3-14.1-14.1-14.1s-14.1 6.3-14.1 14.1v338.8h-291.7v-338.8c0-7.8-6.3-14.1-14.1-14.1s-14.1 6.3-14.1 14.1v49.4h-51.8v-115c0-26 21.2-47.2 47.2-47.2h76.4c6.9 50.2 50.1 89.1 102.2 89.1s95.3-38.8 102.2-89.1h76.4c26 0 47.2 21.2 47.2 47.2z" fill="#000000"/>
    <g fill="#194f82"><path d="m216.3 218c5.5 5.5 4.6 12.8-.6 21.3-6.5 9.2-27.6 29.1-47.7 50.5v18.8h80.1v-22.7h-44.8c15.4-16 30.1-30.1 37-41.8 7.9-15.8 5.2-32.2-6.7-42.2-19.8-17.3-53.4-10.5-67.5 15.7l20.3 12c5.9-10.2 18.9-21.6 29.9-11.6z" fill="#000000"/><path d="m278.2 274.3-13.3 18.5c23.9 28.5 80.1 21.1 81.1-21.7 0-26.6-25.5-41.3-51.7-35.2v-19h44.8v-21.9h-68.6v55.4l10.6 11.4c21.6-11.8 39.6-5.1 39.5 9.7-.3 16.9-21.6 22.7-42.4 2.8z" fill="#000000"/><path d="m339.1 349.1h-166.3c-7.8 0-14.1 6.3-14.1 14.1s6.3 14.1 14.1 14.1h166.3c7.8 0 14.1-6.3 14.1-14.1.1-7.8-6.3-14.1-14.1-14.1z" fill="#000000"/><path d="m339.1 405.5h-166.3c-7.8 0-14.1 6.3-14.1 14.1s6.3 14.1 14.1 14.1h166.3c7.8 0 14.1-6.3 14.1-14.1.1-7.8-6.3-14.1-14.1-14.1z" fill="#000000"/></g>
  </svg>
);
const Club200SVG = () => (
  <svg viewBox="0 0 4183.08 3651.57" className="w-5 h-5 shrink-0 drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
    <path d="m1185.2,2637.54c-20.07,22.98-1022.68,270.18-1074.5,246.53s-97.39-94.54-104.6-154.26c-11.07-26.04-3.69-85.66-3.69-85.66,23.68-48.92,44.28-87.41,61.82-115.41,3.47-5.04,57.86-94.71,163.19-268.99,71.7-119.89,136.79-218.48,195.25-295.72,24.96-38.98,66.46-116.78,124.54-233.43,80.65-197.01,132.39-329.89,155.23-398.61,44.07-133.99,71.52-262.29,82.32-384.9,5.55-63.08,2.59-105.42-8.85-127.02-11.44-21.6-38.24-35.12-80.38-40.63,0,0-93.63,12.05-129.38,61.11s-285.69,311.06-310.93,311.07-77.96-52.76-91.88-105.02c-25.18-73.94,26.77-167.96,27.24-173.3,25.23-27.32,53.12-62.91,83.68-106.77,49.59-54.73,101.66-108.33,156.24-160.81,83.21-79.51,146.25-130.38,189.11-152.57,36.12-19.18,82.61-26.28,139.44-21.28,51.27,4.51,99.59,40.12,144.97,106.75,54.53,80,78.71,172.1,72.56,276.31,1.48,46.72,2.95,71.45,4.44,74.26.49-.83.83-2.13.99-3.92l-8.91,101.26c-1.53,12.43-4.24,30.98-8.13,55.7-3.94,20.24-8,44.52-12.21,72.79-20.76,157.53-70.09,341.19-147.97,550.99-15.23,40.77-63.89,158.25-145.99,352.43-35.97,51.45-126.53,246.25-147.53,289.16-31.64,46.48-70.11,109.34-115.42,188.61l9.32,11.55,490.85-95.1s153.05,3.95,221.33,61.09c33.96,28.43,66.45,49.73,79.01,92.92-1.17,13.33,8.9,47.93-11.17,70.91Z" style={{fill:"#e00511"}}/>
    <path d="m1661.57,2589.62c310.82,50.68,555.49-198.56,676.61-458.09,79.93-175.31,140.06-358.93,183.43-546.74,73.14-330.32,102.07-679.13-6.47-1008.5-73.65-189.64-346.56-91.44-283.51,101.09,147.18,449.47,52.24,1017.33-170.28,1428.28-41.23,76.15-90.11,150.7-159.8,202.09-103.26,76.13-247.86,77.72-349.98-1.44-84.86-65.87-136.97-165.43-160.55-269.47-21.09-89.1-25.51-186.58-23.15-287.03,7.12-265.97,41.59-529.63,141.31-774.79,124.01-304.54,363.94-585.63,692.34-668.92,58.74-14.52,41.94-99.47-17.87-90.37,0,0-40.73,7.76-40.73,7.76-27.68,4.19-63.65,15.9-90.64,23.07-22.26,8.46-46.46,15.89-68.38,25.14-102.37,42.34-197.06,104.01-280.77,176.15-283.13,245.75-430.45,609.62-489.88,972.48-38.61,268.44-81.66,572.51,32.17,831.19,75.6,169.33,227.75,311.78,416.14,338.1Z" style={{fill:"#e00511"}}/>
    <path d="m3257.87,2374.59c310.82,50.68,555.49-198.56,676.61-458.09,79.93-175.31,140.06-358.93,183.43-546.74,73.14-330.32,102.07-679.13-6.47-1008.5-73.65-189.64-346.56-91.44-283.51,101.09,147.18,449.47,52.24,1017.33-170.28,1428.28-41.23,76.15-90.11,150.7-159.8,202.09-103.26,76.13-247.86,77.72-349.98-1.44-84.86-65.87-136.97-165.43-160.55-269.47-21.09-89.1-25.51-186.58-23.15-287.03,7.12-265.97,41.59-529.63,141.31-774.79,124.01-304.54,363.94-585.63,692.34-668.92,58.74-14.52,41.94-99.47-17.87-90.37,0,0-40.73,7.76-40.73,7.76-27.68,4.19-63.65,15.9-90.64,23.07-22.26,8.46-46.46,15.89-68.38,25.14-102.37,42.34-197.06,104.01-280.77,176.15-283.13,245.75-430.45,609.62-489.88,972.48-38.61,268.44-81.66,572.51,32.17,831.19,75.6,169.33,227.75,311.78,416.14,338.1Z" style={{fill:"#e00511"}}/>
    <path d="m2275.73,2797.71c-489.76,46.4-964.56,123.96-1466.41,272.78-41.45,12.43-66.62,50.42-57.29,89.52,10.19,42.72,57.67,70.65,106.05,62.39,0,0,340.17-58.1,340.17-58.1,339.32-57.22,680.38-107.5,1023.18-147.14,169.38-19.43,345.25-37.18,515.59-50.73,287.32-24.03,576.23-38.67,865.35-50.63,40.99-1.57,74.56-30.04,76.88-66.97,2.51-39.78-32.15-74.35-77.4-77.22-441.56-27.13-887.21-14.66-1326.12,26.1Z" style={{fill:"#e00511"}}/>
    <path d="m4141.71,3103.05c-601.42-44.65-1206.83-3.61-1805,60.73-599.22,65.62-1197.37,170.71-1768.92,366.37-70.48,26.84-44.92,128.49,28.24,121.03,148.96-18.11,296.56-40.13,444.11-61.54,425.46-62.72,901.39-132.51,1325.74-189.04,591.76-80.42,1181.76-154.97,1776.6-213.33,19.94-1.96,36.27-17.94,37.96-38.62,1.91-23.29-15.45-43.71-38.73-45.59Z" style={{fill:"#e00511"}}/>
  </svg>
);

export default function NapkinLeaderboard({ initialLeaderboard = { data: { teams: [], available_weeks: [], winners_registry: {} } } }) {
  const [overallTeams, setOverallTeams] = useState(initialLeaderboard.data?.teams || []);
  const [activeTeams, setActiveTeams] = useState(initialLeaderboard.data?.teams || []);
  const [winnersRegistry, setWinnersRegistry] = useState(initialLeaderboard.data?.winners_registry || {});
  const [loading, setLoading] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWeek, setCurrentWeek] = useState('overall');
  const [availableWeeks, setAvailableWeeks] = useState(initialLeaderboard.data?.available_weeks || []);
  
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [activeHistoryAward, setActiveHistoryAward] = useState(null);

  useEffect(() => {
    if (availableWeeks.length > 0) return;
    const fetchMeta = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/scl?action=scl_get_leaderboard_data');
        const json = await res.json();
        const data = json.data;
        if (data?.available_weeks) setAvailableWeeks(data.available_weeks);
        if (data?.winners_registry) setWinnersRegistry(data.winners_registry);
        if (data?.teams) { setOverallTeams(data.teams); setActiveTeams(data.teams); }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchMeta();
  }, [availableWeeks.length]);

  const fetchWeeklyData = async (week) => {
    setLoading(true); setCurrentWeek(week);
    if (week === 'overall') { setActiveTeams(overallTeams); setLoading(false); return; }
    try {
      const res = await fetch(`/api/scl?action=scl_get_weekly_data&week=${week}`);
      const result = await res.json();
      if (result.success && result.data?.teams) setActiveTeams(result.data.teams);
    } catch (err) { console.error('Weekly sync failed'); } finally { setLoading(false); }
  };

  const handleRowClick = async (teamId) => {
    const team = overallTeams.find(t => t.teamId === teamId);
    if (!team) return;
    setSelectedTeam(team); setModalLoading(true); setModalData(null);
    try {
      const res = await fetch(`/api/scl?action=scl_get_user_details&user_id=${team.ownerId}&league_id=${team.leagueId}`);
      const json = await res.json();
      if (json.success) setModalData(json.data);
    } catch (err) { console.error('Manager lookup failed'); } finally { setModalLoading(false); }
  };

  const filteredTeams = activeTeams.filter(team => team.ownerUsername?.toLowerCase().includes(searchTerm.toLowerCase()));

  const getBadges = (team) => {
    let badges = [];
    const bSource = currentWeek === 'overall' ? team.badges : team.weekly_badges;
    if (bSource?.litchAward) badges.push({ icon: <LitchSVG />, count: currentWeek === 'overall' ? team.badges.litchAward : null });
    if (bSource?.weeklyTopScorer) badges.push({ icon: <WeeklyScorerSVG />, count: currentWeek === 'overall' ? team.badges.weeklyTopScorer : null });
    if (bSource?.twoHundredClub) badges.push({ icon: <Club200SVG />, count: currentWeek === 'overall' ? team.badges.twoHundredClub : null });
    return badges;
  };

  return (
    <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 shadow-xl overflow-hidden mt-2 flex flex-col animate-in fade-in duration-500">
      
      <div className="p-4 md:p-6 border-b border-gray-800 bg-[#151515] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
           <h2 className="text-xl font-black uppercase tracking-wider text-white mr-4 whitespace-nowrap">2025-2026 Season</h2>
           <div className="relative w-full md:w-48">
             <select 
               value={currentWeek} 
               onChange={(e) => fetchWeeklyData(e.target.value)} 
               className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-2.5 px-4 text-sm appearance-none shadow-inner cursor-pointer font-bold"
             >
               <option value="overall">Overall Results</option>
               {[...availableWeeks].sort((a,b) => b-a).map(w => <option key={w} value={w}>Week {w}</option>)}
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500"><ChevronDown size={16} /></div>
           </div>
        </div>
        <div className="relative w-full md:w-72">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
           <input type="text" placeholder="Search managers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0a0a0a] border border-gray-700 text-white rounded-xl py-2.5 pl-11 pr-4 text-sm focus:border-gray-500 shadow-inner" />
        </div>
      </div>

      {/* UPDATED: COMPACT PILL-STYLE AWARDS KEY */}
      <div className="bg-[#111] px-6 py-5 border-b border-gray-800 flex flex-col gap-3">
        <span className="text-gray-500 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
           <Info size={14} className="text-blue-500" /> Click an award to view history:
        </span>
        <div className="flex flex-wrap items-center gap-3">
           <button onClick={() => setActiveHistoryAward('litchAward')} className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 hover:border-gray-500 rounded-full px-4 py-2 text-xs text-gray-300 hover:text-white transition-all shadow-sm">
             <LitchSVG /> <b>LITCH:</b> Points Leader
           </button>
           <button onClick={() => setActiveHistoryAward('weeklyTopScorer')} className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 hover:border-gray-500 rounded-full px-4 py-2 text-xs text-gray-300 hover:text-white transition-all shadow-sm">
             <WeeklyScorerSVG /> <b>Weekly Top:</b> High score
           </button>
           <button onClick={() => setActiveHistoryAward('twoHundredClub')} className="flex items-center gap-2 bg-[#1a1a1a] border border-gray-700 hover:border-gray-500 rounded-full px-4 py-2 text-xs text-gray-300 hover:text-white transition-all shadow-sm">
             <Club200SVG /> <b>200+ Club:</b> Scored 200+
           </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-[#111] text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-800">
              <th className="px-6 py-4 w-16 text-center">Rank</th><th className="px-6 py-4">Manager</th><th className="px-6 py-4 text-center">Awards</th><th className="px-6 py-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr><td colSpan="4" className="py-16 text-center"><Loader2 size={32} className="animate-spin text-gray-600 mx-auto" /></td></tr>
            ) : (
              filteredTeams.map((team) => {
                const badges = getBadges(team);
                return (
                  <tr key={team.teamId} onClick={() => handleRowClick(team.teamId)} className="hover:bg-[#151515] transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-center"><span className={`font-black text-lg ${team.rank <= 3 ? 'text-white' : 'text-gray-500'}`}>{team.rank}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={team.ownerAvatar} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 shadow-inner" alt="" />
                        <div className="flex flex-col"><span className="font-bold text-gray-200 text-sm group-hover:text-blue-400 transition-colors">{team.ownerUsername}</span><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{team.leagueName}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        {badges.length > 0 ? badges.map((b, i) => (
                           <div key={i} className="flex items-center gap-1.5">
                             {b.icon}
                             {b.count && <span className="text-white font-bold text-sm">{b.count}</span>}
                           </div>
                        )) : <span className="text-gray-700 font-bold">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right flex flex-col items-end justify-center h-full">
                      <span className="font-black text-white text-base drop-shadow-md">{parseFloat(currentWeek === 'overall' ? team.totalPoints : team.points).toFixed(2)}</span>
                      {currentWeek === 'overall' && <span className="text-[10px] font-bold text-gray-500 tracking-widest mt-1">{team.wins}-{team.losses}</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {activeHistoryAward && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setActiveHistoryAward(null)}></div>
          <div className="relative bg-[#1a1a1a] border border-gray-700 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95">
             <button onClick={() => setActiveHistoryAward(null)} className="absolute top-4 right-4 p-2 bg-gray-900 rounded-full text-gray-400 hover:text-white z-10"><X size={20} /></button>
             <div className="p-6 border-b border-gray-800 bg-[#111] flex items-center gap-4">
                {activeHistoryAward === 'litchAward' ? <LitchSVG /> : activeHistoryAward === 'weeklyTopScorer' ? <WeeklyScorerSVG /> : <Club200SVG />}
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                   {activeHistoryAward === 'litchAward' ? 'LITCH Award History' : activeHistoryAward === 'weeklyTopScorer' ? 'Weekly Top Scorer History' : '200+ Club History'}
                </h2>
             </div>
             <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
                <div className="space-y-4">
                  {[...availableWeeks].sort((a,b) => b-a).map(w => {
                    const winnersForWeek = winnersRegistry[activeHistoryAward]?.[w] || [];
                    if (winnersForWeek.length === 0) return null;
                    return (
                      <div key={w} className="bg-[#111] rounded-2xl p-4 border border-gray-800">
                        <div className="text-[10px] font-black uppercase text-blue-500 mb-3 tracking-widest border-b border-gray-800 pb-2">
                          Week {w} {activeHistoryAward === 'twoHundredClub' ? 'Members' : 'Winner'}
                        </div>
                        <div className="flex flex-wrap gap-4">
                           {winnersForWeek.map(tid => {
                             const team = overallTeams.find(t => t.teamId === tid);
                             if (!team) return null;
                             return (
                               <div key={tid} onClick={() => { setActiveHistoryAward(null); handleRowClick(tid); }} className="flex items-center gap-3 bg-[#1a1a1a] px-3 py-2 rounded-xl border border-gray-700 hover:border-blue-500 cursor-pointer transition-all group">
                                 <img src={team.ownerAvatar} className="w-6 h-6 rounded-full" alt="" />
                                 <span className="text-xs font-bold text-gray-200 group-hover:text-white">{team.ownerUsername}</span>
                               </div>
                             );
                           })}
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
        </div>
      )}

      {selectedTeam && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="absolute inset-0" onClick={() => setSelectedTeam(null)}></div>
           <div className="relative bg-[#1a1a1a] border border-gray-700 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col animate-in fade-in duration-200 overflow-hidden">
              <button onClick={() => setSelectedTeam(null)} className="absolute top-4 right-4 p-2 bg-gray-900 rounded-full text-gray-400 z-10 hover:text-white"><X size={20} /></button>
              <div className="p-6 border-b border-gray-800 bg-[#111] flex items-center gap-6"><img src={selectedTeam.ownerAvatar} className="w-16 h-16 rounded-full border-2 border-gray-600 shadow-xl" alt="" /><div><h2 className="text-2xl md:text-3xl font-black text-white italic">{selectedTeam.ownerUsername}</h2><span className="text-xs font-bold text-gray-500 uppercase">{selectedTeam.leagueName}</span></div></div>
              <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-hide">
                 {modalLoading ? ( <div className="flex flex-col items-center justify-center py-20"><Loader2 size={40} className="animate-spin text-gray-600 mb-4" /><span className="text-xs font-bold text-gray-500 uppercase tracking-widest uppercase">Compiling Stats...</span></div>
                 ) : modalData ? (
                    <div className="flex flex-col gap-8">
                       <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner"><span className="text-[10px] font-black uppercase text-gray-500 mb-1">Rank</span><span className="text-xl font-black text-white">{selectedTeam.rank}</span></div>
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner"><span className="text-[10px] font-black uppercase text-gray-500 mb-1">Points</span><span className="text-xl font-black text-white">{parseFloat(selectedTeam.totalPoints).toFixed(2)}</span></div>
                          
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner">
                             <span className="text-[10px] font-black uppercase text-gray-500 mb-2">Awards</span>
                             <div className="flex gap-4 items-center justify-center">
                               {getBadges(selectedTeam).length > 0 ? getBadges(selectedTeam).map((b, i) => (
                                 <div key={i} className="flex items-center gap-1.5">
                                   {b.icon}
                                   {b.count && <span className="text-white font-bold text-sm">{b.count}</span>}
                                 </div>
                               )) : <span className="text-gray-700 font-bold">-</span>}
                             </div>
                          </div>

                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner"><span className="text-[10px] font-black uppercase text-gray-500 mb-1">H2H Wins</span><span className="text-xl font-black text-white">{Object.values(modalData.weekly_results).filter(w => w.h2h === 'W').length}</span></div>
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner"><span className="text-[10px] font-black uppercase text-gray-500 mb-1">Med Wins</span><span className="text-xl font-black text-white">{Object.values(modalData.weekly_results).filter(w => w.median === 'W').length}</span></div>
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-inner"><span className="text-[10px] font-black uppercase text-gray-500 mb-1">Total Wins</span><span className="text-xl font-black text-white">{Object.values(modalData.weekly_results).filter(w => w.h2h === 'W').length + Object.values(modalData.weekly_results).filter(w => w.median === 'W').length}</span></div>
                       </div>
                       
                       <div className="w-full h-[300px] bg-[#111] border border-gray-800 rounded-2xl p-4 shadow-inner">
                         <Line data={{ labels: Array.from({length: 17}, (_, i) => `Wk ${i + 1}`), datasets: [{ label: 'Points', data: Array.from({length: 17}, (_, i) => modalData.weekly_results[i+1]?.points || null), borderColor: '#48bb78', backgroundColor: 'rgba(72, 187, 120, 0.1)', yAxisID: 'yPoints', fill: true, tension: 0.4 }, { label: 'Rank', data: Array.from({length: 17}, (_, i) => modalData.weekly_results[i+1]?.rank || null), borderColor: '#27d7ff', backgroundColor: 'rgba(39, 215, 255, 0.1)', yAxisID: 'yRank', fill: true, tension: 0.4 }] }} options={{ responsive: true, maintainAspectRatio: false, scales: { yPoints: { type: 'linear', position: 'left', grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a0aec0' } }, yRank: { type: 'linear', position: 'right', reverse: true, min: 1, max: overallTeams.length, grid: { drawOnChartArea: false }, ticks: { color: '#a0aec0' } }, x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a0aec0' } } }, plugins: { legend: { labels: { color: '#e2e8f0', usePointStyle: true, boxWidth: 8 } } } }} />
                       </div>

                       <div className="w-full overflow-x-auto bg-[#111] border border-gray-800 rounded-2xl shadow-inner">
                         <table className="w-full text-center whitespace-nowrap">
                           <thead><tr className="border-b border-gray-800 bg-[#0a0a0a]"><th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase text-left">Week</th>{Array.from({length: 17}, (_, i) => <th key={i} className="px-3 py-3 text-[10px] font-black text-gray-500">{i + 1}</th>)}</tr></thead>
                           <tbody className="divide-y divide-gray-800/50 text-xs font-bold text-gray-300">
                             <tr className="hover:bg-[#151515]"><td className="px-4 py-3 text-left text-gray-500">PTS</td>{Array.from({length: 17}, (_, i) => <td key={i} className="px-3 py-3">{modalData.weekly_results[i+1] ? Math.round(modalData.weekly_results[i+1].points) : '-'}</td>)}</tr>
                             <tr className="hover:bg-[#151515]"><td className="px-4 py-3 text-left text-gray-500">H2H</td>{Array.from({length: 17}, (_, i) => { const res = modalData.weekly_results[i+1]?.h2h; return <td key={i} className={`px-3 py-3 ${res === 'W' ? 'text-green-500' : res === 'L' ? 'text-red-500' : ''}`}>{res || '-'}</td> })}</tr>
                             <tr className="hover:bg-[#151515]"><td className="px-4 py-3 text-left text-gray-500">MED</td>{Array.from({length: 17}, (_, i) => { const res = modalData.weekly_results[i+1]?.median; return <td key={i} className={`px-3 py-3 ${res === 'W' ? 'text-green-500' : res === 'L' ? 'text-red-500' : ''}`}>{res || '-'}</td> })}</tr>
                             <tr className="hover:bg-[#151515]"><td className="px-4 py-3 text-left text-gray-500 font-black">RNK</td>{Array.from({length: 17}, (_, i) => <td key={i} className="px-3 py-3 text-white">{modalData.weekly_results[i+1]?.rank || '-'}</td>)}</tr>
                           </tbody>
                         </table>
                       </div>
                    </div>
                 ) : <div className="text-center py-20 text-gray-500 uppercase font-black tracking-widest text-sm border border-dashed border-gray-800 rounded-2xl">No manager data recorded.</div>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}