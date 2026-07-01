import { Client } from 'pg';
const client = new Client('postgresql://postgres.wquuoiiumavykxsttbec:tnftmqNFBmpE7ccs@aws-1-us-east-2.pooler.supabase.com:5432/postgres');
await client.connect();

await client.query('ALTER TABLE public.portfolios DISABLE ROW LEVEL SECURITY');
console.log('RLS disabled on portfolios');

await client.query('ALTER TABLE public.portfolio_properties DISABLE ROW LEVEL SECURITY');
console.log('RLS disabled on portfolio_properties');

const r = await client.query(`
  SELECT relname, relrowsecurity 
  FROM pg_class 
  WHERE relnamespace = 'public'::regnamespace 
  AND relkind = 'r' 
  AND relname IN ('properties', 'portfolios', 'leads', 'portfolio_properties', 'lead_properties')
  ORDER BY relname
`);
console.log('\nUpdated RLS status:');
r.rows.forEach(t => console.log('  ' + t.relname + ' -> RLS: ' + (t.relrowsecurity ? 'ON' : 'OFF')));

await client.end();
