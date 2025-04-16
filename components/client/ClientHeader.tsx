"use client"

import { Bell, Search } from 'lucide-react'

export default function ClientHeader() {
  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-white/5 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#fc7348]/50"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-white/10">
          <Bell className="w-5 h-5 text-white/60" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#fc7348]/20 flex items-center justify-center">
          <span className="text-[#fc7348] text-sm font-medium">JD</span>
        </div>
      </div>
    </header>
  )
} 