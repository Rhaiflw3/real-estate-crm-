export const PROPERTY_STATUSES = [
  "Available",
  "Pending",
  "Sold",
  "Rented",
  "OffMarket",
] as const

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number]

export const PROPERTY_TYPES = [
  "House",
  "Apartment",
  "Condo",
  "Land",
  "Commercial",
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]

export const STATUS_STYLES: Record<
  PropertyStatus,
  { variant: "default" | "secondary" | "outline"; className: string }
> = {
  Available: { variant: "default", className: "bg-emerald-500 text-white" },
  Pending: { variant: "secondary", className: "bg-amber-100 text-amber-800" },
  Sold: { variant: "default", className: "bg-blue-500 text-white" },
  Rented: { variant: "secondary", className: "bg-purple-100 text-purple-800" },
  OffMarket: { variant: "outline", className: "bg-slate-100 text-slate-600" },
}
