// Prisma client - will be initialized when Prisma is installed
// For now, this is a mock client that simulates database operations

const mockStore: any[] = []

let prisma: any = null

try {
  const { PrismaClient } = require('@prisma/client')
  const globalForPrisma = globalThis as unknown as {
    prisma: typeof PrismaClient | undefined
  }
  
  prisma = globalForPrisma.prisma || new PrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
  
  console.log('✅ Prisma client initialized successfully')
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