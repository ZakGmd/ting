// app/lib/services/ai-rating-service.ts
import { prisma } from "@/lib/prisma";
import { analyzeContentQuality, analyzeSentiment } from "./mock-ai-service";

export type PostAnalysisResult = {
  engagementScore: number;
  contentQualityScore: number;
  mediaQualityScore: number;
  commentSentimentScore: number;
  authenticityScore: number;
  overallAIScore: number;
};

export const aiRatingService = {
  /**
   * Analyzes a post and its engagement metrics to generate an AI rating
   */
  async analyzePost(postId: string): Promise<PostAnalysisResult> {
    // Fetch the post with related data
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        likes: true,
        comments: {
          include: {
            user: true,
          },
        },
        creator: true,
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Calculate engagement score based on likes, comments, and views
    const likesCount = post.likes.length;
    const commentsCount = post.comments.length;
    const viewsCount = post.views;
    
    // Engagement rate calculation (weighted)
    const engagementRate = (likesCount * 1.5 + commentsCount * 3) / 
      (viewsCount > 0 ? viewsCount : 1);
    
    // Normalize to a 0-10 scale
    const engagementScore = Math.min(10, engagementRate * 10);

    // Content quality analysis (description length, details, clarity)
    const contentQualityScore = analyzeContentQuality(post.description);

    // Media quality score (based on media count and types)
    const mediaQualityScore = post.mediaUrls.length > 0 ? 
      calculateMediaQualityScore(post.mediaUrls) : 0;

    // Comment sentiment analysis
    const commentSentimentScore = commentsCount > 0 ? 
      await analyzePostComments(post.comments.map(c => c.content)) : 5;

    // Authenticity detection (for preventing fake engagement)
    const authenticityScore = detectAuthenticEngagement(post);

    // Calculate overall score (weighted average)
    const overallAIScore = calculateOverallScore({
      engagementScore,
      contentQualityScore,
      mediaQualityScore,
      commentSentimentScore,
      authenticityScore,
      overallAIScore: 0 // Placeholder
    });

    // Create the complete result object
    const result: PostAnalysisResult = {
      engagementScore,
      contentQualityScore,
      mediaQualityScore,
      commentSentimentScore,
      authenticityScore,
      overallAIScore
    };

    // Save the AI rating to the database
    await saveAIRating(post.id, post.creatorId, result);

    return result;
  }
};

/**
 * Calculates media quality score based on media URLs
 */
function calculateMediaQualityScore(mediaUrls: string[]): number {
  if (mediaUrls.length === 0) return 0;
  
  // Basic score based on number of media items (more is better, up to a point)
  let score = Math.min(mediaUrls.length * 1.5, 8);
  
  // Analyze media types (videos might be worth more than images)
  const videoCount = mediaUrls.filter(url => 
    url.endsWith('.mp4') || 
    url.endsWith('.mov') || 
    url.includes('youtube.com') || 
    url.includes('vimeo.com')
  ).length;
  
  // Bonus for having videos (which often contain more information)
  if (videoCount > 0) {
    score += Math.min(videoCount, 2);
  }
  
  // Ensure score is within range
  return Math.min(score, 10);
}

/**
 * Analyzes comment sentiment using the mock service
 */
async function analyzePostComments(comments: string[]): Promise<number> {
  if (comments.length === 0) {
    return 5; // Neutral score for no comments
  }
  
  // Analyze each comment separately
  const sentimentScores = comments.map(comment => 
    analyzeSentiment(comment).score
  );
  
  // Calculate average sentiment score
  const averageScore = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
  
  return averageScore;
}

/**
 * Detects potentially fake or manipulated engagement
 */
function detectAuthenticEngagement(post: any): number {
  // Simple heuristics for authenticity
  const likesCount = post.likes.length;
  const commentsCount = post.comments.length;
  const viewsCount = post.views || 1;
  
  // Unrealistic engagement ratios might indicate fake engagement
  // Typical social media engagement rates are <10% for likes and <1% for comments
  const likeRatio = likesCount / viewsCount;
  const commentRatio = commentsCount / viewsCount;
  
  let authenticityScore = 8; // Start with benefit of the doubt
  
  // Penalize for suspiciously high engagement
  if (likeRatio > 0.5) {
    authenticityScore -= Math.min(likeRatio * 5, 3);
  }
  
  if (commentRatio > 0.3) {
    authenticityScore -= Math.min(commentRatio * 10, 3);
  }
  
  // Ensure score stays within range
  return Math.min(Math.max(authenticityScore, 1), 10);
}

/**
 * Calculates the overall AI score using a weighted average
 */
function calculateOverallScore(scores: PostAnalysisResult): number {
  // Define weights for each component
  const weights = {
    engagementScore: 0.25,
    contentQualityScore: 0.30,
    mediaQualityScore: 0.15,
    commentSentimentScore: 0.20,
    authenticityScore: 0.10
  };
  
  // Calculate weighted average
  const weightedSum = 
    scores.engagementScore * weights.engagementScore +
    scores.contentQualityScore * weights.contentQualityScore +
    scores.mediaQualityScore * weights.mediaQualityScore +
    scores.commentSentimentScore * weights.commentSentimentScore +
    scores.authenticityScore * weights.authenticityScore;
  
  return parseFloat(weightedSum.toFixed(1));
}

/**
 * Saves the AI rating to the database
 */
async function saveAIRating(
  postId: string, 
  freelancerId: string, 
  scores: PostAnalysisResult
): Promise<void> {
  await prisma.aIRating.upsert({
    where: {
      postId: postId
    },
    update: {
      engagementScore: scores.engagementScore,
      contentQualityScore: scores.contentQualityScore,
      mediaQualityScore: scores.mediaQualityScore,
      commentSentimentScore: scores.commentSentimentScore,
      authenticityScore: scores.authenticityScore,
      overallAIScore: scores.overallAIScore
    },
    create: {
      postId: postId,
      freelancerId: freelancerId,
      engagementScore: scores.engagementScore,
      contentQualityScore: scores.contentQualityScore,
      mediaQualityScore: scores.mediaQualityScore,
      commentSentimentScore: scores.commentSentimentScore,
      authenticityScore: scores.authenticityScore,
      overallAIScore: scores.overallAIScore
    }
  });
}