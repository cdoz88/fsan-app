import React from 'react';
import { getMenuBySlug } from '../../../utils/api';
import NapkinClient from './NapkinClient';

export const metadata = {
  title: 'The Napkin League | FSAN',
  description: 'Join The Napkin League: Fantasy Football for a Cause. Compete, earn custom collectibles, and support Mission 22.',
};

export default async function NapkinPage() {
  let proToolsMenu = [];
  let connectMenu = [];
  
  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug('pro-tools-football');
      connectMenu = await getMenuBySlug('connect-football');
    }
  } catch(e) {
    console.error("Menu fetch failed:", e);
  }

  return <NapkinClient proToolsMenu={proToolsMenu} connectMenu={connectMenu} />;
}