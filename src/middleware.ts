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
  
  // Get the token from the session cookie
  const isAuthenticated = request.cookies.get('auth_token');

  // If the path is public, allow access
  if (isPublicPath(pathname)) {
    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (isAuthenticated && (pathname === '/sign-in' || pathname === '/sign-up')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If not authenticated and trying to access protected route, redirect to sign-in
  if (!isAuthenticated) {
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('auth_token'); // Clear any invalid tokens
    return response;
  }

  // Allow access to protected routes for authenticated users
  return NextResponse.next();
}

// Configure which routes to run middleware on
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