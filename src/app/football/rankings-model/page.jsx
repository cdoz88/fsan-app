import RankingsModelClient from './RankingsModelClient';

export const metadata = {
  title: 'Vegas Implied Rankings | FSAN',
  description: 'Weekly fantasy football rankings calculated directly from Vegas prop bets.',
};

// Forces Next.js to cache this fetch indefinitely, until the Cron Job triggers a revalidation
async function getVegasRankings() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/odds-engine`, {
      next: { tags: ['vegas-rankings'] } 
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.rankings || [];
  } catch (error) {
    console.error("Error fetching local rankings API:", error);
    return [];
  }
}

export default async function RankingsModelPage() {
  const rankings = await getVegasRankings();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <RankingsModelClient initialRankings={rankings} />
    </div>
  );
}