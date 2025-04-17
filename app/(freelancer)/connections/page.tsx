'use client';

import { useAuth } from '@/hooks/useAuth';
import FollowList from '@/components/freelancer/follow/FollowList';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConnectionsContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') as 'followers' | 'following' | null;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-white">Please sign in to view connections</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Your Connections</h1>
        <p className="text-gray-400">Manage your followers and the people you follow</p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <FollowList userId={user.id} initialTab={tab || 'followers'} />
        </div>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    }>
      <ConnectionsContent />
    </Suspense>
  );
} 