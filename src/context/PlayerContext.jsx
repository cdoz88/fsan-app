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
  const [isMounted, setIsMounted] = useState(false);

  // Load data from localStorage on mount (Next.js Safe)
  useEffect(() => {
    setIsMounted(true);
    const savedPlayers = localStorage.getItem('nfl-players');
    const savedRankings = localStorage.getItem('nfl-rankings');
    const savedConsensus = localStorage.getItem('nfl-consensus');

    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    if (savedRankings) setRankings(JSON.parse(savedRankings));
    if (savedConsensus) setConsensusRanking(JSON.parse(savedConsensus));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isMounted) localStorage.setItem('nfl-players', JSON.stringify(players));
  }, [players, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('nfl-rankings', JSON.stringify(rankings));
  }, [rankings, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem('nfl-consensus', JSON.stringify(consensusRanking));
  }, [consensusRanking, isMounted]);

  const addPlayers = (newPlayers) => {
    setPlayers(newPlayers);
  };

  const submitRanking = (userRanking, userId = null) => {
    const ranking = {
      id: Date.now(),
      userId: userId || `user-${Date.now()}`,
      ranking: userRanking,
      timestamp: new Date().toISOString()
    };
    
    setRankings(prev => {
      const newRankings = [...prev, ranking];
      calculateConsensus(newRankings);
      return newRankings;
    });
  };

  const calculateConsensus = (allRankings) => {
    if (allRankings.length === 0) return;

    const playerScores = {};
    
    // Initialize scores
    players.forEach(player => {
      playerScores[player.id] = {
        player,
        totalScore: 0,
        rankCount: 0
      };
    });

    // Calculate scores based on rankings
    allRankings.forEach(ranking => {
      ranking.ranking.forEach((playerId, index) => {
        if (playerScores[playerId]) {
          // Higher rank = lower index = higher score
          const score = players.length - index;
          playerScores[playerId].totalScore += score;
          playerScores[playerId].rankCount += 1;
        }
      });
    });

    // Calculate average scores and sort
    const consensus = Object.values(playerScores)
      .filter(item => item.rankCount > 0)
      .map(item => ({
        ...item.player,
        averageScore: item.totalScore / item.rankCount,
        rankCount: item.rankCount
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    setConsensusRanking(consensus);
  };

  const clearAllData = () => {
    setPlayers([]);
    setRankings([]);
    setConsensusRanking([]);
    if (isMounted) {
      localStorage.removeItem('nfl-players');
      localStorage.removeItem('nfl-rankings');
      localStorage.removeItem('nfl-consensus');
    }
  };

  // Prevent hydration mismatch by not rendering context values until mounted
  if (!isMounted) return null;

  return (
    <PlayerContext.Provider value={{
      players,
      rankings,
      consensusRanking,
      addPlayers,
      submitRanking,
      clearAllData
    }}>
      {children}
    </PlayerContext.Provider>
  );
};