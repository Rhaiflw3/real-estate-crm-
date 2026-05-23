"use client"

import { useState, type ReactNode } from "react"
import { STATUS_STYLES } from "@/lib/constants/lead-status"
import type { LeadStatus } from "@/lib/constants/lead-status"
import type { Lead } from "@/lib/types/lead"

interface KanbanColumnProps {
  status: LeadStatus
  leads: Lead[]
  onDrop: (e: React.DragEvent, status: LeadStatus) => void
  children: ReactNode
}

export function KanbanColumn({ status, leads, onDrop, children }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const style = STATUS_STYLES[status]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target || e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(e, status)
  }

  const dotColor = style.className.split(" ").find((c) => c.startsWith("bg-")) || "bg-slate-400"

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex shrink-0 w-72 flex-col rounded-2xl border transition-all duration-150 ${
        isDragOver
          ? "border-blue-400 bg-blue-50/50 shadow-md"
          : "border-slate-200 bg-slate-50/80"
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <h3 className="text-sm font-semibold text-slate-700">{status}</h3>
        <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[120px]">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-full py-8">
            <p className="text-xs text-slate-400">
              {isDragOver ? "Drop here" : "No leads"}
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
