'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "../notifications/notificationActions";
import { Prisma } from "@prisma/client";

// Type interfaces
interface FollowWithFollowing {
  following: {
    id: string;
    name: string;
    displayName: string | null;
    profileImage: string | null;
    image: string | null;
    bio: string | null;
    experience: string | null;
    userType: string;
  };
}

interface FollowWithFollower {
  follower: {
    id: string;
    name: string;
    displayName: string | null;
    profileImage: string | null;
    image: string | null;
    bio: string | null;
    experience: string | null;
    userType: string;
  };
}

interface FollowingId {
  followingId: string;
}

// Type definition for user data with follow status
export type UserWithFollowStatus = {
  id: string;
  name: string;
  displayName: string | null;
  profileImage: string | null;
  image: string | null;
  bio: string | null;
  experience: string | null;
  userType: string;
  isFollowing: boolean;
};

/**
 * Follow a user
 */
export async function followUser(userIdToFollow: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Cannot follow yourself
  if (session.user.id === userIdToFollow) {
    return { success: false, error: "You cannot follow yourself" };
  }

  try {
    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userIdToFollow,
        },
      },
    });

    if (existingFollow) {
      return { success: false, error: "Already following this user" };
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: userIdToFollow,
      },
    });

    // Create notification for the user being followed
    await createNotification({
      userId: userIdToFollow,
      type: "FOLLOW",
      message: "Someone started following you",
      actorId: session.user.id,
      linkUrl: `/profile/${session.user.id}`,
    });

    // Revalidate user profile paths
    revalidatePath(`/profile/${userIdToFollow}`);
    revalidatePath(`/profile/${session.user.id}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error following user:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userIdToUnfollow: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Delete follow relationship
    await prisma.follow.deleteMany({
      where: {
        followerId: session.user.id,
        followingId: userIdToUnfollow,
      },
    });

    // Revalidate user profile paths
    revalidatePath(`/profile/${userIdToUnfollow}`);
    revalidatePath(`/profile/${session.user.id}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error unfollowing user:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a list of users that the current user is following
 */
export async function getFollowing(userId?: string, limit = 10, offset = 0) {
  const session = await auth();
  
  if (!session?.user?.id && !userId) {
    return { success: false, error: "Unauthorized" };
  }

  // If userId is provided, use it. Otherwise use the session user id (which we know is not null here)
  const targetUserId = userId || (session?.user?.id as string);

  try {
    const following = await prisma.follow.findMany({
      where: {
        followerId: targetUserId,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            displayName: true,
            profileImage: true,
            image: true,
            bio: true,
            experience: true,
            userType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Map to return user data with isFollowing status
    const followingUsers = following.map((follow: FollowWithFollowing) => ({
      ...follow.following,
      isFollowing: true,
    }));

    return { success: true, following: followingUsers };
  } catch (error: any) {
    console.error("Error getting following list:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a list of users that are following the current user
 */
export async function getFollowers(userId?: string, limit = 10, offset = 0) {
  const session = await auth();
  
  if (!session?.user?.id && !userId) {
    return { success: false, error: "Unauthorized" };
  }

  // If userId is provided, use it. Otherwise use the session user id (which we know is not null here)
  const targetUserId = userId || (session?.user?.id as string);

  try {
    const followers = await prisma.follow.findMany({
      where: {
        followingId: targetUserId,
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            displayName: true,
            profileImage: true,
            image: true,
            bio: true,
            experience: true,
            userType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Check which followers the current user is following back
    let followersWithStatus = [];
    
    if (session?.user?.id) {
      const followedByMe = await prisma.follow.findMany({
        where: {
          followerId: session.user.id,
          followingId: { in: followers.map((f: FollowWithFollower) => f.follower.id) }
        },
        select: {
          followingId: true
        }
      });
      
      const followedIds = new Set(followedByMe.map((f: FollowingId) => f.followingId));
      
      followersWithStatus = followers.map((follow: FollowWithFollower) => ({
        ...follow.follower,
        isFollowing: followedIds.has(follow.follower.id),
      }));
    } else {
      followersWithStatus = followers.map((follow: FollowWithFollower) => ({
        ...follow.follower,
        isFollowing: false,
      }));
    }

    return { success: true, followers: followersWithStatus };
  } catch (error: any) {
    console.error("Error getting followers list:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Search for users (only freelancers if specified)
 */
export async function searchUsers(query: string, onlyFreelancers = true, limit = 10, offset = 0) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Create a filter based on userType if onlyFreelancers is true
    const userTypeFilter = onlyFreelancers ? { userType: 'FREELANCER' as const } : {};
    
    // Search for users matching the query
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
        // Don't include the current user in results
        id: { not: session.user.id },
        // Apply user type filter
        ...userTypeFilter,
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        profileImage: true,
        image: true,
        bio: true,
        experience: true,
        userType: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
      skip: offset,
    });

    // Check if the current user is following each returned user
    const following = await prisma.follow.findMany({
      where: {
        followerId: session.user.id,
        followingId: { in: users.map(user => user.id) },
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = new Set(following.map((f: FollowingId) => f.followingId));
    
    const usersWithFollowStatus = users.map(user => ({
      ...user,
      isFollowing: followingIds.has(user.id),
    }));

    return { 
      success: true, 
      users: usersWithFollowStatus,
    };
  } catch (error: any) {
    console.error("Error searching users:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get follow counts for a user
 */
export async function getFollowCounts(userId: string) {
  try {
    const followerCount = await prisma.follow.count({
      where: {
        followingId: userId,
      },
    });

    const followingCount = await prisma.follow.count({
      where: {
        followerId: userId,
      },
    });

    return { 
      success: true, 
      followerCount, 
      followingCount 
    };
  } catch (error: any) {
    console.error("Error getting follow counts:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if the current user is following another user
 */
export async function checkFollowStatus(targetUserId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      },
    });

    return { 
      success: true, 
      isFollowing: !!follow 
    };
  } catch (error: any) {
    console.error("Error checking follow status:", error);
    return { success: false, error: error.message };
  }
} 