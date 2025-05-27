import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/account', '/goals', '/stats', '/workouts'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Try to fetch auth status
  try {
    const authCheckResponse = await fetch('http://localhost:8000/api/check-auth', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    const isAuthenticated = authCheckResponse.ok;

    // If user is not authenticated and tries to access a protected route
    if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If user is authenticated and tries to access auth routes
    if (isAuthenticated && authRoutes.includes(pathname)) {
      const redirectUrl = new URL('/', request.url);
      return NextResponse.redirect(redirectUrl);
    }

  } catch (error) {
    // If auth check fails, redirect to login for protected routes
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...protectedRoutes, ...authRoutes]
};
