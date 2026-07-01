"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { PropertyTypeDistribution } from "@/lib/analytics/property-metrics"

const COLORS: Record<string, string> = {
  House: "#3b82f6",
  Apartment: "#10b981",
  Condo: "#f59e0b",
  Land: "#8b5cf6",
  Commercial: "#ef4444",
}

interface PropertyTypeChartProps {
  data: PropertyTypeDistribution[]
}

export function PropertyTypeChart({ data }: PropertyTypeChartProps) {
  const hasData = data.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[260px]">
        <p className="text-sm text-slate-400">No property data to display.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="type" tick={{ fontSize: 12 }} width={90} />
        <Tooltip
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          formatter={(value: any) => [value, ""]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={800}>
          {data.map((entry, i) => (
            <Cell key={i} fill={COLORS[entry.type] || "#94a3b8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
