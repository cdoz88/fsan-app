import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getMenuBySlug } from '../../utils/api';
import ScoresClient from './ScoresClient';

export const metadata = {
  title: 'Live Scoreboard | FSAN',
  description: 'View live sports scores and fantasy matchups on the FSAN network.',
};

export default async function ScoresPage() {
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
      <div className="h-screen flex flex-col overflow-hidden bg-[#121212]">
        <Header activeSport={activeSport} />
        
        <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 overflow-hidden">
          <Sidebar activeSport={activeSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
          
          <main className="flex-1 w-full min-w-0 relative overflow-y-auto pb-24 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="animate-in fade-in duration-500 w-full">
               <ScoresClient />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}