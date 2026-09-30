# Hostinger deployment

This is a server-rendered Next.js application backed by MySQL. Use Hostinger Node.js Web Apps; do not configure a static export. Uploaded media is stored in MySQL, so no writable upload directory is needed.

## Before you deploy

1. Use a Hostinger Business or Cloud plan with Node.js Web Apps, or a VPS with Node.js configured manually.
2. Select **Next.js** and **Node.js 22.x (22.12 or newer)**. This project requires Node.js `>=22.12.0`.
3. Connect GitHub repository `mohammed-ashfaq-git/makeup-by-needa`, branch `main`, and set the app root to the repository root.
4. Set the build command to `npm run hostinger:build`, the start command to `npm start`, and the output directory to `.next` if Hostinger asks for it. Do not add a custom startup file.
5. Attach `needabeautylab.com` to the Node.js app and enable HTTPS before serving traffic. The app sends HSTS in production.

Hostinger's current Node.js flow supports Next.js, GitHub deployment, and Node.js 22. See [Deploy a Node.js web app](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/), [Add environment variables](https://www.hostinger.com/support/how-to-add-environment-variables-during-node-js-application-deployment/), and [Connect a Hostinger MySQL database](https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/).

## Required environment variables

Configure these in the hosting control panel, not in the repository:

| Variable | Required | Value |
| --- | --- | --- |
| `DATABASE_URL` | Yes | `mysql://u545250591_needabeautylab:<DATABASE_PASSWORD>@srv1128.hstgr.io:3306/u545250591_needa` |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://needabeautylab.com` |
| `ADMIN_SETUP_SECRET` | Recommended | A new, long random secret for the one-time first-admin setup |
| `NODE_ENV` | Set by Hostinger | `production` |

The database name, username, and host above were supplied for this deployment. Only the database password is missing; set it privately in Hostinger and never commit it. Percent-encode reserved password characters in `DATABASE_URL` (`@` becomes `%40`). Set `NEXT_PUBLIC_SITE_URL` **before** building because canonical metadata, the sitemap, and `robots.txt` use it.

Copy [`.env.example`](.env.example) to a local `.env`, replace the password and `ADMIN_SETUP_SECRET`, then import `.env` in hPanel. Hostinger stores environment values outside Git. `.env` is git-ignored; never commit it or paste real credentials into GitHub. The example file contains the production domain and database identifiers with a password placeholder.

## Security: rotate old credentials first

Earlier repository history included a database credential and a weak `ADMIN_SETUP_SECRET`. Do not reuse any values that were ever committed; rotate any exposed credential and set a fresh `ADMIN_SETUP_SECRET` (for example, `openssl rand -base64 32`).

## Deploy or update the application

Set `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL` in the Hostinger environment before deployment. Hostinger managed Node.js plans do not allow npm commands over SSH, so set the Build command to `npm run hostinger:build`. That script applies migrations and seeds CMS data before running the normal Next.js build.

```bash
npm install
npm run hostinger:build
npm start
```

- `npm run hostinger:build` runs `npm run db:setup` and then `npm run build`. It requires a valid `DATABASE_URL` and a database reachable during Hostinger deployment.
- `npm run build` alone creates the production Next.js build in `.next` using Webpack and does not connect to MySQL. This keeps local builds independent from database availability.
- Do not hard-code a port. A Node hosting platform should supply `PORT`, which Next.js honours.

## First administrator

After the application is live and the database is migrated, visit:

```text
https://needabeautylab.com/admin/setup
```

This page creates the first administrator only while `admin_users` is empty. If `ADMIN_SETUP_SECRET` is configured, enter it during setup. Store the resulting administrator password in a password manager. Once an administrator exists, use `/admin/login`; the setup page will no longer create another account.

For emergency credential recovery from a trusted server shell, the project provides:

```bash
npm run admin:reset-password -- --email you@example.com --password 'a-new-strong-password'
```

That command updates the named account and invalidates all administrator sessions. Do not place the password in shell history on a shared server; omit `--password` to use its interactive prompt.

## Verification checklist

After every production deployment, verify the following using the real HTTPS domain:

1. `https://needabeautylab.com/`, `/about`, `/services`, `/gallery`, `/book`, and `/contact` load successfully.
2. `/robots.txt` allows public pages, disallows `/admin`, and names the HTTPS sitemap URL.
3. `/sitemap.xml` lists only the six public routes with the canonical HTTPS host.
4. `/admin` redirects unauthenticated visitors to `/admin/login` and the first-admin setup flow behaves as described above.
5. Submit a test enquiry, then remove it from the admin inbox if it is not a real lead.
6. Check the browser console for blocked scripts, styles, images, or Content Security Policy messages.

## Troubleshooting

- **Build fails with a Node version error:** select Node.js 22.x (22.12 or newer), reinstall dependencies with `npm install`, then build again.
- **Database connection error:** recheck `DATABASE_URL`, including URL-encoding of special characters and the database host/port supplied by Hostinger. Ensure the database user has access to the selected schema.
- **`/admin/setup` says setup is unavailable:** an administrator already exists. Use `/admin/login` or the recovery command from a trusted server shell.
- **Sitemap or canonical URLs use the wrong domain:** correct `NEXT_PUBLIC_SITE_URL` in hPanel and redeploy so the app rebuilds.
- **Application does not answer after startup:** ensure the Hostinger process is running `npm start` from the repository root and that the platform-provided `PORT` has not been overridden.

The app stores managed image data in MySQL; there is no writable upload directory to configure on Hostinger.
