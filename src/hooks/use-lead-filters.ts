"use client"

import { useMemo, useDeferredValue } from "react"
import type { LeadStatus } from "@/lib/constants/lead-status"
import type { Lead } from "@/lib/types/lead"

export interface LeadFilters {
  searchQuery: string
  activeStatuses: LeadStatus[]
}

export function useLeadFilters(
  leads: Lead[],
  filters: LeadFilters
): { filteredLeads: Lead[]; hasActiveFilters: boolean } {
  const deferredSearch = useDeferredValue(filters.searchQuery)
  const deferredStatuses = useDeferredValue(filters.activeStatuses)

  const filteredLeads = useMemo(() => {
    let result = leads

    if (deferredStatuses.length > 0) {
      result = result.filter((lead) => deferredStatuses.includes(lead.status))
    }

    const query = deferredSearch.trim().toLowerCase()
    if (query) {
      result = result.filter((lead) => {
        const name = lead.name.toLowerCase()
        const email = lead.email.toLowerCase()
        const phone = (lead.phone ?? "").toLowerCase()
        return (
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query)
        )
      })
    }

    return result
  }, [leads, deferredSearch, deferredStatuses])

  const hasActiveFilters =
    deferredSearch.trim().length > 0 || deferredStatuses.length > 0

  return { filteredLeads, hasActiveFilters }
}
