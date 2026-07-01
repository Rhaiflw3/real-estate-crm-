import { NextRequest, NextResponse } from 'next/server'
import type { Lead } from '@/lib/types/lead'
import { LEAD_STATUSES } from '@/lib/constants/lead-status'
import { leadsApi } from '@/lib/supabase'
import { inMemoryLeads } from '@/lib/in-memory-store'
import { getUserId } from '@/lib/auth-utils'

const validStatuses: Lead['status'][] = [...LEAD_STATUSES]
const LOCKED_FIELDS = ['id', 'createdAt', 'aiSummary']

function validateUpdate(body: Record<string, unknown>): string | null {
  if (body.status && !validStatuses.includes(body.status as Lead['status'])) {
    return 'Invalid status value'
  }
  if (body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email as string)) {
      return 'Invalid email format'
    }
  }
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
    return 'Invalid name format'
  }
  return null
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Strip locked fields
    for (const field of LOCKED_FIELDS) {
      delete body[field]
    }

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })
    }

    const validationError = validateUpdate(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Try Supabase
    try {
      const supabaseData = {
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        status: body.status,
        source: body.source,
        ai_summary: body.aiSummary || null,
        notes: body.notes || null,
      }
      const savedLead = await leadsApi.update(id, supabaseData)
      return NextResponse.json({ message: 'Lead updated', leadId: savedLead.id }, { status: 200 })
    } catch {
      // Try Prisma fallback
      try {
        const { prisma } = require('@/lib/prisma')
        const updatedLead = await prisma.lead.update({
          where: { id },
          data: body,
        })
        return NextResponse.json({ message: 'Lead updated', leadId: updatedLead.id }, { status: 200 })
      } catch {
        // In-memory fallback
        const idx = inMemoryLeads.findIndex((l: any) => l.id === id)
        if (idx === -1) {
          return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
        }
        inMemoryLeads[idx] = { ...inMemoryLeads[idx], ...body }
        return NextResponse.json({ message: 'Lead updated', leadId: id }, { status: 200 })
      }
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 })
    }
    console.error('PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Try Supabase
    try {
      await leadsApi.delete(id)
      return NextResponse.json({ message: 'Lead deleted', leadId: id }, { status: 200 })
    } catch {
      // Try Prisma fallback
      try {
        const { prisma } = require('@/lib/prisma')
        await prisma.lead.delete({ where: { id } })
        return NextResponse.json({ message: 'Lead deleted', leadId: id }, { status: 200 })
      } catch {
        // In-memory fallback
        const idx = inMemoryLeads.findIndex((l: any) => l.id === id)
        if (idx === -1) {
          return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
        }
        inMemoryLeads.splice(idx, 1)
        return NextResponse.json({ message: 'Lead deleted', leadId: id }, { status: 200 })
      }
    }
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
