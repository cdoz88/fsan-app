'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // 🚀 Import Session

const LeagueContext = createContext();

export function LeagueProvider({ children }) {
  const { data: session, status } = useSession(); // 🚀 Hook into Auth

  const [allLeagues, setAllLeagues] = useState([]);
  const [activeLeagues, setActiveLeagues] = useState({
    football: null,
    basketball: null,
    baseball: null,
  });
  
  const [sleeperUserId, setSleeperUserId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasAttemptedCloudSync, setHasAttemptedCloudSync] = useState(false);

  // --- Boot Up: Load preferences from Local Storage ---
  useEffect(() => {
    const savedLeagues = localStorage.getItem('fsan_all_leagues');
    const savedActive = localStorage.getItem('fsan_active_leagues');
    const savedSleeperId = localStorage.getItem('fsan_sleeper_user_id'); 
    
    if (savedLeagues) setAllLeagues(JSON.parse(savedLeagues));
    if (savedActive) setActiveLeagues(JSON.parse(savedActive));
    if (savedSleeperId) setSleeperUserId(savedSleeperId); 
  }, []);

  // --- 🚀 NEW: CLOUD SYNC WATCHER ---
  // If the user logs in on a new device, pull their cloud Sleeper ID and auto-sync!
  useEffect(() => {
      if (status === 'authenticated' && session?.user?.sleeperId && !hasAttemptedCloudSync) {
          setHasAttemptedCloudSync(true);

          // If they don't have the ID locally, or their leagues are empty, run the sync!
          if (!sleeperUserId || allLeagues.length === 0) {
              syncSleeperAccount(session.user.sleeperId, true); // true = skip saving to cloud again
          }
      }
  }, [status, session, sleeperUserId, allLeagues.length, hasAttemptedCloudSync]);

  // --- The Sleeper Sync Engine ---
  const syncSleeperAccount = async (identifier, isBackgroundSync = false) => {
    setIsSyncing(true);
    try {
      const userRes = await fetch(`https://api.sleeper.app/v1/user/${identifier}`);
      const userData = await userRes.json();
      if (!userData?.user_id) throw new Error("Sleeper user not found.");

      setSleeperUserId(userData.user_id);
      localStorage.setItem('fsan_sleeper_user_id', userData.user_id);

      // 🚀 FIXED: Pointing to the new save-sleeper-id route!
      if (!isBackgroundSync && status === 'authenticated') {
          fetch('/api/user/save-sleeper-id', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sleeperId: userData.user_id })
          }).catch(err => console.error("Cloud save failed", err));
      }

      const leaguesRes = await fetch(`https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/2026`);
      const leaguesData = await leaguesRes.json();

      const formattedLeagues = leaguesData.map(league => ({
        id: league.league_id,
        name: league.name,
        sport: 'football',
        platform: 'sleeper',
        avatar: league.avatar,
        totalTeams: league.total_rosters,
        rosterPositions: league.roster_positions,
        scoringSettings: league.scoring_settings
      }));

      setAllLeagues(prev => {
         const nonSleeper = prev.filter(p => p.platform !== 'sleeper');
         const updated = [...nonSleeper, ...formattedLeagues];
         localStorage.setItem('fsan_all_leagues', JSON.stringify(updated));
         return updated;
      });

      return { success: true, count: formattedLeagues.length };
    } catch (error) {
      console.error("Failed to sync Sleeper:", error);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  };

  const removeLeague = (leagueId) => {
    setAllLeagues(prev => {
      const updated = prev.filter(l => l.id !== leagueId);
      localStorage.setItem('fsan_all_leagues', JSON.stringify(updated));
      return updated;
    });

    setActiveLeagues(prev => {
      let updatedActive = { ...prev };
      let changed = false;
      Object.keys(updatedActive).forEach(sport => {
        if (updatedActive[sport] === leagueId) {
          updatedActive[sport] = null;
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('fsan_active_leagues', JSON.stringify(updatedActive));
        return updatedActive;
      }
      return prev;
    });
  };

  const setActiveLeague = (sport, leagueId) => {
    setActiveLeagues(prev => {
      const updated = { ...prev, [sport]: leagueId };
      localStorage.setItem('fsan_active_leagues', JSON.stringify(updated));
      return updated;
    });
  };

  const getActiveLeagueData = (sport) => {
    const activeId = activeLeagues[sport];
    if (!activeId) return null;
    return allLeagues.find(l => l.id === activeId) || null;
  };

  return (
    <LeagueContext.Provider value={{
      allLeagues,
      activeLeagues,
      isSyncing,
      sleeperUserId, 
      syncSleeperAccount,
      removeLeague, 
      setActiveLeague,
      getActiveLeagueData
    }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  return useContext(LeagueContext);
}