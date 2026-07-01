// Prisma client singleton with driver adapter
// Falls back to in-memory mock if real database is unavailable

const mockLeadStore: any[] = []
const mockPropertyStore: any[] = []
const mockPortfolioStore: any[] = []
let mockPortfolioPropertyStore: any[] = []

let prisma: any = null

try {
  const { PrismaClient } = require('@prisma/client')
  const { PrismaPg } = require('@prisma/adapter-pg')
  const globalForPrisma = globalThis as unknown as { prisma: any }

  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (dbUrl) {
    const adapter = new PrismaPg({ connectionString: dbUrl, pool: { max: 3 } })
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
        mockLeadStore.push(newItem)
        return newItem
      },
      findMany: async (args?: { orderBy?: any; where?: any }) => {
        console.log('📝 Mock lead.findMany')
        let results = [...mockLeadStore]
        if (args?.where?.userId) {
          results = results.filter((l) => l.userId === args.where.userId)
        }
        if (args?.orderBy?.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }
        return results
      },
      update: async (args: { where: { id: string }; data: any }) => {
        console.log('📝 Mock lead.update:', args)
        const idx = mockLeadStore.findIndex((l) => l.id === args.where.id)
        if (idx === -1) throw new Error('Lead not found')
        mockLeadStore[idx] = { ...mockLeadStore[idx], ...args.data }
        return mockLeadStore[idx]
      },
      delete: async (args: { where: { id: string } }) => {
        console.log('📝 Mock lead.delete:', args)
        const idx = mockLeadStore.findIndex((l) => l.id === args.where.id)
        if (idx === -1) throw new Error('Lead not found')
        mockLeadStore.splice(idx, 1)
        return {}
      },
    },
    property: {
      create: async (data: any) => {
        console.log('📝 Mock property.create:', data)
        const newItem = {
          id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...data.data,
          createdAt: new Date().toISOString().split('T')[0],
        }
        mockPropertyStore.push(newItem)
        return newItem
      },
      findMany: async (args?: { orderBy?: any; where?: any }) => {
        console.log('📝 Mock property.findMany')
        let results = [...mockPropertyStore]
        if (args?.where?.userId) {
          results = results.filter((p) => p.userId === args.where.userId)
        }
        if (args?.orderBy?.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }
        return results
      },
      update: async (args: { where: { id: string }; data: any }) => {
        console.log('📝 Mock property.update:', args)
        const idx = mockPropertyStore.findIndex((p) => p.id === args.where.id)
        if (idx === -1) throw new Error('Property not found')
        mockPropertyStore[idx] = { ...mockPropertyStore[idx], ...args.data }
        return mockPropertyStore[idx]
      },
      delete: async (args: { where: { id: string } }) => {
        console.log('📝 Mock property.delete:', args)
        const idx = mockPropertyStore.findIndex((p) => p.id === args.where.id)
        if (idx === -1) throw new Error('Property not found')
        mockPropertyStore.splice(idx, 1)
        return {}
      },
    },
    portfolio: {
      create: async (data: any) => {
        console.log('📝 Mock portfolio.create:', data)
        const newItem = {
          id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...data.data,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        }
        mockPortfolioStore.push(newItem)
        return newItem
      },
      findMany: async (args?: { orderBy?: any; where?: any }) => {
        console.log('📝 Mock portfolio.findMany')
        let results = [...mockPortfolioStore]
        if (args?.where?.userId) {
          results = results.filter((p) => p.userId === args.where.userId)
        }
        if (args?.orderBy?.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        }
        return results
      },
      findFirst: async (args: { where: { id: string }; include?: any }) => {
        console.log('📝 Mock portfolio.findFirst:', args)
        const result = mockPortfolioStore.find((p) => p.id === args.where.id)
        if (!result) throw new Error('Portfolio not found')
        if (args?.include?.properties) {
          const links = mockPortfolioPropertyStore.filter((l) => l.portfolioId === result.id)
          result.properties = links.map((l: any) => {
            const prop = mockPropertyStore.find((p) => p.id === l.propertyId)
            return { ...prop, portfolioNotes: l.notes }
          }).filter(Boolean)
        }
        return result
      },
      update: async (args: { where: { id: string }; data: any }) => {
        console.log('📝 Mock portfolio.update:', args)
        const idx = mockPortfolioStore.findIndex((p) => p.id === args.where.id)
        if (idx === -1) throw new Error('Portfolio not found')
        mockPortfolioStore[idx] = { ...mockPortfolioStore[idx], ...args.data, updatedAt: new Date().toISOString().split('T')[0] }
        return mockPortfolioStore[idx]
      },
      delete: async (args: { where: { id: string } }) => {
        console.log('📝 Mock portfolio.delete:', args)
        const idx = mockPortfolioStore.findIndex((p) => p.id === args.where.id)
        if (idx === -1) throw new Error('Portfolio not found')
        mockPortfolioStore.splice(idx, 1)
        mockPortfolioPropertyStore = mockPortfolioPropertyStore.filter((l) => l.portfolioId !== args.where.id)
        return {}
      },
    },
    portfolioProperty: {
      create: async (data: any) => {
        console.log('📝 Mock portfolioProperty.create:', data)
        const exists = mockPortfolioPropertyStore.find(
          (l) => l.portfolioId === data.data.portfolioId && l.propertyId === data.data.propertyId
        )
        if (exists) throw new Error('Property already in portfolio')
        const newItem = {
          id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...data.data,
          createdAt: new Date().toISOString().split('T')[0],
        }
        mockPortfolioPropertyStore.push(newItem)
        return newItem
      },
      findMany: async (args?: { where?: any }) => {
        console.log('📝 Mock portfolioProperty.findMany')
        let results = [...mockPortfolioPropertyStore]
        if (args?.where?.portfolioId) {
          results = results.filter((l) => l.portfolioId === args.where.portfolioId)
        }
        if (args?.where?.propertyId) {
          results = results.filter((l) => l.propertyId === args.where.propertyId)
        }
        return results
      },
      delete: async (args: { where: { id: string } }) => {
        console.log('📝 Mock portfolioProperty.delete:', args)
        const idx = mockPortfolioPropertyStore.findIndex((l) => l.id === args.where.id)
        if (idx === -1) throw new Error('PortfolioProperty not found')
        mockPortfolioPropertyStore.splice(idx, 1)
        return {}
      },
      deleteMany: async (args: { where: { portfolioId: string; propertyId?: string } }) => {
        console.log('📝 Mock portfolioProperty.deleteMany:', args)
        const initialLen = mockPortfolioPropertyStore.length
        if (args.where.propertyId) {
          mockPortfolioPropertyStore = mockPortfolioPropertyStore.filter(
            (l) => !(l.portfolioId === args.where.portfolioId && l.propertyId === args.where.propertyId)
          )
        } else {
          mockPortfolioPropertyStore = mockPortfolioPropertyStore.filter(
            (l) => l.portfolioId !== args.where.portfolioId
          )
        }
        return { count: initialLen - mockPortfolioPropertyStore.length }
      },
    }
  }
}

export { prisma }