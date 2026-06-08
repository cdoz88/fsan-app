import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(request) {
  const url = new URL(request.url);
  const isCron = url.searchParams.get('cron') === 'true';

  if (isCron) {
    revalidateTag('vegas-rankings');
    console.log("Vercel Cron: Cache cleared for Vegas Rankings");
    return NextResponse.json({ success: true, message: "Cache revalidated and new odds loaded." });
  }

  return NextResponse.json({ message: "Odds Engine Route is active. Math is handled natively." });
}