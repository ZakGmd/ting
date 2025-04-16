import { EB_Garamond, Inter } from "next/font/google";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

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

interface SignUpFormProps {
  formData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
  };
  updateFormData: (data: Partial<SignUpFormProps['formData']>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function SignUpForm({ formData, updateFormData, onBack, onNext }: SignUpFormProps) {
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    updateFormData({ 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    // Clear the error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      valid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }
    
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms";
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Proceed to next step
      onNext();
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
          <span>Back to login</span>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col mt-4 w-[448px]">
        <div className={`mb-8 ${garamond.className} text-3xl text-center`}>Create your account</div>
        
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-sm text-white/70">Full Name</label>
            <input 
              type="text" 
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] focus:border-[#fc7348]/60 outline-none"
              placeholder="Your full name"
            />
            {errors.fullName && <p className="text-[#fc7348] text-xs mt-1">{errors.fullName}</p>}
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm text-white/70">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] focus:border-[#fc7348]/60 outline-none"
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="text-[#fc7348] text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm text-white/70">Password</label>
            <input 
              type="password" 
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] focus:border-[#fc7348]/60 outline-none"
              placeholder="Create a strong password"
            />
            {errors.password && <p className="text-[#fc7348] text-xs mt-1">{errors.password}</p>}
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm text-white/70">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] focus:border-[#fc7348]/60 outline-none"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="text-[#fc7348] text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
          
          <div className="flex items-start gap-2 mt-2">
            <input 
              type="checkbox" 
              id="terms" 
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="w-4 h-4 mt-1 bg-white/5 border border-white/30 rounded"
            />
            <label htmlFor="terms" className="text-sm text-white/70">
              I agree to the <Link href="/terms" className="text-[#fc7348]">Terms of Service</Link> and <Link href="/privacy" className="text-[#fc7348]">Privacy Policy</Link>
            </label>
          </div>
          {errors.termsAccepted && <p className="text-[#fc7348] text-xs mt-1">{errors.termsAccepted}</p>}
          
          <button 
            type="submit"
            className="px-3 h-11 w-full mt-4 text-[18px] border text-white text-center flex items-center justify-center rounded-3xl border-black bg-[#fc7348]/60 font-light cursor-pointer hover:bg-[#fc7348] hover:bg-gradient-to-b hover:from-transparent transition-all duration-300 hover:shadow-[0px_0.4px_0px_rgba(0,0,0,0.4),inset_0px_2px_0px_rgba(0,0,0,0.10)] active:shadow-[0px_0.1px_0px_rgba(252,115,72,0.01),inset_0px_5px_0px_rgba(0,0,0,0.10)] shadow-[0_1.1px_2px_rgba(0,0,0,0.65),inset_0px_0.7px_0px_rgba(255,255,255,0.15)]">
            Continue
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