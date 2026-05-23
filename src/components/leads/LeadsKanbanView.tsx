"use client"

import { useMemo } from "react"
import { LEAD_STATUSES } from "@/lib/constants/lead-status"
import type { LeadStatus } from "@/lib/constants/lead-status"
import type { Lead } from "@/lib/types/lead"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanLeadCard } from "./KanbanLeadCard"

interface LeadsKanbanViewProps {
  leads: Lead[]
  activeStatuses: LeadStatus[]
  onStatusChange: (id: string, newStatus: LeadStatus) => void
  onCardClick: (lead: Lead) => void
}

export function LeadsKanbanView({
  leads,
  activeStatuses,
  onStatusChange,
  onCardClick,
}: LeadsKanbanViewProps) {
  const groupedLeads = useMemo(() => {
    const groups: Record<LeadStatus, Lead[]> = {} as Record<LeadStatus, Lead[]>
    for (const status of LEAD_STATUSES) {
      groups[status] = []
    }
    for (const lead of leads) {
      if (groups[lead.status]) {
        groups[lead.status].push(lead)
      }
    }
    return groups
  }, [leads])

  const visibleStatuses = useMemo(() => {
    if (activeStatuses.length === 0) return [...LEAD_STATUSES]
    return activeStatuses
  }, [activeStatuses])

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleColumnDrop = (e: React.DragEvent, targetStatus: LeadStatus) => {
    const leadId = e.dataTransfer.getData("text/plain")
    if (!leadId) return

    const lead = leads.find((l) => l.id === leadId)
    if (!lead) return
    if (lead.status === targetStatus) return

    onStatusChange(leadId, targetStatus)
  }

  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-500">
          {activeStatuses.length > 0
            ? "No leads match the current filters."
            : "No leads yet. Add your first lead above."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-4 pb-4 overflow-x-auto">
      {visibleStatuses.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          leads={groupedLeads[status]}
          onDrop={handleColumnDrop}
        >
          {groupedLeads[status].map((lead) => (
            <KanbanLeadCard
              key={lead.id}
              lead={lead}
              onCardClick={onCardClick}
              onDragStart={handleDragStart}
            />
          ))}
        </KanbanColumn>
      ))}
    </div>
  )
}
