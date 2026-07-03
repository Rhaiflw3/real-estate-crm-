"use client"

import { useState } from "react"
import { FileText, Download, X, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Document } from "@/lib/types/document"

interface DocumentPreviewModalProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentPreviewModal({
  document,
  open,
  onOpenChange,
}: DocumentPreviewModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false)

  if (!document) return null

  const d = document as any
  const fileUrl = d.file_url || d.fileUrl || ""

  const isPdf = fileUrl.toLowerCase().endsWith(".pdf")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-5 w-5 text-slate-500 shrink-0" />
            <DialogTitle className="text-lg truncate">{document.name}</DialogTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" download>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </a>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 mt-4">
          {isPdf && fileUrl ? (
            <div className="relative h-full w-full">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              )}
              <iframe
                src={fileUrl}
                className="w-full h-full rounded-lg border border-slate-200"
                onLoad={() => setIframeLoaded(true)}
                title={document.name}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
              <FileText className="h-16 w-16 mb-4 opacity-50" />
              <p className="font-medium text-slate-600">Preview not available</p>
              <p className="text-sm mt-1">
                {fileUrl ? "Download the file to view it" : "No file attached"}
              </p>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="mt-4"
                >
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
