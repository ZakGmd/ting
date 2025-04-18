// app/api/ai/analyze-comment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyzeSentiment } from "@/lib/services/mock-ai-service";


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
    const { comment } = body;

    if (!comment) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );
    }

    // Analyze the comment sentiment using mock service
    const sentiment = analyzeSentiment(comment);

    return NextResponse.json(
      { 
        success: true,
        data: {
          sentiment: sentiment.score,
          analysis: sentiment.analysis
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error analyzing comment:", error);
    return NextResponse.json(
      { error: "Failed to analyze comment" },
      { status: 500 }
    );
  }
}