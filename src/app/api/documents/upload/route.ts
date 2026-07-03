import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUserId } from '@/lib/auth-utils';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const EXT_MAP: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string || '';
    const entityType = formData.get('entityType') as string || '';
    const entityId = formData.get('entityId') as string || '';
    const description = formData.get('description') as string || '';
    const notes = formData.get('notes') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX',
      }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
    }

    if (!name.trim() || !entityType || !entityId) {
      return NextResponse.json({ error: 'name, entityType, and entityId are required' }, { status: 400 });
    }

    const ext = EXT_MAP[file.type] || '';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = `${userId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(filePath);

    const docType =
      file.type === 'application/pdf' ? 'PDF' :
      file.type.includes('word') ? 'Doc' :
      file.type.includes('spreadsheet') || file.type.includes('excel') ? 'Spreadsheet' :
      'Other';

    const supabaseData = {
      name: name.trim(),
      type: docType,
      description: description || null,
      entity_type: entityType,
      entity_id: entityId,
      notes: notes || null,
      file_url: urlData.publicUrl,
      user_id: userId,
    };

    const { data: savedDoc, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert(supabaseData)
      .select()
      .single();

    if (dbError) {
      await supabaseAdmin.storage.from('documents').remove([filePath]);
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Document uploaded', data: savedDoc }, { status: 201 });
  } catch (error) {
    console.error('POST /api/documents/upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
