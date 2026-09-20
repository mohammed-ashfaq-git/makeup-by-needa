# Makeup by Needa - Toronto Makeup Artist

A clean, production-ready full-stack Next.js website for Makeup by Needa, a Toronto-based beauty artistry studio specializing in bridal, event, and editorial looks across makeup, hair styling, and nail art.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Custom CSS design system
- **Deployment:** Node.js application (Hostinger compatible)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API
│   ├── about/              # About page
│   ├── book/               # Booking/enquiry page
│   ├── contact/            # Contact page
│   ├── gallery/            # Portfolio gallery
│   ├── services/           # Services listing
│   ├── api/
│   │   └── enquiries/      # Enquiry form API endpoint
│   ├── globals.css         # Global design system
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/
│   ├── layout/             # Header, Footer
│   ├── ui/                 # Reusable UI components
│   ├── features/           # Feature components (gallery, forms)
│   └── motion/             # Animation components
├── config/
│   └── site.ts             # Business data, services, gallery (CMS-ready)
├── lib/
│   ├── validations/        # Form validation logic
│   ├── utils/              # Utility functions (WhatsApp, formatters)
│   ├── email/              # Email delivery placeholder
│   ├── db/                 # Database placeholder
│   ├── auth/               # Auth placeholder
│   └── cms/                # CMS logic placeholder
└── types/                  # Shared TypeScript types
public/
├── images/                 # Portfolio images
└── makeup-by-needa-logo.jpg
```

## Getting Started

### Prerequisites

- Node.js >= 18.17.0
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Build

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Available variables:

- `BUSINESS_INQUIRY_EMAIL` - Email for receiving enquiries
- `RESEND_API_KEY` - Optional, for email delivery via Resend
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Optional, for SMTP email delivery
- `NEXT_PUBLIC_SITE_URL` - Public site URL

If no email provider is configured, the API gracefully falls back to WhatsApp.

## Hostinger Deployment

This app is designed to run as a Node.js application on Hostinger:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Hostinger Node.js Setup:**
   - Set Node.js version to 18 or higher
   - Set entry point to `node_modules/next/dist/bin/next` or use `npm start`
   - Set environment variables in Hostinger panel
   - The app automatically respects `PORT` env variable

3. **Start command:**
   ```bash
   npm start
   ```

4. **Environment Variables on Hostinger:**
   - Add variables from `.env.example` in Hostinger's Node.js management panel
   - Never hardcode secrets

## Features

- **Responsive Design:** Mobile-first, editorial beauty studio aesthetic
- **Enquiry System:** Validated form with WhatsApp fallback
- **Portfolio Gallery:** Filterable gallery with lightbox
- **SEO Ready:** Proper metadata, semantic HTML
- **Lightweight:** No heavy dependencies, fast loading
- **Production Ready:** Clean architecture, separation of concerns

## Business Information (CMS-Ready)

Currently hardcoded in `src/config/site.ts`, designed for future CMS migration:

- Business contact details
- Services (Makeup, Hair, Nails)
- Gallery items
- Navigation

## Future Implementation

- **CMS:** Lightweight file-based or SQLite for Hostinger compatibility
- **Database:** Enquiry persistence
- **Authentication:** Simple admin auth for CMS
- **Email:** Resend or SMTP integration

## Design

Preserves the existing premium editorial beauty studio design with:
- Custom color palette (browns, roses, creams)
- Serif typography for headings
- Smooth animations and transitions
- No generic templates

## License

Private - Makeup by Needa
