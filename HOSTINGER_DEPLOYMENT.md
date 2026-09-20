# Hostinger deployment

This application is a Next.js server backed by MySQL. It runs with the repository's existing scripts; it does not use static export, serverless functions, a separate API process, or disk uploads.

## Before you deploy

1. Use a Hostinger plan that can run a persistent Node.js application and connect to its MySQL database.
2. Select **Node.js 22.x** where it is available. The application declares a minimum supported version of Node.js `20.9.0`.
3. Provision a MySQL database and a dedicated database user in Hostinger. Record the database host, port, database name, username, and password from the Hostinger panel. Do not assume the host is `localhost`.
4. Point the production domain at the Node application and enable HTTPS before serving traffic. The app sends HSTS in production, so the final canonical domain must work over HTTPS first.

## Required environment variables

Configure these in the hosting control panel, not in the repository:

| Variable | Required | Value |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL connection URL, for example `mysql://app_user:password@db-host:3306/makeup_by_needa` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Final HTTPS canonical URL, for example `https://www.example.com` |
| `ADMIN_SETUP_SECRET` | Recommended | A long, unique secret required by the one-time first-admin setup flow |
| `NODE_ENV` | Set by the start command | `production` when running `npm start` |

Use the exact database host shown by Hostinger. Percent-encode reserved characters in the database password when putting it in `DATABASE_URL` (for example, `@` becomes `%40`). Set `NEXT_PUBLIC_SITE_URL` **before** building: it is used for canonical metadata, the XML sitemap, and `robots.txt`. Do not add a trailing path such as `/admin`.

See [`.env.example`](.env.example) for non-secret example values and local-development-only variables. Never commit a real `.env` file or database password.

## Deploy or update the application

Set the application's working directory to the root of this repository, then run these project scripts in this order after the environment variables are present:

```bash
npm install
npm run db:setup
npm run build
npm start
```

- `npm run db:setup` runs the committed Drizzle migrations and the idempotent seed script. Run it on the target database before the first start and again when a future release includes a migration.
- `npm run build` creates the production Next.js build.
- `npm start` runs `next start`; do not hard-code a port. A Node hosting platform should supply `PORT`, which Next.js honours.
- On a later code deployment with no database migration, run `npm install`, `npm run build`, and restart with `npm start`.

If the selected Hostinger product only accepts a startup-file path and cannot execute an npm start command, confirm its documented Next.js/Node process support with Hostinger before deploying. This repository deliberately has no fabricated `server.js` startup file.

## First administrator

After the application is live and the database is migrated, visit:

```text
https://your-production-domain/admin/setup
```

This page creates the first administrator only while `admin_users` is empty. If `ADMIN_SETUP_SECRET` is configured, enter it during setup. Store the resulting administrator password in a password manager. Once an administrator exists, use `/admin/login`; the setup page will no longer create another account.

For emergency credential recovery from a trusted server shell, the project provides:

```bash
npm run admin:reset-password -- --email you@example.com --password 'a-new-strong-password'
```

That command updates the named account and invalidates all administrator sessions. Do not place the password in shell history on a shared server; omit `--password` to use its interactive prompt.

## Verification checklist

After every production deployment, verify the following using the real HTTPS domain:

1. `/`, `/about`, `/services`, `/gallery`, `/book`, and `/contact` load successfully.
2. `/robots.txt` allows public pages, disallows `/admin`, and names the HTTPS sitemap URL.
3. `/sitemap.xml` lists only the six public routes with the canonical HTTPS host.
4. `/admin` redirects unauthenticated visitors to `/admin/login` and the first-admin setup flow behaves as described above.
5. Submit a test enquiry, then remove it from the admin inbox if it is not a real lead.
6. Check the browser console for blocked scripts, styles, images, or Content Security Policy messages.

## Troubleshooting

- **Build fails with a Node version error:** select Node.js 22.x or any version meeting `>=20.9.0`, reinstall dependencies with `npm install`, then build again.
- **Database connection error:** recheck `DATABASE_URL`, including URL-encoding of special characters and the database host/port supplied by Hostinger. Ensure the database user has access to the selected schema.
- **`/admin/setup` says setup is unavailable:** an administrator already exists. Use `/admin/login` or the recovery command from a trusted server shell.
- **Sitemap or canonical URLs use the wrong domain:** correct `NEXT_PUBLIC_SITE_URL`, rebuild with `npm run build`, and restart the application.
- **Application does not answer after startup:** ensure the Hostinger process is running `npm start` from the repository root and that the platform-provided `PORT` has not been overridden.

The app stores managed image data in MySQL; there is no writable upload directory to configure on Hostinger.
