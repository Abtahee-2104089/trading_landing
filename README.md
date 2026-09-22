# UAE Trade Gateway

The public B2B landing page, CMS, and inquiry workspace for a UAE-based import and export trading company.

The application combines a single unified marketing page, a CMS-backed content system with a staff
admin panel, a qualified lead-capture form, and a Convex-backed inquiry and email-delivery workflow.

## Product areas

- Public landing sections for credibility, capabilities, global reach, and inquiry: navbar, hero, about plus UAE advantage, trading categories, global network and logistics, trust and compliance, inquiry form, and footer. Navbar, hero, about, and footer content render live from the CMS with local fallbacks.
- Trading-category showcase (products) with cards for Electronics, Foodstuff and Agro, Textiles, Building Materials, Cosmetics, and Auto Parts and Industrial, each with an enquire link preselecting the contact form category.
- CMS admin panel at `/admin`: site text and contact block, page sections, products, services, media library (UploadThing image uploads), inquiry triage, and admin account/team management.
- Staff authentication with email and password (stretched hash, throttled login, HMAC-signed sessions). First-run setup at `/admin/setup`; further admins are added from `/admin/account`.
- Inquiry submission with shared zod validation, honeypot and per-email throttle, persistent storage, status tracking (`new`, `contacted`, `qualified`, `closed`), and internal review queries.
- Email delivery for team notifications and sender acknowledgements over Gmail SMTP, with a `mailOutbox` delivery log where failures never fail the form submit.
- SEO foundation with metadata, Open Graph, Twitter card, canonical URL, robots, sitemap, manifest, JSON-LD Organization data, and a dynamic OG image. Production builds fail loudly when `NEXT_PUBLIC_SITE_URL` is unset so placeholder domains can never ship.

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · Convex (database, functions, storage legacy) · UploadThing (`utfs.io` image storage) · zod (single inquiry schema shared by client and server) · Gmail SMTP via nodemailer · Bun.

## Run locally

You need Bun 1.4 or newer and access to the project's Convex workspace.

1. Clone the repository and install dependencies.

```bash
git clone https://github.com/Abtahee-2104089/trading_landing.git
cd trading_landing
bun install
```

2. Start the development backend. This syncs Convex functions and writes the deployment URLs to `.env.local`.

```bash
bunx convex dev
```

3. Configure environment variables in `.env.local` (gitignored — never commit it):

```dotenv
NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_SESSION_SECRET=<64-hex-chars, see below>
UPLOADTHING_TOKEN=<Token from uploadthing.com dashboard>
```

Generate the session secret (must also match the Convex deployment env, step 4):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Get the UploadThing token at uploadthing.com → your app → API Keys → copy the **Token** field (starts with `eyJ`), not the Secret key or App ID. Paste it on one line with no quotes or spaces.

4. Mirror backend-only secrets into the Convex dev deployment and configure mail:

```bash
bunx convex env set ADMIN_SESSION_SECRET <same-value-as-.env.local>
bunx convex env set SITE_URL http://localhost:3000
bunx convex env set INQUIRY_NOTIFY_TO sales@your-company.ae
bunx convex env set EMAIL_TRANSPORT gmail_smtp
bunx convex env set GMAIL_SMTP_USER your-mailbox@gmail.com
bunx convex env set GMAIL_SMTP_APP_PASSWORD
bunx convex env set EMAIL_FROM_NAME "UAE Trade Gateway"
```

To deliver team notifications and sender acknowledgements through Gmail, enable two-step verification, create a revocable Google app password, and enter it interactively. Do not use the mailbox's main password. Without a configured transport, inquiries still save in Convex with `emailStatus: "failed"` and a `skipped` reason in the `mailOutbox` log while remaining reviewable for the team.

5. Seed the CMS baseline once (idempotent — safe to re-run, skips when content exists):

```bash
# Convex dashboard → Functions → seed:seedCms → Run
```

6. Start the website.

```bash
bun dev
```

Open `http://localhost:3000`. All landing sections work without signing in. Submit the `#contact` form to test `inquiries.submit` plus team notification and sender acknowledgement end to end. Without `NEXT_PUBLIC_CONVEX_URL` the form shows a clear "backend not configured" error instead of crashing.

## Demo and admin access

| Access level | URL | Credentials | What it demonstrates |
| ------------ | --- | ----------- | -------------------- |
| Guest | `/` | none needed | Full landing page and `#contact` inquiry flow |
| Staff (production mock) | `/admin` | Email: `admin@example.com` · Password: `12345678` | Full CMS: content, images, inquiries, team |
| Staff (local dev mock) | `/admin` | Email: `admin@example.com` · Password: `admin123` | Same, against the dev database (create it first at `/admin/setup` while no account exists) |

`/`admin/setup` is first-run only and closes once any admin account exists. Change passwords anytime at `/admin/account`, and add/remove team admins there. Test submissions must never contain personal, confidential, or production data. A fresh Convex deployment has a separate database, so past inquiries do not carry over.

## CMS guide (for editors)

Every text, image, product, service, and address is editable without code:

- Site text, contact block, hero/about images → `/admin/site`
- Page headlines, bodies, journey steps, Trust proof, section images → `/admin/sections`
- Trading-category cards (create, edit, unpublish instead of deleting) → `/admin/products`
- Global-network capability cards → `/admin/services`
- Image library (upload, copy URL, delete rows) → `/admin/media`
- Leads (read-only table + status `new/contacted/qualified/closed`) → `/admin/inquiries`

## Environment variables

Frontend (Vercel → Settings → Environment Variables; `NEXT_PUBLIC_*` is baked at build time, so redeploy after changing any of them):

| Variable | Type | Purpose |
| -------- | ---- | ------- |
| `NEXT_PUBLIC_CONVEX_URL` | Config | Frontend ↔ Convex backend (prod deployment URL in production) |
| `NEXT_PUBLIC_SITE_URL` | Config | Canonical site URL for sitemap/OG/JSON-LD; production builds fail without it |
| `ADMIN_SESSION_SECRET` | Secret | HMAC session secret — must be identical in Vercel and Convex envs |
| `UPLOADTHING_TOKEN` | Secret | Image uploads |
| `NEXT_PUBLIC_GA_ID` | Config, optional | GA4 + `generate_lead` conversion events; omit and no tracker ships |

Backend (Convex deployment env via `bunx convex env set [--prod]`): `SITE_URL` (exact origin, used in emails), `INQUIRY_NOTIFY_TO` (team inbox), `EMAIL_TRANSPORT=gmail_smtp`, `GMAIL_SMTP_USER`, `GMAIL_SMTP_APP_PASSWORD`, `EMAIL_FROM_NAME`, `ADMIN_SESSION_SECRET`. `SITE_URL` must be one exact origin with no path or trailing slash.

## Quality checks

```bash
bun run lint
bun run typecheck
bun run test        # 29 tests: crypto vectors, inquiry hardening, team management
bun run format:check
bun run build
```

Run the complete local validation before opening a pull request:

```bash
bun run check
bun run build
BASE_URL=http://localhost:3000 bun run verify:runtime
```

CI (`.github/workflows/ci.yml`) runs lint → typecheck → build (with the public beta `NEXT_PUBLIC_SITE_URL`) → test on every pull request. One repo, `main`-only releases, short-lived `feat/cms-*`/`chore/cms-*` branches, Kabir reviews. Never push until the QA gate passes and never commit `.env.local` or any secret.

## Deployment

The production frontend is deployed on Vercel with `bun install` and `bun run build` from `vercel.json`.

1. Deploy the backend schema and functions to production.

```bash
bunx convex deploy
```

2. Set the production backend environment (fresh `ADMIN_SESSION_SECRET`, never reuse dev's):

```bash
bunx convex env set --prod ADMIN_SESSION_SECRET <fresh-64-hex>
bunx convex env set --prod SITE_URL https://<final-domain>
bunx convex env set --prod INQUIRY_NOTIFY_TO sales@your-company.ae
bunx convex env set --prod EMAIL_TRANSPORT gmail_smtp
bunx convex env set --prod GMAIL_SMTP_USER your-mailbox@gmail.com
bunx convex env set --prod GMAIL_SMTP_APP_PASSWORD
bunx convex env set --prod EMAIL_FROM_NAME "UAE Trade Gateway"
```

3. Set the Vercel production env vars from the table above (Config vs Secret matters — `NEXT_PUBLIC_*` must be Config), then redeploy.

4. Seed production once (dashboard → prod deployment → `seed:seedCms` → Run), then create the real staff account at `https://<final-domain>/admin/setup`.

5. Replace the seeded placeholder contact block at `/admin/site#contact` with verified office/email/phone/WhatsApp/hours — never hand over a site serving `example.ae`/`000 0000` placeholders.

6. Confirm `/`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, and `#contact` submission on the final domain. Check that both the team inbox and the sender receive mail. If the form reports the backend is not configured, ensure `NEXT_PUBLIC_CONVEX_URL` was set before the build and that `SITE_URL` contains only the final origin.

See the [concept deck](docs/concept-deck.md), [team workflow](Teamwork%20distribution.md), [Convex schema](convex/schema.ts), [inquiry workflow](convex/inquiries.ts), and [email delivery](convex/emails.ts).

## Content rule

Until verified company info is available, use credible placeholder copy. Do not invent certifications, clients, transaction volumes, awards, statistics, or specific partnerships.

## License

Copyright © Trading team. Internal company project — do not distribute or accept external contributions without company approval.
