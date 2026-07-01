"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, X, FolderKanban, List, Grid3X3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast, Toaster } from "@/components/ui/use-toast"
import { AddPortfolioDialog } from "@/components/portfolio/AddPortfolioDialog"
import { ImportExcelDialog } from "@/components/portfolio/ImportExcelDialog"
import type { Portfolio } from "@/lib/types/portfolio"

const PORTFOLIO_TYPES = ["Standard", "PRO"] as const

function PortfolioSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-8 w-20 bg-slate-200 rounded-full animate-pulse" />
            <div className="h-8 w-16 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTypes, setActiveTypes] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { toast } = useToast()

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/portfolios")
        if (response.ok) {
          const data = await response.json()
          setPortfolios(data)
        }
      } catch (error) {
        console.error("Error fetching portfolios:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPortfolios()
  }, [])

  const filteredPortfolios = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return portfolios.filter((p) => {
      if (activeTypes.length > 0 && !activeTypes.includes(p.type)) return false
      if (query && !p.name.toLowerCase().includes(query)) return false
      return true
    })
  }, [portfolios, searchQuery, activeTypes])

  const handleTypeToggle = useCallback((type: string) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setActiveTypes([])
  }, [])

  const hasActiveFilters = searchQuery.trim().length > 0 || activeTypes.length > 0

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cartera</h1>
          <p className="text-slate-600 mt-2">Manage your property portfolios</p>
        </div>
        <div className="flex items-center gap-3">
          <ImportExcelDialog onImportComplete={() => window.location.reload()} />
          <AddPortfolioDialog onPortfolioAdded={(portfolio) => setPortfolios((prev) => [portfolio, ...prev])} />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="h-9 w-9"
          >
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-6">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search portfolios..."
            className="pl-9 h-9 rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-blue-700 focus-visible:ring-2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PORTFOLIO_TYPES.map((type) => {
            const isActive = activeTypes.includes(type)
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeToggle(type)}
                className={`
                  inline-flex h-6 shrink-0 items-center gap-1 rounded-4xl px-2.5 py-0.5 text-xs font-medium
                  transition-all duration-150
                  ${
                    isActive
                      ? type === "PRO"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  }
                `}
              >
                {type}
              </button>
            )
          })}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleClearFilters}
              className="h-6 gap-1 rounded-4xl px-2 text-xs text-slate-500 hover:text-slate-700"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <PortfolioSkeleton />
      ) : filteredPortfolios.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">
            {hasActiveFilters
              ? "No portfolios match the current search."
              : "No portfolios yet. Create your first portfolio to organize properties."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPortfolios.map((portfolio) => (
            <Link
              key={portfolio.id}
              href={`/dashboard/portfolio/${portfolio.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {portfolio.name}
                    </h3>
                    {portfolio.year && (
                      <p className="text-xs text-slate-500">{portfolio.year}</p>
                    )}
                  </div>
                </div>
              </div>

              {portfolio.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{portfolio.description}</p>
              )}

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium ${
                  portfolio.type === "PRO"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {portfolio.type}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium ${
                  portfolio.status === "Active"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {portfolio.status}
                </span>
                <span className="text-xs text-slate-400 ml-auto">
                  {portfolio.propertyCount ?? 0} properties
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left font-semibold text-slate-700 p-4">Name</th>
                <th className="text-left font-semibold text-slate-700 p-4">Type</th>
                <th className="text-left font-semibold text-slate-700 p-4">Status</th>
                <th className="text-left font-semibold text-slate-700 p-4">Year</th>
                <th className="text-right font-semibold text-slate-700 p-4">Properties</th>
              </tr>
            </thead>
            <tbody>
              {filteredPortfolios.map((portfolio) => (
                <tr
                  key={portfolio.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => window.location.href = `/dashboard/portfolio/${portfolio.id}`}
                >
                  <td className="p-4 font-medium text-slate-900">{portfolio.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium ${
                      portfolio.type === "PRO"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {portfolio.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium ${
                      portfolio.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {portfolio.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700">{portfolio.year || "—"}</td>
                  <td className="p-4 text-right text-slate-700">{portfolio.propertyCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Toaster />
    </div>
  )
}
