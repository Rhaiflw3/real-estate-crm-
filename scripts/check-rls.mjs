import { Client } from 'pg';
const client = new Client('postgresql://postgres.wquuoiiumavykxsttbec:tnftmqNFBmpE7ccs@aws-1-us-east-2.pooler.supabase.com:5432/postgres');
await client.connect();
const r = await client.query(`
  SELECT relname, relrowsecurity 
  FROM pg_class 
  WHERE relnamespace = 'public'::regnamespace 
  AND relkind = 'r' 
  AND relname IN ('properties', 'portfolios', 'leads', 'portfolio_properties', 'lead_properties')
  ORDER BY relname
`);
console.log('RLS status:');
r.rows.forEach(t => console.log('  ' + t.relname + ' -> RLS: ' + (t.relrowsecurity ? 'ON' : 'OFF')));

// Also check policies
const r2 = await client.query(`
  SELECT tablename, policyname, permissive, cmd 
  FROM pg_policies 
  WHERE schemaname = 'public'
  ORDER BY tablename
`);
console.log('\nPolicies:');
if (r2.rows.length === 0) console.log('  None');
else r2.rows.forEach(p => console.log('  ' + p.tablename + ' | ' + p.policyname + ' | ' + p.cmd));

await client.end();
