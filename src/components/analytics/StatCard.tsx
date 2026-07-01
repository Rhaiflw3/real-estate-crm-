"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: string
  trendDirection?: "up" | "down" | "neutral"
  color?: string
  loading?: boolean
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendDirection = "neutral",
  color = "text-blue-500",
  loading = false,
}: StatCardProps) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-500">
            {label}
          </CardTitle>
          {icon && <div className={cn("w-5 h-5", color)}>{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-20 rounded-md bg-slate-200 animate-pulse" />
            {trend && <div className="h-4 w-32 rounded-md bg-slate-100 animate-pulse" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900">{value}</div>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={cn(
                    "text-sm",
                    trendDirection === "up" && "text-green-600",
                    trendDirection === "down" && "text-red-600",
                    trendDirection === "neutral" && "text-slate-500"
                  )}
                >
                  {trend}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
