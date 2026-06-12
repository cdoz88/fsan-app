'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the Context
const LeagueContext = createContext();

export function LeagueProvider({ children }) {
  // 1. Holds every league synced across all platforms (Sleeper, Yahoo, etc.)
  const [allLeagues, setAllLeagues] = useState([]);
  
  // 2. Remembers the exact active league for EACH sport
  const [activeLeagues, setActiveLeagues] = useState({
    football: null,
    basketball: null,
    baseball: null,
  });
  
  const [isSyncing, setIsSyncing] = useState(false);

  // --- Boot Up: Load preferences from Local Storage ---
  useEffect(() => {
    const savedLeagues = localStorage.getItem('fsan_all_leagues');
    const savedActive = localStorage.getItem('fsan_active_leagues');
    
    if (savedLeagues) setAllLeagues(JSON.parse(savedLeagues));
    if (savedActive) setActiveLeagues(JSON.parse(savedActive));
  }, []);

  // --- The Sleeper Sync Engine ---
  const syncSleeperAccount = async (username) => {
    setIsSyncing(true);
    try {
      // 1. Convert username to Sleeper User ID
      const userRes = await fetch(`https://api.sleeper.app/v1/user/${username}`);
      const userData = await userRes.json();
      if (!userData?.user_id) throw new Error("Sleeper user not found.");

      // 2. Fetch all NFL leagues for the 2026 season
      const leaguesRes = await fetch(`https://api.sleeper.app/v1/user/${userData.user_id}/leagues/nfl/2026`);
      const leaguesData = await leaguesRes.json();

      // 3. Format the data perfectly for our app's central brain
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

      // 4. Merge into our state (replacing any old Sleeper leagues, but keeping Yahoo/ESPN intact)
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

  // --- 🚀 NEW: Remove a Single League ---
  const removeLeague = (leagueId) => {
    setAllLeagues(prev => {
      const updated = prev.filter(l => l.id !== leagueId);
      localStorage.setItem('fsan_all_leagues', JSON.stringify(updated));
      return updated;
    });

    // If the removed league was currently active, clear it out of the active context
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

  // --- Change Active League (Triggered by the Header Dropdown) ---
  const setActiveLeague = (sport, leagueId) => {
    setActiveLeagues(prev => {
      const updated = { ...prev, [sport]: leagueId };
      localStorage.setItem('fsan_active_leagues', JSON.stringify(updated));
      return updated;
    });
  };

  // --- Helper to get the full data object of the current active league ---
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
      syncSleeperAccount,
      removeLeague, // 🚀 NEW: Exported the remove function
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