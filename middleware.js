import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // Production Domain Routing for Draft Night Out
  if (
    hostname === 'draftnightout.com' ||
    hostname === 'www.draftnightout.com'
  ) {
    // 1. Redirect explicit /dno path to clean domain URL
    if (url.pathname.startsWith('/dno')) {
      url.pathname = url.pathname.replace('/dno', '') || '/';
      return NextResponse.redirect(url); 
    }
    
    // 2. Invisibly rewrite clean URLs to hidden /dno app folder
    url.pathname = `/dno${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Otherwise, let FSAN traffic proceed normally.
  return NextResponse.next();
}

export const config = {
  // Added 'images' to the exclusion matcher!
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};