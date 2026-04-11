import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getMenuBySlug } from '../../utils/api';
import SubscribeClient from './SubscribeClient';

export const metadata = {
  title: 'Subscribe | FSAN',
  description: 'Upgrade your game with FSAN Pro+.',
};

export default async function SubscribePage() {
  const activeSport = 'All'; 
  let proToolsMenu = [];
  let connectMenu = [];

  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-all');
      connectMenu = await getMenuBySlug('connect-all');
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <>
      <Header activeSport={activeSport} />
      
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full pb-24">
        <Sidebar activeSport={activeSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        
        <div className="flex-1 w-full min-w-0 pt-6 relative">
          <SubscribeClient />
        </div>
      </div>
    </>
  );
}