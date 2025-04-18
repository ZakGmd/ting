// app/api/ai/test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeSentiment, analyzeContentQuality, analyzeSkillMatch } from "@/lib/services/mock-ai-service";

export async function GET(req: NextRequest) {
  try {
    // Test the mock AI services
    const sentimentResult = analyzeSentiment(
      "This is a really great platform for freelancers! I love how it helps beginners showcase their talent."
    );
    
    const contentResult = analyzeContentQuality(
      "I specialize in web development with a focus on React and Next.js applications. My portfolio includes e-commerce sites, dashboards, and interactive web applications with responsive designs that work across all devices. I pride myself on writing clean, maintainable code and delivering projects on time."
    );
    
    const skillMatchResult = analyzeSkillMatch(
      {
        title: "React Developer for E-commerce Project",
        requirements: "Looking for a developer with React, Next.js, and Tailwind CSS experience. Knowledge of payment gateways is a plus.",
        description: "We need a talented developer to build an e-commerce website with product listings, cart functionality, and checkout process."
      },
      {
        skills: "React, Next.js, Tailwind CSS, JavaScript, TypeScript, Stripe integration",
        bio: "Frontend developer with 2 years of experience building web applications",
        portfolio: ["Built an e-commerce platform with React and Next.js", "Integrated Stripe payment gateway"]
      }
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        sentiment: sentimentResult,
        contentQuality: contentResult,
        skillMatch: skillMatchResult,
        message: "Mock AI services are working correctly!"
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error testing mock AI service:", error);
    return NextResponse.json(
      { error: `Failed to test mock AI service: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}