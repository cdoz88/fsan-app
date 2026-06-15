"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link as LinkIcon, CheckCircle2, User, Loader2, AlertTriangle, RefreshCw, X, Trophy } from 'lucide-react';
import { useLeague } from '../../../context/LeagueContext';

export default function SyncedLeaguesTab({ userTier }) {
  const router = useRouter();
  const { allLeagues, syncSleeperAccount, isSyncing, removeLeague } = useLeague();
  const [syncSportTab, setSyncSportTab] = useState('football');

  const [sleeperUsername, setSleeperUsername] = useState('');
  const [isVerifyingSleeper, setIsVerifyingSleeper] = useState(false);
  const [verifiedSleeperUser, setVerifiedSleeperUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ message: '', type: '' });
  
  const sleeperLeaguesCount = allLeagues ? allLeagues.filter(l => l.platform === 'sleeper').length : 0;
  const yahooLeaguesCount = allLeagues ? allLeagues.filter(l => l.platform === 'yahoo').length : 0;

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (sleeperUsername.trim().length >= 3) {
        setIsVerifyingSleeper(true);
        try {
          const res = await fetch(`https://api.sleeper.app/v1/user/${sleeperUsername.trim()}`);
          const data = await res.json();
          if (data?.user_id) {
            setVerifiedSleeperUser(data);
            setSyncStatus({ message: '', type: '' });
          } else {
            setVerifiedSleeperUser(null);
            setSyncStatus({ message: 'User not found.', type: 'error' });
          }
        } catch (err) {
          setVerifiedSleeperUser(null);
          setSyncStatus({ message: 'Error verifying user.', type: 'error' });
        } finally {
          setIsVerifyingSleeper(false);
        }
      } else {
        setVerifiedSleeperUser(null);
        setSyncStatus({ message: '', type: '' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [sleeperUsername]);

  const handleSleeperSync = async (e) => {
    e.preventDefault();
    if (!verifiedSleeperUser) return;
    setSyncStatus({ message: '', type: '' });
    const result = await syncSleeperAccount(verifiedSleeperUser.username);
    if (result.success) {
      setSyncStatus({ message: `Success! Synced ${result.count} leagues.`, type: 'success' });
      setVerifiedSleeperUser(null);
      setSleeperUsername('');
    } else {
      setSyncStatus({ message: result.error || 'Failed to sync account.', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
      <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-2 flex items-center gap-3">
        <LinkIcon className="text-blue-500" size={24} /> Fantasy Sync
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Link your fantasy platforms to enable auto-syncing for rankings, trade calculators, and scoreboards.
      </p>

      <div className="flex gap-2 border-b border-gray-800 mb-6">
        <button onClick={() => setSyncSportTab('football')} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${syncSportTab === 'football' ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Football</button>
        <button onClick={() => setSyncSportTab('basketball')} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${syncSportTab === 'basketball' ? 'border-orange-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Basketball</button>
        <button onClick={() => setSyncSportTab('baseball')} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${syncSportTab === 'baseball' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Baseball</button>
      </div>

      <div className="space-y-6 relative z-10">
        {syncSportTab === 'football' ? (
          <>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <img src="https://admin.fsan.com/wp-content/uploads/2026/06/Sleeper-App-Icon.webp" alt="Sleeper" className="w-10 h-10 rounded-lg shadow-inner" />
                  <div>
                    <h4 className="font-bold text-white text-lg">Sleeper</h4>
                    <p className="text-xs text-gray-400">{sleeperLeaguesCount > 0 ? `${sleeperLeaguesCount} leagues synced` : 'Not connected'}</p>
                  </div>
                </div>
                {sleeperLeaguesCount > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 w-fit shadow-sm">
                    <CheckCircle2 size={14} /> Connected
                  </span>
                )}
              </div>

              {userTier === 'pro' || userTier === 'pro-plus' ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input type="text" placeholder="Enter Sleeper Username" value={sleeperUsername} onChange={(e) => setSleeperUsername(e.target.value)} className="w-full bg-[#111] border border-gray-700 text-white rounded-xl px-4 py-3 pl-12 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-inner" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                         {isVerifyingSleeper ? <Loader2 size={18} className="animate-spin text-gray-500" /> : verifiedSleeperUser ? <CheckCircle2 size={18} className="text-green-500" /> : <User size={18} className="text-gray-500" />}
                      </div>
                    </div>
                    {syncStatus.message && !verifiedSleeperUser && sleeperUsername.length > 2 && (
                      <p className={`text-xs font-bold flex items-center gap-1 pl-1 ${syncStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {syncStatus.type === 'success' ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>} {syncStatus.message}
                      </p>
                    )}
                  </div>

                  {verifiedSleeperUser && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#111] p-4 rounded-xl border border-gray-700 shadow-inner gap-4 mt-2">
                      <div className="flex items-center gap-4">
                        {verifiedSleeperUser.avatar ? (
                          <img src={`https://sleepercdn.com/avatars/thumbs/${verifiedSleeperUser.avatar}`} className="w-10 h-10 rounded-full border border-gray-600 shadow-sm" alt="User Avatar" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center shrink-0"><User size={18} className="text-gray-400" /></div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-white">{verifiedSleeperUser.username}</div>
                          <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10}/> Verified User</div>
                        </div>
                      </div>
                      <button onClick={handleSleeperSync} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-lg transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 justify-center">
                        {isSyncing ? <><RefreshCw size={14} className="animate-spin" /> Syncing...</> : 'Sync Leagues'}
                      </button>
                    </div>
                  )}

                  {sleeperLeaguesCount > 0 && (
                    <div className="mt-6 border-t border-gray-800 pt-6">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pl-1 flex items-center justify-between">
                        <span>Synced Sleeper Leagues</span>
                        <span className="bg-gray-800 text-white px-2 py-0.5 rounded-md">{sleeperLeaguesCount}</span>
                      </h5>
                      <div className="space-y-3">
                        {allLeagues.filter(l => l.platform === 'sleeper').map(league => (
                          <div key={league.id} className="flex items-center justify-between bg-[#111] border border-gray-800 p-3.5 rounded-xl hover:border-gray-700 transition-colors group">
                             <div className="flex items-center gap-4">
                                {league.avatar ? (
                                  <img src={`https://sleepercdn.com/avatars/thumbs/${league.avatar}`} className="w-9 h-9 rounded-full border border-gray-700 shadow-sm" alt="League" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 shrink-0">
                                    <span className="text-xs font-bold text-white">{league.name.substring(0,2).toUpperCase()}</span>
                                  </div>
                                )}
                                <div className="flex flex-col">
                                   <span className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs">{league.name}</span>
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{league.totalTeams} Teams</span>
                                </div>
                             </div>
                             <button onClick={() => removeLeague(league.id)} title="Remove League" className="text-gray-500 hover:text-red-500 hover:bg-red-900/20 p-2 rounded-lg transition-all border border-transparent hover:border-red-900/50">
                                <X size={16} />
                             </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Pro subscription required to sync leagues.</span>
                  <button onClick={() => router.push('/subscribe')} className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wider">Upgrade Now</button>
                </div>
              )}
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 md:p-6 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#410099] flex items-center justify-center font-black text-white text-xl shadow-inner">Y!</div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Yahoo Fantasy</h4>
                    <p className="text-xs text-gray-400">{yahooLeaguesCount > 0 ? `${yahooLeaguesCount} leagues synced` : 'Not connected'}</p>
                  </div>
                </div>
                {yahooLeaguesCount > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 w-fit shadow-sm">
                    <CheckCircle2 size={14} /> Connected
                  </span>
                )}
              </div>
              {userTier === 'pro' || userTier === 'pro-plus' ? (
                <div className="flex flex-col gap-4">
                  <a href="/api/yahoo/auth/url" className="bg-[#410099] hover:bg-[#32007a] text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 max-w-[250px] justify-center">
                     Connect Yahoo Account
                  </a>
                </div>
              ) : (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Pro subscription required to sync leagues.</span>
                  <button onClick={() => router.push('/subscribe')} className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wider">Upgrade Now</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
               <Trophy size={24} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Coming Soon</h3>
            <p className="text-sm text-gray-400 max-w-md">We are currently building out our automated integration tools for {syncSportTab}. Check back soon to sync your leagues!</p>
          </div>
        )}
      </div>
    </div>
  );
}