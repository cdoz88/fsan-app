import React, { useState } from 'react';
import Link from 'next/link';
import { MonitorSmartphone, MapPin, SlidersHorizontal, Ticket, Lock, Loader2, Coins, ExternalLink, Calendar, Clock, ChevronDown } from 'lucide-react';

export default function DraftsTab({
  draftView, setDraftView, isProPlus, ticketsAvailable, handlePurchaseExtraEntry, errorMessage, loadingLeagues, leagues, sortedLeagues, recentlyJoinedLeagues, setConfirmingLeague, setShowRaffleModal
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [myLeaguesOnly, setMyLeaguesOnly] = useState(false);

  // Apply filters to the sorted leagues array
  const filteredLeagues = sortedLeagues.filter(league => {
    const openSpots = Math.max(0, league.total_spots - league.filled_spots);
    const isFull = openSpots === 0;
    const isJoinedLocal = recentlyJoinedLeagues.includes(league.id);

    if (statusFilter === 'open' && isFull) return false;
    if (statusFilter === 'filled' && !isFull) return false;
    if (styleFilter !== 'all' && league.draft_style !== styleFilter) return false;
    if (myLeaguesOnly && !isJoinedLocal) return false;

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
          
          {/* FUNCTIONAL FILTER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 bg-[#111] p-3 rounded-xl border border-gray-800 shadow-inner overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 shrink-0 ml-1">
                <SlidersHorizontal size={16} className="text-[#f5a623]" />
                <span className="text-xs font-black uppercase tracking-widest mr-2 text-white">Filters</span>
              </div>
              
              {/* STYLED DROPDOWN: STATUS */}
              <div className="relative shrink-0 w-full sm:w-auto">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full sm:w-40 bg-[#1a1a1a] pl-4 pr-10 py-2.5 rounded-lg border border-gray-700 text-xs font-bold text-gray-300 outline-none focus:border-[#1b75bb] transition-colors cursor-pointer"
                >
                  <option value="all">Status: All</option>
                  <option value="open">Status: Open</option>
                  <option value="filled">Status: Filled</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              {/* STYLED DROPDOWN: STYLE */}
              <div className="relative shrink-0 w-full sm:w-auto">
                <select 
                  value={styleFilter} 
                  onChange={(e) => setStyleFilter(e.target.value)}
                  className="appearance-none w-full sm:w-44 bg-[#1a1a1a] pl-4 pr-10 py-2.5 rounded-lg border border-gray-700 text-xs font-bold text-gray-300 outline-none focus:border-[#1b75bb] transition-colors cursor-pointer"
                >
                  <option value="all">Style: All</option>
                  <option value="fast">Style: Live / Fast</option>
                  <option value="slow">Style: Slow Draft</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              <button 
                onClick={() => setMyLeaguesOnly(!myLeaguesOnly)}
                className={`px-5 py-2.5 rounded-lg border text-xs font-bold shrink-0 transition-colors w-full sm:w-auto ${myLeaguesOnly ? 'bg-[#1b75bb]/20 border-[#1b75bb] text-[#1b75bb]' : 'bg-[#1a1a1a] border-gray-700 text-gray-300 hover:border-gray-500'}`}
              >
                My Leagues
              </button>
          </div>

          <div className="mb-8 p-[2px] rounded-2xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(27,117,187,0.15)]">
            <div className="flex flex-col sm:flex-row items-center justify-between bg-[#151515] p-5 px-6 rounded-[14px] gap-4 w-full h-full">
              {isProPlus ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1b75bb]/20 flex items-center justify-center shrink-0 border border-[#1b75bb]/30"><Ticket size={20} className="text-[#1b75bb]" /></div>
                    <h3 className="text-white text-lg md:text-xl font-black uppercase tracking-wide italic text-center sm:text-left">
                      You have <span className="text-[#f5a623]">{ticketsAvailable}</span> online draft ticket{ticketsAvailable !== 1 ? 's' : ''} available
                    </h3>
                  </div>
                  <button onClick={handlePurchaseExtraEntry} className="shrink-0 w-full sm:w-auto bg-teal-600 hover:bg-teal-500 transition-colors text-white text-xs font-black uppercase tracking-widest px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5">
                    <Ticket size={16} /> Buy More Tickets
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700"><Lock size={20} className="text-gray-400" /></div>
                    <h3 className="text-white text-lg md:text-xl font-black uppercase tracking-wide italic text-center sm:text-left">A Pro+ account is required to enter Draft Night Out</h3>
                  </div>
                  <Link href="/subscribe" className="shrink-0 w-full sm:w-auto bg-[#1b75bb] hover:bg-[#155d96] transition-colors text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2">Upgrade</Link>
                </>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-wider shadow-md">
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          <div className="relative w-full min-h-[300px]">
            {!isProPlus && (
                <div className="absolute inset-0 z-20 rounded-2xl bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border border-gray-800 shadow-2xl">
                    <Lock size={40} className="text-[#1b75bb] mb-4" />
                    <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-2">Pro+ Required</h4>
                    <p className="text-sm text-gray-300 mb-6 max-w-[280px] leading-relaxed">Upgrade to Pro+ to browse and claim your live Sleeper roster slots.</p>
                    <Link href="/subscribe" className="relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-lg transition-transform hover:-translate-y-0.5 inline-block">
                      <div className="bg-black group-hover:bg-gray-900 transition-colors rounded-[10px] px-8 py-3.5 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-sm">Upgrade to Pro+</div>
                    </Link>
                </div>
            )}

            {loadingLeagues ? (
              <div className="w-full flex flex-col items-center justify-center py-20 text-gray-500 gap-3"><Loader2 size={32} className="animate-spin text-[#1b75bb]" /><span className="text-xs font-bold uppercase tracking-widest">Querying Sleeper API Matrix...</span></div>
            ) : leagues.length === 0 ? (
              <div className="w-full bg-[#151515] rounded-2xl p-12 text-center border border-gray-800 text-gray-500 text-sm font-bold uppercase tracking-widest">No active divisions found in database. Check back soon!</div>
            ) : filteredLeagues.length === 0 ? (
              <div className="w-full bg-[#151515] rounded-2xl p-12 text-center border border-gray-800 text-gray-500 text-sm font-bold uppercase tracking-widest">No leagues match your current filters.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredLeagues.map((league) => {
                  const openSpots = Math.max(0, league.total_spots - league.filled_spots);
                  const isFull = openSpots === 0;
                  const hasNoEntriesLeft = ticketsAvailable === 0;
                  const isJoinedLocal = recentlyJoinedLeagues.includes(league.id);

                  // Safe Date/Time Formatting with Fallback
                  const formattedDate = league.draft_date ? new Date(`${league.draft_date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';
                  
                  let formattedTime = '';
                  if (league.draft_hour && league.draft_hour !== '') {
                      formattedTime = `${league.draft_hour}:${league.draft_minute || '00'} ${league.draft_ampm || 'PM'} ET`;
                  } else if (league.draft_time) {
                      formattedTime = league.draft_time; 
                  }

                  const styleLabel = league.draft_style === 'slow' ? 'Slow Draft' : 'Live / Fast';
                  const styleIcon = league.draft_style === 'slow' ? '🐢' : '⚡️';

                  return (
                    <div key={league.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md relative overflow-hidden group">
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-lg font-black text-white uppercase tracking-wide italic mb-2 line-clamp-1">{league.name}</h4>
                        
                        {/* Draft Details Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-[#111] px-2 py-1 rounded border border-gray-800 shadow-inner">
                            <Calendar size={12} className="text-[#1b75bb]" />
                            <span>{formattedDate}{formattedTime ? ` @ ${formattedTime}` : ''}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-[#111] px-2 py-1 rounded border border-gray-800 shadow-inner">
                            <span className="text-[12px] leading-none">{styleIcon}</span>
                            <span>{styleLabel}</span>
                          </div>
                        </div>

                        <span className={`text-xs font-black uppercase tracking-wider ${isFull && !isJoinedLocal ? 'text-gray-500' : 'text-green-500'}`}>{league.filled_spots} / {league.total_spots} Teams Filled</span>
                      </div>
                      <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                        {isJoinedLocal ? (
                          <a href="https://sleeper.com" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-6 bg-transparent hover:bg-gray-800 text-green-500 font-black uppercase tracking-widest text-xs py-3 rounded-xl border border-green-900/50 transition-colors flex items-center justify-center gap-2"><ExternalLink size={14} /> Go to League</a>
                        ) : isFull ? (
                          <button disabled className="w-full sm:w-auto px-6 bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-xs py-3 rounded-xl border border-gray-700 cursor-not-allowed">League Full</button>
                        ) : hasNoEntriesLeft ? (
                          <button onClick={handlePurchaseExtraEntry} className="w-full sm:w-auto relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-lg transition-transform hover:-translate-y-0.5"><div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-6 py-3 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs"><Coins size={14} className="text-[#f5a623]" /> Buy Ticket</div></button>
                        ) : (
                          <button onClick={() => setConfirmingLeague(league)} className="w-full sm:w-auto relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-md transition-transform hover:-translate-y-0.5"><div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-6 py-3 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs">Join League</div></button>
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
            <div className="bg-[#1a1a1a] rounded-3xl border border-gray-800 p-6 flex flex-col relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1b75bb]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex items-center gap-4 w-full mb-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1b75bb] to-[#0a4b7d] flex items-center justify-center shrink-0 shadow-lg"><MapPin className="text-white" size={28} /></div>
                <div><h3 className="text-2xl font-black text-white uppercase tracking-wide leading-tight italic">Canton, OH</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Fantasy Football Expo</p></div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-6 relative z-10">Secure your spot to draft in person. You will be able to select your specific division (named after NFL legends) during checkout.</p>
              <div className="bg-[#111] rounded-2xl border border-gray-800 p-4 mb-6 grid grid-cols-2 gap-4 relative z-10">
                  <div><div className="flex items-center gap-2 mb-1"><Calendar size={14} className="text-[#f5a623]"/><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</span></div><p className="text-xs text-gray-200">July 25, 2026</p></div>
                  <div><div className="flex items-center gap-2 mb-1"><Clock size={14} className="text-[#f5a623]"/><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</span></div><p className="text-xs text-gray-200">12pm - 4pm ET</p></div>
                  <div className="col-span-2 border-t border-gray-800 pt-3 mt-1"><div className="flex items-center gap-2 mb-1"><MapPin size={14} className="text-[#f5a623]"/><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Where</span></div><p className="text-[11px] text-gray-400 leading-snug">Jerzee's Sports Grille<br/>5260 Dressler Rd NW, Canton, OH 44718</p></div>
              </div>
              <div className="mt-auto relative z-10 flex flex-col gap-3">
                <a href="https://in-betweenmedia.com/product/draft-night-out-2026-tickets/" target="_blank" rel="noopener noreferrer" className="w-full inline-block relative group p-[2px] rounded-xl bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_20px_rgba(27,117,187,0.2)] transition-transform hover:-translate-y-0.5"><div className="bg-[#1a1a1a] group-hover:bg-[#222] transition-colors rounded-[10px] px-6 py-3.5 flex items-center justify-center gap-2 w-full h-full text-white font-black uppercase tracking-widest text-xs">Get Canton Tickets <ExternalLink size={16} /></div></a>
                <button onClick={() => setShowRaffleModal(true)} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] bg-[#111] hover:bg-[#1a1a1a] text-gray-200 hover:text-white text-xs font-black uppercase tracking-widest border border-[#f5a623]/60 hover:border-[#f5a623] shadow-[0_0_10px_rgba(245,166,35,0.05)] transition-all"><Ticket size={16} className="text-[#1b75bb]" /> View Raffle Prizes & Promos</button>
              </div>
            </div>
          </div>
          <div className="mt-8 bg-[#1b75bb]/10 border border-[#1b75bb]/30 rounded-xl p-4 flex items-start gap-3"><Ticket size={20} className="text-[#f5a623] shrink-0 mt-0.5" /><div><h5 className="text-xs font-black text-[#1b75bb] uppercase tracking-widest mb-1">Live Event Note</h5><p className="text-sm text-gray-400 leading-relaxed">These are private events featuring exclusive raffles and giveaways! All attendees must have a ticket (Draft or "Just To Hang" covers available).</p></div></div>
        </div>
      )}
    </div>
  );
}