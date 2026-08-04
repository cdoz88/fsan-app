import { NextResponse } from 'next/server';

// The US States where DNO paid entry is prohibited or highly restricted
const RESTRICTED_STATES = ['WA', 'NV', 'MT', 'HI', 'ID', 'LA', 'AZ', 'IA'];

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // Vercel automatically injects the ISO 3166-2 state code here (e.g., 'WA', 'NV')
  const userState = request.headers.get('x-vercel-ip-country-region');
  const isRestricted = userState && RESTRICTED_STATES.includes(userState.toUpperCase());

  // 1. Redirect old FSAN bookmark path directly to DraftNightOut.com
  if (url.pathname.startsWith('/football/draft-night-out')) {
    return NextResponse.redirect('https://draftnightout.com', 301);
  }

  // 2. Production Domain Routing for Draft Night Out
  if (
    hostname === 'draftnightout.com' ||
    hostname === 'www.draftnightout.com'
  ) {

    // --- READ-ONLY GEOFENCING LOGIC ---
    // If the user is in a restricted state, block them from logging in, registering, or checking out.
    if (isRestricted) {
      // Protect NextAuth endpoints (Login/Register) and Stripe Checkout endpoints
      if (url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/api/stripe/checkout')) {
        return new NextResponse(
          JSON.stringify({ error: 'Draft Night Out is not legally available for registration or purchase in your state.' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }
    }
    // ----------------------------------

    // Redirect explicit /dno path to the clean domain URL
    if (url.pathname.startsWith('/dno')) {
      url.pathname = url.pathname.replace('/dno', '') || '/';
      return NextResponse.redirect(url); 
    }
    
    // Invisibly rewrite clean URLs to the hidden /dno app folder
    url.pathname = `/dno${url.pathname === '/' ? '' : url.pathname}`;
    
    const response = NextResponse.rewrite(url);
    
    // Inject a custom header so the frontend knows the user is restricted
    if (isRestricted) {
      response.headers.set('x-dno-restricted-state', 'true');
    }
    
    return response;
  }

  // Otherwise, let regular FSAN traffic proceed normally
  return NextResponse.next();
}

export const config = {
  // Excludes static assets and images, but ALLOWS /api routes so we can block restricted states
  matcher: [
    '/((?!_next/static|_next/image|images|favicon.ico).*)',
  ],
};