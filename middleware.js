import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host');

  // 1. The Local / Testing Override
  // This explicitly catches '/dno' and prevents it from being sent to the articles route.
  if (url.pathname === '/dno') {
     return NextResponse.rewrite(new URL('/dno', request.url));
  }

  // 2. The Production Domain Routing (For when you connect GoDaddy)
  // If the user visits the DNO domain directly, invisibly route them to the /dno folder.
  if (
    hostname === 'draftnightout.com' ||
    hostname === 'www.draftnightout.com'
  ) {
    url.pathname = `/dno${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Otherwise, let FSAN traffic proceed normally.
  return NextResponse.next();
}

// Ensure the middleware only runs on actual page visits, not on images or API calls.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};