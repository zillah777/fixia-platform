import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their access requirements
const protectedRoutes = {
  '/as': ['provider'],
  '/explorador': ['customer'],
  '/admin': ['admin']
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/registro',
  '/recuperar-password',
  '/verificar-email',
  '/legal',
  '/company',
  '/api/auth/login',
  '/api/auth/register'
];

// Helper function to check if a route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname.startsWith(route));
}

// Helper function to get required role for a route
function getRequiredRole(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

// Helper function to validate JWT token structure (client-side validation)
function isValidTokenStructure(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Basic JWT structure validation
    const payload = JSON.parse(atob(parts[1]));
    return payload.id && payload.email && payload.user_type;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const requiredRoles = getRequiredRole(pathname);
  if (!requiredRoles) {
    return NextResponse.next();
  }

  // Get token from localStorage via request headers or cookies
  const token = request.cookies.get('auth-token')?.value || 
               request.headers.get('authorization')?.replace('Bearer ', '');

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token structure
  if (!isValidTokenStructure(token)) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Extract user info from token
  let userType: string;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    userType = payload.user_type;
  } catch {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has required role
  if (!requiredRoles.includes(userType)) {
    // Redirect to appropriate dashboard based on user type
    let redirectPath = '/';
    if (userType === 'provider') {
      redirectPath = '/as/dashboard';
    } else if (userType === 'customer') {
      redirectPath = '/explorador/dashboard';
    }
    
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // User is authenticated and authorized
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
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};