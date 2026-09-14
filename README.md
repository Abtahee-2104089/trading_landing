# UAE Trade Gateway — Import/Export Landing Page

One single, unified B2B landing page for a modern, reliable UAE-based import & export trading company handling international commodities, supply chain logistics, and cross-border trade.

The goal is credibility → capabilities → global reach → inquiry. Communicate the UAE's strategic hub position, present what the company trades and how it operates, build trust without fake claims, and convert visitors into qualified inquiries.

Concept: **The UAE Trade Gateway** — the UAE as the gateway connecting suppliers, commodities, logistics and buyers across Asia, Middle East, Africa and Europe.

Reference inspiration (do not clone): <https://alzaydaninternational.com>

Initial direction / concept deadline: **tomorrow 3pm** — show project understanding, creative direction, hero concept, section flow, wireframe/mockup, stack and responsibility split.

## Page sections to deliver

Single `app/page.tsx` composition, one design language, no divergent variants:

1. `01 Navbar` — logo, core navigation (About, Categories, Network, Trust, Contact), primary CTA `Request a Quote`. Sticky on desktop, compact menu on mobile.
2. `02 Hero` — headline: **Global Trade. Seamless Supply. Trusted from the UAE.** Supporting copy: UAE-based partner connecting international suppliers and buyers through sourcing, commodity trading and cross-border logistics. Primary CTA: `Request a Quote / Start a Trade Inquiry`. Secondary CTA: `Explore Trading Categories`. Cargo/port visual + subtle UAE-to-global route treatment.
3. `03 Who We Are + UAE Advantage` — headline: **Your Strategic Trade Partner in the UAE**. Brief intro + why UAE location matters. UAE-centered map/connection visual.
4. `04 Trading Categories` — headline: **What We Trade**. 5–6 responsive cards: food commodities, agricultural products, consumer/general goods, industrial goods, + 1–2 relevant extras. Image/icon + short description each.
5. `05 Global Network / Logistics` — headline: **From Global Source to Final Market**. Sourcing → coordination → logistics → documentation → distribution as one connected journey. World map / route visualization + capability list.
6. `06 Trust & Compliance` — headline: **Built on Reliability and Compliance**. Quality, documentation, transparent process, dependable supply relationships, responsible trade practices. No invented certifications, clients, volumes, awards, statistics or partnerships — credible placeholder copy only until verified.
7. `07 Final CTA + Inquiry Form` — headline: **Let's Talk Trade**. Low-friction form (name, company, email, phone, requirement/category, message) + clear response expectation. Visible repeated primary CTA.
8. `08 Footer` — navigation, contact details, company identity. Simple, structured, professional.

UX rules: value prop above the fold; one primary CTA repeated everywhere; each section answers one question (who are you, what do you trade, where do you operate, why trust you, how do I contact you); subtle route/reveal animations only; mobile-first readable type, fast images, accessible buttons/labels; semantic headings + metadata/Open Graph for SEO.

## Creative direction — do not diverge

- Visual tone: confident, precise, global, trustworthy.
- Design language: editorial typography + structured grids + high-quality trade/logistics imagery. Routes/connections/movement used subtly.
- Palette:
  - Primary Deep Navy — header, major text, strong backgrounds — `slate-900` range
  - Base Warm White — main background — `stone-50 / zinc-50` range
  - Neutral Cool Gray — secondary text, borders, cards — `slate-200/500` range
  - Accent Muted Gold or Teal — CTAs, route highlights — `amber-500 / teal-600` range
- Typography: modern sans-serif with strong weight contrast. Large short hero headlines, restrained body copy. Hierarchy via type, not excessive cards/decoration.
- Team rule: agree on structure, typography, colors, spacing and component style **before** parallel implementation. Final output must look like one design by one team.

## Team responsibilities

| Member | Ownership | Concrete deliverables |
| ------ | --------- | --------------------- |
| **Noore Tamanna Orny — Frontend (Part A)** | Navbar, Hero, About/UAE Advantage + design foundation | `components/layout/navbar/`, `components/hero/`, `components/about/`, `components/ui/` (buttons, section-heading, container), Tailwind tokens in `globals.css`, desktop + mobile for her sections, `next/image` optimization |
| **Prashanta Pal — Frontend (Part B)** | Categories, Network, Trust, Contact/Form UI, Footer | `components/trading-categories/`, `components/global-network/`, `components/trust/`, `components/contact/` (form UI only, calls backend hook), `components/footer/`, responsive behavior, cards, navigation smooth-scroll (`#about`, `#categories`, `#network`, `#trust`, `#contact`), accessible form labels, keyboard focus states |
| **Shawon Bhattacharjee — Backend** | Convex schema, inquiry workflow, SMTP mail in/out | `convex/schema.ts`, `convex/inquiries.ts` (submit + list/get for internal review), validation (zod-style / convex validators), inquiry `status: new/contacted/qualified/closed`, SMTP send on new inquiry (notify team + auto-acknowledge sender), failure handling / outbox log, do not expose secrets to client |
| **Md. Abtahee Kabir — Integration & Rest** | Setup, integration, SEO/perf, deploy, QA, tomorrow 3pm pack | Next.js + TypeScript + Tailwind + Bun scaffold, `app/layout.tsx`, `app/page.tsx` composition, `lib/types/`, `lib/utils/`, metadata/Open Graph, performance + contrast/a11y pass, merge both frontend halves into one unified page, Convex ↔ Vercel env wiring, `bun run check` + `build` + deploy, maintain this README, prepare concept deck for tomorrow 3pm |

Handoff contracts (to avoid merge conflicts):

- Orny and Pal build presentational components only — no direct Convex imports except via a single `useSubmitInquiry()` hook owned by Kabir/wired to Shawon's functions.
- Shared props live in `lib/types/inquiry.ts`: `name, company, email, phone, category, message`.
- All section components accept `id` anchors: `about`, `categories`, `network`, `trust`, `contact`.
- Backend API is frozen before form UI is finished: `inquiries.submit({name, company, email, phone, category, message}) → {id}`.

## How to work and push — single repo workflow

We use **one repo, one `main` branch, short-lived feature branches, PRs only**. Nobody pushes directly to `main` except Kabir merging approved PRs. This is how the 4 parts become one unified page without overwriting each other.

Folder ownership (do not edit outside your folders without asking in chat first):

- Orny: `components/navbar/`, `components/hero/`, `components/about/`, `components/ui/`
- Pal: `components/trading-categories/`, `components/global-network/`, `components/trust/`, `components/contact/`, `components/footer/`
- Shawon: `convex/`
- Kabir: `app/`, `lib/`, config files (`package.json`, `tailwind.config.*`, `tsconfig.json`, `vercel.json`), plus final merge in `app/page.tsx`

Branch names to use (create exactly these once):

- Orny: `feat/frontend-a-navbar-hero-about`
- Pal: `feat/frontend-b-sections-contact-footer`
- Shawon: `feat/backend-inquiries-smtp`
- Kabir: `chore/setup-integration-deploy`

Step 0 — Kabir creates the repo and scaffold (once, everyone else starts from Step 1):

```bash
bunx create-next-app@latest trading_landing --typescript --tailwind --eslint --app --no-src-dir
cd trading_landing
bun install
bunx convex dev
git init
git add .
git commit -m "chore: initial Next.js + TS + Tailwind + Bun scaffold"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Protect `main` on GitHub: Settings → Branches → require pull request before merging, require 1 review (Kabir).

Step 1 — Everyone clones and creates only their branch (Orny / Pal / Shawon):

```bash
git clone <your-repo-url>
cd trading_landing
git checkout main
git pull origin main
git checkout -b <your-branch-name>
bun install
bunx convex dev
bun dev
```

Example for Orny:

```bash
git checkout -b feat/frontend-a-navbar-hero-about
```

Step 2 — Do your part in your folders only:

- Orny: build Navbar, Hero, About + `ui/` button/section-heading/container. Keep navy/white/gold-teal tokens, use `next/image`, anchor ids `home`, `about`.
- Pal: build Categories, Network, Trust, Contact form UI, Footer. Call only the shared `useSubmitInquiry()` hook for the form — do not write Convex functions. Use anchor ids `categories`, `network`, `trust`, `contact`.
- Shawon: build `convex/schema.ts`, `convex/inquiries.ts` (`submit`, `list`), `convex/emails.ts` (SMTP notify team + auto-reply). Test with `bunx convex dev` + Convex dashboard. Never commit `.env.local` or app passwords.
- Kabir: own `app/layout.tsx`, `app/page.tsx`, `lib/`, metadata/SEO, wire Convex provider, Vercel env, resolve conflicts, keep design unified.

Check you did not touch others' files before committing:

```bash
git status
```

Step 3 — Commit and push your branch (repeat daily, small commits):

```bash
git add <your-folders-only>
git commit -m "feat: <what-you-did>"
git push -u origin <your-branch-name>
```

Good examples:

```bash
git add components/hero components/navbar
git commit -m "feat: add hero with UAE route visual and dual CTAs"
git push -u origin feat/frontend-a-navbar-hero-about
```

```bash
git add convex/schema.ts convex/inquiries.ts convex/emails.ts
git commit -m "feat: add inquiry submit with SMTP notify and auto-reply"
git push -u origin feat/backend-inquiries-smtp
```

Rules: never `git add .` if it includes `.env.local` or someone else's folder. Never commit secrets. Commit message format: `feat:`, `fix:`, `chore:` prefix.

Step 4 — Open a Pull Request into `main`:

1. On GitHub → Compare & pull request → base `main` ← your branch.
2. Title: `[Orny] Hero + Navbar + About` / `[Pal] Categories → Footer` / `[Shawon] Inquiry + SMTP`.
3. Request review from Kabir. Keep PR small and focused.
4. Wait for `lint`, `typecheck`, `build` to pass.

Step 5 — Stay in sync while others work (at least once a day, and before every PR):

```bash
git checkout main
git pull origin main
git checkout <your-branch-name>
git merge main
```

If Git says conflict in `app/page.tsx` or `globals.css`: stop, ping Kabir, do not force-push. Kabir resolves `page.tsx` composition conflicts so the page stays unified.

Step 6 — Kabir merges and deploys:

```bash
git checkout main
git pull origin main
git merge --no-ff feat/frontend-a-navbar-hero-about
git merge --no-ff feat/frontend-b-sections-contact-footer
git merge --no-ff feat/backend-inquiries-smtp
bun run check
bun run build
git push origin main
```

Vercel auto-deploys `main`. For tomorrow 3pm, Kabir cuts the demo from `main` only.

Emergency rules: one person per file at a time; `app/page.tsx`, `globals.css`, `lib/types/inquiry.ts` are Kabir-owned — propose changes in chat instead of editing directly; if your push is rejected, `git pull --rebase origin <your-branch-name>` then push again; never `git push --force` on `main`.

Suggested project structure:

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  layout/
  navbar/
  hero/
  about/
  trading-categories/
  global-network/
  trust/
  contact/
  footer/
  ui/
convex/
  schema.ts
  inquiries.ts
  emails.ts
lib/
  types/
  utils/
```

## Tech stack

- Next.js — framework, routing, metadata/SEO, server/client component strategy
- TypeScript — type safety across components, form data, Convex integration
- Tailwind CSS — design system, responsive layout, spacing, typography
- Convex — persistent inquiry submissions + minimal internal inquiry workflow
- Bun — runtime, package management, local dev
- Vercel — production deployment + previews
- SMTP (Gmail SMTP by default) — team notification on new lead + auto-reply to sender

Convex data model — keep small and focused:

```ts
inquiries: {
  name: string,
  company: string,
  email: string,
  phone?: string,
  category: string,      // requirement / trading category
  message: string,
  status: "new" | "contacted" | "qualified" | "closed",
  emailStatus: "sent" | "failed" | "pending",
  createdAt: number
}
```

## Run locally

You need Bun 1.3 or newer and access to the project's Convex workspace.

1. Clone and install:

```bash
git clone <your-repo-url>
cd trading_landing
bun install
```

2. Start the dev backend. This writes generated endpoints to `.env.local` and keeps schema in sync:

```bash
bunx convex dev
```

3. In another terminal, set the frontend origin and mail transport. Enter secrets interactively so they are not saved in shell history:

```bash
bunx convex env set SITE_URL http://localhost:3000
bunx convex env set TRUSTED_ORIGINS http://localhost:3000
bunx convex env set INQUIRY_NOTIFY_TO sales@your-company.ae
bunx convex env set EMAIL_TRANSPORT gmail_smtp
bunx convex env set GMAIL_SMTP_USER your-mailbox@gmail.com
bunx convex env set GMAIL_SMTP_APP_PASSWORD
bunx convex env set EMAIL_FROM_NAME "UAE Trade Gateway"
```

For Gmail: enable 2-step verification, create a revocable App Password, use it for `GMAIL_SMTP_APP_PASSWORD`. Never use the mailbox main password. Without a configured transport, inquiries still save in Convex with `emailStatus: "failed"` and remain reviewable; mail sending is retried/logged.

4. Start the site:

```bash
bun dev
```

Open `http://localhost:3000`. The landing page works without sign-in. Submit the `#contact` form to test `inquiries.submit` + SMTP notify + auto-reply end-to-end.

## Environment variables

Frontend (`.env.local`, never commit):

```dotenv
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
```

Backend (Convex dashboard / `bunx convex env set`, never in `.env.local`):

- `SITE_URL` — one exact origin, e.g. `http://localhost:3000` locally, `https://your-domain.vercel.app` in prod. No path or trailing slash.
- `TRUSTED_ORIGINS` — comma-separated extra preview origins.
- `INQUIRY_NOTIFY_TO` — team inbox receiving new-lead mails.
- `EMAIL_TRANSPORT=gmail_smtp`
- `GMAIL_SMTP_USER`, `GMAIL_SMTP_APP_PASSWORD`, optionally `EMAIL_FROM_NAME`.

## Quality checks

```bash
bun run lint
bun run typecheck
bun run format:check
bun run build
```

Full validation before PR / before merging Orny + Pal halves:

```bash
bun run check
bun run build
BASE_URL=http://localhost:3000 bun run verify:runtime
```

Merge checklist (Kabir): one CTA label everywhere, one navy / one gold-teal, identical card radius/spacing, hero + 2 sections visually approved, no fake stats/certs, form validates empty/invalid email, Convex + SMTP works locally, mobile 360px readable, Lighthouse + keyboard pass.

## Integration status (Kabir — do not push, local QA only)

- Unified `app/page.tsx` composition done: Navbar → Hero → About → Categories → Network → Trust → Contact → Footer, anchors `home/about/categories/network/trust/contact`.
- Kabir-owned additions: `lib/types/inquiry.ts` (frozen contract), `lib/utils/` (`cn`, `validation`), `lib/hooks/useSubmitInquiry.ts` (sole Convex entry-point), `lib/site.ts` (SEO/nav/contact source), `app/providers/convex-provider.tsx` (graceful when `NEXT_PUBLIC_CONVEX_URL` absent), `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, `app/opengraph-image.tsx`, `scripts/verify-runtime.mjs`, `vercel.json`, `docs/concept-deck.md`.
- Unification fixes: Part B emerald/neutral tokens remapped to navy/gold/teal; headlines aligned to spec (`What We Trade`, `From Global Source to Final Market`, `Built on Reliability and Compliance`, `Let's Talk Trade`); Trust fake-stats grid removed per content rule; Contact form now calls real `inquiries.submit` + includes phone field; single CTA label `Request a Quote` everywhere.
- QA (local, unpushed): `bun run check` (lint 0 errors + typecheck) ✓, `bun run format:check` (Kabir scope) ✓, `bun run build` ✓ (routes `/`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`), `BASE_URL=http://localhost:3100 bun run verify:runtime` ✓.
- Deploy wiring: Vercel `bun install --frozen-lockfile` + `bun run build` in `vercel.json`; set `NEXT_PUBLIC_CONVEX_URL` (+ `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_SITE_URL`) in Vercel env, `SITE_URL`/`INQUIRY_NOTIFY_TO`/SMTP vars via `bunx convex env set --prod`. Nothing pushed — test locally first.

## What to show tomorrow 3pm

- Business objective + page flow (credibility → capabilities → reach → inquiry)
- `UAE Trade Gateway` creative direction, palette, typography
- Hero concept (headline + CTAs + route visual)
- Full 8-section flow + initial wireframe or high-fidelity mockup of hero + 2 key sections
- Example category cards + network/logistics visualization concept
- Trust/compliance treatment + contact/lead-capture flow
- Stack + implementation approach + 4-person split above
- One-line summary: *A modern B2B trade gateway that uses the UAE's strategic position as the visual and narrative anchor, guiding visitors from credibility → capabilities → global reach → inquiry.*

## Deployment

1. Deploy backend schema and functions:

```bash
bunx convex deploy
```

2. Set production backend env:

```bash
bunx convex env set --prod SITE_URL https://your-domain.vercel.app
bunx convex env set --prod TRUSTED_ORIGINS https://your-preview.vercel.app
bunx convex env set --prod INQUIRY_NOTIFY_TO sales@your-company.ae
bunx convex env set --prod EMAIL_TRANSPORT gmail_smtp
bunx convex env set --prod GMAIL_SMTP_USER your-mailbox@gmail.com
bunx convex env set --prod GMAIL_SMTP_APP_PASSWORD
bunx convex env set --prod EMAIL_FROM_NAME "UAE Trade Gateway"
```

3. In Vercel project settings, set:

```dotenv
CONVEX_DEPLOYMENT=prod:<deployment-name>
NEXT_PUBLIC_CONVEX_URL=https://<deployment-name>.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://<deployment-name>.convex.site
```

4. Configure Vercel to install with `bun install --frozen-lockfile` and build with `bun run build`, then deploy. Redeploy after changing any `NEXT_PUBLIC_` value.

5. Confirm the final domain loads `/`, `#contact` submits, and team inbox + sender both receive mail. If form fails, check `SITE_URL` has only the final origin.

## Content rule

Until verified company info is available, use credible placeholder copy. Do not invent certifications, clients, transaction volumes, awards, statistics or specific partnerships.

## License

Copyright © Trading team. Internal company project — do not distribute or accept external contributions without company approval.
