// app/lib/services/mock-ai-service.ts

/**
 * This service provides mock AI functionality for development and testing
 * when an OpenAI API key is unavailable or has exceeded quota
 */

// Mock sentiment analysis with realistic scores
export function analyzeSentiment(text: string): { score: number; analysis: string } {
    if (!text || text.trim().length === 0) {
      return { score: 5, analysis: "Neutral sentiment detected." };
    }
  
    // Simplified sentiment analysis based on positive and negative words
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'outstanding', 'superb', 'brilliant', 'impressive', 'love', 'best',
      'beautiful', 'perfect', 'awesome', 'helpful', 'thank', 'thanks',
      'appreciate', 'happy', 'pleased', 'satisfied', 'joy', 'professional'
    ];
  
    const negativeWords = [
      'bad', 'poor', 'terrible', 'awful', 'horrible', 'disappointing',
      'frustrating', 'mediocre', 'worst', 'waste', 'unhappy', 'disappointed',
      'issue', 'problem', 'fail', 'failed', 'failure', 'error', 'mistake',
      'unprofessional', 'delay', 'delayed', 'late', 'slow', 'rude'
    ];
  
    const text_lower = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
  
    // Count positive and negative words
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text_lower.match(regex);
      if (matches) positiveCount += matches.length;
    });
  
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text_lower.match(regex);
      if (matches) negativeCount += matches.length;
    });
  
    // Calculate sentiment score (1-10 scale)
    let score: number;
    let analysis: string;
  
    // No sentiment words found
    if (positiveCount === 0 && negativeCount === 0) {
      score = 5;
      analysis = "Neutral sentiment detected with no strong positive or negative indicators.";
    } 
    // Only positive words
    else if (positiveCount > 0 && negativeCount === 0) {
      score = Math.min(5 + positiveCount * 1.5, 10);
      analysis = "Positive sentiment detected, expressing satisfaction and approval.";
    } 
    // Only negative words
    else if (negativeCount > 0 && positiveCount === 0) {
      score = Math.max(5 - negativeCount * 1.5, 1);
      analysis = "Negative sentiment detected, expressing dissatisfaction or concerns.";
    } 
    // Mixed sentiment
    else {
      const ratio = positiveCount / (positiveCount + negativeCount);
      score = 1 + ratio * 9; // Scale to 1-10
      analysis = "Mixed sentiment detected with both positive and negative elements.";
    }
  
    return { 
      score: parseFloat(score.toFixed(1)), 
      analysis 
    };
  }
  
  // Mock content quality analysis
  export function analyzeContentQuality(content: string): number {
    if (!content || content.trim().length === 0) {
      return 0;
    }
  
    // Simple heuristics for content quality based on length, structure, etc.
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let score = 5; // Start with a neutral score
  
    // Length factors
    if (words.length < 10) {
      score -= 1;
    } else if (words.length >= 50 && words.length < 200) {
      score += 1;
    } else if (words.length >= 200) {
      score += 2;
    }
  
    // Sentence length variety (indicates more sophisticated writing)
    const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length);
    const uniqueSentenceLengths = new Set(sentenceLengths).size;
    
    if (uniqueSentenceLengths >= 3) {
      score += 1;
    }
  
    // Check for formatting elements that suggest structured content
    if (content.includes('* ') || content.includes('- ') || content.includes('1. ')) {
      score += 1;
    }
  
    // Check for technical or specialized vocabulary (simplified)
    const technicalTerms = [
      'implement', 'develop', 'design', 'architecture', 'framework', 'system',
      'protocol', 'interface', 'algorithm', 'function', 'method', 'analysis',
      'integration', 'optimization', 'project', 'solution', 'application'
    ];
    
    const content_lower = content.toLowerCase();
    const hasTechnicalTerms = technicalTerms.some(term => 
      new RegExp(`\\b${term}\\b`, 'i').test(content_lower)
    );
    
    if (hasTechnicalTerms) {
      score += 1;
    }
  
    // Ensure score is within 1-10 range
    return Math.min(Math.max(score, 1), 10);
  }
  
  // Mock skill matching analysis
  export function analyzeSkillMatch(
    jobDetails: { title: string; requirements: string; description: string },
    freelancerDetails: { skills: string | null; bio: string | null; portfolio: string[] }
  ): number {
    if (!jobDetails.requirements || 
        (!freelancerDetails.skills && !freelancerDetails.bio && freelancerDetails.portfolio.length === 0)) {
      return 5; // Not enough information, return neutral score
    }
  
    // Extract keywords from job details
    const jobKeywords = extractKeywords(
      `${jobDetails.title} ${jobDetails.requirements} ${jobDetails.description}`
    );
  
    // Extract keywords from freelancer details
    const skillsKeywords = extractKeywords(freelancerDetails.skills || "");
    const bioKeywords = extractKeywords(freelancerDetails.bio || "");
    const portfolioKeywords = freelancerDetails.portfolio.flatMap(p => extractKeywords(p));
  
    // Combine all freelancer keywords
    const freelancerKeywords = [...new Set([...skillsKeywords, ...bioKeywords, ...portfolioKeywords])];
  
    // Count matching keywords
    let matchCount = 0;
    for (const jobKeyword of jobKeywords) {
      if (freelancerKeywords.some(fk => 
        fk.includes(jobKeyword) || jobKeyword.includes(fk)
      )) {
        matchCount++;
      }
    }
  
    // Calculate match percentage
    const matchPercentage = jobKeywords.length > 0 
      ? matchCount / jobKeywords.length 
      : 0;
  
    // Convert to 1-10 scale
    let score = 5 + (matchPercentage * 5);
  
    // Adjust for keyword density
    if (freelancerKeywords.length > 30) {
      score += 0.5; // Bonus for extensive skills/description
    }
  
    // Ensure score is within 1-10 range
    return Math.min(Math.max(parseFloat(score.toFixed(1)), 1), 10);
  }
  
  // Helper function to extract keywords from text
  function extractKeywords(text: string): string[] {
    if (!text) return [];
    
    // Common stop words to filter out
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can', 'could',
      'may', 'might', 'must', 'in', 'of', 'with', 'about', 'against', 'between',
      'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from',
      'up', 'down', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 
      'it', 'we', 'they', 'who', 'whom', 'whose', 'which', 'what', 'my', 'our',
      'your', 'his', 'her', 'its', 'their'
    ]);
  
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
      .split(/\s+/)               // Split by whitespace
      .filter(word => 
        word.length > 2 &&        // Skip very short words
        !stopWords.has(word) &&   // Skip stop words
        !/^\d+$/.test(word)       // Skip pure numbers
      );
  }