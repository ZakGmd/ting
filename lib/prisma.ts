import { PrismaClient } from '@prisma/client'

// Add debugging
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || 
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma