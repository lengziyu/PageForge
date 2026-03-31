# PageForge

[中文](./README.md) | [English](./README.en.md)

`PageForge` is an open-source MVP for modular business website building with:

- industry-based site templates
- multi-page corporate site generation
- drag-and-drop block editing
- site-wide public settings
- a newsroom with rich-text content management

The project now uses `SQLite + Prisma` by default, so deployment is much simpler and does not require a separate PostgreSQL service.

## Features

- Built with `Next.js App Router + TypeScript`
- UI powered by `Tailwind CSS`
- Data stored with `SQLite + Prisma`
- Page JSON validated with `Zod`
- Block sorting powered by `dnd-kit`
- Every block includes `component + defaultProps + zod schema`
- Site-wide publishing
- News categories, article pages, rich media content

## Default Pages

Templates generate these standalone pages:

- Home
- Services & Products
- Technology / R&D
- News
- About Us
- Contact

Notes:

- `Technology / R&D` is optional
- Each page is standalone, not a single-page anchor section

## Local Requirements

- Node.js 20+ or 22 LTS
- npm 10+
- Git

## Environment Variables

Copy the env file first:

```bash
copy .env.example .env
```

Example:

```env
DATABASE_URL="file:./prisma/dev.db"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="change-this-password"
```

Notes:

- `DATABASE_URL` points to `prisma/dev.db`
- `ADMIN_USERNAME` and `ADMIN_PASSWORD` power the admin login page
- If admin credentials are not set, login protection is disabled
- Stop any running dev server before `prisma db push` or `npm run db:seed` so SQLite is not held open by another process

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
- Admin entry: `http://localhost:3000/editor`
- Page editor: `http://localhost:3000/editor/pages/homepage`
- Newsroom: `http://localhost:3000/editor/newsroom`

## Public Site vs Admin

- `/` opens the published public homepage
- `/editor` is the admin area
- `/admin/login` is the admin login page
- `/editor/newsroom` is the newsroom backend

Once `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set, `/editor` redirects to the login page first.

## Production Deployment

The default SQLite setup keeps deployment lightweight.

Minimal production flow:

```bash
git clone https://github.com/lengziyu/PageForge.git /opt/apps/PageForge
cd /opt/apps/PageForge
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:push
npm run build
npm run start
```

You can place Nginx in front of the app and proxy traffic to port `3000`. No separate PostgreSQL service is required.

## Recommended Runtime Layout

- `Nginx` handles `80 / 443`
- `Next.js` runs on `3000`
- `SQLite` data lives in `prisma/dev.db`

This works well for single-server deployment, demos, and lightweight business website management.

## Editing Flow

1. Open `/editor`
2. Choose an industry template
3. Select which standalone pages to generate
4. Edit blocks with drag-and-drop
5. Adjust block settings and public settings
6. Click “publish site”

## Newsroom

The newsroom currently supports:

- category CRUD
- pagination
- draft / published filtering
- deleting articles
- rich-text editing
- image and video insertion
- pasting rich content with media

## Project Structure

```text
app/                     Next.js routes
components/              UI and editor components
lib/builder/             builder schema, registry, template library
lib/news/                newsroom services
prisma/                  Prisma schema, seed, SQLite db
public/                  static assets
```
