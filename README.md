# PageForge MVP

MVP focus:

- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Zod-driven page JSON schema
- dnd-kit powered block sorting

Implemented so far:

- Modular `block/section` architecture
- Every block has `component + defaultProps + zod schema`
- Page content stored in PostgreSQL `Json`
- `/editor` page manager with create-page flow
- `/editor/[slug]` block editor with add, remove, sort, inspect, and save
- Draft / publish workflow
- `/sites/[slug]` renders only published pages

## Local Environment

Install these first:

- Node.js 22 LTS
- npm 10+ or newer
- PostgreSQL 16+
- Git

Recommended local database setup:

1. Create a database named `pageforge`
2. Use a local PostgreSQL user such as `postgres`
3. Make sure PostgreSQL is listening on `localhost:5432`

Create your env file:

```bash
copy .env.example .env
```

Default `.env` value:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pageforge?schema=public"
```

## Run Locally

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

Open:

- `http://localhost:3000/editor`
- `http://localhost:3000/editor/homepage`
- `http://localhost:3000/sites/homepage`

## Give To Others

If another teammate or client wants to run the project locally:

```bash
git clone <your-repo-url>
cd PageForge
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

They also need:

- Node.js 22 LTS
- PostgreSQL 16+
- A database named `pageforge`

## Production Deploy

Recommended production flow:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run build
npm run start
```

Production environment variables:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/pageforge?schema=public"
```

Deployment options:

- Vercel + Neon/Supabase/Postgres
- Self-hosted Node.js server + PostgreSQL
- Dockerized Node.js app + managed PostgreSQL
