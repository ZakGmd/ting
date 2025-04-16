import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";


const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    // Add JWT callback to properly decode and handle user type
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = user.userType;
        token.profileCompleted = user.profileCompleted;
      }
      return token;
    },
    // Add session callback to pass token data to session
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub || token.id as string;
        session.user.type = token.type as "FREELANCER" | "CLIENT";
        session.user.profileCompleted = token.profileCompleted as boolean;
      }
      return session;
    }
  }
});

export default auth(function middleware(req) {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userType = req.auth?.user?.type;
  const profileCompleted = req.auth?.user?.profileCompleted;
  
  // Log for debugging
  console.log(`ROUTE: ${nextUrl.pathname}`);
  console.log(`Is Logged In: ${isLoggedIn}`);
  if (userType) console.log(`User Type: ${userType}`);
  console.log(`Profile Completed: ${profileCompleted}`);
  
  // Handle users with incomplete profiles first
  if (isLoggedIn && profileCompleted === false) {
    // If they're trying to access any route other than sign-up,
    // redirect them to complete their profile
    if (!nextUrl.pathname.startsWith('/sign-up')) {
      console.log("Redirecting user with incomplete profile to /sign-up");
      return NextResponse.redirect(new URL('/sign-up', req.url));
    }
    // Allow access to profile setup flow
    return NextResponse.next();
  }
  
  // Regular auth flow for users with completed profiles
  if (isLoggedIn) {
    // Freelancers can't access client routes
    if (userType === "FREELANCER" && (nextUrl.pathname.startsWith('/client') || 
                                     nextUrl.pathname.startsWith('/client'))) {
      console.log("Redirecting FREELANCER from client route to /home");
      return NextResponse.redirect(new URL('/home', req.url));
    }
    
    // Clients can't access freelancer routes
    if (userType === "CLIENT" && (nextUrl.pathname.startsWith('/freelancer') || 
                                 nextUrl.pathname.startsWith('/home'))) {
      console.log("Redirecting CLIENT from freelancer route to /client");
      return NextResponse.redirect(new URL('/client', req.url));
    }
    
    // If user is logged in and trying to access auth pages, redirect appropriately
    if (nextUrl.pathname === '/' || 
        nextUrl.pathname.startsWith('/sign-in') || 
        nextUrl.pathname.startsWith('/sign-up') ||
        nextUrl.pathname.startsWith('/auth')) {
      if (userType === "FREELANCER") {
        return NextResponse.redirect(new URL('/home', req.url));
      } 
    }
  } else {
    // If user is not logged in and trying to access protected routes
    if (nextUrl.pathname.startsWith('/client') || 
    
        nextUrl.pathname.startsWith('/freelancer') ||
        nextUrl.pathname.startsWith('/home')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
  
  // Continue with the request
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};