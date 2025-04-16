"use client"

import { EB_Garamond, Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuthStatus, completeOAuthProfile, registerUser, setupOAuthUser } from "@/actions/auth";
import SetupSpaceForm from "@/components/signUp/setupSpaceForm";
import SetupProfileForm from "@/components/signUp/setupProfileForm";
import SignUpForm from "@/components/signUp/signUpForm";
import Login from "@/components/signUp/login";




const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-garamond',
});
const inter = Inter({ subsets: ["latin"] });

type ActionResponse = { success: true; userType: string; userId?: string } | { success: false; error: string };


export default function SignUp() {
  const router = useRouter();
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [oauthUserId, setOauthUserId] = useState("");

  useEffect(() => {
    const initAuth = async () => {
      try {
      
        const authStatus = await checkAuthStatus();
        
        // If OAuth user needs to complete profile
        if (authStatus.isAuthenticated && authStatus.needsProfileCompletion) {
          setIsOAuthUser(true);
          if (authStatus.userId) {
            setOauthUserId(authStatus.userId);
            
            
            await setupOAuthUser(authStatus.userId);
          }
          
          // Pre-fill name if available
          if (authStatus.userName) {
            setFormData(prev => ({
              ...prev,
              fullName: authStatus.userName || "",
              displayName: authStatus.userName || ""
              // We can add here the image also if we want 
            }));
          }
          
      
          setShowSignupForm(true);
          setSignupStep(2);
        } else if (authStatus.isAuthenticated) {
          if (authStatus.userType === "FREELANCER") {
            router.push("/home");
          } else {
            router.push("/client");
          }
        } 
      } catch (error) {
        console.error("Error during authentication check:", error);
        setError("Failed to check authentication status");
      }
    };
    
    initAuth();
  }, []);
  
  const [formData, setFormData] = useState({

    // Step 1: Basic account data
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    
    // Step 2: Space setup
    accountType: "freelancer",
    skills: "",
    bio: "",
    category: "",
    
    // Step 3: Profile setup
    displayName: "",
    location: "",
    website: "",
    image: null as string | File | null,
    profileAvatar: null as File | null,
    coverImage: null as File | null,
    
    // For file upload URLs
    profileImageUrl: "",
    coverImageUrl: "",
  });
  
  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  };
  
  const handleCreateAccount = () => {
    setShowSignupForm(true);
    setSignupStep(1);
  };
  
  const handleBackToLogin = () => {
    setShowSignupForm(false);
    setSignupStep(1);
  };

  const handleNextStep = () => {
    setSignupStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setSignupStep(prev => Math.max(prev - 1, 1));
  };
  
 const handleComplete = async () => {
  setSubmitting(true);
  setError("");
  
  try {

    const submitFormData = new FormData();
    
  
    submitFormData.append("fullName", formData.fullName);
    submitFormData.append("email", formData.email);
    
    // Only include password for new registrations, not OAuth users
    if (!isOAuthUser) {
      submitFormData.append("password", formData.password);
    }
    
    submitFormData.append("accountType", formData.accountType);
    submitFormData.append("skills", formData.skills || "");
    submitFormData.append("bio", formData.bio || "");
    submitFormData.append("category", formData.category || "");
    submitFormData.append("displayName", formData.displayName || formData.fullName);
    submitFormData.append("location", formData.location || "");
    submitFormData.append("website", formData.website || "");
    
    
    if (formData.profileImageUrl) {
      submitFormData.append("profileImageUrl", formData.profileImageUrl);
    }
    
    if (formData.coverImageUrl) {
      submitFormData.append("coverImageUrl", formData.coverImageUrl);
    }
    
    // Handle different submission paths for OAuth vs regular users
    let result: ActionResponse;
    if (isOAuthUser && oauthUserId) {
      result = await completeOAuthProfile(oauthUserId, submitFormData) as ActionResponse;
    } else {
      result = await registerUser(submitFormData) as ActionResponse;
    }
    
    if (result.success) {
      // Reset form
      setShowSignupForm(false);
      
      
      // Redirect based on user type
      if (result.userType === "FREELANCER") {
        router.push("/home");
      } else {
        router.push("/client");
      }
     
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
  } catch (err) {
    console.error("Registration error:", err);
    setError("An unexpected error occurred. Please try again.");
  } finally {
    setSubmitting(false);
    setSignupStep(1);
  }
};
  
  // Function to render the appropriate form based on the current step
  const renderForm = () => {
    if (!showSignupForm) {
      return <Login onCreateAccount={handleCreateAccount} />;
    }
    
    switch (signupStep) {
      case 1:
        return <SignUpForm 
          formData={formData} 
          updateFormData={updateFormData}
          onBack={handleBackToLogin} 
          onNext={handleNextStep} 
        />;
      case 2:
        return <SetupSpaceForm 
          formData={formData}
          updateFormData={updateFormData}
          onBack={handlePrevStep} 
          onNext={handleNextStep} 
        />;
      case 3:
        return <SetupProfileForm 
          formData={formData}
          updateFormData={updateFormData}
          onBack={handlePrevStep} 
          onComplete={handleComplete}
          submitting={submitting}
          error={error}
        />;
      default:
        return <SignUpForm 
          formData={formData}
          updateFormData={updateFormData}
          onBack={handleBackToLogin} 
          onNext={handleNextStep} 
        />;
    }
  };
    
  return (
    <div className={`flex overflow-hidden justify-between w-full items-center px-5 ${inter.className}  `}>
      <div className=" overflow-hidden   relative w-1/2  mt-[8px] h-[99vh] bg-gradient-to-b   to-[138%] rounded-t-[68px] to-[#fc7348]/80 -z-10  from-black">
        <div className="leftSide absolute inset-0 w-full h-full  bg-radial-[at_50%_28%] to-transparent  from-[10%] from-black -z-10   "></div>
        <svg style={{ display: "none" }}>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="6.29" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        </svg>
        <div className="flex flex-col items-center justify-center h-full w-full gap-8 pb-20  text-white">
            <div className="flex flex-col items-center gap-4">
               <div className={`font-Garamond text-[68px]   text-slate-100 font-garamond  ${garamond.className}`}>Tingle</div>
               <div className="flex flex-col items-center gap-1">
                <div className="text-3xl">Get Started with us</div>
                <div className="max-w-[240px] text-center text-[14px] font-light">Complete this easy steps to registre your account.</div>
               </div>
            </div>
            <div className="flex flex-col gap-3 ">
               <div className={`${signupStep === 1 ? 'backdrop-blur-lg shadow-[0_2px_7px_rgba(0,0,0,0.5),inset_0px_0.3px_0px_rgba(255,255,255,0.25)] from-white/5 to-[#fc7348]/10 ' : 'opacity-50'}  transition-all duration-300 ease-out px-4 w-[320px] py-3 flex items-center gap-2  rounded-2xl bg-gradient-to-r  `}>
                  <div className="flex text-center py-1 px-3 rounded-full text-[14px] bg-white/5 shadow-[0_0.3px_0px_rgba(0,0,0,1),inset_0px_0.5px_0.6px_rgba(255,255,255,0.30)]">1</div>
                  <div>Sign up your account</div>
               </div>
               <div className={` ${signupStep === 2 ? 'backdrop-blur-lg shadow-[0_2px_7px_rgba(0,0,0,0.5),inset_0px_0.3px_0px_rgba(255,255,255,0.25)] from-white/5 to-[#fc7348]/10' : 'opacity-50'} transition-all duration-300 ease-out px-4 w-[320px] py-3 flex items-center gap-2  rounded-2xl bg-gradient-to-r  `}>
                  <div className="flex text-center py-1 px-[11px] rounded-full  text-[14px] bg-white/5 shadow-[0_0.3px_0px_rgba(0,0,0,1),inset_0px_0.5px_0.6px_rgba(255,255,255,0.30)]">2</div>
                  <div>Set up your space</div>
               </div>
               <div className={` ${signupStep === 3 ? 'backdrop-blur-lg shadow-[0_2px_7px_rgba(0,0,0,0.5),inset_0px_0.3px_0px_rgba(255,255,255,0.25)] from-white/5 to-[#fc7348]/10' : 'opacity-50'} transition-all duration-300 ease-out px-4 w-[320px] py-3 flex items-center gap-2  rounded-2xl bg-gradient-to-r `}>
                  <div className="flex text-center py-1 px-[11px] rounded-full text-[14px] bg-white/5 shadow-[0_0.3px_0px_rgba(0,0,0,1),inset_0px_0.5px_0.6px_rgba(255,255,255,0.30)]">3</div>
                  <div>Set up your profile</div>
               </div>
              
            </div>
        </div>

      </div>  
      <div className="w-1/2 z-10 h-[100vh]  py-2 overflow-hidden bg-[#1D1D1F]">
         {renderForm()}
      </div>
    </div>
  );
}