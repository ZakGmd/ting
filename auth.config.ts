import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "./lib/prisma"
import bcrypt from "bcryptjs"

export type {
    Account,
    DefaultSession,
    Profile,
    Session,
    User,
  } from "@auth/core/types"

export default {
  providers: [
    Google ,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
     async authorize (credentials) {
          const { email, password } = credentials as { 
            email: string; 
            password: string 
          };

          if (!email || !password) return null;
          
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              userType: true,
              profileCompleted: true,
              image: true,
              profileImage: true
            }
          });
          
          if (!user || !user.password) return null;
          
          const passwordValid = await bcrypt.compare(password, user.password);
          if (!passwordValid) return null;
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.profileImage || user.image,
            userType: user.userType,
            profileCompleted: user.profileCompleted
          };
        }
    })
  ],
} satisfies NextAuthConfig