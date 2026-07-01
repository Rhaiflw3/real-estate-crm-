"use client"

import type { FunnelStageItem } from "@/lib/analytics/chart-data"

interface ConversionFunnelViewProps {
  data: FunnelStageItem[]
}

export function ConversionFunnelView({ data }: ConversionFunnelViewProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-400">No funnel data to display.</p>
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-3">
      {data.map((stage, index) => {
        const barWidth = Math.max((stage.count / maxCount) * 100, 4)
        const isLast = index === data.length - 1

        return (
          <div key={stage.stage} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{stage.stage}</span>
              <span className="text-slate-500 tabular-nums">{stage.count}</span>
            </div>
            <div className="relative h-8 rounded-lg bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor:
                    stage.stage === "Won"
                      ? "#10b981"
                      : stage.stage === "Lost"
                      ? "#ef4444"
                      : stage.stage === "Qualified"
                      ? "#a855f7"
                      : stage.stage === "Showing"
                      ? "#f59e0b"
                      : stage.stage === "Contacted"
                      ? "#86efac"
                      : stage.stage === "New"
                      ? "#3b82f6"
                      : "var(--color-chart-1)",
                }}
              />
            </div>
            {!isLast && stage.dropRate > 0 && (
              <p className="text-xs text-slate-400">
                {stage.dropRate}% drop from previous stage
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
