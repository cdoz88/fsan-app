import React from 'react';
import { getMenuBySlug } from '../../../utils/api';
import TeamsClient from './TeamsClient';

export async function generateMetadata({ params }) {
  const { sport } = await params;
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  return {
    title: activeSport === 'All' ? `Team Rosters | FSAN` : `${activeSport} Teams | FSAN`,
    description: `Browse the official FSAN ${activeSport} team directory to find active rosters, depth charts, and player news.`,
  };
}

async function getTeams(sportSlug) {
  // Performance Boost: Don't fetch any teams if we are on the 'All' landing page!
  if (sportSlug === 'all') {
    return [];
  }

  const endpoints = [];
  
  if (sportSlug === 'football') {
    endpoints.push({ sport: 'Football', url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams' });
  }
  if (sportSlug === 'basketball') {
    endpoints.push({ sport: 'Basketball', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams' });
  }
  if (sportSlug === 'baseball') {
    endpoints.push({ sport: 'Baseball', url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams' });
  }

  let allTeams = [];

  await Promise.all(endpoints.map(async (ep) => {
    try {
      // Revalidate once a day since teams rarely change
      const res = await fetch(ep.url, { next: { revalidate: 86400 } });
      if (!res.ok) return;
      const data = await res.json();
      
      const teams = data?.sports?.[0]?.leagues?.[0]?.teams?.map(t => ({
        id: t.team.id,
        name: t.team.displayName,
        shortName: t.team.shortDisplayName,
        abbreviation: t.team.abbreviation,
        color: t.team.color || '111111',
        alternateColor: t.team.alternateColor || '000000',
        logo: t.team.logos?.[0]?.href || null,
        sport: ep.sport,
        slug: t.team.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      })) || [];
      
      allTeams = [...allTeams, ...teams];
    } catch (e) {
      console.error(`Failed to fetch ${ep.sport} teams`, e);
    }
  }));

  // Sort alphabetically
  return allTeams.sort((a, b) => a.name.localeCompare(b.name));
}

export default async function TeamsPage({ params }) {
  const { sport } = await params;
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  
  const teams = await getTeams(sport.toLowerCase());

  let proToolsMenu = [];
  let connectMenu = [];
  try {
    if (typeof getMenuBySlug === 'function') {
      proToolsMenu = await getMenuBySlug(`pro-tools-${sport.toLowerCase()}`);
      connectMenu = await getMenuBySlug(`connect-${sport.toLowerCase()}`);
    }
  } catch(e) {
    console.error("Menu fetch failed:", e);
  }

  return (
    <TeamsClient 
       activeSport={activeSport}
       teams={teams}
       proToolsMenu={proToolsMenu}
       connectMenu={connectMenu}
    />
  );
}