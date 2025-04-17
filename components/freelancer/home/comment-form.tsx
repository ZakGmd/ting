'use client';

import { useState, useTransition } from 'react';
import { addComment, PostWithUser } from '@/actions/freelancer/freelancerActions';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { Send } from 'lucide-react';

interface CommentFormProps {
  postId: string;
  onCommentAdded?: (updatedPost: PostWithUser) => void;
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { user, loading } = useAuth();
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !comment.trim()) return;
    
    startTransition(async () => {
      const result = await addComment(postId, comment);
      
      if (result.success) {
        setComment(''); // Clear the input
        
        // Notify parent component if needed
        if (onCommentAdded && result.post) {
          onCommentAdded(result.post as PostWithUser);
        }
      } else {
        console.error('Failed to add comment:', result.error);
      }
    });
  };

  if (loading) {
    return <div className="animate-pulse h-14 bg-gray-700/20 rounded-lg"></div>;
  }

  if (!user) {
    return (
      <div className="p-3 text-center bg-gray-800/20 rounded-lg text-sm">
        <a href="/signin" className="text-[#fc7348] hover:underline">Sign in</a> to add a comment
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2 p-3 border border-white/10 backdrop-blur-md rounded-lg">
      <div className="w-8 h-8 bg-black/50 rounded-full overflow-hidden flex-shrink-0">
        {user.image ? (
          <Image
            src={user.image}
            width={32}
            height={32}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
            {user.name.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="flex-1 relative">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full min-h-[40px] max-h-24 bg-black/30 border border-white/10 rounded-lg p-2 text-sm resize-none focus:outline-none focus:border-[#fc7348]/50"
          disabled={isPending}
        />
        
        <button 
          type="submit" 
          className={`absolute right-2 bottom-2 rounded-full p-1.5 ${
            comment.trim() && !isPending ? 'bg-[#fc7348]/40 hover:bg-[#fc7348]/70' : 'bg-gray-700/30 cursor-not-allowed'
          } transition-colors`}
          disabled={!comment.trim() || isPending}
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  );
} 