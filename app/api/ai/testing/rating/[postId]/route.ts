// app/api/test/rating/[postId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { aiRatingService } from "@/lib/services/ai-rating-service";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId;
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true }
    });
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Run the AI rating analysis
    const analysisResult = await aiRatingService.analyzePost(postId);

    // Return the analysis results
    return NextResponse.json({ 
      success: true,
      data: {
        post: {
          id: post.id,
          creatorName: post.creator.name
        },
        rating: analysisResult
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error testing rating system:", error);
    return NextResponse.json(
      { error: `Rating test failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}