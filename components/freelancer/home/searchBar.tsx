"use client"
import { Search } from "lucide-react"


export function SearchBar() {


  return (
    <div className=" flex gap-1 px-3 py-1 items-center  mt-2.5 rounded-lg bg-white/1 shadow-[inset_0px_1px_1px_rgba(0,0,0,0.7),0px_0.5px_0px_rgba(255,255,255,0.17)]">
      <Search size={18} strokeWidth={1}  />
      <input 
        type="text" 
        className="outline-none w-full"
        placeholder="Search"
      />
      
    </div>
  )
} 