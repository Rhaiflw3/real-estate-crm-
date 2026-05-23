"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { STATUS_STYLES } from "@/lib/constants/lead-status"
import type { LeadStatus } from "@/lib/constants/lead-status"

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const style = STATUS_STYLES[status]
  return (
    <Badge variant={style.variant} className={cn(style.className, className)}>
      {status}
    </Badge>
  )
}
