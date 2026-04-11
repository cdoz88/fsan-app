import React from 'react';
import { SleeperLeague, SleeperMatchup, SleeperRoster, SleeperUser } from '../types';
import { cn } from '../lib/utils';

interface Props {
  league: SleeperLeague;
  matchups: SleeperMatchup[];
  rosters: SleeperRoster[];
  users: SleeperUser[];
  week: number;
  onClick: () => void;
  isHighlighted?: boolean;
}

export const FantasyMatchupCard: React.FC<Props> = ({ league, matchups, rosters, users, week, onClick, isHighlighted }) => {
  const myRoster = rosters.find(r => r.owner_id === league.synced_user_id);
  if (!myRoster) return null;

  const myMatchup = matchups.find(m => m.roster_id === myRoster.roster_id);
  if (!myMatchup) return null;

  const opponentMatchup = matchups.find(m => m.matchup_id === myMatchup.matchup_id && m.roster_id !== myRoster.roster_id);

  const team1Roster = myRoster;
  const team2Roster = opponentMatchup ? rosters.find(r => r.roster_id === opponentMatchup.roster_id) : null;
  
  const team1User = users.find(u => u.user_id === team1Roster.owner_id);
  const team2User = team2Roster ? users.find(u => u.user_id === team2Roster.owner_id) : null;

  const team1Name = team1User?.metadata?.team_name || team1User?.display_name || 'Unknown';
  const team2Name = opponentMatchup ? (team2User?.metadata?.team_name || team2User?.display_name || 'Unknown') : 'BYE';

  const team1Avatar = team1User?.avatar ? (league.platform === 'Yahoo' ? team1User.avatar : `https://sleepercdn.com/avatars/thumbs/${team1User.avatar}`) : 'https://placehold.co/40x40/383838/ffffff?text=?';
  const team2Avatar = team2User?.avatar ? (league.platform === 'Yahoo' ? team2User.avatar : `https://sleepercdn.com/avatars/thumbs/${team2User.avatar}`) : 'https://placehold.co/40x40/383838/ffffff?text=BYE';

  const platformIconUrl = league.platform === 'Yahoo' 
    ? 'https://s.yimg.com/cv/apiv2/myc/fantasy/Fantasy_icon_0919250x252.png'
    : 'https://play-lh.googleusercontent.com/JLW6o2Mmj5T4J0lGx5a3vRmwGILpWTweL8rmineEhIA9MZ_S-uMoqV4mzX19sIKPsVA'; // Sleeper logo

  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-xl transition-all transform hover:scale-[1.02] duration-300 cursor-pointer p-[2px]",
        isHighlighted ? "bg-[conic-gradient(from_225deg_at_50%_50%,#1b75bb_0%,#c30b16_25%,#c30b16_50%,#f5a623_75%,#1b75bb_100%)] shadow-[0_0_15px_rgba(195,11,22,0.4)]" : "bg-transparent"
      )}
    >
      <div className={cn(
        "bg-[#2A2A2A] rounded-[10px] shadow-lg overflow-hidden p-3 border",
        isHighlighted ? "border-transparent" : "border-gray-800 hover:border-gray-600"
      )}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-bold text-gray-400 uppercase truncate max-w-[150px]">{league.name}</span>
            <img src={platformIconUrl} className="w-4 h-4 object-contain flex-shrink-0" alt="Sleeper" />
          </div>
          <span className="text-gray-400 text-xs font-bold uppercase flex-shrink-0">Week {week}</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <img src={team1Avatar} alt={team1Name} className="w-8 h-8 rounded-full border border-gray-600 flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm text-gray-200 truncate">{team1Name}</span>
              </div>
            </div>
            <span className="font-bold text-lg text-white">{myMatchup.points?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <img src={team2Avatar} alt={team2Name} className="w-8 h-8 rounded-full border border-gray-600 flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-sm text-gray-200 truncate">{team2Name}</span>
              </div>
            </div>
            <span className="font-bold text-lg text-white">{opponentMatchup.points?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};