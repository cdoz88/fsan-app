import React from 'react';
import { Ticket, Link2, Edit3, CheckCircle2, Loader2, X } from 'lucide-react';

export default function DashboardHero({
  session,
  ticketCount,
  setShowPurchaseModal,
  syncedSleeperUser,
  isEditingSync,
  setIsEditingSync,
  setLivePreviewUser,
  sleeperInput,
  setSleeperInput,
  isSearching,
  syncError,
  livePreviewUser,
  handleConfirmSync,
  isSaving
}) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-6">
        Welcome to Your Dashboard, <span className="text-[#1b75bb]">{session?.user?.name || 'Manager'}</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Ticket Balance Card */}
        <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 md:p-8 flex items-center justify-between shadow-lg relative overflow-hidden min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1b75bb] opacity-5 blur-[50px] rounded-full pointer-events-none"></div>
          <div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Available Draft Tickets</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-white leading-none">{ticketCount}</span>
              <span className="text-gray-500 font-medium mb-1">Tickets</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 relative z-10">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center shadow-inner">
              <Ticket className="w-6 h-6 md:w-8 md:h-8 text-[#f5a623]" />
            </div>
            <button 
              onClick={() => setShowPurchaseModal(true)}
              className="relative group p-[2px] rounded-xl bg-gradient-to-r from-[#f5a623] to-[#c30b16] shadow-[0_0_15px_rgba(245,166,35,0.2)] transition-transform hover:-translate-y-0.5"
            >
              <div className="bg-[#151515] group-hover:bg-transparent transition-colors rounded-[10px] px-4 py-2 flex items-center justify-center text-white font-black uppercase tracking-widest text-[10px] md:text-xs whitespace-nowrap">
                Buy More Tickets
              </div>
            </button>
          </div>
        </div>

        {/* Connect Sleeper Account Card */}
        <div className="bg-[#151515] border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden min-h-[160px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[#1b75bb] font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <Link2 size={14} /> Connect Sleeper Account
            </p>
            {syncedSleeperUser && !isEditingSync && (
              <button 
                onClick={() => { setIsEditingSync(true); setLivePreviewUser(null); }}
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Edit3 size={12} /> Change
              </button>
            )}
          </div>

          {syncedSleeperUser && !isEditingSync ? (
            <div className="flex items-center justify-between bg-[#111] border border-gray-800 rounded-2xl p-3.5 mt-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-zinc-900 border-2 border-[#1b75bb] overflow-hidden shrink-0 shadow-md">
                  <img 
                    src={syncedSleeperUser.avatar ? `https://sleepercdn.com/avatars/thumbs/${syncedSleeperUser.avatar}` : 'https://sleepercdn.com/images/v2/icons/player_default.webp'} 
                    alt="" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-black text-sm uppercase tracking-tight truncate">
                    {syncedSleeperUser.displayName || syncedSleeperUser.sleeper_username}
                  </h4>
                  <p className="text-[11px] font-bold text-gray-500 tracking-wider">@{syncedSleeperUser.sleeper_username}</p>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
                <CheckCircle2 size={13} className="text-emerald-400" /> Connected
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              <div className="relative flex items-center gap-2">
                <input 
                  type="text"
                  placeholder="Enter Sleeper Username..."
                  value={sleeperInput}
                  onChange={(e) => setSleeperInput(e.target.value)}
                  className="w-full bg-[#111] border border-gray-800 text-white text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:border-[#1b75bb] transition-colors"
                />
                {isSearching && (
                  <Loader2 size={16} className="absolute right-3 text-gray-400 animate-spin" />
                )}
                {isEditingSync && (
                  <button 
                    onClick={() => setIsEditingSync(false)}
                    className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {syncError && (
                <p className="text-red-400 text-[11px] font-bold uppercase tracking-wider px-1">{syncError}</p>
              )}

              {livePreviewUser && (
                <div className="flex items-center justify-between bg-[#111] border border-[#1b75bb]/50 rounded-xl p-3 mt-1 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-zinc-900 border border-[#1b75bb] overflow-hidden shrink-0">
                      <img 
                        src={livePreviewUser.avatar ? `https://sleepercdn.com/avatars/thumbs/${livePreviewUser.avatar}` : 'https://sleepercdn.com/images/v2/icons/player_default.webp'} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp'; }}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-black text-xs uppercase truncate">{livePreviewUser.displayName}</p>
                      <p className="text-[10px] text-gray-400">@{livePreviewUser.username}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleConfirmSync(livePreviewUser)}
                    disabled={isSaving}
                    className="bg-[#1b75bb] hover:bg-teal-500 text-white font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : 'Sync & Lock'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}