import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ✅ Define routes that should NOT require authentication
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/verify-account',
  '/forget-password',
  '/new-password',
  '/2fa-auth',
  '/verify-email',
]

// ✅ Normalize route (removes trailing slash)
function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/'
}

// ✅ Check if a route is public (exact match or prefix)
function isPublicRoute(path: string) {
  const cleanPath = normalizePath(path)
  return publicRoutes.some((route) => cleanPath.startsWith(route))
}

// ✅ Middleware logic
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('auth_token')?.value

  const isPublic = isPublicRoute(path)

  if (isPublic) {
    if (token && (path === '/sign-in' || path === '/sign-up')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // 🔴 For protected routes, redirect if no token
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

// ✅ Apply middleware only to actual app routes (ignore assets, static files, etc.)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/',
  ],
}
