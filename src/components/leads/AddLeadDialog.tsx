"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import type { Lead, CreateLeadInput } from "@/lib/types/lead"

const initialFormData: CreateLeadInput = {
  name: "",
  email: "",
  phone: "",
  source: "Web",
  status: "New",
  notes: "",
}

interface AddLeadDialogProps {
  onLeadAdded?: (lead: Lead) => void
}

export function AddLeadDialog({ onLeadAdded }: AddLeadDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateLeadInput>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof CreateLeadInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          source: formData.source,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        const newLead: Lead = {
          id: data.leadId,
          name: formData.name,
          email: formData.email,
          status: formData.status as Lead['status'],
          source: formData.source === 'Web' ? 'Website' : formData.source,
          createdAt: new Date().toISOString().split('T')[0],
          phone: formData.phone,
          notes: formData.notes,
        }
        
        // Reset form and close dialog
        setFormData(initialFormData)
        setOpen(false)
        
        toast({
          title: "✅ Lead creado exitosamente",
          description: `${newLead.name} ha sido añadido a la lista.`,
        })
        
        // Pass new lead to parent for immediate UI update
        if (onLeadAdded) {
          onLeadAdded(newLead)
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Error al crear lead",
          description: errorData.error || 'Error desconocido',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating lead:", error)
      toast({
        title: "❌ Error de red",
        description: "No se pudo conectar con el servidor",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData(initialFormData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Añadir Nuevo Lead
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Completa la información del nuevo contacto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">
              Nombre Completo
            </Label>
            <Input
              id="name"
              placeholder="Ej: María González"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="focus-visible:ring-blue-700 focus-visible:ring-2"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="focus-visible:ring-blue-700 focus-visible:ring-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 font-medium">
                Teléfono
              </Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className="focus-visible:ring-blue-700 focus-visible:ring-2"
              />
            </div>
          </div>

          {/* Source & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source" className="text-slate-700 font-medium">
                Origen
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value: CreateLeadInput['source']) => 
                  handleInputChange("source", value)
                }
              >
                <SelectTrigger className="focus-visible:ring-blue-700 focus-visible:ring-2">
                  <SelectValue placeholder="Selecciona un origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Web">Web</SelectItem>
                  <SelectItem value="Referido">Referido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700 font-medium">
                Estado Inicial
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: CreateLeadInput['status']) => 
                  handleInputChange("status", value)
                }
              >
                <SelectTrigger className="focus-visible:ring-blue-700 focus-visible:ring-2">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">Nuevo</SelectItem>
                  <SelectItem value="Contacted">Contactado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-700 font-medium">
              Nota Inicial
            </Label>
            <Textarea
              id="notes"
              placeholder="Agrega cualquier información relevante sobre este lead..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="min-h-[100px] focus-visible:ring-blue-700 focus-visible:ring-2 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-slate-700 hover:text-slate-900"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              {isSubmitting ? "Guardando..." : "Guardar Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}