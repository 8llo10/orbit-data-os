# ORBIT — Personal Data Operating System

ORBIT is an open-source, full-stack personal data platform that turns spreadsheets and JSON files into structured, searchable and programmable data workspaces.

Instead of treating a CSV or Excel workbook as a dead file, ORBIT ingests it into PostgreSQL, infers a typed schema, normalizes records, profiles data quality, exposes the result through a visual data explorer and REST API, links collections into a data graph, and can trigger automations and webhooks.

## What is implemented

- Real email/password authentication with hashed passwords and HTTP-only session cookies
- Multi-workspace-ready membership and role data model
- CSV, TSV, JSON, XLSX and XLS ingestion
- Automatic schema inference and normalized dynamic records
- PostgreSQL/Prisma persistence with JSONB record storage
- Collection explorer with global field search, sorting and pagination
- Automatic data profiling: missing values, uniqueness, numeric min/avg/max and value distributions
- Saved views with Table, Kanban and Calendar rendering
- Computed/formula fields over existing records
- Workspace-wide universal record search
- Collection relationship graph
- Export to CSV or JSON
- Automation rules with import/record event triggers
- Outbound webhooks
- API-key management with hashed keys and one-time reveal
- REST API for collections and records
- Audit/activity trail
- Workspace/profile settings
- Responsive mauve/plum UI with manual Light/Dark mode
- Command palette (`Ctrl/Cmd + K`)
- Zero paid AI dependency for the core system

## Stack

- Next.js 15 + React 19 + TypeScript
- PostgreSQL
- Prisma ORM
- Papa Parse
- SheetJS (`xlsx`)
- bcryptjs
- jose
- Lucide React
- CSS design system (no paid UI kit)

## Monorepo

```text
apps/
  web/              Next.js product + API routes
packages/
  core/             schema inference and normalization primitives
  db/               Prisma client and PostgreSQL schema
  ui/               shared UI package
```

## Local run

Requirements: Node.js 20+ and a PostgreSQL connection string.

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run dev
```

Open `http://localhost:3000`, create a workspace and import `sample-data.csv`.

## Environment

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
NEXT_PUBLIC_APP_NAME="ORBIT"
```

## Vercel deployment

The app is configured as a monorepo and the Vercel build command runs Prisma Client generation plus `prisma db push` before the Next.js production build. Add `DATABASE_URL` to the Vercel project environment before the first deploy.

For a no-cost portfolio deployment, use a free PostgreSQL provider and a free non-commercial web hosting tier that supports Next.js. Always verify current provider limits before relying on them.

## REST API

Generate a key from **Developer → API Keys** and send it as:

```http
x-api-key: orb_...
```

Endpoints:

```http
GET /api/v1/collections
GET /api/v1/collections/:slug/records?limit=50&offset=0
POST /api/v1/collections/:slug/records
```

## Formula fields

Computed fields use existing field keys in braces.

```text
{revenue}-{cost}
{quantity}*{unit_price}
```

Text concatenation is also supported:

```text
CONCAT({first_name}, {last_name})
```

## Privacy and cost philosophy

ORBIT's core analysis is deterministic and runs in the application over data stored in the configured PostgreSQL database. No OpenAI, Anthropic, Gemini or other paid model API is required for ingestion, search, profiling, views, formulas, graph relationships, automations, API access or exports.

## License

MIT
