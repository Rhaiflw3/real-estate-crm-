export const EVENT_TYPES = ["Call", "Meeting", "Showing", "Task", "Other"] as const
export type EventType = (typeof EVENT_TYPES)[number]

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  type: EventType
  leadId?: string
  propertyId?: string
  notes?: string
  createdAt: string
}

export interface CreateCalendarEventInput {
  title: string
  date: string
  time?: string
  type: EventType
  leadId?: string
  propertyId?: string
  notes?: string
}
