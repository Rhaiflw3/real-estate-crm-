"use client"

import { useState, useEffect, useCallback } from "react"
import { LayoutList, Kanban } from "lucide-react"
import { AddLeadDialog } from "@/components/leads/AddLeadDialog"
import { LeadDetailDrawer } from "@/components/layout/LeadDetailDrawer"
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge"
import { LeadsFilterBar } from "@/components/leads/LeadsFilterBar"
import { LeadsKanbanView } from "@/components/leads/LeadsKanbanView"
import { useLeadFilters } from "@/hooks/use-lead-filters"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast, Toaster } from "@/components/ui/use-toast"
import type { Lead } from "@/lib/types/lead"
import { STATUS_STYLES, LEAD_STATUSES } from "@/lib/constants/lead-status"
import type { LeadStatus } from "@/lib/constants/lead-status"

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "María González",
    email: "maria.gonzalez@email.com",
    status: "New",
    source: "Website",
    createdAt: "2024-02-15",
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@email.com",
    status: "Contacted",
    source: "Referral",
    createdAt: "2024-02-14",
  },
  {
    id: "3",
    name: "Ana Martínez",
    email: "ana.martinez@email.com",
    status: "Qualified",
    source: "Social Media",
    createdAt: "2024-02-13",
  },
  {
    id: "4",
    name: "Luis Fernández",
    email: "luis.fernandez@email.com",
    status: "Contacted",
    source: "Website",
    createdAt: "2024-02-10",
  },
  {
    id: "5",
    name: "Sofía López",
    email: "sofia.lopez@email.com",
    status: "New",
    source: "Event",
    createdAt: "2024-02-08",
  },
]



export default function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatuses, setActiveStatuses] = useState<LeadStatus[]>([])
  const [viewMode, setViewMode] = useState<"table" | "pipeline">("table")
  const { toast } = useToast()

  const { filteredLeads, hasActiveFilters } = useLeadFilters(leads, {
    searchQuery,
    activeStatuses,
  })

  const handleStatusToggle = useCallback((status: LeadStatus) => {
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

  // Cargar leads desde la API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/leads')
        if (response.ok) {
          const data = await response.json()
          setLeads(data)
        } else {
          console.error('Error fetching leads:', response.status)
          // Si falla, usamos datos mock como fallback
          setLeads(mockLeads)
        }
      } catch (error) {
        console.error('Network error fetching leads:', error)
        setLeads(mockLeads)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  const handleLeadAdded = (newLead: Lead) => {
    console.log("New lead added to list:", newLead.name)
    setLeads(prev => [newLead, ...prev])
  }

  const simulateAIInput = async () => {
    const firstNames = ['María', 'Carlos', 'Ana', 'Luis', 'Sofía', 'Diego', 'Valentina', 'Andrés', 'Camila', 'Javier', 'Isabella', 'Fernando', 'Lucía', 'Gabriel', 'Ximena', 'Ricardo', 'Daniela', 'Santiago', 'Paula', 'Alejandro']
    const lastNames = ['González', 'Rodríguez', 'Martínez', 'Fernández', 'López', 'Ramírez', 'Torres', 'Pérez', 'Castillo', 'Morales', 'Ortiz', 'Vargas', 'Reyes', 'Cruz', 'Mendoza', 'García', 'Rivas', 'Soto', 'Peña', 'Medina']
    const emailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'yahoo.com', 'correo.com']
    const propertyTypes = ['casa de 3 habitaciones', 'apartamento de 2 habitaciones', 'casa de 4 habitaciones', 'penthouse', 'casa con jardín', 'departamento', 'casa frente al mar', 'condominio', 'casa en fraccionamiento', 'ático']
    const locations = ['zona centro', 'suburbios', 'cerca de escuelas', 'área comercial', 'zona residencial', 'urbanización privada', 'cerca del parque', 'distrito financiero', 'playa', 'montaña']
    const budgetRanges = ['$250k-$350k', '$300k-$400k', '$350k-$500k', '$400k-$600k', '$500k-$750k', '$600k-$900k', '$150k-$250k', '$450k-$650k', '$800k-$1.2M']
    const sources = ['Website', 'WhatsApp', 'Referral', 'Social Media', 'Email', 'Phone Call']
    const statuses: Lead['status'][] = [...LEAD_STATUSES]
    const interests = ['modern kitchen', 'big backyard', 'swimming pool', 'home office', 'garage for 2 cars', '24/7 security', 'new construction', 'renovated', 'open floor plan', 'mountain view']

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const fullName = `${firstName} ${lastName}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${emailDomains[Math.floor(Math.random() * emailDomains.length)]}`
    const phone = `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const budget = budgetRanges[Math.floor(Math.random() * budgetRanges.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const interest = interests[Math.floor(Math.random() * interests.length)]

    const aiSummary = `Lead extraído automáticamente: Cliente busca ${propertyType} en ${location}. Presupuesto: ${budget}. Prefiere ${interest}. Contacto capturado desde ${source.toLowerCase()}.`

    const mockAIData = {
      name: fullName,
      email,
      phone,
      status: status,
      source,
      aiSummary,
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockAIData),
      })

      if (response.ok) {
        const data = await response.json()
        
        const newLead: Lead = {
          id: data.leadId,
          name: mockAIData.name,
          email: mockAIData.email,
          phone: mockAIData.phone,
          status: mockAIData.status,
          source: mockAIData.source,
          createdAt: new Date().toISOString().split('T')[0],
          aiSummary: mockAIData.aiSummary,
        }
        setLeads(prev => [newLead, ...prev])
        
        toast({
          title: "🤖 Lead simulado creado",
          description: `${newLead.name} — ${newLead.source}`,
        })
        console.log('Simulated lead:', newLead)
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Error de simulación",
          description: errorData.error || 'Failed to process AI lead',
          variant: "destructive"
        })
        console.error('Simulation error:', errorData)
      }
    } catch (error) {
      toast({
        title: "❌ Error de red",
        description: "Failed to connect to AI infrastructure",
        variant: "destructive"
      })
      console.error('Network error:', error)
    }
  }

  const handleLeadUpdated = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l =>
      l.id === updatedLead.id ? updatedLead : l
    ))
    setSelectedLead(updatedLead)
  }

  const handleLeadDeleted = (deletedId: string) => {
    setLeads(prev => prev.filter(l => l.id !== deletedId))
    setSelectedLead(null)
  }

  const handleStatusChange = async (id: string, newStatus: Lead['status']) => {
    const prevLeads = [...leads]

    // Optimistic update
    setLeads(prev => prev.map(l =>
      l.id === id ? { ...l, status: newStatus } : l
    ))

    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        setLeads(prevLeads)
        toast({
          title: "❌ Error al actualizar estado",
          description: "No se pudo actualizar el estado del lead",
          variant: "destructive",
        })
      }
    } catch {
      setLeads(prevLeads)
      toast({
        title: "❌ Error de red",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    }
  }

  
  return (
    <>
      <div className="p-8 bg-slate-50/50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
            <p className="text-slate-600 mt-2">
              Manage and track your potential contacts
            </p>
          </div>
          <div className="flex items-center gap-3">

            <AddLeadDialog onLeadAdded={handleLeadAdded} />
          </div>
        </div>

        <LeadsFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeStatuses={activeStatuses}
          onStatusToggle={handleStatusToggle}
          onClear={handleClearFilters}
        />

        <div className="flex items-center gap-1 mb-4">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "table"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode("pipeline")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "pipeline"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Pipeline
          </button>
        </div>

        {viewMode === "table" ? (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-slate-700">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Email
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Source
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Created
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-32 bg-slate-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-40 bg-slate-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-slate-200 rounded animate-pulse ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-sm text-slate-500"
                  >
                    {hasActiveFilters
                      ? "No leads match the current filters."
                      : "No leads yet. Add your first lead above."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => {
                  const triggerStyle = STATUS_STYLES[lead.status]
                  return (
                    <TableRow
                      key={lead.id}
                      className="hover:bg-slate-100/50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(lead)}
                    >
                      <TableCell className="font-medium text-slate-900">
                        {lead.name}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {lead.email}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {lead.source}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusChange(lead.id, value as Lead['status'])}
                        >
                          <SelectTrigger
                            className={`h-6 w-fit gap-1 rounded-4xl border-transparent px-2 py-0.5 text-xs font-medium ${triggerStyle.className}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-600 hover:text-slate-900"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(lead)
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              }))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <LeadsKanbanView
          leads={filteredLeads}
          activeStatuses={activeStatuses}
          onStatusChange={handleStatusChange}
          onCardClick={handleRowClick}
        />
      )}
      </div>

      <LeadDetailDrawer
        lead={selectedLead}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onLeadUpdated={handleLeadUpdated}
        onLeadDeleted={handleLeadDeleted}
      />
      <Toaster />
    </>
  )
}