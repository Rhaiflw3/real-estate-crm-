import { NextRequest, NextResponse } from 'next/server';
import { calendarApi, mockStorage as ms, persistMockStorage } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-utils';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const events = await calendarApi.getAll();
      return NextResponse.json(events, { status: 200 });
    } catch {
      const store = ms?.calendar_events || [];
      return NextResponse.json(store, { status: 200 });
    }
  } catch (error) {
    console.error('❌ GET /api/calendar error:', error);
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

    if (!body.title || !body.date) {
      return NextResponse.json({ error: 'title and date are required' }, { status: 400 });
    }

    const validTypes = ['Call', 'Meeting', 'Showing', 'Task', 'Other'];
    if (body.type && !validTypes.includes(body.type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    try {
      const supabaseData = {
        title: body.title,
        date: body.date,
        time: body.time || null,
        type: body.type || 'Other',
        lead_id: body.leadId || body.lead_id || null,
        property_id: body.propertyId || body.property_id || null,
        notes: body.notes || null,
        user_id: userId,
      };
      const saved = await calendarApi.create(supabaseData);
      return NextResponse.json({ message: 'Event created', data: saved }, { status: 201 });
    } catch {
      const store = ms?.calendar_events || [];
      const newEvent = {
        id: `cal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: body.title,
        date: body.date,
        time: body.time || null,
        type: body.type || 'Other',
        lead_id: body.leadId || body.lead_id || null,
        property_id: body.propertyId || body.property_id || null,
        notes: body.notes || null,
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      store.push(newEvent);
      persistMockStorage();
      return NextResponse.json({ message: 'Event created', data: newEvent }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
    }
    console.error('❌ POST /api/calendar error:', error);
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
      await calendarApi.delete(id);
    } catch {
      const store = ms?.calendar_events || [];
      const idx = store.findIndex((e: any) => e.id === id);
      if (idx === -1) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      store.splice(idx, 1);
      persistMockStorage();
    }

    return NextResponse.json({ message: 'Event deleted' }, { status: 200 });
  } catch (error) {
    console.error('❌ DELETE /api/calendar error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
