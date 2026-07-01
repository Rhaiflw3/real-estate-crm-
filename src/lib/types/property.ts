import { type PropertyStatus, type PropertyType } from "@/lib/constants/property-constants"

export type { PropertyStatus, PropertyType }

export interface Property {
  id: string
  title: string
  description?: string
  price: number
  status: PropertyStatus
  type: PropertyType
  bedrooms?: number
  bathrooms?: number
  areaSqFt?: number
  address?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
  createdAt: string
}

export interface CreatePropertyInput {
  title: string
  description?: string
  price: number
  status: PropertyStatus
  type: PropertyType
  bedrooms?: number
  bathrooms?: number
  areaSqFt?: number
  address?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
}
