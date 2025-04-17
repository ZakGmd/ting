'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@prisma/client";

// Type definition for notifications
export type NotificationWithActor = {
  id: string;
  type: NotificationType;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  entityId: string | null;
  createdAt: Date;
  actor: {
    id: string;
    name: string;
    image: string | null;
    profileImage: string | null;
    displayName: string | null;
  } | null;
};

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  message,
  linkUrl = null,
  entityId = null,
  actorId = null,
}: {
  userId: string;
  type: NotificationType;
  message: string;
  linkUrl?: string | null;
  entityId?: string | null;
  actorId?: string | null;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        linkUrl,
        entityId,
        actorId,
      }
    });
    
    // Revalidate paths to update notification count
    revalidatePath('/notifications');
    revalidatePath('/home');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get notifications for the current user
 */
export async function getNotifications(limit = 10, offset = 0) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            image: true,
            profileImage: true,
            displayName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });
    
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false
      }
    });
    
    return {
      success: true,
      notifications,
      unreadCount
    };
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(notificationIds: string[]) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  
  try {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id  // Security check to ensure only updating own notifications
      },
      data: {
        isRead: true
      }
    });
    
    // Revalidate paths to update notification count
    revalidatePath('/notifications');
    revalidatePath('/home');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  
  try {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });
    
    // Revalidate paths to update notification count
    revalidatePath('/notifications');
    revalidatePath('/home');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
} 