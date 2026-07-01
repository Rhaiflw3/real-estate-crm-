import { LayoutDashboard, Users, Home, Calendar, FolderKanban, FileText } from "lucide-react"
import { NavItem } from "../types/navigation"

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: Users,
    badge: 12
  },
  {
    label: "Properties",
    href: "/dashboard/properties",
    icon: Home
  },
  {
    label: "Cartera",
    href: "/dashboard/portfolio",
    icon: FolderKanban
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: FileText
  },
]