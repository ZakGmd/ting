import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface Freelancer {
  id: string
  name: string
  displayName: string | null
  bio: string | null
  skills: string | null
  experience: string | null
  profileImage: string | null
  createdAt: Date
  updatedAt: Date
}

interface TransformedFreelancer {
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

export async function GET() {
  try {
    // Fetch freelancers from the database
    const freelancers = await prisma.user.findMany({
      where: {
        userType: 'FREELANCER'
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        bio: true,
        skills: true,
        experience: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    })

    // Transform the data to match our frontend interface
    const transformedFreelancers: TransformedFreelancer[] = freelancers.map((freelancer: Freelancer) => ({
      id: freelancer.id,
      name: freelancer.displayName || freelancer.name,
      role: freelancer.experience || 'Freelancer',
      rating: 4.5, // TODO: Add rating system
      projects: 0, // TODO: Add project count
      skills: freelancer.skills ? freelancer.skills.split(',').map(s => s.trim()) : [],
      hourlyRate: 30, // TODO: Add hourly rate field
      profilePicture: freelancer.profileImage,
      bio: freelancer.bio || '',
      createdAt: freelancer.createdAt.toISOString(),
      updatedAt: freelancer.updatedAt.toISOString()
    }))

    return NextResponse.json(transformedFreelancers)
  } catch (error) {
    console.error('Error fetching freelancers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch freelancers' },
      { status: 500 }
    )
  }
} 