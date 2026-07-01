"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast, Toaster } from "@/components/ui/use-toast"
import type { Document, DocumentType, EntityType } from "@/lib/types/document"

const DOCUMENT_TYPE_ICONS: Record<string, string> = {
  PDF: "📄",
  Image: "🖼️",
  Doc: "📝",
  Spreadsheet: "📊",
  Other: "📁",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toISOString().split("T")[0]
}

function DocumentsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><div className="h-4 w-8 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-40 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-28 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-24 bg-slate-200 rounded animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-8 bg-slate-200 rounded animate-pulse ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<DocumentType>("PDF")
  const [formDescription, setFormDescription] = useState("")
  const [formEntityType, setFormEntityType] = useState<EntityType>("Property")
  const [formEntityId, setFormEntityId] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const { toast } = useToast()

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents")
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const handleAddDocument = async () => {
    if (!formName.trim() || !formEntityId.trim()) {
      toast({ title: "❌ Name and Entity ID are required", variant: "destructive" })
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
          entityId: formEntityId,
          notes: formNotes || undefined,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setDocuments((prev) => [result.data, ...prev])
        setFormName("")
        setFormType("PDF")
        setFormDescription("")
        setFormNotes("")
        setFormEntityId("")
        setDialogOpen(false)
        toast({ title: "✅ Document created" })
      } else {
        const err = await response.json()
        toast({ title: "❌ Error", description: err.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "❌ Network error", variant: "destructive" })
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      const response = await fetch(`/api/documents?id=${docId}`, { method: "DELETE" })
      if (response.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId))
        toast({ title: "🗑️ Document deleted" })
      }
    } catch {
      toast({ title: "❌ Error deleting document", variant: "destructive" })
    }
  }

  const filtered = documents.filter((doc) => {
    if (!searchQuery) return true
    const d = doc as any
    const q = searchQuery.toLowerCase()
    const name = (d.name || "").toLowerCase()
    const desc = (d.description || "").toLowerCase()
    const notes = (d.notes || "").toLowerCase()
    return name.includes(q) || desc.includes(q) || notes.includes(q)
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-sm text-slate-500 mt-1">Manage files and records</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </DialogTrigger>
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
                </div>
                <div>
                  <Label>Entity ID</Label>
                  <Input value={formEntityId} onChange={(e) => setFormEntityId(e.target.value)} placeholder="Paste property/lead/portfolio ID" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Optional description" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional notes" />
                </div>
                <Button onClick={handleAddDocument} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Linked To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <DocumentsSkeleton /> : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  {searchQuery ? "No documents match your search" : "No documents yet. Click 'Add Document' to create one."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((doc) => {
                const d = doc as any
                const docType = (d.type || "Other") as string
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <span className="text-lg">{DOCUMENT_TYPE_ICONS[docType] || "📁"}</span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{d.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {docType}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {d.entity_type || d.entityType || "—"}
                      <span className="text-slate-400 ml-1 text-xs">
                        {(d.entity_id || d.entityId || "").substring(0, 12)}...
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{formatDate(d.created_at || d.createdAt || "")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
                        <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Toaster />
    </div>
  )
}
