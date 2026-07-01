import type { Lead } from "@/lib/types/lead"

export interface Insight {
  type: "positive" | "warning" | "info"
  title: string
  description: string
}

export function generateInsights(leads: Lead[]): Insight[] {
  const insights: Insight[] = []

  if (leads.length === 0) {
    insights.push({
      type: "info",
      title: "No leads yet",
      description: "Add your first lead to start tracking pipeline performance.",
    })
    return insights
  }

  const total = leads.length
  const byStatus: Record<string, number> = {}
  for (const lead of leads) {
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1
  }

  const newLeads = byStatus.New || 0
  const contacted = byStatus.Contacted || 0
  const qualified = byStatus.Qualified || 0
  const showing = byStatus.Showing || 0
  const won = byStatus.Won || 0
  const lost = byStatus.Lost || 0

  if (newLeads > 0 && newLeads / total > 0.4) {
    insights.push({
      type: "info",
      title: `${newLeads} new leads need attention`,
      description: `${Math.round((newLeads / total) * 100)}% of your leads haven't been contacted yet. Prioritize initial outreach.`,
    })
  }

  if (contacted > 0 && contacted / total > 0.3) {
    insights.push({
      type: "warning",
      title: `${contacted} leads stuck in Contacted`,
      description: `${Math.round((contacted / total) * 100)}% of leads haven't progressed past initial contact. Consider follow-up sequences.`,
    })
  }

  if (qualified > 0) {
    insights.push({
      type: "positive",
      title: `${qualified} qualified leads ready for showings`,
      description: "These leads have confirmed needs and budget. Schedule property showings to move them forward.",
    })
  }

  if (showing > 0) {
    insights.push({
      type: "info",
      title: `${showing} active showings in progress`,
      description: "Follow up promptly after each showing to maintain momentum toward closing.",
    })
  }

  const closed = won + lost
  if (closed > 0) {
    const rate = Math.round((won / closed) * 100)
    if (rate >= 60) {
      insights.push({
        type: "positive",
        title: `Strong win rate at ${rate}%`,
        description: `${won} won vs ${lost} lost. Your qualification and closing process is effective.`,
      })
    } else if (rate >= 40) {
      insights.push({
        type: "info",
        title: `Win rate at ${rate}%`,
        description: `${won} won, ${lost} lost. Review lost deals to identify improvement areas.`,
      })
    } else {
      insights.push({
        type: "warning",
        title: `Win rate at ${rate}% — needs attention`,
        description: `${won} won vs ${lost} lost. Consider revisiting your qualification criteria.`,
      })
    }
  }

  const activePipeline = qualified + showing
  if (total > 0 && activePipeline / total > 0.3) {
    insights.push({
      type: "positive",
      title: `Healthy pipeline at ${Math.round((activePipeline / total) * 100)}%`,
      description: `${activePipeline} leads are in active stages (Qualified + Showing). Keep nurturing them toward close.`,
    })
  }

  return insights
}
