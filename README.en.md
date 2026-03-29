# PageForge

[中文](./README.md) | [English](./README.en.md)

`PageForge` is an open-source MVP for building modular business websites with:

- industry-based site templates
- multi-page corporate site generation
- drag-and-drop block editing
- site-wide public settings
- a newsroom with rich-text editing

The goal is not a freeform canvas yet. The current focus is a maintainable “business website templates + modular editor” workflow.

## Features

- Built with `Next.js App Router + TypeScript`
- UI powered by `Tailwind CSS`
- Data stored with `PostgreSQL + Prisma`
- Page JSON validated with `Zod`
- Drag-and-drop sorting powered by `dnd-kit`
- Every block includes `component + defaultProps + zod schema`
- Site-wide publishing flow
- Newsroom, categories, rich-text editing, image/video insertion

## Default Site Pages

Templates can generate these standalone pages:

- Home
- Services & Products
- Technology / R&D
- News
- About Us
- Contact

Notes:

- `Technology / R&D` is optional
- Each page is a standalone page, not a single-page anchor section

## Local Requirements

- Node.js 22 LTS
- npm 10+
- PostgreSQL 16+
- Git

## Environment Variables

Copy the env file first:

```bash
copy .env.example .env
```

Example:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/pageforge?schema=public"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-this-password"
```

Notes:

- `DATABASE_URL` connects the app to PostgreSQL
- `ADMIN_USERNAME` and `ADMIN_PASSWORD` protect the admin area
- If admin credentials are not set, admin basic auth is disabled

## Run Locally

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

Then open:

- Public homepage: `http://localhost:3000/`
- Admin dashboard: `http://localhost:3000/editor`
- Page editor: `http://localhost:3000/editor/pages/homepage`
- Newsroom: `http://localhost:3000/editor/newsroom`

## Public Site vs Admin

The project is set up to behave more like a real production site:

- `/` redirects to the published homepage at `/sites/homepage`
- `/editor` is the admin area
- `/editor/newsroom` is the news management area

That means:

- visitors open `https://your-domain.com` and see the public homepage
- administrators open `https://your-domain.com/editor` to manage the site

## How Admin Protection Works

The MVP already includes a basic protection layer:

- the root domain no longer shows the editor
- once `ADMIN_USERNAME` and `ADMIN_PASSWORD` are configured, `/editor` and related admin APIs require Basic Auth

For a stronger production setup later, consider upgrading to:

- real user accounts
- session or JWT auth
- role-based permissions
- object storage for uploaded assets

## Production Deployment

Common deployment options:

- `Vercel + Neon / Supabase / PostgreSQL`
- self-hosted `Node.js + PostgreSQL`
- `Docker + PostgreSQL`

Typical production commands:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run build
npm run start
```

Make sure these env vars are set in production:

- `DATABASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Recommended Editing Flow

1. Open `/editor`
2. Choose an industry template
3. Select which standalone pages to generate
4. Start editing a page with drag-and-drop blocks
5. Adjust block settings and public settings on the right side
6. Click “publish site” when ready

## Newsroom

The newsroom currently supports:

- category CRUD
- pagination
- draft / published filtering
- deleting news posts
- rich-text editing
- image and video insertion
- pasting rich content with media

## Project Structure

```text
app/                     Next.js routes
components/              UI and editor components
lib/builder/             builder schema, registry, template library
lib/news/                newsroom services
prisma/                  Prisma schema and seed
public/                  static assets
```
