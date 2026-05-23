import { type LeadStatus } from "@/lib/constants/lead-status"

export type { LeadStatus }

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  status: LeadStatus
  source: string
  createdAt: string
  aiSummary?: string
  notes?: string
}

export interface CreateLeadInput {
  name: string
  email: string
  phone: string
  source: 'WhatsApp' | 'Web' | 'Referido'
  status: LeadStatus
  notes: string
}