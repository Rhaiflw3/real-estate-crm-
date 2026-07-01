import { NextRequest, NextResponse } from 'next/server';
import { leadPropertiesApi, mockStorage as ms } from '@/lib/supabase';
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

    const { id: propertyId } = await params;

    try {
      const links = await leadPropertiesApi.getByProperty(propertyId);
      const allLeads = (ms?.leads || []);
      const enriched = links.map((l: any) => {
        const lead = allLeads.find((p: any) => p.id === (l.lead_id || l.leadId));
        return {
          id: l.id,
          leadId: l.lead_id || l.leadId,
          propertyId: l.property_id || l.propertyId,
          interestLevel: l.interest_level || l.interestLevel || 'Medium',
          notes: l.notes || null,
          createdAt: l.created_at || l.createdAt,
          lead: lead || null,
        };
      });
      return NextResponse.json(enriched, { status: 200 });
    } catch {
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error('❌ GET /api/properties/[id]/leads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
