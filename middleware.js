import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // Production Domain Routing for Draft Night Out
  if (
    hostname === 'draftnightout.com' ||
    hostname === 'www.draftnightout.com'
  ) {
    // 1. If the URL explicitly contains /dno, redirect them to the clean version
    // (e.g., draftnightout.com/dno/dashboard -> draftnightout.com/dashboard)
    if (url.pathname.startsWith('/dno')) {
      url.pathname = url.pathname.replace('/dno', '') || '/';
      return NextResponse.redirect(url); 
    }
    
    // 2. Invisibly rewrite clean URLs to the hidden /dno folder
    url.pathname = `/dno${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Otherwise, let FSAN traffic proceed normally.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};