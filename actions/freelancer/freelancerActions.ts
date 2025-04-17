'use server'

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put } from '@vercel/blob';

export async function createPost(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized. You must be logged in.");
  }

  const description = formData.get('text') as string;

  
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

  

  try {
    const post = await prisma.$transaction(async (tx) => {
      return tx.post.create({
        data: {
          description,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : [],
          tags:  [],
          creatorId: session.user.id,
        },
      });
    });

    revalidatePath('/home');
    
    return { success: true, postId: post.id };
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