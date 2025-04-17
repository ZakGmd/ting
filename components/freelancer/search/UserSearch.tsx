'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { searchUsers, followUser, unfollowUser } from '@/actions/follow/followActions';
import type { UserWithFollowStatus } from '@/actions/follow/followActions';
import { Search, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const experienceColors: Record<string, string> = {
  BEGINNER: 'bg-green-500/10 text-green-500',
  INTERMEDIATE: 'bg-yellow-500/10 text-yellow-500',
  ADVANCED: 'bg-purple-500/10 text-purple-500',
};

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserWithFollowStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide results when route changes
  useEffect(() => {
    setShowResults(false);
  }, [pathname]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const handler = setTimeout(() => {
      setIsLoading(true);
      searchUsers(query, true)
        .then((res) => {
          if (res.success && res.users) {
            setResults(res.users);
            setError(null);
          } else {
            setResults([]);
            setError(res.error || 'Failed to search users');
          }
        })
        .catch((err) => {
          setResults([]);
          setError('An error occurred while searching');
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const handleFollow = (userId: string, isFollowing: boolean) => {
    startTransition(async () => {
      try {
        const action = isFollowing ? unfollowUser : followUser;
        const res = await action(userId);
        
        if (res.success) {
          // Update the UI optimistically
          setResults((prev) => 
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
    <div className="relative w-full max-w-md mx-auto " ref={searchRef}>
      <div className="relative flex gap-1 px-3 py-1 items-center  mt-2.5 rounded-lg bg-white/1 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)]">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full py-1 pl-6 pr-4 text-sm rounded-lg outline-none  placeholder-gray-500 text-white"
          placeholder="Search freelancers..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length >= 2) {
              setShowResults(true);
            } else {
              setShowResults(false);
            }
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setShowResults(true);
            }
          }}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {showResults && (query.trim().length >= 2) && (
        <div className="absolute z-50 w-full mt-2 bg-[#1D1D1F]/70 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl overflow-hidden">
          {error && (
            <div className="p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!error && results.length === 0 && !isLoading && (
            <div className="p-4 text-gray-400 text-sm text-center">
              No freelancers found
            </div>
          )}

          {results.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              {results.map((user) => (
                <div key={user.id} className="p-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {user.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#fc7348]/20 flex items-center justify-center">
                          <span className="text-[#fc7348] font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/profile/${user.id}`}
                        className="text-white font-medium text-sm hover:text-[#fc7348] transition-colors"
                        onClick={() => setShowResults(false)}
                      >
                        {user.displayName || user.name}
                      </Link>
                      <p className="text-gray-400 text-xs truncate">
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
                      onClick={(e) => {
                        e.preventDefault();
                        handleFollow(user.id, user.isFollowing);
                      }}
                      className={`ml-2 p-1.5 rounded-full transition-colors ${
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
            </div>
          )}
        </div>
      )}
    </div>
  );
} 