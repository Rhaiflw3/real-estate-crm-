export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  status: 'New' | 'Contacted' | 'Qualified'
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
  status: 'New' | 'Contacted'
  notes: string
}