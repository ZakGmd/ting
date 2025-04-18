"use client"
import { PostWithUser } from "@/actions/freelancer/freelancerActions";
import { useState, useOptimistic } from "react";
import Post from "./post";
import CreatePostForm from "./post-form";


export interface FeedProps {
  initialPosts: PostWithUser[];
  user: User | null;
}   
export interface User {
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

export default function Feed({initialPosts, user}: FeedProps) {
     const [posts, setPosts] = useState<PostWithUser[]>(initialPosts);
      
      
      const [optimisticPosts, addOptimisticPost] = useOptimistic<
        PostWithUser[],
        PostWithUser
      >(posts, (state, newPost) => [newPost, ...state]);
    
     
      const handlePostCreated = (newPost: PostWithUser) => {
        
        addOptimisticPost(newPost);
   
        setPosts(prev => {
         
          const exists = prev.some(post => post.id === newPost.id);
          if (exists) {
          
            return prev.map(post => post.id === newPost.id ? newPost : post);
          } else {
          
            return [newPost, ...prev];
          }
        });
      };
    return(

        <>
          <div className="Feed flex flex-col items-start overflow-y-auto pt-10   w-full ">
            <div className="flex flex-col items-start w-full">
                {user && <CreatePostForm 
                 user={user} 
                 onPostCreated={handlePostCreated} 
                />}
                <div className="w-full h-[2px] shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.3px_0.65px_rgba(255,255,255,0.10)]"></div>
            </div>
            <div className="flex flex-col items-start w-full mt-4 ">
                                      <div className="px-4.5 flex items-center justify-between w-full">
                                          <div>Recent Activity</div>
                                          <div>view</div>
                                      </div>
                                       {optimisticPosts.length === 0 ? (
                                                      <div className="w-full py-10 text-center text-gray-500">
                                                         No posts yet. Be the first to post!
                                                      </div>
                                                      ) : (
                                                      <div className="w-full  ">
                                                      {optimisticPosts.map((post) => (
                                                       <Post 
                                                       key={post.id} 
                                                       post={post} 
                                                       user={user}
                                                       onPostUpdated={(updatedPost) => {
                                                         setPosts(current => 
                                                           current.map(p => p.id === updatedPost.id ? updatedPost : p)
                                                         );
                                                       }}
                                                     />
                                                      ))}
                                                      </div>
                                                      )}
                                      
            </div>
           </div>
        
        </>
    )
}