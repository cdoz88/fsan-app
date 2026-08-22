import React from 'react';
// Note: Adjusted the import paths by adding one more '../' because we are one folder deeper now
import Header from '../../../../components/Header';
import Sidebar from '../../../../components/Sidebar';
import SeasonClient from './SeasonClient';
import { getMenuBySlug } from '../../../../utils/api';

export const metadata = {
  title: 'OMFG Season Model | FSAN',
  description: 'Identify underlying player usage and positive regression candidates for the season ahead.',
};

export default async function SeasonPage() {
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
          <SeasonClient />
        </div>
      </div>
    </>
  );
}