import React, { Suspense } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { getMenuBySlug } from '../../utils/api';
import AccountClient from './AccountClient';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'My Account | FSAN',
  description: 'Manage your FSAN account, subscription, and perks.',
};

export default async function AccountPage() {
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
        
        <div className="flex-1 w-full min-w-0 pt-6">
          <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><Loader2 className="animate-spin text-red-600" size={48} /></div>}>
            <AccountClient />
          </Suspense>
        </div>
      </div>
    </>
  );
}