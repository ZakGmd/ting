import { Search, X } from "lucide-react";

export default function SearchModal() {

    return(
        <div className="fixed inset-0 bg-black/60 z-50">
        <div className="relative  max-w-xl mx-auto">
          <div className="mt-2 rounded-2xl border border-black bg-[#1D1D1F] shadow-lg">
            {/* Search Input */}
            <div className="flex flex-col items-start">
            <div className="flex items-center gap-4 p-4  w-full">
               
               <Search strokeWidth={1} className="w-5 h-5 text-[#fc7348] " />
               <input
                 type="text"
                 placeholder="Search for people"
                 className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                 autoFocus
                
               />
             
                 <div
                   
                   
                   className="h-8 w-8 rounded-full text-gray-500 hover:text-white hover:bg-white/[0.1]"
                
                 >
                   <X className="w-4 h-4" />
                 </div>
              
               
             </div>
              <div className="w-full h-[2.5px] bg-black/1 shadow-[0_0.5px_0.4px_rgba(255,255,255,0.15),inset_0px_1px_1px_rgba(0,0,0,0.9)]"></div>
            </div>
            
  
           
          </div>
        </div>
      </div>

    )
}