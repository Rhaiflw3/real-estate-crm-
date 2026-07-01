"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, X } from "lucide-react"
import { AddPropertyDialog } from "@/components/properties/AddPropertyDialog"
import { PropertyDetailDrawer } from "@/components/properties/PropertyDetailDrawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast, Toaster } from "@/components/ui/use-toast"
import type { Property } from "@/lib/types/property"
import { PROPERTY_STATUSES, STATUS_STYLES } from "@/lib/constants/property-constants"
import type { PropertyStatus } from "@/lib/constants/property-constants"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price)
}

function PropertiesSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><div className="h-4 w-32 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-8 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-8 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-12 bg-slate-200 rounded animate-pulse ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatuses, setActiveStatuses] = useState<PropertyStatus[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/properties')
        if (response.ok) {
          const data = await response.json()
          setProperties(data)
        } else {
          console.error('Error fetching properties:', response.status)
        }
      } catch (error) {
        console.error('Network error fetching properties:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const filteredProperties = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return properties.filter((p) => {
      if (activeStatuses.length > 0 && !activeStatuses.includes(p.status as PropertyStatus)) {
        return false
      }

      if (query) {
        const title = p.title.toLowerCase()
        const city = (p.city || '').toLowerCase()
        const address = (p.address || '').toLowerCase()
        if (!title.includes(query) && !city.includes(query) && !address.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [properties, searchQuery, activeStatuses])

  const handleStatusToggle = useCallback((status: PropertyStatus) => {
    setActiveStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setActiveStatuses([])
  }, [])

  const handleRowClick = (property: Property) => {
    setSelectedProperty(property)
    setDrawerOpen(true)
  }

  const handlePropertyAdded = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev])
  }

  const handlePropertyUpdated = (updatedProperty: Property) => {
    setProperties(prev => prev.map(p =>
      p.id === updatedProperty.id ? updatedProperty : p
    ))
    setSelectedProperty(updatedProperty)
  }

  const handlePropertyDeleted = (deletedId: string) => {
    setProperties(prev => prev.filter(p => p.id !== deletedId))
    setSelectedProperty(null)
  }

  const handleStatusChange = async (id: string, newStatus: Property['status']) => {
    const prevProperties = [...properties]

    setProperties(prev => prev.map(p =>
      p.id === id ? { ...p, status: newStatus } : p
    ))

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        setProperties(prevProperties)
        toast({
          title: "❌ Error updating status",
          description: "Could not update the property status",
          variant: "destructive",
        })
      }
    } catch {
      setProperties(prevProperties)
      toast({
        title: "❌ Network error",
        description: "Could not connect to the server",
        variant: "destructive",
      })
    }
  }

  const hasActiveFilters = searchQuery.trim().length > 0 || activeStatuses.length > 0

  return (
    <>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Properties</h1>
            <p className="text-slate-600 mt-2">
              Manage your property listings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AddPropertyDialog onPropertyAdded={handlePropertyAdded} />
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-6">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, city, or address..."
              className="pl-9 h-9 rounded-xl border-slate-200 bg-white text-sm focus-visible:ring-blue-700 focus-visible:ring-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {PROPERTY_STATUSES.map((status) => {
              const isActive = activeStatuses.includes(status)
              const style = STATUS_STYLES[status]
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusToggle(status)}
                  className={`
                    inline-flex h-6 shrink-0 items-center gap-1 rounded-4xl px-2.5 py-0.5 text-xs font-medium
                    transition-all duration-150
                    ${
                      isActive
                        ? style.className
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }
                  `}
                >
                  {status}
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

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Title</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Price</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Beds</TableHead>
                <TableHead className="font-semibold text-slate-700">Baths</TableHead>
                <TableHead className="font-semibold text-slate-700">City</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <PropertiesSkeleton />
              ) : filteredProperties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-sm text-slate-500">
                    {hasActiveFilters
                      ? "No properties match the current search."
                      : "No properties yet. Add your first property above."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProperties.map((property) => {
                  const triggerStyle = STATUS_STYLES[property.status as PropertyStatus]
                  return (
                    <TableRow
                      key={property.id}
                      className="hover:bg-slate-100/50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(property)}
                    >
                      <TableCell className="font-medium text-slate-900">
                        {property.title}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {property.type}
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium">
                        {formatPrice(property.price)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={property.status}
                          onValueChange={(value) => handleStatusChange(property.id, value as Property['status'])}
                        >
                          <SelectTrigger
                            className={`h-6 w-fit gap-1 rounded-4xl border-transparent px-2 py-0.5 text-xs font-medium ${triggerStyle.className}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROPERTY_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {property.bedrooms ?? '—'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {property.bathrooms ?? '—'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {property.city || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-slate-900"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRowClick(property)
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PropertyDetailDrawer
        property={selectedProperty}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onPropertyUpdated={handlePropertyUpdated}
        onPropertyDeleted={handlePropertyDeleted}
      />
      <Toaster />
    </>
  )
}
