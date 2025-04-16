import { AuroraBackground } from "@/components/signIn/backGound";
import SignIn from "@/components/signIn/signIn";
export default function Home() {
  return (
   <>
    <AuroraBackground >
      <div className="flex items-start justify-between">
        
        <SignIn/> 
      </div>
        
    </AuroraBackground>
      
  
   </>
  );
}
