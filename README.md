This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Real Estate CRM Features

This real estate CRM application includes:

### Dashboard
- Overview statistics (leads, active listings, meetings, conversion rate)
- Real-time metrics with trend indicators

### Leads Management
- Lead listing with table view
- Lead status tracking (New, Contacted, Qualified)
- Source tracking (Website, Referral, Social Media, Event)
- Add new leads with dialog form
- Lead detail drawer with full information

### UI Components
- Responsive layout with sidebar navigation
- Mobile-friendly navigation
- Shadcn/ui component library
- Tailwind CSS styling

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── dashboard/      # Dashboard pages
│   │   ├── leads/      # Leads management
│   │   └── page.tsx    # Main dashboard
│   └── layout.tsx      # Root layout
├── components/         # React components
│   ├── layout/         # Layout components
│   ├── leads/          # Lead-specific components
│   └── ui/             # Reusable UI components
└── lib/                # Utilities and types
    ├── types/          # TypeScript types
    └── constants/      # Application constants
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technology Stack

- **Framework**: Next.js 16.2.6 with App Router
- **UI Library**: React 19 with React Compiler
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Type Safety**: TypeScript 5
- **Icons**: Lucide React
- **Charts**: Recharts (installed but not yet implemented)
- **Database**: Supabase (PostgreSQL) with fallback to Prisma/in-memory
- **Build Tool**: Next.js build system with PostCSS

## Database Setup

This project supports multiple database backends:

### Option 1: Supabase (Recommended)
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env` and add your credentials
3. Run the SQL script from `db/create_leads_table.sql` in Supabase SQL Editor

### Option 2: Prisma with PostgreSQL
1. Install Prisma: `npm install prisma @prisma/client`
2. Configure `DATABASE_URL` in `.env`
3. Run: `npx prisma generate` and `npx prisma db push`

### Option 3: In-memory (Development)
- No setup needed - works out of the box
- Data is lost on server restart

See `SUPABASE_SETUP.md` for detailed instructions.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Next Steps

The application currently uses mock data. Next development priorities:

1. **Backend Integration**: Connect to database (PostgreSQL with Prisma)
2. **Authentication**: Add user authentication
3. **API Routes**: Implement CRUD operations for leads
4. **Real Estate Features**: Add properties, transactions, commissions
5. **Testing**: Add unit and integration tests
