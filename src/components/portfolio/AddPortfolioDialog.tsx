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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { Portfolio, CreatePortfolioInput } from "@/lib/types/portfolio"

const initialFormData: CreatePortfolioInput = {
  name: "",
  description: "",
  year: undefined,
  type: "Standard",
  status: "Active",
}

const CURRENT_YEAR = new Date().getFullYear()

interface AddPortfolioDialogProps {
  onPortfolioAdded?: (portfolio: Portfolio) => void
}

export function AddPortfolioDialog({ onPortfolioAdded }: AddPortfolioDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreatePortfolioInput>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof CreatePortfolioInput, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(initialFormData)
        setOpen(false)

        toast({
          title: "✅ Portfolio created",
          description: `${formData.name} has been created.`,
        })

        if (onPortfolioAdded && data.portfolio) {
          onPortfolioAdded(data.portfolio)
        }
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Error",
          description: errorData.error || "Unknown error",
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
          New Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">New Portfolio</DialogTitle>
          <DialogDescription className="text-slate-600">
            Create a new portfolio to organize your properties
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">Portfolio Name</Label>
            <Input
              id="name"
              placeholder="e.g. Cartera Inmobiliaria 2026"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="focus-visible:ring-blue-700 focus-visible:ring-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-slate-700 font-medium">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="focus-visible:ring-blue-700 focus-visible:ring-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="PRO">PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year" className="text-slate-700 font-medium">Year</Label>
              <Input
                id="year"
                type="number"
                min={2000}
                max={CURRENT_YEAR + 1}
                placeholder={String(CURRENT_YEAR)}
                value={formData.year ?? ""}
                onChange={(e) => handleInputChange("year", e.target.value ? parseInt(e.target.value) : undefined)}
                className="focus-visible:ring-blue-700 focus-visible:ring-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this portfolio..."
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="min-h-[80px] focus-visible:ring-blue-700 focus-visible:ring-2 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-700 hover:bg-blue-800 text-white">
              {isSubmitting ? "Creating..." : "Create Portfolio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
