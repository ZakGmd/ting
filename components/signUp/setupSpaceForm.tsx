import { EB_Garamond, Inter } from "next/font/google";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import CustomDropdown from "./customDropdown";

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

interface SetupSpaceFormProps {
  formData: {
    accountType: string;
    skills: string;
    bio: string;
    category: string;
  };
  updateFormData: (data: Partial<SetupSpaceFormProps['formData']>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function SetupSpaceForm({ formData, updateFormData, onBack, onNext }: SetupSpaceFormProps) {
  const [errors, setErrors] = useState({
    skills: "",
    bio: "",
    category: "",
  });

  const categories = [
    "Design & Graphics",
    "Web Development",
    "Mobile Development",
    "Writing & Content",
    "Digital Marketing",
    "Video & Animation",
    "Music & Audio",
    "Photography"
  ];

  const popularSkills = [
    "UI/UX Design",
    "Next.js",
    "React",
    "Tailwind CSS",
    "Content Writing",
    "Graphic Design",
    "JavaScript",
    "TypeScript",
    "Motion Graphics"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
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

  const handleAccountTypeChange = (type: string) => {
    updateFormData({ accountType: type });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (formData.accountType === "freelancer") {
      if (!formData.skills) {
        newErrors.skills = "Please add at least one skill";
        valid = false;
      }
      
      if (!formData.category) {
        newErrors.category = "Please select a category";
        valid = false;
      }
    }
    
    if (!formData.bio || formData.bio.length < 30) {
      newErrors.bio = "Bio must be at least 30 characters";
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
          <span>Back to account details</span>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col mt-4 w-[448px]">
        <div className={`mb-8 ${garamond.className} text-3xl text-center`}>Set up your space</div>
        
        <div className="reltive flex flex-col gap-5">
          <div className="flex flex-col gap-2 ">
            <label className="text-sm text-white/70">Account Type</label>
            <div className="flex gap-3">
              <div 
                onClick={() => handleAccountTypeChange("freelancer")}
                className={`flex-1 px-4 py-3 rounded-xl  cursor-pointer transition-all ${
                  formData.accountType === "freelancer" 
                    ? "bg-gradient-to-b from-transparent to-[#fc7348]/20 from-[10%] to-[100%] shadow-[inset_0px_0.5px_0.8px_rgba(255,255,255,0.7),0px_1px_1px_rgba(0,0,0,0.47)]" 
                    : "shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)]"
                }`}
              >
                <div className="font-medium mb-1">Freelancer</div>
                <div className="text-xs text-white/70">Showcase work & get hired</div>
              </div>
              
              <div 
                onClick={() => handleAccountTypeChange("client")}
                className={`flex-1 px-4 py-3 rounded-xl duration-300  cursor-pointer transition-all ${
                  formData.accountType === "client" 
                    ? "bg-gradient-to-b from-transparent to-[#fc7348]/20 from-[10%] to-[100%] shadow-[inset_0px_0.5px_0.8px_rgba(255,255,255,0.7),0px_1px_1px_rgba(0,0,0,0.47)]" 
                    : "shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)]"
                }`}
              >
                <div className="font-medium mb-1">Client</div>
                <div className="text-xs text-white/70">Hire talented freelancers</div>
              </div>
            </div>
          </div>
          
          {formData.accountType === "freelancer" && (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor="category" className="text-sm text-white/70">Primary Category</label>
                <CustomDropdown
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={categories}
                  placeholder="Select your category"
                />
                {errors.category && <p className="text-[#fc7348] text-xs mt-1">{errors.category}</p>}
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="skills" className="text-sm text-white/70">Your Skills</label>
                <input 
                  type="text" 
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-xl bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] outline-none"
                  placeholder="Add your skills (comma separated)"
                />
                {errors.skills && <p className="text-[#fc7348] text-xs mt-1">{errors.skills}</p>}
                
                <div className="mt-2">
                  <div className="text-xs text-white/70 mb-2">Popular skills:</div>
                  <div className="flex flex-wrap gap-2">
                    {popularSkills.map((skill, idx) => (
                      <div 
                        key={idx}
                        onClick={() => updateFormData({ skills: formData.skills + (formData.skills ? ", " : "") + skill })}
                        className="px-3 py-1 bg-white/2 flex items-center  rounded-full text-xs cursor-pointer  shadow-[inset_0px_1px_0.6px_rgba(0,0,0,0.7),0px_0.5px_0.4px_rgba(255,255,255,0.17)] "
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex flex-col gap-2">
            <label htmlFor="bio" className="text-sm text-white/70">Bio</label>
            <textarea 
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="px-4 py-3 rounded-xl bg-white/2 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)] outline-none resize-none"
              placeholder={formData.accountType === "freelancer" ? "Tell us about your work and experience..." : "Tell us about what you're looking to build..."}
            />
            {errors.bio && <p className="text-[#fc7348] text-xs mt-1">{errors.bio}</p>}
          </div>
          
          <button 
            type="submit"
            className="px-3 h-11 w-full mt-1 mb-6 text-[18px] border text-white text-center flex items-center justify-center rounded-3xl border-black bg-[#fc7348]/60 font-light cursor-pointer hover:bg-[#fc7348] hover:bg-gradient-to-b hover:from-transparent transition-all duration-300 hover:shadow-[0px_0.4px_0px_rgba(0,0,0,0.4),inset_0px_2px_0px_rgba(0,0,0,0.10)] active:shadow-[0px_0.1px_0px_rgba(252,115,72,0.01),inset_0px_5px_0px_rgba(0,0,0,0.10)] shadow-[0_1.1px_2px_rgba(0,0,0,0.65),inset_0px_0.7px_0px_rgba(255,255,255,0.15)]">
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