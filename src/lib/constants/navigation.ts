import { LayoutDashboard, Users, Home, Calendar } from "lucide-react"
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
  // TODO: Properties — route not yet created
  // {
  //   label: "Properties",
  //   href: "/dashboard/properties",
  //   icon: Home
  // },
  // TODO: Calendar — route not yet created
  // {
  //   label: "Calendar",
  //   href: "/dashboard/calendar",
  //   icon: Calendar
  // }
]