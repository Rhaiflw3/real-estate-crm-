"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  loading?: boolean
  empty?: boolean
  emptyMessage?: string
  action?: ReactNode
}

export function ChartCard({
  title,
  description,
  children,
  loading = false,
  empty = false,
  emptyMessage = "No data available yet.",
  action,
}: ChartCardProps) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-700">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                {description}
              </CardDescription>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[260px]">
            <div className="w-full h-full rounded-lg bg-slate-100 animate-pulse" />
          </div>
        ) : empty ? (
          <div className="flex items-center justify-center h-[260px]">
            <p className="text-sm text-slate-400">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
