# Needa Beauty Lab

Client website + custom content management system (CMS) for Needa Beauty Lab,
a Toronto-based nail technician, built with Next.js 16 (App Router, React 19,
Server Actions) and MySQL via Drizzle ORM.

## Features

**Public website** — home, about, services, gallery, contact and booking
pages, driven by the database (settings, artist, gallery, testimonials, FAQs):
- **Service enquiry cart with WhatsApp** — visitors can add services to an
  in-browser cart, pick an event date, add notes, and generate a pre-formatted
  WhatsApp message with categorized line items.
- **Premium Nail Services & Price List** — the one published catalogue: 42
  services in 7 sections (Natural Nail Services, Nail Extensions, Nail Art,
  Premium Finishes, Charms • Bling • 3D, Removal, Signature Sets), maintained
  in `src/lib/nail-services.ts`. Each section has its own anchor
  (`/services#nail-…`), and a search panel filters the whole list.
- **Homepage slideshow** — six looping slides, one per price-list section,
  each linking to that section of the services page.
- **Media gallery** — photo portfolio and video playback (YouTube, Vimeo,
  and uploaded MP4/WebM/MOV) with responsive video lightbox.
- **Enquiry form & WhatsApp button** — self-service enquiry form with
  ENQ-#### reference numbers and floating WhatsApp messaging button.

**Admin CMS** (`/admin`) — password-protected dashboard for the site owner:

- **Dashboard** — enquiry, service, gallery and testimonial counters with
  quick links to the latest enquiries.
- **Website Settings** — business name, logo, homepage hero image, phone,
  email, address, hours, WhatsApp number and prefilled message,
  Instagram/Facebook links, homepage copy and footer text.
- **Artist / Bio** — bio shown on the About page (name, short bio, full bio,
  experience, specialties, qualifications, location, Instagram).
- **Services** — internal service records (CRUD, categories, pricing, search).
  These rows are **not** published: the public site shows only the nail price
  list from `src/lib/nail-services.ts`.
- **Gallery** — image and video management (supports photo uploads, YouTube/Vimeo
  links, and video uploads up to 40 MB) with captions, alt text, poster images
  and category filters.
- **Testimonials** — client quotes with a 1–5 star rating, shown on the home
  page.
- **FAQs** — questions & answers shown on the booking page.
- **Enquiries** — list, filter by status, view details and update status
  (NEW / CONTACTED / CONFIRMED / COMPLETED / CANCELLED).

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- [Drizzle ORM](https://orm.drizzle.team) + MySQL
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) password hashing
- Session-cookie auth (7-day sliding expiry, stored server-side)
- [Zod](https://zod.dev) validation on every server action
- In-memory rate limiting on the public enquiry API
- Zero UI framework — the existing handcrafted CSS was kept

## Getting started

**One-command local bootstrap** — creates `.env`, starts the bundled
MySQL 5.7 dev instance (no root/apt needed), applies migrations and seeds
the content:

```bash
npm install
npm run setup:dev       # keep this terminal open — the dev DB stays up
```

Then start the app in a second terminal:

```bash
npm run dev
```

**Already have a database?** Point `DATABASE_URL` in `.env` at it
(created from `.env.example` if missing) and run:

```bash
npm run setup           # = .env check + db:migrate + db:seed
```

Step by step (manual control):

```bash
# 1. Install dependencies
npm install

# 2. Start a private MySQL dev instance (no root/apt needed)
npm run dev-db

# 3. Create the schema and seed the content
npm run db:setup        # = db:migrate + db:seed

# 4. Run the app
npm run dev
```

Open http://localhost:3000, then visit `/admin` and complete the first-run
setup form to create your administrator account.

### Resetting the admin password

If the admin password is lost, run (server-side):

```bash
npm run admin:reset-password -- --email admin@example.com --password 'new-password'
```

It also works without arguments and prompts interactively. Resetting a
password signs out all existing admin sessions.

## Project structure

```
src/
  app/
    (public)/        # public pages (home, about, services, gallery, contact, book)
    admin/           # login, first-run setup and the CMS dashboard
    api/enquiries/   # public enquiry submission endpoint (rate limited)
    api/images/:id/  # serves gallery images from the database
  components/        # public site components + admin form components
  lib/
    actions/         # server actions (auth, settings, services, gallery, …)
    auth/            # session management, password hashing, guards, rate limit
    db/              # Drizzle schema, migrations live in /drizzle
    schemas.ts       # Zod validation schemas for all forms
    cms.ts           # cached read helpers with static fallbacks if the DB is down
    whatsapp.ts      # single WhatsApp deep-link builder used everywhere
scripts/
  setup.sh           # one-command setup against an existing database
  setup-dev.sh       # one-command local bootstrap (.env + dev DB + setup)
  dev-db.sh          # private MySQL 5.7 dev instance (user-space)
  seed.mjs           # idempotent content seed
  reset-admin-password.mjs
  e2e-cms.mjs        # admin CMS end-to-end suite (54 tests)
  e2e-public.mjs     # public website integration suite (42 tests)
```

## Testing

Two Puppeteer end-to-end suites run against a started server
(`npm run build && npm start`):

```bash
npm run test:e2e          # 54 admin CMS tests (setup, auth, every manager,
                          # enquiry workflow, logout protection)
npm run test:e2e:public   # 42 public-integration tests (logo/hero/artist
                          # photo uploads, settings propagating to every
                          # public page, visibility toggles, content audit)
```

The CMS suite expects a **fresh database** (no admin yet): it creates
`admin@e2e.test` / `e2e-password-123` through the first-run setup page. On
machines without a bundled Chrome, point the suite at one with
`CHROME_PATH=… ` (and `CHROME_LD_LIBRARY_PATH=…` if needed).

## Notes

- The public website is database-driven: settings, artist profile, gallery,
  testimonials and FAQs come from the CMS, rendered server-side, and admin
  edits appear immediately. The one exception is the nail price list, which
  lives in `src/lib/nail-services.ts` and changes with a code deployment.
- All public pages fall back to the built-in static content if the database
  is unavailable, so the site never goes down with the DB. The enquiry API
  degrades to a WhatsApp hand-off in that case, so no enquiry is lost.
- Empty CMS collections are handled gracefully: sections with no content
  (testimonials, FAQs, gallery) are hidden or replaced by a short
  note instead of rendering empty grids or placeholder text.
- Uploaded images are stored as BLOBs in `site_images` and streamed through a
  route handler, so no writable disk is required in production.
- Admin forms keep their field values after a failed submit (no accidental
  data loss) and show inline, per-field validation messages.
