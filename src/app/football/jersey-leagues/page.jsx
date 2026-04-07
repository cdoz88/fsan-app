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

    // IMPORTANT: We now fetch through our secure internal proxy!
    // Using an absolute URL because Next.js requires it for internal API fetches during Server-Side Rendering
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL || 'localhost:3000';
    
    const gfRes = await fetch(`${protocol}://${host}/api/gravityforms?formId=18`, { 
        next: { revalidate: 60 }
    });
    
    if (gfRes.ok) {
        gfForm = await gfRes.json();
    } else {
        console.warn("Failed to fetch GF Form Structure");
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