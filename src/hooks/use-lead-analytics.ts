"use client"

import { useState, useEffect, useMemo } from "react"
import type { Lead } from "@/lib/types/lead"
import { computeMetrics } from "@/lib/analytics/metrics"
import type { LeadMetrics } from "@/lib/analytics/metrics"
import {
  getStatusDistribution,
  getWeeklyGrowth,
  getWonVsLost,
  getConversionFunnel,
} from "@/lib/analytics/chart-data"
import type {
  StatusDistributionItem,
  WeeklyGrowthItem,
  WonVsLostItem,
  FunnelStageItem,
} from "@/lib/analytics/chart-data"
import { generateInsights } from "@/lib/analytics/insights"
import type { Insight } from "@/lib/analytics/insights"

export const mockLeads: Lead[] = [
  { id: "1", name: "Maria Gonzalez", email: "maria@email.com", status: "New", source: "Website", createdAt: "2025-12-01" },
  { id: "2", name: "Carlos Ruiz", email: "carlos@email.com", status: "New", source: "Referral", createdAt: "2025-12-05" },
  { id: "3", name: "Ana Martinez", email: "ana@email.com", status: "Contacted", source: "WhatsApp", createdAt: "2025-11-28" },
  { id: "4", name: "Luis Fernandez", email: "luis@email.com", status: "Contacted", source: "Website", createdAt: "2025-11-20" },
  { id: "5", name: "Sofia Lopez", email: "sofia@email.com", status: "Contacted", source: "Event", createdAt: "2025-11-15" },
  { id: "6", name: "Diego Ramirez", email: "diego@email.com", status: "Qualified", source: "Website", createdAt: "2025-11-10" },
  { id: "7", name: "Valentina Torres", email: "val@email.com", status: "Qualified", source: "Referral", createdAt: "2025-11-05" },
  { id: "8", name: "Andres Vega", email: "andres@email.com", status: "Showing", source: "WhatsApp", createdAt: "2025-10-28" },
  { id: "9", name: "Camila Rios", email: "camila@email.com", status: "Showing", source: "Website", createdAt: "2025-10-20" },
  { id: "10", name: "Javier Soto", email: "javier@email.com", status: "Won", source: "Referral", createdAt: "2025-10-10" },
  { id: "11", name: "Isabella Cruz", email: "isabella@email.com", status: "Won", source: "Website", createdAt: "2025-10-05" },
  { id: "12", name: "Fernando Paz", email: "fernando@email.com", status: "Lost", source: "Email", createdAt: "2025-09-28" },
]

export interface LeadAnalytics {
  metrics: LeadMetrics
  statusDistribution: StatusDistributionItem[]
  weeklyGrowth: WeeklyGrowthItem[]
  wonVsLost: WonVsLostItem[]
  conversionFunnel: FunnelStageItem[]
  insights: Insight[]
  isLoading: boolean
  isEmpty: boolean
}

export function useLeadAnalytics(): LeadAnalytics {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/leads")
        if (response.ok) {
          const data = await response.json()
          setLeads(data)
        } else {
          setLeads(mockLeads)
        }
      } catch {
        setLeads(mockLeads)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const metrics = useMemo(() => computeMetrics(leads), [leads])
  const statusDistribution = useMemo(() => getStatusDistribution(leads), [leads])
  const weeklyGrowth = useMemo(() => getWeeklyGrowth(leads), [leads])
  const wonVsLost = useMemo(() => getWonVsLost(leads), [leads])
  const conversionFunnel = useMemo(() => getConversionFunnel(leads), [leads])
  const insights = useMemo(() => generateInsights(leads), [leads])

  return {
    metrics,
    statusDistribution,
    weeklyGrowth,
    wonVsLost,
    conversionFunnel,
    insights,
    isLoading,
    isEmpty: leads.length === 0,
  }
}
