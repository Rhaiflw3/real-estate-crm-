"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
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
import type { DocumentType, EntityType } from "@/lib/types/document"

interface AddDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  defaultEntityType?: EntityType
  defaultEntityId?: string
  entityLabel?: string
}

const DOCUMENT_TYPE_ICONS: Record<string, string> = {
  PDF: "📄",
  Image: "🖼️",
  Doc: "📝",
  Spreadsheet: "📊",
  Other: "📁",
}

export function AddDocumentDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultEntityType,
  defaultEntityId,
  entityLabel,
}: AddDocumentDialogProps) {
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<DocumentType>("PDF")
  const [formDescription, setFormDescription] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [formEntityType, setFormEntityType] = useState<EntityType>(defaultEntityType || "Property")
  const [formEntityId, setFormEntityId] = useState(defaultEntityId || "")
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast({ title: "❌ Name is required", variant: "destructive" })
      return
    }
    if (!formEntityId.trim() && !defaultEntityId) {
      toast({ title: "❌ Entity ID is required", variant: "destructive" })
      return
    }

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          type: formType,
          description: formDescription || undefined,
          entityType: formEntityType,
          entityId: formEntityId || defaultEntityId,
          notes: formNotes || undefined,
        }),
      })

      if (response.ok) {
        setFormName("")
        setFormType("PDF")
        setFormDescription("")
        setFormNotes("")
        setFormEntityId("")
        onOpenChange(false)
        toast({ title: "✅ Document created" })
        onSuccess?.()
      } else {
        const err = await response.json()
        toast({ title: "❌ Error", description: err.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "❌ Network error", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Document name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={formType} onValueChange={(v: DocumentType) => setFormType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["PDF", "Image", "Doc", "Spreadsheet", "Other"] as const).map((t) => (
                    <SelectItem key={t} value={t}>{DOCUMENT_TYPE_ICONS[t]} {t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!defaultEntityType && (
              <div>
                <Label>Linked To</Label>
                <Select value={formEntityType} onValueChange={(v: EntityType) => setFormEntityType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Property", "Lead", "Portfolio"] as const).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {defaultEntityType && (
            <div>
              <Label>Linked To</Label>
              <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                {defaultEntityType}: {entityLabel || defaultEntityId}
              </div>
            </div>
          )}
          {!defaultEntityId && (
            <div>
              <Label>Entity ID</Label>
              <Input value={formEntityId} onChange={(e) => setFormEntityId(e.target.value)} placeholder="Paste property/lead/portfolio ID" />
            </div>
          )}
          <div>
            <Label>Description</Label>
            <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional notes" />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
