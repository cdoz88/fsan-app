"use client";
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

// --- ASSETS (SVGs Omitted for Brevity - Keep your existing SVG components here) ---
const WeeklyScorerSVG = () => ( /* ... same as before ... */ );
const LitchSVG = () => ( /* ... same as before ... */ );
const Club200SVG = () => ( /* ... same as before ... */ );

export default function NapkinLeaderboard() {
  const [overallTeams, setOverallTeams] = useState([]);
  const [activeTeams, setActiveTeams] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  const [currentWeek, setCurrentWeek] = useState('overall');
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [showKey, setShowKey] = useState(false);
  
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/scl?action=scl_get_leaderboard_data');
        const data = await res.json();
        
        if (data.available_weeks) setAvailableWeeks(data.available_weeks);
        if (data.teams) {
           setOverallTeams(data.teams);
           setActiveTeams(data.teams);
        } else {
           setError('Season results are being finalized.');
        }
      } catch (err) {
        setError('Error syncing with the database.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchWeeklyData = async (week) => {
    setLoading(true);
    setCurrentWeek(week);
    if (week === 'overall') {
      setActiveTeams(overallTeams);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/scl?action=scl_get_weekly_data&week=${week}`);
      const result = await res.json();
      if (result.success) setActiveTeams(result.data.teams);
    } catch (err) {
      setError('Error loading week data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (team) => {
    setSelectedTeam(team);
    setModalLoading(true);
    setModalData(null);
    try {
      const res = await fetch(`/api/scl?action=scl_get_user_details&user_id=${team.ownerId}&league_id=${team.leagueId}`);
      const result = await res.json();
      if (result.success) setModalData(result.data);
      else setModalError('No weekly data found for this manager.');
    } catch (err) {
      setModalError('Connection to stats server failed.');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredTeams = activeTeams.filter(team => 
    team.ownerUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 shadow-xl overflow-hidden mt-12 flex flex-col animate-in fade-in duration-500">
      
      {/* HEADER & SELECTORS */}
      <div className="p-4 md:p-6 border-b border-gray-800 bg-[#151515] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
           <h2 className="text-xl font-black uppercase tracking-wider text-white mr-4">2025-2026 Results</h2>
           
           <div className="relative w-full md:w-48">
             <select 
               value={currentWeek} 
               onChange={(e) => fetchWeeklyData(e.target.value)}
               className="w-full bg-[#111] border border-gray-700 text-white rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-gray-500 appearance-none shadow-inner cursor-pointer font-bold"
             >
               <option value="overall">Overall Season</option>
               {availableWeeks.map(w => <option key={w} value={w}>Week {w}</option>)}
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
               <ChevronDown size={16} />
             </div>
           </div>
        </div>

        <div className="relative w-full md:w-72">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
           <input 
             type="text"
             placeholder="Find manager..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-[#0a0a0a] border border-gray-700 text-white rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-gray-500 transition-colors shadow-inner"
           />
        </div>
      </div>

      {/* EXPANDABLE AWARDS KEY */}
      <div className="bg-[#111] border-b border-gray-800">
        <button 
          onClick={() => setShowKey(!showKey)} 
          className="w-full px-6 py-3 flex items-center justify-between text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          <span className="flex items-center gap-2"><Info size={14} /> Awards Information</span>
          {showKey ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {showKey && (
          <div className="px-6 pb-6 pt-2 flex flex-wrap gap-8 justify-start animate-in slide-in-from-top-2 duration-300">
            <span className="flex items-center gap-2 text-xs text-gray-300"><LitchSVG /> <b>LITCH:</b> Overall Points Leader</span>
            <span className="flex items-center gap-2 text-xs text-gray-300"><WeeklyScorerSVG /> <b>Weekly Top:</b> Highest weekly score</span>
            <span className="flex items-center gap-2 text-xs text-gray-300"><Club200SVG /> <b>200+ Club:</b> Scored 200+ points</span>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-[#111] text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-800">
              <th className="px-6 py-4 w-16 text-center">Rank</th>
              <th className="px-6 py-4">Manager</th>
              <th className="px-6 py-4 text-center">Awards</th>
              <th className="px-6 py-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr><td colSpan="4" className="py-16 text-center"><Loader2 size={32} className="animate-spin text-gray-600 mx-auto" /></td></tr>
            ) : filteredTeams.length === 0 ? (
              <tr><td colSpan="4" className="py-16 text-center text-gray-500 font-bold uppercase text-sm">{error || "No data found."}</td></tr>
            ) : (
              filteredTeams.map((team) => {
                let badges = [];
                const bSource = currentWeek === 'overall' ? team.badges : team.weekly_badges;
                if (bSource?.litchAward) badges.push({ icon: <LitchSVG />, count: currentWeek === 'overall' ? team.badges.litchAward : null });
                if (bSource?.weeklyTopScorer) badges.push({ icon: <WeeklyScorerSVG />, count: currentWeek === 'overall' ? team.badges.weeklyTopScorer : null });
                if (bSource?.twoHundredClub) badges.push({ icon: <Club200SVG />, count: currentWeek === 'overall' ? team.badges.twoHundredClub : null });

                return (
                  <tr key={team.teamId} onClick={() => handleRowClick(team)} className="hover:bg-[#151515] transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-center"><span className={`font-black text-lg ${team.rank <= 3 ? 'text-white drop-shadow-md' : 'text-gray-500'}`}>{team.rank}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={team.ownerAvatar} alt={team.ownerUsername} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 shrink-0" />
                        <div className="flex flex-col"><span className="font-bold text-gray-200 text-sm group-hover:text-blue-400">{team.ownerUsername}</span><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{team.leagueName}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {badges.length > 0 ? badges.map((b, i) => (<div key={i} className="flex items-center">{b.icon}{b.count && <span className="text-[10px] font-black text-gray-400 ml-1.5">{b.count}</span>}</div>)) : <span className="text-gray-700">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right flex flex-col items-end justify-center h-full">
                      <span className="font-black text-white text-base">{parseFloat(currentWeek === 'overall' ? team.totalPoints : team.points).toFixed(2)}</span>
                      {currentWeek === 'overall' && <span className="text-[10px] font-bold text-gray-500 tracking-widest mt-1">{team.wins}-{team.losses}</span>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MANAGER ANALYTICS MODAL */}
      {selectedTeam && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="absolute inset-0" onClick={() => setSelectedTeam(null)}></div>
           <div className="relative bg-[#1a1a1a] border border-gray-700 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <button onClick={() => setSelectedTeam(null)} className="absolute top-4 right-4 p-2 bg-gray-900 hover:bg-gray-800 rounded-full text-gray-400 transition-colors z-10"><X size={20} /></button>
              <div className="p-6 md:p-8 border-b border-gray-800 bg-[#111] flex items-center gap-6">
                 <img src={selectedTeam.ownerAvatar} className="w-16 h-16 rounded-full border-2 border-gray-600 shadow-xl" alt="" />
                 <div><h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter">{selectedTeam.ownerUsername}</h2><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{selectedTeam.leagueName}</span></div>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-hide">
                 {modalLoading ? (
                    <div className="flex flex-col items-center justify-center py-20"><Loader2 size={40} className="animate-spin text-gray-600 mb-4" /><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Compiling Archive...</span></div>
                 ) : modalData ? (
                    <div className="flex flex-col gap-8">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center"><span className="text-[10px] font-black uppercase text-gray-500 mb-1">Rank</span><span className="text-2xl font-black text-white">{selectedTeam.rank}</span></div>
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center"><span className="text-[10px] font-black uppercase text-gray-500 mb-1">Points</span><span className="text-2xl font-black text-white">{parseFloat(selectedTeam.totalPoints).toFixed(2)}</span></div>
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center"><span className="text-[10px] font-black uppercase text-gray-500 mb-1">H2H Wins</span><span className="text-2xl font-black text-white">{Object.values(modalData.weekly_results).filter(w => w.h2h === 'W').length}</span></div>
                          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center"><span className="text-[10px] font-black uppercase text-gray-500 mb-1">Med Wins</span><span className="text-2xl font-black text-white">{Object.values(modalData.weekly_results).filter(w => w.median === 'W').length}</span></div>
                       </div>
                       
                       <div className="w-full h-[300px] bg-[#111] border border-gray-800 rounded-2xl p-4">
                         <Line 
                           data={{ 
                             labels: Array.from({length: 17}, (_, i) => `Wk ${i + 1}`), 
                             datasets: [
                               { label: 'Weekly Points', data: Array.from({length: 17}, (_, i) => modalData.weekly_results[i+1]?.points || null), borderColor: '#48bb78', backgroundColor: 'rgba(72, 187, 120, 0.1)', yAxisID: 'yPoints', fill: true, tension: 0.4 }, 
                               { label: 'Weekly Rank', data: Array.from({length: 17}, (_, i) => modalData.weekly_results[i+1]?.rank || null), borderColor: '#27d7ff', backgroundColor: 'rgba(39, 215, 255, 0.1)', yAxisID: 'yRank', fill: true, tension: 0.4 }
                             ] 
                           }} 
                           options={{ 
                             responsive: true, 
                             maintainAspectRatio: false, 
                             scales: { 
                               yPoints: { type: 'linear', position: 'left', grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a0aec0' } }, 
                               yRank: { type: 'linear', position: 'right', reverse: true, min: 1, max: overallTeams.length, grid: { drawOnChartArea: false }, ticks: { color: '#a0aec0' } }, 
                               x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#a0aec0' } } 
                             }, 
                             plugins: { legend: { labels: { color: '#e2e8f0', usePointStyle: true, boxWidth: 8 } } } 
                           }} 
                         />
                       </div>

                       <div className="w-full overflow-x-auto bg-[#111] border border-gray-800 rounded-2xl">
                         <table className="w-full text-center whitespace-nowrap">
                           <thead><tr className="border-b border-gray-800 bg-[#0a0a0a]"><th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase text-left">Week</th>{Array.from({length: 17}, (_, i) => <th key={i} className="px-3 py-3 text-[10px] font-black text-gray-500">{i + 1}</th>)}</tr></thead>
                           <tbody className="divide-y divide-gray-800/50 text-xs font-bold text-gray-300">
                             <tr className="hover:bg-[#151515]"><td className="px-4 py-3 text-left text-gray-500">PTS</td>{Array.from({length: 17}, (_, i) => <td key={i} className="px-3 py-3">{modalData.weekly_results[i+1] ? Math.round(modalData.weekly_results[i+1].points) : '-'}</td>)}</tr>
                             <tr className="hover:bg-[#151515]"><td className="px-4 py-3 text-left text-gray-500">H2H</td>{Array.from({length: 17}, (_, i) => { const res = modalData.weekly_results[i+1]?.h2h; return <td key={i} className={`px-3 py-3 ${res === 'W' ? 'text-green-500' : res === 'L' ? 'text-red-500' : ''}`}>{res || '-'}</td> })}</tr>
                             <tr className="hover:bg-[#151515]"><td className="px-4 py-3 text-left text-gray-500">MED</td>{Array.from({length: 17}, (_, i) => { const res = modalData.weekly_results[i+1]?.median; return <td key={i} className={`px-3 py-3 ${res === 'W' ? 'text-green-500' : res === 'L' ? 'text-red-500' : ''}`}>{res || '-'}</td> })}</tr>
                           </tbody>
                         </table>
                       </div>
                    </div>
                 ) : <div className="text-center py-20 text-gray-500 uppercase font-black tracking-widest text-sm border border-dashed border-gray-800 rounded-2xl">{modalError || "No data recorded for this manager."}</div>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}