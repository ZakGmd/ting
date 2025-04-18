'use client';

import { XIcon, ImageIcon, Gift, BarChart2, Smile, Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useTransition  } from "react";
import { createPost, PostWithUser } from "@/actions/freelancer/freelancerActions";
import { User } from "./feed";




interface CreatePostFormProps {
  user: User;
  onPostCreated: (post: PostWithUser) => void;
}


export default function CreatePostForm({ user, onPostCreated }: CreatePostFormProps) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setMediaFiles(prev => [...prev, ...newFiles]);
    
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setMediaPreviews(prev => [...prev, ...newPreviews]);
  };
  
  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      // Add all media files to the form data
      if (mediaFiles.length > 0) {
        // Clear existing media from the form data which might have been added by the file input
        formData.delete('media');
        mediaFiles.forEach(file => {
          formData.append('media', file);
        });
      }
      
      // Add title from text if missing
      if (!formData.get('title')) {
        const text = formData.get('text') as string;
        if (text) {
          // Use first line or first 50 chars as title
          const title = text.split('\n')[0].substring(0, 50);
          formData.set('title', title);
        }
      }
      
      const result = await createPost(formData);
      
      if (result.success && result.post) {
        // Ensure post data has the correct structure before updating UI
        const postWithFullLikes = {
          ...result.post,
          likes: result.post.likes.map(like => ({
            id: like.id,
            userId: like.userId || ''
          }))
        };
        
        // Notify parent component of the new post for optimistic updates
        onPostCreated(postWithFullLikes);
        
        // Reset form and state
        formRef.current?.reset();
        setMediaFiles([]);
        
        // Revoke all object URLs
        mediaPreviews.forEach(url => URL.revokeObjectURL(url));
        setMediaPreviews([]);
      }
    });
  };
  
  return (
    <form 
      ref={formRef}
      action={handleSubmit}
      className="PostForm p-4 backdrop-blur-2xl rounded-b-lg w-[765px]"
    >
      <div className="flex gap-4">
        <div className="w-10 h-10 bg-white/2 rounded-full overflow-hidden">
          {user?.image ? (
            <Image 
              src={user.profileImage || user.image}  
              alt={user.name || "User"} 
              width={40} 
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-white text-sm">{user?.name?.charAt(0) || 'U'}</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="mb-4 space-y-3">
            
            <input
              name="text"
              placeholder="What's happening?"
              className="w-full bg-transparent text-md placeholder-gray-500 focus:outline-none  resize-none"
              required
            />
            
            
            {mediaPreviews.length > 0 && (
              <div className="media-preview-container grid grid-cols-2 gap-2 mt-2">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <Image 
                      src={preview}
                      alt={`Media preview ${index + 1}`}
                      width={300}
                      height={200}
                      className="rounded-lg max-h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 flex items-center justify-center bg-[#fc7348]/13 border-[0.5px] border-white/10 rounded-full p-1"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2 text-blue-500">
              <label className={`p-2 hover:bg-[#fc7348]/10 rounded-full cursor-pointer ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  name="media"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaChange}
                  disabled={isPending}
                />
                <ImageIcon strokeWidth={1} className="w-5 h-5 text-[#fc7348]" />
              </label>
              <button type="button" className="p-2 hover:bg-[#fc7348]/10 rounded-full" disabled={isPending}>
                <Gift strokeWidth={1} className="w-5 h-5 text-[#fc7348]" />
              </button>
              <button type="button" className="p-2 hover:bg-[#fc7348]/10 rounded-full" disabled={isPending}>
                <BarChart2 strokeWidth={1} className="w-5 h-5 text-[#fc7348]" />
              </button>
              <button type="button" className="p-2 hover:bg-[#fc7348]/10 rounded-full" disabled={isPending}>
                <Smile strokeWidth={1} className="w-5 h-5 text-[#fc7348]" />
              </button>
              <button type="button" className="p-2 hover:bg-[#fc7348]/10 rounded-full" disabled={isPending}>
                <Calendar strokeWidth={1} className="w-5 h-5 text-[#fc7348]" />
              </button>
              <button type="button" className="p-2 hover:bg-[#fc7348]/10 rounded-full" disabled={isPending}>
                <MapPin strokeWidth={1} className="w-5 h-5 text-[#fc7348]" />
              </button>
            </div>
            <button
              type="submit"
              className={`rounded-md px-3 py-1 text-[14px] ${isPending 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-[#fc7348]/35 text-white/50 hover:text-white hover:bg-[#fc7348]/90 cursor-pointer'
              } transition-all duration-300`}
              disabled={isPending}
            >
              {isPending ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
} 