"use client"

import { Lightbulb, AlertTriangle, Info } from "lucide-react"
import type { Insight } from "@/lib/analytics/insights"

interface InsightsBannerProps {
  insights: Insight[]
  loading?: boolean
}

const iconMap = {
  positive: Lightbulb,
  warning: AlertTriangle,
  info: Info,
} as const

const styleMap = {
  positive: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
} as const

const iconStyleMap = {
  positive: "text-emerald-500",
  warning: "text-amber-500",
  info: "text-blue-500",
} as const

export function InsightsBanner({ insights, loading }: InsightsBannerProps) {
  if (loading) {
    return (
      <div className="flex gap-3 pb-2 overflow-x-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="shrink-0 w-72 h-20 rounded-xl border border-slate-200 bg-white p-4 animate-pulse"
          >
            <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-48 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (insights.length === 0) return null

  return (
    <div className="flex gap-3 pb-2 overflow-x-auto">
      {insights.map((insight, index) => {
        const Icon = iconMap[insight.type]
        return (
          <div
            key={index}
            className={`shrink-0 w-80 rounded-xl border p-4 ${styleMap[insight.type]}`}
          >
            <div className="flex items-start gap-2.5">
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconStyleMap[insight.type]}`} />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{insight.title}</p>
                <p className="text-xs mt-1 opacity-80">{insight.description}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
