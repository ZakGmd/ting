'use client';

import { useState, useEffect, useTransition } from 'react';
import { followUser, unfollowUser, checkFollowStatus } from '@/actions/follow/followActions';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FollowButtonProps {
  userId: string;
  variant?: 'default' | 'slim';
  className?: string;
}

export default function FollowButton({ 
  userId, 
  variant = 'default',
  className = ''
}: FollowButtonProps) {
  const { user, loading } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Only check status if we have a user and we're checking a different user
    if (user && user.id !== userId) {
      checkFollowStatus(userId)
        .then((result) => {
          if (result.success) {
            setIsFollowing(result.isFollowing || false);
          }
        })
        .catch((error) => {
          console.error('Error checking follow status:', error);
        })
        .finally(() => {
          setIsCheckingStatus(false);
        });
    } else {
      setIsCheckingStatus(false);
    }
  }, [user, userId]);

  const handleFollowToggle = () => {
    if (!user || loading || isCheckingStatus) return;
    
    startTransition(async () => {
      try {
        const action = isFollowing ? unfollowUser : followUser;
        const result = await action(userId);
        
        if (result.success) {
          setIsFollowing(!isFollowing);
        } else {
          console.error(result.error);
        }
      } catch (error) {
        console.error('Error toggling follow status:', error);
      }
    });
  };

  // Don't show button if user is not logged in or viewing own profile
  if (loading || !user || user.id === userId) {
    return null;
  }

  // Sizes and styles based on variant
  const buttonClasses = variant === 'default'
    ? `px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${className}`
    : `p-2 rounded-full ${className}`;
  
  const iconSize = variant === 'default' ? 18 : 16;
  
  return (
    <button
      onClick={handleFollowToggle}
      disabled={isPending || isCheckingStatus}
      className={`${buttonClasses} ${
        isFollowing
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
          : 'bg-[#fc7348]/10 text-[#fc7348] hover:bg-[#fc7348]/20'
      } transition-colors`}
    >
      {isPending || isCheckingStatus ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className={variant === 'default' ? "w-5 h-5" : "w-4 h-4"} />
          {variant === 'default' && <span>Unfollow</span>}
        </>
      ) : (
        <>
          <UserPlus className={variant === 'default' ? "w-5 h-5" : "w-4 h-4"} />
          {variant === 'default' && <span>Follow</span>}
        </>
      )}
    </button>
  );
} 