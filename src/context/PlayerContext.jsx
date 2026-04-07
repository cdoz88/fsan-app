"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [consensusRanking, setConsensusRanking] = useState([]);
  const [currentPosition, setCurrentPosition] = useState('QB');
  const [currentWeek, setCurrentWeek] = useState('Offseason');
  const [loading, setLoading] = useState(true);

  // Fetch data directly from WordPress via the Next.js Proxy
  const fetchData = async (position, week) => {
    setLoading(true);
    try {
      // 1. Fetch Raw Players (just to know who exists)
      const playersRes = await fetch(`/api/rankings?action=nfl_get_players&position=${position}&week=${week}`);
      const playersJson = await playersRes.json();
      
      if (playersJson.success) {
        setPlayers(playersJson.data);
      }

      // 2. Fetch the actual Consensus Data from WordPress
      const consensusRes = await fetch(`/api/rankings?action=nfl_get_consensus&position=${position}&week=${week}`);
      const consensusJson = await consensusRes.json();

      if (consensusJson.success && consensusJson.data) {
         // The WP plugin returns an array of raw ranking submissions. 
         // We need to parse them just like nfl-ranking-frontend.js does.
         setRankings(consensusJson.data);
         calculateConsensusFromWP(consensusJson.data, playersJson.data || []);
      } else {
         setConsensusRanking([]);
         setRankings([]);
      }

    } catch (error) {
      console.error("Error fetching ranking data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch when position or week changes
  useEffect(() => {
    fetchData(currentPosition, currentWeek);
  }, [currentPosition, currentWeek]);


  // This mimics exactly what your WP frontend JS was doing to calculate the consensus
  const calculateConsensusFromWP = (allRankings, basePlayers) => {
    if (allRankings.length === 0 || basePlayers.length === 0) {
        setConsensusRanking([]);
        return;
    }

    const totalRankers = allRankings.length;
    const playerMasterList = new Map();
    basePlayers.forEach(p => playerMasterList.set(`${p.name.toLowerCase()}-${p.team}`, p));

    const itemStats = {};
    basePlayers.forEach(player => {
        const key = `player-${player.id}`;
        itemStats[key] = { 
            ...player, 
            type: 'player', 
            positionSum: 0, 
            rankSum: 0, 
            minRank: Infinity, 
            maxRank: -Infinity, 
            timesRanked: 0 
        };
    });

    allRankings.forEach(ranking => {
        try {
            const rankingData = JSON.parse(ranking.ranking_data);
            if (!Array.isArray(rankingData)) return;

            const stopTierIndex = rankingData.findIndex(item => item.id === 'stop-tier');
            const rankedSlice = stopTierIndex === -1 ? rankingData : rankingData.slice(0, stopTierIndex);
            
            const rankedPlayerCount = rankedSlice.filter(item => item.type === 'player').length;
            const penaltyRank = rankedPlayerCount + 1;
            const penaltyPosition = rankingData.length + 1;

            const rankedPlayerKeys = new Set();
            let playerRankCounter = 1;

            rankedSlice.forEach((item, index) => {
                if(item.type === 'player') {
                    const masterPlayer = playerMasterList.get(`${item.name.toLowerCase()}-${item.team}`);
                    if(masterPlayer) {
                        const statsKey = `player-${masterPlayer.id}`;
                        itemStats[statsKey].positionSum += (index + 1);
                        itemStats[statsKey].rankSum += playerRankCounter;
                        itemStats[statsKey].minRank = Math.min(itemStats[statsKey].minRank, playerRankCounter);
                        itemStats[statsKey].maxRank = Math.max(itemStats[statsKey].maxRank, playerRankCounter);
                        itemStats[statsKey].timesRanked++;
                        rankedPlayerKeys.add(statsKey);
                        playerRankCounter++;
                    }
                }
            });

            // Apply penalties for unranked players
            Object.keys(itemStats).forEach(key => {
                const item = itemStats[key];
                if(item.type === 'player' && !rankedPlayerKeys.has(key)) {
                    item.rankSum += penaltyRank;
                    item.positionSum += penaltyPosition;
                    item.minRank = Math.min(item.minRank, penaltyRank);
                    item.maxRank = Math.max(item.maxRank, penaltyRank);
                }
            });
        } catch(e) { 
            console.error("Error parsing ranking row:", e); 
        }
    });

    const consensusItems = Object.values(itemStats)
        .filter(item => item.type === 'player' && item.timesRanked > 0)
        .map(item => {
            return {
                ...item,
                averageScore: item.rankSum / totalRankers, // We map averageRank to averageScore so the UI doesn't break
                averageRank: item.rankSum / totalRankers,
                rankCount: item.timesRanked
            };
        })
        .sort((a, b) => a.averageRank - b.averageRank); // Sort lowest score to top

    setConsensusRanking(consensusItems);
  };


  // Keep these dummy functions so your UI doesn't crash if it tries to call them
  const addPlayers = () => {};
  const submitRanking = () => {};
  const clearAllData = () => {};

  return (
    <PlayerContext.Provider value={{
      players,
      rankings,
      consensusRanking,
      loading,
      currentPosition,
      setCurrentPosition,
      currentWeek,
      setCurrentWeek,
      addPlayers,
      submitRanking,
      clearAllData
    }}>
      {children}
    </PlayerContext.Provider>
  );
};