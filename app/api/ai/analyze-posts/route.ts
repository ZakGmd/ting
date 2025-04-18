// app/api/ai/analyze-post/route.ts
import { NextRequest, NextResponse } from "next/server";
import { aiRatingService } from "@/lib/services/ai-rating-service";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Analyze the post
    const analysisResult = await aiRatingService.analyzePost(postId);

    return NextResponse.json(
      { 
        success: true,
        data: analysisResult
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error analyzing post:", error);
    return NextResponse.json(
      { error: "Failed to analyze post" },
      { status: 500 }
    );
  }
}