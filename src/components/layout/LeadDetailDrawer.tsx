"use client"

import { useState, useEffect } from "react"
import { X, Phone, Mail, Calendar, Sparkles, Home, DollarSign, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useToast } from "@/components/ui/use-toast"
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge"
import { LEAD_STATUSES } from "@/lib/constants/lead-status"
import type { LeadStatus } from "@/lib/constants/lead-status"
import type { Lead } from "@/lib/types/lead"
import type { LeadProperty } from "@/lib/types/lead-property"
import { PropertySelector } from "@/components/properties/PropertySelector"

interface LeadDetailDrawerProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onLeadUpdated?: (lead: Lead) => void
  onLeadDeleted?: (id: string) => void
}

export function LeadDetailDrawer({ lead, open, onOpenChange, onLeadUpdated, onLeadDeleted }: LeadDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Lead>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [linkedProperties, setLinkedProperties] = useState<LeadProperty[]>([])
  const [showPropertySelector, setShowPropertySelector] = useState(false)
  const [removingPropId, setRemovingPropId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!open || !lead) return;
    fetch(`/api/leads/${lead.id}/properties`)
      .then((r) => r.json())
      .then((data) => setLinkedProperties(Array.isArray(data) ? data : []))
      .catch(() => setLinkedProperties([]));
  }, [open, lead]);

  const refreshProperties = () => {
    if (!lead) return;
    fetch(`/api/leads/${lead.id}/properties`)
      .then((r) => r.json())
      .then((data) => setLinkedProperties(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const handleUnlinkProperty = async (linkId: string) => {
    if (!lead) return;
    setRemovingPropId(linkId);
    try {
      const res = await fetch(`/api/leads/${lead.id}/properties?linkId=${linkId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "✅ Desvinculado", description: "Propiedad removida del lead" });
        refreshProperties();
      } else {
        const err = await res.json();
        toast({ title: "❌ Error", description: err.error || "Error al desvincular", variant: "destructive" });
      }
    } catch {
      toast({ title: "❌ Error de red", description: "No se pudo conectar", variant: "destructive" });
    } finally {
      setRemovingPropId(null);
    }
  };

  // Reset edit mode when drawer opens/closes or lead changes
  useEffect(() => {
    if (!open) {
      setIsEditing(false)
    }
  }, [open])

  useEffect(() => {
    setIsEditing(false)
  }, [lead?.id])

  if (!lead) return null

  const startEditing = () => {
    setEditForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      status: lead.status,
      source: lead.source,
      notes: lead.notes || '',
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!lead) return

    if (!editForm.name?.trim() || !editForm.email?.trim()) {
      toast({
        title: "❌ Validation error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedLead: Lead = {
          ...lead,
          name: editForm.name || lead.name,
          email: editForm.email || lead.email,
          phone: editForm.phone || '',
          status: (editForm.status as Lead['status']) || lead.status,
          source: editForm.source || lead.source,
          notes: editForm.notes || '',
        }

        if (onLeadUpdated) {
          onLeadUpdated(updatedLead)
        }

        toast({
          title: "✅ Lead actualizado",
          description: `${updatedLead.name} ha sido actualizado.`,
        })

        setIsEditing(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Error al actualizar",
          description: errorData.error || 'Error desconocido',
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "❌ Error de red",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!lead) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        if (onLeadDeleted) {
          onLeadDeleted(lead.id)
        }

        toast({
          title: "🗑️ Lead eliminado",
          description: `${lead.name} ha sido eliminado.`,
        })

        setShowDeleteConfirm(false)
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Error al eliminar",
          description: errorData.error || 'Error desconocido',
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "❌ Error de red",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const editFormHandler = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex-1 mr-4">
                <Label htmlFor="edit-name" className="text-slate-700 font-medium mb-1 block">
                  Nombre Completo
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name || ''}
                  onChange={(e) => editFormHandler('name', e.target.value)}
                  className="focus-visible:ring-blue-700 focus-visible:ring-2"
                />
              </div>
            ) : (
              <DrawerTitle className="text-2xl font-bold text-slate-900">
                {lead.name}
              </DrawerTitle>
            )}
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription className="text-slate-600">
            Lead details and information
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-6 overflow-y-auto">
          {isEditing ? (
            <>
              {/* Edit: Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700">Contact Information</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="edit-email" className="text-slate-600">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => editFormHandler('email', e.target.value)}
                      className="focus-visible:ring-blue-700 focus-visible:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-phone" className="text-slate-600">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone || ''}
                      onChange={(e) => editFormHandler('phone', e.target.value)}
                      className="focus-visible:ring-blue-700 focus-visible:ring-2"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>
                      Created: {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit: Status */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-slate-600">Status</Label>
                    <Select
                      value={editForm.status as string}
                      onValueChange={(value) => editFormHandler('status', value)}
                    >
                      <SelectTrigger className="focus-visible:ring-blue-700 focus-visible:ring-2">
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
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-600">Source</Label>
                    <Input
                      value={editForm.source || ''}
                      onChange={(e) => editFormHandler('source', e.target.value)}
                      className="focus-visible:ring-blue-700 focus-visible:ring-2"
                    />
                  </div>
                </div>
              </div>

              {/* Edit: Notes */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Notes</h3>
                <Textarea
                  value={editForm.notes || ''}
                  onChange={(e) => editFormHandler('notes', e.target.value)}
                  className="min-h-[120px] resize-none focus-visible:ring-blue-700 focus-visible:ring-2"
                />
              </div>

              {/* Edit: AI Summary (locked) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold text-slate-700">✨ Resumen del Asistente IA</h3>
                </div>
                {lead.aiSummary ? (
                  <div className="text-sm text-slate-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100 whitespace-pre-line">
                    {lead.aiSummary}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
                    Esperando procesamiento de IA...
                  </p>
                )}
              </div>

              {/* Edit: Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSaving}
                >
                  Delete Lead
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Display: Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-700">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{lead.phone || 'No phone available'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="font-medium">Created: </span>
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Display: Status */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Status</h3>
                <LeadStatusBadge status={lead.status} />
                <p className="text-sm text-slate-600">
                  Source: <span className="font-medium">{lead.source}</span>
                </p>
              </div>

              {/* Display: Linked Properties */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">Propiedades de Interés</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPropertySelector(true)}
                    className="text-xs"
                  >
                    + Agregar
                  </Button>
                </div>
                {linkedProperties.length === 0 ? (
                  <div className="text-sm text-slate-400 bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
                    No hay propiedades vinculadas a este lead.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {linkedProperties.map((lp) => (
                      <div
                        key={lp.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="font-medium text-sm text-slate-900 truncate">
                              {lp.property?.title || 'Propiedad'}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs shrink-0 ${
                                lp.interestLevel === 'Offer' ? 'border-green-300 text-green-700 bg-green-50' :
                                lp.interestLevel === 'High' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                                lp.interestLevel === 'Medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                                'border-slate-300 text-slate-600 bg-slate-50'
                              }`}
                            >
                              {lp.interestLevel === 'Low' ? 'Bajo' :
                               lp.interestLevel === 'Medium' ? 'Medio' :
                               lp.interestLevel === 'High' ? 'Alto' : 'Oferta'}
                            </Badge>
                          </div>
                          {lp.property && (
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {lp.property.price.toLocaleString()}
                              </span>
                              <span>{lp.property.type}</span>
                              {lp.property.city && <span>{lp.property.city}</span>}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 ml-2 text-slate-400 hover:text-red-500"
                          onClick={() => handleUnlinkProperty(lp.id)}
                          disabled={removingPropId === lp.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Display: Notes */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Notes</h3>
                <div className="text-sm text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100 min-h-[60px] whitespace-pre-wrap">
                  {lead.notes || (
                    <span className="text-slate-400 italic">No notes added yet.</span>
                  )}
                </div>
              </div>

              {/* Display: AI Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold text-slate-700">✨ Resumen del Asistente IA</h3>
                </div>
                {lead.aiSummary ? (
                  <div className="text-sm text-slate-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100 whitespace-pre-line">
                    {lead.aiSummary}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
                    Esperando procesamiento de IA...
                  </p>
                )}
              </div>

              {/* Display: Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={startEditing}>
                    Edit Lead
                  </Button>
                  <Button className="flex-1">
                    Schedule Call
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Lead
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Delete Lead
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Are you sure you want to delete <strong>{lead.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {lead && (
        <PropertySelector
          open={showPropertySelector}
          onOpenChange={setShowPropertySelector}
          leadId={lead.id}
          onPropertyLinked={refreshProperties}
        />
      )}
    </Drawer>
  )
}