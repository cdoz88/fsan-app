import React from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import ConsensusRanking from '../../../components/ConsensusRanking';
import { PlayerProvider } from '../../../context/PlayerContext';
import { getMenuBySlug } from '../../../utils/api';

export const metadata = {
  title: 'Football Consensus Rankings | FSAN',
  description: 'View the latest NFL consensus rankings aggregated from user submissions.',
};

export default async function ConsensusRankingsPage() {
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

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full pt-6">
          <PlayerProvider>
            <ConsensusRanking />
          </PlayerProvider>
        </div>
      </div>
    </>
  );
}