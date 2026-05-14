"use client"

import { useState } from "react"

interface Toast {
  id: number
  title: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastOptions {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, variant = "default" }: ToastOptions) => {
    const id = ++toastId
    const newToast: Toast = { id, title, description, variant }
    
    setToasts(prev => [...prev, newToast])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const dismiss = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toast, dismiss, toasts }
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg border ${
            toast.variant === "destructive"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{toast.title}</div>
              {toast.description && (
                <div className="text-sm mt-1 text-slate-600">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}