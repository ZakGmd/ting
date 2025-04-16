"use client"

import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Freelancer {
  id: string
  name: string
  role: string
  rating: number
  projects: number
  skills: string[]
  hourlyRate: number
  profilePicture: string | null
  bio: string
  createdAt: string
  updatedAt: string
}

export default function TopFreelancers() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await fetch('/api/freelancers')
        if (!response.ok) {
          throw new Error('Failed to fetch freelancers')
        }
        const data = await response.json()
        setFreelancers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFreelancers()
  }, [])

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Top Freelancers</h2>
          <button className="text-[#fc7348] hover:text-[#fc7348]/80 text-sm">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-white/5 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Top Freelancers</h2>
          <button className="text-[#fc7348] hover:text-[#fc7348]/80 text-sm">
            View All
          </button>
        </div>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Top Freelancers</h2>
        <button className="text-[#fc7348] hover:text-[#fc7348]/80 text-sm">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {freelancers.map((freelancer) => (
          <div 
            key={freelancer.id}
            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#fc7348]/20 flex items-center justify-center">
                <span className="text-[#fc7348] text-lg font-medium">
                  {freelancer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-medium">{freelancer.name}</h3>
                <p className="text-sm text-white/60">{freelancer.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm ml-1">{freelancer.rating}</span>
                  </div>
                  <span className="text-sm text-white/40">•</span>
                  <span className="text-sm text-white/60">{freelancer.projects} projects</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {freelancer.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/60">Hourly Rate</p>
              <p className="font-medium">${freelancer.hourlyRate}</p>
              <button className="mt-2 px-4 py-2 bg-[#fc7348] text-white rounded-lg hover:bg-[#fc7348]/90 transition-colors">
                Hire
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 