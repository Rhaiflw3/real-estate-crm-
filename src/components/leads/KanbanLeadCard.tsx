"use client"

import { Eye } from "lucide-react"
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge"
import { Button } from "@/components/ui/button"
import type { Lead } from "@/lib/types/lead"

interface KanbanLeadCardProps {
  lead: Lead
  onCardClick: (lead: Lead) => void
  onDragStart: (e: React.DragEvent, leadId: string) => void
}

function extractFromSummary(summary?: string): { budget?: string; interest?: string } {
  if (!summary) return {}
  const budgetMatch = summary.match(/Presupuesto:\s*([^.]+)/)
  const interestMatch = summary.match(/Interesado en:\s*([^.]+)/)
  return {
    budget: budgetMatch?.[1]?.trim(),
    interest: interestMatch?.[1]?.trim(),
  }
}

export function KanbanLeadCard({ lead, onCardClick, onDragStart }: KanbanLeadCardProps) {
  const { budget, interest } = extractFromSummary(lead.aiSummary)

  const handleClick = () => {
    onCardClick(lead)
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={handleClick}
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md hover:border-slate-300 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm truncate">
            {lead.name}
          </h3>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {lead.email}
          </p>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      {lead.phone && (
        <p className="text-xs text-slate-600 mb-1.5">
          {lead.phone}
        </p>
      )}

      {(budget || interest) && (
        <div className="space-y-1 mb-3">
          {budget && (
            <p className="text-xs text-slate-600">
              <span className="text-slate-400">Budget:</span> {budget}
            </p>
          )}
          {interest && (
            <p className="text-xs text-slate-600">
              <span className="text-slate-400">Interest:</span> {interest}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <p className="text-[11px] text-slate-400">
          {new Date(lead.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
        <Button
          variant="ghost"
          size="xs"
          className="h-7 px-2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onCardClick(lead)
          }}
        >
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
      </div>
    </div>
  )
}
