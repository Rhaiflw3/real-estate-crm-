import { NextRequest, NextResponse } from 'next/server';
import { documentsApi, mockStorage as ms, persistMockStorage } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    try {
      const docs = await documentsApi.getAll(entityType || undefined, entityId || undefined);
      return NextResponse.json(docs, { status: 200 });
    } catch {
      let store = ms?.documents || [];
      if (entityType) store = store.filter((d: any) => d.entity_type === entityType);
      if (entityId) store = store.filter((d: any) => d.entity_id === entityId);
      return NextResponse.json(store, { status: 200 });
    }
  } catch (error) {
    console.error('❌ GET /api/documents error:', error);
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

    if (!body.name || !body.entityType || !body.entityId) {
      return NextResponse.json({ error: 'name, entityType, and entityId are required' }, { status: 400 });
    }

    const validTypes = ['PDF', 'Image', 'Doc', 'Spreadsheet', 'Other'];
    if (body.type && !validTypes.includes(body.type)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    const validEntities = ['Property', 'Lead', 'Portfolio'];
    if (!validEntities.includes(body.entityType)) {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    try {
      const supabaseData = {
        name: body.name,
        type: body.type || 'Other',
        description: body.description || null,
        entity_type: body.entityType,
        entity_id: body.entityId,
        notes: body.notes || null,
        user_id: userId,
      };
      const saved = await documentsApi.create(supabaseData);
      return NextResponse.json({ message: 'Document created', data: saved }, { status: 201 });
    } catch {
      const store = ms?.documents || [];
      const newDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: body.name,
        type: body.type || 'Other',
        description: body.description || null,
        entity_type: body.entityType,
        entity_id: body.entityId,
        notes: body.notes || null,
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      store.push(newDoc);
      persistMockStorage();
      return NextResponse.json({ message: 'Document created', data: newDoc }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    console.error('❌ POST /api/documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    try {
      await documentsApi.delete(id);
    } catch {
      const store = ms?.documents || [];
      const idx = store.findIndex((d: any) => d.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      store.splice(idx, 1);
      persistMockStorage();
    }

    return NextResponse.json({ message: 'Document deleted' }, { status: 200 });
  } catch (error) {
    console.error('❌ DELETE /api/documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
