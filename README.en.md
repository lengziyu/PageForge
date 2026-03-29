# PageForge

[中文](./README.md) | [English](./README.en.md)

`PageForge` is an open-source MVP for business website building, including:

- A business website template library
- A modular drag-and-drop editor
- Multi-page site generation
- Draft / publish workflow
- A newsroom with rich-text editing

The current goal is not a freeform canvas. The goal is to build a clean and maintainable “business website templates + modular editor” foundation first.

## Features

- Built with `Next.js App Router + TypeScript`
- UI built using `Tailwind CSS`
- Page and news data stored with `PostgreSQL + Prisma`
- `Zod` powered page JSON schema validation
- `dnd-kit` for drag-and-drop block sorting
- Every block includes `component + defaultProps + zod schema`
- Page content is stored as structured JSON

## Use Cases

Good for quickly bootstrapping:

- Business websites
- SaaS landing sites
- Corporate service websites
- Manufacturing company sites
- Research / technical platform sites

Default template pages include:

- Home
- Services & Products
- Technology / R&D
- News
- About Us
- Contact

Notes:
- `Technology / R&D` is optional
- Each page is a standalone page, not a single-page anchor section

## Current MVP Scope

Implemented so far:

- Industry template selection and site initialization
- Page list, create page, delete page
- Add / remove / sort / collapse blocks
- Right-side inspector for block editing
- Right-side public settings for site-wide data
- Site-wide publishing
- Header and footer preview inside the editor
- Newsroom
- News category CRUD
- Rich-text editor
- Image / video upload insertion
- Paste image / video rich content

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- PostgreSQL
- Prisma
- Zod
- dnd-kit
- wangEditor
- Radix UI

## Local Requirements

Install these first:

- Node.js 22 LTS
- npm 10+
- PostgreSQL 16+
- Git

Recommended local database setup:

1. Create a database named `pageforge`
2. Make sure PostgreSQL listens on `localhost:5432`
3. Prepare a usable database user such as `postgres`

## Environment Variables

Copy the env file first:

```bash
copy .env.example .env
```

Default value:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pageforge?schema=public"
```

Replace it with your actual database credentials if needed.

## Run Locally

From the project root:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

Open:

- Editor entry: `http://localhost:3000/editor`
- Page editor: `http://localhost:3000/editor/pages/homepage`
- Newsroom: `http://localhost:3000/editor/newsroom`
- Site preview: `http://localhost:3000/sites/homepage`

## How To Use

Recommended flow:

1. Open `/editor`
2. Choose an industry template
3. Select pages to generate
4. Enter the page editor
5. Add blocks from the left panel and reorder them in the canvas
6. Edit block settings or public settings on the right
7. Click “Publish site”

### Block Settings

In the `Block Settings` tab you can edit:

- Hero copy and background
- Service sections
- Technology sections
- News sections
- Contact sections
- CTA sections

### Public Settings

In the `Public Settings` tab you can edit:

- Site name
- Tagline
- Logo
- Favicon
- Navigation visibility and order
- Footer layout
- Address, phone, email, registration number, copyright

## Newsroom

Newsroom URL:

- `http://localhost:3000/editor/newsroom`

Supported now:

- Create draft news
- Publish news
- Delete news
- Pagination
- Draft / published filter
- News category management
- Rich-text body editing
- Upload images / videos
- Paste images / videos

Notes:
- News list pages and news detail pages share the same cover image source
- A category cannot be deleted while articles still use it

## Project Structure

Main directories:

```text
app/
  api/                    API routes
  editor/                 Editor and newsroom backend
  news/                   Public news detail pages
  sites/                  Public website pages

components/
  blocks/                 Reusable block components
  builder/                Editor components
  news/                   News backend components
  site/                   Site shell (Header / Footer)

lib/
  builder/                Page schema, block registry, template library
  news/                   News domain logic
  prisma.ts               Prisma client

prisma/
  schema.prisma           Data model
  seed.ts                 Seed data

public/
  hero/                   Hero background assets
  brand/                  Default brand assets
```

## Share With Others

If you want someone else to run the project locally:

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

They need:

- Node.js 22
- PostgreSQL
- A working `DATABASE_URL`

## Production Deployment

Recommended deployment flow:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run build
npm run start
```

Production env example:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/pageforge?schema=public"
```

Recommended hosting options:

- Vercel + Neon / Supabase / PostgreSQL
- Self-hosted Node.js server + PostgreSQL
- Docker + PostgreSQL

## Open Source Checklist

If you want to publish this as an open-source project, you should also add:

- A license such as `MIT`
- `CONTRIBUTING.md`
- `LICENSE`
- Issue / PR templates
- A project roadmap

## Development Principles

Current project principles:

- MVP first, no freeform canvas
- Block / section architecture
- JSON schema based page storage
- Structure first, UI polish later
- Avoid huge monolithic files
- Ship one clear submodule at a time

## License

The repository does not yet include a standalone license file. If you plan to open-source it publicly, adding `MIT` or `Apache-2.0` is recommended.
