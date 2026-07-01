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
import { PROPERTY_STATUSES, PROPERTY_TYPES } from "@/lib/constants/property-constants"
import type { Property, CreatePropertyInput } from "@/lib/types/property"

const initialFormData: CreatePropertyInput = {
  title: "",
  description: "",
  price: 0,
  status: "Available",
  type: "House",
  bedrooms: undefined,
  bathrooms: undefined,
  areaSqFt: undefined,
  address: "",
  city: "",
  state: "",
  zipCode: "",
  notes: "",
}

interface AddPropertyDialogProps {
  onPropertyAdded?: (property: Property) => void
}

export function AddPropertyDialog({ onPropertyAdded }: AddPropertyDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreatePropertyInput>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof CreatePropertyInput, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          price: formData.price,
          status: formData.status,
          type: formData.type,
          bedrooms: formData.bedrooms || undefined,
          bathrooms: formData.bathrooms || undefined,
          areaSqFt: formData.areaSqFt || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          notes: formData.notes || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const newProperty: Property = {
          id: data.propertyId,
          title: formData.title,
          description: formData.description || '',
          price: formData.price,
          status: formData.status as Property['status'],
          type: formData.type as Property['type'],
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          areaSqFt: formData.areaSqFt,
          address: formData.address || '',
          city: formData.city || '',
          state: formData.state || '',
          zipCode: formData.zipCode || '',
          notes: formData.notes || '',
          createdAt: new Date().toISOString().split('T')[0],
        }

        setFormData(initialFormData)
        setOpen(false)

        toast({
          title: "✅ Property created successfully",
          description: `${newProperty.title} has been added to the list.`,
        })

        if (onPropertyAdded) {
          onPropertyAdded(newProperty)
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Error creating property",
          description: errorData.error || 'Unknown error',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating property:", error)
      toast({
        title: "❌ Network error",
        description: "Could not connect to the server",
        variant: "destructive",
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
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Add New Property
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Enter the details of the new property listing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700 font-medium">
              Property Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Modern 3BR Home in Downtown"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              className="focus-visible:ring-blue-700 focus-visible:ring-2"
            />
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-slate-700 font-medium">
                Property Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger className="focus-visible:ring-blue-700 focus-visible:ring-2">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700 font-medium">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className="focus-visible:ring-blue-700 focus-visible:ring-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-slate-700 font-medium">
              Price ($)
            </Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 350000"
              value={formData.price || ''}
              onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
              required
              className="focus-visible:ring-blue-700 focus-visible:ring-2"
            />
          </div>

          {/* Bedrooms, Bathrooms, Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms" className="text-slate-700 font-medium">
                Bedrooms
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min={0}
                placeholder="e.g. 3"
                value={formData.bedrooms ?? ''}
                onChange={(e) => handleInputChange("bedrooms", e.target.value ? parseInt(e.target.value) : undefined)}
                className="focus-visible:ring-blue-700 focus-visible:ring-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms" className="text-slate-700 font-medium">
                Bathrooms
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min={0}
                step="0.5"
                placeholder="e.g. 2"
                value={formData.bathrooms ?? ''}
                onChange={(e) => handleInputChange("bathrooms", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="focus-visible:ring-blue-700 focus-visible:ring-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-slate-700 font-medium">
                Area (sq ft)
              </Label>
              <Input
                id="area"
                type="number"
                min={0}
                placeholder="e.g. 1800"
                value={formData.areaSqFt ?? ''}
                onChange={(e) => handleInputChange("areaSqFt", e.target.value ? parseInt(e.target.value) : undefined)}
                className="focus-visible:ring-blue-700 focus-visible:ring-2"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-slate-700 font-medium">
              Street Address
            </Label>
            <Input
              id="address"
              placeholder="e.g. 123 Main St"
              value={formData.address || ''}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="focus-visible:ring-blue-700 focus-visible:ring-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-slate-700 font-medium">City</Label>
              <Input
                id="city"
                placeholder="e.g. Miami"
                value={formData.city || ''}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="focus-visible:ring-blue-700 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-slate-700 font-medium">State</Label>
              <Input
                id="state"
                placeholder="e.g. FL"
                value={formData.state || ''}
                onChange={(e) => handleInputChange("state", e.target.value)}
                className="focus-visible:ring-blue-700 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip" className="text-slate-700 font-medium">Zip Code</Label>
              <Input
                id="zip"
                placeholder="e.g. 33101"
                value={formData.zipCode || ''}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                className="focus-visible:ring-blue-700 focus-visible:ring-2"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the property, its features, and selling points..."
              value={formData.description || ''}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[80px] focus-visible:ring-blue-700 focus-visible:ring-2 resize-none"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-700 font-medium">
              Internal Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Any internal notes about this property..."
              value={formData.notes || ''}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="min-h-[80px] focus-visible:ring-blue-700 focus-visible:ring-2 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="text-slate-700 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
