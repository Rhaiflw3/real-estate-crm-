import { NextRequest, NextResponse } from 'next/server';
import { realSupabase } from '@/lib/supabase';
import { extractLeadFromMessage, generateReply } from '@/lib/ai';

const DEV_USER_ID = '8532c1eb-346c-4b69-9986-c79523913ac9';

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const from = params.get('From') || '';
    const body = params.get('Body') || '';

    if (!body.trim()) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    const extracted = await extractLeadFromMessage(body);
    const name = extracted.name || 'WhatsApp Lead';
    const email = extracted.email || `whatsapp_${from.replace(/[^0-9]/g, '').slice(-10)}@placeholder.com`;
    const phone = extracted.phone || from;
    const notes = [
      extracted.notes ? `Mensaje original: ${extracted.notes}` : `Mensaje original: ${body}`,
      extracted.location ? `Ubicación: ${extracted.location}` : '',
      extracted.propertyType ? `Tipo: ${extracted.propertyType}` : '',
      extracted.bedrooms ? `Habitaciones: ${extracted.bedrooms}` : '',
      extracted.budget ? `Presupuesto: $${extracted.budget.toLocaleString()}` : '',
    ].filter(Boolean).join('\n');

    const leadData = {
      name,
      email,
      phone,
      status: 'New',
      source: 'WhatsApp',
      user_id: DEV_USER_ID,
      notes,
    };

    try {
      await realSupabase.from('leads').insert(leadData);
      console.log('✅ Lead creado desde WhatsApp:', name);
    } catch (dbError) {
      console.error('❌ Error guardando lead:', dbError);
    }

    const reply = await generateReply(extracted);

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(reply)}</Message>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('❌ Webhook Twilio error:', error);
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>¡Gracias por tu mensaje! Un asesor se comunicará contigo pronto.</Message>
</Response>`;
    return new NextResponse(fallback, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  return NextResponse.json({
    message: 'Twilio webhook endpoint ready',
    usage: 'POST form-encoded with From and Body fields',
  });
}
