import type { Lead } from "@/lib/types/lead"
import { LEAD_STATUSES, STATUS_STYLES } from "@/lib/constants/lead-status"
import type { LeadStatus } from "@/lib/constants/lead-status"

export interface StatusDistributionItem {
  status: LeadStatus
  count: number
  percentage: number
  color: string
}

export interface WeeklyGrowthItem {
  week: string
  date: string
  count: number
}

export interface WonVsLostItem {
  name: string
  value: number
  fill: string
}

export interface FunnelStageItem {
  stage: string
  count: number
  dropRate: number
}

function getStatusColor(status: LeadStatus): string {
  const className = STATUS_STYLES[status]?.className || ""
  const colorMap: Record<string, string> = {
    "bg-blue-500": "var(--color-chart-1)",
    "bg-green-100": "#86efac",
    "bg-purple-500": "#a855f7",
    "bg-amber-100": "#fde68a",
    "bg-emerald-500": "#10b981",
    "bg-red-100": "#fecaca",
  }
  for (const [key, val] of Object.entries(colorMap)) {
    if (className.includes(key)) return val
  }
  return "var(--color-chart-4)"
}

export function getStatusDistribution(leads: Lead[]): StatusDistributionItem[] {
  const total = leads.length || 1
  const counts: Record<LeadStatus, number> = {} as Record<LeadStatus, number>
  for (const s of LEAD_STATUSES) counts[s] = 0
  for (const lead of leads) {
    if (counts[lead.status] !== undefined) counts[lead.status]++
  }
  return LEAD_STATUSES.map((status) => ({
    status,
    count: counts[status],
    percentage: Math.round((counts[status] / total) * 100),
    color: getStatusColor(status),
  }))
}

export function getWeeklyGrowth(leads: Lead[]): WeeklyGrowthItem[] {
  if (leads.length === 0) return []

  const weeks: Record<string, { count: number; date: string }> = {}

  for (const lead of leads) {
    const d = new Date(lead.createdAt)
    const dayOfWeek = d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1))
    const key = monday.toISOString().split("T")[0]

    if (!weeks[key]) {
      weeks[key] = { count: 0, date: key }
    }
    weeks[key].count++
  }

  return Object.values(weeks)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12)
    .map((w) => {
      const d = new Date(w.date)
      const month = d.toLocaleDateString("en-US", { month: "short" })
      const day = d.getDate()
      return { week: `${month} ${day}`, date: w.date, count: w.count }
    })
}

export function getWonVsLost(leads: Lead[]): WonVsLostItem[] {
  const won = leads.filter((l) => l.status === "Won").length
  const lost = leads.filter((l) => l.status === "Lost").length
  return [
    { name: "Won", value: won, fill: "#10b981" },
    { name: "Lost", value: lost, fill: "#ef4444" },
  ]
}

export function getConversionFunnel(leads: Lead[]): FunnelStageItem[] {
  const counts: Record<LeadStatus, number> = {} as Record<LeadStatus, number>
  for (const s of LEAD_STATUSES) counts[s] = 0
  for (const lead of leads) {
    if (counts[lead.status] !== undefined) counts[lead.status]++
  }

  const closedStatuses: LeadStatus[] = ["Won", "Lost"]
  const activePipeline = LEAD_STATUSES.filter((s) => !closedStatuses.includes(s))
  const outsidePipeline = leads.filter((l) => !activePipeline.includes(l.status))

  const stages: { stage: string; count: number }[] = [
    { stage: "Total Leads", count: leads.length },
    ...activePipeline.map((s) => ({ stage: s, count: counts[s] })),
  ]

  if (outsidePipeline.length > 0) {
    stages.push({ stage: "Closed", count: outsidePipeline.length })
  }

  return stages.map((stage, i) => {
    const prevCount = i > 0 ? stages[i - 1].count : stage.count
    const dropRate = prevCount > 0 ? Math.round(((prevCount - stage.count) / prevCount) * 100) : 0
    return { ...stage, dropRate }
  })
}
