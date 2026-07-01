import { NextRequest, NextResponse } from 'next/server';
import { leadPropertiesApi, mockStorage as ms, persistMockStorage } from '@/lib/supabase';
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

    const { id: leadId } = await params;

    try {
      const links = await leadPropertiesApi.getByLead(leadId);
      const allProps = (ms?.properties || []);
      const enriched = links.map((l: any) => {
        const prop = allProps.find((p: any) => p.id === (l.property_id || l.propertyId));
        return {
          id: l.id,
          leadId: l.lead_id || l.leadId,
          propertyId: l.property_id || l.propertyId,
          interestLevel: l.interest_level || l.interestLevel || 'Medium',
          notes: l.notes || null,
          createdAt: l.created_at || l.createdAt,
          property: prop || null,
        };
      });
      return NextResponse.json(enriched, { status: 200 });
    } catch {
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error('❌ GET /api/leads/[id]/properties error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leadId } = await params;
    const body = await request.json();

    if (!body.propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    try {
      const saved = await leadPropertiesApi.create({
        lead_id: leadId,
        property_id: body.propertyId,
        interest_level: body.interestLevel || 'Medium',
        notes: body.notes || null,
      });
      return NextResponse.json(
        { message: 'Property linked to lead', data: saved },
        { status: 201 }
      );
    } catch (err: any) {
      if (err?.message?.includes('duplicate') || err?.code === '23505' || err?.message?.includes('already exists')) {
        return NextResponse.json({ error: 'Property already linked to this lead' }, { status: 409 });
      }
      console.log('⚠️ Supabase failed, using in-memory fallback for lead property');
      const store = ms?.lead_properties || [];
      const exists = store.find(
        (l: any) => (l.lead_id === leadId || l.leadId === leadId) && (l.property_id === body.propertyId || l.propertyId === body.propertyId)
      );
      if (exists) {
        return NextResponse.json({ error: 'Property already linked to this lead' }, { status: 409 });
      }
      const newLink = {
        id: `lp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        lead_id: leadId,
        property_id: body.propertyId,
        interest_level: body.interestLevel || 'Medium',
        notes: body.notes || null,
        created_at: new Date().toISOString(),
      };
      store.push(newLink);
      persistMockStorage();
      return NextResponse.json(
        { message: 'Property linked to lead', data: newLink },
        { status: 201 }
      );
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    console.error('❌ POST /api/leads/[id]/properties error:', error);
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

    const { id: leadId } = await params;
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const linkId = searchParams.get('linkId');

    if (!propertyId && !linkId) {
      return NextResponse.json({ error: 'propertyId or linkId query parameter is required' }, { status: 400 });
    }

    try {
      if (linkId) {
        await leadPropertiesApi.delete(linkId);
      } else {
        const links = await leadPropertiesApi.getByLead(leadId);
        const match = links.find(
          (l: any) => (l.property_id || l.propertyId) === propertyId
        );
        if (match) await leadPropertiesApi.delete(match.id);
      }
      return NextResponse.json({ message: 'Property unlinked from lead' }, { status: 200 });
    } catch {
      const store = ms?.lead_properties || [];
      const idx = store.findIndex((l: any) => {
        if (linkId) return l.id === linkId;
        return (l.lead_id === leadId || l.leadId === leadId) && (l.property_id === propertyId || l.propertyId === propertyId);
      });
      if (idx === -1) {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 });
      }
      store.splice(idx, 1);
      persistMockStorage();
      return NextResponse.json({ message: 'Property unlinked from lead' }, { status: 200 });
    }
  } catch (error) {
    console.error('❌ DELETE /api/leads/[id]/properties error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
