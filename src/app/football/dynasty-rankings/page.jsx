import React from 'react';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import DynastyRankingsClient from './DynastyRankingsClient';
import { getMenuBySlug } from '../../../utils/api';

export const metadata = {
  title: 'OMFG Dynasty Rankings | FSAN',
  description: 'Dynamic dynasty rankings powered by OMFG models, adjusted for age curves and team strategies.',
};

export default async function DynastyRankingsPage() {
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
        
        {/* Adjusted padding to pt-6 to align perfectly with the Sidebar */}
        <div className="flex-1 w-full min-w-0 pt-6">
          <DynastyRankingsClient />
        </div>
      </div>
    </>
  );
}