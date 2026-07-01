import type { Lead } from "@/lib/types/lead"
import { CLOSED_STATUSES } from "@/lib/constants/lead-status"
import type { LeadStatus } from "@/lib/constants/lead-status"

export interface LeadMetrics {
  totalLeads: number
  newLeads: number
  contactedLeads: number
  qualifiedLeads: number
  activeShowings: number
  wonDeals: number
  lostLeads: number
  conversionRate: number
  pipelineHealth: number
  winLossRatio: number
}

export function computeMetrics(leads: Lead[]): LeadMetrics {
  const totalLeads = leads.length

  const byStatus: Record<LeadStatus, number> = {
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Showing: 0,
    Won: 0,
    Lost: 0,
  }

  for (const lead of leads) {
    if (byStatus[lead.status] !== undefined) {
      byStatus[lead.status]++
    }
  }

  const won = byStatus.Won
  const lost = byStatus.Lost
  const closed = won + lost

  const conversionRate = closed > 0 ? Math.round((won / closed) * 100) : 0
  const pipelineHealth =
    totalLeads > 0
      ? Math.round(((byStatus.Qualified + byStatus.Showing) / totalLeads) * 100)
      : 0
  const winLossRatio = lost > 0 ? parseFloat((won / lost).toFixed(2)) : won > 0 ? Infinity : 0

  return {
    totalLeads,
    newLeads: byStatus.New,
    contactedLeads: byStatus.Contacted,
    qualifiedLeads: byStatus.Qualified,
    activeShowings: byStatus.Showing,
    wonDeals: won,
    lostLeads: lost,
    conversionRate,
    pipelineHealth,
    winLossRatio,
  }
}
