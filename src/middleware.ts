import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ✅ Define routes that should NOT require authentication
const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/verify-account",
  "/forget-password",
  "/new-password",
  "/2fa-auth",
  "/verify-email",
];

// ✅ Normalize path
function normalizePath(path: string) {
  return path.replace(/\/+$/, "") || "/";
}

function isPublicRoute(path: string) {
  const cleanPath = normalizePath(path);
  return publicRoutes.some((route) => normalizePath(route) === cleanPath);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = isPublicRoute(path);

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (isPublic) {
    if (
      token &&
      (path === "/sign-in" || path === "/sign-up" || path === "/forget-password")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}


// ✅ Apply to app routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)", "/"],
};
