// app/api/ai/rating/[freelancerId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { combinedRatingService } from "@/lib/services/combined-rating-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { freelancerId: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const freelancerId = params.freelancerId;
    
    // Verify the freelancer exists
    const freelancer = await prisma.user.findUnique({
      where: { 
        id: freelancerId,
        userType: "FREELANCER"
      },
      select: { id: true }
    });

    if (!freelancer) {
      return NextResponse.json(
        { error: "Freelancer not found" },
        { status: 404 }
      );
    }

    // Get the freelancer's AI ratings
    const aiRatings = await prisma.aIRating.findMany({
      where: { freelancerId },
      orderBy: { createdAt: "desc" }
    });

    // Get the combined rating
    const combinedRating = await combinedRatingService.getFreelancerCombinedRating(freelancerId);

    return NextResponse.json(
      { 
        success: true,
        data: {
          ratings: aiRatings,
          combinedRating
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching AI ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI ratings" },
      { status: 500 }
    );
  }
}