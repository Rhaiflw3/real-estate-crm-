import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-utils';
import { generateFeedToken } from '@/lib/feed-token';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = generateFeedToken(userId);
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('❌ GET /api/calendar/feed-token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
