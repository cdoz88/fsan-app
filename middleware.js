import { NextResponse } from 'next/server';

// The US States where paid fantasy sports are prohibited or highly restricted
const RESTRICTED_STATES = ['WA', 'NV', 'MT', 'HI', 'ID', 'LA'];

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // 1. Redirect old FSAN bookmark path directly to DraftNightOut.com
  if (url.pathname.startsWith('/football/draft-night-out')) {
    return NextResponse.redirect('https://draftnightout.com', 301);
  }

  // 2. Production Domain Routing for Draft Night Out
  if (
    hostname === 'draftnightout.com' ||
    hostname === 'www.draftnightout.com'
  ) {
    
    // --- FREE GEOFENCING LOGIC ---
    // Vercel automatically injects the ISO 3166-2 state code here (e.g., 'WA', 'NV')
    const userState = request.headers.get('x-vercel-ip-country-region');

    // If the user is in a restricted state, forcefully redirect them to a blocked page
    if (userState && RESTRICTED_STATES.includes(userState.toUpperCase())) {
      // Prevent an infinite redirect loop if they are already on the blocked page
      if (!url.pathname.startsWith('/blocked')) {
        url.pathname = '/blocked';
        return NextResponse.redirect(url); 
      }
    }
    // -----------------------------

    // Redirect explicit /dno path to the clean domain URL
    if (url.pathname.startsWith('/dno') && !url.pathname.startsWith('/dno/blocked')) {
      url.pathname = url.pathname.replace('/dno', '') || '/';
      return NextResponse.redirect(url); 
    }
    
    // Invisibly rewrite clean URLs to the hidden /dno app folder
    url.pathname = `/dno${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Otherwise, let regular FSAN traffic proceed normally
  return NextResponse.next();
}

export const config = {
  // Excludes API routes, static assets, and images from middleware rules
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};