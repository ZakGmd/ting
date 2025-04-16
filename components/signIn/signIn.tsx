"use client"
import { EB_Garamond, Geist } from "next/font/google";
import { useState, useEffect } from "react";
import { EyeOff, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-garamond',
});

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['sans-serif'],
  adjustFontFallback: true,
  variable: '--font-geist',
});


function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit"
      disabled={pending}
      className="w-full p-2 text-center bg-[#fc7348]/60 cursor-pointer hover:bg-[#fc7348]/90 duration-300 transition-all rounded-md hover:text-white/90 text-white/70 font-normal mt-2 tracking-[0.10px] flex justify-center items-center"
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin text-white" />
      ) : "Sign in"}
    </button>
  );
}

export default function SignIn() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [formInputs, setFormInputs] = useState({
      email: '',
      password: ''
    });
    const [emailGradientWidth, setEmailGradientWidth] = useState('40%');
    const [passwordGradientWidth, setPasswordGradientWidth] = useState('40%');

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
    // Effect to update gradient width based on input length
    useEffect(() => {
      
      const newEmailWidth = formInputs.email.length ? Math.min(40 + formInputs.email.length * 6, 100) : 40;
      setEmailGradientWidth(`${newEmailWidth}%`);
      
      const newPasswordWidth = formInputs.password.length ? Math.min(40 + formInputs.password.length * 6, 100) : 40;
      setPasswordGradientWidth(`${newPasswordWidth}%`);
    }, [formInputs.email, formInputs.password]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormInputs(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (formData: FormData) => {
      try {
        setError('');
        
        const result = await login(formData);
        
        if (result.success) {
       
          if (result.needsProfileCompletion) {
            router.push('/'); 
          } else if (result.userType === 'FREELANCER') {
            router.push('/home');
          } else {
            router.push('/client');
          }
        } else {
          setError(result.error || 'Failed to sign in');
        }
      } catch (error) {
        console.error('Error during login:', error);
        setError('An unexpected error occurred');
      }
    };

    return (
      <form 
        action={handleSubmit}
        className={`${geist.className} max-w-[400px] p-1 shadow-md ring-white/15 ring-1 isolate rounded-xl bg-[#1d1d1f]/10 backdrop-blur-2xl flex flex-col items-center justify-center`}
      >
        <div className="px-8 py-5 border rounded-xl border-white/10 flex flex-col items-center">
          <div className="flex flex-col items-center">
            <div className={`${garamond.className} text-4xl align-text-top bg-clip-text leading-relaxed text-transparent bg-gradient-to-r to-slate-100 from-[-10%] from-[#fc7348]`}>Tingle</div>
            <div className="flex flex-col items-center gap-0.5 text-white">
              <div className={`${garamond.className} text-3xl tracking-[-0.10px]`}>Sign in to continue</div>
              <div className="font-light text-[14px] text-white/60 tracking-[-0.11px]">Let&apos;s make some magic happen! Sign in to continue.</div> 
            </div>
            <div className="w-full flex flex-col mt-4">
              <div className='flex flex-col items-start gap-2'>
                <div className='py-2 px-2 relative overflow-hidden flex items-center gap-1 h-full w-full bg-gradient-to-r shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] rounded-lg'>
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#fc7348]/5 to-transparent transition-all duration-300 ease-out" 
                    style={{ width: emailGradientWidth }}
                  ></div>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    color={formInputs.email.length > 0 ? "#fc7348" : "#313131"} 
                    strokeWidth="1"
                    className="transition-all h-5 w-5 duration-300"
                  >
                    <path fillRule="evenodd" clipRule="evenodd" d="M4 4.25C2.48122 4.25 1.25 5.48122 1.25 7V17C1.25 18.5188 2.48122 19.75 4 19.75H20C21.5188 19.75 22.75 18.5188 22.75 17V7C22.75 5.48122 21.5188 4.25 20 4.25H4ZM7.4301 8.38558C7.09076 8.14804 6.62311 8.23057 6.38558 8.5699C6.14804 8.90924 6.23057 9.37689 6.5699 9.61442L11.5699 13.1144C11.8281 13.2952 12.1719 13.2952 12.4301 13.1144L17.4301 9.61442C17.7694 9.37689 17.852 8.90924 17.6144 8.5699C17.3769 8.23057 16.9092 8.14804 16.5699 8.38558L12 11.5845L7.4301 8.38558Z" fill={formInputs.email.length > 0 ? "#fc7348" : "#313131"}></path>
                  </svg>
                  <input 
                    type="email" 
                    name="email" 
                    value={formInputs.email} 
                    onChange={handleInputChange} 
                    placeholder='Email' 
                    className='h-full z-10 text-slate-100 text-[14px] placeholder:text-orange-100/10 placeholder:font-normal font-light bg-transparent outline-none w-full' 
                  />
                </div>
                <div className='py-2 px-2 relative overflow-hidden flex items-center gap-1 h-full w-full bg-gradient-to-r shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] rounded-lg'>
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#fc7348]/5 to-transparent transition-all duration-300 ease-out" 
                    style={{ width: passwordGradientWidth }}
                  ></div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={formInputs.password.length > 0 ? "#fc7348" : "#313131"} 
                    className="w-5 h-5 transition-all duration-300"
                  >
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                  </svg>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formInputs.password} 
                    onChange={handleInputChange} 
                    placeholder='Password' 
                    className='h-full pr-8 w-full z-10 placeholder:text-orange-100/10 text-[14px] font-light text-slate-100 bg-transparent outline-none' 
                  />
                  <div
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 cursor-pointer transition-all duration-300 right-3 flex items-center"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-white/30 z-40" /> : <Eye className="h-4 w-4 text-white/30 z-40" />}
                  </div>
                </div>
                
                {error && (
                  <div className="w-full text-center text-sm font-light text-red-400 mt-1">
                    {error}
                  </div>
                )}
                
                <SubmitButton />
              </div>
              
              <div className="flex items-center justify-center my-3 gap-2">
                <div className="w-[108px] h-[0.5px] bg-white/10"></div>
                <div className="text-[12px] font-light text-white/30">Or continue with</div>
                <div className="w-[108px] h-[0.5px] bg-white/10"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  className="flex group items-center justify-center bg-white/8 py-1 hover:bg-white/12 cursor-pointer transition-all duration-300 rounded-lg text-white/40"
                
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 group-hover:opacity-70 opacity-50 transition-all duration-300 w-5 mr-1">
                    <path
                      fill="#EA4335"
                      d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                    />
                    <path
                      fill="#4A90E2"
                      d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5818182 23.1272727,9.90909091 L12,9.90909091 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                    />
                  </svg>
                  Google
                </button>
                <button 
                  type="button"
                  className="flex items-center justify-center bg-white/8 hover:bg-white/12 cursor-pointer transition-all duration-300 py-1 rounded-lg text-white/40"
                 
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide group-hover:text-white/70 text-white/50 transition-all duration-300 mr-1 lucide-github-icon lucide-github">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                    <path d="M9 18c-4.51 2-5-2-7-2"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="inline-flex w-full pt-1">
          <div className="text-white/40 py-1 gap-1 text-center w-full font-light justify-center text-[14px]">
            Don&apos;t have an account? <Link href={'/sign-up'} className="font-normal text-[#fc7348]/50 hover:text-[#fc7348]/80 transition-all duration-300">Sign up</Link>
          </div>
        </div>
      </form>
    );
}