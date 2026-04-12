import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { SleeperLeague, SleeperUser, SleeperMatchup, SleeperRoster } from '../types';
import { fetchSleeperUser, fetchSleeperLeagues, fetchSleeperMatchups, fetchSleeperRosters, fetchSleeperUsers, fetchSleeperState } from '../services/sleeperService';

const STORAGE_KEY = 'synced_leagues';

export function useFantasy() {
  const { data: session, status } = useSession();
  const [hasInitialFetched, setHasInitialFetched] = useState(false);

  const [syncedLeagues, setSyncedLeagues] = useState<SleeperLeague[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch from WordPress on initial load if logged in
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && !hasInitialFetched) {
      const fetchFromWP = async () => {
        try {
          const res = await fetch(`/api/scl?action=get_synced_leagues&user_id=${session.user.id}`);
          const json = await res.json();
          
          if (json.success && json.data) {
            const wpLeagues = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
            
            // Merge WP leagues with any existing local leagues (deduplicated by league_id)
            const merged = [...syncedLeagues];
            let addedFromWP = false;

            wpLeagues.forEach((wpLg: SleeperLeague) => {
              if (!merged.some(l => l.league_id === wpLg.league_id)) {
                merged.push(wpLg);
                addedFromWP = true;
              }
            });
            
            if (addedFromWP) {
              setSyncedLeagues(merged);
            }

            // If we had local leagues that WP didn't know about, push the combined list back to WP
            if (merged.length > wpLeagues.length) {
               saveToWP(merged, session.user.id, (session.user as any).token);
            }
          }
        } catch (e) {
          console.error('Failed to fetch synced leagues from WP:', e);
        } finally {
          setHasInitialFetched(true);
        }
      };
      fetchFromWP();
    } else if (status === 'unauthenticated') {
      setHasInitialFetched(true);
    }
  }, [status, session, hasInitialFetched, syncedLeagues]);

  // 2. Save to LocalStorage AND WordPress whenever syncedLeagues changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(syncedLeagues));
    }
    
    // Only push to WP if we've already done our initial fetch to avoid overwriting the DB with an empty array
    if (hasInitialFetched && session?.user?.id) {
       saveToWP(syncedLeagues, session.user.id, (session.user as any).token);
    }
  }, [syncedLeagues, hasInitialFetched, session]);

  const saveToWP = async (leagues: SleeperLeague[], userId: string, token?: string) => {
    try {
      const formData = new FormData();
      formData.append('action', 'save_synced_leagues');
      formData.append('user_id', userId);
      formData.append('leagues_data', JSON.stringify(leagues));

      await fetch('/api/scl', {
        method: 'POST',
        body: formData,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.error('Failed to save leagues to WP:', e);
    }
  };

  const syncLeague = async (username: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await fetchSleeperUser(username);
      if (!user) throw new Error('User not found');
      
      const state = await fetchSleeperState();
      const season = state?.season_type === 'off' || state?.season_type === 'pre' ? state.previous_season : (state?.season || '2024');

      const leagues = await fetchSleeperLeagues(user.user_id, season);
      if (leagues.length === 0) throw new Error('No leagues found');
      
      // For simplicity, we sync all leagues for the user
      const newLeagues = leagues.filter(
        (l: SleeperLeague) => !syncedLeagues.some(sl => sl.league_id === l.league_id)
      ).map((l: SleeperLeague) => ({ ...l, synced_user_id: user.user_id, platform: 'Sleeper' }));
      
      // Also update any existing leagues that might be missing the synced_user_id
      const updatedExistingLeagues = syncedLeagues.map(sl => {
        if (!sl.synced_user_id && leagues.some((l: SleeperLeague) => l.league_id === sl.league_id)) {
          return { ...sl, synced_user_id: user.user_id, platform: 'Sleeper' };
        }
        return sl;
      });
      
      setSyncedLeagues([...updatedExistingLeagues, ...newLeagues]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addYahooLeague = (yahooLeague: any) => {
    const newLeague: any = {
      league_id: yahooLeague.league_key,
      name: yahooLeague.name,
      sport: 'nfl',
      season: yahooLeague.season,
      status: 'active',
      total_rosters: yahooLeague.num_teams,
      avatar: yahooLeague.logo_url,
      synced_user_id: 'yahoo_user', // We don't have the exact user ID right now
      platform: 'Yahoo'
    };

    if (!syncedLeagues.some(sl => sl.league_id === newLeague.league_id)) {
      setSyncedLeagues(prev => [...prev, newLeague]);
    }
  };

  const removeLeague = (leagueId: string) => {
    setSyncedLeagues(prev => prev.filter(l => l.league_id !== leagueId));
  };

  return {
    syncedLeagues,
    syncLeague,
    addYahooLeague,
    removeLeague,
    isLoading,
    error
  };
}