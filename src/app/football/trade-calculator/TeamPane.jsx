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
  DRAFT_PICKS
}) {
  const [isOpponentDropdownOpen, setIsOpponentDropdownOpen] = useState(false);

  const theme = {
    A: { text: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500', lightBg: 'bg-red-900/20' },
    B: { text: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500', lightBg: 'bg-blue-900/20' },
    C: { text: 'text-green-500', border: 'border-green-500', bg: 'bg-green-500', lightBg: 'bg-green-900/20' }
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
    <div className="flex-1 bg-[#111] border-2 border-gray-800 rounded-3xl p-6 shadow-2xl relative flex flex-col">
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-4 mb-6 border-b border-gray-800 pb-4 shrink-0 min-h-[96px]">
          
          {/* Left Side: Avatar, Name, Strategy */}
          <div className="flex flex-col gap-2 mt-1 w-full xl:w-auto">
              {isMyTeam || !isSynced ? (
                  <div className="flex items-center gap-3">
                      {isSynced && <img src={avatar} className="w-10 h-10 rounded-full border border-gray-600 shrink-0" alt="" />}
                      <span className="text-lg font-black text-white truncate max-w-[200px] leading-none">{teamName}</span>
                  </div>
              ) : (
                  <div className="relative w-full xl:w-[220px]">
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

              {/* 🚀 EXACT Verbiage Fix */}
              {formatMode === 'dynasty' && (
                  <div className="flex flex-col gap-1 w-full mt-2">
                      <select 
                          value={strategy} 
                          onChange={(e) => setStrategy(e.target.value)}
                          className="bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-1.5 px-3 shadow-sm focus:outline-none font-bold text-xs tracking-wide w-full"
                      >
                          <option value="win_now">Win Now Strategy</option>
                          <option value="neutral">Balanced Strategy</option>
                          <option value="build">Rebuild Strategy</option>
                      </select>
                  </div>
              )}
          </div>

          {/* Right Side: Total & Badges */}
          <div className="flex flex-col xl:items-end text-left xl:text-right w-full xl:w-auto mt-1">
              <span className={`text-4xl sm:text-5xl font-black ${theme.text} leading-none`}>{receivedTotal || 0}</span>
              <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sent: {sentTotal || 0}</span>
                  <span className="text-gray-700">|</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${net > 0 ? 'text-green-500' : net < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      Net: {net > 0 ? '+' : ''}{net || 0}
                  </span>
              </div>
              <div className="flex flex-col items-start xl:items-end mt-1 gap-1">
                  {premium > 0 && <span className="text-[9px] text-amber-500 font-bold uppercase">Includes Premium (+{premium})</span>}
                  {hasPenalty && <span className="text-[9px] text-red-400 font-bold uppercase">Package Tax Applied</span>}
              </div>
          </div>
      </div>

      {/* Manual Search Bar (If No League Synced) */}
      {!isSynced && (
          <div className="relative mb-6">
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

      {/* Expanding Roster List */}
      <div className="flex-1 space-y-2">
          {isSynced && !isMyTeam && !managerId ? (
              <div className="text-center py-20 text-gray-600 text-xs font-bold uppercase tracking-widest">Select an opponent to view roster</div>
          ) : (
              <>
                {/* 1. Render Actual Synced Roster */}
                {isSynced && activeRoster.map(p => {
                   // 🚀 FIX: Match securely by name to prevent lockups!
                   const isSelected = sentAssets.some(traded => traded.name === p.name);
                   const sentAsset = sentAssets.find(traded => traded.name === p.name);
                   
                   return (
                     <div 
                        key={p.uniqueId} 
                        onClick={() => {
                          if (isSelected) removeAssetByName(p.name);
                          else onPlayerClick(p, teamId);
                        }}
                        className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? `${theme.border} ${theme.lightBg}` : 'border-transparent bg-[#1a1a1a] hover:border-gray-600'}`}
                      >
                         <div className="flex items-center gap-3">
                             {isSelected ? (
                                <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center text-white shrink-0`}><Check size={16} /></div>
                             ) : (
                                p.team && p.team !== 'fa' ? (
                                    <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-8 h-8 object-contain opacity-70 shrink-0" onError={(e) => e.target.style.display = 'none'} />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0"></div>
                                )
                             )}
                             <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-gray-300'}`}>{p.name}</span>
                                  {isSelected && teamsCount === 3 && (
                                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-900 ${theme.text}`}>To {sentAsset.toTeam}</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} {formatMode === 'dynasty' && p.age ? `• ${p.age} y/o` : ''}</span>
                             </div>
                         </div>
                         <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>{p.calcValue}</span>
                     </div>
                   );
                })}

                {/* 2. Render Players/Picks that this team is RECEIVING (for Manual Mode) */}
                {!isSynced && receivedAssets?.map(p => (
                   <div 
                      key={p.uniqueId} 
                      onClick={() => removeAssetByName(p.name)}
                      className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${theme.border} ${theme.lightBg}`}
                    >
                       <div className="flex items-center gap-3">
                           <div className={`w-6 h-6 rounded-full ${theme.bg} flex items-center justify-center text-white`}><Check size={14} /></div>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{p.name}</span>
                              {teamsCount === 3 && <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-900 text-gray-400`}>From {p.fromTeam}</span>}
                           </div>
                       </div>
                       <span className="text-sm font-black text-white">{p.calcValue}</span>
                   </div>
                ))}

                {/* Render Picks this team is sending (for Synced Mode) */}
                {isSynced && sentAssets.filter(p => p.position === 'PICK').map(p => (
                   <div 
                      key={p.uniqueId} 
                      onClick={() => removeAssetByName(p.name)}
                      className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${theme.border} ${theme.lightBg}`}
                    >
                       <div className="flex items-center gap-3">
                           <div className={`w-6 h-6 rounded-full ${theme.bg} flex items-center justify-center text-white`}><Check size={14} /></div>
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{p.name}</span>
                              {teamsCount === 3 && <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-900 ${theme.text}`}>To {p.toTeam}</span>}
                           </div>
                       </div>
                       <span className="text-sm font-black text-white">{p.calcValue}</span>
                   </div>
                ))}

                {/* Fallback for completely empty pane */}
                {((isSynced && activeRoster.length === 0 && sentAssets.length === 0) || (!isSynced && receivedAssets?.length === 0)) && (
                  <div className="text-center py-10 text-gray-600 text-xs font-bold uppercase tracking-widest">No assets added</div>
                )}
              </>
          )}
      </div>

      {/* Manual Picks Dropdown at Bottom */}
      <div className="mt-6 pt-4 border-t border-gray-800 shrink-0">
          <select 
              onChange={(e) => onPickSelect(e.target.value, teamId, isSynced)}
              disabled={isSynced && !isMyTeam && !managerId}
              value=""
              className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-400 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
              <option value="">+ Add Draft Pick to Trade</option>
              <optgroup label="2026 Picks">
                  {DRAFT_PICKS.filter(p => p.year === 2026).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </optgroup>
              <optgroup label="2027 Picks">
                  {DRAFT_PICKS.filter(p => p.year === 2027).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </optgroup>
          </select>
      </div>

    </div>
  );
}