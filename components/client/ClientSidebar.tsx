"use client"

import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Settings, 
  MessageSquare,
  Menu
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/client',
    icon: LayoutDashboard
  },
  {
    name: 'Projects',
    href: '/client/projects',
    icon: Briefcase
  },
  {
    name: 'Freelancers',
    href: '/client/freelancers',
    icon: Users
  },
  {
    name: 'Messages',
    href: '/client/messages',
    icon: MessageSquare
  },
  {
    name: 'Settings',
    href: '/client/settings',
    icon: Settings
  }
]

export default function ClientSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1D1D1F] border-r border-white/10 transition-all duration-300`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-2xl font-bold text-[#fc7348]">Tingle</h1>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <nav className="mt-8">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 ${
                isActive 
                  ? 'bg-[#fc7348]/10 text-[#fc7348]' 
                  : 'text-white/60 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
} 