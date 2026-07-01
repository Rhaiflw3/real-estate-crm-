import { NextRequest, NextResponse } from 'next/server';
import { portfoliosApi } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-utils';
import type { Portfolio } from '@/lib/types/portfolio';

function getPropertyCount(portfolioId: string): number {
  try {
    // Use require to avoid circular dep issues with mockStorage
    const links = require('@/lib/supabase').mockStorage?.portfolio_properties || [];
    return links.filter((l: any) => l.portfolio_id === portfolioId || l.portfolioId === portfolioId).length;
  } catch {
    return 0;
  }
}

function transformSupabasePortfolio(sp: any): Portfolio {
  const props = sp.portfolio_properties;
  return {
    id: sp.id,
    name: sp.name,
    description: sp.description || '',
    year: sp.year ?? undefined,
    type: sp.type as Portfolio['type'],
    status: sp.status as Portfolio['status'],
    userId: sp.user_id,
    propertyCount: Array.isArray(props) ? props.length : getPropertyCount(sp.id),
    createdAt: new Date(sp.created_at).toISOString().split('T')[0],
    updatedAt: new Date(sp.updated_at).toISOString().split('T')[0],
  };
}

function transformToSupabasePortfolio(data: Partial<Portfolio> & { userId: string }): any {
  return {
    name: data.name,
    description: data.description || null,
    year: data.year ?? null,
    type: data.type || 'Standard',
    status: data.status || 'Active',
    user_id: data.userId,
  };
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📥 GET /api/portfolios - Fetching portfolios');

    try {
      const supabasePortfolios = await portfoliosApi.getAll(userId);
      const portfolios = supabasePortfolios.map(transformSupabasePortfolio);
      return NextResponse.json(portfolios, { status: 200 });
    } catch (supabaseError) {
      console.log('⚠️ Supabase fetch failed, trying Prisma fallback');
      try {
        const { prisma } = require('@/lib/prisma');
        const prismaPortfolios = await prisma.portfolio.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(prismaPortfolios, { status: 200 });
      } catch (prismaError) {
        console.log('⚠️ Prisma also failed, using in-memory fallback');
        const { inMemoryPortfolios } = require('@/lib/in-memory-store');
        const userPortfolios = inMemoryPortfolios.filter((p: any) => p.userId === userId);
        return NextResponse.json(userPortfolios, { status: 200 });
      }
    }
  } catch (error) {
    console.error('❌ GET /api/portfolios error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Portfolio name is required' }, { status: 400 });
    }

    if (body.type && !['Standard', 'PRO'].includes(body.type)) {
      return NextResponse.json({ error: 'Invalid type value' }, { status: 400 });
    }

    console.log('📥 POST /api/portfolios - Creating portfolio:', body.name);

    try {
      const supabaseData = transformToSupabasePortfolio({ ...body, userId });
      const saved = await portfoliosApi.create(supabaseData);
      return NextResponse.json(
        { message: 'Portfolio created', portfolioId: saved.id, portfolio: transformSupabasePortfolio(saved) },
        { status: 201 }
      );
    } catch (supabaseError) {
      console.log('⚠️ Supabase save failed, trying Prisma fallback');
      try {
        const { prisma } = require('@/lib/prisma');
        const savedPortfolio = await prisma.portfolio.create({
          data: {
            name: body.name,
            description: body.description || null,
            year: body.year ?? null,
            type: body.type || 'Standard',
            status: body.status || 'Active',
            userId,
          },
        });
        return NextResponse.json(
          { message: 'Portfolio created', portfolioId: savedPortfolio.id, portfolio: savedPortfolio },
          { status: 201 }
        );
      } catch (prismaError) {
        console.log('⚠️ Prisma also failed, using in-memory fallback');
        const newPortfolio = {
          id: `mem_${Date.now()}`,
          name: body.name,
          description: body.description || '',
          year: body.year ?? null,
          type: body.type || 'Standard',
          status: body.status || 'Active',
          userId,
          propertyCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        const { inMemoryPortfolios } = require('@/lib/in-memory-store');
        inMemoryPortfolios.push(newPortfolio);
        return NextResponse.json(
          { message: 'Portfolio created', portfolioId: newPortfolio.id, portfolio: newPortfolio },
          { status: 201 }
        );
      }
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    console.error('❌ POST /api/portfolios error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
