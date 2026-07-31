import { NextResponse } from 'next/server';

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
    // Redirect explicit /dno path to the clean domain URL
    if (url.pathname.startsWith('/dno')) {
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