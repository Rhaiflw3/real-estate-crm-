"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { NAV_ITEMS } from "@/lib/constants/navigation"
import { cn } from "@/lib/utils"
import { Building } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="lg:hidden">
        <button className="p-2 text-slate-600 hover:text-slate-900">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 border-r border-slate-800/20 bg-slate-950">
        <SheetHeader className="p-6 border-b border-slate-800/20 text-left">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <SheetTitle className="font-bold text-lg text-white tracking-tight">
                RF Realty
              </SheetTitle>
              <span className="text-xs text-slate-400">Premium CRM</span>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item)
              return (
                <li key={item.href}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors",
                        active
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400")} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SheetClose>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800/20">
          <div className="px-4 py-3 rounded-lg bg-slate-900/50">
            <p className="text-sm text-slate-400">Agent: John Doe</p>
            <p className="text-xs text-slate-500 mt-1">Premium Subscription</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}