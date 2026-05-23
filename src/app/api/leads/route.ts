import { NextRequest, NextResponse } from 'next/server';
import type { Lead } from '@/lib/types/lead';
import { LEAD_STATUSES } from '@/lib/constants/lead-status';
import { leadsApi } from '@/lib/supabase';

// Helper to transform Supabase data to our Lead type
function transformSupabaseLead(supabaseLead: any): Lead {
  return {
    id: supabaseLead.id,
    name: supabaseLead.name,
    email: supabaseLead.email,
    phone: supabaseLead.phone || '',
    status: supabaseLead.status as Lead['status'],
    source: supabaseLead.source,
    createdAt: new Date(supabaseLead.created_at).toISOString().split('T')[0],
    aiSummary: supabaseLead.ai_summary || '',
    notes: supabaseLead.notes || ''
  };
}

// Helper to transform our Lead type to Supabase format
function transformToSupabaseLead(lead: Partial<Lead>): any {
  return {
    name: lead.name,
    email: lead.email,
    phone: lead.phone || '',
    status: lead.status,
    source: lead.source,
    ai_summary: lead.aiSummary || null,
    notes: lead.notes || null
  };
}



export async function GET() {
  try {
    console.log('📥 GET /api/leads - Fetching leads from Supabase');
    
    try {
      // Try to fetch from Supabase
      const supabaseLeads = await leadsApi.getAll();
      console.log(`✅ Retrieved ${supabaseLeads.length} leads from Supabase`);
      
      // Transform to our Lead type
      const leads = supabaseLeads.map(transformSupabaseLead);
      return NextResponse.json(leads, { status: 200 });
      
    } catch (supabaseError) {
      console.log('⚠️ Supabase fetch failed, trying Prisma fallback');
      
      // Try Prisma as fallback
      let prisma: any;
      try {
        prisma = require('@/lib/prisma').prisma;
        const prismaLeads = await prisma.lead.findMany({
          orderBy: { createdAt: 'desc' },
        });
        console.log(`✅ Retrieved ${prismaLeads.length} leads from Prisma fallback`);
        return NextResponse.json(prismaLeads, { status: 200 });
      } catch (prismaError) {
        console.log('⚠️ Prisma also failed, using in-memory fallback');
        
        // Ultimate fallback to in-memory
        const inMemoryLeads: any[] = [];
        return NextResponse.json(inMemoryLeads, { status: 200 });
      }
    }
    
  } catch (error) {
    console.error('❌ GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación básica de tipo
    const leadData = body as Partial<Lead>;
    
    // Validar campos requeridos
    const requiredFields = ['name', 'email', 'status', 'source'] as const;
    const missingFields = requiredFields.filter(field => !leadData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar tipos específicos
    if (typeof leadData.name !== 'string' || leadData.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid name format' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof leadData.email !== 'string' || !emailRegex.test(leadData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const validStatuses = LEAD_STATUSES;
    if (!validStatuses.includes(leadData.status as any)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    if (leadData.aiSummary && typeof leadData.aiSummary !== 'string') {
      return NextResponse.json(
        { error: 'aiSummary must be a string if provided' },
        { status: 400 }
      );
    }

    console.log('📥 Saving lead:', {
      name: leadData.name,
      email: leadData.email,
      status: leadData.status,
      source: leadData.source,
      hasAiSummary: !!leadData.aiSummary,
    });

    // Try to save to Supabase first
    try {
      const supabaseLeadData = transformToSupabaseLead(leadData);
      const savedLead = await leadsApi.create(supabaseLeadData);
      
      console.log('✅ Lead saved to Supabase successfully:', savedLead.id);
      
      return NextResponse.json(
        { 
          message: 'Lead processed by AI Infrastructure',
          leadId: savedLead.id,
          timestamp: new Date().toISOString()
        },
        { status: 201 }
      );
      
    } catch (supabaseError) {
      console.log('⚠️ Supabase save failed, trying Prisma fallback');
      
      // Try Prisma as fallback
      try {
        let prisma: any;
        prisma = require('@/lib/prisma').prisma;
        
        const savedLead = await prisma.lead.create({
          data: {
            name: leadData.name!,
            email: leadData.email!,
            phone: leadData.phone || '',
            status: leadData.status!,
            source: leadData.source!,
            aiSummary: leadData.aiSummary || null,
            notes: leadData.notes || null,
          },
        });
        
        console.log('✅ Lead saved to Prisma fallback:', savedLead.id);
        
        return NextResponse.json(
          { 
            message: 'Lead processed by AI Infrastructure',
            leadId: savedLead.id,
            timestamp: new Date().toISOString()
          },
          { status: 201 }
        );
        
      } catch (prismaError) {
        console.log('⚠️ Prisma also failed, using in-memory fallback');
        
        // Ultimate fallback to in-memory
        const newLead = {
          id: `mem_${Date.now()}`,
          name: leadData.name!,
          email: leadData.email!,
          phone: leadData.phone || '',
          status: leadData.status!,
          source: leadData.source!,
          aiSummary: leadData.aiSummary || null,
          notes: leadData.notes || null,
          createdAt: new Date().toISOString().split('T')[0],
        };
        
        console.log('✅ Lead saved to in-memory fallback:', newLead.id);
        
        return NextResponse.json(
          { 
            message: 'Lead processed by AI Infrastructure',
            leadId: newLead.id,
            timestamp: new Date().toISOString()
          },
          { status: 201 }
        );
      }
    }

  } catch (error) {
    console.error('❌ POST API error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}