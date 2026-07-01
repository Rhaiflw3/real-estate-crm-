import { readFileSync } from 'fs';
import { Client } from 'pg';

const client = new Client('postgresql://postgres.wquuoiiumavykxsttbec:tnftmqNFBmpE7ccs@aws-1-us-east-2.pooler.supabase.com:5432/postgres');
await client.connect();

const raw = readFileSync(new URL('../data/mock-storage.json', import.meta.url), 'utf8');
const data = JSON.parse(raw);

console.log('Data loaded:');
console.log(`  leads: ${data.leads.length}`);
console.log(`  properties: ${data.properties.length}`);
console.log(`  portfolios: ${data.portfolios.length}`);
console.log(`  portfolio_properties: ${data.portfolio_properties.length}`);
console.log(`  lead_properties: ${data.lead_properties.length}`);

const userId = '8532c1eb-346c-4b69-9986-c79523913ac9';

// 1. Ensure user exists in public.users
const userRes = await client.query('SELECT id FROM public.users WHERE id = $1', [userId]);
if (userRes.rows.length === 0) {
  await client.query('INSERT INTO public.users (id, email, name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())', [userId, '022101005c@uandina.edu.pe', 'RHAI FRANCISCO FLORES BOCANGEL']);
  console.log('User created');
} else {
  console.log('User exists');
}

// 2. Migrate properties
const existingProps = await client.query('SELECT COUNT(*) as cnt FROM public.properties');
console.log(`\nExisting properties: ${existingProps.rows[0].cnt}`);

if (data.properties.length > 0) {
  let count = 0;
  for (const p of data.properties) {
    try {
      await client.query(`
        INSERT INTO public.properties (id, title, description, price, status, type, area_sq_ft, notes, user_id, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (id) DO NOTHING
      `, [
        p.id, p.title, p.description || null, p.price, p.status || 'Available',
        p.type || 'House', p.area_sq_ft || null, p.notes || null,
        p.user_id || userId, new Date(p.created_at), new Date(p.updated_at)
      ]);
      count++;
      if (count % 20 === 0) process.stdout.write(`  ${count}/${data.properties.length}\n`);
    } catch (err) {
      console.error(`  Error on ${p.id}: ${err.message}`);
    }
  }
  console.log(`  ${count} properties inserted`);
}

// 3. Migrate portfolios
if (data.portfolios.length > 0) {
  for (const po of data.portfolios) {
    try {
      await client.query(`
        INSERT INTO public.portfolios (id, name, description, year, type, status, user_id, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO NOTHING
      `, [
        po.id, po.name, po.description || null, po.year || null,
        po.type || 'Standard', po.status || 'Active',
        po.user_id || userId, new Date(po.created_at), new Date(po.updated_at)
      ]);
    } catch (err) {
      console.error(`  Error on portfolio ${po.id}: ${err.message}`);
    }
  }
  console.log(`  ${data.portfolios.length} portfolios inserted`);
}

// 4. Migrate portfolio_properties
if (data.portfolio_properties.length > 0) {
  for (const pp of data.portfolio_properties) {
    try {
      await client.query(`
        INSERT INTO public.portfolio_properties (id, portfolio_id, property_id, notes, created_at)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (id) DO NOTHING
      `, [
        pp.id, pp.portfolio_id, pp.property_id, pp.notes || null, new Date(pp.created_at)
      ]);
    } catch (err) {
      console.error(`  Error on pp ${pp.id}: ${err.message}`);
    }
  }
  console.log(`  ${data.portfolio_properties.length} portfolio_properties inserted`);
}

// 5. Migrate lead_properties
if (data.lead_properties.length > 0) {
  for (const lp of data.lead_properties) {
    try {
      await client.query(`
        INSERT INTO public.lead_properties (id, lead_id, property_id, interest_level, notes, created_at)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (id) DO NOTHING
      `, [
        lp.id, lp.lead_id, lp.property_id, lp.interest_level || 'Medium', lp.notes || null, new Date(lp.created_at)
      ]);
    } catch (err) {
      console.error(`  Error on lp ${lp.id}: ${err.message}`);
    }
  }
  console.log(`  ${data.lead_properties.length} lead_properties inserted`);
}

// 6. Migrate lead
if (data.leads.length > 0) {
  const lead = data.leads[0];
  const existing = await client.query('SELECT id FROM public.leads WHERE id = $1', [lead.id]);
  if (existing.rows.length === 0) {
    await client.query(`
      INSERT INTO public.leads (id, name, email, phone, status, source, ai_summary, notes, user_id, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `, [
      lead.id, lead.name, lead.email, lead.phone || null,
      lead.status || 'New', lead.source || 'Website', lead.ai_summary || null,
      lead.notes || null, lead.user_id || userId, new Date(lead.created_at), new Date(lead.updated_at)
    ]);
    console.log(`  Lead "${lead.name}" inserted`);
  } else {
    console.log(`  Lead "${lead.name}" already exists, skipped`);
  }
}

// Final counts
const counts = await client.query(`
  SELECT 'leads' as tbl, COUNT(*) as cnt FROM public.leads
  UNION ALL SELECT 'properties', COUNT(*) FROM public.properties
  UNION ALL SELECT 'portfolios', COUNT(*) FROM public.portfolios
  UNION ALL SELECT 'portfolio_properties', COUNT(*) FROM public.portfolio_properties
  UNION ALL SELECT 'lead_properties', COUNT(*) FROM public.lead_properties
`);
console.log('\n=== Final DB Counts ===');
counts.rows.forEach(r => console.log(`  ${r.tbl}: ${r.cnt}`));

await client.end();
console.log('\nMigration complete!');
