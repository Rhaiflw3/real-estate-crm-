"use client"

import { useState, useEffect } from "react"
import { X, DollarSign, MapPin, Home, Maximize2, Bed, Bath, Calendar, Users, Phone, Mail } from "lucide-react"
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
import { PROPERTY_STATUSES, PROPERTY_TYPES, STATUS_STYLES } from "@/lib/constants/property-constants"
import type { PropertyStatus } from "@/lib/constants/property-constants"
import type { Property } from "@/lib/types/property"
import type { LeadProperty } from "@/lib/types/lead-property"

interface PropertyDetailDrawerProps {
  property: Property | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPropertyUpdated?: (property: Property) => void
  onPropertyDeleted?: (id: string) => void
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price)
}

function formatAddress(p: Property): string {
  const parts = [p.address, p.city, p.state, p.zipCode].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "No address listed"
}

export function PropertyDetailDrawer({
  property,
  open,
  onOpenChange,
  onPropertyUpdated,
  onPropertyDeleted,
}: PropertyDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Property>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [linkedLeads, setLinkedLeads] = useState<LeadProperty[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (!open || !property) return;
    fetch(`/api/properties/${property.id}/leads`)
      .then((r) => r.json())
      .then((data) => setLinkedLeads(Array.isArray(data) ? data : []))
      .catch(() => setLinkedLeads([]));
  }, [open, property]);

  useEffect(() => {
    if (!open) {
      setIsEditing(false)
    }
  }, [open])

  useEffect(() => {
    setIsEditing(false)
  }, [property?.id])

  if (!property) return null

  const startEditing = () => {
    setEditForm({
      title: property.title,
      description: property.description || '',
      price: property.price,
      status: property.status,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      areaSqFt: property.areaSqFt,
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      zipCode: property.zipCode || '',
      notes: property.notes || '',
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!property) return

    if (!editForm.title?.trim()) {
      toast({
        title: "❌ Validation error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedProperty: Property = {
          ...property,
          title: editForm.title || property.title,
          description: editForm.description ?? property.description,
          price: editForm.price ?? property.price,
          status: (editForm.status as Property['status']) || property.status,
          type: (editForm.type as Property['type']) || property.type,
          bedrooms: editForm.bedrooms,
          bathrooms: editForm.bathrooms,
          areaSqFt: editForm.areaSqFt,
          address: editForm.address ?? property.address,
          city: editForm.city ?? property.city,
          state: editForm.state ?? property.state,
          zipCode: editForm.zipCode ?? property.zipCode,
          notes: editForm.notes ?? property.notes,
        }

        if (onPropertyUpdated) {
          onPropertyUpdated(updatedProperty)
        }

        toast({
          title: "✅ Property updated",
          description: `${updatedProperty.title} has been updated.`,
        })

        setIsEditing(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Error updating",
          description: errorData.error || 'Unknown error',
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "❌ Network error",
        description: "Could not connect to the server",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!property) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        if (onPropertyDeleted) {
          onPropertyDeleted(property.id)
        }

        toast({
          title: "🗑️ Property deleted",
          description: `${property.title} has been deleted.`,
        })

        setShowDeleteConfirm(false)
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Error deleting",
          description: errorData.error || 'Unknown error',
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "❌ Network error",
        description: "Could not connect to the server",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const editFormHandler = (field: string, value: string | number | undefined) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const statusStyle = STATUS_STYLES[property.status as PropertyStatus]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex-1 mr-4">
                <Label htmlFor="edit-title" className="text-slate-700 font-medium mb-1 block">
                  Property Title
                </Label>
                <Input
                  id="edit-title"
                  value={editForm.title || ''}
                  onChange={(e) => editFormHandler('title', e.target.value)}
                  className="focus-visible:ring-blue-700 focus-visible:ring-2"
                />
              </div>
            ) : (
              <DrawerTitle className="text-2xl font-bold text-slate-900">
                {property.title}
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
            Property details and information
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-6 overflow-y-auto">
          {isEditing ? (
            <>
              {/* Edit: Type & Status */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Classification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-slate-600">Type</Label>
                    <Select
                      value={editForm.type as string}
                      onValueChange={(value) => editFormHandler('type', value)}
                    >
                      <SelectTrigger className="focus-visible:ring-blue-700 focus-visible:ring-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                        {PROPERTY_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Edit: Price & Dimensions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Pricing & Size</h3>
                <div className="space-y-1">
                  <Label className="text-slate-600">Price ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editForm.price ?? ''}
                    onChange={(e) => editFormHandler('price', parseFloat(e.target.value) || 0)}
                    className="focus-visible:ring-blue-700 focus-visible:ring-2"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-slate-600">Bedrooms</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editForm.bedrooms ?? ''}
                      onChange={(e) => editFormHandler('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="focus-visible:ring-blue-700 focus-visible:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-600">Bathrooms</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.5"
                      value={editForm.bathrooms ?? ''}
                      onChange={(e) => editFormHandler('bathrooms', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="focus-visible:ring-blue-700 focus-visible:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-600">Area (sq ft)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editForm.areaSqFt ?? ''}
                      onChange={(e) => editFormHandler('areaSqFt', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="focus-visible:ring-blue-700 focus-visible:ring-2"
                    />
                  </div>
                </div>
              </div>

              {/* Edit: Address */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Address</h3>
                <div className="space-y-1">
                  <Label className="text-slate-600">Street Address</Label>
                  <Input
                    value={editForm.address || ''}
                    onChange={(e) => editFormHandler('address', e.target.value)}
                    className="focus-visible:ring-blue-700 focus-visible:ring-2"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-slate-600">City</Label>
                    <Input
                      value={editForm.city || ''}
                      onChange={(e) => editFormHandler('city', e.target.value)}
                      className="focus-visible:ring-blue-700 focus-visible:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-600">State</Label>
                    <Input
                      value={editForm.state || ''}
                      onChange={(e) => editFormHandler('state', e.target.value)}
                      className="focus-visible:ring-blue-700 focus-visible:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-600">Zip</Label>
                    <Input
                      value={editForm.zipCode || ''}
                      onChange={(e) => editFormHandler('zipCode', e.target.value)}
                      className="focus-visible:ring-blue-700 focus-visible:ring-2"
                    />
                  </div>
                </div>
              </div>

              {/* Edit: Description */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Description</h3>
                <Textarea
                  value={editForm.description || ''}
                  onChange={(e) => editFormHandler('description', e.target.value)}
                  className="min-h-[80px] resize-none focus-visible:ring-blue-700 focus-visible:ring-2"
                />
              </div>

              {/* Edit: Notes */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Internal Notes</h3>
                <Textarea
                  value={editForm.notes || ''}
                  onChange={(e) => editFormHandler('notes', e.target.value)}
                  className="min-h-[80px] resize-none focus-visible:ring-blue-700 focus-visible:ring-2"
                />
              </div>

              {/* Edit: Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)} disabled={isSaving}>
                  Delete Property
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Display: Price & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                  <DollarSign className="h-6 w-6 text-slate-400" />
                  {formatPrice(property.price)}
                </div>
                <span className={`inline-flex items-center gap-1 rounded-4xl px-3 py-1 text-xs font-medium ${statusStyle.className}`}>
                  {property.status}
                </span>
              </div>

              {/* Display: Type & Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Home className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">{property.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Bed className="h-4 w-4 text-slate-400" />
                  <span>{property.bedrooms != null ? `${property.bedrooms} beds` : '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Bath className="h-4 w-4 text-slate-400" />
                  <span>{property.bathrooms != null ? `${property.bathrooms} baths` : '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Maximize2 className="h-4 w-4 text-slate-400" />
                  <span>{property.areaSqFt != null ? `${property.areaSqFt} sqft` : '—'}</span>
                </div>
              </div>

              {/* Display: Address */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Location</h3>
                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <span className="font-medium">{formatAddress(property)}</span>
                </div>
              </div>

              {/* Display: Description */}
              {property.description && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-700">Description</h3>
                  <div className="text-sm text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                    {property.description}
                  </div>
                </div>
              )}

              {/* Display: Notes */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-700">Internal Notes</h3>
                <div className="text-sm text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100 min-h-[60px] whitespace-pre-wrap">
                  {property.notes || (
                    <span className="text-slate-400 italic">No notes added yet.</span>
                  )}
                </div>
              </div>

              {/* Display: Linked Leads */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <h3 className="font-semibold text-slate-700">Leads Interesados</h3>
                </div>
                {linkedLeads.length === 0 ? (
                  <div className="text-sm text-slate-400 bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
                    Ningún lead vinculado a esta propiedad.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {linkedLeads.map((ll) => (
                      <div
                        key={ll.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-slate-900">
                              {ll.lead?.name || 'Lead'}
                            </span>
                            {ll.lead && <LeadStatusBadge status={ll.lead.status} />}
                            <Badge
                              variant="outline"
                              className={`text-xs shrink-0 ${
                                ll.interestLevel === 'Offer' ? 'border-green-300 text-green-700 bg-green-50' :
                                ll.interestLevel === 'High' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                                ll.interestLevel === 'Medium' ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                                'border-slate-300 text-slate-600 bg-slate-50'
                              }`}
                            >
                              {ll.interestLevel === 'Low' ? 'Bajo' :
                               ll.interestLevel === 'Medium' ? 'Medio' :
                               ll.interestLevel === 'High' ? 'Alto' : 'Oferta'}
                            </Badge>
                          </div>
                          {ll.lead && (
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {ll.lead.email}
                              </span>
                              {ll.lead.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {ll.lead.phone}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Display: Created Date */}
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>
                  Created: {new Date(property.createdAt).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </span>
              </div>

              {/* Display: Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={startEditing}>
                    Edit Property
                  </Button>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Property
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
              Delete Property
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Are you sure you want to delete <strong>{property.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Drawer>
  )
}
