// Mock Supabase client - will be replaced when @supabase/supabase-js is installed
// This provides the same API but uses in-memory storage

// Type definitions for mock client
interface SupabaseQueryBuilder {
  select: (columns?: string) => Promise<any>;
  insert: (data: any) => Promise<any>;
  update: (data: any) => Promise<any>;
  delete: () => Promise<any>;
  eq: (column: string, value: any) => SupabaseQueryBuilder;
  order: (column: string, options?: any) => SupabaseQueryBuilder;
  single: () => SupabaseQueryBuilder;
}

// Mock createClient function
const createClient = (url: string, key: string, options?: any): any => {
  console.log('📝 Using mock Supabase client (install @supabase/supabase-js for real connection)');
  
  // In-memory storage
  const storage: Record<string, any[]> = {
    leads: []
  };
  
  // Helper to create query builder
  const createQueryBuilder = (table: string): SupabaseQueryBuilder => {
    let currentQuery = {
      table,
      where: {} as Record<string, any>,
      orderBy: '',
      isSingle: false
    };
    
    return {
      select: async (columns = '*') => {
        console.log(`[Mock Supabase] select from ${table} with columns: ${columns}`);
        let data = storage[table] || [];
        
        // Apply ordering if set
        if (currentQuery.orderBy) {
          data = [...data].sort((a, b) => {
            const aVal = a[currentQuery.orderBy];
            const bVal = b[currentQuery.orderBy];
            return new Date(bVal).getTime() - new Date(aVal).getTime();
          });
        }
        
        return { data, error: null };
      },
      
      insert: async (data: any) => {
        console.log(`[Mock Supabase] insert into ${table}:`, data);
        const newItem = { 
          id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        if (!storage[table]) {
          storage[table] = [];
        }
        storage[table].push(newItem);
        
        const result = currentQuery.isSingle ? newItem : [newItem];
        return { data: result, error: null };
      },
      
      update: async (data: any) => {
        console.log(`[Mock Supabase] update ${table}:`, data);
        if (!storage[table]) return { data: [], error: null };
        
        const updated = storage[table].map(item => 
          item.id === currentQuery.where.id ? { ...item, ...data, updated_at: new Date().toISOString() } : item
        );
        
        storage[table] = updated;
        const result = currentQuery.isSingle ? updated.find(item => item.id === currentQuery.where.id) : updated;
        return { data: result, error: null };
      },
      
      delete: async () => {
        console.log(`[Mock Supabase] delete from ${table}`);
        if (!storage[table]) return { data: [], error: null };
        
        storage[table] = storage[table].filter(item => item.id !== currentQuery.where.id);
        return { data: [], error: null };
      },
      
      eq: (column: string, value: any) => {
        currentQuery.where[column] = value;
        return createQueryBuilder(table);
      },
      
      order: (column: string, options: any = {}) => {
        currentQuery.orderBy = column;
        return createQueryBuilder(table);
      },
      
      single: () => {
        currentQuery.isSingle = true;
        return createQueryBuilder(table);
      }
    };
  };
  
  return {
    from: (table: string) => createQueryBuilder(table),
    auth: {
      signIn: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null })
    }
  };
};

// Supabase connection configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

// Create Supabase client (mock for now)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export const supabaseClient = supabase;

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