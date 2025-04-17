import { EB_Garamond, Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, User } from "lucide-react";
import { useState, useEffect } from "react";

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
const inter = Inter({ subsets: ["latin"] });

const footerItems = {
  main: [
    { label: 'About', path: '/about' },
    { label: 'Help Centre', path: '/help' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Cookie Policy', path: '/cookies' },
    { label: 'Accessibility', path: '/accessibility' },
  ],
};

interface SetupProfileFormProps {
  formData: {
    displayName: string;
    location: string;
    website: string;
    profileAvatar: File | null;
    coverImage: File | null;
    image: string | File | null;
    profileImageUrl?: string;
    coverImageUrl?: string;
  };
  updateFormData: (data: Partial<SetupProfileFormProps['formData']>) => void;
  onBack: () => void;
  onComplete: () => void;
  submitting?: boolean;
  error?: string;
}

export default function SetupProfileForm({ 
  formData, 
  updateFormData, 
  onBack, 
  onComplete, 
  submitting = false,
  error = ""
}: SetupProfileFormProps) {
  const [errors, setErrors] = useState({
    displayName: "",
    profileAvatar: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize previews if we already have files
  useEffect(() => {
    if (formData.profileAvatar && !avatarPreview) {
      setAvatarPreview(URL.createObjectURL(formData.profileAvatar));
    }
    
    if (formData.coverImage && !coverPreview) {
      setCoverPreview(URL.createObjectURL(formData.coverImage));
    }
  }, [formData.profileAvatar, formData.coverImage, avatarPreview, coverPreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData({ 
      [name]: value 
    });
    
    // Clear the error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'profileAvatar' | 'coverImage') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Update state with the file
      updateFormData({
        [fileType]: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fileType === 'profileAvatar') {
          setAvatarPreview(reader.result as string);
          // Clear error if it exists
          if (errors.profileAvatar) {
            setErrors(prev => ({
              ...prev,
              profileAvatar: ""
            }));
          }
        } else {
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Upload file to server
      await uploadFile(file, fileType);
    }
  };

  // Optimized file upload function
  const uploadFile = async (file: File, fileType: 'profileAvatar' | 'coverImage') => {
    try {
      setIsUploading(true);
      
      // Prepare FormData for file upload
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      // Generate a unique filename
      const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      
      // Upload the file
      const response = await fetch(`/api/upload?filename=${filename}`, {
        method: 'POST',
        body: uploadData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Store the URL in the appropriate field
          if (fileType === 'profileAvatar') {
            // For profile image, we need to update both fields to keep them in sync
            updateFormData({ 
              profileImageUrl: data.url,
              // Also update image field for NextAuth compatibility 
              image: data.url
            });
          } else {
            updateFormData({ coverImageUrl: data.url });
          }
        } else {
          console.error('File upload failed:', data.error);
        }
      } else {
        console.error('File upload request failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
      valid = false;
    }
    
    if (!formData.profileAvatar && !formData.profileImageUrl) {
      newErrors.profileAvatar = "Profile picture is required";
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && !isUploading) {
      onComplete();
    }
  };

  return (
    <div className={`${inter.className} h-[calc(100vh-20px)] flex flex-col items-center mx-auto justify-between bg-gradient-to-r from-[#1D1D1F] to-transparent text-white py-7 rounded-2xl`}>
      <div className="w-full px-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to space setup</span>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col mt-4 w-[448px]">
        <div className={`mb-8 ${garamond.className} text-3xl text-center`}>Set up your profile</div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm">
            {error}
          </div>
        )}
        
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {avatarPreview ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#fc7348]/60">
                  <Image 
                    src={avatarPreview} 
                    alt="Profile preview" 
                    width={96} 
                    height={96} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)]">
                  <User size={40} strokeWidth={1} className="text-white/50" />
                </div>
              )}
              <label htmlFor="profileAvatar" className={`absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#fc7348]/15 backdrop-blur-sm cursor-pointer hover:bg-[#fc7348]/25 transition-all duration-300 border-[0.5px] border-white/10 ${isUploading ? 'opacity-50' : ''}`}>
                {isUploading ? (
                  <div className="w-3 h-3 border-t-2 border-white rounded-full animate-spin"></div>
                ) : (
                  <Upload size={14} />
                )}
                <input 
                  type="file" 
                  id="profileAvatar" 
                  name="profileAvatar"
                  onChange={(e) => handleFileChange(e, 'profileAvatar')}
                  className="hidden" 
                  accept="image/*"
                  disabled={isUploading}
                />
              </label>
            </div>
            {errors.profileAvatar && <p className="text-[#fc7348] text-xs mt-1">{errors.profileAvatar}</p>}
            <p className="text-sm text-white/70">Upload profile picture</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="displayName" className="text-sm text-white/70">Display Name</label>
            <input 
              type="text" 
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] outline-none"
              placeholder="How you'll appear on the platform"
            />
            {errors.displayName && <p className="text-[#fc7348] text-xs mt-1">{errors.displayName}</p>}
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="text-sm text-white/70">Location (Optional)</label>
            <input 
              type="text" 
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] outline-none"
              placeholder="City, Country"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="website" className="text-sm text-white/70">Website (Optional)</label>
            <input 
              type="url" 
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] outline-none"
              placeholder="https://your-website.com"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-white/70">Cover Image (Optional)</label>
            <div 
              className={`w-full h-32 rounded-xl shadow-[inset_0.4px_0.4px_1.2px_rgba(0,0,0,0.7),inset_-0.4px_0px_1.2px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)]  bg-gradient-to-b from-transparent to-[#fc7348]/20 from-[19%] to-[230%] flex items-center justify-center cursor-pointer overflow-hidden ${
                coverPreview ? 'border-[#fc7348]/60 p-0' : 'border-white/30 p-2'
              } ${isUploading ? 'opacity-70' : ''}`}
            >
              <label htmlFor="coverImage" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                {coverPreview ? (
                  <Image 
                    src={coverPreview}
                    alt="Cover preview" 
                    width={400}
                    height={128}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <>
                    {isUploading ? (
                      <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin mb-2"></div>
                    ) : (
                      <Upload size={24} className="mb-2 text-white/50" />
                    )}
                    <span className="text-sm text-white/70">
                      {isUploading ? 'Uploading...' : 'Click to upload cover image'}
                    </span>
                  </>
                )}
                <input 
                  type="file" 
                  id="coverImage" 
                  name="coverImage"
                  onChange={(e) => handleFileChange(e, 'coverImage')}
                  className="hidden" 
                  accept="image/*"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={submitting || isUploading}
            className={`px-3 h-11 w-full mt-1 mb-4 text-[18px] border text-white text-center flex items-center justify-center rounded-3xl border-black bg-[#fc7348]/60 font-light cursor-pointer hover:bg-[#fc7348] hover:bg-gradient-to-b hover:from-transparent transition-all duration-300 hover:shadow-[0px_0.4px_0px_rgba(0,0,0,0.4),inset_0px_2px_0px_rgba(0,0,0,0.10)] active:shadow-[0px_0.1px_0px_rgba(252,115,72,0.01),inset_0px_5px_0px_rgba(0,0,0,0.10)] shadow-[0_1.1px_2px_rgba(0,0,0,0.65),inset_0px_0.7px_0px_rgba(255,255,255,0.15)] ${
              (submitting || isUploading) ? 'opacity-70 cursor-not-allowed' : ''
            }`}>
            {submitting ? 'Completing Setup...' : isUploading ? 'Uploading Files...' : 'Complete Setup'}
          </button>
        </div>
      </form>

      <div>
        <ul className="items-center gap-3 flex">
          {footerItems.main.map((item, index) => (
            <li key={index}>
              <Link href={item.path} className="hover:underline text-white/30 text-[14px]">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}