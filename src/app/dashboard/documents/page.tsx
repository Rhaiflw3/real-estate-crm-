"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { AddDocumentDialog } from "@/components/documents/AddDocumentDialog"
import type { Document, EntityType } from "@/lib/types/document"

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
  const [entityFilter, setEntityFilter] = useState<EntityType | "All">("All")
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchDocuments = useCallback(async () => {
    try {
      const params = entityFilter === "All" ? "" : `?entityType=${entityFilter}`
      const response = await fetch(`/api/documents${params}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setIsLoading(false)
    }
  }, [entityFilter])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

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
          <Select value={entityFilter} onValueChange={(v: typeof entityFilter) => setEntityFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Property">Properties</SelectItem>
              <SelectItem value="Lead">Leads</SelectItem>
              <SelectItem value="Portfolio">Portfolios</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
          <AddDocumentDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSuccess={fetchDocuments}
          />
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
