"use client"

import { useState, useRef } from "react"
import { Plus, Upload, FileText, X } from "lucide-react"
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
import type { EntityType } from "@/lib/types/document"

interface AddDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  defaultEntityType?: EntityType
  defaultEntityId?: string
  entityLabel?: string
}

const ALLOWED_EXTENSIONS = ".pdf,.doc,.docx,.xls,.xlsx"

export function AddDocumentDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultEntityType,
  defaultEntityId,
  entityLabel,
}: AddDocumentDialogProps) {
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [formEntityType, setFormEntityType] = useState<EntityType>(defaultEntityType || "Property")
  const [formEntityId, setFormEntityId] = useState(defaultEntityId || "")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (f.size > 10 * 1024 * 1024) {
      toast({ title: "❌ File too large (max 10 MB)", variant: "destructive" })
      e.target.value = ""
      return
    }

    setFile(f)
    if (!formName) {
      setFormName(f.name.replace(/\.[^.]+$/, ""))
    }
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast({ title: "❌ Name is required", variant: "destructive" })
      return
    }
    if (!file) {
      toast({ title: "❌ Select a file to upload", variant: "destructive" })
      return
    }
    if (!formEntityId.trim() && !defaultEntityId) {
      toast({ title: "❌ Entity ID is required", variant: "destructive" })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", formName.trim())
      formData.append("entityType", formEntityType)
      formData.append("entityId", formEntityId || defaultEntityId || "")
      if (formDescription) formData.append("description", formDescription)
      if (formNotes) formData.append("notes", formNotes)

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setFormName("")
        setFormDescription("")
        setFormNotes("")
        setFormEntityId("")
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        onOpenChange(false)
        toast({ title: "✅ Document uploaded" })
        onSuccess?.()
      } else {
        const err = await response.json()
        toast({ title: "❌ Error", description: err.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "❌ Network error", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Document name" />
          </div>
          <div>
            <Label>File</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Click to select a file</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, XLS, XLSX — max 10 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          <Button onClick={handleSubmit} className="w-full" disabled={isUploading}>
            {isUploading ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
