// app/lib/services/job-matching-service.ts
import { prisma } from "@/lib/prisma";
import { Experience } from "@prisma/client";
import { combinedRatingService } from "./combined-rating-service";
import { analyzeSkillMatch } from "./mock-ai-service";

type MatchedFreelancer = {
  id: string;
  name: string;
  profileImage: string | null;
  bio: string | null;
  experience: Experience;
  combinedRating: number;
  matchScore: number;
  tags: string[];
  skills: string | null;
  completedProjects: number;
};

export const jobMatchingService = {
  /**
   * Finds the best-matched freelancers for a job based on ratings and experience
   */
  async findMatchesForJob(jobId: string, limit: number = 10): Promise<MatchedFreelancer[]> {
    // Get the job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        difficultyLevel: true,
        title: true,
        requirements: true,
        description: true,
        client: {
          select: {
            id: true
          }
        }
      }
    });

    if (!job) {
      throw new Error("Job not found");
    }

    // Find freelancers that match the job's difficulty level
    const matchingFreelancers = await findMatchingFreelancers(job);
    
    // Get the top matches based on combined score and relevance
    const topMatches = await rankFreelancers(matchingFreelancers, job, limit);
    
    return topMatches;
  },

  /**
   * Notifies matched freelancers about a new job
   */
  async notifyMatchedFreelancers(jobId: string): Promise<void> {
    const matches = await this.findMatchesForJob(jobId, 20);
    
    // In a real app, you'd send emails, push notifications, or create in-app notifications
    // For this prototype, we'll just simulate it

    // Get job details for the notification
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        title: true,
        id: true
      }
    });

    if (!job) return;

    // For each matched freelancer, create a notification
    // This could be replaced with a real notification system
    for (const freelancer of matches) {
      console.log(`Notifying freelancer ${freelancer.id} about job ${jobId}`);
      
      // Here you would typically:
      // 1. Send an email notification
      // 2. Create an in-app notification
      // 3. Send a push notification if you have a mobile app
    }
  },

  /**
   * Matches a job to freelancers based on their skills and the job requirements
   */
  async analyzeJobSkillMatch(jobId: string, freelancerId: string): Promise<number> {
    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        title: true,
        requirements: true,
        description: true,
      }
    });

    // Get freelancer skills and portfolio
    const freelancer = await prisma.user.findUnique({
      where: { id: freelancerId },
      select: {
        skills: true,
        bio: true,
        posts: {
          select: {
           
            description: true,
            tags: true,
          },
          take: 3, // Just use the 3 most recent posts for analysis
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!job || !freelancer) return 0;

    // Create portfolio text for analysis
    const portfolioText = freelancer.posts
      .map(post =>  ":" + post.description.substring(0, 200))
      .join('\n');

    // Use mock skill matching service
    return analyzeSkillMatch(
      {
        title: job.title,
        requirements: job.requirements,
        description: job.description || ""
      },
      {
        skills: freelancer.skills,
        bio: freelancer.bio,
        portfolio: [portfolioText]
      }
    );
  }
};

/**
 * Finds freelancers that match the job's difficulty level or higher
 */
async function findMatchingFreelancers(job: any): Promise<any[]> {
  // Define which experience levels can take on which job difficulties
  const eligibleExperiences: Record<Experience, Experience[]> = {
    "BEGINNER": ["BEGINNER"],
    "INTERMEDIATE": ["BEGINNER", "INTERMEDIATE"],
    "ADVANCED": ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
  };

  // Find all freelancers that have the appropriate experience level for this job
  const freelancers = await prisma.user.findMany({
    where: {
      userType: "FREELANCER",
      experience: {
        in: eligibleExperiences[job.difficultyLevel as Experience]
      }
    },
    select: {
      id: true,
      name: true,
      profileImage: true,
      bio: true,
      experience: true,
      skills: true,
      posts: {
        select: {
          tags: true
        }
      },
      freelancerProjects: {
        where: {
          status: "COMPLETED"
        },
        select: {
          id: true
        }
      }
    }
  });

  // Enrich the freelancer data with calculated fields
  const enrichedFreelancers = await Promise.all(
    freelancers.map(async (freelancer) => {
      // Calculate combined rating
      const combinedRating = await combinedRatingService.getFreelancerCombinedRating(freelancer.id);
      
      // Collect all tags from posts for later relevance matching
      const allTags = Array.from(
        new Set(
          freelancer.posts.flatMap(post => post.tags || [])
        )
      );
      
      return {
        id: freelancer.id,
        name: freelancer.name,
        profileImage: freelancer.profileImage,
        bio: freelancer.bio,
        experience: freelancer.experience,
        combinedRating,
        tags: allTags,
        skills: freelancer.skills,
        completedProjects: freelancer.freelancerProjects.length
      };
    })
  );

  return enrichedFreelancers;
}

/**
 * Ranks freelancers based on their match score for a job
 */
async function rankFreelancers(freelancers: any[], job: any, limit: number): Promise<MatchedFreelancer[]> {
  // Calculate match scores for all freelancers
  const scoredFreelancers = await Promise.all(
    freelancers.map(async (freelancer) => {
      // Calculate a relevance score based on required skills and job description
      const relevanceScore = await calculateRelevanceScore(freelancer, job);
      
      // Factor in the freelancer's experience level
      const experienceWeight = {
        "BEGINNER": 0.7,
        "INTERMEDIATE": 0.85,
        "ADVANCED": 1.0
      }[freelancer.experience as Experience] ;
      
      // Factor in completion rate and past projects
      const projectBonus = Math.min(0.5, freelancer.completedProjects * 0.05);
      
      // Calculate final match score using a weighted formula
      // Weight: 50% combined rating, 40% relevance, 10% experience level
      const matchScore = (
        (freelancer.combinedRating * 0.5) + 
        (relevanceScore * 0.4) + 
        (experienceWeight * 0.1) +
        projectBonus
      );
      
      return {
        ...freelancer,
        matchScore: parseFloat(matchScore.toFixed(1))
      };
    })
  );
  
  // Sort by match score (descending)
  const rankedFreelancers = scoredFreelancers.sort((a, b) => b.matchScore - a.matchScore);
  
  // Return the top matches
  return rankedFreelancers.slice(0, limit);
}

/**
 * Calculates a relevance score between a freelancer and a job
 */
async function calculateRelevanceScore(freelancer: any, job: any): Promise<number> {
  // Simple keyword matching (more sophisticated approaches could be used)
  const jobKeywords = extractKeywords(job.title + " " + job.requirements);
  const freelancerKeywords = [
    ...extractKeywords(freelancer.skills || ""),
    ...extractKeywords(freelancer.bio || ""),
    ...freelancer.tags
  ];
  
  // Count matching keywords
  const matchingKeywords = jobKeywords.filter(keyword => 
    freelancerKeywords.some(fKeyword => 
      fKeyword.toLowerCase().includes(keyword.toLowerCase()) || 
      keyword.toLowerCase().includes(fKeyword.toLowerCase())
    )
  );
  
  // Calculate a base score from keyword matches
  let relevanceScore = matchingKeywords.length / Math.max(1, jobKeywords.length);
  
  // Normalize to a 0-10 scale
  relevanceScore = Math.min(10, relevanceScore * 10);

  // Use mock skill match for more sophisticated analysis
  try {
    // If we have enough keywords to do a basic match, use mock service to enhance the scoring
    if (matchingKeywords.length > 0) {
      const mockScore = analyzeSkillMatch(
        {
          title: job.title,
          requirements: job.requirements,
          description: job.description || ""
        },
        {
          skills: freelancer.skills,
          bio: freelancer.bio,
          portfolio: freelancer.tags
        }
      );

      // Blend the mock score with the keyword score (70% mock, 30% keywords)
      relevanceScore = (mockScore * 0.7) + (relevanceScore * 0.3);
    }
  } catch (error) {
    console.error("Error calculating mock relevance score:", error);
    // Continue with just the keyword score
  }
  
  return Math.min(10, relevanceScore);
}

/**
 * Extracts potential keywords from text
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Remove common stop words and punctuation
  const stopWords = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", 
    "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", 
    "between", "both", "but", "by", "could", "did", "do", "does", "doing", "down", 
    "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", 
    "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", 
    "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", 
    "into", "is", "it", "it's", "its", "itself", "let's", "me", "more", "most", "my", 
    "myself", "nor", "of", "on", "once", "only", "or", "other", "ought", "our", "ours", 
    "ourselves", "out", "over", "own", "same", "she", "she'd", "she'll", "she's", 
    "should", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", 
    "them", "themselves", "then", "there", "there's", "these", "they", "they'd", 
    "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", 
    "until", "up", "very", "was", "we", "we'd", "we'll", "we're", "we've", "were", 
    "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", 
    "who's", "whom", "why", "why's", "with", "would", "you", "you'd", "you'll", 
    "you're", "you've", "your", "yours", "yourself", "yourselves"
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  // Return unique words
  return Array.from(new Set(words));
}