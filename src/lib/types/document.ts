export const DOCUMENT_TYPES = ["PDF", "Image", "Doc", "Spreadsheet", "Other"] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const ENTITY_TYPES = ["Property", "Lead", "Portfolio"] as const
export type EntityType = (typeof ENTITY_TYPES)[number]

export interface Document {
  id: string
  name: string
  type: DocumentType
  description?: string
  entityType: EntityType
  entityId: string
  notes?: string
  createdAt: string
}

export interface CreateDocumentInput {
  name: string
  type: DocumentType
  description?: string
  entityType: EntityType
  entityId: string
  notes?: string
}
