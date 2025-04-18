'use server'

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put } from '@vercel/blob';

// Type definition for Post with User info
export type PostWithUser = {
  id: string;
  description: string;
  mediaUrls: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: { 
    id: string , 
    userId: string
  }[];
  comments: { id: string }[];
  creator: {
    id: string;
    name: string;
    image: string | null;
    profileImage: string | null;
    displayName: string | null;
    experience: string | null;
  };
}

/**
 * Fetches posts for the feed with creator information
 */
export async function getPosts(limit = 10, skip = 0): Promise<PostWithUser[]> {
  const posts = await prisma.post.findMany({
    take: limit,
    skip,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
          profileImage: true,
          displayName: true,
          experience: true,
        },
      },
      likes: {
        select: {
          id: true,
          userId: true,
        },
      },
      comments: {
        select: {
          id: true,
        },
      },
    },
  });

  return posts;
}

export async function createPost(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized. You must be logged in.");
  }

  const title = formData.get('title') as string;
  const description = formData.get('text') as string;
  const tagsInput = formData.get('tags') as string;
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
  
  // Media file handling
  const mediaFiles = formData.getAll('media') as File[];
  const mediaUrls: string[] = [];
  
  // Upload each file to Vercel Blob
  if (mediaFiles.length > 0) {
    try {
      for (const file of mediaFiles) {
        if (file instanceof File && file.size > 0) {
          const blob = await put(`posts/${session.user.id}/${Date.now()}-${file.name}`, file, {
            access: 'public',
          });
          mediaUrls.push(blob.url);
        }
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      return { 
        success: false, 
        error: "Failed to upload media files" 
      };
    }
  }

  // Validation logic
  if (!description || description.trim() === "") {
    throw new Error("Post description is required");
  }

  if (!title || title.trim() === "") {
    throw new Error("Post title is required");
  }

  try {
    const post = await prisma.$transaction(async (tx) => {
      return tx.post.create({
        data: {
         
          description,
          mediaUrls,
          tags: tags.length > 0 ? tags : [],
          creatorId: session.user.id,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
              profileImage: true,
              displayName: true,
              experience: true,
            },
          },
          likes: {
            select: {
              id: true,
              userId: true,
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
        },
      });
    });

    revalidatePath('/home');
    
    return { 
      success: true, 
      postId: post.id,
      post: post 
    };
  } catch (error: any) {
    console.error("Error creating post:", error);
    return { 
      success: false, 
      error: error.message || "Failed to create post" 
    };
  }
}

export async function editPost(postId: string, formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized. You must be logged in.");
  }

  try {
    // First check if the post exists and belongs to the user
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.creatorId !== session.user.id) {
      throw new Error("Unauthorized. You can only edit your own posts.");
    }

    const title = formData.get('title') as string;
    const description = formData.get('text') as string;
    const tagsInput = formData.get('tags') as string;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    // Get existing media URLs to keep
    const keepMediaUrls = formData.getAll('keepMedia').map(url => url.toString());
    
    // Handle new media files
    const mediaFiles = formData.getAll('media') as File[];
    let newMediaUrls: string[] = [];
    
    // Upload each new file to Vercel Blob
    if (mediaFiles.length > 0) {
      try {
        for (const file of mediaFiles) {
          if (file instanceof File && file.size > 0) {
            const blob = await put(`posts/${session.user.id}/${Date.now()}-${file.name}`, file, {
              access: 'public',
            });
            newMediaUrls.push(blob.url);
          }
        }
      } catch (error) {
        console.error("Error uploading media:", error);
        return { 
          success: false, 
          error: "Failed to upload media files" 
        };
      }
    }
    
    // Combine kept media with new media
    const mediaUrls = [...keepMediaUrls, ...newMediaUrls];

    // Validation logic
    if (!description || description.trim() === "") {
      throw new Error("Post description is required");
    }

    if (!title || title.trim() === "") {
      throw new Error("Post title is required");
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        description,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : existingPost.mediaUrls,
        tags: tags.length > 0 ? tags : existingPost.tags,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/home');
    
    return { success: true, postId: updatedPost.id };
  } catch (error: any) {
    console.error("Error updating post:", error);
    return { 
      success: false, 
      error: error.message || "Failed to update post" 
    };
  }
}

export async function deletePost(postId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized. You must be logged in.");
  }

  try {
    // First check if the post exists and belongs to the user
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.creatorId !== session.user.id) {
      throw new Error("Unauthorized. You can only delete your own posts.");
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath('/home');
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return { 
      success: false, 
      error: error.message || "Failed to delete post" 
    };
  }
}

export async function incrementViewCount(postId: string) {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1
        }
      }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error incrementing view count:", error);
    return { 
      success: false, 
      error: error.message || "Failed to increment view count" 
    };
  }
}

/**
 * Toggle like on a post (like if not liked, unlike if already liked)
 */
export async function toggleLike(postId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized. You must be logged in.");
  }

  try {
    // Check if the user has already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id
        }
      }
    });

    if (existingLike) {
      // If like exists, remove it (unlike)
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });
    } else {
      // If like doesn't exist, create it
      await prisma.like.create({
        data: {
          postId,
          userId: session.user.id
        }
      });
    }

    // Get updated post with likes to return
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            profileImage: true,
            displayName: true,
            experience: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
      },
    });

    revalidatePath('/home');
    
    return { 
      success: true, 
      liked: !existingLike,
      post: updatedPost
    };
  } catch (error: any) {
    console.error("Error toggling like:", error);
    return { 
      success: false, 
      error: error.message || "Failed to process like" 
    };
  }
}

/**
 * Add a comment to a post
 */
export async function addComment(postId: string, content: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized. You must be logged in.");
  }

  // Validate content
  if (!content || content.trim() === "") {
    return { 
      success: false, 
      error: "Comment content is required" 
    };
  }

  try {
    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            profileImage: true,
            displayName: true,
            experience: true,
          }
        }
      }
    });

    // Get updated post to return
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            profileImage: true,
            displayName: true,
            experience: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
      },
    });

    revalidatePath('/home');
    revalidatePath(`/post/${postId}/comments`);
    
    return { 
      success: true, 
      comment,
      post: updatedPost
    };
  } catch (error: any) {
    console.error("Error adding comment:", error);
    return { 
      success: false, 
      error: error.message || "Failed to add comment" 
    };
  }
}

/**
 * Get comments for a post
 */
export async function getComments(postId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            profileImage: true,
            displayName: true,
            experience: true,
          }
        }
      }
    });
    
    return { 
      success: true, 
      comments 
    };
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch comments" 
    };
  }
}