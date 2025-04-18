// app/lib/services/combined-rating-service.ts

import { prisma } from "@/lib/prisma";
import { Experience } from "@prisma/client";

type FreelancerRatingData = {
  aiRatings: {
    overallAIScore: number;
  }[];
  clientRatings: {
    overallScore: number;
  }[];
  experience: Experience;
  totalPosts: number;
  totalClientProjects: number;
};

export const combinedRatingService = {
  /**
   * Calculates and returns the combined rating score for a freelancer
   * based on both AI ratings and client feedback
   */
  async getFreelancerCombinedRating(freelancerId: string): Promise<number> {
    // Get the freelancer's data
    const ratingData = await getFreelancerRatingData(freelancerId);
    
    // Calculate the combined score
    return calculateCombinedScore(ratingData);
  },

  /**
   * Updates the experience level of a freelancer based on their combined rating
   */
  async updateFreelancerExperienceLevel(freelancerId: string): Promise<Experience> {
    // Get the current combined rating
    const combinedRating = await this.getFreelancerCombinedRating(freelancerId);
    
    // Determine the appropriate experience level based on the rating
    let newExperienceLevel: Experience;
    if (combinedRating >= 8.5) {
      newExperienceLevel = "ADVANCED";
    } else if (combinedRating >= 6.5) {
      newExperienceLevel = "INTERMEDIATE";
    } else {
      newExperienceLevel = "BEGINNER";
    }
    
    // Update the freelancer's experience level in the database
    await prisma.user.update({
      where: { id: freelancerId },
      data: { experience: newExperienceLevel }
    });
    
    return newExperienceLevel;
  },

  /**
   * Recalculates a freelancer's rating after new data is available
   * (new posts, new AI ratings, or new client ratings)
   */
  async updateFreelancerRating(freelancerId: string): Promise<void> {
    // Recalculate the combined rating
    await this.getFreelancerCombinedRating(freelancerId);
    
    // Update the experience level based on the new rating
    await this.updateFreelancerExperienceLevel(freelancerId);
    
    // We could store this combined rating in a separate table for quick access
    // but for now we'll just calculate it on demand
  }
};

/**
 * Gets all relevant rating data for a freelancer
 */
async function getFreelancerRatingData(freelancerId: string): Promise<FreelancerRatingData> {
  // Get the freelancer
  const freelancer = await prisma.user.findUnique({
    where: { id: freelancerId },
    select: {
      experience: true
    }
  });
  
  if (!freelancer) {
    throw new Error("Freelancer not found");
  }
  
  // Get AI ratings for the freelancer's posts
  const aiRatings = await prisma.aIRating.findMany({
    where: { freelancerId },
    select: {
      overallAIScore: true
    }
  });
  
  // Get client ratings
  const clientRatings = await prisma.rating.findMany({
    where: { freelancerId },
    select: {
      overallScore: true
    }
  });
  
  // Count total posts and client projects
  const totalPosts = await prisma.post.count({
    where: { creatorId: freelancerId }
  });
  
  const totalClientProjects = await prisma.project.count({
    where: { 
      freelancerId,
      status: "COMPLETED"
    }
  });
  
  return {
    aiRatings,
    clientRatings,
    experience: freelancer.experience || "BEGINNER",
    totalPosts,
    totalClientProjects
  };
}

/**
 * Calculates a weighted combined score based on all available rating information
 */
function calculateCombinedScore(ratingData: FreelancerRatingData): number {
  // Calculate average AI rating score
  const averageAIScore = ratingData.aiRatings.length > 0
    ? ratingData.aiRatings.reduce((sum, rating) => sum + rating.overallAIScore, 0) / ratingData.aiRatings.length
    : 0;
  
  // Calculate average client rating score
  const averageClientScore = ratingData.clientRatings.length > 0
    ? ratingData.clientRatings.reduce((sum, rating) => sum + rating.overallScore, 0) / ratingData.clientRatings.length
    : 0;
  
  // Determine weights based on the freelancer's situation
  let aiWeight = 0.6;
  let clientWeight = 0.4;
  
  // If there are no client ratings, AI ratings get full weight
  if (ratingData.clientRatings.length === 0) {
    aiWeight = 1;
    clientWeight = 0;
  } 
  // As more client ratings accumulate, they should carry more weight
  else if (ratingData.clientRatings.length >= 5) {
    aiWeight = 0.3;
    clientWeight = 0.7;
  } else if (ratingData.clientRatings.length >= 10) {
    aiWeight = 0.2;
    clientWeight = 0.8;
  }
  
  // Calculate combined score
  let combinedScore = 0;
  
  if (aiWeight > 0 && averageAIScore > 0) {
    combinedScore += averageAIScore * aiWeight;
  }
  
  if (clientWeight > 0 && averageClientScore > 0) {
    combinedScore += averageClientScore * clientWeight;
  }
  
  // If no ratings at all, provide a baseline score
  if (combinedScore === 0) {
    // New users with no posts or client work start at a modest score
    combinedScore = 5.0;
  }
  
  // Apply activity bonus
  // More posts and completed projects should slightly boost the score
  const activityBonus = Math.min(0.5, (ratingData.totalPosts * 0.05) + (ratingData.totalClientProjects * 0.1));
  combinedScore = Math.min(10, combinedScore + activityBonus);
  
  return parseFloat(combinedScore.toFixed(1));
}