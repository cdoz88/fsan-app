import React from 'react';
import { getMenuBySlug } from '../../../utils/api';
import JerseyLeaguesClient from './JerseyLeaguesClient';

export const metadata = {
  title: 'Jersey Leagues | FSAN',
  description: 'Compete in a league named after your favorite NFL star to win an autographed jersey and a championship ring!',
};

export default async function JerseyLeaguesPage() {
  let proToolsMenu = [];
  let connectMenu = [];
  let gfForm = null;

  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }

    // Securely fetch your Gravity Form Schema (Form ID 18)
    const gfRes = await fetch('https://admin.fsan.com/wp-json/gf/v2/forms/18', { 
        next: { revalidate: 60 },
        headers: { 'Content-Type': 'application/json' }
    });
    
    if (gfRes.ok) {
        gfForm = await gfRes.json();
    }
  } catch (e) {
    console.error("Menu or GF fetch error:", e);
  }

  return (
    <JerseyLeaguesClient 
       proToolsMenu={proToolsMenu} 
       connectMenu={connectMenu} 
       gfForm={gfForm} 
    />
  );
}