import React from 'react';
import { Game } from '../types';
import { formatGameTime, cn, getTeamLogo } from '../lib/utils';

interface GameCardProps {
  game: Game;
  onClick: () => void;
  key?: string | number;
}

export function getTeamSpread(odds: any[] | undefined, teamAbbreviation: string) {
  if (!odds || odds.length === 0) return null;
  const primaryOdds = odds[0];
  if (!primaryOdds || !primaryOdds.details) return null;
  
  if (primaryOdds.details.toUpperCase() === 'EVEN') return 'EVEN';
  
  const parts = primaryOdds.details.split(' ');
  if (parts.length >= 2) {
    const favTeam = parts[0];
    const spreadStr = parts[1];
    const spread = parseFloat(spreadStr);
    
    if (isNaN(spread)) return null;

    if (favTeam === teamAbbreviation) {
      return spread > 0 ? `+${spread}` : `${spread}`;
    } else {
      return spread > 0 ? `-${spread}` : `+${Math.abs(spread)}`;
    }
  }
  return null;
}

export const GameCard = ({ game, onClick }: GameCardProps) => {
  const isPre = game.status.state === 'pre';
  const isLive = game.status.state === 'in';
  const isPost = game.status.state === 'post';

  // Helper to stack and format the live status strings
  const formatLiveStatus = (detail: string) => {
    if (!detail) return null;
    
    const lowerDetail = detail.toLowerCase();
    const isBaseball = lowerDetail.startsWith('top ') || lowerDetail.startsWith('bottom ') || lowerDetail.startsWith('mid ') || lowerDetail.startsWith('end ');
    
    if (isBaseball && !detail.includes(' - ')) {
      const parts = detail.split(' ');
      const prefix = parts[0]; 
      const suffix = parts.slice(1).join(' ').replace(/Inning/gi, 'INN').trim();
      
      return (
        <div className="flex flex-col items-end text-right">
          <span className="text-[9px] text-[#99a1b0] leading-none mb-0.5">{prefix}</span>
          <span className="leading-none">{suffix}</span>
        </div>
      );
    }

    if (detail.includes(' - ')) {
      const parts = detail.split(' - ');
      return (
        <div className="flex flex-col items-end text-right">
          <span className="leading-none mb-0.5">{parts[0]}</span>
          <span className="text-[9px] text-[#99a1b0] leading-none">
            {parts[1].replace(/Quarter/gi, 'QTR').replace(/Inning/gi, 'INN')}
          </span>
        </div>
      );
    }
    return <span className="block text-center leading-none">{detail.replace(/Quarter/gi, 'QTR').replace(/Inning/gi, 'INN')}</span>;
  };

  // Render leaderboard card for both PGA and NASCAR
  if (['PGA', 'NASCAR'].includes(game.league) && game.golfCompetitors) {
    const eventName = game.shortName || game.name || 'Event';
    const top3Competitors = game.golfCompetitors.slice(0, 3);
    
    return (
      <div
        onClick={onClick}
        className="bg-[#2A2A2A] rounded-xl border border-gray-800 hover:border-gray-600 transition-all duration-300 cursor-pointer overflow-hidden group flex flex-col h-full"
      >
        <div className="p-3 flex flex-col h-full">
          <div className="flex justify-between items-start text-xs uppercase font-bold mb-2">
            <span className="text-gray-500">{game.league}</span>
            <span className="text-gray-300 text-right">{game.status.detail}</span>
          </div>
          <div className="font-bold text-white text-base leading-tight mb-3">{eventName}</div>
          <div className="space-y-1.5 mt-auto">
            {top3Competitors.map((c: any, i: number) => {
              
              let rightSide = '-';
              
              if (game.league === 'NASCAR') {
                 // Scan for the most relevant stat to show on the mini-card (Time, Points, or Status)
                 const arr = c.statistics || c.stats || c.athlete?.statistics || c.athlete?.stats || [];
                 const primaryStat = arr.find((s: any) => s.name?.toLowerCase().includes('time') || s.name?.toLowerCase().includes('point'));
                 
                 if (primaryStat) {
                     rightSide = primaryStat.displayValue ?? primaryStat.value ?? '-';
                 } else {
                     // Look for primitive properties directly on the object
                     const possibleKeys = ['time', 'timeBehind', 'points', 'score', 'laps'];
                     const foundKey = possibleKeys.find(k => c[k] !== undefined || c.athlete?.[k] !== undefined);
                     if (foundKey) {
                         rightSide = String(c[foundKey] ?? c.athlete?.[foundKey]);
                     } else {
                         rightSide = c.status?.displayValue || c.reason?.displayValue || (c.order === 1 ? 'Winner' : 'Finished');
                     }
                 }
              } else {
                 const pointsStat = c.statistics?.find((s: any) => s.name === 'points');
                 rightSide = c.score ?? c.points ?? pointsStat?.displayValue ?? c.statistics?.[0]?.displayValue ?? c.linescores?.[0]?.value ?? '-';
              }

              // Attempt to extract the Car Number
              const carKeys = ['car', 'carNumber', 'jersey'];
              const foundCarKey = carKeys.find(k => c[k] !== undefined || c.athlete?.[k] !== undefined);
              const carNum = foundCarKey ? String(c[foundCarKey] ?? c.athlete?.[foundKey]) : '';
              const displayCar = carNum ? `#${carNum}` : '';

              return (
                <div key={i} className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                     <span className="text-gray-500 font-bold text-xs w-4">{c.order || i+1}.</span>
                     <span className="text-gray-200 font-bold truncate">{c.athlete?.shortName || c.athlete?.displayName || c.team?.displayName}</span>
                     {game.league === 'NASCAR' && displayCar && <span className="text-[10px] text-gray-500 font-mono ml-1">{displayCar}</span>}
                  </div>
                  <span className="font-bold text-white bg-[#1f2937] px-1.5 py-0.5 text-xs rounded whitespace-nowrap uppercase">{rightSide}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const awaySpread = getTeamSpread(game.odds, game.awayTeam.abbreviation);
  const homeSpread = getTeamSpread(game.odds, game.homeTeam.abbreviation);

  return (
    <div
      onClick={onClick}
      className="bg-[#2A2A2A] rounded-xl border border-gray-800 hover:border-gray-600 transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="p-3 flex items-center justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <TeamRow team={game.awayTeam} isWinner={isPost && parseInt(game.awayTeam.score || '0') > parseInt(game.homeTeam.score || '0')} isPre={isPre} isLive={isLive} spread={awaySpread} />
          <TeamRow team={game.homeTeam} isWinner={isPost && parseInt(game.homeTeam.score || '0') > parseInt(game.awayTeam.score || '0')} isPre={isPre} isLive={isLive} spread={homeSpread} />
        </div>
        <div className="ml-3 flex flex-col items-end justify-center min-w-[50px] shrink-0">
          <div className={cn(
            "text-xs font-bold uppercase tracking-widest text-right",
            isLive ? "text-[#99a1b0] animate-pulse" : isPre ? "text-gray-300" : "text-gray-500"
          )}>
            {isPre ? formatGameTime(game.date) : formatLiveStatus(game.status.detail)}
          </div>
        </div>
      </div>

      {(game.lastPlay || (game.odds && game.odds.length > 0 && game.odds[0]?.overUnder)) && (
        <div className="bg-[#252525] px-3 py-1.5 border-t border-gray-800">
          <p className="text-[10px] text-gray-500 truncate uppercase tracking-tight">
            {isPre && game.odds && game.odds.length > 0 && game.odds[0]?.overUnder 
              ? `O/U ${game.odds[0].overUnder}` 
              : game.lastPlay || (game.odds?.[0]?.overUnder ? `O/U ${game.odds[0].overUnder}` : '')}
          </p>
        </div>
      )}
    </div>
  );
};

const TeamRow = ({ team, isWinner, isPre, isLive, spread }: { team: any, isWinner: boolean, isPre: boolean, isLive: boolean, spread: string | null }) => (
  <div className="flex items-center justify-between min-w-0 pr-1">
    <div className="flex items-center gap-3 min-w-0">
      <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain shrink-0" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = `https://placehold.co/48x48/1f2937/ffffff?text=${team.abbreviation || '?'}` }} />
      <span className={cn(
        "font-bold text-sm tracking-tight truncate",
        isWinner ? "text-white" : isLive ? "text-[#99a1b0]" : "text-gray-400"
      )}>
        {team.abbreviation}
      </span>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      {spread && (
        <span className="text-xs font-bold text-gray-500 w-12 text-right">
          {spread}
        </span>
      )}
      {!isPre && (
        <span className={cn(
          "font-black text-lg w-8 text-right",
          isWinner ? "text-white" : isLive ? "text-[#99a1b0]" : "text-gray-500"
        )}>
          {team.score}
        </span>
      )}
    </div>
  </div>
);