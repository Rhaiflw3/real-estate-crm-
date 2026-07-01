import { NextRequest, NextResponse } from 'next/server';
import type { Property } from '@/lib/types/property';
import { PROPERTY_STATUSES, PROPERTY_TYPES } from '@/lib/constants/property-constants';
import { propertiesApi } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-utils';
import { inMemoryProperties } from '@/lib/in-memory-store';

const LOCKED_FIELDS = ['id', 'createdAt'];

function validateUpdate(body: Record<string, unknown>): string | null {
  if (body.status && !PROPERTY_STATUSES.includes(body.status as any)) {
    return 'Invalid status value';
  }
  if (body.type && !PROPERTY_TYPES.includes(body.type as any)) {
    return 'Invalid type value';
  }
  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim().length === 0)) {
    return 'Invalid title format';
  }
  if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
    return 'Invalid price value';
  }
  return null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    for (const field of LOCKED_FIELDS) {
      delete body[field];
    }
    delete body.userId;

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const validationError = validateUpdate(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    try {
      const supabaseData: Record<string, any> = {};
      if (body.title !== undefined) supabaseData.title = body.title;
      if (body.description !== undefined) supabaseData.description = body.description || null;
      if (body.price !== undefined) supabaseData.price = body.price;
      if (body.status !== undefined) supabaseData.status = body.status;
      if (body.type !== undefined) supabaseData.type = body.type;
      if (body.bedrooms !== undefined) supabaseData.bedrooms = body.bedrooms ?? null;
      if (body.bathrooms !== undefined) supabaseData.bathrooms = body.bathrooms ?? null;
      if (body.areaSqFt !== undefined) supabaseData.area_sq_ft = body.areaSqFt ?? null;
      if (body.address !== undefined) supabaseData.address = body.address || null;
      if (body.city !== undefined) supabaseData.city = body.city || null;
      if (body.state !== undefined) supabaseData.state = body.state || null;
      if (body.zipCode !== undefined) supabaseData.zip_code = body.zipCode || null;
      if (body.notes !== undefined) supabaseData.notes = body.notes || null;

      const savedProperty = await propertiesApi.update(id, supabaseData, userId);
      return NextResponse.json({ message: 'Property updated', propertyId: savedProperty.id }, { status: 200 });
    } catch {
      try {
        const { prisma } = require('@/lib/prisma');
        const existing = await prisma.property.findMany({
          where: { id, userId },
        });
        if (existing.length === 0) {
          return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        const updatedProperty = await prisma.property.update({
          where: { id },
          data: body,
        });
        return NextResponse.json({ message: 'Property updated', propertyId: updatedProperty.id }, { status: 200 });
      } catch {
        const idx = inMemoryProperties.findIndex((p: any) => p.id === id && p.userId === userId);
        if (idx === -1) {
          return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }
        inMemoryProperties[idx] = { ...inMemoryProperties[idx], ...body };
        return NextResponse.json({ message: 'Property updated', propertyId: id }, { status: 200 });
      }
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
      await propertiesApi.delete(id, userId);
      return NextResponse.json({ message: 'Property deleted', propertyId: id }, { status: 200 });
    } catch {
      try {
        const { prisma } = require('@/lib/prisma');
        const existing = await prisma.property.findMany({
          where: { id, userId },
        });
        if (existing.length === 0) {
          return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        await prisma.property.delete({ where: { id } });
        return NextResponse.json({ message: 'Property deleted', propertyId: id }, { status: 200 });
      } catch {
        const idx = inMemoryProperties.findIndex((p: any) => p.id === id && p.userId === userId);
        if (idx === -1) {
          return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }
        inMemoryProperties.splice(idx, 1);
        return NextResponse.json({ message: 'Property deleted', propertyId: id }, { status: 200 });
      }
    }
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
