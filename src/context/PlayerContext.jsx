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
  
  // Filters
  const [currentPosition, setCurrentPosition] = useState('QB');
  const [currentWeek, setCurrentWeek] = useState('Offseason');
  const [selectedAnalyst, setSelectedAnalyst] = useState('consensus'); 
  
  const [loading, setLoading] = useState(true);

  // Fetch data from Next.js Proxy
  const fetchData = async (position, week) => {
    setLoading(true);
    try {
      // 1. Fetch Raw Players
      const playersRes = await fetch(`/api/rankings?action=nfl_get_players&position=${position}&week=${week}`);
      const playersJson = await playersRes.json();
      if (playersJson.success) setPlayers(playersJson.data);

      // 2. Fetch Consensus Data
      const consensusRes = await fetch(`/api/rankings?action=nfl_get_consensus&position=${position}&week=${week}`);
      const consensusJson = await consensusRes.json();

      if (consensusJson.success && consensusJson.data) {
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

  useEffect(() => {
    fetchData(currentPosition, currentWeek);
  }, [currentPosition, currentWeek]);

  // Processes the raw ranking strings from WordPress into displayable data
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
        itemStats[key] = { ...player, type: 'player', positionSum: 0, rankSum: 0, minRank: Infinity, maxRank: -Infinity, timesRanked: 0 };
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
        } catch(e) { console.error(e); }
    });

    const consensusItems = Object.values(itemStats)
        .filter(item => item.type === 'player' && item.timesRanked > 0)
        .map(item => ({ ...item, averageScore: item.rankSum / totalRankers, averageRank: item.rankSum / totalRankers, rankCount: item.timesRanked }))
        .sort((a, b) => a.averageRank - b.averageRank);

    setConsensusRanking(consensusItems);
  };

  // Submit Ranking directly to WP Database
  const submitRanking = async (rankedItemsData) => {
    try {
      const formData = new FormData();
      formData.append('action', 'nfl_save_ranking');
      formData.append('position', currentPosition);
      formData.append('week', currentWeek);
      formData.append('ranking_data', JSON.stringify(rankedItemsData));

      const response = await fetch('/api/rankings', { method: 'POST', body: formData });
      const data = await response.json();
      
      if (data.success) {
         fetchData(currentPosition, currentWeek); // Refresh data
         return { success: true };
      } else {
         return { success: false, message: data.data || 'Failed to save' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Network error' };
    }
  };

  return (
    <PlayerContext.Provider value={{
      players,
      rankings,
      consensusRanking,
      loading,
      currentPosition, setCurrentPosition,
      currentWeek, setCurrentWeek,
      selectedAnalyst, setSelectedAnalyst,
      submitRanking
    }}>
      {children}
    </PlayerContext.Provider>
  );
};