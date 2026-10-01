# Needa Beauty Lab — Setup & Deployment Guide

This repository powers **Needa Beauty Lab**, an editorial, database-driven nail services website with full CMS management, service enquiry cart with WhatsApp integration, and rich portfolio media (photos and videos).

---

## Quick Start

### Option A: Local Dev Database (Zero external dependencies)

```bash
npm install
npm run setup:dev
```

This starts a local private MySQL dev instance, creates `.env`, applies all migrations (through `0005_rebrand_needa_beauty_lab`) and seeds the database (settings, artist profile, gallery).

In a second terminal:
```bash
npm run dev
```

### Option B: Existing Database (Production / Staging / Hostinger)

1. Configure `.env` with your `DATABASE_URL`:
   ```bash
   cp .env.example .env
   # Edit DATABASE_URL in .env
   ```

2. Run setup:
   ```bash
   npm install
   npm run setup
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

---

## Features & Architecture

### 1. Service Enquiry Cart → WhatsApp
- **Client Cart (`localStorage`):** Visitors can click **"+ Add to enquiry"** on any service in the nail price list.
- **Floating Drawer:** Fixed bottom-left **"My services"** button opens a sliding drawer showing selected services, quantity controls, date picker, and request notes.
- **WhatsApp Integration:** Generates a structured message with grouped categories and opens directly in WhatsApp via `https://wa.me/`.
- **Files:**
  - `src/lib/cart.ts`: Cart storage and formatted message builder
  - `src/components/service-cart.tsx`: Cart Provider, floating button, drawer, and `AddToEnquiryButton` component

### 2. Gallery CMS: Images and Videos
- **Dual Media Support:** Supports both photographs (JPG, PNG, WEBP) and videos.
- **Video Options:**
  - Embedded links (YouTube, Vimeo)
  - Direct video file uploads (MP4, WebM, MOV up to 40 MB)
  - Optional video poster / thumbnail image (YouTube thumbnails detected automatically)
- **Lightbox:** Plays videos inline with responsive HTML5 player or YouTube/Vimeo embed.
- **Files:**
  - `src/lib/video-url.ts`: Client-safe video embed and thumbnail utilities
  - `src/lib/images.ts`: `processMediaUpload` supporting images (≤5MB) and videos (≤40MB)
  - `src/components/gallery.tsx`: Public gallery grid with play badges and video lightbox
  - `src/components/admin/GalleryManager.tsx`: Admin interface for photos and videos

### 3. Services and prices
- **Initial catalogues:** `src/lib/nail-services.ts` and `src/lib/aura-services.ts` hold the current nail, makeup, and hair menus. `npm run db:setup` adds any missing entries to the `services` table.
- **Admin:** `/admin/services` lets you edit each service and price. Use **Load missing price lists** to restore any missing original makeup, hair, or nail entries without replacing edits already made. Homepage service cards use the CMS categories and prices.
- **Public fallback:** If the CMS has no services or the database is unavailable, the built-in catalogues are shown.
- **Search:** `src/components/service-search.tsx` filters the public price list and links to each service group.

### 4. Database Migrations
- `drizzle/0000_sparkling_sebastian_shaw.sql`: Initial 8 tables
- `drizzle/0001_overrated_exodus.sql`: Hero image settings
- `drizzle/0002_services_subcategory_details.sql`: Adds `subcategory` and `details` to `services`
- `drizzle/0003_gallery_video.sql`: Adds `media_type` and `video_url` to `gallery_items`
- `drizzle/0004_mobile_images.sql`: Adds `mobile_image_url` to `gallery_items` and `hero_image_mobile_url` to `site_settings`
- `drizzle/0005_rebrand_needa_beauty_lab.sql`: Updates the previously seeded business name, homepage title/description, footer text, WhatsApp message, artist bio and gallery alt text to Needa Beauty Lab — guarded on the old values, so admin edits are never overwritten
