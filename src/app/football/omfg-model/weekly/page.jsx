import React from 'react';
import Header from '../../../../components/Header';
import Sidebar from '../../../../components/Sidebar';
import WeeklyClient from './WeeklyClient';
import { getMenuBySlug } from '../../../../utils/api';

export const metadata = {
  title: 'OMFG Weekly Model | FSAN',
  description: 'In-season utilization metrics, matchup scores, and start/sit evaluations.',
};

export default async function WeeklyPage() {
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
          <WeeklyClient />
        </div>
      </div>
    </>
  );
}