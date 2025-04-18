// app/lib/ai.ts
import { openai } from '@ai-sdk/openai';

// Export the openai provider
export { openai };

// Helper function to check if the API key is configured
export function isAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}