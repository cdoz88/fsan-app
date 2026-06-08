import React from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import RankingsModelClient from './RankingsModelClient';
import { PlayerProvider } from '../../../context/PlayerContext';
import { getMenuBySlug } from '../../../utils/api';
import { getCachedVegasData } from '../../../utils/vegasEngine';

export const metadata = {
  title: 'Vegas Implied Rankings | FSAN',
  description: 'Fantasy football rankings calculated directly from Vegas prop bets.',
};

export default async function RankingsModelPage() {
  let proToolsMenu = [];
  let connectMenu = [];

  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
  } catch (e) {
    console.error(e);
  }

  // Directly executes the cached server function, completely eliminating fetch errors
  const { rankings, mode, error } = await getCachedVegasData();

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0">
          <PlayerProvider>
            <RankingsModelClient initialRankings={rankings} mode={mode} serverError={error} />
          </PlayerProvider>
        </div>
      </div>
    </>
  );
}