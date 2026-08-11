import React from 'react';
import { getMenuBySlug } from '../../../utils/api';
import DraftNightOutClient from './DraftNightOutClient';

export const metadata = {
  title: 'Draft Night Out | FSAN',
  description: 'Join us live in Canton, Ohio for the ultimate draft party at the Fantasy Football Expo, or draft from home in our online divisions!',
  openGraph: {
    title: 'Draft Night Out | FSAN',
    description: 'Join us live in Canton, Ohio for the ultimate draft party at the Fantasy Football Expo, or draft from home in our online divisions!',
    url: 'https://fsan.com/football/draft-night-out',
    siteName: 'Fantasy Football Advice Network',
    images: [
      {
        url: 'https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_With-Background.webp',
        width: 1200,
        height: 630,
        alt: 'Draft Night Out by FSAN',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Draft Night Out | FSAN',
    description: 'Join us live in Canton, Ohio for the ultimate draft party at the Fantasy Football Expo, or draft from home in our online divisions!',
    images: ['https://admin.fsan.com/wp-content/uploads/2026/07/DNO-Logo_With-Background.webp'],
  },
};

export default async function DraftNightOutPage() {
  let proToolsMenu = [];
  let connectMenu = [];
  let gfForm = null;
  
  // NOTE: Set to 18 to duplicate Jersey Leagues. Change this if you create a new form in WP!
  const FORM_ID = 18; 

  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }

    const consumerKey = process.env.GF_CONSUMER_KEY;
    const consumerSecret = process.env.GF_CONSUMER_SECRET;
    
    if (consumerKey && consumerSecret) {
        const gfRes = await fetch(`https://admin.fsan.com/wp-json/gf/v2/forms/${FORM_ID}?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`, { 
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
    <DraftNightOutClient 
       proToolsMenu={proToolsMenu} 
       connectMenu={connectMenu} 
       gfForm={gfForm} 
       formId={FORM_ID}
    />
  );
}