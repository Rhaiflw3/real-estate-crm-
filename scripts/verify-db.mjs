import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
console.log('Tables:', tables.rows.map(r => r.table_name));

const pool2 = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool2);
const prisma = new PrismaClient({ adapter });

// Test creating a lead
const lead = await prisma.lead.create({
  data: { name: 'Test DB Lead', email: 'testdb@example.com', status: 'New', source: 'Test' },
});
console.log('Created lead:', lead.id, lead.name);

const leads = await prisma.lead.findMany();
console.log('Total leads:', leads.length);

await prisma.lead.delete({ where: { id: lead.id } });
console.log('Deleted test lead');

await prisma.$disconnect();
