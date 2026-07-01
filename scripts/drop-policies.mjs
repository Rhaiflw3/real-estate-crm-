import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres.wquuoiiumavykxsttbec:tnftmqNFBmpE7ccs@aws-1-us-east-2.pooler.supabase.com:5432/postgres' });

const queries = [
  `DROP POLICY IF EXISTS "Users can view own portfolio properties" ON portfolio_properties`,
  `DROP POLICY IF EXISTS "Users can view own lead properties" ON lead_properties`,
  `DROP POLICY IF EXISTS "Users can view own properties" ON properties`,
  `DROP POLICY IF EXISTS "Users can view own portfolios" ON portfolios`,
  `DROP POLICY IF EXISTS "Users can view own leads" ON leads`,
  `DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON leads`,
  `DROP POLICY IF EXISTS "Allow read for anon users" ON leads`,
  `DROP POLICY IF EXISTS "Enable read access for all users" ON leads`,
  `DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leads`,
];

for (const q of queries) {
  try {
    const r = await pool.query(q);
    console.log('OK:', r.command);
  } catch (e) {
    console.log('Skip:', e.message);
  }
}
console.log('Done');
await pool.end();
