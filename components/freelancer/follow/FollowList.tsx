'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { 
  getFollowers, 
  getFollowing, 
  followUser, 
  unfollowUser 
} from '@/actions/follow/followActions';
import type { UserWithFollowStatus } from '@/actions/follow/followActions';
import { UserPlus, UserMinus, Loader2, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const experienceColors: Record<string, string> = {
  BEGINNER: 'bg-green-500/10 text-green-500',
  INTERMEDIATE: 'bg-yellow-500/10 text-yellow-500',
  ADVANCED: 'bg-purple-500/10 text-purple-500',
};

type TabType = 'followers' | 'following';

interface FollowListProps {
  userId: string;
  initialTab?: TabType;
}

export default function FollowList({ userId, initialTab = 'followers' }: FollowListProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [users, setUsers] = useState<UserWithFollowStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const fetchUsers = useCallback(async (type: TabType, append = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const offset = append ? page * limit : 0;
      
      if (type === 'followers') {
        const result = await getFollowers(userId, limit, offset);
        if (result.success && result.followers) {
          if (append) {
            setUsers(prev => [...prev, ...result.followers]);
          } else {
            setUsers(result.followers);
          }
          setHasMore(result.followers.length === limit);
        } else {
          setError(result.error || 'Failed to fetch followers');
        }
      } else {
        const result = await getFollowing(userId, limit, offset);
        if (result.success && result.following) {
          if (append) {
            setUsers(prev => [...prev, ...result.following]);
          } else {
            setUsers(result.following);
          }
          setHasMore(result.following.length === limit);
        } else {
          setError(result.error || 'Failed to fetch following');
        }
      }
      
      if (append) {
        setPage(prev => prev + 1);
      } else {
        setPage(0);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setError(`An error occurred while fetching ${type}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId, page, limit]);

  useEffect(() => {
    fetchUsers(activeTab);
  }, [activeTab, fetchUsers]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchUsers(activeTab, true);
    }
  };

  const handleFollow = (userId: string, isFollowing: boolean) => {
    startTransition(async () => {
      try {
        const action = isFollowing ? unfollowUser : followUser;
        const res = await action(userId);
        
        if (res.success) {
          // Update the UI optimistically
          setUsers((prev) => 
            prev.map((user) => 
              user.id === userId 
                ? { ...user, isFollowing: !isFollowing } 
                : user
            )
          );
        } else {
          console.error(res.error);
        }
      } catch (error) {
        console.error('Error following/unfollowing user:', error);
      }
    });
  };

  const getExperienceLabel = (experience: string | null) => {
    if (!experience) return null;
    
    return (
      <Badge variant="custom" className={experienceColors[experience] || 'bg-gray-500/10 text-gray-500'}>
        {experience.charAt(0) + experience.slice(1).toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-4">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'followers'
              ? 'text-[#fc7348] border-b-2 border-[#fc7348]'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('followers')}
        >
          Followers
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'following'
              ? 'text-[#fc7348] border-b-2 border-[#fc7348]'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('following')}
        >
          Following
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && users.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && users.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12">
          <Users className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-300 text-lg">No {activeTab} yet</p>
          {activeTab === 'followers' ? (
            <p className="text-gray-400 text-sm mt-2">
              When people follow you, they&apos;ll appear here
            </p>
          ) : (
            <p className="text-gray-400 text-sm mt-2">
              You&apos;ll see the people you follow here
            </p>
          )}
        </div>
      )}

      {/* User list */}
      {users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="p-4 rounded-lg bg-black/20 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#fc7348]/20 flex items-center justify-center">
                      <span className="text-[#fc7348] font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/profile/${user.id}`}
                    className="text-white font-medium hover:text-[#fc7348] transition-colors"
                  >
                    {user.displayName || user.name}
                  </Link>
                  <p className="text-gray-400 text-sm truncate">
                    {user.bio ? (
                      <span className="truncate">{user.bio}</span>
                    ) : (
                      <span className="italic">No bio</span>
                    )}
                  </p>
                  <div className="mt-1">
                    {getExperienceLabel(user.experience)}
                  </div>
                </div>
                
                <button
                  onClick={() => handleFollow(user.id, user.isFollowing)}
                  className={`ml-2 p-2 rounded-full transition-colors ${
                    user.isFollowing 
                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                      : 'bg-[#fc7348]/10 text-[#fc7348] hover:bg-[#fc7348]/20'
                  }`}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : user.isFollowing ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
          
          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-4 py-2 text-sm rounded-md bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Load more'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 