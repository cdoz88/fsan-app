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

    // DIRECT SERVER FETCH: Because this runs on the server, we can safely use the env keys directly!
    const consumerKey = process.env.GF_CONSUMER_KEY;
    const consumerSecret = process.env.GF_CONSUMER_SECRET;
    
    if (consumerKey && consumerSecret) {
        
        // FIX: Bypass the WordPress Application Passwords interceptor by passing the keys directly in the URL
        const gfRes = await fetch(`https://admin.fsan.com/wp-json/gf/v2/forms/18?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`, { 
            next: { revalidate: 60 },
            headers: { 
                'Content-Type': 'application/json' 
            }
        });
        
        if (gfRes.ok) {
            gfForm = await gfRes.json();
        } else {
            const errText = await gfRes.text();
            console.error("GF Fetch failed with status:", gfRes.status, errText);
        }
    } else {
        console.warn("Missing Gravity Forms environment variables in Vercel.");
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