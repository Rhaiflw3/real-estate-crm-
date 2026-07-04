import { NextRequest, NextResponse } from 'next/server';
import { portfoliosApi, propertiesApi } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-utils';
import * as XLSX from 'xlsx';

const SECTION_PATTERNS = [
  { pattern: /casas?\s*(en\s*)?venta/i, type: 'House', defaultStatus: 'Available' },
  { pattern: /terrenos?\s*(en\s*)?venta/i, type: 'Land', defaultStatus: 'Available' },
  { pattern: /departamentos?\s*(en\s*)?venta/i, type: 'Apartment', defaultStatus: 'Available' },
  { pattern: /hoteles?\s*(en\s*)?venta/i, type: 'Commercial', defaultStatus: 'Available' },
  { pattern: /locales?\s*comerciales?\s*(en\s*)?venta/i, type: 'Commercial', defaultStatus: 'Available' },
  { pattern: /locales?\s*(en\s*)?venta/i, type: 'Commercial', defaultStatus: 'Available' },
  { pattern: /casas?\s*\/\s*dptos?\s*(en\s*)?alquiler/i, type: 'House', defaultStatus: 'Rented' },
  { pattern: /dptos?\s*(en\s*)?alquiler/i, type: 'Apartment', defaultStatus: 'Rented' },
  { pattern: /locales?\s*(en\s*)?alquiler/i, type: 'Commercial', defaultStatus: 'Rented' },
  { pattern: /alquiler/i, type: 'House', defaultStatus: 'Rented' },
];

const STATUS_MAP: Record<string, string> = {
  'urgente': 'Available',
  'activo': 'Available',
  'pendiente': 'Pending',
  'firmado': 'Sold',
  'firmar': 'Pending',
  'inactivo': 'OffMarket',
  'sin precio': 'OffMarket',
  'sin contrato': 'Pending',
  'docs pendientes': 'Pending',
  'seguimiento': 'Pending',
  'contrato': 'Pending',
  'fuera cartera': 'OffMarket',
  'debe': 'Pending',
};

function parsePrice(raw: string): number | null {
  if (!raw || raw === '—' || raw === '-') return null;
  const cleaned = String(raw)
    .replace(/^S\/\s*/, '')
    .replace(/^(\$|USD)\s*/, '')
    .replace(/\/mes.*$/, '')
    .replace(/,/g, '')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseArea(raw: string): number | null {
  if (!raw || raw === '—' || raw === '-') return null;
  let cleaned = String(raw).toLowerCase().replace(/\s*m²?\s*$/, '').replace(/,/g, '').trim();
  const haMatch = cleaned.match(/^([\d.]+)\s*ha$/);
  if (haMatch) return Math.round(parseFloat(haMatch[1]) * 10000);
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Math.round(num);
}

function mapStatus(raw: string): string {
  if (!raw || raw === '—' || raw === '-') return 'Available';
  const lower = String(raw).toLowerCase().replace(/[^\w\s]/g, '').trim();
  for (const [key, value] of Object.entries(STATUS_MAP)) {
    if (lower.includes(key)) return value;
  }
  if (lower.includes('activo')) return 'Available';
  if (lower.includes('disponible')) return 'Available';
  return 'Available';
}

function detectSection(raw: string): { type: string; defaultStatus: string } | null {
  for (const section of SECTION_PATTERNS) {
    if (section.pattern.test(raw)) return { type: section.type, defaultStatus: section.defaultStatus };
  }
  return null;
}

function isDataRow(row: any[]): boolean {
  const num = row[0];
  const title = row[1];
  if (typeof num === 'number' && title && String(title).trim().length > 0) return true;
  if (typeof num === 'string' && /^\d+$/.test(num) && title && String(title).trim().length > 0) return true;
  return false;
}

function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

    const targetSheetName = workbook.SheetNames.find(
      (n) => n.includes('Cartera') || n.includes('Propiedades') || n.includes('cartera')
    ) || workbook.SheetNames[0];

    const sheet = workbook.Sheets[targetSheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 });
    }

    const portfolioName = file.name.replace(/\.(xlsx|xls)$/i, '');
    const portfolioType = portfolioName.toUpperCase().includes('PRO') ? 'PRO' : 'Standard';

    let portfolio: any;
    try {
      const supabaseData = {
        id: generateId(),
        name: portfolioName,
        description: `Imported from ${file.name}`,
        year: new Date().getFullYear(),
        type: portfolioType,
        status: 'Active' as const,
        user_id: userId,
      };
      portfolio = await portfoliosApi.create(supabaseData);
    } catch {
      const { inMemoryPortfolios } = require('@/lib/in-memory-store');
      portfolio = {
        id: `mem_${Date.now()}`,
        name: portfolioName,
        description: `Imported from ${file.name}`,
        year: new Date().getFullYear(),
        type: portfolioType,
        status: 'Active',
        userId,
        createdAt: new Date().toISOString().split('T')[0],
      };
      inMemoryPortfolios.push(portfolio);
    }

    let currentType = 'House';
    let currentDefaultStatus = 'Available';
    const isPro = portfolioType === 'PRO';
    let propertiesCreated = 0;
    let rowsSkipped = 0;
    let rowsFailed = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const firstCell = String(row[0] || '').trim();

      // Detect section header
      if (firstCell && !isDataRow(row) && !firstCell.startsWith('N°')) {
        const section = detectSection(firstCell);
        if (section) {
          currentType = section.type;
          currentDefaultStatus = section.defaultStatus;
        }
        continue;
      }

      // Skip header rows and empty rows
      if (firstCell.startsWith('N°') || !isDataRow(row)) { rowsSkipped++; continue; }

      const title = String(row[1] || '').trim();
      if (!title) { rowsSkipped++; continue; }

      const price = parsePrice(row[3]);
      if (price === null) { rowsSkipped++; continue; }

      const areaM2 = parseArea(row[2]);
      const notes = String(row[isPro ? 9 : 8] || '').trim();

      let propertyStatus = currentDefaultStatus;
      if (isPro && row[8]) {
        propertyStatus = mapStatus(row[8]);
      }

      const propertyData: Record<string, any> = {
        title,
        price,
        type: currentType,
        status: propertyStatus,
        areaSqFt: areaM2 ? Math.round(areaM2 * 10.764) : undefined,
        notes: notes || null,
        description: `Área: ${row[2] || '—'} | ${currentType} en ${currentDefaultStatus === 'Rented' ? 'alquiler' : 'venta'} — ${title}`,
        userId,
      };

      try {
        const supabasePropertyData = {
          id: generateId(),
          title: propertyData.title,
          description: propertyData.description || null,
          price: propertyData.price,
          status: propertyData.status,
          type: propertyData.type,
          area_sq_ft: propertyData.areaSqFt ?? null,
          notes: propertyData.notes || null,
          user_id: userId,
        };

        let savedProperty;
        try {
          savedProperty = await propertiesApi.create(supabasePropertyData);
        } catch {
          const { prisma } = require('@/lib/prisma');
          savedProperty = await prisma.property.create({ data: propertyData });
        }

        try {
          await portfoliosApi.addProperty(portfolio.id, savedProperty.id);
        } catch {
          try {
            const { prisma } = require('@/lib/prisma');
            await prisma.portfolioProperty.create({
              data: { portfolioId: portfolio.id, propertyId: savedProperty.id },
            });
          } catch {
            const { inMemoryPortfolioProperties } = require('@/lib/in-memory-store');
            inMemoryPortfolioProperties.push({
              id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              portfolioId: portfolio.id,
              propertyId: savedProperty.id,
              createdAt: new Date().toISOString().split('T')[0],
            });
          }
        }

        propertiesCreated++;
      } catch (e) {
        rowsFailed++;
        console.warn('⚠️ Could not import row:', title, e);
      }
    }

    return NextResponse.json({
      message: 'Import complete',
      portfolioName: portfolio.name,
      portfolioId: portfolio.id,
      propertiesCreated,
      rowsProcessed: rows.length,
      rowsSkipped,
      rowsFailed,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
