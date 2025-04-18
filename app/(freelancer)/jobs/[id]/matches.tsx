// app/(dashboard)/jobs/[id]/matches/page.tsx
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
import { BriefcaseIcon, CheckCircleIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import JobMatches from '@/components/freelancer/jobMatches';

export default async function JobMatchesPage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/sign-in');
  }
  
  const userId = session.user.id;
  
  // Fetch the job
  const job = await prisma.job.findUnique({
    where: {
      id: params.id,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      applications: {
        select: { id: true },
      },
    },
  });
  
  // Redirect if job not found
  if (!job) {
    redirect('/jobs');
  }
  
  // Redirect if not the job owner
  if (job.clientId !== userId) {
    redirect('/jobs');
  }
  
  // Helper function to get difficulty badge color
  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ADVANCED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Helper function to get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const inviteFreelancer = async (freelancerId: string) => {
    // In a real app, this would send an invitation or notification
    // For now, we'll just simulate it
    console.log(`Inviting freelancer ${freelancerId} to job ${job.id}`);
  };
  
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/jobs" className="text-sm text-purple-600 hover:underline mb-4 inline-block">
          &larr; Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold mb-4">AI-Matched Freelancers</h1>
        <p className="text-gray-600 mb-6">
          Our AI has matched these freelancers based on your job requirements, their skills, and ratings.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div>
          <div className="pb-2">
            <div className="text-base font-medium text-gray-500">Job Title</div>
          </div>
          <div>
            <div className="flex items-start space-x-3">
              <BriefcaseIcon className="h-5 w-5 text-purple-500 mt-1" />
              <span className="text-lg font-medium">{job.title}</span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="pb-2">
            <div className="text-base font-medium text-gray-500">Difficulty</div>
          </div>
          <div>
            <Badge variant="outline" className={`px-3 py-1 ${getDifficultyBadgeColor(job.difficultyLevel)}`}>
              {job.difficultyLevel.charAt(0) + job.difficultyLevel.slice(1).toLowerCase()}
            </Badge>
          </div>
        </div>
        
        <div>
          <div className="pb-2">
            <div className="text-base font-medium text-gray-500">Applications</div>
          </div>
          <div>
            <div className="flex items-start space-x-3">
              <UsersIcon className="h-5 w-5 text-purple-500 mt-1" />
              <span className="text-lg font-medium">{job.applications.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-purple-800">Match quality indicators</h3>
            <p className="text-purple-700 text-sm mt-1">
              Freelancers are ranked by our AI based on their skills, portfolio quality, 
              client ratings, and other factors. A match score above 8.0 indicates an excellent fit.
            </p>
          </div>
        </div>
      </div>
      
      <JobMatches jobId={params.id} onSelectFreelancer={inviteFreelancer} />
    </div>
  );
}