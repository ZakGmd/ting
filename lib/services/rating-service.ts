// app/lib/services/rating-service.ts

import { prisma } from "@/lib/prisma";
import { combinedRatingService } from "./combined-rating-service";

export type ClientRatingInput = {
  projectId: string;
  clientId: string;
  freelancerId: string;
  deliveryScore: number;  // 1-10 rating on delivery timeliness
  qualityScore: number;   // 1-10 rating on work quality
  communicationScore: number; // 1-10 rating on communication
  comments?: string;      // Optional feedback comments
};

export const ratingService = {
  /**
   * Creates a new rating from a client to a freelancer
   */
  async createRating(ratingData: ClientRatingInput) {
    // Validate the scores (ensure they're between 1-10)
    const validatedData = {
      ...ratingData,
      deliveryScore: Math.min(10, Math.max(1, ratingData.deliveryScore)),
      qualityScore: Math.min(10, Math.max(1, ratingData.qualityScore)),
      communicationScore: Math.min(10, Math.max(1, ratingData.communicationScore)),
    };

    // Calculate the overall score (average of the three scores)
    const overallScore = parseFloat(
      ((validatedData.deliveryScore + 
        validatedData.qualityScore + 
        validatedData.communicationScore) / 3).toFixed(1)
    );

    // Create the rating
    const rating = await prisma.rating.create({
      data: {
        projectId: validatedData.projectId,
        clientId: validatedData.clientId,
        freelancerId: validatedData.freelancerId,
        deliveryScore: validatedData.deliveryScore,
        qualityScore: validatedData.qualityScore,
        communicationScore: validatedData.communicationScore,
        overallScore,
        comments: validatedData.comments,
      },
    });

    // Update the project status to completed
    await prisma.project.update({
      where: { id: validatedData.projectId },
      data: { status: "COMPLETED" },
    });

    // Update the freelancer's combined rating
    await combinedRatingService.updateFreelancerRating(validatedData.freelancerId);

    return rating;
  },

  /**
   * Gets all ratings for a specific freelancer
   */
  async getFreelancerRatings(freelancerId: string) {
    return prisma.rating.findMany({
      where: { freelancerId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        project: {
          select: {
            id: true,
            job: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Gets the average rating scores for a freelancer
   */
  async getFreelancerAverageRatings(freelancerId: string) {
    const ratings = await prisma.rating.findMany({
      where: { freelancerId },
      select: {
        deliveryScore: true,
        qualityScore: true,
        communicationScore: true,
        overallScore: true,
      },
    });

    if (ratings.length === 0) {
      return {
        averageDeliveryScore: 0,
        averageQualityScore: 0,
        averageCommunicationScore: 0,
        averageOverallScore: 0,
        totalRatings: 0,
      };
    }

    const totalRatings = ratings.length;
    const averageDeliveryScore = parseFloat(
      (ratings.reduce((sum, rating) => sum + rating.deliveryScore, 0) / totalRatings).toFixed(1)
    );
    const averageQualityScore = parseFloat(
      (ratings.reduce((sum, rating) => sum + rating.qualityScore, 0) / totalRatings).toFixed(1)
    );
    const averageCommunicationScore = parseFloat(
      (ratings.reduce((sum, rating) => sum + rating.communicationScore, 0) / totalRatings).toFixed(1)
    );
    const averageOverallScore = parseFloat(
      (ratings.reduce((sum, rating) => sum + rating.overallScore, 0) / totalRatings).toFixed(1)
    );

    return {
      averageDeliveryScore,
      averageQualityScore,
      averageCommunicationScore,
      averageOverallScore,
      totalRatings,
    };
  },

  /**
   * Gets ratings given by a specific client
   */
  async getClientGivenRatings(clientId: string) {
    return prisma.rating.findMany({
      where: { clientId },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        project: {
          select: {
            id: true,
            job: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Checks if a client has already rated a specific project
   */
  async hasClientRatedProject(projectId: string, clientId: string): Promise<boolean> {
    const rating = await prisma.rating.findFirst({
      where: {
        projectId,
        clientId,
      },
    });

    return !!rating;
  },

  /**
   * Gets a rating by project ID
   */
  async getRatingByProject(projectId: string) {
    return prisma.rating.findUnique({
      where: { projectId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });
  },

  /**
   * Updates an existing rating
   */
  async updateRating(
    ratingId: string,
    data: {
      deliveryScore?: number;
      qualityScore?: number;
      communicationScore?: number;
      comments?: string;
    }
  ) {
    // Validate the scores
    const validatedData = {
      ...data,
      deliveryScore: data.deliveryScore
        ? Math.min(10, Math.max(1, data.deliveryScore))
        : undefined,
      qualityScore: data.qualityScore
        ? Math.min(10, Math.max(1, data.qualityScore))
        : undefined,
      communicationScore: data.communicationScore
        ? Math.min(10, Math.max(1, data.communicationScore))
        : undefined,
    };

    // Get the current rating to calculate the new overall score
    const currentRating = await prisma.rating.findUnique({
      where: { id: ratingId },
      select: {
        deliveryScore: true,
        qualityScore: true,
        communicationScore: true,
        freelancerId: true,
      },
    });

    if (!currentRating) {
      throw new Error("Rating not found");
    }

    // Calculate the new overall score
    const newDeliveryScore = validatedData.deliveryScore ?? currentRating.deliveryScore;
    const newQualityScore = validatedData.qualityScore ?? currentRating.qualityScore;
    const newCommunicationScore = validatedData.communicationScore ?? currentRating.communicationScore;

    const overallScore = parseFloat(
      ((newDeliveryScore + newQualityScore + newCommunicationScore) / 3).toFixed(1)
    );

    // Update the rating
    const updatedRating = await prisma.rating.update({
      where: { id: ratingId },
      data: {
        deliveryScore: validatedData.deliveryScore,
        qualityScore: validatedData.qualityScore,
        communicationScore: validatedData.communicationScore,
        overallScore: overallScore,
        comments: validatedData.comments,
      },
    });

    // Update the freelancer's combined rating
    await combinedRatingService.updateFreelancerRating(currentRating.freelancerId);

    return updatedRating;
  },

  /**
   * Gets the top-rated freelancers based on client ratings
   */
  async getTopRatedFreelancers(limit: number = 10) {
    // Get all freelancers with their average ratings
    const freelancers = await prisma.user.findMany({
      where: { 
        userType: "FREELANCER",
        receivedRatings: {
          some: {}  // At least one rating
        }
      },
      select: {
        id: true,
        name: true,
        profileImage: true,
        experience: true,
        bio: true,
        receivedRatings: {
          select: {
            overallScore: true
          }
        }
      },
      take: limit * 3  // Get more than we need to filter
    });

    // Calculate average rating for each freelancer
    const freelancersWithRating = freelancers.map(freelancer => {
      const ratings = freelancer.receivedRatings;
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.overallScore, 0) / ratings.length
        : 0;

      return {
        ...freelancer,
        averageRating
      };
    });

    // Sort by average rating and take the top ones
    const topRated = freelancersWithRating
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);

    return topRated;
  }
};