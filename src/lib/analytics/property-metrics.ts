import type { Property } from "@/lib/types/property"
import { PROPERTY_STATUSES } from "@/lib/constants/property-constants"
import type { PropertyStatus, PropertyType } from "@/lib/constants/property-constants"

export interface PropertyMetrics {
  totalProperties: number
  totalValue: number
  byStatus: Record<PropertyStatus, number>
  byType: Record<PropertyType, number>
  availableCount: number
  pendingCount: number
  soldCount: number
  rentedCount: number
  offMarketCount: number
  averagePrice: number
}

export interface PropertyTypeDistribution {
  type: PropertyType
  count: number
  percentage: number
}

export interface PropertyStatusDistribution {
  status: PropertyStatus
  count: number
  percentage: number
}

export function computePropertyMetrics(properties: Property[]): PropertyMetrics {
  const totalProperties = properties.length
  const totalValue = properties.reduce((sum, p) => sum + (p.price || 0), 0)

  const byStatus: Record<string, number> = {}
  const byType: Record<string, number> = {}

  for (const s of PROPERTY_STATUSES) byStatus[s] = 0

  for (const prop of properties) {
    if (byStatus[prop.status] !== undefined) byStatus[prop.status]++
    if (prop.type) {
      byType[prop.type] = (byType[prop.type] || 0) + 1
    }
  }

  const averagePrice = totalProperties > 0 ? Math.round(totalValue / totalProperties) : 0

  return {
    totalProperties,
    totalValue,
    byStatus: byStatus as Record<PropertyStatus, number>,
    byType: byType as Record<PropertyType, number>,
    availableCount: byStatus.Available || 0,
    pendingCount: byStatus.Pending || 0,
    soldCount: byStatus.Sold || 0,
    rentedCount: byStatus.Rented || 0,
    offMarketCount: byStatus.OffMarket || 0,
    averagePrice,
  }
}

export function getPropertyTypeDistribution(properties: Property[]): PropertyTypeDistribution[] {
  const total = properties.length || 1
  const counts: Record<string, number> = {}
  for (const prop of properties) {
    if (prop.type) counts[prop.type] = (counts[prop.type] || 0) + 1
  }
  return Object.entries(counts).map(([type, count]) => ({
    type: type as PropertyType,
    count,
    percentage: Math.round((count / total) * 100),
  }))
}

export function getPropertyStatusDistribution(properties: Property[]): PropertyStatusDistribution[] {
  const total = properties.length || 1
  const counts: Record<string, number> = {}
  for (const s of PROPERTY_STATUSES) counts[s] = 0
  for (const prop of properties) {
    if (counts[prop.status] !== undefined) counts[prop.status]++
  }
  return Object.entries(counts).map(([status, count]) => ({
    status: status as PropertyStatus,
    count,
    percentage: Math.round((count / total) * 100),
  }))
}
