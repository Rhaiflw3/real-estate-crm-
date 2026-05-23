"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LEAD_STATUSES, STATUS_STYLES } from "@/lib/constants/lead-status"
import type { LeadStatus } from "@/lib/constants/lead-status"

interface LeadsFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  activeStatuses: LeadStatus[]
  onStatusToggle: (status: LeadStatus) => void
  onClear?: () => void
}

export function LeadsFilterBar({
  searchQuery,
  onSearchChange,
  activeStatuses,
  onStatusToggle,
  onClear,
}: LeadsFilterBarProps) {
  const hasActiveFilters = searchQuery.trim().length > 0 || activeStatuses.length > 0

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-6">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="pl-9 h-9 rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-blue-700 focus-visible:ring-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {LEAD_STATUSES.map((status) => {
          const isActive = activeStatuses.includes(status)
          const style = STATUS_STYLES[status]
          return (
            <button
              key={status}
              type="button"
              onClick={() => onStatusToggle(status)}
              className={`
                inline-flex h-6 shrink-0 items-center gap-1 rounded-4xl px-2.5 py-0.5 text-xs font-medium
                transition-all duration-150
                ${
                  isActive
                    ? style.className
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }
              `}
            >
              {status}
            </button>
          )
        })}

        {hasActiveFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onClear?.()}
              className="h-6 gap-1 rounded-4xl px-2 text-xs text-slate-500 hover:text-slate-700"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
      </div>
    </div>
  )
}
