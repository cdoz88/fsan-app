"use client";
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Info } from 'lucide-react';

const WeeklyScorerSVG = () => (
  <svg viewBox="0 0 100 100" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <linearGradient id="grad1" gradientUnits="userSpaceOnUse" x1="50" x2="50" y1="38.457" y2="98.241"><stop offset="0" stopColor="#27d7ff"/><stop offset=".044" stopColor="#29d2ff"/><stop offset=".437" stopColor="#3db3ff"/><stop offset=".769" stopColor="#49a0ff"/><stop offset="1" stopColor="#4e9aff"/></linearGradient>
    <linearGradient id="grad2" x1="50" x2="50" href="#grad1" y1=".76" y2="43.088"/>
    <path d="m50 38.457c-16.482 0-29.892 13.409-29.892 29.892s13.41 29.893 29.892 29.893 29.893-13.41 29.893-29.893-13.41-29.892-29.893-29.892zm17.707 29.892c0 9.764-7.943 17.707-17.707 17.707s-17.707-7.943-17.707-17.707 7.943-17.706 17.707-17.706 17.707 7.943 17.707 17.706zm-11.057 6.827v2.333c0 .442-.358.8-.8.8h-11.237c-.442 0-.8-.358-.8-.8v-2.333c0-.442.358-.8.8-.8h2.715c.442 0 .8-.358-.8-.8v-9.954c0-.442-.358-.8-.8-.8h-2.142c-.442 0-.8-.358-.8-.8v-1.551c0-.38.273-.703.645-.783 1.74-.375 2.979-.864 4.194-1.587.122-.073.262-.113.404-.113h2.561c.442 0 .8.358.8.8v14.788c0 .442.358.8.8.8h2.06c.442 0 .8.358.8.8z" fill="url(#grad1)"/>
    <path d="m59.73 20.01h-19.459c-3.503-5.383-12.524-19.25-12.524-19.25h44.507s-9.726 14.949-12.524 19.25zm-12.009 16.036c-6.659-10.235-22.513-34.605-22.513-34.605-.247-.379-.651-.626-1.101-.674-.455-.045-.897.111-1.217.432l-11.491 11.49c-.501.501-.583 1.284-.197 1.879 3.301 5.074 10.932 16.803 18.555 28.52 4.994-4.01 11.194-6.568 17.963-7.042zm29.389-34.847c-.319-.32-.766-.473-1.217-.432-.45.048-.854.295-1.101.674 0 0-16.617 25.541-22.513 34.605 6.769.473 12.97 3.032 17.963 7.042 7.584-11.657 15.178-23.329 18.555-28.519.387-.595.305-1.378-.197-1.879z" fill="url(#grad2)"/>
  </svg>
);

const LitchSVG = () => (
  <svg viewBox="0 0 512 512" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="litchGrad"><stop stopOpacity="1" stopColor="#b89905" offset="0.02"/><stop stopOpacity="1" stopColor="#e6d604" offset="1"/></linearGradient></defs>
    <path d="m434.6 30.2h-76.4c-6.9 50.2-50.1 89.1-102.2 89.1s-95.3-38.8-102.2-89.1h-76.4c-26 0-47.2 21.2-47.2 47.2v115h51.7v-49.4c0-7.8 6.3-14.1 14.1-14.1s14.1 6.3 14.1 14.1v338.8h291.7v-338.8c0-7.8 6.3-14.1 14.1-14.1s14.1 6.3 14.1 14.1v49.4h51.7v-115c.1-26-21.1-47.2-47.1-47.2z" fill="url(#litchGrad)"/>
    <path d="m434.6 2h-89.5c-7.8 0-14.1 6.3-14.1 14.1 0 41.3-33.6 75-75 75-41.3 0-75-33.6-75-75 0-7.8-6.3-14.1-14.1-14.1h-89.5c-41.6 0-75.4 33.8-75.4 75.4v129.1c0 7.8 6.3 14.1 14.1 14.1h65.8v275.3c0 7.8 6.3 14.1 14.1 14.1h319.9c7.8 0 14.1-6.3 14.1-14.1v-275.3h65.8c7.8 0 14.1-6.3 14.1-14.1v-129.1c.1-41.6-33.7-75.4-75.3-75.4zm47.2 190.4h-51.7v-49.4c0-7.8-6.3-14.1-14.1-14.1s-14.1 6.3-14.1 14.1v338.8h-291.7v-338.8c0-7.8-6.3-14.1-14.1-14.1s-14.1 6.3-14.1 14.1v49.4h-51.8v-115c0-26 21.2-47.2 47.2-47.2h76.4c6.9 50.2 50.1 89.1 102.2 89.1s95.3-38.8 102.2-89.1h76.4c26 0 47.2 21.2 47.2 47.2z" fill="#000000"/>
    <g fill="#194f82"><path d="m216.3 218c5.5 5.5 4.6 12.8-.6 21.3-6.5 9.2-27.6 29.1-47.7 50.5v18.8h80.1v-22.7h-44.8c15.4-16 30.1-30.1 37-41.8 7.9-15.8 5.2-32.2-6.7-42.2-19.8-17.3-53.4-10.5-67.5 15.7l20.3 12c5.9-10.2 18.9-21.6 29.9-11.6z" fill="#000000"/><path d="m278.2 274.3-13.3 18.5c23.9 28.5 80.1 21.1 81.1-21.7 0-26.6-25.5-41.3-51.7-35.2v-19h44.8v-21.9h-68.6v55.4l10.6 11.4c21.6-11.8 39.6-5.1 39.5 9.7-.3 16.9-21.6 22.7-42.4 2.8z" fill="#000000"/><path d="m339.1 349.1h-166.3c-7.8 0-14.1 6.3-14.1 14.1s6.3 14.1 14.1 14.1h166.3c7.8 0 14.1-6.3 14.1-14.1.1-7.8-6.3-14.1-14.1-14.1z" fill="#000000"/><path d="m339.1 405.5h-166.3c-7.8 0-14.1 6.3-14.1 14.1s6.3 14.1 14.1 14.1h166.3c7.8 0 14.1-6.3 14.1-14.1.1-7.8-6.3-14.1-14.1-14.1z" fill="#000000"/></g>
  </svg>
);

const Club200SVG = () => (
  <svg viewBox="0 0 4183.08 3651.57" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="m1185.2,2637.54c-20.07,22.98-1022.68,270.18-1074.5,246.53s-97.39-94.54-104.6-154.26c-11.07-26.04-3.69-85.66-3.69-85.66,23.68-48.92,44.28-87.41,61.82-115.41,3.47-5.04,57.86-94.71,163.19-268.99,71.7-119.89,136.79-218.48,195.25-295.72,24.96-38.98,66.46-116.78,124.54-233.43,80.65-197.01,132.39-329.89,155.23-398.61,44.07-133.99,71.52-262.29,82.32-384.9,5.55-63.08,2.59-105.42-8.85-127.02-11.44-21.6-38.24-35.12-80.38-40.63,0,0-93.63,12.05-129.38,61.11s-285.69,311.06-310.93,311.07-77.96-52.76-91.88-105.02c-25.18-73.94,26.77-167.96,27.24-173.3,25.23-27.32,53.12-62.91,83.68-106.77,49.59-54.73,101.66-108.33,156.24-160.81,83.21-79.51,146.25-130.38,189.11-152.57,36.12-19.18,82.61-26.28,139.44-21.28,51.27,4.51,99.59,40.12,144.97,106.75,54.53,80,78.71,172.1,72.56,276.31,1.48,46.72,2.95,71.45,4.44,74.26.49-.83.83-2.13.99-3.92l-8.91,101.26c-1.53,12.43-4.24,30.98-8.13,55.7-3.94,20.24-8,44.52-12.21,72.79-20.76,157.53-70.09,341.19-147.97,550.99-15.23,40.77-63.89,158.25-145.99,352.43-35.97,51.45-126.53,246.25-147.53,289.16-31.64,46.48-70.11,109.34-115.42,188.61l9.32,11.55,490.85-95.1s153.05,3.95,221.33,61.09c33.96,28.43,66.45,49.73,79.01,92.92-1.17,13.33,8.9,47.93-11.17,70.91Z" style={{fill:"#e00511"}}/>
    <path d="m1661.57,2589.62c310.82,50.68,555.49-198.56,676.61-458.09,79.93-175.31,140.06-358.93,183.43-546.74,73.14-330.32,102.07-679.13-6.47-1008.5-73.65-189.64-346.56-91.44-283.51,101.09,147.18,449.47,52.24,1017.33-170.28,1428.28-41.23,76.15-90.11,150.7-159.8,202.09-103.26,76.13-247.86,77.72-349.98-1.44-84.86-65.87-136.97-165.43-160.55-269.47-21.09-89.1-25.51-186.58-23.15-287.03,7.12-265.97,41.59-529.63,141.31-774.79,124.01-304.54,363.94-585.63,692.34-668.92,58.74-14.52,41.94-99.47-17.87-90.37,0,0-40.73,7.76-40.73,7.76-27.68,4.19-63.65,15.9-90.64,23.07-22.26,8.46-46.46,15.89-68.38,25.14-102.37,42.34-197.06,104.01-280.77,176.15-283.13,245.75-430.45,609.62-489.88,972.48-38.61,268.44-81.66,572.51,32.17,831.19,75.6,169.33,227.75,311.78,416.14,338.1Z" style={{fill:"#e00511"}}/>
    <path d="m3257.87,2374.59c310.82,50.68,555.49-198.56,676.61-458.09,79.93-175.31,140.06-358.93,183.43-546.74,73.14-330.32,102.07-679.13-6.47-1008.5-73.65-189.64-346.56-91.44-283.51,101.09,147.18,449.47,52.24,1017.33-170.28,1428.28-41.23,76.15-90.11,150.7-159.8,202.09-103.26,76.13-247.86,77.72-349.98-1.44-84.86-65.87-136.97-165.43-160.55-269.47-21.09-89.1-25.51-186.58-23.15-287.03,7.12-265.97,41.59-529.63,141.31-774.79,124.01-304.54,363.94-585.63,692.34-668.92,58.74-14.52,41.94-99.47-17.87-90.37,0,0-40.73,7.76-40.73,7.76-27.68,4.19-63.65,15.9-90.64,23.07-22.26,8.46-46.46,15.89-68.38,25.14-102.37,42.34-197.06,104.01-280.77,176.15-283.13,245.75-430.45,609.62-489.88,972.48-38.61,268.44-81.66,572.51,32.17,831.19,75.6,169.33,227.75,311.78,416.14,338.1Z" style={{fill:"#e00511"}}/>
    <path d="m2275.73,2797.71c-489.76,46.4-964.56,123.96-1466.41,272.78-41.45,12.43-66.62,50.42-57.29,89.52,10.19,42.72,57.67,70.65,106.05,62.39,0,0,340.17-58.1,340.17-58.1,339.32-57.22,680.38-107.5,1023.18-147.14,169.38-19.43,345.25-37.18,515.59-50.73,287.32-24.03,576.23-38.67,865.35-50.63,40.99-1.57,74.56-30.04,76.88-66.97,2.51-39.78-32.15-74.35-77.4-77.22-441.56-27.13-887.21-14.66-1326.12,26.1Z" style={{fill:"#e00511"}}/>
    <path d="m4141.71,3103.05c-601.42-44.65-1206.83-3.61-1805,60.73-599.22,65.62-1197.37,170.71-1768.92,366.37-70.48,26.84-44.92,128.49,28.24,121.03,148.96-18.11,296.56-40.13,444.11-61.54,425.46-62.72,901.39-132.51,1325.74-189.04,591.76-80.42,1181.76-154.97,1776.6-213.33,19.94-1.96,36.27-17.94,37.96-38.62,1.91-23.29-15.45-43.71-38.73-45.59Z" style={{fill:"#e00511"}}/>
  </svg>
);

export default function NapkinLeaderboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('https://admin.fsan.com/wp-json/scl/v1/leaderboard');
        if (!res.ok) throw new Error('Failed to load leaderboard data.');
        const data = await res.json();
        setTeams(data.teams || []);
      } catch (err) {
        setError('Leaderboard is currently syncing. Please check back later.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredTeams = teams.filter(team => 
    team.ownerUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 shadow-xl overflow-hidden mt-12 flex flex-col">
      {/* HEADER */}
      <div className="p-6 md:p-8 border-b border-gray-800 flex flex-col md:flex-row justify-between gap-4 items-center bg-[#151515]">
        <div>
           <h2 className="text-2xl font-black uppercase tracking-wider text-white">Live Leaderboard</h2>
           <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Current 2025 Standings</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
           <input 
             type="text"
             placeholder="Search players..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-[#0a0a0a] border border-gray-700 text-white rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-gray-500 transition-colors shadow-inner"
           />
        </div>
      </div>

      {/* AWARDS KEY */}
      <div className="bg-[#111] px-6 py-3 border-b border-gray-800 flex flex-wrap items-center gap-6 justify-center md:justify-start">
        <button 
           onClick={() => setShowKey(!showKey)} 
           className="text-gray-400 hover:text-white flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors"
        >
           <Info size={14} /> Awards Key
        </button>
        {showKey && (
          <div className="flex flex-wrap gap-4 animate-in fade-in duration-300">
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
            <tr className="bg-[#111] text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
              <th className="px-6 py-4 w-16 text-center">Rank</th>
              <th className="px-6 py-4">Manager</th>
              <th className="px-6 py-4">League</th>
              <th className="px-6 py-4 text-center">Awards</th>
              <th className="px-6 py-4 text-right">Points</th>
              <th className="px-6 py-4 text-center w-24">Record</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center">
                  <Loader2 size={32} className="animate-spin text-gray-600 mx-auto" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-red-500 font-bold tracking-widest uppercase text-sm">
                  {error}
                </td>
              </tr>
            ) : filteredTeams.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-gray-500 font-bold tracking-widest uppercase text-sm">
                  No matching teams found.
                </td>
              </tr>
            ) : (
              filteredTeams.map((team) => (
                <tr key={team.teamId} className="hover:bg-[#151515] transition-colors group">
                  <td className="px-6 py-4 text-center">
                    <span className={`font-black text-lg ${team.rank <= 3 ? 'text-white' : 'text-gray-500'}`}>{team.rank}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={team.ownerAvatar} alt={team.ownerUsername} className="w-8 h-8 rounded-full border border-gray-700 bg-gray-900 shrink-0" />
                      <span className="font-bold text-gray-200 group-hover:text-white transition-colors">{team.ownerUsername}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500 tracking-wide">
                    {team.leagueName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {team.badges?.litchAward > 0 && (
                        <div className="flex items-center" title="LITCH Award">
                          <LitchSVG />
                          <span className="text-[10px] font-black text-gray-400 ml-1">{team.badges.litchAward}</span>
                        </div>
                      )}
                      {team.badges?.weeklyTopScorer > 0 && (
                        <div className="flex items-center" title="Weekly Top Scorer">
                          <WeeklyScorerSVG />
                          <span className="text-[10px] font-black text-gray-400 ml-1">{team.badges.weeklyTopScorer}</span>
                        </div>
                      )}
                      {team.badges?.twoHundredClub > 0 && (
                        <div className="flex items-center" title="200+ Point Club">
                          <Club200SVG />
                          <span className="text-[10px] font-black text-gray-400 ml-1">{team.badges.twoHundredClub}</span>
                        </div>
                      )}
                      {(!team.badges || Object.keys(team.badges).length === 0) && (
                        <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-white">{parseFloat(team.totalPoints).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-gray-500">
                    {team.wins !== undefined ? `${team.wins}-${team.losses}` : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}