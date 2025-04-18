import { auth } from "@/auth"; 
import { redirect } from "next/navigation";
import FollowList from '@/components/freelancer/follow/FollowList';

interface ConnectionsPageProps {
  searchParams: { tab?: 'followers' | 'following' }
}

export default async function ConnectionsPage({
  searchParams
}: ConnectionsPageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/sign-in'); 
  }
  
  const tab = searchParams.tab || 'followers';
  
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Your Connections</h1>
        <p className="text-gray-400">Manage your followers and the people you follow</p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <FollowList userId={session.user.id} initialTab={tab} />
        </div>
      </div>
    </div>
  );
}