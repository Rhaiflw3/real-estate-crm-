import type { Property } from "./property"

export interface Portfolio {
  id: string
  name: string
  description?: string
  year?: number
  type: "Standard" | "PRO"
  status: "Active" | "Archived"
  userId: string
  propertyCount?: number
  createdAt: string
  updatedAt: string
}

export interface PortfolioWithProperties extends Portfolio {
  properties: (Property & { portfolioNotes?: string })[]
}

export interface CreatePortfolioInput {
  name: string
  description?: string
  year?: number
  type: "Standard" | "PRO"
  status?: "Active" | "Archived"
}
