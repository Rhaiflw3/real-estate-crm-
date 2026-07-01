import { NextRequest, NextResponse } from 'next/server';
import type { Property } from '@/lib/types/property';
import { PROPERTY_STATUSES, PROPERTY_TYPES } from '@/lib/constants/property-constants';
import { propertiesApi } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-utils';

function transformSupabaseProperty(supabaseProperty: any): Property {
  return {
    id: supabaseProperty.id,
    title: supabaseProperty.title,
    description: supabaseProperty.description || '',
    price: Number(supabaseProperty.price),
    status: supabaseProperty.status as Property['status'],
    type: supabaseProperty.type as Property['type'],
    bedrooms: supabaseProperty.bedrooms ?? undefined,
    bathrooms: supabaseProperty.bathrooms ?? undefined,
    areaSqFt: supabaseProperty.area_sq_ft ?? undefined,
    address: supabaseProperty.address || '',
    city: supabaseProperty.city || '',
    state: supabaseProperty.state || '',
    zipCode: supabaseProperty.zip_code || '',
    notes: supabaseProperty.notes || '',
    createdAt: new Date(supabaseProperty.created_at).toISOString().split('T')[0],
  };
}

function transformToSupabaseProperty(property: Partial<Property> & { userId: string }): any {
  return {
    title: property.title,
    description: property.description || null,
    price: property.price,
    status: property.status,
    type: property.type,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    area_sq_ft: property.areaSqFt ?? null,
    address: property.address || null,
    city: property.city || null,
    state: property.state || null,
    zip_code: property.zipCode || null,
    notes: property.notes || null,
    user_id: property.userId,
  };
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📥 GET /api/properties - Fetching properties from Supabase');

    try {
      const supabaseProperties = await propertiesApi.getAll(userId);
      console.log(`✅ Retrieved ${supabaseProperties.length} properties from Supabase`);

      const properties = supabaseProperties.map(transformSupabaseProperty);
      return NextResponse.json(properties, { status: 200 });

    } catch (supabaseError) {
      console.log('⚠️ Supabase fetch failed, trying Prisma fallback');

      try {
        const { prisma } = require('@/lib/prisma');
        const prismaProperties = await prisma.property.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        console.log(`✅ Retrieved ${prismaProperties.length} properties from Prisma fallback`);
        return NextResponse.json(prismaProperties, { status: 200 });
      } catch (prismaError) {
        console.log('⚠️ Prisma also failed, using in-memory fallback');

        const { inMemoryProperties } = require('@/lib/in-memory-store');
        const userProperties = inMemoryProperties.filter((p: any) => p.userId === userId);
        return NextResponse.json(userProperties, { status: 200 });
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
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const propertyData = body as Partial<Property>;

    const requiredFields = ['title', 'price', 'status', 'type'] as const;
    const missingFields = requiredFields.filter(field => {
      const value = propertyData[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof propertyData.title !== 'string' || propertyData.title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid title format' },
        { status: 400 }
      );
    }

    const validStatuses = PROPERTY_STATUSES;
    if (!validStatuses.includes(propertyData.status as any)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const validTypes = PROPERTY_TYPES;
    if (!validTypes.includes(propertyData.type as any)) {
      return NextResponse.json(
        { error: 'Invalid type value' },
        { status: 400 }
      );
    }

    if (typeof propertyData.price !== 'number' || propertyData.price < 0) {
      return NextResponse.json(
        { error: 'Invalid price value' },
        { status: 400 }
      );
    }

    console.log('📥 Saving property:', {
      title: propertyData.title,
      price: propertyData.price,
      status: propertyData.status,
      type: propertyData.type,
    });

    try {
      const supabasePropertyData = transformToSupabaseProperty({
        ...propertyData,
        userId,
      });
      const savedProperty = await propertiesApi.create(supabasePropertyData);

      console.log('✅ Property saved to Supabase successfully:', savedProperty.id);

      return NextResponse.json(
        {
          message: 'Property created',
          propertyId: savedProperty.id,
          timestamp: new Date().toISOString(),
        },
        { status: 201 }
      );

    } catch (supabaseError) {
      console.log('⚠️ Supabase save failed, trying Prisma fallback');

      try {
        const { prisma } = require('@/lib/prisma');

        const savedProperty = await prisma.property.create({
          data: {
            title: propertyData.title!,
            description: propertyData.description || null,
            price: propertyData.price!,
            status: propertyData.status!,
            type: propertyData.type!,
            bedrooms: propertyData.bedrooms ?? null,
            bathrooms: propertyData.bathrooms ?? null,
            areaSqFt: propertyData.areaSqFt ?? null,
            address: propertyData.address || null,
            city: propertyData.city || null,
            state: propertyData.state || null,
            zipCode: propertyData.zipCode || null,
            notes: propertyData.notes || null,
            userId,
          },
        });

        console.log('✅ Property saved to Prisma fallback:', savedProperty.id);

        return NextResponse.json(
          {
            message: 'Property created',
            propertyId: savedProperty.id,
            timestamp: new Date().toISOString(),
          },
          { status: 201 }
        );

      } catch (prismaError) {
        console.log('⚠️ Prisma also failed, using in-memory fallback');

        const newProperty = {
          id: `mem_${Date.now()}`,
          title: propertyData.title!,
          description: propertyData.description || '',
          price: propertyData.price!,
          status: propertyData.status!,
          type: propertyData.type!,
          bedrooms: propertyData.bedrooms ?? null,
          bathrooms: propertyData.bathrooms ?? null,
          areaSqFt: propertyData.areaSqFt ?? null,
          address: propertyData.address || '',
          city: propertyData.city || '',
          state: propertyData.state || '',
          zipCode: propertyData.zipCode || '',
          notes: propertyData.notes || '',
          userId,
          createdAt: new Date().toISOString().split('T')[0],
        };

        const { inMemoryProperties } = require('@/lib/in-memory-store');
        inMemoryProperties.push(newProperty);

        console.log('✅ Property saved to in-memory fallback:', newProperty.id);

        return NextResponse.json(
          {
            message: 'Property created',
            propertyId: newProperty.id,
            timestamp: new Date().toISOString(),
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
