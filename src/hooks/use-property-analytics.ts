"use client"

import { useState, useEffect, useMemo } from "react"
import type { Property } from "@/lib/types/property"
import { computePropertyMetrics, getPropertyTypeDistribution } from "@/lib/analytics/property-metrics"
import type { PropertyMetrics, PropertyTypeDistribution } from "@/lib/analytics/property-metrics"

export interface PropertyAnalytics {
  metrics: PropertyMetrics
  typeDistribution: PropertyTypeDistribution[]
  isLoading: boolean
  isEmpty: boolean
}

export function usePropertyAnalytics(): PropertyAnalytics {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/properties")
        if (response.ok) {
          const data = await response.json()
          setProperties(data)
        }
      } catch (error) {
        console.error("Error fetching properties:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const metrics = useMemo(() => computePropertyMetrics(properties), [properties])
  const typeDistribution = useMemo(() => getPropertyTypeDistribution(properties), [properties])

  return {
    metrics,
    typeDistribution,
    isLoading,
    isEmpty: properties.length === 0,
  }
}
