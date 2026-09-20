# Makeup by Needa - Toronto Makeup Artist

A clean, production-ready full-stack Next.js website for Makeup by Needa, a Toronto-based beauty artistry studio specializing in bridal, event, and editorial looks across makeup, hair styling, and nail art.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Custom CSS design system
- **Database:** MySQL with Drizzle ORM (Hostinger production) + Prisma schema reference
- **Auth:** bcryptjs secure hashing
- **Deployment:** Node.js application (Hostinger compatible)

## Project Structure

```
src/
├── app/
│   ├── about/, book/, contact/, gallery/, services/ (public pages)
│   ├── api/
│   │   ├── enquiries/ (POST enquiry with DB persistence + WhatsApp fallback)
│   │   ├── admin/setup/ (secure initial admin creation)
│   │   └── health/ (DB connection health check)
│   ├── globals.css (merged design system)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/ (site-header, site-footer)
│   ├── ui/ (section-heading)
│   ├── features/ (enquiry-form, gallery, whatsapp-button)
│   └── motion/ (Reveal, PageTransition)
├── config/site.ts (hardcoded fallback, source for seed)
├── lib/
│   ├── db/
│   │   ├── schema.ts (Drizzle MySQL schema - 8 tables)
│   │   ├── client.ts (MySQL2 pool singleton for Next.js)
│   │   ├── utils.ts (enquiryNumber MBN-YYYY-NNNN, slug)
│   │   ├── seed.ts (migrates hardcoded content to MySQL)
│   │   ├── migrate.ts (SQL migration runner)
│   │   └── repositories/ (site-settings, services, gallery, enquiries)
│   ├── validations/enquiry.ts
│   ├── utils/whatsapp.ts + formatters.ts
│   ├── email/client.ts
│   ├── auth/ (bcrypt auth)
│   └── cms/content.ts (DB with fallback to hardcoded)
├── types/
prisma/
└── schema.prisma (reference, 8 models)
drizzle/
└── 0000_chief_paper_doll.sql (MySQL migration - 8 tables)
public/images/ (4 real portfolio images)
```

## Database Schema

**MySQL - 8 tables, all with id, createdAt, updatedAt:**

1. **AdminUser** - id, name, email unique, passwordHash (bcrypt), createdAt, updatedAt
2. **SiteSettings** - businessName, logo, phone, email, whatsapp, location, instagram, facebook, homepageTitle, homepageDescription, footerText, etc (single record, extensible)
3. **ArtistProfile** - name, profileImage, shortBio, fullBio, experience, specialties, qualifications, location, instagram
4. **Service** - name, slug unique, shortDescription, description, price decimal(10,2), priceText, duration, image, category enum(Makeup,Hair,Nails), featured, active, displayOrder
5. **GalleryImage** - image, title, caption, altText, category enum(Makeup,Bridal,Hair,Nails), active, displayOrder
6. **Testimonial** - clientName, testimonial, rating 1-5, clientPhoto, service, active, displayOrder
7. **FAQ** - question, answer, active, displayOrder
8. **Enquiry** - enquiryNumber unique (MBN-2026-0001), name, phone, email, service, eventDate, preferredTime, location, people, message, status enum(NEW,CONTACTED,CONFIRMED,COMPLETED,CANCELLED)

## Getting Started

### Prerequisites

- Node.js >= 18.17.0
- MySQL database (local or Hostinger)
- npm

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL
```

Required for production:

```env
DATABASE_URL="mysql://user:password@localhost:3306/makeup_by_needa"
ADMIN_SETUP_SECRET=your-secure-32-char-secret
NEXTAUTH_SECRET=your-secret
```

### Database Initialization

```bash
# Generate migration from schema (if changed)
npm run db:generate

# Apply migrations
npm run db:migrate
# or for dev: npm run db:push

# Seed existing content (22 services, 4 real gallery images, etc)
npm run db:seed

# With admin creation
ADMIN_EMAIL=admin@makeupbyneeda.com ADMIN_PASSWORD=SecurePass123 npm run db:seed

# Check health
npm run dev
# Visit http://localhost:3000/api/health
```

### Development

```bash
npm run dev
# Open http://localhost:3000
# Public site works even without DB (fallback to hardcoded)
```

### Build

```bash
npm run build
npm start
```

## Hostinger Deployment

1. **Create MySQL Database:**
   - hPanel → Databases → Create new database
   - Note: database name, user, password, host

2. **Set Environment Variables in Hostinger:**
   - Advanced → Node.js → Environment Variables
   - Add `DATABASE_URL=mysql://u123...:pass@localhost:3306/u123...`
   - Add `ADMIN_SETUP_SECRET`, `NEXTAUTH_SECRET`, etc
   - Never hardcode secrets

3. **Deploy & Migrate:**

   Option A: Via phpMyAdmin (easiest)
   - Import `drizzle/0000_chief_paper_doll.sql` via phpMyAdmin
   - Then seed via SSH: `npm run db:seed`

   Option B: Via SSH
   ```bash
   npm install
   npm run db:migrate
   npm run db:seed
   npm run build
   npm start
   ```

4. **Create Initial Admin:**
   ```bash
   curl -X POST https://yourdomain.com/api/admin/setup \
     -H "Content-Type: application/json" \
     -d '{
       "secret": "YOUR_ADMIN_SETUP_SECRET",
       "email": "admin@makeupbyneeda.com",
       "password": "SecurePass123",
       "name": "Needa Admin"
     }'
   ```

5. **Start Command:** `npm start` (respects PORT env)

## Features

- **MySQL Persistence:** All CMS content stored in MySQL, survives restarts
- **Enquiry Tracking:** Human-readable numbers MBN-2026-0001, status workflow
- **Secure Auth:** bcrypt hashing, no plain-text passwords
- **Graceful Fallback:** Public site works without DB (uses hardcoded config)
- **Price in DB:** Services store price decimal + priceText, not hardcoded in frontend
- **Real Images Only:** 4 real portfolio images seeded, placeholders marked for replacement, no fake photos

## Seed Data

Migrated from `src/config/site.ts`:

- **SiteSettings:** 1 record (business info)
- **ArtistProfile:** 1 record (Needa)
- **Services:** 22 services (6 Makeup, 8 Hair, 8 Nails) - names preserved, priceText "Enquire for pricing" where no real price
- **Gallery:** 4 real images only (hero, glamorous, portfolio-01, portfolio-02) - placeholders NOT seeded as fake
- **Testimonials:** 2 inactive samples (CMS structure)
- **FAQs:** 4 active (booking, travel, services, advance)
- **AdminUser:** 0 by default, created via env or secure endpoint

## API Endpoints

- `POST /api/enquiries` - Create enquiry, persists to MySQL, generates MBN- number, WhatsApp fallback
- `GET /api/enquiries` - List recent enquiries (for future admin)
- `POST /api/admin/setup` - Secure admin creation via ADMIN_SETUP_SECRET
- `GET /api/admin/setup` - Check admin exists, setup configured
- `GET /api/health` - DB connection health check

## Documentation

- `DATABASE.md` - Full DB docs, migrations, seed, env vars
- `AUDIT_REPORT.md` - Previous audit/restructure report
- `.env.example` - All required env vars

## Design

Preserves premium editorial beauty studio design:
- Custom palette (browns, roses, creams)
- Serif headings, smooth animations
- No generic templates, no payment gateways, no calendar/CRM bloat

## License

Private - Makeup by Needa
