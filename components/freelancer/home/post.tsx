'use client';

import { MoreHorizontal, Heart, MessageCircle, Repeat2, BarChart2, Bookmark, Share, X, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { PostWithUser, toggleLike, getComments, addComment } from "@/actions/freelancer/freelancerActions";
import { useState, useTransition, useRef, useOptimistic, useEffect } from "react";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  profileImage?: string | null;
  displayName?: string | null;
  experience?: string | null;
  type?: "FREELANCER" | "CLIENT";
  profileCompleted?: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
    profileImage?: string | null;
    displayName?: string | null;
    experience?: string | null;
    type?: "FREELANCER" | "CLIENT";
    profileCompleted?: boolean;
  };
}

interface PostProps {
  post: PostWithUser;
  user: User | null; 
  onPostUpdated?: (updatedPost: PostWithUser) => void;
}

export default function Post({ post, user, onPostUpdated }: PostProps) {
  const [isPending, startTransition] = useTransition();
  const [currentPost, setCurrentPost] = useState<PostWithUser>(post);
  const [expanded, setExpanded] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [isAddingComment, setIsAddingComment] = useState(false);
  
  // Check if the current user has already liked this post
  const [initialLikeState, setInitialLikeState] = useState<boolean>(() => {
    if (!user?.id) return false;
    return post.likes.some(like => like.userId  === user.id);
  });
  
  // Optimistic UI for comments
  const [optimisticComments, addOptimisticComment] = useOptimistic<
    Comment[],
    { content: string; user: Comment['user'] }
  >(
    commentsList,
    (state, newCommentData) => [
      {
        id: `optimistic-${Date.now()}`,
        content: newCommentData.content,
        createdAt: new Date().toISOString(),
        user: newCommentData.user,
      },
      ...state,
    ]
  );
  
  // Optimistic UI for likes
  const [optimisticLikes, addOptimisticLike] = useOptimistic<
    PostWithUser['likes'],
    { add: boolean }
  >(
    currentPost.likes,
    (state, { add }) => {
      if (add) {
        // Add like
        return [...state, { id: `optimistic-${Date.now()}`, userId: user?.id || '' }];
      } else {
        // Remove like
        return state.filter(like => !('userId' in like) || like.userId !== user?.id);
      }
    }
  );
  
  // Update the post when it changes from props
  useEffect(() => {
    setCurrentPost(post);
    
    // Check if user has liked this post whenever the post changes
    if (user?.id) {
      const hasLiked = post.likes.some(like => like.id === user.id);
      setInitialLikeState(hasLiked);
    }
  }, [post, user?.id]);
  
  // Check if post is liked based on optimistic likes or initial state
  const isOptimisticallyLiked = user?.id ? 
    optimisticLikes.some(like => 'userId' in like && like.userId === user.id) || initialLikeState : 
    false;
  
  const {
    id,
    description,
    mediaUrls,
    creator,
    createdAt,
    comments: commentCount,
    views,
  } = currentPost;

  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  const userProfileUrl = `/profile/${creator.id}`;
  const postUrl = `/post/${id}`;
  const userImage = creator.profileImage || creator.image;
  const displayName = creator.displayName || creator.name || 'Anonymous';
  const isPro = creator.experience === 'ADVANCED';

  const handleLike = () => {
    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    startTransition(() => {
      // Toggle the initial like state
      setInitialLikeState(!initialLikeState);
      
      // Apply optimistic update within the transition
      addOptimisticLike({ add: !isOptimisticallyLiked });
      
      // Execute the server action
      toggleLike(id).then(result => {
        if (result.success && result.post) {
          // Update post with server data
          setCurrentPost(result.post as PostWithUser);
          
          // Notify parent if needed
          if (onPostUpdated) {
            onPostUpdated(result.post as PostWithUser);
          }
        } else {
          // Revert to original post state on error
          console.error("Failed to toggle like:", result.error);
          setCurrentPost(post);
          setInitialLikeState(!initialLikeState); // Revert the like state
        }
      }).catch(error => {
        console.error("Error toggling like:", error);
        // Revert to original post state on error
        setCurrentPost(post);
        setInitialLikeState(!initialLikeState); // Revert the like state
      });
    });
  };
  
  const toggleComments = () => {
    if (!expanded) {
      loadComments();
    }
    setExpanded(!expanded);
  };
  
  const loadComments = () => {
    setCommentsLoading(true);
    getComments(id).then(result => {
      if (result.success && Array.isArray(result.comments)) {
        const formattedComments = result.comments.map(comment => ({
          ...comment,
          createdAt: comment.createdAt.toISOString()
        }));
        setCommentsList(formattedComments);
      } else {
        setCommentsList([]);
      }
      setCommentsLoading(false);
    });
  };
  
  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !newComment || isAddingComment) return;

    startTransition(() => {
      // Add optimistic update within the transition
      if (user) {
        addOptimisticComment({
          content: newComment,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
            profileImage: user.profileImage,
            displayName: user.displayName,
            experience: user.experience,
            type: user.type,
            profileCompleted: user.profileCompleted
          }
        });
      }
    });

    // Store comment text and clear input for better UX
    const commentText = newComment.trim();
    setNewComment("");
    
    setIsAddingComment(true);
    
    try {
      const result = await addComment(id, commentText);
      
      // Update post if successful
      if (result.success && result.post) {
        setCurrentPost(result.post as PostWithUser);
        
        // Load fresh comments from server to sync
        loadComments();
        
        // Notify parent if needed
        if (onPostUpdated) {
          onPostUpdated(result.post as PostWithUser);
        }
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsAddingComment(false);
    }
  };

  return(
    <article className="flex flex-col w-full">
      <div className="px-4 w-full flex mt-4">
        <div className="border-[0.5px] w-full border-black overflow-hidden rounded-xl bg-black/70">
          <div className="flex flex-col">
            <div className="flex items-start justify-between px-3 py-2">
              <div className="flex items-center gap-3">
                <Link href={userProfileUrl}>
                  <div className="w-10 h-10 bg-black/50 rounded-full overflow-hidden">
                    {userImage ? (
                      <Image
                        src={userImage}
                        width={40}
                        height={40}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white">
                        {displayName?.charAt(0) || 'A'}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5">
                    <Link href={userProfileUrl} className="font-bold hover:underline cursor-pointer">
                      {displayName}
                    </Link>
                    {isPro && (
                      <div className="px-2.5 py-0.5 leading-normal bg-[#fc7348]/35 font-semibold rounded-full text-xs">
                        Pro
                      </div>
                    )}
                  </div>
                  <span className="text-gray-500">{formattedDate}</span>
                </div>
              </div>
              
              <div className="rounded-full h-8 w-8 flex justify-end text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            </div>
    
            <div className="flex flex-col">
              <Link href={postUrl}>
                <div className="px-4 pb-3">
                  <p>{description}</p>
                </div>
              </Link>
              
              {mediaUrls && mediaUrls.length > 0 && (
                <div className="overflow-hidden">
                  <Image
                    src={mediaUrls[0]}
                    width={600}
                    height={400}
                    alt={`Image for post`}
                    className="w-full object-cover max-h-[400px]"
                  />
                </div>
              )}
            
              <div className="flex justify-between bg-gradient-to-b from-transparent to-[#fc7348]/10 to-[120%] py-6 px-5 text-gray-500">
                <button 
                  className={`flex items-center gap-2 ${isOptimisticallyLiked ? 'text-red-500' : 'hover:text-red-500'} transition-colors`}
                  onClick={handleLike}
                  disabled={isPending}
                >
                  <Heart className={`w-4 h-4 ${isOptimisticallyLiked ? 'fill-red-500' : ''}`} />
                  <span className="text-xs">{optimisticLikes.length}</span>
                </button>
                <button 
                  className={`flex items-center gap-2 ${expanded ? 'text-blue-500' : 'hover:text-blue-500'} transition-colors`}
                  onClick={toggleComments}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">{commentCount.length}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-500">
                  <Repeat2 className="w-4 h-4" />
                  <span className="text-xs">10</span>
                </button>
              
                <button className="flex items-center gap-2 hover:text-blue-500">
                  <BarChart2 className="w-4 h-4" />
                  <span className="text-xs">{views}</span>
                </button>
                <div className="flex items-center gap-4">
                  <button className="hover:text-blue-500">
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button className="hover:text-blue-500">
                    <Share className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Expanded comments section */}
              {expanded && (
                <div className="border-t border-white/10 px-3 py-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold">Comments ({commentCount.length})</h3>
                    <button 
                      onClick={() => setExpanded(false)}
                      className="p-1 hover:bg-gray-800/40 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Comment form */}
                  {user ? (
                    <form onSubmit={handleAddComment} className="flex items-start gap-2 mb-4">
                      <div className="w-7 h-7 bg-black/50 rounded-full overflow-hidden flex-shrink-0">
                        {user.image ? (
                          <Image
                            src={user.image}
                            width={28}
                            height={28}
                            alt={user.name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-xs">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 relative">
                        <textarea
                          ref={commentInputRef}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full min-h-[36px] max-h-24 bg-black/30 border border-white/10 rounded-lg p-2 text-sm resize-none focus:outline-none focus:border-[#fc7348]/50"
                          disabled={isPending}
                        />
                        
                        <button 
                          type="submit" 
                          className={`absolute right-2 bottom-2 rounded-full p-1 ${
                            newComment.trim() && !isPending ? 'bg-[#fc7348]/40 hover:bg-[#fc7348]/70' : 'bg-gray-700/30 cursor-not-allowed'
                          } transition-colors`}
                          disabled={!newComment.trim() || isPending}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-2 text-center bg-gray-800/20 rounded-lg text-sm mb-4">
                      <Link href="/sign-in" className="text-[#fc7348] hover:underline">Sign in</Link> to add a comment
                    </div>
                  )}
                  
                  {/* Comments list */}
                  <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {commentsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="animate-pulse h-16 bg-gray-700/20 rounded-lg"></div>
                        ))}
                      </div>
                    ) : optimisticComments.length === 0 ? (
                      <div className="p-3 text-center bg-black/20 rounded-lg text-gray-400 text-sm">
                        No comments yet. Be the first to comment!
                      </div>
                    ) : (
                      optimisticComments.map(comment => (
                        <div key={comment.id} className="border border-white/5 rounded-lg p-3 bg-black/20">
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 bg-black/50 rounded-full overflow-hidden flex-shrink-0">
                              {comment.user.image ? (
                                <Image
                                  src={comment.user.image}
                                  width={28}
                                  height={28}
                                  alt={comment.user.name || 'User'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-700 text-white text-xs">
                                  {comment.user.name?.charAt(0) || 'U'}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs">{comment.user.displayName || comment.user.name || 'Anonymous'}</span>
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-4 h-[2px] shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.3px_0.65px_rgba(255,255,255,0.10)]"></div>
    </article>
  );
}