import { NextRequest, NextResponse } from 'next/server';
import { realSupabase } from '@/lib/supabase';
import { generateFeedToken } from '@/lib/feed-token';

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function formatIcsDate(dateStr: string, timeStr?: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (timeStr) {
    const [hh, mi] = timeStr.split(':').map(Number);
    return `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}T${String(hh).padStart(2, '0')}${String(mi).padStart(2, '0')}00`;
  }
  return `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
}

function foldLine(line: string): string {
  if (line.length <= 75) return line + '\r\n';
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 75) {
    if (i === 0) parts.push(line.slice(i, i + 75));
    else parts.push(' ' + line.slice(i, i + 74));
  }
  return parts.join('\r\n') + '\r\n';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse('Missing token parameter', { status: 400 });
    }

    // Find user by computing HMAC for known users
    // We query all users and compare the computed token
    const { data: users, error: usersError } = await realSupabase
      .from('users')
      .select('id');

    if (usersError || !users?.length) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let userId: string | null = null;
    for (const u of users) {
      if (generateFeedToken(u.id) === token) {
        userId = u.id;
        break;
      }
    }

    if (!userId) {
      return new NextResponse('Invalid token', { status: 401 });
    }

    const { data: events, error: eventsError } = await realSupabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events for iCal:', eventsError);
      return new NextResponse('Internal error', { status: 500 });
    }

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RealEstateCRM//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Real Estate CRM',
      'X-WR-TIMEZONE:America/Lima',
    ];

    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    for (const ev of (events || [])) {
      const uid = ev.id + '@realestatecrm';
      const dtstart = formatIcsDate(ev.date, ev.time);
      const summary = escapeIcsText(ev.title || 'Untitled');
      const description = ev.notes ? escapeIcsText(ev.notes) : '';
      const typeTag = ev.type || 'Other';

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${now}`);
      if (ev.time) {
        lines.push(`DTSTART:${dtstart}`);
        lines.push(`DTEND:${dtstart}`);
      } else {
        lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
      }
      lines.push(`SUMMARY:[${escapeIcsText(typeTag)}] ${summary}`);
      if (description) lines.push(`DESCRIPTION:${description}`);
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    const icsContent = lines.map(foldLine).join('');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="calendar.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('❌ GET /api/calendar/ical error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
