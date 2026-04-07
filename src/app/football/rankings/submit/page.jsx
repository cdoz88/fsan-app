import React from 'react';
import Header from '../../../../components/Header';
import Sidebar from '../../../../components/Sidebar';
import UserRanking from '../../../../components/UserRanking';
import { PlayerProvider } from '../../../../context/PlayerContext';
import { getMenuBySlug } from '../../../../utils/api';

export const metadata = {
  title: 'Submit Rankings | FSAN',
  description: 'Submit your NFL player rankings to the consensus.',
};

export default async function SubmitRankingsPage() {
  let proToolsMenu = [];
  let connectMenu = [];

  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
  } catch (e) {
    console.error("Data fetch error:", e);
  }

  return (
    <>
      <Header activeSport="Football" />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport="Football" proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full pt-6 min-w-0">
          {/* Wraps the UI in your Context Provider so it can submit to WordPress */}
          <PlayerProvider>
            <UserRanking />
          </PlayerProvider>
        </div>
      </div>
    </>
  );
}