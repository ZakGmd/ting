'use server'

import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth, signIn, signInWithSession, signOut } from "@/auth";

type AuthCheckResult = {
  isAuthenticated: boolean
  needsProfileCompletion: boolean
  userId?: string
  userName?: string
  error?: string
}

/**
 * Registers a new user and creates their profile
 */
export async function registerUser(formData: FormData) {
  try {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string; 
    const accountType = formData.get("accountType") as string;
    const skills = formData.get("skills") as string;
    const bio = formData.get("bio") as string;
    const category = formData.get("category") as string;
    const displayName = formData.get("displayName") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;
    const profileImageUrl = formData.get("profileImageUrl") as string;
    const coverImageUrl = formData.get("coverImageUrl") as string;

    // Validate required fields
    if (!fullName || !email || !password) {
      return { success: false, error: "Missing required fields" };
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email already in use" };
    }

    const hashedPassword = await hash(password, 10);
    const userType = accountType === "freelancer" ? "FREELANCER" : "CLIENT";

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        password: hashedPassword,
        userType: userType,
        skills: skills || null,
        bio: bio || null,
        category: category || null,
        displayName: displayName || fullName,
        location: location || null,
        website: website || null,
        profileImage: profileImageUrl || null,
        coverImage: coverImageUrl || null,
        profileCompleted: true,
        experience: accountType === "freelancer" ? "BEGINNER" : null, 
      },
    });
    
    // Sign in the user - this will create a session via the signIn event handler
    await signIn("credentials", { 
      email, 
      password,
      redirect: false
    });
    
    revalidatePath("/");
    
    // Return success with userType
    return { success: true, userId: user.id, userType };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      error: error.message || "An error occurred during registration" 
    };
  }
}

/**
 * Checks the current authentication status of the user
 */
export async function checkAuthStatus(): Promise<AuthCheckResult> {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return {
        isAuthenticated: false,
        needsProfileCompletion: false
      };
    }
    
    if (session.user.id && session.user.profileCompleted === false) {
      return {
        isAuthenticated: true,
        needsProfileCompletion: true,
        userId: session.user.id,
        userName: session.user.name || undefined
      };
    }
    
    // User is fully authenticated with complete profile
    return {
      isAuthenticated: true,
      needsProfileCompletion: false,
      userId: session.user.id
    };
  } catch (error) {
    console.error("Server-side auth check error:", error);
    return {
      isAuthenticated: false,
      needsProfileCompletion: false,
      error: "Failed to check authentication status"
    };
  }
}

/**
 * Completes the profile setup for OAuth users
 */
export async function completeOAuthProfile(userId: string, formData: FormData) {
  try {
    const accountType = formData.get("accountType") as string;
    const skills = formData.get("skills") as string;
    const bio = formData.get("bio") as string;
    const category = formData.get("category") as string;
    const displayName = formData.get("displayName") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;
    const profileImageUrl = formData.get("profileImageUrl") as string;
    const coverImageUrl = formData.get("coverImageUrl") as string;
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    // Ensure the display name is not empty
    const finalDisplayName = displayName || user.name || "User";
    const userType = accountType === "freelancer" ? "FREELANCER" : "CLIENT";

    await prisma.user.update({
      where: { id: userId },
      data: {
        userType: userType,
        skills: skills || null,
        bio: bio || null,
        category: category || null,
        displayName: finalDisplayName,
        location: location || null,
        website: website || null,
        // Update both image fields for consistency
        profileImage: profileImageUrl || user.profileImage || null,
        image: profileImageUrl || user.image || null, 
        coverImage: coverImageUrl || null,
        profileCompleted: true,
        registrationStep: 3,
        experience: accountType === "freelancer" ? "BEGINNER" : null,
      }
    });
    
    return { success: true, userType };
  } catch (error: any) {
    console.error("Error completing profile:", error);
    return { 
      success: false, 
      error: error.message || "Failed to complete profile" 
    };
  }
}

/**
 * Sets up initial values for OAuth users
 */
export async function setupOAuthUser(userId: string) {
  try {
    // Find the user to ensure it exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    // Update the user with the initial setup values
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileCompleted: false,
        registrationStep: 2,
        userType: user.userType || "FREELANCER" // Default to FREELANCER if not set
      }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error setting up OAuth user:", error);
    return { 
      success: false, 
      error: error.message || "Failed to set up user profile" 
    };
  }
}

// Define return type for the login function
type LoginResult = {
  success: boolean;
  userType?: string;
  needsProfileCompletion?: boolean;
  error?: string;
};

/**
 * Handles user login and session creation
 */
export async function login(formData: FormData): Promise<LoginResult> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    // Validate input
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }
    
    console.log(`Attempting login for user: ${email}`);
    
    // Use signInWithSession which manually creates a database session
    const result = await signInWithSession(email, password);
    
    console.log(`Login result:`, result);
    
    if (!result.success) {
      return { success: false, error: result.error || "Authentication failed" };
    }
    
    // Return user type and profile status for client-side redirect
    return { 
      success: true, 
      userType: result.user?.userType, 
      needsProfileCompletion: !result.user?.profileCompleted 
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error.message || "An error occurred during login"
    };
  }
}

/**
 * Signs the user out
 */
export async function logout() {
  await signOut({ redirectTo: "/" });
}