import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";
import Credentials from "next-auth/providers/credentials"


function generateUUID() {
  let d = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
async function createSession(userId: string) {
  try {
    console.log(`Creating session for user ${userId}`);
    
    const sessionToken = generateUUID();
    
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true }
    });
 
    const session = await prisma.session.create({
      data: {
        sessionToken,
        userId,
        expires,
        userType: user?.userType 
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
      
      
      
      return true;
    },
    authorized({ auth, request }) {
     
      return !!auth?.user;
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
    // Find the user
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
    
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.error("Error signing in:", result.error);
      return { success: false, error: result.error };
    }
    
    return { 
      success: true, 
      user: {
        id: user.id,
        userType: user.userType,
        profileCompleted: user.profileCompleted
      } 
    };
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