import React, { useState } from 'react';
import { Search, X, Check, ChevronsUpDown } from 'lucide-react';

export default function TeamPane({
  isSynced,
  teamId,
  isMyTeam,
  formatMode,
  leagueUsers,
  sleeperUserId,
  managerId,
  onManagerChange,
  strategy,
  setStrategy,
  evaluation,
  query,
  setQuery,
  playersData,
  activeRoster,
  teamsCount,
  onPlayerClick,
  onManualAdd,
  onPickSelect,
  removeAssetByName,
  DRAFT_PICKS,
  getPlayerValue
}) {
  const [isOpponentDropdownOpen, setIsOpponentDropdownOpen] = useState(false);
  
  // 🚀 NEW: State to toggle between Players and Picks
  const [viewMode, setViewMode] = useState('players'); 

  const theme = {
    A: { text: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500', lightBg: 'bg-red-900/20', badge: 'bg-red-600' },
    B: { text: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500', lightBg: 'bg-blue-900/20', badge: 'bg-blue-600' },
    C: { text: 'text-green-500', border: 'border-green-500', bg: 'bg-green-500', lightBg: 'bg-green-900/20', badge: 'bg-green-600' }
  }[teamId];

  const { receivedTotal, sentTotal, net, premium, hasPenalty, sentAssets, receivedAssets } = evaluation;

  // Get Avatar and Team Name for Display
  const userObj = leagueUsers?.find(u => u.user_id === managerId);
  const teamName = isMyTeam 
    ? (userObj?.metadata?.team_name || userObj?.display_name || 'My Team')
    : (userObj?.metadata?.team_name || userObj?.display_name || `Team ${teamId}`);
  const avatar = userObj?.avatar 
    ? `https://sleepercdn.com/avatars/thumbs/${userObj.avatar}` 
    : 'https://placehold.co/40x40/383838/ffffff?text=?';

  return (
    <div className="flex-1 bg-[#111] border-2 border-gray-800 rounded-3xl p-6 shadow-2xl relative flex flex-col min-h-[600px]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-row justify-between items-center gap-4 mb-4 border-b border-gray-800 pb-4 shrink-0 min-h-[64px]">
          <div className="flex-1">
              {isMyTeam || !isSynced ? (
                  <div className="flex items-center gap-3">
                      {isSynced && <img src={avatar} className="w-10 h-10 rounded-full border border-gray-600 shrink-0" alt="" />}
                      <span className="text-lg font-black text-white truncate max-w-[180px] sm:max-w-[220px] leading-none">{teamName}</span>
                  </div>
              ) : (
                  <div className="relative w-full max-w-[220px]">
                    <button 
                      onClick={() => setIsOpponentDropdownOpen(!isOpponentDropdownOpen)}
                      className={`flex items-center gap-3 bg-[#1a1a1a] border border-gray-700 hover:${theme.border} text-white rounded-xl py-2 px-3 shadow-sm focus:outline-none transition-all w-full text-left`}
                    >
                      {userObj ? (
                        <>
                          <img src={avatar} className="w-6 h-6 rounded-full border border-gray-600 shrink-0" alt="" />
                          <span className="text-sm font-bold truncate flex-1">{teamName}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-gray-400 flex-1">Select Opponent...</span>
                      )}
                      <ChevronsUpDown size={14} className="text-gray-500 shrink-0" />
                    </button>

                    {isOpponentDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-[90]" onClick={() => setIsOpponentDropdownOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl z-[100] max-h-64 overflow-y-auto custom-scroll py-2">
                          {leagueUsers.filter(u => u.user_id !== sleeperUserId).map(u => {
                            const name = u.metadata?.team_name || u.display_name;
                            const img = u.avatar ? `https://sleepercdn.com/avatars/thumbs/${u.avatar}` : 'https://placehold.co/40x40/383838/ffffff?text=?';
                            return (
                              <button 
                                key={u.user_id}
                                onClick={() => { onManagerChange(u.user_id, teamId); setIsOpponentDropdownOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#252525] transition-colors text-left"
                              >
                                <img src={img} className="w-8 h-8 rounded-full border border-gray-600 shrink-0" alt="" />
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-sm font-bold text-white truncate">{name}</span>
                                  {u.metadata?.team_name && <span className="text-[10px] text-gray-500 uppercase truncate">@{u.display_name}</span>}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
              )}
          </div>

          {formatMode === 'dynasty' && (
              <div className="flex-shrink-0">
                  <select 
                      value={strategy} 
                      onChange={(e) => setStrategy(e.target.value)}
                      className="bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-2 px-3 shadow-sm focus:outline-none font-bold text-xs tracking-wide w-full cursor-pointer hover:border-gray-500 transition-colors"
                  >
                      <option value="win_now">Win Now Strategy</option>
                      <option value="neutral">Balanced Strategy</option>
                      <option value="build">Rebuild Strategy</option>
                  </select>
              </div>
          )}
      </div>

      {/* "RECEIVING BUCKET" */}
      <div className="bg-[#161616] border border-gray-700/60 rounded-2xl p-4 mb-6 shadow-inner min-h-[110px] flex flex-col transition-all">
          <div className="flex justify-between items-end mb-1">
              <div className="flex flex-col items-start gap-1 pb-1">
                  {premium > 0 && <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">Includes Premium (+{premium})</span>}
                  {hasPenalty && <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Package Tax Applied</span>}
              </div>
              <span className={`text-4xl sm:text-5xl font-black ${theme.text} leading-none`}>{receivedTotal || 0}</span>
          </div>

          <div className="flex justify-between items-center mt-1 mb-3 border-b border-gray-800/60 pb-2">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Assets Received
              </h4>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sent: {sentTotal || 0}</span>
                  <span className="text-gray-700">|</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${net > 0 ? 'text-green-500' : net < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      Net: {net > 0 ? '+' : ''}{net || 0}
                  </span>
              </div>
          </div>

          <div className="space-y-2 flex-1">
              {receivedAssets?.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-600 text-[10px] font-bold uppercase tracking-widest py-3 border border-dashed border-gray-700/50 rounded-xl">
                      Empty Bucket
                  </div>
              ) : (
                  receivedAssets.map(p => (
                      <div key={p.uniqueId} className="flex justify-between items-center p-3 rounded-xl bg-[#222] border border-gray-700 shadow-sm group">
                          <div className="flex items-center gap-3">
                              <button onClick={() => removeAssetByName(p.name)} className="text-gray-600 hover:text-white transition-colors">
                                  <X size={16} />
                              </button>
                              <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                      <span className="text-sm font-black text-white">{p.name}</span>
                                      {teamsCount === 3 && (
                                          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-black text-gray-400 border border-gray-800">
                                              From {p.fromTeam}
                                          </span>
                                      )}
                                  </div>
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} {formatMode === 'dynasty' && p.age && p.position !== 'PICK' ? `• ${p.age} y/o` : ''}</span>
                              </div>
                          </div>
                          <span className={`text-sm font-black ${theme.text}`}>{p.calcValue}</span>
                      </div>
                  ))
              )}
          </div>
      </div>

      {/* 🚀 TOGGLE HEADER FOR ROSTER / PICKS */}
      <div className="flex justify-between items-center mb-3">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {viewMode === 'players' 
                  ? (isSynced ? 'Roster (Click to Trade Away)' : 'Search Assets to Receive') 
                  : 'Draft Picks'}
          </h4>
          
          {formatMode === 'dynasty' && (
              <div className="flex bg-[#161616] border border-gray-800 rounded-lg p-0.5 shadow-inner">
                  <button 
                      onClick={() => setViewMode('players')}
                      className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md transition-all ${viewMode === 'players' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                      Players
                  </button>
                  <button 
                      onClick={() => setViewMode('picks')}
                      className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md transition-all ${viewMode === 'picks' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                      Picks
                  </button>
              </div>
          )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* 🚀 TAB 1: PLAYERS VIEW */}
          {viewMode === 'players' && (
              <div className="flex-1 flex flex-col">
                  {/* Manual Search Bar */}
                  {!isSynced && (
                      <div className="relative mb-4">
                          <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
                              <Search size={18} className="text-gray-500 mr-3 shrink-0" />
                              <input 
                                  type="text" 
                                  placeholder={`Search players for Team ${teamId} to receive...`}
                                  className="bg-transparent text-white outline-none w-full text-sm font-bold placeholder-gray-600"
                                  value={query}
                                  onChange={e => setQuery(e.target.value)}
                              />
                          </div>
                          {query.length > 1 && (
                              <div className="absolute z-50 top-full mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scroll">
                                  {playersData.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8).map(p => (
                                      <div key={p.name} className="px-4 py-3 hover:bg-[#252525] cursor-pointer flex justify-between items-center border-b border-gray-800/50" onClick={() => { onManualAdd(p, teamId); setQuery(''); }}>
                                          <div className="flex items-center gap-3">
                                              {p.team && p.team !== 'fa' && (
                                                  <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                                              )}
                                              <span className="text-sm font-bold text-white">{p.name}</span>
                                              <span className="text-[10px] font-black bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">{p.position}</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}

                  {/* Synced Roster List */}
                  <div className="flex-1 space-y-2 overflow-y-auto custom-scroll pr-1">
                      {isSynced && !isMyTeam && !managerId ? (
                          <div className="text-center py-20 text-gray-600 text-xs font-bold uppercase tracking-widest">Select an opponent to view roster</div>
                      ) : (
                          isSynced && activeRoster.map(p => {
                             const sentAsset = sentAssets.find(traded => traded.name === p.name);
                             const isSelected = !!sentAsset;
                             
                             return (
                               <div 
                                  key={p.uniqueId || p.id} 
                                  onClick={() => {
                                    if (isSelected) removeAssetByName(p.name);
                                    else onPlayerClick(p, teamId);
                                  }}
                                  className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? `border-gray-700 bg-[#151515] opacity-60` : 'border-transparent bg-[#1a1a1a] hover:border-gray-600'}`}
                                >
                                   <div className="flex items-center gap-3">
                                       {p.team && p.team !== 'fa' ? (
                                           <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-8 h-8 object-contain opacity-80 shrink-0" onError={(e) => e.target.style.display = 'none'} />
                                       ) : (
                                           <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0"></div>
                                       )}
                                       <div className="flex flex-col">
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-black ${isSelected ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{p.name}</span>
                                            {isSelected && (
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${theme.badge} text-white`}>
                                                    Sending to {sentAsset.toTeam}
                                                </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} {formatMode === 'dynasty' && p.age ? `• ${p.age} y/o` : ''}</span>
                                       </div>
                                   </div>
                                   <span className="text-sm font-black text-gray-500">{p.calcValue}</span>
                               </div>
                             );
                          })
                      )}

                      {isSynced && activeRoster.length === 0 && managerId && (
                        <div className="text-center py-10 text-gray-600 text-xs font-bold uppercase tracking-widest">Roster is empty</div>
                      )}
                  </div>
              </div>
          )}

          {/* 🚀 TAB 2: PICKS VIEW */}
          {viewMode === 'picks' && (
              <div className="flex-1 space-y-2 overflow-y-auto custom-scroll pr-1 pb-4">
                 {DRAFT_PICKS.map(pick => (
                    <div 
                        key={pick.id} 
                        onClick={() => {
                            if (isSynced && (!isMyTeam && !managerId)) return; // Disable clicking if opponent not selected
                            onPickSelect(pick.id, teamId, isSynced);
                        }} 
                        className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border border-transparent bg-[#1a1a1a] hover:border-gray-600 ${isSynced && !isMyTeam && !managerId ? 'opacity-50 cursor-not-allowed hover:border-transparent' : ''}`}
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-xs font-black text-white shadow-md">{pick.year.toString().slice(-2)}</div>
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-gray-200">{pick.name}</span>
                             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">PICK</span>
                          </div>
                       </div>
                       <span className="text-sm font-black text-gray-500">{getPlayerValue(pick, strategy)}</span>
                    </div>
                 ))}
              </div>
          )}

      </div>
    </div>
  );
}