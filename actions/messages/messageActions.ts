'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "../notifications/notificationActions";

// Type definitions
export type MessageWithSender = {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  createdAt: Date;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    profileImage: string | null;
    displayName: string | null;
  };
};

export type ConversationWithParticipantsAndLastMessage = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  participants: {
    id: string;
    userId: string;
    conversationId: string;
    lastReadAt: Date | null;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      profileImage: string | null;
      displayName: string | null;
    };
  }[];
  messages: MessageWithSender[];
  _count: {
    messages: number;
  };
  unreadCount: number;
};

/**
 * Get all conversations for the current user
 */
export async function getConversations() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get all conversations where the user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                displayName: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Calculate unread messages count for each conversation
    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            isRead: false,
            NOT: {
              senderId: session.user.id,
            },
          },
        });

        return {
          ...conversation,
          unreadCount,
        };
      })
    );

    return { 
      success: true, 
      conversations: conversationsWithUnreadCount 
    };
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getMessages(conversationId: string, limit = 20, offset = 0) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if user is a participant in this conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
    });

    if (!participant) {
      return { success: false, error: "You are not a participant in this conversation" };
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Update last read time for current user
    await prisma.conversationParticipant.update({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        isRead: false,
        NOT: {
          senderId: session.user.id,
        },
      },
      data: {
        isRead: true,
      },
    });

    return { 
      success: true, 
      messages: messages.reverse() // Return in chronological order
    };
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create a new conversation with another user or users
 */
export async function createConversation(participantIds: string[]) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // Ensure the current user is included in participants
  if (!participantIds.includes(session.user.id)) {
    participantIds.push(session.user.id);
  }

  // Remove duplicates
  const uniqueParticipantIds = [...new Set(participantIds)];

  // Need at least 2 participants
  if (uniqueParticipantIds.length < 2) {
    return { success: false, error: "A conversation requires at least 2 participants" };
  }

  try {
    // Check if a conversation between these exact participants already exists
    // This prevents duplicate conversations between the same users
    const existingConversations = await prisma.conversation.findMany({
      where: {
        participants: {
          every: {
            userId: {
              in: uniqueParticipantIds,
            },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    // Filter to find a conversation with exactly these participants (no more, no less)
    const exactMatch = existingConversations.find(
      (conv) => conv.participants.length === uniqueParticipantIds.length
    );

    if (exactMatch) {
      return { 
        success: true, 
        conversationId: exactMatch.id,
        isExisting: true
      };
    }

    // Create a new conversation with participants
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: uniqueParticipantIds.map((userId) => ({
            userId,
          })),
        },
      },
    });

    // Notify other participants
    for (const participantId of uniqueParticipantIds) {
      if (participantId !== session.user.id) {
        // Create a notification for each participant
        await createNotification({
          userId: participantId,
          type: "SYSTEM",
          message: "You have been added to a new conversation",
          actorId: session.user.id,
          linkUrl: `/messages/${newConversation.id}`,
        });
      }
    }

    return { 
      success: true, 
      conversationId: newConversation.id,
      isExisting: false
    };
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(conversationId: string, content: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!content.trim()) {
    return { success: false, error: "Message cannot be empty" };
  }

  try {
    // Check if user is a participant in this conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
    });

    if (!participant) {
      return { success: false, error: "You are not a participant in this conversation" };
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: session.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            displayName: true,
          },
        },
      },
    });

    // Update conversation lastUpdated time
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // Send notification to each participant (except sender)
    const conversationParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
      },
    });

    for (const participant of conversationParticipants) {
      if (participant.userId !== session.user.id) {
        // Create notification for the recipient
        await createNotification({
          userId: participant.userId,
          type: "SYSTEM",
          message: "You have a new message",
          actorId: session.user.id,
          linkUrl: `/messages/${conversationId}`,
        });
      }
    }

    // Revalidate the messages path
    revalidatePath(`/messages/${conversationId}`);

    return { success: true, message };
  } catch (error: any) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark messages in a conversation as read
 */
export async function markMessagesAsRead(conversationId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Check if user is a participant in this conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
    });

    if (!participant) {
      return { success: false, error: "You are not a participant in this conversation" };
    }

    // Update last read time for current user
    await prisma.conversationParticipant.update({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    // Mark all messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        isRead: false,
        NOT: {
          senderId: session.user.id,
        },
      },
      data: {
        isRead: true,
      },
    });

    // Revalidate the messages path
    revalidatePath(`/messages/${conversationId}`);
    revalidatePath('/messages');

    return { success: true };
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a count of unread messages across all conversations
 */
export async function getUnreadMessagesCount() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get conversations where the user is a participant
    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
        },
        isRead: false,
        NOT: {
          senderId: session.user.id,
        },
      },
    });

    return { success: true, unreadCount };
  } catch (error: any) {
    console.error("Error getting unread messages count:", error);
    return { success: false, error: error.message };
  }
} 