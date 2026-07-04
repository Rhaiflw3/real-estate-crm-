import pg from 'pg';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DIRECT_URL });

const tables = ['properties', 'leads', 'portfolios', 'portfolio_properties', 'lead_properties', 'calendar_events', 'documents'];

async function main() {
  for (const table of tables) {
    // Fix id default
    const { rows } = await pool.query(
      `SELECT column_default FROM information_schema.columns WHERE table_name = $1 AND column_name = 'id'`,
      [table]
    );
    if (rows.length > 0 && !rows[0].column_default) {
      await pool.query(`ALTER TABLE "${table}" ALTER COLUMN id SET DEFAULT gen_random_uuid()`);
      console.log(`✅ ${table}.id ← DEFAULT gen_random_uuid()`);
    }

    // Fix created_at default
    const { rows: ca } = await pool.query(
      `SELECT column_default FROM information_schema.columns WHERE table_name = $1 AND column_name = 'created_at'`,
      [table]
    );
    if (ca.length > 0 && !ca[0].column_default) {
      await pool.query(`ALTER TABLE "${table}" ALTER COLUMN created_at SET DEFAULT now()`);
      console.log(`✅ ${table}.created_at ← DEFAULT now()`);
    }

    // Fix updated_at default
    const { rows: ua } = await pool.query(
      `SELECT column_default FROM information_schema.columns WHERE table_name = $1 AND column_name = 'updated_at'`,
      [table]
    );
    if (ua.length > 0 && !ua[0].column_default) {
      await pool.query(`ALTER TABLE "${table}" ALTER COLUMN updated_at SET DEFAULT now()`);
      console.log(`✅ ${table}.updated_at ← DEFAULT now()`);
    }
  }
  await pool.end();
}

main().catch(e => { console.error('Error:', e); process.exit(1); });
