import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Fetch the native XML feed from your WordPress backend
    // We use a revalidate timer so it caches the feed for 60 seconds to prevent spamming your WP server
    const wpFeedRes = await fetch('https://admin.fsan.com/feed/', {
      next: { revalidate: 60 } 
    });
    
    if (!wpFeedRes.ok) {
      return new NextResponse('Error fetching WordPress feed', { status: wpFeedRes.status });
    }

    let xmlData = await wpFeedRes.text();

    // 2. Headless URL Fix: 
    // RSS feeds naturally output the domain they are generated on. 
    // We need to find and replace the admin subdomain so links point to your Next.js frontend.
    xmlData = xmlData.replaceAll('https://admin.fsan.com', 'https://fsan.com');

    // 3. Serve the corrected XML feed to the requester (Sports Reference)
    return new NextResponse(xmlData, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        // Optional: Cache-control headers for external readers
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    });

  } catch (error) {
    console.error('RSS Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}