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
  totalReceived,
  premium,
  bestAssetSide,
  hasPenalty,
  isOneForOne,
  query,
  setQuery,
  playersData,
  activeRoster,
  receivedPlayers,
  sentPlayers,
  togglePlayerInTrade,
  addPlayer,
  removePlayer,
  handlePickSelect,
  getPlayerValue,
  DRAFT_PICKS,
  myTeamName,
  myAvatar,
  selectedUser
}) {
  const [isOpponentDropdownOpen, setIsOpponentDropdownOpen] = useState(false);

  const isTeamA = teamId === 'A';
  const textColor = isTeamA ? 'text-red-500' : 'text-blue-500';
  const highlightBorder = isTeamA ? 'border-red-500' : 'border-blue-500';
  const highlightBgTrans = isTeamA ? 'bg-red-900/20' : 'bg-blue-900/20';
  const solidBg = isTeamA ? 'bg-red-500' : 'bg-blue-500';
  const solidBgTrans = isTeamA ? 'bg-red-500/20' : 'bg-blue-500/20';

  if (isSynced) {
    return (
      <div className="flex-1 bg-[#111] border-2 border-gray-800 rounded-3xl p-6 shadow-2xl relative flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 border-b border-gray-800 pb-4 shrink-0 min-h-[96px]">
            <div className="flex flex-col gap-2 mt-1 w-full sm:w-auto">
                {isMyTeam ? (
                    <div className="flex items-center gap-3">
                        <img src={myAvatar} className="w-10 h-10 rounded-full border border-gray-600 shrink-0" alt="" />
                        <span className="text-lg font-black text-white truncate max-w-[200px] leading-none">{myTeamName}</span>
                    </div>
                ) : (
                    <div className="relative w-full sm:w-[220px]">
                      <button 
                        onClick={() => setIsOpponentDropdownOpen(!isOpponentDropdownOpen)}
                        className="flex items-center gap-3 bg-[#1a1a1a] border border-gray-700 hover:border-blue-500 text-white rounded-xl py-2 px-3 shadow-sm focus:outline-none transition-all w-full text-left"
                      >
                        {selectedUser ? (
                          <>
                            <img 
                              src={selectedUser.avatar ? `https://sleepercdn.com/avatars/thumbs/${selectedUser.avatar}` : 'https://placehold.co/40x40/383838/ffffff?text=?'} 
                              className="w-6 h-6 rounded-full border border-gray-600 shrink-0" 
                              alt="" 
                            />
                            <span className="text-sm font-bold truncate flex-1">
                              {selectedUser.metadata?.team_name || selectedUser.display_name}
                            </span>
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
                              const teamName = u.metadata?.team_name || u.display_name;
                              const avatar = u.avatar ? `https://sleepercdn.com/avatars/thumbs/${u.avatar}` : 'https://placehold.co/40x40/383838/ffffff?text=?';
                              return (
                                <button 
                                  key={u.user_id}
                                  onClick={() => { onManagerChange(u.user_id, teamId); setIsOpponentDropdownOpen(false); }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#252525] transition-colors text-left"
                                >
                                  <img src={avatar} className="w-8 h-8 rounded-full border border-gray-600 shrink-0" alt="" />
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-bold text-white truncate">{teamName}</span>
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

                {formatMode === 'dynasty' && (
                    <div className="flex flex-col gap-1 w-full mt-2">
                        <select 
                            value={strategy} 
                            onChange={(e) => setStrategy(e.target.value)}
                            className="bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-1.5 px-3 shadow-sm focus:outline-none font-bold text-xs tracking-wide w-full"
                        >
                            <option value="win_now">🏆 {isMyTeam ? 'My' : 'His'} Goal: Win Now</option>
                            <option value="neutral">⚖️ {isMyTeam ? 'My' : 'His'} Goal: Balanced</option>
                            <option value="build">🌱 {isMyTeam ? 'My' : 'His'} Goal: Rebuild</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:items-end text-left sm:text-right w-full sm:w-auto mt-1">
                <span className={`text-4xl sm:text-5xl font-black ${textColor} leading-none`}>{totalReceived}</span>
                <div className="flex flex-col items-start sm:items-end mt-2 gap-1">
                    {bestAssetSide === teamId && !isOneForOne && <span className="text-[9px] text-amber-500 font-bold uppercase">Includes Premium (+{premium})</span>}
                    {hasPenalty && <span className="text-[9px] text-red-400 font-bold uppercase">Package Tax Applied</span>}
                </div>
            </div>
        </div>

        <div className="flex-1 space-y-2">
            {!isMyTeam && !managerId ? (
                <div className="text-center py-20 text-gray-600 text-xs font-bold uppercase tracking-widest">Select an opponent to view roster</div>
            ) : (
                <>
                  {activeRoster.map(p => {
                     const isSelected = sentPlayers.some(traded => traded.name === p.name);
                     return (
                       <div 
                          key={p.id} 
                          onClick={() => togglePlayerInTrade(p, teamId)}
                          className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${isSelected ? `${highlightBorder} ${highlightBgTrans}` : 'border-transparent bg-[#1a1a1a] hover:border-gray-600'}`}
                        >
                           <div className="flex items-center gap-3">
                               {isSelected ? (
                                  <div className={`w-8 h-8 rounded-full ${solidBg} flex items-center justify-center text-white shrink-0`}><Check size={16} /></div>
                               ) : (
                                  p.team && p.team !== 'fa' ? (
                                      <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-8 h-8 object-contain opacity-70 shrink-0" onError={(e) => e.target.style.display = 'none'} />
                                  ) : (
                                      <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0"></div>
                                  )
                               )}
                               <div className="flex flex-col">
                                  <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-gray-300'}`}>{p.name}</span>
                                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} {formatMode === 'dynasty' && p.age ? `• ${p.age} y/o` : ''}</span>
                               </div>
                           </div>
                           <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-gray-400'}`}>{p.calcValue}</span>
                       </div>
                     );
                  })}

                  {sentPlayers.filter(p => p.position === 'PICK').map(p => (
                     <div 
                        key={p.uniqueId} 
                        onClick={() => removePlayer(p.uniqueId, isTeamA ? 'B' : 'A')}
                        className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${highlightBorder} ${solidBgTrans}`}
                      >
                         <div className="flex items-center gap-3">
                             <div className={`w-6 h-6 rounded-full ${solidBg} flex items-center justify-center text-white`}><Check size={14} /></div>
                             <span className="text-sm font-black text-white">{p.name}</span>
                         </div>
                         <span className="text-sm font-black text-white">{getPlayerValue(p, strategy)}</span>
                     </div>
                  ))}
                  
                  {activeRoster.length === 0 && <div className="text-center py-10 text-gray-600 text-xs font-bold uppercase tracking-widest">Roster not found</div>}
                </>
            )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 shrink-0">
            <select 
                onChange={(e) => handlePickSelect(e, teamId)}
                disabled={!isMyTeam && !managerId}
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

  // --- MANUAL FALLBACK VIEW ---
  return (
    <div className="flex-1 bg-[#111] border-2 border-gray-800 rounded-3xl p-6 shadow-2xl relative flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 border-b border-gray-800 pb-4 min-h-[96px]">
            <div className="flex flex-col gap-2 mt-1 w-full sm:w-auto">
                <h3 className="text-lg font-black text-white uppercase tracking-wider leading-none mt-2">Team {teamId}</h3>

                {formatMode === 'dynasty' && (
                    <div className="flex flex-col gap-1 w-full mt-2">
                        <select 
                            value={strategy} 
                            onChange={(e) => setStrategy(e.target.value)}
                            className="bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-1.5 px-3 shadow-sm focus:outline-none font-bold text-xs tracking-wide w-full"
                        >
                            <option value="win_now">🏆 Win Now Strategy</option>
                            <option value="neutral">⚖️ Balanced Strategy</option>
                            <option value="build">🌱 Rebuild Strategy</option>
                        </select>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col sm:items-end text-left sm:text-right w-full sm:w-auto mt-1">
                <span className={`text-4xl sm:text-5xl font-black ${textColor} leading-none`}>{totalReceived}</span>
                <div className="flex flex-col items-start sm:items-end mt-2 gap-1">
                    {bestAssetSide === teamId && !isOneForOne && <span className="text-[9px] text-amber-500 font-bold uppercase">Includes Premium (+{premium})</span>}
                    {hasPenalty && <span className="text-[9px] text-red-400 font-bold uppercase">Package Tax Applied</span>}
                </div>
            </div>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-3 mb-6">
            <div className="relative flex-1">
                <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3">
                    <Search size={18} className="text-gray-500 mr-3 shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Search players..."
                        className="bg-transparent text-white outline-none w-full text-sm font-bold placeholder-gray-600"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                {query.length > 1 && (
                    <div className="absolute z-50 top-full mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scroll">
                        {playersData.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8).map(p => (
                            <div key={p.name} className="px-4 py-3 hover:bg-[#252525] cursor-pointer flex justify-between items-center border-b border-gray-800/50" onClick={() => { addPlayer(p, teamId); setQuery(''); }}>
                                <div className="flex items-center gap-3">
                                    {p.team && p.team !== 'fa' && (
                                        <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-5 h-5 object-contain" onError={(e) => e.target.style.display = 'none'} />
                                    )}
                                    <span className="text-sm font-bold text-white">{p.name}</span>
                                    <span className="text-[10px] font-black bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">{p.position}</span>
                                </div>
                                <span className="text-xs font-black text-gray-400">{getPlayerValue(p, strategy)} pts</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="space-y-3 min-h-[150px] flex-1">
            {receivedPlayers.length === 0 ? (
                <div className="text-center py-10 text-gray-600 font-bold text-xs uppercase tracking-widest">No assets added</div>
            ) : receivedPlayers.map(p => (
                <div key={p.uniqueId} className={`flex justify-between items-center bg-[#1a1a1a] border border-gray-800 p-4 rounded-2xl group transition-all hover:border-${isTeamA ? 'red' : 'blue'}-500/50`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => removePlayer(p.uniqueId, teamId)} className={`text-gray-600 hover:${textColor} transition-colors`}>
                            <X size={18} />
                        </button>
                        <div className="flex items-center gap-3">
                            {p.position === 'PICK' ? (
                                <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-xs font-black text-white shadow-md">{p.year.toString().slice(-2)}</div>
                            ) : (
                                p.team && p.team !== 'fa' && <img src={`https://a.espncdn.com/i/teamlogos/nfl/500/${p.team.toLowerCase()}.png`} alt={p.team} className="w-8 h-8 object-contain drop-shadow-md" onError={(e) => e.target.style.display = 'none'} />
                            )}
                            <div>
                                <div className="text-sm font-black text-white">{p.name}</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position} {formatMode === 'dynasty' && p.age ? `• ${p.age} y/o` : ''}</div>
                            </div>
                        </div>
                    </div>
                    <div className="text-lg font-black text-white">{getPlayerValue(p, strategy)}</div>
                </div>
            ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-800 shrink-0">
            <select 
                onChange={(e) => handlePickSelect(e, teamId)}
                className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-400 rounded-xl px-4 py-3 text-sm font-bold outline-none hover:text-white transition-colors cursor-pointer"
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