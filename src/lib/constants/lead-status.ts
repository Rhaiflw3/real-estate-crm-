export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Showing",
  "Won",
  "Lost",
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const CLOSED_STATUSES: LeadStatus[] = ["Won", "Lost"]

export const STATUS_STYLES: Record<
  LeadStatus,
  { variant: "default" | "secondary" | "outline"; className: string }
> = {
  New: { variant: "default", className: "bg-blue-500 text-white" },
  Contacted: { variant: "secondary", className: "bg-green-100 text-green-800" },
  Qualified: { variant: "default", className: "bg-purple-500 text-white" },
  Showing: { variant: "secondary", className: "bg-amber-100 text-amber-800" },
  Won: { variant: "default", className: "bg-emerald-500 text-white" },
  Lost: { variant: "secondary", className: "bg-red-100 text-red-800" },
}

export function isClosedStatus(status: LeadStatus): boolean {
  return CLOSED_STATUSES.includes(status)
}
