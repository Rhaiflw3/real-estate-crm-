"use client"

import { useState, useEffect } from "react"
import { Search, Home, DollarSign, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { Property } from "@/lib/types/property"
import type { InterestLevel } from "@/lib/types/lead-property"

interface PropertySelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string
  onPropertyLinked?: () => void
}

export function PropertySelector({ open, onOpenChange, leadId, onPropertyLinked }: PropertySelectorProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [linking, setLinking] = useState<string | null>(null)
  const [interestLevel, setInterestLevel] = useState<InterestLevel>("Medium")
  const { toast } = useToast()

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    fetch("/api/properties")
      .then((r) => r.json())
      .then((data) => setProperties(Array.isArray(data) ? data : []))
      .catch(() => setProperties([]))
      .finally(() => setIsLoading(false))
  }, [open])

  const filtered = properties.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      (p.address?.toLowerCase().includes(q)) ||
      (p.city?.toLowerCase().includes(q))
    )
  })

  const handleLink = async (propertyId: string) => {
    setLinking(propertyId)
    try {
      const res = await fetch(`/api/leads/${leadId}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, interestLevel }),
      })
      if (res.ok) {
        toast({ title: "✅ Propiedad vinculada", description: "Propiedad asignada al lead" })
        if (onPropertyLinked) onPropertyLinked()
      } else {
        const err = await res.json()
        toast({ title: "❌ Error", description: err.error || "Error al vincular", variant: "destructive" })
      }
    } catch {
      toast({ title: "❌ Error de red", description: "No se pudo conectar", variant: "destructive" })
    } finally {
      setLinking(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Asignar Propiedad</DialogTitle>
          <DialogDescription className="text-slate-600">
            Selecciona una propiedad para vincularla a este lead
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar propiedad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 focus-visible:ring-blue-700 focus-visible:ring-2"
            />
          </div>
          <div className="w-40">
            <Select value={interestLevel} onValueChange={(v) => setInterestLevel(v as InterestLevel)}>
              <SelectTrigger className="focus-visible:ring-blue-700 focus-visible:ring-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Bajo interés</SelectItem>
                <SelectItem value="Medium">Medio interés</SelectItem>
                <SelectItem value="High">Alto interés</SelectItem>
                <SelectItem value="Offer">Oferta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-slate-400">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400">
              {search ? "Sin resultados" : "No hay propiedades disponibles"}
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-900 truncate">{p.title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{p.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {p.price.toLocaleString()}
                    </span>
                    {p.areaSqFt && (
                      <span className="flex items-center gap-1">
                        <Maximize2 className="h-3.5 w-3.5" />
                        {p.areaSqFt.toLocaleString()} sqft
                      </span>
                    )}
                    {p.city && <span>{p.city}</span>}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleLink(p.id)}
                  disabled={linking === p.id}
                  className="ml-3 shrink-0 bg-blue-700 hover:bg-blue-800 text-white"
                >
                  {linking === p.id ? "Vinculando..." : "Asignar"}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
