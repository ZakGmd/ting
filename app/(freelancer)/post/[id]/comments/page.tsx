'use client';

import { useEffect, useState } from 'react';
import { getComments, getPosts, PostWithUser } from '@/actions/freelancer/freelancerActions';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CommentForm from '@/components/freelancer/home/comment-form';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    profileImage: string | null;
    displayName: string | null;
    experience: string | null;
  };
}

export default function CommentsPage({ params }: { params: { id: string } }) {
  const postId = params.id;
  const [post, setPost] = useState<PostWithUser | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Get the post
        const posts = await getPosts();
        const currentPost = posts.find(p => p.id === postId);
        if (currentPost) {
          setPost(currentPost);
        }

        // Get comments
        const result = await getComments(postId);
        if (result.success) {
          setComments(result.comments);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [postId]);

  const handleCommentAdded = (updatedPost: PostWithUser) => {
    setPost(updatedPost);
    // Reload comments
    getComments(postId).then(result => {
      if (result.success) {
        setComments(result.comments);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen p-4 max-w-2xl mx-auto">
        <div className="h-6 w-24 bg-gray-700/20 animate-pulse rounded mb-6"></div>
        <div className="h-36 bg-gray-700/10 animate-pulse rounded-lg mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-700/20 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen p-4 max-w-2xl mx-auto">
        <Link href="/home" className="flex items-center gap-2 text-[#fc7348] mb-6">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="p-6 text-center bg-black/40 rounded-lg">
          Post not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-2xl mx-auto">
      <Link href="/home" className="flex items-center gap-2 text-[#fc7348] mb-6">
        <ArrowLeft size={16} /> Back to home
      </Link>

      {/* Post summary */}
      <div className="border border-white/10 rounded-lg p-4 mb-6 bg-black/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-black/50 rounded-full overflow-hidden">
            {post.creator.image ? (
              <Image
                src={post.creator.image}
                width={40}
                height={40}
                alt={post.creator.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
                {post.creator.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{post.creator.displayName || post.creator.name}</h2>
            <p className="text-sm text-gray-400 truncate max-w-[250px]">{post.description}</p>
          </div>
        </div>
      </div>

      {/* Comment form */}
      <div className="mb-6">
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Comments ({comments.length})</h2>
        
        {comments.length === 0 ? (
          <div className="p-6 text-center bg-black/20 rounded-lg text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="border border-white/10 rounded-lg p-4 bg-black/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-black/50 rounded-full overflow-hidden flex-shrink-0">
                  {comment.user.image ? (
                    <Image
                      src={comment.user.image}
                      width={32}
                      height={32}
                      alt={comment.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
                      {comment.user.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{comment.user.displayName || comment.user.name}</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 