import { NextRequest, NextResponse } from 'next/server';
import { portfoliosApi } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-utils';
import { inMemoryPortfolioProperties, inMemoryProperties } from '@/lib/in-memory-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: portfolioId } = await params;
    const body = await request.json();

    if (!body.propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    try {
      const saved = await portfoliosApi.addProperty(portfolioId, body.propertyId, body.notes);
      return NextResponse.json(
        { message: 'Property added to portfolio', data: saved },
        { status: 201 }
      );
    } catch (supabaseError: any) {
      if (supabaseError?.message?.includes('duplicate') || supabaseError?.code === '23505') {
        return NextResponse.json({ error: 'Property already in portfolio' }, { status: 409 });
      }
      console.log('⚠️ Supabase failed, trying Prisma fallback');
      try {
        const { prisma } = require('@/lib/prisma');
        const saved = await prisma.portfolioProperty.create({
          data: {
            portfolioId,
            propertyId: body.propertyId,
            notes: body.notes || null,
          },
        });
        return NextResponse.json(
          { message: 'Property added to portfolio', data: saved },
          { status: 201 }
        );
      } catch (prismaError: any) {
        if (prismaError?.message?.includes('already in portfolio')) {
          return NextResponse.json({ error: 'Property already in portfolio' }, { status: 409 });
        }
        console.log('⚠️ Prisma also failed, using in-memory fallback');
        const exists = inMemoryPortfolioProperties.find(
          (l: any) => l.portfolioId === portfolioId && l.propertyId === body.propertyId
        );
        if (exists) {
          return NextResponse.json({ error: 'Property already in portfolio' }, { status: 409 });
        }
        const newLink = {
          id: `mem_${Date.now()}`,
          portfolioId,
          propertyId: body.propertyId,
          notes: body.notes || null,
          createdAt: new Date().toISOString().split('T')[0],
        };
        inMemoryPortfolioProperties.push(newLink);
        return NextResponse.json(
          { message: 'Property added to portfolio', data: newLink },
          { status: 201 }
        );
      }
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    console.error('❌ POST /api/portfolios/[id]/properties error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: portfolioId } = await params;
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId query parameter is required' }, { status: 400 });
    }

    try {
      await portfoliosApi.removeProperty(portfolioId, propertyId);
      return NextResponse.json({ message: 'Property removed from portfolio' }, { status: 200 });
    } catch {
      try {
        const { prisma } = require('@/lib/prisma');
        await prisma.portfolioProperty.deleteMany({
          where: { portfolioId, propertyId },
        });
        return NextResponse.json({ message: 'Property removed from portfolio' }, { status: 200 });
      } catch {
        const idx = inMemoryPortfolioProperties.findIndex(
          (l: any) => l.portfolioId === portfolioId && l.propertyId === propertyId
        );
        if (idx === -1) {
          return NextResponse.json({ error: 'Property not found in portfolio' }, { status: 404 });
        }
        inMemoryPortfolioProperties.splice(idx, 1);
        return NextResponse.json({ message: 'Property removed from portfolio' }, { status: 200 });
      }
    }
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
