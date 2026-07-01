import { NextRequest, NextResponse } from 'next/server';
import type { Portfolio } from '@/lib/types/portfolio';
import { portfoliosApi, mockStorage as ms, persistMockStorage } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Load portfolio from mockStorage (where import writes to)
    const portfolios = ms?.portfolios || [];
    const portfolio = portfolios.find((p: any) => p.id === id && (p.user_id === userId || p.userId === userId));
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }
    const links = (ms?.portfolio_properties || []).filter(
      (l: any) => l.portfolio_id === id || l.portfolioId === id
    );
    const properties = links.map((l: any) => {
      const allProps = ms?.properties || [];
      const prop = allProps.find((p: any) => p.id === (l.property_id || l.propertyId));
      return prop ? { ...prop, portfolioNotes: l.notes, portfolio_link_id: l.id } : null;
    }).filter(Boolean);
    return NextResponse.json({ ...portfolio, properties }, { status: 200 });
  } catch (error) {
    console.error('❌ GET /api/portfolios/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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

    delete body.id;
    delete body.userId;
    delete body.user_id;

    if (body.type && !['Standard', 'PRO'].includes(body.type)) {
      return NextResponse.json({ error: 'Invalid type value' }, { status: 400 });
    }

    try {
      const supabaseData: Record<string, any> = {};
      if (body.name !== undefined) supabaseData.name = body.name;
      if (body.description !== undefined) supabaseData.description = body.description || null;
      if (body.year !== undefined) supabaseData.year = body.year ?? null;
      if (body.type !== undefined) supabaseData.type = body.type;
      if (body.status !== undefined) supabaseData.status = body.status;

      const updated = await portfoliosApi.update(id, supabaseData, userId);
      return NextResponse.json({ message: 'Portfolio updated', portfolioId: updated.id }, { status: 200 });
    } catch {
      const store = ms?.portfolios || [];
      const idx = store.findIndex((p: any) => p.id === id && (p.user_id === userId || p.userId === userId));
      if (idx === -1) {
        return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
      }
      store[idx] = { ...store[idx], ...body };
      persistMockStorage();
      return NextResponse.json({ message: 'Portfolio updated', portfolioId: id }, { status: 200 });
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
      await portfoliosApi.delete(id, userId);
    } catch {
      const store = ms?.portfolios || [];
      const idx = store.findIndex((p: any) => p.id === id && (p.user_id === userId || p.userId === userId));
      if (idx >= 0) store.splice(idx, 1);
    }
    // Clean up linked properties
    const links = ms?.portfolio_properties || [];
    for (let i = links.length - 1; i >= 0; i--) {
      if (links[i].portfolio_id === id || links[i].portfolioId === id) links.splice(i, 1);
    }
    persistMockStorage();
    return NextResponse.json({ message: 'Portfolio deleted', portfolioId: id }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
