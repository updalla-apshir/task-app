import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This array contains paths that are public (don't require authentication)
const publicPaths = [
  '/sign-in',
  '/sign-up',
  '/verify-account',
  '/forgot-password',
  '/reset-password',
];

// This function checks if the path is public
function isPublicPath(path: string) {
  return publicPaths.some(publicPath => path.startsWith(publicPath));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isAuthenticated = request.cookies.get('auth_token');

  if (isPublicPath(pathname)) {
    if (isAuthenticated && (pathname === '/sign-in' || pathname === '/sign-up')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('auth_token'); 
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}