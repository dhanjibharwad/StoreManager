/* eslint-disable */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

// Define admin paths that require admin authorization
const ADMIN_PATHS = ['/vendor/adminpanel'];

// Define admin paths that require admin role but no active session
const ADMIN_AUTH_PATHS = ['/vendor/login', '/vendor/setup-credentials', '/vendor/forgot-password'];

// Define vendor paths that require user authentication but not admin role
const USER_VENDOR_PATHS = ['/vendor'];

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Check if the path is an admin auth path (login, setup)
  const isAdminAuthPath = ADMIN_AUTH_PATHS.some(authPath => 
    path === authPath || path.startsWith(`${authPath}/`)
  );
  
  // Check if the path is a protected admin path
  const isProtectedAdminPath = ADMIN_PATHS.some(adminPath => 
    path === adminPath || path.startsWith(`${adminPath}/`)
  );
  
  // Get the token from the cookies
  const token = request.cookies.get('authToken')?.value;
  
  // For admin auth paths, check if user has admin role
  if (isAdminAuthPath) {
    if (token) {
      try {
        const { data, error } = await verifySession(token);
        if (!error && data && data.user) {
          const user = data.user;
          const isAdmin = user.role && ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(user.role);
          
          // If not admin, redirect to unauthorized
          if (!isAdmin) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
          }
        }
      } catch (error) {
        console.error('Middleware error:', error);
      }
    }
    // Allow access to login/setup/forgot-password pages if no token or error occurred
    return NextResponse.next();
  }
  
  // If no token for other paths, redirect to login
  if (!token) {
    const loginUrl = new URL('/user/auth/login', request.url);
    loginUrl.searchParams.set('redirect', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    // Verify the session and get the user
    const { data, error } = await verifySession(token);
    
    if (error || !data || !data.user) {
      // Invalid session, redirect to login
      const loginUrl = new URL('/user/auth/login', request.url);
      loginUrl.searchParams.set('redirect', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // For admin paths, check if user has admin role
    if (isProtectedAdminPath) {
    const user = data.user;
    const isAdmin = user.role && ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(user.role);
    
    // If not admin, redirect to unauthorized page
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
    
    // For all other vendor paths, just require user to be authenticated
    // which we've already verified above by checking the token
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to login
    return NextResponse.redirect(new URL('/user/auth/login', request.url));
  }
}

// Configure the middleware to run on all vendor paths
export const config = {
  matcher: [
    '/vendor/:path*',
  ],
}; 