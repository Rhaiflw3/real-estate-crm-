import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Real Supabase client for direct database access
// Uses anon key — safe for client and server
export const realSupabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
)

// =============================================================================
// Legacy mock system — untouched
// =============================================================================

const mockUserId = '8532c1eb-346c-4b69-9986-c79523913ac9';

// In-memory storage shared across mock clients
export const mockStorage: Record<string, any[]> = {
  leads: [],
  properties: [],
  portfolios: [],
  portfolio_properties: [],
  lead_properties: [],
  calendar_events: [],
  documents: [],
};

const PERSISTENCE_PATH = path.join(process.cwd(), 'data', 'mock-storage.json');

export function persistMockStorage(): void {
  if (process.env.NODE_ENV === 'production') return
  try {
    const dir = path.dirname(PERSISTENCE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PERSISTENCE_PATH, JSON.stringify(mockStorage, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Failed to persist mock storage:', err);
  }
}

function loadMockStorage(): void {
  try {
    if (fs.existsSync(PERSISTENCE_PATH)) {
      const raw = fs.readFileSync(PERSISTENCE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          mockStorage[key] = data[key];
        }
      });
      console.log(`📂 Loaded mock storage from ${PERSISTENCE_PATH}`);
    }
  } catch (err) {
    console.warn('⚠️ Failed to load mock storage:', err);
  }
}

loadMockStorage();

// Mock createClient function — supports chaining + await
const createClient = (url: string, key: string, options?: any): any => {
  console.log('📝 Using mock Supabase client');

  function exec(state: any) {
    const { table, where, orderBy, isSingle, mutation, selectColumns } = state;
    const store = mockStorage[table] || [];

    const applyFilters = (items: any[]) => {
      let filtered = [...items];
      if (Object.keys(where).length > 0) {
        filtered = filtered.filter((item: any) =>
          Object.entries(where).every(([k, v]) => String(item[k]) === String(v))
        );
      }
      if (orderBy) {
        filtered.sort((a: any, b: any) => new Date(b[orderBy]).getTime() - new Date(a[orderBy]).getTime());
      }
      return isSingle ? (filtered[0] || null) : filtered;
    };

    // Mutation with select (e.g. .insert(d).select().single())
    if (mutation) {
      const { type, data } = mutation;
      if (type === 'insert') {
        const newItem = {
          id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (!mockStorage[table]) mockStorage[table] = [];
        mockStorage[table].push(newItem);
        persistMockStorage();
        const result = isSingle ? newItem : [newItem];
        return { data: result, error: null };
      }
      if (type === 'update') {
        if (!mockStorage[table]) return { data: null, error: null };
        mockStorage[table] = mockStorage[table].map((item: any) =>
          Object.entries(where).every(([k, v]) => String(item[k]) === String(v))
            ? { ...item, ...data, updated_at: new Date().toISOString() }
            : item
        );
        persistMockStorage();
        const result = applyFilters(mockStorage[table]);
        return { data: result, error: null };
      }
      if (type === 'delete') {
        if (!mockStorage[table]) return { data: [], error: null };
        mockStorage[table] = mockStorage[table].filter((item: any) =>
          !Object.entries(where).every(([k, v]) => String(item[k]) === String(v))
        );
        persistMockStorage();
        return { data: [], error: null };
      }
    }

    // Pure select query (e.g. .select('*').eq('x', y).order(...))
    const result = applyFilters(store);
    return { data: result, error: null };
  }

  function createBuilder(table: string, s?: any) {
    const state = s || {
      table, where: {} as Record<string, any>, orderBy: '',
      isSingle: false, selectColumns: null as string | null,
      mutation: null as { type: string; data?: any } | null,
    };

    const builder: any = {
      select: (_columns?: string) => {
        const next = { ...state, selectColumns: _columns || '*' };
        if (!next.mutation) next.mutation = { type: 'select' };
        return createBuilder(table, next);
      },
      insert: (data: any) => {
        return createBuilder(table, { ...state, mutation: { type: 'insert', data } });
      },
      update: (data: any) => {
        return createBuilder(table, { ...state, mutation: { type: 'update', data } });
      },
      delete: () => {
        return createBuilder(table, { ...state, mutation: { type: 'delete' } });
      },
      eq: (column: string, value: any) => {
        return createBuilder(table, { ...state, where: { ...state.where, [column]: value } });
      },
      order: (column: string, _options?: any) => {
        return createBuilder(table, { ...state, orderBy: column });
      },
      single: () => {
        return createBuilder(table, { ...state, isSingle: true });
      },
      then: (resolve: any, reject: any) => {
        return Promise.resolve(exec(state)).then(resolve, reject);
      },
      catch: (reject: any) => builder.then(null, reject),
    };

    return builder;
  }

  return {
    from: (table: string) => createBuilder(table),
      auth: {
        signIn: async () => ({ data: { user: { id: mockUserId } }, error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: { id: mockUserId } }, error: null }),
      },
  };
};

// Supabase connection configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export let supabase: any;
export let supabaseClient: any;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://mock.supabase.co' && !supabaseKey.includes('your-anon-key')) {
  supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  supabaseClient = supabase;
  console.log('✅ Using real Supabase client');
} else {
  supabase = createClient(supabaseUrl || 'https://mock.supabase.co', supabaseKey || 'mock-key', {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  supabaseClient = supabase;
  console.log('📝 Using mock Supabase client');

  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ Supabase env vars inválidas en producción. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/ANON_KEY')
  }
}

// Helper functions for common operations
export const leadsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  create: async (leadData: any) => {
    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export const propertiesApi = {
  getAll: async (userId?: string) => {
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  create: async (propertyData: any) => {
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any, userId: string) => {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string, userId: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
};

export const portfoliosApi = {
  getAll: async (userId: string) => {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getById: async (id: string, userId: string) => {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        portfolio_properties(
          *,
          property:property_id(*)
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  create: async (portfolioData: any) => {
    const { data, error } = await supabase
      .from('portfolios')
      .insert(portfolioData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any, userId: string) => {
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string, userId: string) => {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  addProperty: async (portfolioId: string, propertyId: string, notes?: string) => {
    const { data, error } = await supabase
      .from('portfolio_properties')
      .insert({
        portfolio_id: portfolioId,
        property_id: propertyId,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  removeProperty: async (portfolioId: string, propertyId: string) => {
    const { error } = await supabase
      .from('portfolio_properties')
      .delete()
      .eq('portfolio_id', portfolioId)
      .eq('property_id', propertyId);

    if (error) throw error;
    return true;
  },
};

export const leadPropertiesApi = {
  getByLead: async (leadId: string) => {
    const { data, error } = await supabase
      .from('lead_properties')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getByProperty: async (propertyId: string) => {
    const { data, error } = await supabase
      .from('lead_properties')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  create: async (data: {
    lead_id: string;
    property_id: string;
    interest_level?: string;
    notes?: string;
  }) => {
    const { data: saved, error } = await supabase
      .from('lead_properties')
      .insert({
        lead_id: data.lead_id,
        property_id: data.property_id,
        interest_level: data.interest_level || 'Medium',
        notes: data.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return saved;
  },

  update: async (id: string, updates: { interest_level?: string; notes?: string }) => {
    const { data, error } = await supabase
      .from('lead_properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('lead_properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};

export const calendarApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  create: async (eventData: any) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};

export const documentsApi = {
  getAll: async (entityType?: string, entityId?: string) => {
    let query = supabase
      .from('documents')
      .select('*');

    if (entityType) query = query.eq('entity_type', entityType);
    if (entityId) query = query.eq('entity_id', entityId);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  getByEntity: async (entityType: string, entityId: string) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  create: async (docData: any) => {
    const { data, error } = await supabase
      .from('documents')
      .insert(docData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};
