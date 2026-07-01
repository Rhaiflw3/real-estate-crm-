"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FolderKanban, Plus, Trash2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast, Toaster } from "@/components/ui/use-toast"
import type { PortfolioWithProperties } from "@/lib/types/portfolio"
import type { Property } from "@/lib/types/property"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(price)
}

export default function PortfolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [portfolio, setPortfolio] = useState<PortfolioWithProperties | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch(`/api/portfolios/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setPortfolio(data)
        } else {
          toast({ title: "❌ Error", description: "Portfolio not found", variant: "destructive" })
        }
      } catch {
        toast({ title: "❌ Network error", description: "Could not load portfolio", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    if (params.id) fetchPortfolio()
  }, [params.id, toast])

  const handleRemoveProperty = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/portfolios/${params.id}/properties?propertyId=${propertyId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setPortfolio((prev) =>
          prev ? { ...prev, properties: prev.properties.filter((p: any) => p.id !== propertyId) } : prev
        )
        toast({ title: "✅ Property removed", description: "Removed from portfolio" })
      }
    } catch {
      toast({ title: "❌ Error", description: "Could not remove property", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 bg-slate-50/50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="p-8 bg-slate-50/50 min-h-screen">
        <p className="text-slate-500">Portfolio not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/portfolio")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Portfolios
        </Button>
      </div>
    )
  }

  const totalValue = portfolio.properties.reduce((sum: number, p: any) => sum + (p.price || 0), 0)
  const avgPrice = portfolio.properties.length > 0 ? totalValue / portfolio.properties.length : 0

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen">
      <Button variant="ghost" className="mb-6 text-slate-600 hover:text-slate-900" onClick={() => router.push("/dashboard/portfolio")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Portfolios
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <FolderKanban className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">{portfolio.name}</h1>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium ${
              portfolio.type === "PRO" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
            }`}>
              {portfolio.type}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium ${
              portfolio.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
            }`}>
              {portfolio.status}
            </span>
            {portfolio.year && <span className="text-sm text-slate-500">{portfolio.year}</span>}
          </div>
          {portfolio.description && (
            <p className="text-slate-600 mt-3">{portfolio.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500 mb-1">Total Properties</p>
          <p className="text-2xl font-bold text-slate-900">{portfolio.properties.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-slate-900">{formatPrice(totalValue)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500 mb-1">Avg Price</p>
          <p className="text-2xl font-bold text-slate-900">{formatPrice(avgPrice)}</p>
        </div>
      </div>

      {/* Properties Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Properties ({portfolio.properties.length})</h2>
        </div>
        {portfolio.properties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No properties in this portfolio yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left font-semibold text-slate-700 p-4">Title</th>
                <th className="text-left font-semibold text-slate-700 p-4">Type</th>
                <th className="text-left font-semibold text-slate-700 p-4">Price</th>
                <th className="text-left font-semibold text-slate-700 p-4">Status</th>
                <th className="text-right font-semibold text-slate-700 p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(portfolio.properties as any[]).map((property) => (
                <tr key={property.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{property.title}</td>
                  <td className="p-4 text-slate-700">{property.type}</td>
                  <td className="p-4 text-slate-700 font-medium">{formatPrice(property.price)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
                      {property.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveProperty(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Toaster />
    </div>
  )
}
