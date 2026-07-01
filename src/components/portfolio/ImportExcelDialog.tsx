"use client"

import { useState, useRef } from "react"
import { Upload, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface ImportExcelDialogProps {
  onImportComplete?: () => void
}

export function ImportExcelDialog({ onImportComplete }: ImportExcelDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.name.match(/\.(xlsx|xls)$/i)) {
        toast({
          title: "❌ Invalid file",
          description: "Please select an .xlsx or .xls file",
          variant: "destructive",
        })
        return
      }
      setFile(selected)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/portfolios/import", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "✅ Import complete",
          description: `${data.propertiesCreated} properties imported into "${data.portfolioName}"`,
        })
        setOpen(false)
        setFile(null)
        if (onImportComplete) onImportComplete()
      } else {
        const errorData = await response.json()
        toast({
          title: "❌ Import failed",
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
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Import from Excel</DialogTitle>
          <DialogDescription className="text-slate-600">
            Upload an Excel file (.xlsx or .xls) to import properties into a new portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 font-medium">Click to select file</p>
                <p className="text-xs text-slate-400 mt-1">.xlsx or .xls files only</p>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setOpen(false); setFile(null) }} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isUploading}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              {isUploading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
