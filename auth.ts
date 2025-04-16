import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";


async function createSession(userId: string) {
  try {
    console.log(`Creating session for user ${userId}`);
    
    const sessionToken = crypto.randomUUID();
    
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    
 
    const session = await prisma.session.create({
      data: {
        sessionToken,
        userId,
        expires,
      }
    });
    
    console.log(`Session created successfully: ${session.sessionToken}`);
    return sessionToken;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

const customAdapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data: any) => {
    const { image, ...userData } = data;
    
    return prisma.user.create({
      data: {
        ...userData,
        profileImage: image, 
        profileCompleted: false,  
        registrationStep: 2       
      }
    });
  },
  createSession: async (sessionData: any) => {
    try {
      return await prisma.session.create({
        data: sessionData
      });
    } catch (error) {
      console.error("Error in adapter createSession:", error);
      throw error;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customAdapter,
  session: { 
    strategy: "jwt",    
    maxAge: 30 * 24 * 60 * 60, 
  },
  callbacks: {
    async jwt({ token, user, account }) {
      
      if (user) {
        token.id = user.id;
        token.type = user.userType;
        token.profileCompleted = user.profileCompleted;
      }
      
      // Pass account info to token if available
      if (account) {
        token.provider = account.provider;
      }
      
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
     
        if (token) {
          session.user.id = token.id as string || token.sub as string;
          session.user.type = token.type as "FREELANCER" | "CLIENT";
          session.user.profileCompleted = token.profileCompleted as boolean;
        }
        
        // For database strategy (API routes)
        if (user) {
          session.user.id = user.id;
          
          if (!session.user.type || !session.user.profileCompleted) {
            const userDetails = await prisma.user.findUnique({
              where: { id: user.id },
              select: { 
                userType: true,
                profileCompleted: true 
              }
            });
            
            if (userDetails) {
              session.user.type = userDetails.userType;
              session.user.profileCompleted = userDetails.profileCompleted || false;
            }
          }
        }
      }
      
      return session;
    },
    async signIn({ user, account }) {
      if (!user?.id) return false;
     
      if (account && (account.provider === 'google' || account.provider === 'github')) {
        try {
          // Check if user exists and update profileCompleted status if needed
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id }
          });
          
          if (existingUser) {
           
            if (!existingUser.profileCompleted) {
              await prisma.user.update({
                where: { id: user.id },
                data: { 
                  profileCompleted: false,
                  registrationStep: 2 
                }
              });
              console.log(`Updated OAuth user ${user.id} to complete profile setup`);
            }
          } else {
            console.log("User not found after OAuth login. This is unexpected.");
          }
        } catch (error) {
          console.error("Error in OAuth signIn callback:", error);
          return false;
        }
      }
      
      // For credentials login
      if (account?.provider === 'credentials') {
        try {
          await createSession(user.id);
          console.log(`Session created for credentials login: user ${user.id}`);
        } catch (error) {
          console.error("Failed to create session for credentials login:", error);
        }
      }
      
      return true;
    },
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const userType = auth?.user?.type;
      const profileCompleted = auth?.user?.profileCompleted;

      if (isLoggedIn && profileCompleted === false) {
        // If they're trying to go anywhere except the profile setup flow, redirect them
        if (!nextUrl.pathname.startsWith('/sign-up')) {
          return Response.redirect(new URL('/sign-up', request.url));
        }
        // Allow access to profile setup flow
        return true;
      }
      
      // Determine route types
      const isClientRoute = nextUrl.pathname.startsWith('/client') || 
                           nextUrl.pathname.startsWith('/dashboard');
                           
      const isFreelancerRoute = nextUrl.pathname.startsWith('/freelancer') || 
                              nextUrl.pathname.startsWith('/home');
      
      // Always allow access to auth-related pages
      if (nextUrl.pathname === '/' || 
          nextUrl.pathname.startsWith('/sign-in') || 
          nextUrl.pathname.startsWith('/sign-up') ||
          nextUrl.pathname.startsWith('/auth')) {
        return true;
      }
      
      // Check if user is logged in
      if (!isLoggedIn) {
        return false;
      }
      
      // Check route-specific permissions based on user type
      if (userType === "FREELANCER" && isClientRoute) {
        return false;
      }
      
      if (userType === "CLIENT" && isFreelancerRoute) {
        return false;
      }
      
      // Allow access to other routes if user is logged in
      return true;
    }
  },
  events: {
    
    async signIn({ user, account }) {
      if (account?.provider === "credentials" && user && user.id) {
        try {
          await createSession(user.id);
        } catch (error) {
          console.error("Error creating session:", error);
        }
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  ...authConfig,
});

export async function signInWithSession(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        userType: true,
        profileCompleted: true
      }
    });
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    if (!user.password) {
      return { success: false, error: "Cannot sign in with credentials for OAuth account" };
    }
    
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Invalid password" };
    }
    
    try {
      // Create a session for the user
      const sessionToken = await createSession(user.id);
      
      if (!sessionToken) {
        return { success: false, error: "Failed to create session" };
      }
      
      return { 
        success: true, 
        user: {
          id: user.id,
          userType: user.userType,
          profileCompleted: user.profileCompleted
        } 
      };
    } catch (sessionError) {
      console.error("Failed to create session:", sessionError);
      return { success: false, error: "Failed to create session" };
    }
  } catch (error) {
    console.error("Error in signInWithSession:", error);
    return { success: false, error: "Authentication failed" };
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      type?: "FREELANCER" | "CLIENT";
      profileCompleted?: boolean;
    } & DefaultSession["user"]
  }

  interface User {
    id?: string;
    userType?: "FREELANCER" | "CLIENT";
    profileCompleted?: boolean;
  }
}