import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
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
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, 
  },
  callbacks: {
    async session({ session, user }) {
     
      if (session.user && user) {
        // Add user ID to session
        session.user.id = user.id;
        
        // Add custom properties
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
      return session;
    },
    async signIn({ user, account }) {
      if (!user?.id) return false;
      
     
      if (account?.provider === 'credentials') {
        try {
          await createSession(user.id);
          console.log(`Session created for credentials login: user ${user.id}`);
        } catch (error) {
          console.error("Failed to create session for credentials login:", error);
        }
      }
      
      // Check if this is an OAuth sign-in
      if (account && (account.provider === 'google' || account.provider === 'github')) {
        try {
          // The adapter has already created the user, so we just need to update it
          // Check if this user exists
          const existingUser = await prisma.user.findUnique({
            where: { id: user.id }
          });
          
          // Update the user's profile completion status
          if (existingUser) {
            // Only update if needed
            if (!existingUser.profileCompleted) {
              await prisma.user.update({
                where: { id: user.id },
                data: { 
                  profileCompleted: false,
                  registrationStep: 2
                }
              });
            }
          } else {
            console.log("User not found after OAuth login. This is unexpected.");
          }
        } catch (error) {
          console.error("Error in OAuth signIn callback:", error);
          return false;
        }
      }
      
      return true;
    }
  },
  events: {
    // Create proper database session when a user signs in with credentials
    async signIn({ user, account }) {
      
      if (account?.provider === "credentials" && user && user.id) {
        try {
          await createSession(user.id);
          
        } catch (error) {
        
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
    };
  }
}