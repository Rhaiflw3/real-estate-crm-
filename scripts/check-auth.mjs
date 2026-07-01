import { Client } from 'pg';

const client = new Client('postgresql://postgres.wquuoiiumavykxsttbec:tnftmqNFBmpE7ccs@aws-1-us-east-2.pooler.supabase.com:5432/postgres');
await client.connect();

const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth' ORDER BY table_name");
console.log('Auth tables:\n' + tables.rows.map(t => t.table_name).join('\n'));

const users = await client.query("SELECT id, email, raw_user_meta_data, confirmed_at, email_confirmed_at, last_sign_in_at FROM auth.users LIMIT 5");
console.log('\nUsers:\n' + JSON.stringify(users.rows, null, 2));

const identities = await client.query("SELECT id, user_id, provider, identity_data FROM auth.identities LIMIT 5");
console.log('\nIdentities:\n' + JSON.stringify(identities.rows, null, 2));

await client.end();
