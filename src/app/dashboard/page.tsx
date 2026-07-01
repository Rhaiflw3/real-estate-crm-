"use client"

"use client"

import { Users, UserPlus, ThumbsUp, Home, Trophy, TrendingUp, Target, Building2, DollarSign, BarChart3 } from "lucide-react"
import { useLeadAnalytics } from "@/hooks/use-lead-analytics"
import { usePropertyAnalytics } from "@/hooks/use-property-analytics"
import { StatCard } from "@/components/analytics/StatCard"
import { ChartCard } from "@/components/analytics/ChartCard"
import { StatusPieChart } from "@/components/analytics/StatusPieChart"
import { PipelineBarChart } from "@/components/analytics/PipelineBarChart"
import { WeeklyTrendChart } from "@/components/analytics/WeeklyTrendChart"
import { WinLossChart } from "@/components/analytics/WinLossChart"
import { ConversionFunnelView } from "@/components/analytics/ConversionFunnelView"
import { PropertyTypeChart } from "@/components/analytics/PropertyTypeChart"
import { InsightsBanner } from "@/components/analytics/InsightsBanner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(price)
}

export default function DashboardPage() {
  const {
    metrics,
    statusDistribution,
    weeklyGrowth,
    wonVsLost,
    conversionFunnel,
    insights,
    isLoading,
    isEmpty,
  } = useLeadAnalytics()

  const {
    metrics: propMetrics,
    typeDistribution: propTypeDist,
    isLoading: propLoading,
    isEmpty: propEmpty,
  } = usePropertyAnalytics()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Real-time overview of your lead pipeline and sales performance.
        </p>
      </div>

      {isEmpty && !isLoading ? (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-700">
              No data yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              Add leads from the Leads page to see your analytics dashboard populate with real metrics and charts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <InsightsBanner insights={insights} loading={isLoading} />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard
              label="Total Leads"
              value={metrics.totalLeads}
              icon={<Users className="w-5 h-5" />}
              color="text-blue-500"
              loading={isLoading}
            />
            <StatCard
              label="New Leads"
              value={metrics.newLeads}
              icon={<UserPlus className="w-5 h-5" />}
              color="text-blue-500"
              loading={isLoading}
            />
            <StatCard
              label="Qualified"
              value={metrics.qualifiedLeads}
              icon={<ThumbsUp className="w-5 h-5" />}
              color="text-purple-500"
              loading={isLoading}
            />
            <StatCard
              label="Active Showings"
              value={metrics.activeShowings}
              icon={<Home className="w-5 h-5" />}
              color="text-amber-500"
              loading={isLoading}
            />
            <StatCard
              label="Won Deals"
              value={metrics.wonDeals}
              icon={<Trophy className="w-5 h-5" />}
              color="text-emerald-500"
              loading={isLoading}
            />
            <StatCard
              label="Conversion Rate"
              value={metrics.conversionRate > 0 ? `${metrics.conversionRate}%` : "—"}
              icon={<TrendingUp className="w-5 h-5" />}
              color="text-slate-500"
              loading={isLoading}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Total Properties"
                value={propMetrics.totalProperties}
                icon={<Building2 className="w-5 h-5" />}
                color="text-blue-500"
                loading={propLoading}
              />
              <StatCard
                label="Total Value"
                value={formatPrice(propMetrics.totalValue)}
                icon={<DollarSign className="w-5 h-5" />}
                color="text-emerald-500"
                loading={propLoading}
              />
              <StatCard
                label="Average Price"
                value={formatPrice(propMetrics.averagePrice)}
                icon={<BarChart3 className="w-5 h-5" />}
                color="text-purple-500"
                loading={propLoading}
              />
              <StatCard
                label="Available"
                value={propMetrics.availableCount}
                icon={<Home className="w-5 h-5" />}
                color="text-green-500"
                loading={propLoading}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard
                title="Property Type Distribution"
                description="Properties grouped by type"
                loading={propLoading}
                empty={propEmpty}
              >
                <PropertyTypeChart data={propTypeDist} />
              </ChartCard>
              <ChartCard
                title="Sold vs Off-Market"
                description="Property status summary"
                loading={propLoading}
                empty={propEmpty}
                emptyMessage="No property data yet."
              >
                <div className="grid grid-cols-2 gap-4 h-[260px] content-center">
                  <div className="text-center p-6 rounded-xl bg-blue-50 border border-blue-100">
                    <div className="text-3xl font-bold text-blue-600">{propMetrics.soldCount}</div>
                    <div className="text-sm text-blue-700 mt-1">Sold</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="text-3xl font-bold text-amber-600">{propMetrics.pendingCount}</div>
                    <div className="text-sm text-amber-700 mt-1">Pending</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="text-3xl font-bold text-emerald-600">{propMetrics.availableCount}</div>
                    <div className="text-sm text-emerald-700 mt-1">Available</div>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-3xl font-bold text-slate-600">{propMetrics.offMarketCount}</div>
                    <div className="text-sm text-slate-700 mt-1">Off Market</div>
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Leads</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Lead Status Distribution"
              description="Current leads grouped by pipeline stage"
              loading={isLoading}
              empty={isEmpty}
            >
              <StatusPieChart data={statusDistribution} />
            </ChartCard>
            <ChartCard
              title="Pipeline Distribution"
              description="Volume of leads at each stage"
              loading={isLoading}
              empty={isEmpty}
            >
              <PipelineBarChart data={statusDistribution} />
            </ChartCard>
            <ChartCard
              title="Weekly Lead Growth"
              description="New leads added per week"
              loading={isLoading}
              empty={isEmpty}
              emptyMessage="Not enough data to show trends yet."
            >
              <WeeklyTrendChart data={weeklyGrowth} />
            </ChartCard>
            <ChartCard
              title="Won vs Lost"
              description="Closed deal outcomes"
              loading={isLoading}
              empty={isEmpty}
              emptyMessage="No closed deals yet."
            >
              <WinLossChart data={wonVsLost} />
            </ChartCard>
          </div>
          </div>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-500" />
                <CardTitle className="text-sm font-semibold text-slate-700">
                  Conversion Funnel
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isEmpty ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-sm text-slate-400">
                    Add leads to see your conversion funnel.
                  </p>
                </div>
              ) : (
                <ConversionFunnelView data={conversionFunnel} />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Win / Loss Ratio"
              value={metrics.winLossRatio === Infinity ? "—" : metrics.winLossRatio}
              icon={<Target className="w-5 h-5" />}
              color="text-emerald-500"
              loading={isLoading}
            />
            <StatCard
              label="Pipeline Health"
              value={`${metrics.pipelineHealth}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color={metrics.pipelineHealth >= 30 ? "text-emerald-500" : "text-amber-500"}
              loading={isLoading}
            />
            <StatCard
              label="Lost Leads"
              value={metrics.lostLeads}
              icon={<TrendingUp className="w-5 h-5" />}
              color="text-red-500"
              loading={isLoading}
            />
          </div>
        </>
      )}
    </div>
  )
}