import React from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import RosRankingsClient from './RosRankingsClient';
import { getMenuBySlug } from '../../../utils/api';

export const metadata = {
  title: 'OMFG Rest of Season Rankings | FSAN',
  description: 'Rest of season fantasy football rankings that project remaining value and outcome ranges—fully customized to match your exact league scoring rules so you know exactly who to trade for or pick up.',
};

export default async function RosRankingsPage() {
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
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <RosRankingsClient />
        </div>
      </div>
    </>
  );
}