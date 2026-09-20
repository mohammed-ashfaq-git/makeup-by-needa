# Database Documentation - Makeup by Needa

## Technology Selected

**Primary: Drizzle ORM + MySQL2**
- **Why Drizzle?** Lightweight, pure JavaScript (no binary download needed), works offline, excellent TypeScript support, MySQL compatible, Hostinger-friendly
- **Why MySQL2?** Production-grade MySQL driver with connection pooling, widely supported on Hostinger
- **Fallback: Prisma** - Schema kept in `prisma/schema.prisma` for reference, but Drizzle is primary due to offline build requirements in sandboxed environments. Prisma requires downloading binaries from `binaries.prisma.sh` which fails in restricted networks. Drizzle works 100% offline.

**Hostinger Compatibility:**
- MySQL is native on Hostinger (provided via hPanel)
- Drizzle + mysql2 uses standard Node.js, no native binaries that break deployment
- Connection pooling with singleton pattern prevents Next.js dev hot-reload issues
- Graceful fallback when `DATABASE_URL` not set (public site still works)

## Packages Added

```json
{
  "dependencies": {
    "@prisma/client": "^6.19.3",  // Optional fallback, type reference
    "bcryptjs": "^3.0.3",          // Secure password hashing
    "drizzle-orm": "^0.45.2",      // Primary ORM - lightweight MySQL
    "mysql2": "^3.24.4"            // MySQL driver with pooling
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.10",     // Migration tool
    "prisma": "^6.19.3",           // Optional, for Prisma schema reference
    "tsx": "^4.23.14",             // Run TypeScript seed scripts
    "@types/bcryptjs": "^2.4.6"
  }
}
```

## Database Schema Created

All tables have `id`, `createdAt`, `updatedAt` as required.

### 1. AdminUser (`admin_users`)
- `id` varchar(30) PK, cuid-like
- `name` varchar(100)
- `email` varchar(255) unique
- `passwordHash` varchar(255) - bcrypt hashed, never plain text
- `createdAt`, `updatedAt` datetime

### 2. SiteSettings (`site_settings`) - Single record, extensible
- `id`, `businessName`, `logo`, `phone`, `email`, `whatsapp`, `whatsappDisplay`, `whatsappMessage`, `location`, `address`, `hours`, `instagram`, `instagramUrl`, `instagramMakeup`, `instagramMakeupUrl`, `instagramNails`, `instagramNailsUrl`, `facebook`, `homepageTitle`, `homepageDescription`, `footerText`, `createdAt`, `updatedAt`

### 3. ArtistProfile (`artist_profiles`)
- `id`, `name`, `profileImage`, `shortBio` text, `fullBio` text, `experience` text, `specialties` text, `qualifications` text, `location`, `instagram`, `createdAt`, `updatedAt`

### 4. Service (`services`) - Price stored in DB
- `id`, `name` varchar(255), `slug` varchar(255) unique, `shortDescription` text, `description` text, `price` decimal(10,2) nullable, `priceText` varchar(255) default "Enquire for pricing", `duration` varchar(255), `image` varchar(500), `category` enum(Makeup,Hair,Nails), `featured` boolean, `active` boolean, `displayOrder` int, `createdAt`, `updatedAt`
- Indexes on category, featured, active, displayOrder

### 5. GalleryImage (`gallery_images`)
- `id`, `image` varchar(500) not null, `title` varchar(255), `caption` text, `altText` varchar(500), `category` enum(Makeup,Bridal,Hair,Nails), `active` boolean, `displayOrder` int, `createdAt`, `updatedAt`
- Indexes on category, active, displayOrder

### 6. Testimonial (`testimonials`)
- `id`, `clientName` varchar(255), `testimonial` text, `rating` tinyint 1-5 default 5, `clientPhoto` varchar(500), `service` varchar(255), `active` boolean, `displayOrder` int, `createdAt`, `updatedAt`
- Indexes on active, rating, displayOrder

### 7. FAQ (`faqs`)
- `id`, `question` text, `answer` text, `active` boolean, `displayOrder` int, `createdAt`, `updatedAt`
- Indexes on active, displayOrder

### 8. Enquiry (`enquiries`) - Human-readable number MBN-2026-0001
- `id`, `enquiryNumber` varchar(50) unique (MBN-YYYY-NNNN), `name` varchar(255), `phone` varchar(50), `email` varchar(255), `service` varchar(255), `eventDate` datetime nullable, `eventDateRaw` varchar(100), `preferredTime` varchar(100), `location` varchar(255), `people` int nullable, `peopleRaw` varchar(50), `message` text, `status` enum(NEW,CONTACTED,CONFIRMED,COMPLETED,CANCELLED) default NEW, `createdAt`, `updatedAt`
- Indexes on enquiryNumber, status, email, createdAt
- Does NOT use DB ID as customer-facing number

**Prisma Schema:** Also maintained in `prisma/schema.prisma` for reference (8 models, enums)

## Migration Status

**Drizzle Migrations:**
- Generated: `drizzle/0000_chief_paper_doll.sql` (8 tables, 4574 bytes)
- Location: `drizzle/` folder + `drizzle/meta/` journal
- Config: `drizzle.config.ts` (dialect: mysql, schema: ./src/lib/db/schema.ts)

**How to Apply Migrations:**

### Option 1: Drizzle Kit (Recommended for local)
```bash
npm run db:generate  # Generate SQL from schema changes
npm run db:migrate   # Apply migrations (requires DATABASE_URL)
# or
npm run db:push      # Push schema directly (dev only, no migration file)
```

### Option 2: Hostinger phpMyAdmin (Production)
1. Login to Hostinger hPanel → Databases → phpMyAdmin
2. Select your database (e.g., `u123456789_makeupbyneeda`)
3. Import → Choose `drizzle/0000_chief_paper_doll.sql`
4. Go

### Option 3: Programmatic (Node.js)
```bash
DATABASE_URL="mysql://..." npx tsx src/lib/db/migrate.ts
```

### Option 4: Manual SQL
The SQL file is plain MySQL, can be executed via any MySQL client:
```bash
mysql -u user -p database < drizzle/0000_chief_paper_doll.sql
```

## Seed Status

**Seed Script:** `src/lib/db/seed.ts` (Drizzle version, works with MySQL)

**What it does:**
- Reads hardcoded content from `src/config/site.ts` as source
- Preserves existing business info, services, gallery
- Does NOT invent fake data

**Seeded Data:**

1. **SiteSettings:** 1 record from `business` object (name, logo, phone, email, whatsapp, location, etc)
2. **ArtistProfile:** 1 record (Needa, shortBio, fullBio from cleaned About page)
3. **Services:** 22 services (6 Makeup + 8 Hair + 8 Nails) - preserves names exactly from existing project:
   - Makeup: Bridal Makeup, Engagement Makeup, Reception Makeup, Party/Event Makeup, Photoshoot Makeup, Custom Makeup
   - Hair: Bridal Hair Styling, Engagement Hair, Reception Hair, Party/Event Hair, Soft Curls & Waves, Elegant Updo, Sleek Hair Styling, Custom Hair Styling
   - Nails: Classic Nail Art, Bridal Nail Art, French Tips, Gel Nails, Nail Extensions, Custom Nail Art, Minimal Nail Art, Luxury Nail Art
   - Price: `null` (no real price in existing data) + `priceText: "Enquire for pricing"` (does NOT invent prices)
   - Slugs generated: `bridal-makeup`, `engagement-makeup`, etc
   - Featured: first 2 of each category (as in original)
4. **GalleryImages:** 4 real images only (NOT placeholders):
   - `/images/makeup-by-needa-hero.jpg` - Signature beauty
   - `/images/Glamorous-Makeup-Artistry.jpg` - Glamorous makeup artistry
   - `/images/makeup-by-needa-portfolio-01.jpg` - Makeup artistry
   - `/images/makeup-by-needa-portfolio-02.jpg` - Beauty details
   - Placeholder tones (rose, sand, cocoa, clay, ivory, mauve) identified but NOT seeded as fake photos - marked for replacement via CMS
5. **Testimonials:** 2 sample inactive (for CMS structure, not fake reviews)
6. **FAQs:** 4 active FAQs (booking, travel, services, advance booking)
7. **AdminUser:** 0 by default, created via env or setup endpoint (secure)

**Run Seed:**
```bash
# With DATABASE_URL set
DATABASE_URL="mysql://..." npm run db:seed

# With admin creation
ADMIN_EMAIL=admin@makeupbyneeda.com ADMIN_PASSWORD=SecurePass123 DATABASE_URL="mysql://..." npm run db:seed
```

## Existing Content Migrated

- ✅ Business info: name, location, email, whatsapp, instagram (from `src/config/site.ts`)
- ✅ Services: 22 services, names preserved exactly, no invented services
- ✅ Gallery: 4 real images preserved, placeholders NOT treated as real, marked for replacement
- ✅ No fake portfolio photos created
- ✅ Prices: "Enquire for pricing" kept where no real price exists, not invented
- ✅ Navigation, footer text preserved

## Environment Variables Required

Update `.env.example` with:

```env
# MySQL - Required for production
DATABASE_URL="mysql://user:password@localhost:3306/makeup_by_needa"

# Business (optional)
BUSINESS_INQUIRY_EMAIL=aurastudioneeda@gmail.com

# Email (optional, WhatsApp fallback if not set)
RESEND_API_KEY=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Admin Setup - Secure initial admin creation
ADMIN_SETUP_SECRET=your-secure-random-32-char-secret
# Optional for seed
ADMIN_EMAIL=admin@makeupbyneeda.com
ADMIN_PASSWORD=secure-password-min-8-chars

# Auth secrets
NEXTAUTH_SECRET=your-nextauth-secret-32-chars
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-auth-secret-32-chars

# Site
NEXT_PUBLIC_SITE_URL=https://makeupbyneeda.com
NODE_ENV=development
```

**Hostinger Setup:**
- Hostinger → hPanel → Databases → Create MySQL database
- Note: database name, user, password, host (usually localhost)
- Format: `mysql://u123456789_user:password@localhost:3306/u123456789_dbname`
- Add env vars in Hostinger → Advanced → Node.js → Environment Variables

## Commands Needed to Initialize Database

### Local Development

```bash
# 1. Copy env
cp .env.example .env.local
# Edit .env.local with your MySQL DATABASE_URL

# 2. Generate client (Drizzle doesn't need generate, but for Prisma optional)
npm run db:generate

# 3. Apply migrations
npm run db:migrate
# or push directly for dev:
npm run db:push

# 4. Seed existing content
npm run db:seed

# 5. Optional: Create admin via seed
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=YourPass123 npm run db:seed

# 6. Verify connection
npm run dev
# Visit http://localhost:3000/api/health - should show database connected

# 7. Build
npm run build
```

### Production (Hostinger)

```bash
# Via SSH or Hostinger Terminal:

# 1. Set env vars in Hostinger panel

# 2. Install deps (Hostinger does this)
npm install

# 3. Run migrations
npm run db:migrate
# or if drizzle-kit not available, import SQL via phpMyAdmin

# 4. Seed
npm run db:seed

# 5. Create initial admin via secure endpoint (alternative to seed env)
curl -X POST https://yourdomain.com/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_ADMIN_SETUP_SECRET",
    "name": "Needa Admin",
    "email": "admin@makeupbyneeda.com",
    "password": "SecurePassword123"
  }'

# 6. Build & Start
npm run build
npm start
```

### Check Health

```bash
curl http://localhost:3000/api/health
# Should return: { ok: true, database: { connected: true, driver: "drizzle-mysql2" } }

curl http://localhost:3000/api/admin/setup
# Should return: { adminExists: false, setupConfigured: true, dbConfigured: true }
```

## Remaining Issues / Notes

- **Prisma offline build:** Prisma requires downloading binaries from `binaries.prisma.sh` which fails in restricted networks (sandbox). Solution: Use Drizzle as primary (works 100% offline). Prisma schema kept for reference but not required for build. `postinstall` script changed to skip Prisma generate offline.
- **MySQL required:** App gracefully falls back to hardcoded config + WhatsApp when `DATABASE_URL` not set, so public site works even without DB during development. Enquiries still show WhatsApp fallback but also try to persist if DB available.
- **No admin UI yet:** As per task, admin UI not built in this step. Only DB foundation, seed, and secure setup endpoint.
- **Password hashing:** Uses `bcryptjs` with 12 salt rounds, secure.
- **Enquiry numbers:** Generated as `MBN-YYYY-NNNN` with sequential per-year, not using DB ID. Handles race conditions via DB query of latest number.
- **Price handling:** Existing services have no real prices, so `price` is null and `priceText` is "Enquire for pricing". Future CMS will allow setting real decimal prices.
- **Gallery placeholders:** 6 placeholder items (Soft glamour, Bridal glow, etc) were tones, not real images. They are NOT seeded as fake photos. Only 4 real images seeded. Placeholders marked for replacement via CMS.
- **Build passes:** `npm run build` succeeds even without DATABASE_URL (fallback mode).

## Next Step: Admin CMS UI

Build `/admin` UI on top of this foundation:
- Login with AdminUser
- CRUD for SiteSettings, ArtistProfile, Services, GalleryImages, Testimonials, FAQs, Enquiries
- Image upload handling
- Enquiry status management
