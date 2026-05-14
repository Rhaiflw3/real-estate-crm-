# Supabase Setup for Real Estate CRM

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key from Project Settings > API

## Setup Instructions

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and update with your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key  
- `DATABASE_URL`: PostgreSQL connection string from Supabase

### 2. Create Database Table

You can create the `leads` table in two ways:

#### Option A: Using Supabase SQL Editor
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the SQL from `db/create_leads_table.sql`

#### Option B: Using Supabase Dashboard
1. Go to your Supabase project
2. Navigate to Table Editor
3. Create a new table with these columns:

| Column | Type | Default | Nullable |
|--------|------|---------|----------|
| id | UUID | gen_random_uuid() | ❌ |
| name | VARCHAR(255) | - | ❌ |
| email | VARCHAR(255) | - | ❌ |
| phone | VARCHAR(50) | - | ✅ |
| status | VARCHAR(50) | 'New' | ✅ |
| source | VARCHAR(100) | 'Website' | ✅ |
| ai_summary | TEXT | - | ✅ |
| notes | TEXT | - | ✅ |
| created_at | TIMESTAMPTZ | NOW() | ✅ |
| updated_at | TIMESTAMPTZ | NOW() | ✅ |

### 3. Configure Row Level Security (RLS)

The SQL script automatically enables RLS and creates policies. If you need to adjust:
- Allow anonymous reads for public access
- Restrict writes to authenticated users if needed

### 4. Test the Connection

Run the development server and test the API:

```bash
npm run dev
```

Test the endpoints:
- `GET /api/leads` - Should return leads from Supabase
- `POST /api/leads` - Should create new leads in Supabase

## Troubleshooting

### Common Issues

1. **"Invalid API key"** - Check your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **"Database connection failed"** - Verify `DATABASE_URL` format
3. **"Table not found"** - Run the SQL script to create the table
4. **"Permission denied"** - Check RLS policies in Supabase

### Connection String Format

The Supabase PostgreSQL connection string should look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres
```

### Getting Credentials

1. **Project URL**: Dashboard > Settings > API > Project URL
2. **Anon Key**: Dashboard > Settings > API > Project API keys > `anon` `public`
3. **Database Password**: Dashboard > Settings > Database > Database password
4. **Connection String**: Dashboard > Settings > Database > Connection string > URI

## Development Notes

- The app uses a fallback system: Supabase → Prisma → In-memory
- All database operations are handled through the API at `/api/leads`
- The UI automatically updates when leads are added via Supabase
- AI summary generation works with any backend