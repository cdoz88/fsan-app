import React from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import DraftRankingsClient from './DraftRankingsClient';
import { getMenuBySlug } from '../../../utils/api';

export const metadata = {
  title: 'OMFG Draft Rankings | FSAN',
  description: 'Season-long fantasy football draft rankings that project full-season value and outcome ranges—fully customized to match your exact league scoring rules so you know exactly who to draft.',
};

export default async function DraftRankingsPage() {
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
          <DraftRankingsClient />
        </div>
      </div>
    </>
  );
}