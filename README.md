# Makeup by Needa

Client website + custom content management system (CMS) for a Toronto-based
makeup, hair and nail art artist, built with Next.js 16 (App Router, React 19,
Server Actions) and MySQL via Drizzle ORM.

## Features

**Public website** — home, about, services, gallery, contact and booking
pages, all driven by the database. Includes a WhatsApp deep-link button and a
self-service appointment enquiry form that stores enquiries in the database
and generates an ENQ-#### reference.

**Admin CMS** (`/admin`) — password-protected dashboard for the site owner:

- **Dashboard** — enquiry, service, gallery and testimonial counters with
  quick links to the latest enquiries.
- **Website Settings** — business name & contact details, WhatsApp number and
  prefilled message, Instagram/Facebook links, homepage copy and footer text.
- **Artist / Bio** — bio shown on the About page (name, short bio, full bio,
  experience, specialties, qualifications, location, Instagram).
- **Services** — full CRUD with categories (Makeup / Hair / Nails), pricing
  (numeric price, custom price text, or *Enquire for pricing*), duration,
  featured & active flags, and reordering.
- **Gallery** — image upload (stored in the database, served through
  `/api/images/:id`) with categories, captions, alt text and active flag.
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
    cms.ts           # read helpers with static fallbacks if the DB is down
scripts/
  dev-db.sh          # private MySQL 5.7 dev instance (user-space)
  seed.mjs           # idempotent content seed
  reset-admin-password.mjs
```

## Notes

- All public pages fall back to the built-in static content if the database
  is unavailable, so the site never goes down with the DB.
- Uploaded images are stored as BLOBs in `site_images` and streamed through a
  route handler, so no writable disk is required in production.
- Admin forms keep their field values after a failed submit (no accidental
  data loss) and show inline, per-field validation messages.
