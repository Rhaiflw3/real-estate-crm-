import { NextRequest, NextResponse } from 'next/server';
import { documentsApi, mockStorage as ms } from '@/lib/supabase';
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

    try {
      const docs = await documentsApi.getByEntity('Lead', id);
      return NextResponse.json(docs, { status: 200 });
    } catch {
      const store = ms?.documents || [];
      const filtered = store.filter(
        (d: any) => d.entity_type === 'Lead' && d.entity_id === id
      );
      return NextResponse.json(filtered, { status: 200 });
    }
  } catch (error) {
    console.error('❌ GET /api/leads/[id]/documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
