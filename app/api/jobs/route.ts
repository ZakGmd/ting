// app/api/jobs/[id]/matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jobMatchingService } from "@/lib/services/job-matching-service";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const jobId = params.id;
    
    // Verify the job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { 
        clientId: true,
        status: true
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Only the client who posted the job should be able to see matches
    if (job.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to view matches for this job" },
        { status: 403 }
      );
    }

    if (job.status !== "OPEN") {
      return NextResponse.json(
        { error: "This job is no longer open for applications" },
        { status: 400 }
      );
    }

    // Get the URL search params
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Get the matched freelancers
    const matches = await jobMatchingService.findMatchesForJob(jobId, limit);

    return NextResponse.json(
      { 
        success: true,
        data: matches
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error finding matches for job:", error);
    return NextResponse.json(
      { error: "Failed to find matches" },
      { status: 500 }
    );
  }
}