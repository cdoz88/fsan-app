import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(request) {
  try {
    // Check if this is a manual revalidation request from our Cron job
    const url = new URL(request.url);
    const isCron = url.searchParams.get('cron') === 'true';

    // TODO: When you get your API key, we will replace this mock array with the live API fetch.
    let processedPlayers = [
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

    // Sort by projected points descending
    processedPlayers.sort((a, b) => b.projected_points - a.projected_points);

    // If this was triggered by the Cron job, purge the old cache and save the new data
    if (isCron) {
      revalidateTag('vegas-rankings');
      console.log("Cache revalidated for Vegas Rankings");
    }

    return NextResponse.json({ rankings: processedPlayers });
    
  } catch (error) {
    console.error('Odds Engine Error:', error);
    return NextResponse.json({ error: 'Failed to process odds' }, { status: 500 });
  }
}