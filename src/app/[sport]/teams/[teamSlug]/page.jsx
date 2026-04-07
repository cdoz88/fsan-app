import React from 'react';
import { getMenuBySlug } from '../../../../utils/api';
import TeamClient from './TeamClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { sport, teamSlug } = await params;
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  const teamName = teamSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  return {
    title: `${teamName} Roster & Depth Chart | FSAN`,
    description: `View the official active roster, depth chart, and player profiles for the ${teamName} on the FSAN ${activeSport} network.`,
  };
}

async function getTeamData(sportSlug, teamSlug) {
  let sportString = '';
  let leagueString = '';

  if (sportSlug === 'football') { sportString = 'football'; leagueString = 'nfl'; }
  else if (sportSlug === 'basketball') { sportString = 'basketball'; leagueString = 'nba'; }
  else if (sportSlug === 'baseball') { sportString = 'baseball'; leagueString = 'mlb'; }
  else return null;

  try {
    const teamsRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportString}/${leagueString}/teams`, { next: { revalidate: 86400 } });
    if (!teamsRes.ok) return null;
    const teamsData = await teamsRes.json();
    
    const allTeams = teamsData?.sports?.[0]?.leagues?.[0]?.teams || [];
    const matchedTeam = allTeams.find(t => 
      t.team.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === teamSlug
    );

    if (!matchedTeam) return null;
    const teamId = matchedTeam.team.id;

    const rosterRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sportString}/${leagueString}/teams/${teamId}/roster`, { next: { revalidate: 3600 } });
    if (!rosterRes.ok) return null;
    const rosterData = await rosterRes.json();

    const teamInfo = {
      id: rosterData.team.id,
      name: rosterData.team.displayName,
      abbreviation: rosterData.team.abbreviation,
      color: rosterData.team.color || '111111',
      alternateColor: rosterData.team.alternateColor || '000000',
      logo: rosterData.team.logo || matchedTeam.team.logos?.[0]?.href || null,
      record: rosterData.team.record?.items?.[0]?.summary || '',
      standingSummary: rosterData.team.standingSummary || ''
    };

    let rosterGroups = [];
    if (rosterData.athletes && Array.isArray(rosterData.athletes)) {
       if (rosterData.athletes[0]?.items) {
           rosterGroups = rosterData.athletes.map(group => ({
               groupName: group.position || 'Active Roster',
               players: group.items.map(p => ({
                   id: p.id,
                   name: p.fullName,
                   // Clean up periods and apostrophes for roster clicks!
                   slug: p.fullName.toLowerCase().replace(/['.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                   position: p.position?.abbreviation || '',
                   jersey: p.jersey || '',
                   headshot: p.headshot?.href || null,
               }))
           }));
       } else {
           rosterGroups = [{
               groupName: 'Active Roster',
               players: rosterData.athletes.map(p => ({
                   id: p.id,
                   name: p.fullName,
                   // Clean up periods and apostrophes for roster clicks!
                   slug: p.fullName.toLowerCase().replace(/['.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                   position: p.position?.abbreviation || '',
                   jersey: p.jersey || '',
                   headshot: p.headshot?.href || null,
               }))
           }];
       }
    }

    return { teamInfo, rosterGroups };

  } catch (error) {
    console.error("Error fetching team roster:", error);
    return null;
  }
}

export default async function TeamPage({ params }) {
  const { sport, teamSlug } = await params;
  const activeSport = sport.charAt(0).toUpperCase() + sport.slice(1);
  
  if (activeSport === 'All') return notFound();

  const teamData = await getTeamData(sport.toLowerCase(), teamSlug);
  if (!teamData) return notFound();

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
    <TeamClient 
       activeSport={activeSport}
       teamInfo={teamData.teamInfo}
       rosterGroups={teamData.rosterGroups}
       proToolsMenu={proToolsMenu}
       connectMenu={connectMenu}
    />
  );
}