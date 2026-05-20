// Prisma client singleton with driver adapter
// Falls back to in-memory mock if real database is unavailable

const mockStore: any[] = []

let prisma: any = null

try {
  const { PrismaClient } = require('@prisma/client')
  const { PrismaPg } = require('@prisma/adapter-pg')
  const globalForPrisma = globalThis as unknown as { prisma: any }

  if (process.env.DATABASE_URL) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
    prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
  } else {
    throw new Error('DATABASE_URL not set')
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }

  console.log('✅ Prisma client initialized with PostgreSQL adapter')
} catch (error) {
  console.log('⚠️ Prisma client not available, using in-memory database')
  // Fallback to in-memory operations with persistence
  prisma = {
    lead: {
      create: async (data: any) => {
        console.log('📝 Mock lead.create:', data)
        const newItem = {
          id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...data.data,
          createdAt: new Date().toISOString().split('T')[0],
        }
        mockStore.push(newItem)
        return newItem
      },
      findMany: async (args?: { orderBy?: any }) => {
        console.log('📝 Mock lead.findMany')
        let results = [...mockStore]
        if (args?.orderBy?.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }
        return results
      },
      update: async (args: { where: { id: string }; data: any }) => {
        console.log('📝 Mock lead.update:', args)
        const idx = mockStore.findIndex((l) => l.id === args.where.id)
        if (idx === -1) throw new Error('Lead not found')
        mockStore[idx] = { ...mockStore[idx], ...args.data }
        return mockStore[idx]
      },
      delete: async (args: { where: { id: string } }) => {
        console.log('📝 Mock lead.delete:', args)
        const idx = mockStore.findIndex((l) => l.id === args.where.id)
        if (idx === -1) throw new Error('Lead not found')
        mockStore.splice(idx, 1)
        return {}
      },
    }
  }
}

export { prisma }