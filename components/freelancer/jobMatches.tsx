// app/components/jobs/JobMatches.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserIcon, StarIcon, BriefcaseIcon, AwardIcon, BadgeCheckIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Experience } from '@prisma/client';
import Image from 'next/image';

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

type Props = {
  jobId: string;
  onSelectFreelancer: (freelancerId: string) => void;
};

export default function JobMatches({ jobId, onSelectFreelancer }: Props) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchedFreelancer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${jobId}/matches`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }
        
        const data = await response.json();
        setMatches(data.data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMatches();
  }, [jobId]);

  // Helper to get experience badge color
  const getExperienceBadgeColor = (experience: Experience) => {
    switch (experience) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-800';
      case 'ADVANCED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to render star ratings
  const renderStars = (score: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= score / 2 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm">{score.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
         LOADING
        </div>
        
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-600">
        Error loading matches: {error}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <UserIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
            <p className="mt-1 text-sm text-gray-500">
              We couldn't find any freelancers that match your job requirements.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {matches.length} Matched Freelancers
        </h2>
        <Badge variant="outline" className="px-3 py-1 bg-purple-50 text-purple-700 border-purple-200">
          AI Matched
        </Badge>
      </div>

      <div className="grid gap-4">
        {matches.map((freelancer) => (
          <div key={freelancer.id} className="overflow-hidden">
            <div className="pb-0">
              <div className="flex justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12">
                    <Image src={freelancer.profileImage || ''} alt={freelancer.name} width={48} height={48}  />
                    <div className="bg-purple-100 text-purple-700">
                      {freelancer.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-lg">{freelancer.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getExperienceBadgeColor(freelancer.experience)}>
                        {freelancer.experience.charAt(0) + freelancer.experience.slice(1).toLowerCase()}
                      </Badge>
                      {renderStars(freelancer.combinedRating)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-xl font-bold text-purple-600">{freelancer.matchScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">Match Score</div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {freelancer.bio || "This freelancer hasn't added a bio yet."}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {freelancer.tags.slice(0, 5).map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-50">
                    {tag}
                  </Badge>
                ))}
                {freelancer.tags.length > 5 && (
                  <Badge variant="outline" className="bg-gray-50">
                    +{freelancer.tags.length - 5} more
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-blue-50">
                    <StarIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{freelancer.combinedRating.toFixed(1)}/10</div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-green-50">
                    <BriefcaseIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{freelancer.completedProjects}</div>
                    <div className="text-xs text-gray-500">Completed Projects</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border-t">
              <div className="w-full flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/freelancers/${freelancer.id}`, '_blank')}
                >
                  View Profile
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onSelectFreelancer(freelancer.id)}
                >
                  Invite to Job
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}