import React from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import RankingsModelClient from './RankingsModelClient';
import { PlayerProvider } from '../../../context/PlayerContext';
import { getMenuBySlug } from '../../../utils/api';

export const metadata = {
  title: 'Vegas Implied Rankings | FSAN',
  description: 'Weekly fantasy football rankings calculated directly from Vegas prop bets.',
};

export default async function RankingsModelPage() {
  let proToolsMenu = [];
  let connectMenu = [];

  // Fetch the menus so the Sidebar renders correctly
  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
  } catch (e) {
    console.error(e);
  }

  // Hardcoded mock data to guarantee it displays on Vercel while we wait for your API key.
  const mockRankings = [
    { 
      name: "Justin Jefferson", position: "WR", game: "MIN @ DET", 
      projected_points: 21.5, 
      receptions: 7.5, rec_yds: 95.5, rec_tds: 0.75 
    },
    { 
      name: "Christian McCaffrey", position: "RB", game: "SF @ LAR", 
      projected_points: 24.2, 
      rush_yds: 82.5, rush_tds: 0.85, receptions: 4.5, rec_yds: 35.5, rec_tds: 0.25 
    },
    { 
      name: "Josh Allen", position: "QB", game: "BUF @ MIA", 
      projected_points: 22.1, 
      pass_yds: 265.5, pass_tds: 1.8, rush_yds: 40.5, rush_tds: 0.4 
    },
    { 
      name: "Travis Kelce", position: "TE", game: "KC @ LV", 
      projected_points: 16.8, 
      receptions: 6.5, rec_yds: 70.5, rec_tds: 0.55 
    },
    { 
      name: "Breece Hall", position: "RB", game: "NYJ @ NE", 
      projected_points: 18.5, 
      rush_yds: 75.5, rush_tds: 0.65, receptions: 3.5, rec_yds: 25.5, rec_tds: 0.15
    }
  ];

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0">
          <PlayerProvider>
            <RankingsModelClient initialRankings={mockRankings} />
          </PlayerProvider>
        </div>
      </div>
    </>
  );
}