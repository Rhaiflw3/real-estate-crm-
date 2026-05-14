import { LucideIcon } from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
  badge?: number
}

export type NavSection = {
  title?: string
  items: NavItem[]
}