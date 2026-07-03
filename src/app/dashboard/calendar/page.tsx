"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast, Toaster } from "@/components/ui/use-toast"
import type { CalendarEvent, EventType } from "@/lib/types/calendar"

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  Call: "bg-blue-500",
  Meeting: "bg-purple-500",
  Showing: "bg-emerald-500",
  Task: "bg-amber-500",
  Other: "bg-slate-500",
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formTitle, setFormTitle] = useState("")
  const [formTime, setFormTime] = useState("")
  const [formType, setFormType] = useState<EventType>("Task")
  const [formNotes, setFormNotes] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const copyWebCalLink = async () => {
    try {
      const res = await fetch("/api/calendar/feed-token")
      if (!res.ok) throw new Error("Failed to get token")
      const { token } = await res.json()
      const origin = window.location.origin
      const httpsUrl = `${origin}/api/calendar/ical?token=${token}`
      const webcalUrl = `webcal://${origin.replace(/^https?:\/\//, '')}/api/calendar/ical?token=${token}`
      await navigator.clipboard.writeText(webcalUrl)
      setIsCopied(true)
      toast({ title: "✅ WebCal link copied", description: "Paste in Apple Calendar → File → New Calendar Subscription" })
      setTimeout(() => setIsCopied(false), 3000)
    } catch {
      toast({ title: "❌ Error", description: "Could not generate feed link", variant: "destructive" })
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/calendar")
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const today = new Date()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const getEventsForDay = (day: number): CalendarEvent[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((e) => {
      const eDate = e.date || (e as any).date
      return eDate === dateStr
    })
  }

  const handleAddEvent = async () => {
    if (!formTitle.trim() || !selectedDay) return
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formTitle, date: dateStr, time: formTime || undefined, type: formType, notes: formNotes }),
      })
      if (response.ok) {
        const result = await response.json()
        setEvents((prev) => [...prev, result.data])
        setFormTitle("")
        setFormTime("")
        setFormType("Task")
        setFormNotes("")
        setDialogOpen(false)
        toast({ title: "✅ Event created" })
      } else {
        const err = await response.json()
        toast({ title: "❌ Error", description: err.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "❌ Network error", variant: "destructive" })
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar?id=${eventId}`, { method: "DELETE" })
      if (response.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
        toast({ title: "🗑️ Event deleted" })
      }
    } catch {
      toast({ title: "❌ Error deleting event", variant: "destructive" })
    }
  }

  const openDayDialog = (day: number) => {
    setSelectedDay(day)
    setFormTitle("")
    setFormTime("")
    setFormType("Task")
    setFormNotes("")
    setDialogOpen(true)
  }

  const weeks: (number | null)[][] = []
  let week: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) week.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule and manage events</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-slate-900">{MONTHS[month]} {year}</h2>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyWebCalLink}
            >
              <Link className="h-4 w-4 mr-2" />
              {isCopied ? "Copied!" : "WebCal"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentDate(new Date())
              }}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Today
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100">
          {DAYS.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>

        <div>
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading...</div>
          ) : (
            weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-slate-50 last:border-b-0">
                {week.map((day, di) => {
                  if (day === null) return <div key={di} className="min-h-[100px] bg-slate-50/50" />
                  const dayEvents = getEventsForDay(day)
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const isToday = dateStr === todayStr
                  return (
                    <div
                      key={di}
                      onClick={() => openDayDialog(day)}
                      className={`min-h-[100px] p-2 border-r border-slate-50 last:border-r-0 cursor-pointer hover:bg-slate-50 transition-colors ${isToday ? "bg-blue-50" : ""}`}
                    >
                      <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white" : "text-slate-700"}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            className="group relative"
                          >
                            <div className={`text-xs px-1.5 py-0.5 rounded text-white truncate ${EVENT_TYPE_COLORS[ev.type as EventType] || EVENT_TYPE_COLORS.Other}`}>
                              {ev.title}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id) }}
                              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-slate-400 pl-1">+{dayEvents.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Event — {selectedDay ? `${MONTHS[month]} ${selectedDay}, ${year}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Event title" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Time</Label>
                <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formType} onValueChange={(v: EventType) => setFormType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Call", "Meeting", "Showing", "Task", "Other"] as const).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional notes" />
            </div>
            <Button onClick={handleAddEvent} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
