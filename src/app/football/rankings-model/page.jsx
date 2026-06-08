import RankingsModelClient from './RankingsModelClient';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Vegas Implied Rankings | FSAN',
  description: 'Weekly fantasy football rankings calculated directly from Vegas prop bets.',
};

export default function RankingsModelPage() {
  // Hardcoded mock data to guarantee it displays on Vercel while we wait for your API key.
  const mockRankings = [
    { 
      name: "Justin Jefferson", position: "WR", game: "MIN @ DET", 
      projected_points: 21.5, 
      receptions: 7.5, rec_yds: 95.5, rec_tds: 0.75 
    },
    { 
      name: "Christian McCaffrey", position: "RB", game: "SF @ LAR", 
      projected_points: 24.2, 
      rush_yds: 82.5, rush_tds: 0.85, receptions: 4.5, rec_yds: 35.5, rec_tds: 0.25 
    },
    { 
      name: "Josh Allen", position: "QB", game: "BUF @ MIA", 
      projected_points: 22.1, 
      pass_yds: 265.5, pass_tds: 1.8, rush_yds: 40.5, rush_tds: 0.4 
    },
    { 
      name: "Travis Kelce", position: "TE", game: "KC @ LV", 
      projected_points: 16.8, 
      receptions: 6.5, rec_yds: 70.5, rec_tds: 0.55 
    },
    { 
      name: "Breece Hall", position: "RB", game: "NYJ @ NE", 
      projected_points: 18.5, 
      rush_yds: 75.5, rush_tds: 0.65, receptions: 3.5, rec_yds: 25.5, rec_tds: 0.15
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-16"> {/* Adjust pt-16 based on your Header's height */}
        <Sidebar sport="football" />
        <main className="flex-1 w-full bg-gray-50 overflow-x-hidden p-4 md:p-8">
          <RankingsModelClient initialRankings={mockRankings} />
        </main>
      </div>
    </div>
  );
}