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
  removeAssetByName,
  DRAFT_PICKS,
  getPlayerValue
}) {
  const [isOpponentDropdownOpen, setIsOpponentDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('players'); 

  const theme = {
    A: { text: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500', lightBg: 'bg-red-900/20', badge: 'bg-red-600' },
    B: { text: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500', lightBg: 'bg-blue-900/20', badge: 'bg-blue-600' },
    C: { text: 'text-green-500', border: 'border-green-500', bg: 'bg-green-500', lightBg: 'bg-green-900/20', badge: 'bg-green-600' }
  }[teamId];

  const dotColors = {
    A: 'bg-red-500',
    B: 'bg-blue-500',
    C: 'bg-green-500'
  };

  const { receivedTotal, sentTotal, net, premium, hasPenalty, sentAssets, receivedAssets } = evaluation;

  const userObj = leagueUsers?.find(u => u.user_id === managerId);
  const teamName = isMyTeam 
    ? (userObj?.metadata?.team_name || userObj?.display_name || 'My Team')
    : (userObj?.metadata?.team_name || userObj?.display_name || `Team ${teamId}`);
  const avatar = userObj?.avatar 
    ? `https://sleepercdn.com/avatars/thumbs/${userObj.avatar}` 
    : 'https://placehold.co/40x40/383838/ffffff?text=?';

  const rosterPlayers = activeRoster?.filter(p => p.position !== 'PICK') || [];
  const rosterPicks = activeRoster?.filter(p => p.position === 'PICK') || [];

  const genericPickYears = [...new Set(DRAFT_PICKS.map(p => p.year))].sort((a,b) => a - b);

  return (
    <div className="flex-1 w-full bg-[#111] border sm:border-2 border-gray-800 rounded-xl sm:rounded-3xl p-1.5 sm:p-6 shadow-2xl relative flex flex-col min-h-[500px] sm:min-h-[600px] overflow-hidden min-w-0">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-1.5 sm:gap-4 mb-2 sm:mb-4 border-b border-gray-800 pb-2 sm:pb-4 shrink-0 min-h-[48px] sm:min-h-[64px]">
          <div className="flex-1 w-full min-w-0">
              {isMyTeam || !isSynced ? (
                  <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 h-8 sm:h-10">
                      {isSynced && <img src={avatar} className="w-5 h-5 sm:w-8 sm:h-8 rounded-full border border-gray-600 shrink-0" alt="" />}
                      <span className="text-sm sm:text-lg font-black text-white truncate leading-none">{teamName}</span>
                  </div>
              ) : (
                  <div className="relative w-full">
                    <button 
                      onClick={() => setIsOpponentDropdownOpen(!isOpponentDropdownOpen)}
                      className={`flex items-center gap-1.5 sm:gap-3 bg-[#1a1a1a] border border-gray-700 hover:${theme.border} text-white rounded-lg sm:rounded-xl px-2 sm:px-3 shadow-sm focus:outline-none transition-all w-full text-left min-w-0 h-8 sm:h-10`}
                    >
                      {userObj ? (
                        <>
                          <img src={avatar} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-600 shrink-0" alt="" />
                          <span className="text-[11px] sm:text-sm font-bold truncate flex-1 min-w-0">{teamName}</span>
                        </>
                      ) : (
                        <span className="text-[11px] sm:text-sm font-bold text-gray-400 flex-1 truncate">Select Team...</span>
                      )}
                      <ChevronsUpDown size={12} className="text-gray-500 shrink-0" />
                    </button>

                    {isOpponentDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-[90]" onClick={() => setIsOpponentDropdownOpen(false)}></div>
                        <div className="absolute top-full left-0 mt-1 sm:mt-2 w-full min-w-[200px] sm:min-w-[240px] bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl z-[100] max-h-64 overflow-y-auto custom-scroll py-2">
                          {leagueUsers.filter(u => u.user_id !== sleeperUserId).map(u => {
                            const name = u.metadata?.team_name || u.display_name;
                            const img = u.avatar ? `https://sleepercdn.com/avatars/thumbs/${u.avatar}` : 'https://placehold.co/40x40/383838/ffffff?text=?';
                            return (
                              <button 
                                key={u.user_id}
                                onClick={() => { onManagerChange(u.user_id, teamId); setIsOpponentDropdownOpen(false); }}
                                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-[#252525] transition-colors text-left"
                              >
                                <img src={img} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-600 shrink-0" alt="" />
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-[10px] sm:text-sm font-bold text-white truncate">{name}</span>
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
              <div className="flex-shrink-0 w-full xl:w-auto mt-1.5 sm:mt-0">
                  <select 
                      value={strategy} 
                      onChange={(e) => setStrategy(e.target.value)}
                      className="bg-[#1a1a1a] border border-gray-700 text-white rounded-lg sm:rounded-xl px-2 sm:px-3 shadow-sm focus:outline-none font-bold text-[10px] sm:text-xs tracking-wide w-full cursor-pointer hover:border-gray-500 transition-colors h-8 sm:h-10"
                  >
                      <option value="win_now">Win Now Strategy</option>
                      <option value="neutral">Balanced Strategy</option>
                      <option value="build">Rebuild Strategy</option>
                  </select>
              </div>
          )}
      </div>

      {/* "RECEIVING BUCKET" */}
      <div className="bg-[#161616] border border-gray-700/60 rounded-xl sm:rounded-2xl p-2 sm:p-4 mb-3 sm:mb-6 shadow-inner min-h-[90px] sm:min-h-[110px] flex flex-col transition-all">
          
          {/* 🚀 FIXED: Stacked the large score on top of the Premium/Tax text so they each get 100% width! */}
          <div className="flex flex-col w-full mb-1">
              <div className="w-full text-right mb-1 sm:mb-2">
                  <span className={`text-3xl sm:text-4xl lg:text-5xl font-black ${theme.text} leading-none`}>{receivedTotal || 0}</span>
              </div>
              {(premium > 0 || hasPenalty) && (
                  <div className="flex flex-col items-start gap-0.5 sm:gap-1 w-full pb-0.5 sm:pb-1">
                      {premium > 0 && <span className="text-[7px] sm:text-[9px] text-amber-500 font-bold uppercase tracking-widest leading-tight whitespace-normal">Incl. Prem (+{premium})</span>}
                      {hasPenalty && <span className="text-[7px] sm:text-[9px] text-red-400 font-bold uppercase tracking-widest leading-tight whitespace-normal">Tax Applied</span>}
                  </div>
              )}
          </div>

          <div className="flex justify-between items-end mt-1 mb-2 sm:mb-3 border-b border-gray-800/60 pb-1.5 sm:pb-2 gap-1 sm:gap-0 min-w-0">
              <h4 className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest truncate mb-0.5 sm:mb-0">
                  Receiving
              </h4>
              <div className="flex flex-col items-end shrink-0 leading-tight">
                  <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Sent: {sentTotal || 0}</span>
                  <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-widest ${net > 0 ? 'text-green-500' : net < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      Net: {net > 0 ? '+' : ''}{net || 0}
                  </span>
              </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2 flex-1">
              {receivedAssets?.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-600 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest py-2 sm:py-3 border border-dashed border-gray-700/50 rounded-lg sm:rounded-xl">
                      Empty
                  </div>
              ) : (
                  receivedAssets.map(p => (
                      <div key={p.uniqueId} className="flex justify-between items-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-[#222] border border-gray-700 shadow-sm group">
                          <div className="flex items-center gap-1.5 sm:gap-3 w-full min-w-0">
                              <button onClick={() => removeAssetByName(p.name)} className="text-gray-600 hover:text-white transition-colors shrink-0">
                                  <X size={14} className="sm:w-4 sm:h-4" />
                              </button>
                              <div className="flex flex-col min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                                      <span className="text-[11px] sm:text-sm font-black text-white truncate">{p.name}</span>
                                      {teamsCount === 3 && (
                                          <div className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${dotColors[p.fromTeam]} shadow-sm shrink-0`} title={`From Team ${p.fromTeam}`} />
                                      )}
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                                      <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">
                                        {p.position} {formatMode === 'dynasty' && p.age && p.position !== 'PICK' ? `• ${p.age} y/o` : ''}
                                      </span>
                                      <span className={`text-[10px] font-black ${theme.text} block sm:hidden`}>
                                        {p.calcValue} PTS
                                      </span>
                                  </div>
                              </div>
                          </div>
                          <span className={`text-sm font-black ${theme.text} hidden sm:block shrink-0 pl-2`}>{p.calcValue}</span>
                      </div>
                  ))
              )}
          </div>
      </div>

      {/* TOGGLE HEADER FOR ROSTER / PICKS */}
      <div className="flex justify-between items-center mb-2 sm:mb-3 gap-1">
          <h4 className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">
              {viewMode === 'players' ? 'Roster' : 'Draft Picks'}
          </h4>
          
          {formatMode === 'dynasty' && (
              <div className="flex bg-[#161616] border border-gray-800 rounded-md sm:rounded-lg p-0.5 shadow-inner shrink-0">
                  <button 
                      onClick={() => setViewMode('players')}
                      className={`px-2 sm:px-3 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded sm:rounded-md transition-all ${viewMode === 'players' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                      Players
                  </button>
                  <button 
                      onClick={() => setViewMode('picks')}
                      className={`px-2 sm:px-3 py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded sm:rounded-md transition-all ${viewMode === 'picks' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                      Picks
                  </button>
              </div>
          )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* TAB 1: PLAYERS VIEW */}
          {viewMode === 'players' && (
              <div className="flex-1 flex flex-col">
                  {!isSynced && (
                      <div className="relative mb-2 sm:mb-4">
                          <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-3">
                              <Search size={14} className="text-gray-500 mr-2 shrink-0 sm:w-[18px] sm:h-[18px]" />
                              <input 
                                  type="text" 
                                  placeholder="Search players..."
                                  className="bg-transparent text-white outline-none w-full text-xs sm:text-sm font-bold placeholder-gray-600"
                                  value={query}
                                  onChange={e => setQuery(e.target.value)}
                              />
                          </div>
                          {query.length > 1 && (
                              <div className="absolute z-50 top-full mt-1 sm:mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-lg sm:rounded-xl shadow-2xl max-h-48 sm:max-h-60 overflow-y-auto custom-scroll">
                                  {playersData.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8).map(p => (
                                      <div key={p.name} className="px-2.5 sm:px-4 py-2 sm:py-3 hover:bg-[#252525] cursor-pointer flex justify-between items-center border-b border-gray-800/50" onClick={() => { onManualAdd(p, teamId); setQuery(''); }}>
                                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                              {p.team && p.team !== 'fa' && (
                                                  <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" onError={(e) => e.target.style.display = 'none'} />
                                              )}
                                              <span className="text-[11px] sm:text-sm font-bold text-white truncate">{p.name}</span>
                                              <span className="text-[8px] sm:text-[10px] font-black bg-gray-800 text-gray-400 px-1 sm:px-2 py-0.5 rounded uppercase shrink-0">{p.position}</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}

                  <div className="flex-1 space-y-1 sm:space-y-2 overflow-y-auto custom-scroll pr-1 pb-2 sm:pb-4">
                      {isSynced && !isMyTeam && !managerId ? (
                          <div className="text-center py-10 text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2">Select a team</div>
                      ) : (
                          isSynced && rosterPlayers.map(p => {
                             const sentAsset = sentAssets.find(traded => traded.name === p.name);
                             const isSelected = !!sentAsset;
                             
                             return (
                               <div 
                                  key={p.uniqueId || p.id} 
                                  onClick={() => {
                                    if (isSelected) removeAssetByName(p.name);
                                    else onPlayerClick(p, teamId);
                                  }}
                                  className={`flex justify-between items-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-gray-700 bg-[#151515] opacity-60' : 'border-transparent bg-[#1a1a1a] hover:border-gray-600'}`}
                                >
                                   <div className="flex items-center gap-1.5 sm:gap-3 w-full min-w-0">
                                       {p.team && p.team !== 'fa' ? (
                                           <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-6 h-6 sm:w-8 sm:h-8 object-contain opacity-80 shrink-0" onError={(e) => e.target.style.display = 'none'} />
                                       ) : (
                                           <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-800 shrink-0"></div>
                                       )}
                                       <div className="flex flex-col min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                                            <span className={`text-[10px] sm:text-sm font-black truncate ${isSelected ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{p.name}</span>
                                            {isSelected && teamsCount === 3 && (
                                                <div className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${dotColors[sentAsset.toTeam]} shadow-sm shrink-0`} title={`Sending to Team ${sentAsset.toTeam}`} />
                                            )}
                                          </div>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                                              <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">{p.position} {formatMode === 'dynasty' && p.age ? `• ${p.age} y/o` : ''}</span>
                                              <span className="text-[9px] font-black text-gray-400 block sm:hidden">{p.calcValue} PTS</span>
                                          </div>
                                       </div>
                                   </div>
                                   <span className="text-sm font-black text-gray-500 hidden sm:block shrink-0 pl-2">{p.calcValue}</span>
                               </div>
                             );
                          })
                      )}

                      {isSynced && rosterPlayers.length === 0 && managerId && (
                        <div className="text-center py-10 text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Roster is empty</div>
                      )}
                  </div>
              </div>
          )}

          {/* TAB 2: PICKS VIEW */}
          {viewMode === 'picks' && (
              <div className="flex-1 space-y-1 sm:space-y-2 overflow-y-auto custom-scroll pr-1 pb-2 sm:pb-4">
                 
                 {isSynced ? (
                     rosterPicks.length === 0 && managerId ? (
                        <div className="text-center py-10 text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2">No draft picks found</div>
                     ) : (
                         rosterPicks.map(p => {
                            const sentAsset = sentAssets.find(traded => traded.name === p.name);
                            const isSelected = !!sentAsset;

                            return (
                                <div 
                                    key={p.uniqueId} 
                                    onClick={() => {
                                        if (isSelected) removeAssetByName(p.name);
                                        else onPlayerClick(p, teamId);
                                    }}
                                    className={`flex justify-between items-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-gray-700 bg-[#151515] opacity-60' : 'border-transparent bg-[#1a1a1a] hover:border-gray-600'}`}
                                >
                                    <div className="flex items-center gap-1.5 sm:gap-3 w-full min-w-0">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-600 flex items-center justify-center text-[8px] sm:text-xs font-black text-white shadow-md shrink-0">{p.year.toString().slice(-2)}</div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                                                <span className={`text-[10px] sm:text-sm font-black truncate ${isSelected ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{p.name}</span>
                                                {isSelected && teamsCount === 3 && (
                                                    <div className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${dotColors[sentAsset.toTeam]} shadow-sm shrink-0`} title={`Sending to Team ${sentAsset.toTeam}`} />
                                                )}
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                                                <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">PICK</span>
                                                <span className="text-[9px] font-black text-gray-400 block sm:hidden">{p.calcValue} PTS</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-gray-500 hidden sm:block shrink-0 pl-2">{p.calcValue}</span>
                                </div>
                            );
                         })
                     )
                 ) : (
                     <div className="flex flex-col gap-3 sm:gap-4">
                         {genericPickYears.map(year => (
                             <div key={year} className="flex flex-col gap-1 sm:gap-2">
                                 <h5 className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 sm:px-2">{year} Picks</h5>
                                 {DRAFT_PICKS.filter(p => p.year === year).map(pick => {
                                     const sentAsset = receivedAssets.find(a => a.name === pick.name); 
                                     const isSelected = !!sentAsset;
                                     return (
                                         <div 
                                             key={pick.id} 
                                             onClick={() => {
                                                 if (isSelected) removeAssetByName(pick.name);
                                                 else onManualAdd(pick, teamId);
                                             }} 
                                             className={`flex justify-between items-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-gray-700 bg-[#151515] opacity-60' : 'border-transparent bg-[#1a1a1a] hover:border-gray-600'}`}
                                         >
                                             <div className="flex items-center gap-1.5 sm:gap-3 w-full min-w-0">
                                                 <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-600 flex items-center justify-center text-[8px] sm:text-xs font-black text-white shadow-md shrink-0">{pick.year.toString().slice(-2)}</div>
                                                 <div className="flex flex-col min-w-0 flex-1">
                                                     <span className={`text-[10px] sm:text-sm font-black truncate ${isSelected ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{pick.name}</span>
                                                     <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                                                         <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">PICK</span>
                                                         <span className="text-[9px] font-black text-gray-400 block sm:hidden">{getPlayerValue(pick, strategy)} PTS</span>
                                                     </div>
                                                 </div>
                                             </div>
                                             <span className="text-sm font-black text-gray-500 hidden sm:block shrink-0 pl-2">{getPlayerValue(pick, strategy)}</span>
                                         </div>
                                     )
                                 })}
                             </div>
                         ))}
                     </div>
                 )}
              </div>
          )}
      </div>
    </div>
  );
}