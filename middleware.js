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

    // --- API ROUTE HANDLING & GEOFENCING ---
    if (url.pathname.startsWith('/api')) {
      // If restricted, ONLY block login, registration, and checkout. 
      // Do NOT block /api/auth/session, otherwise the app will crash trying to check auth status.
      if (isRestricted) {
        if (
          url.pathname.includes('/checkout') || 
          url.pathname.includes('/signin') || 
          url.pathname.includes('/register')
        ) {
          return new NextResponse(
            JSON.stringify({ error: 'Draft Night Out is not legally available for registration or purchase in your state.' }),
            { status: 403, headers: { 'content-type': 'application/json' } }
          );
        }
      }
      
      // Let all other API routes proceed without rewriting their URL paths
      const apiResponse = NextResponse.next();
      if (isRestricted) {
        apiResponse.headers.set('x-dno-restricted-state', 'true');
      }
      return apiResponse;
    }
    // ----------------------------------------

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