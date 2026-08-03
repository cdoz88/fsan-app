"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MonitorSmartphone, MapPin, SlidersHorizontal, Ticket, Loader2, Coins, ExternalLink, Calendar, Clock, ChevronDown, AlertCircle, Hourglass, Eye, Trophy, UserPlus } from 'lucide-react';

const CustomDropdown = ({ value, options, onChange, minWidth = "sm:w-40" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative shrink-0 w-full ${minWidth} z-20`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-[#1a1a1a] px-4 py-2.5 rounded-lg border border-gray-700 text-xs font-bold text-gray-300 cursor-pointer hover:border-[#1b75bb] transition-colors"
      >
        <span>{selectedOption ? selectedOption.label : ''}</span>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-2 w-full bg-[#151515] border border-gray-700 rounded-lg shadow-xl z-40 overflow-hidden">
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-4 py-3 text-xs font-bold cursor-pointer transition-colors ${value === opt.value ? 'bg-[#1b75bb]/20 text-[#1b75bb]' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function DraftsTab({
  draftView, setDraftView, isProPlus, ticketsAvailable, handlePurchaseExtraEntry, errorMessage, loadingLeagues, leagues, sortedLeagues, recentlyJoinedLeagues, setConfirmingLeague, setShowRaffleModal
}) {
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [mySleeperLeagueIds, setMySleeperLeagueIds] = useState(new Set());

  // Fetch connected Sleeper user's leagues automatically on load
  useEffect(() => {
    const fetchUserSleeperLeagues = async () => {
      let sleeperIdentifier = null;

      if (session?.user?.id) {
        const cached = localStorage.getItem(`dno_dedicated_sleeper_${session.user.id}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            sleeperIdentifier = parsed.sleeper_id || parsed.sleeper_username;
          } catch (e) { console.warn(e); }
        }
      }

      if (!sleeperIdentifier && session?.user?.sleeperId) {
        sleeperIdentifier = session.user.sleeperId;
      }

      if (!sleeperIdentifier) return;

      try {
        let userId = sleeperIdentifier;
        if (isNaN(userId)) {
          const uRes = await fetch(`https://api.sleeper.app/v1/user/${sleeperIdentifier}`);
          if (uRes.ok) {
            const uData = await uRes.json();
            userId = uData.user_id;
          }
        }

        if (!userId) return;

        const res = await fetch(`https://api.sleeper.app/v1/user/${userId}/leagues/nfl/2026`);
        if (res.ok) {
          const userLeagues = await res.json();
          const leagueIdSet = new Set(userLeagues.map(l => String(l.league_id)));
          setMySleeperLeagueIds(leagueIdSet);
        }
      } catch (err) {
        console.warn("Could not fetch user's Sleeper leagues for DraftsTab:", err);
      }
    };

    fetchUserSleeperLeagues();
  }, [session]);

  const filteredLeagues = sortedLeagues.filter(league => {
    const openSpots = Math.max(0, league.total_spots - league.filled_spots);
    const isFull = openSpots === 0;

    if (statusFilter === 'open' && isFull) return false;
    if (statusFilter === 'filled' && !isFull) return false;
    if (styleFilter !== 'all' && league.draft_style !== styleFilter) return false;

    return true;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-16">
      <div className="flex justify-center mb-8">
         <div className="bg-[#111] p-1.5 rounded-2xl border border-gray-800 flex shadow-inner w-full sm:w-auto">
            <button onClick={() => setDraftView('online')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-2.5 rounded-xl text-[11px] sm:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${draftView === 'online' ? 'bg-[#1b75bb] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
               <MonitorSmartphone size={16} /> Online Divisions
            </button>
            <button onClick={() => setDraftView('live')} className={`flex-1 sm:flex-none justify-center px-4 sm:px-6 py-2.5 rounded-xl text-[11px] sm:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${draftView === 'live' ? 'bg-[#1b75bb] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
               <MapPin size={16} /> Live Events
            </button>
         </div>
      </div>

      {draftView === 'online' && (
        <div className="animate-in fade-in duration-300">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 bg-[#111] p-3 rounded-xl border border-gray-800 shadow-inner">
              <div className="flex items-center gap-2 shrink-0 ml-1">
                <SlidersHorizontal size={16} className="text-[#f5a623]" />
                <span className="text-xs font-black uppercase tracking-widest mr-2 text-white">Filters</span>
              </div>
              
              <CustomDropdown 
                value={statusFilter}
                onChange={setStatusFilter}
                minWidth="sm:w-40"
                options={[
                  { label: 'Status: All', value: 'all' },
                  { label: 'Status: Open', value: 'open' },
                  { label: 'Status: Filled', value: 'filled' }
                ]}
              />

              <CustomDropdown 
                value={styleFilter}
                onChange={setStyleFilter}
                minWidth="sm:w-44"
                options={[
                  { label: 'Style: All', value: 'all' },
                  { label: 'Style: Live / Fast', value: 'fast' },
                  { label: 'Style: Slow Draft', value: 'slow' }
                ]}
              />

              {/* Link to Locker Room's My Leagues tab */}
              <Link 
                href="/dno/dashboard?tab=my-leagues"
                className="px-5 py-2.5 rounded-lg border text-xs font-bold shrink-0 transition-colors w-full sm:w-auto bg-[#1a1a1a] border-gray-700 text-gray-300 hover:border-[#1b75bb] hover:text-white flex items-center justify-center gap-2"
              >
                <Trophy size={14} className="text-[#1b75bb]" /> My Leagues
              </Link>
          </div>

          {/* Ticket Balance & Registration Banner */}
          {isProPlus ? (
            <div className="mb-8 p-[2px] rounded-2xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(27,117,187,0.15)] relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between bg-[#151515] p-5 px-6 rounded-[14px] gap-4 w-full h-full">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1b75bb]/20 flex items-center justify-center shrink-0 border border-[#1b75bb]/30"><Ticket size={20} className="text-[#1b75bb]" /></div>
                  <h3 className="text-white text-lg md:text-xl font-black uppercase tracking-wide italic text-center sm:text-left">
                    You have <span className="text-[#f5a623]">{ticketsAvailable}</span> online draft ticket{ticketsAvailable !== 1 ? 's' : ''} available
                  </h3>
                </div>
                <button onClick={handlePurchaseExtraEntry} className="shrink-0 w-full sm:w-auto bg-teal-600 hover:bg-teal-500 transition-colors text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5">
                  <Ticket size={16} /> Buy More Tickets
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#1b75bb]/20 via-[#151515] to-[#f5a623]/20 border border-[#1b75bb]/40 rounded-3xl p-6 md:p-8 mb-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] text-[10px] font-black uppercase tracking-widest mb-3">
                  ✨ Included Free With Every Entry ($18 Value)
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
                  Ready to Join a Division?
                </h3>
                <p className="text-gray-300 text-xs md:text-sm max-w-xl leading-relaxed">
                  Register or log in to secure your DNO draft spot. Every ticket comes with <strong className="text-white">1 Free Month of FSAN Pro+ ($7.99 value)</strong> and the <strong className="text-white">Rookie Draft Guide ($9.99 value)</strong>!
                </p>
              </div>
              <button 
                onClick={handlePurchaseExtraEntry}
                className="relative z-10 shrink-0 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-teal-400 to-[#1b75bb] hover:from-teal-300 hover:to-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(27,117,187,0.4)] transition-transform hover:-translate-y-0.5"
              >
                Get Started & Claim Perks
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-wider shadow-md relative z-10">
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          <div className="relative w-full min-h-[300px] z-0">
            {loadingLeagues ? (
              <div className="w-full flex flex-col items-center justify-center py-20 text-gray-500 gap-3"><Loader2 size={32} className="animate-spin text-[#1b75bb]" /><span className="text-xs font-bold uppercase tracking-widest">Querying Sleeper API Matrix...</span></div>
            ) : leagues.length === 0 ? (
              <div className="w-full bg-[#151515] rounded-2xl p-12 text-center border border-gray-800 text-gray-500 text-sm font-bold uppercase tracking-widest">No active divisions found in database. Check back soon!</div>
            ) : filteredLeagues.length === 0 ? (
              <div className="w-full bg-[#151515] rounded-2xl p-12 text-center border border-gray-800 text-gray-500 text-sm font-bold uppercase tracking-widest">No leagues match your current filters.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-0">
                {filteredLeagues.map((league) => {
                  const openSpots = Math.max(0, league.total_spots - league.filled_spots);
                  const isFull = openSpots === 0;
                  const hasNoEntriesLeft = ticketsAvailable === 0;
                  
                  // Safely check if the user is already in this specific league
                  const safeJoined = recentlyJoinedLeagues ? recentlyJoinedLeagues.map(String) : [];
                  const isJoined = mySleeperLeagueIds.has(String(league.id)) || 
                                   mySleeperLeagueIds.has(String(league.sleeper_id)) || 
                                   safeJoined.includes(String(league.id)) || 
                                   safeJoined.includes(String(league.sleeper_id));

                  const isSlow = league.draft_style === 'slow';

                  const formattedDate = league.draft_date ? new Date(`${league.draft_date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';
                  
                  let formattedTime = '';
                  if (league.draft_hour && league.draft_hour !== '') {
                      formattedTime = `${league.draft_hour}:${league.draft_minute || '00'} ${league.draft_ampm || 'PM'} ET`;
                  } else if (league.draft_time) {
                      formattedTime = league.draft_time; 
                  }

                  const styleLabel = isSlow ? 'Slow Draft' : 'Live / Fast';
                  const styleIcon = isSlow ? '🐢' : '⚡️';

                  let timeDisplay;
                  if (isSlow) {
                    if (isFull) {
                      timeDisplay = (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-950/40 px-2 py-1 rounded border border-red-900/50 shadow-inner animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span>Drafting Live</span>
                        </div>
                      );
                    } else {
                      timeDisplay = (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-[#111] px-2 py-1 rounded border border-gray-800 shadow-inner">
                          <Hourglass size={12} className="text-[#f5a623]" />
                          <span>Starts when filled</span>
                        </div>
                      );
                    }
                  } else {
                    timeDisplay = (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-[#111] px-2 py-1 rounded border border-gray-800 shadow-inner">
                        <Calendar size={12} className="text-[#1b75bb]" />
                        <span>{formattedDate}{formattedTime ? ` @ ${formattedTime}` : ''}</span>
                      </div>
                    );
                  }

                  const targetInviteLink = league.invite_link || league.inviteLink || league.sleeper_invite_link || league.invite;

                  return (
                    <div key={league.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md relative overflow-hidden group">
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-lg font-black text-white uppercase tracking-wide italic mb-2 line-clamp-1">{league.name}</h4>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {timeDisplay}
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-[#111] px-2 py-1 rounded border border-gray-800 shadow-inner">
                            <span className="text-[12px] leading-none">{styleIcon}</span>
                            <span>{styleLabel}</span>
                          </div>
                        </div>

                        <span className={`text-xs font-black uppercase tracking-wider ${isFull && !isJoined ? 'text-gray-500' : 'text-green-500'}`}>{league.filled_spots} / {league.total_spots} Teams Filled</span>
                      </div>
                      <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                        {isJoined ? (
                          <a href={targetInviteLink || `https://sleeper.com/leagues/${league.id}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-6 bg-transparent hover:bg-gray-800 text-green-500 font-black uppercase tracking-widest text-xs py-3 rounded-xl border border-green-900/50 transition-colors flex items-center justify-center gap-2"><ExternalLink size={14} /> Go to League</a>
                        ) : (isFull && isSlow && league.draft_id) ? (
                          <a href={`https://sleeper.com/draft/nfl/${league.draft_id}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-6 bg-transparent hover:bg-gray-800 text-red-500 font-black uppercase tracking-widest text-xs py-3 rounded-xl border border-red-900/50 transition-colors flex items-center justify-center gap-2">
                            <Eye size={14} /> Watch Draft
                          </a>
                        ) : isFull ? (
                          <button disabled className="w-full sm:w-auto px-6 bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-xs py-3 rounded-xl border border-gray-700 cursor-not-allowed">League Full</button>
                        ) : hasNoEntriesLeft && isProPlus ? (
                          <button onClick={handlePurchaseExtraEntry} className="w-full sm:w-auto relative group p-[2px] rounded-xl bg-gradient-to-r from-teal-400 to-[#1b75bb] shadow-lg transition-transform hover:-translate-y-0.5"><div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-6 py-3 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs"><Coins size={14} className="text-teal-400" /> Buy Ticket</div></button>
                        ) : (
                          <button onClick={() => setConfirmingLeague(league)} className="w-full sm:w-auto relative group p-[2px] rounded-xl bg-gradient-to-r from-teal-400 to-[#1b75bb] shadow-md transition-transform hover:-translate-y-0.5"><div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-6 py-3 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs">Join Division</div></button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {draftView === 'live' && (
        <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 p-6 flex flex-col relative overflow-hidden group shadow-lg opacity-80">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              
              {/* Event Concluded Badge */}
              <div className="absolute top-4 right-4 bg-gray-800/80 border border-gray-600 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm z-20">
                Event Concluded
              </div>

              <div className="flex items-center gap-4 w-full mb-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 shadow-lg"><MapPin className="text-gray-400" size={28} /></div>
                <div><h3 className="text-2xl font-black text-gray-300 uppercase tracking-wide leading-tight italic">Canton, OH</h3><p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Fantasy Football Expo</p></div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-6 relative z-10">This live drafting event has successfully concluded! Thank you to everyone who joined us in Canton. The divisions drafted here are now competing for the Overall Season Championship.</p>
              
              <div className="bg-[#111] rounded-2xl border border-gray-800 p-4 mb-6 grid grid-cols-2 gap-4 relative z-10 opacity-70">
                  <div><div className="flex items-center gap-2 mb-1"><Calendar size={14} className="text-gray-600"/><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</span></div><p className="text-xs text-gray-400 line-through">July 25, 2026</p></div>
                  <div><div className="flex items-center gap-2 mb-1"><Clock size={14} className="text-gray-600"/><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time</span></div><p className="text-xs text-gray-400 line-through">12pm - 4pm ET</p></div>
                  <div className="col-span-2 border-t border-gray-800 pt-3 mt-1"><div className="flex items-center gap-2 mb-1"><MapPin size={14} className="text-gray-600"/><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Where</span></div><p className="text-[11px] text-gray-400 leading-snug">Jerzee's Sports Grille<br/>5260 Dressler Rd NW, Canton, OH 44718</p></div>
              </div>
              
              <div className="mt-auto relative z-10 flex flex-col gap-3">
                <button disabled className="w-full inline-block relative p-[2px] rounded-xl bg-gray-800 cursor-not-allowed">
                  <div className="bg-[#1a1a1a] rounded-[10px] px-6 py-3.5 flex items-center justify-center gap-2 w-full h-full text-gray-500 font-black uppercase tracking-widest text-xs">Registration Closed</div>
                </button>
                <button onClick={() => setShowRaffleModal(true)} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] bg-[#111] hover:bg-[#1a1a1a] text-gray-400 hover:text-gray-300 text-xs font-black uppercase tracking-widest border border-gray-700 transition-all">
                  <Ticket size={16} className="text-gray-500" /> View Raffle Winners
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-900/30 border border-gray-800/50 rounded-xl p-4 flex items-start gap-3">
            <Ticket size={20} className="text-gray-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Live Event Note</h5>
              <p className="text-sm text-gray-500 leading-relaxed">These are private events featuring exclusive raffles and giveaways! Keep an eye out for our next live drafting location announcement.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}