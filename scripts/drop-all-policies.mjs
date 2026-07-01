import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres.wquuoiiumavykxsttbec:tnftmqNFBmpE7ccs@aws-1-us-east-2.pooler.supabase.com:5432/postgres' });

// Find all policies
const result = await pool.query(`
  SELECT schemaname, tablename, policyname 
  FROM pg_policies 
  WHERE schemaname = 'public'
`);

console.log('Found policies:', JSON.stringify(result.rows));

// Drop every policy
for (const row of result.rows) {
  const q = `DROP POLICY IF EXISTS "${row.policyname}" ON ${row.tablename}`;
  try {
    await pool.query(q);
    console.log('Dropped:', row.policyname, 'on', row.tablename);
  } catch (e) {
    console.log('Failed:', e.message);
  }
}

// Also drop triggers that might block
const triggers = await pool.query(`
  SELECT trigger_name, event_object_table 
  FROM information_schema.triggers 
  WHERE trigger_schema = 'public'
`);
console.log('Triggers:', JSON.stringify(triggers.rows));

await pool.end();
