import { readFileSync } from 'fs';
import { Client } from 'pg';

const client = new Client('postgresql://postgres.wquuoiiumavykxsttbec:tnftmqNFBmpE7ccs@aws-1-us-east-2.pooler.supabase.com:5432/postgres');
await client.connect();

const raw = readFileSync(new URL('../data/mock-storage.json', import.meta.url), 'utf8');
const data = JSON.parse(raw);

for (const lp of data.lead_properties) {
  try {
    await client.query(`
      INSERT INTO public.lead_properties (id, lead_id, property_id, "interestLevel", notes, created_at)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (id) DO NOTHING
    `, [
      lp.id, lp.lead_id, lp.property_id,
      lp.interest_level || 'Medium',
      lp.notes || null, new Date(lp.created_at)
    ]);
    console.log(`Inserted ${lp.id}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

const r = await client.query('SELECT COUNT(*) as cnt FROM public.lead_properties');
console.log(`\nlead_properties count: ${r.rows[0].cnt}`);

await client.end();
