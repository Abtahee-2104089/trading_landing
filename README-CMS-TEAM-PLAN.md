# CMS + Review Remediation — 4-Member Merged Team Plan

> Covers **Briefing Tasks 1 & 2** (full website + CMS where every image, product, text, service, address is CMS-editable; then share link + CMS credentials) **plus** the office verdict at `https://trading-landing-beta.vercel.app/` (2026-09-15, reviewer Touhidul Alan Seyam — **6.2/10**, "presentable demo, not a production site").

Do not push anything to GitHub until Kabir's QA gate passes. One repo, `main`-only releases, short-lived branches, PRs with Kabir as reviewer.

## 0. Why this plan exists — read before you code

Briefing is not done: content is still hardcoded (`lib/site.ts`, `TradingCategories.tsx` const, `Hero.tsx`/`About.tsx` copy, `public/categories/*` images). There is **no CMS, no `/admin`, no login** — so Task 1 ("all content editable through the CMS") and Task 2 ("share link + CMS credentials") can't be met.

Verdict is not optional: the same hardcoded state plus missing safeguards caused every P0 in the review. The reviewer explicitly notes polish came from OpenCode/model — what you still own is *judgment and verification*. This plan makes both tasks converge: the CMS *is* the fix for placeholder contacts/sitemap/Trust copy, and every verdict fix is implemented **as CMS-driven work** so editors never need code again.

```
Shawon (schema + safeguards + shared zod + seed + media) 
   ↓ frozen contract (shapes + zod)
Orny (A: Navbar/Hero/About/Footer CMS-driven + visuals/a11y)  ║  Pal (B: Categories/Network/Trust/Contact CMS-driven + /admin + analytics + form UX)
   ↓ both halves merged
Kabir (auth gate + build fail + headers + CI + deploy + QA + link/credentials handover)
```

## 1. CMS content map — every briefing item becomes a CMS entity

| Briefing item | Today (hardcoded) | CMS source of truth | Edited at | Primary owner |
|---|---|---|---|---|
| Site text (name, tagline, hero headline/sub/badge, section headlines, footer copy, CTA labels) | `lib/site.ts`, `Hero.tsx:49-65`, `About.tsx`, `Trust.tsx:2-27` | `siteSettings` single doc (`siteName, tagline, description, primaryCta, hero{ Badge, Headline, Sub, assurances[3] }, footer{ about, bottomBar }`) + `sections` docs (`key: hero|about|network|trust|contact|footer`, `eyebrow, headline, body`) | `/admin/site`, `/admin/sections` | Orny (chrome) + Pal (bodies) |
| Products (= Trading Categories, 6 cards) | `TradingCategories.tsx:3-46` const array | `products` (`title, slug, description, items[], imageStorageId?, imageUrlFallback, alt, sortOrder, isPublished, updatedAt`) idx `by_slug`, `by_sortOrder` | `/admin/products` | Pal |
| Services (= Global Network journey + capabilities) | `GlobalNetwork.tsx` hard steps/caps | `services` (`title, description, icon?, sortOrder, isPublished`) + `sections[key=network].steps[]` | `/admin/services`, `/admin/sections` | Pal |
| Images — hero, about map, 6 category cards, network map, logo/favicon | `public/categories/*.jpg`, `public/images/hero-gateway.svg`, `app/assets/*.jpg` (2.5 MB duplicates) | Convex Storage + `media` (`storageId, url, alt, usedBy, createdAt`) — every image field stores `storageId`, rendered with `next/image` via `next.config.ts` `remotePatterns` for `*.convex.cloud` | `/admin/media` (uploader) + each entity's image picker | Shawon (storage) → Orny/Pal (render) |
| Address / contact — office, email, phone, hours, response promise, WhatsApp | `lib/site.ts:9-14` → `site.contact` used in `Contact.tsx:62-83`, `Footer.tsx:42-57`, `layout.tsx:72-85` JSON-LD | `siteSettings.contact { office, email, phoneDisplay, phoneHref, whatsappHref?, hours?, responseNote }` — single source, no duplication | `/admin/site#contact` | Orny |
| Inquiries (leads) | `inquiries` + `mailOutbox`, `inquiries.submit` public | Keep tables; add admin-only wrappers `inquiriesAdmin.list`/`get`/`setStatus` (paginated, `internalQuery` stays) | `/admin/inquiries` (read-only table + status `new/contacted/qualified/closed`) | Shawon (wrappers) + Pal (UI) + Kabir (gate) |

Content rule stays: credible placeholder only until verified. Seed with **current live copy verbatim** (do not invent certs/clients/volumes/awards) — then editors replace Trust facts via CMS.

## 2. Verdict → owner map (so nothing slips)

| Verdict § & finding | Severity | CMS link | Owner | Done when |
|---|---|---|---|---|
| **P0-1 §4/§8: `inquiries.submit` open relay — spam/relay, quota burn** — no throttle/honeypot/CAPTCHA | P0 | — | **Shawon** (throttle table + honeypot check + category enum in `inquiries.ts`) + **Pal** (hidden honeypot field in `Contact.tsx`) | Script + rapid submits get `RATE_LIMITED`; honeypot-filled submit rejected silently; `mailOutbox` still logs |
| **P0-2 §8.3/§9.2/§10: placeholder contacts live** (`trade@example.ae`, `+971 4 000 0000` in `lib/site.ts:10-12`, JSON-LD `layout.tsx:84`, mailto/tel) | P0 | `siteSettings.contact` | **Shawon** (schema) + **Orny** (Navbar/Footer/Contact/JSON-LD read from CMS) + **Kabir** (prod seed with real contacts) | No `example.ae`/`000 0000`/`your-domain` string in prod bundle or HTML |
| **P0-3 §10.1: sitemap/robots/canonical/OG point to `https://your-domain.vercel.app`** because `NEXT_PUBLIC_SITE_URL` unset | P0 | `site.url` derived from env | **Kabir** (`lib/site.ts` + `next.config.ts`/`app/sitemap.ts` build fail when unset in prod) | `bun run build` fails without `NEXT_PUBLIC_SITE_URL` in prod; sitemap shows final domain |
| **P0-4 §9.1: zero analytics, no conversion event** | P0 | — | **Kabir** (GA4/Plausible or `vercel/analytics` + env `NEXT_PUBLIC_GA_ID`) + **Pal** (fire `generate_lead` on `status==='success'` in `Contact.tsx`) | Network shows analytics hit on submit; dashboard shows conversion |
| **P1-1 §5: no shared schema — `lib/types/inquiry.ts` vs `convex/inquiries.ts` vs `lib/utils/validation.ts` drift (company/phone required vs optional, no `category` enum check)** | P1 | shared `lib/schemas/inquiry.ts` | **Shawon** (`convex/inquiries.ts` imports zod) + **Kabir** (create `lib/schemas/inquiry.ts`, `z.infer` type) + **Pal/Orny** (form uses same schema) | One `inquirySchema`; `InquiryInput = z.infer`; server enforces `INQUIRY_CATEGORIES` enum; `bun run typecheck` catches drift |
| **P1-2 §9.3/§9.4: category links don't preselect; Phone/WhatsApp label with no `wa.me`** | P1 | `products.slug` + `contact.whatsappHref` | **Pal** (`TradingCategories` link `href="#contact?category=<slug>"` + `Contact.tsx` reads `searchParams`/hash + selects; render `wa.me` button when `whatsappHref` set) | Clicking "Enquire about Textiles" opens form with Textiles selected; WhatsApp button visible |
| **P1-3 §9.5/Trust: placeholder Trust copy + line "No invented certifications … placeholder copy until verified" ships to users** | P1 | `sections[key=trust]` CMS | **Pal** (make `Trust.tsx` CMS-driven, delete hardcoded `assurances` line) + **Kabir** (seed Trust with neutral verifiable copy; remove that bullet) | Trust renders from CMS; no placeholder disclaimer in prod |
| **P1-4 §3: hero SVG is weak (flat ship, blobs, animated dashes); about map similarly** | P1 | `siteSettings.heroImageStorageId` + `sections[hero/about].imageStorageId` | **Orny** (cut or replace `public/images/hero-gateway.svg` with Jebel-Ali photo or minimal abstract route; CMS image fallback; fix gold headline break `text-wrap: balance`) | Hero uses photo/minimal graphic; no `animate-route-dash` clip-art |
| **P1-5 §3/§6 a11y: form placeholder contrast fail (`placeholder:text-slate-400` `Contact.tsx:12`), 4 dead `tabIndex=0` in GlobalNetwork, no focus move on success** | P1 | — | **Orny** (placeholder `slate-500+`, header/logo a11y) + **Pal** (remove `tabIndex` from non-interactive `<article>`, move focus to success `h3` on submit via `ref` + `focus()`) | Lighthouse a11y ≥ 97 on mobile; tab order skips cards; success heading focused |
| **P1-6 §8.2: missing CSP/HSTS/Permissions-Policy** | P1 | — | **Kabir** (`vercel.json` headers + `next.config.ts` headers if needed) | `curl -I` shows `Content-Security-Policy`, `Strict-Transport-Security`, `Permissions-Policy` |
| **P2-1 §6: zero tests, no CI** (only `scripts/verify-runtime.mjs`) | P2 | — | **Shawon** (Convex `inquiries.submit` tests) + **Kabir** (unit tests for `lib/schemas/inquiry.ts`, Playwright happy path, `/.github/workflows/ci.yml` running `lint typecheck build test`) | `bun run check` + tests run in CI on every PR |
| **P2-2 §4 dead weight: `app/assets/` 2.5 MB duplicates (`Hardwarel.jpg` etc.), `lib/utils/cn.ts` unused, `lib/types/inquiry.ts` duplicate types after zod, `use-contact-submit.ts` shim, `public/file.svg/next.svg` etc., `Geist_Mono` unused, `TRUSTED_ORIGINS` documented but unread, `noValidate={false}`, `biome-ignore`** | P2 | — | **Kabir** (delete list + verify `bun run build` + `grep` no imports) + **Pal/Orny** (remove their dead imports) | `du -sh app/assets` gone; `rg "cn\(|Geist_Mono|TRUSTED_ORIGINS" → 0 hits` |
| **P2-3 §4/§11: Navbar hardcodes nav duplicating `site.nav`; git identities split (`Pratyush112`/`Prashanta`); branch names ignored; 1-commit PRs** | P2 | `site.nav` CMS | **Orny** (Navbar reads `siteSettings.nav`/`site.nav`) + **Kabir** (`.github/pull_request_template.md`, `CONTRIBUTING.md`, unify git `user.name/email`, enforce review) | Navbar has single nav source; PR template + branch naming enforced |
| **§4 nits: `err.message` leaks internal paths (`lib/hooks/useSubmitInquiry.ts`); `emailStatus` set `failed` if either mail fails even when team notify succeeded; silent `slice` truncation; favicon still Next.js default** | P2 | — | **Shawon** (sanitize error map + per-mail `emailStatus` or `teamNotified/senderAcked` flags) + **Orny** (export `app/icon.tsx` / real `favicon.ico` from `siteName` "U" tile) + **Kabir** (remove silent truncation → `VALIDATION_ERROR` on over-length) | User sees "Something went wrong, try again" not paths; favicon shows brand mark |

## 3. Ownership & branches (do not edit outside your folders without chat)

| Member | Role | Owns (verdict fixes bold) | Branch |
|---|---|---|---|
| **Shawon Bhattacharjee** | Backend — CMS schema, media, inquiry hardening, shared zod, seed | `convex/schema.ts`, `convex/cms.ts`, `convex/media.ts`, `convex/rateLimit.ts`, `convex/seed.ts`, `convex/inquiries.ts`, `convex/emails.ts`, `lib/schemas/inquiry.ts` (with Kabir), **tests `convex/*.test.ts`** | `feat/cms-backend-hardened` |
| **Noore Tamanna Orny** | Frontend A — CMS chrome + visuals + a11y +dead code in her areas | `lib/hooks/useSiteContent.ts`, `app/components/layout/navbar/`, `app/components/hero/`, `app/components/about/`, `app/components/footer/`, `app/components/ui/`, `app/icon.tsx`/`favicon.ico`, `public/images/` | `feat/cms-frontend-a-chrome` |
| **Prashanta Pal** | Frontend B + Admin — CMS sections + `/admin` + form UX + analytics event + trust | `app/components/trading-categories/`, `app/components/global-network/`, `app/components/trust/`, `app/components/contact/`, `app/admin/**`, `app/components/admin/**`, `lib/hooks/useSubmitInquiry.ts` (honeypot + preselect) | `feat/cms-frontend-b-admin` |
| **Md. Abtahee Kabir** | Integration, auth, build guard, headers, CI, deploy, QA, handover (Task 2) | `app/layout.tsx`, `app/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `middleware.ts`, `convex/auth.config.ts`, `convex/auth.ts`, `lib/site.ts`, `lib/schemas/inquiry.ts` (frozen), `next.config.ts`, `vercel.json`, `.github/**`, env/prod, seed run | `chore/cms-auth-deploy` |

Order: **Shawon → Orny + Pal (parallel) → Kabir (gate + deploy)**. Shawon freezes the contract first (Slack the shapes + zod export).

Frozen contract v2 (Shawon publishes, everyone imports — no duplication):

```ts
// lib/schemas/inquiry.ts — single zod source of truth
export const INQUIRY_CATEGORIES = ["General enquiry","Electronics & Electrical","Foodstuff & Agro Commodities","Textiles & Garments","Building Materials & Hardware","Cosmetics & Personal Care","Auto Parts & Industrial"] as const;
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(40).optional().default("").refine(v=>!v||/^[+()\-. \d]{6,40}$/.test(v), "Invalid phone"),
  category: z.enum(INQUIRY_CATEGORIES), // P1-1: server enforces; no more "any string"
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(), // honeypot P0-1: must be empty
});
export type InquiryInput = z.infer<typeof inquirySchema>; // replaces lib/types/inquiry.ts InquiryInput

// convex/cms.ts public (no login)
siteSettings.get -> SiteSettingsDoc   // includes contact{ office,email,phoneDisplay,phoneHref,whatsappHref,hours,responseNote } + hero + footer
sections.getAll -> SectionDoc[]       // key hero|about|network|trust|contact|footer
products.listPublished -> ProductDoc[] // isPublished + sortOrder asc
services.listPublished -> ServiceDoc[]

// convex/cms.ts admin (requireAdmin)
siteSettings.update(patch) -> null
sections.upsert({key, eyebrow, headline, body, steps?, imageStorageId?}) -> null
products.create/update/remove -> {id}    // slug unique, isPublished soft-toggle
services.create/update/remove -> {id}
media.generateUploadUrl() -> string
media.save({storageId, alt, usedBy}) -> {url}
inquiriesAdmin.list / setStatus         // admin-only wrappers
```

Shared CMS types live in `lib/types/cms.ts` (Kabir creates, everyone imports).

---

## 4. Member 1 — Shawon Bhattacharjee — Backend, hardening, shared zod, seed

*Goal:* CMS is complete and the inquiry endpoint is no longer an open relay. One zod schema is the only validator.

1. Setup:
   ```bash
   git checkout main; git pull origin main
   git checkout -b feat/cms-backend-hardened
   bun install; bunx convex dev  # keep in 2nd terminal
   ```
2. `lib/schemas/inquiry.ts` — create with Kabir (you own the Convex side). Export `inquirySchema`, `INQUIRY_CATEGORIES`, `InquiryInput`. Add `website` honeypot field (hidden input). Install `zod` if missing (`bun add zod`). This single file replaces `lib/types/inquiry.ts` + `lib/utils/validation.ts` client/server duplication (P1-1).
3. `convex/schema.ts` — extend without breaking `inquiries`/`mailOutbox`:
   - `siteSettings` as §1 (include `whatsappHref`), `sections` with `by_key`, `products`/`services` with `by_slug`/`by_sortOrder`, `media` with `by_storageId`.
   - **New `rateLimits` table** for P0-1: `{ key: string, count: number, windowStart: number }` indexed `by_key` where `key = ip:<hash> | email:<normalized>` . TTL window 60s/10m (pick one, document).
   - Keep `inquiries` emailStatus but add `teamNotified: boolean` / `senderAcked: boolean` or keep dual flag so triage not misled (§4 Low).
4. `convex/cms.ts` — public queries return `[]`/fallback doc never throw (public page renders on empty DB); admin mutations `requireAdmin` (stub until Kabir wires real auth), validate lengths, slugify + unique slug, trim HTML, plain text only.
5. `convex/media.ts` — `generateUploadUrl` → `ctx.storage.generateUploadUrl()`, `save` → `ctx.storage.getUrl` + `media` insert, `remove` deletes storage+row. Cap type/size (jpg/png/webp/svg ≤5 MB).
6. **P0-1 + P1-1 in `convex/inquiries.ts`:**
   - Switch `submit` to `v.object(inquirySchema.shape)` via Convex zod integration or manual `inquirySchema.parse(args)` at handler top (if Convex zod helper unavailable, parse + map `ZodError` → `ConvexError VALIDATION_ERROR`).
   - Honeypot: if `args.website?.trim()` non-empty → silently return success without insert/mail (don't tip bots).
   - Throttle: `key = email:${email}` and `key = ip:${ctx.auth? + x-forwarded-for fallback}` — look up `rateLimits`, if `count ≥ 5/min` or `≥ 20/hour` throw `RATE_LIMITED`. Increment on success. Create `convex/rateLimit.ts` helper (`checkRateLimit`, `increment`).
   - Enforce `category` enum strictly — reject any non-`INQUIRY_CATEGORIES` value (fixes §5.3 comment that promised but didn't).
   - Remove silent `slice` truncation — throw `VALIDATION_ERROR` instead when over max (fixes §4 Low).
   - Do not leak internal paths: `fail()` messages are user-safe only.
7. **P2 nits in `convex/emails.ts` + `convex/inquiries.ts`:** sanitize `safeError` already exists — ensure `useSubmitInquiry` never shows `err.message` raw (coordinate with Pal); split `emailStatus` or add `teamNotified/senderAcked` so partial success not flagged `failed` when team mail succeeded.
8. `convex/seed.ts` (`internalMutation`, idempotent): insert current hardcoded content **verbatim** from `lib/site.ts`, `Hero.tsx`, `TradingCategories.tsx`, `GlobalNetwork.tsx`, `Trust.tsx`, `Contact.tsx`, `Footer.tsx` — then overwrite `contact` with real placeholder-removed values once Kabir provides them (or leave CMS-editable and note TODO). Skip if `siteSettings` exists.
9. Admin wrappers: `listInquiriesAdmin` (paginated desc), `setInquiryStatusAdmin` (enum check) — both `requireAdmin`.
10. Tests (P2-1, part 1): `convex/inquiries.test.ts` with `convex-test` — valid payload, invalid email, oversized category (enum reject), honeypot filled, rate-limit second call blocked. `lib/schemas/inquiry.test.ts` for phone/category edge cases.
11. Verify:
    ```bash
    bun run lint; bun run typecheck
    bunx convex test  # or bun run test
    # in dashboard: run seed, test generateUploadUrl flow, submit with bad category → expect VALIDATION_ERROR
    ```
12. Commit only `convex/` + `lib/schemas/`:
    ```bash
    git add convex/schema.ts convex/cms.ts convex/media.ts convex/rateLimit.ts convex/inquiries.ts convex/emails.ts convex/seed.ts lib/schemas/inquiry.ts convex/*.test.ts
    git commit -m "feat: CMS schema, hardened inquiry (zod enum+honeypot+throttle), media, seed"
    git push -u origin feat/cms-backend-hardened
    ```
    PR `[Shawon] CMS schema + hardened inquiry + media + seed`, request Kabir review, paste frozen contract in chat.

Acceptance: public queries empty-DB safe; `category: "hacked"` rejected; honeypot blocked; 6th rapid submit rate-limited; `bun run check` + `build` green; no secrets in repo.

### Manual testing — Shawon (do this before opening PR, ~15 min)

1. Empty-DB public reads (page must not crash):
   ```bash
   # in Convex dashboard → Data: delete all siteSettings/sections/products/services docs, then run:
   bunx convex run cms:getSiteSettings
   bunx convex run cms:getSections
   bunx convex run cms:listPublishedProducts
   bunx convex run cms:listPublishedServices
   # expect: single fallback doc / [] — never an error
   ```
2. Seed once + verify idempotency:
   ```bash
   bunx convex run seed:seedCms
   bunx convex run cms:getSiteSettings  # copy siteName
   bunx convex run seed:seedCms          # run again → same count, no duplicates
   ```
   Dashboard → Data → `siteSettings` should have exactly 1 doc, `products` 6 docs.
3. Hardened `inquiries.submit` — category enum + honeypot + throttle (Convex dashboard → Functions, or CLI):
   ```bash
   # a) bad category must reject
   bunx convex run inquiries:submit '{"name":"Test User","email":"test@example.com","category":"hacked","message":"need 100 units of rice"}'
   # expect: VALIDATION_ERROR / category enum error

   # b) honeypot filled must silently succeed WITHOUT insert/mail
   bunx convex run inquiries:submit '{"name":"Bot","email":"bot@example.com","category":"General enquiry","message":"spam spam spam spam","website":"http://spam.com"}'
   # expect: { id } returned, but Data → inquiries count unchanged, mailOutbox unchanged

   # c) valid payload succeeds
   bunx convex run inquiries:submit '{"name":"Ahmed Khan","email":"ahmed@test.com","category":"Textiles & Garments","message":"need 500 thobes to Dubai"}'
   # expect: { id }, new row in inquiries with status=new, 2 rows in mailOutbox

   # d) throttle: repeat (c) 6x rapidly with same email → 6th must throw RATE_LIMITED
   for i in 1 2 3 4 5 6; do bunx convex run inquiries:submit "{\"name\":\"Spam $i\",\"email\":\"throttle@test.com\",\"category\":\"General enquiry\",\"message\":\"throttle test message $i\"}"; done
   ```
4. Media upload flow (needs `bun dev` + dev Convex):
   ```ts
   // paste in browser console on http://localhost:3000 (dev), or a scratch client component:
   import { useMutation } from "convex/react";
   import { api } from "@/convex/_generated/api";
   const generateUrl = useMutation(api.media.generateUploadUrl);
   const save = useMutation(api.media.save);
   const file = (document.querySelector('input[type=file]') as HTMLInputElement).files![0];
   if (file.size > 5*1024*1024) throw new Error("file > 5MB — pick smaller");
   const url = await generateUrl();
   const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
   const { storageId } = await res.json();
   const { url: publicUrl } = await save({ storageId, alt: "manual test image", usedBy: "manual-test" });
   console.log("renders at:", publicUrl);
   // expect: publicUrl https://*.convex.cloud/... ; open it → image shows; Data → media has 1 row
   ```
5. Admin-wrapper auth stub check: `bunx convex run inquiriesAdmin:list '{"paginationOpts":{"numItems":5,"cursor":null}}'` must fail for anonymous (UNAUTHORIZED / requireAdmin) and pass after Kabir wires admin login.

## 5. Member 2 — Noore Tamanna Orny — Frontend A: CMS chrome + visuals + a11y

*Goal:* every text/image/address in Navbar/Hero/About/Footer is CMS-editable; hero no longer cheapens the page; a11y gaps closed.

1. Setup after Shawon merges (or `git merge origin/feat/cms-backend-hardened` for types):
   ```bash
   git checkout main; git pull origin main
   git checkout -b feat/cms-frontend-a-chrome
   bun install; bunx convex dev; bun dev
   ```
2. Shared read layer (with Kabir if not yet there):
   - `lib/types/cms.ts` types matching Shawon's validators (import, don't duplicate).
   - `lib/hooks/useSiteContent.ts`: `useSiteSettings()`, `useSections()` via `useQuery(api.cms.*)` with `{ data, isLoading }` + fallback constants (`fallbackSite` = today's `lib/site.ts` values) so page never blanks when CMS empty/Convex URL missing.
3. Refactor (presentational only — no `useMutation` to CMS):
   - `layout/navbar/` — **P2-3:** delete hardcoded nav array, read `siteSettings.nav` / `site.nav` single source; logo label/CTA from `siteSettings.siteName`/`primaryCta`; anchors stay `#about #categories #network #trust #contact`. Fix accessible name spacing (logo `aria-label` with space).
   - `hero/` — **P1-4:** badge/headline/sub/assurances/CTAs/image+alt all from `siteSettings`+`sections[hero]`. Replace `public/images/hero-gateway.svg` clip-art: either a Jebel Ali dawn photo (optimized via `next/image`, `priority`, `sizes`) or a minimal abstract route graphic without ship/blobs/dashes — delete `animate-route-dash` if keeping SVG. Fix gold headline line break (`text-balance` already there — test at 390px). Image: `imageStorageId` URL if present else local fallback.
   - `about/` — eyebrow/headline/body/bullets + map visual from `sections[about]` CMS. Same image-storage pattern.
   - `footer/` — identity/Explore/ `contact.office/email/phoneDisplay/phoneHref/whatsappHref`/CTA/bottomBar all from `siteSettings`. Add WhatsApp link rendering when `whatsappHref` exists (coordinate with Pal's wa.me format).
   - **P1-5 a11y:** placeholder contrast — change `placeholder:text-slate-400` to `placeholder:text-slate-500` or darker (test ratio ≥ 4.5:1); ensure header gold tile contrast passes; keep `Container/SectionHeading/Button`, ids `home/about`.
   - **P2-2:** delete `Geist_Mono` import if unused ( `app/layout.tsx:4,13` ) — keep only `Geist`; verify no import of `lib/utils/cn.ts` from your components.
   - **Favicons (P2 nit):** create `app/icon.tsx` or real `public/favicon.ico` from the gold "U" tile so tab no longer shows Next.js default.
   - `next.config.ts` remotePatterns: propose pattern to Kabir in chat (e.g. `{ protocol: "https", hostname: "**.convex.cloud" }`), don't edit config yourself — he owns it.
4. Verify:
   ```bash
   git status  # only your folders + lib/hooks
   bun run lint; bun run typecheck
   bun dev     # unset NEXT_PUBLIC_CONVEX_URL once to confirm fallbacks render; Lighthouse check placeholder contrast + tab favicon
   ```
5. Push + PR:
   ```bash
   git add lib/hooks/useSiteContent.ts app/components/layout/navbar app/components/hero app/components/about app/components/footer app/components/ui app/icon.tsx public/images
   git commit -m "feat: CMS-driven chrome, hero refresh, a11y and favicon fixes"
   git push -u origin feat/cms-frontend-a-chrome
   ```
   PR `[Orny] CMS chrome + hero + a11y`. Demo: edit hero headline in Convex dashboard → refresh → new text; show before/after hero at 390px.

Acceptance: seeded CMS → page identical to today except hero improved; empty CMS → fallbacks render; no dead imports; favicon branded; contrast passes.

### Manual testing — Orny (do this before opening PR, ~20 min)

1. Fallback render (CMS empty / backend missing):
   ```bash
   bun dev
   # Test A: seeded — http://localhost:3000 looks identical (except hero image)
   # Test B: kill backend — in a 2nd terminal:
   # PowerShell: $env:NEXT_PUBLIC_CONVEX_URL=""; bun dev --port 3001
   # open http://localhost:3001 → Navbar/Hero/About/Footer still render via fallbackSite constants, no blank section, no console crash
   ```
   Snippet you are verifying (`lib/hooks/useSiteContent.ts` pattern):
   ```ts
   // each hook must follow this shape — data OR fallback, never undefined UI:
   export function useSiteSettings() {
     const data = useQuery(api.cms.getSiteSettings);
     if (data === undefined) return { data: fallbackSite, isLoading: true };
     return { data: data ?? fallbackSite, isLoading: false };
   }
   // manual check: add console.log(data) → seeded = CMS doc, empty = fallbackSite
   ```
2. Live CMS edit → homepage updates:
   ```
   Convex dashboard → Data → siteSettings → edit heroHeadline to "TEST HEADLINE 123" → Save
   → refresh http://localhost:3000 → Hero <h1> shows TEST HEADLINE 123
   → revert the edit → refresh → original back
   Same for: Footer → siteSettings.contact.office → footer + contact block update
   ```
3. Image fallback check:
   ```tsx
   // Hero image render rule you must keep:
   const src = siteSettings.heroImageUrl ?? "/images/hero-gateway.svg";
   // manual: delete heroImageStorageId in dashboard → hero shows local SVG/photo fallback
   // upload new hero via /admin/media → paste storage URL → hero shows Convex URL, no next/image error
   // if you see "Invalid src prop / hostname not configured" → ping Kabir with the hostname for remotePatterns
   ```
4. A11y + visual pass (no tools to install):
   ```bash
   # Chrome DevTools → Lighthouse → Mobile → check Accessibility ≥ 97
   # Keyboard only: Tab from top → Skip to content → nav links → Hero CTAs → footer links. Focus ring visible each stop.
   # 390px width (Device toolbar → iPhone 12): gold headline wraps cleanly, no horizontal scroll, favicon shows gold "U" not Next.js logo
   # Contrast spot-check: placeholder text in any input must be slate-500 or darker (inspect → placeholder:text-slate-500)
   ```

## 6. Member 3 — Prashanta Pal — Frontend B + Admin panel + form UX + analytics

*Goal:* products/services/trust/contact are CMS-driven; editors can do every briefing item from `/admin` (not dashboard); form is safe and measurable.

Part B1 — public sections (same fallback discipline):

1. Setup:
   ```bash
   git checkout main; git pull origin main
   git checkout -b feat/cms-frontend-b-admin
   bun install; bunx convex dev; bun dev
   ```
2. Refactor to CMS queries:
   - `trading-categories/` — render `products.listPublished` (title/desc/`items[]`/image/alt). **P1-2:** `Enquire` link = `#contact?category=<slug>` (use `encodeURIComponent(slug)`; keep `→`). Empty: "No categories published yet." Optimize images: correct `sizes`, no oversized sources (§3). Delete duplicate `app/assets/` refs if any.
   - `global-network/` — **P1-5:** journey steps + caps from `sections[network].steps[]` + `services.listPublished`. **Remove `tabIndex={0}` from the 4 non-interactive `<article>`** (`GlobalNetwork.tsx:57`).
   - `trust/` — **P1-3:** eyebrow/headline/body from `sections[trust]` CMS. **Delete** `assurances` array line `"No invented certifications… placeholder copy until verified"` (`Trust.tsx:24`) — that line must never ship. Keep 4 pillars CMS-editable; no stats grid.
   - `contact/` — **P0-1 + P1-1 + P1-2 + P1-5 + P0-4:**
     - Headline/response-note/contacts from CMS.
     - **P1-1:** import `inquirySchema` from `lib/schemas/inquiry.ts` for client validation (replace hand regex); keep server authoritative.
     - **P0-1:** add hidden honeypot `<input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true">` and include `website` in payload.
     - **P1-2:** on mount read `window.location.hash`/`searchParams.get("category")` → set `<select>` value; also handle `?category=` URL. Keep `INQUIRY_CATEGORIES` from `lib/schemas/inquiry.ts` (single source).
     - **P1-5:** fix `placeholder:text-slate-400` → `slate-500+` (`Contact.tsx:12`), remove `noValidate={false}` (or set `noValidate` properly), **move focus to success `<h3>` on submit** (`useRef` + `ref.current?.focus()` with `tabIndex={-1}`), ensure per-field errors render, button disables while `submitting`.
     - **P0-4:** on `status==='success'` fire analytics conversion: `window.gtag?.('event','generate_lead',{category})` or `plausible('Lead')` — guard if undefined. Coordinator: Kabir provides `NEXT_PUBLIC_GA_ID`.
     - Sanitize error display: map `err.code === 'RATE_LIMITED'` → "Too many requests, try again in a minute." else generic "Something went wrong." — **never raw `err.message`** (P2 nit).
     - **P1-2 WhatsApp:** render `wa.me` button beside phone line when `siteSettings.contact.whatsappHref` present (`https://wa.me/<digits>`).
   - Keep anchors `categories/network/trust/contact`. Keep single CTA label `site.primaryCta`.

Part B2 — `/admin` panel (editors' CMS, behind Kabir's gate — render "Sign in required" until wired):

3. Routes under `app/admin/` (all client components):
   - `/admin` dashboard: links + counts (`products`, `services`, `inquiries new`).
   - `/admin/site` — one form for `siteSettings` (**this is where P0-2 placeholder fix happens for editors**: site name, tagline, CTAs, footer copy, full `contact` block `office/email/phoneDisplay/phoneHref/whatsappHref/hours/responseNote`). Validate email/phone shape.
   - `/admin/sections` — editor per `key` (eyebrow, headline, body textarea, `steps[]` list editor for `network`).
   - `/admin/products` — table (title/slug/published/sortOrder) + create/edit dialog (title→auto-slug, desc, `items[]` tag input, image uploader, alt, sortOrder, published toggle). Unpublish ( `isPublished=false` ), never hard-delete v1.
   - `/admin/services` — same, smaller form.
   - `/admin/media` — grid of `media` + uploader (`generateUploadUrl` → `fetch POST file` → `save`) + copy-URL.
   - `/admin/inquiries` — read-only table (name/category/status pill/date) + drawer + status changer. No emails in URL.
4. Image uploader (use everywhere):
   ```ts
   const url = await generateUploadUrl();
   const r = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
   const { storageId } = await r.json();
   const { url: publicUrl } = await saveMedia({ storageId, alt, usedBy: `products/${slug}` });
   ```
   Validate type/size before upload, show preview, store `storageId`+`url`.
5. **P2-2 cleanup in your areas:** delete `use-contact-submit.ts` shim (re-export) if redundant after zod; remove `public/file.svg` etc. refs; ensure no `lib/utils/cn.ts` imports.
6. Verify + push (small commits per page):
   ```bash
   bun run lint; bun run typecheck; bun dev
   # click every admin form: create product → homepage shows it; unpublish → hidden; bad category → field error; honeypot filled → silently blocked
   git add app/components/trading-categories app/components/global-network app/components/trust app/components/contact app/admin app/components/admin lib/hooks/useSubmitInquiry.ts
   git commit -m "feat: CMS sections, admin CRUD, honeypot+preselect+wa.me+a11y, analytics event"
   git push -u origin feat/cms-frontend-b-admin
   ```
   PR `[Pal] CMS sections + /admin + form hardening`. Include GIFs: product edit→homepage, category preselect, honeypot.

Acceptance: every briefing item editable from `/admin` zero code; Trust no longer ships placeholder disclaimer; category links preselect; focus moves to success; analytics event fires; a11y tab order clean.

### Manual testing — Pal (do this before opening PR, ~30 min)

1. Public sections CMS-driven + empty state:
   ```
   http://localhost:3000 → Categories shows 6 cards from products.listPublished
   Dashboard → Data → products → set all isPublished=false → refresh → section shows "No categories published yet." (no crash)
   → re-publish → cards back. Same for /admin/services → Global Network caps.
   ```
2. Category preselect (P1-2):
   ```
   Click "Enquire about Textiles & Garments" card link → URL becomes /#contact?category=textiles-garments (or #contact?category=...)
   → contact <select> already shows "Textiles & Garments". Repeat for all 6 cards.
   Manual fallback: paste http://localhost:3000/#contact?category=Cosmetics%20%26%20Personal%20Care → select preselected.
   ```
   Snippet you are verifying in `Contact.tsx`:
   ```tsx
   // on mount: read hash OR search param, match against INQUIRY_CATEGORIES
   useEffect(() => {
     const raw = window.location.hash.split("category=")[1]
       ?? new URLSearchParams(window.location.search).get("category");
     const slug = decodeURIComponent(raw ?? "");
     const match = INQUIRY_CATEGORIES.find(c => c.toLowerCase().replace(/[^a-z0-9]+/g,"-") === slug.toLowerCase() || c === slug);
     if (match) setCategory(match);
   }, []);
   ```
3. Honeypot + validation + error sanitizing (P0-1):
   ```html
   <!-- DevTools → Elements: confirm hidden field exists inside <form> -->
   <input name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
   ```
   ```
   Fill form normally → submit → success panel "Message received".
   DevTools trick: un-hide honeypot (remove .hidden), type "spam", submit → silently "succeeds" but no new row in inquiries table.
   Submit with category tampered via DevTools (option value="hacked") → field error "Please choose a valid category", no crash.
   Force offline (DevTools → Network → Offline) → submit → error reads "Something went wrong." NOT a raw path like lib/hooks/...
   ```
4. Focus move + tab order (P1-5):
   ```tsx
   // success heading must be focusable + focused on submit:
   const successRef = useRef<HTMLHeadingElement>(null);
   useEffect(() => { if (status === "success") successRef.current?.focus(); }, [status]);
   <h3 ref={successRef} tabIndex={-1}>Message received</h3>
   ```
   ```
   Submit valid enquiry → keyboard focus jumps to "Message received" (screen reader announces it).
   Tab through Global Network cards → cards are SKIPPED (tabIndex={0} removed), only links/buttons stop.
   ```
5. `/admin` CRUD round-trip (per entity, 2 min each):
   ```
   /admin/products → Create "TEST Mango Pulp" (title auto-fills slug test-mango-pulp, add 2 items, upload jpg ≤5MB, alt filled, sortOrder 99, published ON) → Save
   → homepage shows new card at end; edit → rename → refresh → renamed; toggle published OFF → card disappears; delete never (unpublish only).
   /admin/site#contact → change phoneDisplay → Navbar/Footer/Contact + JSON-LD all change (View Source → no old number).
   /admin/media → upload → Copy URL button → paste in new tab → image loads.
   /admin/inquiries → open a row → drawer shows detail (email visible only here, never in URL) → set status contacted → pill updates.
   ```
6. Analytics event (P0-4, with Kabir's GA id):
   ```ts
   // in Contact.tsx after status === "success":
   useEffect(() => {
     if (status === "success") {
       (window as any).gtag?.("event", "generate_lead", { category });
       // or: (window as any).plausible?.("Lead");
     }
   }, [status]);
   ```
   ```
   DevTools → Network → filter "collect" / "g/collect" → submit form → 1 analytics hit with en=generate_lead. No hit on failed submit.
   ```

## 7. Member 4 — Md. Abtahee Kabir — Auth, build guard, headers, CI, dead-weight purge, deploy & Task 2 handover

*Goal:* only staff open `/admin`; prod can never ship placeholder domain/contacts again; CI catches drift; site + CMS live on one link.

1. Setup:
   ```bash
   git checkout main; git pull origin main
   git checkout -b chore/cms-auth-deploy
   bun install
   ```
2. **P1-1 shared zod (frozen):** create `lib/schemas/inquiry.ts` with Shawon (you freeze it); make `lib/types/inquiry.ts` re-export `InquiryInput/InquiryCategory` from it or delete duplicate types (P2-2). Everyone imports from `lib/schemas/`.
3. **Auth — pick one (A recommended):**
   - **A: Convex Auth + Password.** `bun add @convex-dev/auth` + `convex/auth.ts` + `convex/auth.config.ts`, `users` table, `ADMIN_EMAILS` env allowlist, `isAdmin(ctx)` / `requireAdmin(ctx)` helper; wrap every admin mutation + `media.*` + `inquiriesAdmin.*` with it. Seed one admin user via dashboard, strong random password. Add `app/admin/login/page.tsx` (email+password), `app/admin/layout.tsx` gate (redirect to `/admin/login` when unauthenticated), sign-out button. Never expose hashes/SMTP/`ADMIN_*` to client.
   - B fallback (if time): `middleware.ts` gating `/admin/*` on `ADMIN_TOKEN` cookie + `adminSecret` arg on each admin mutation — document as temporary.
4. **P0-3 build guard:** in `lib/site.ts` (or `next.config.ts`/`app/sitemap.ts`) throw at build when `!process.env.NEXT_PUBLIC_SITE_URL` and `process.env.NODE_ENV==='production'` / `VERCEL_ENV==='production'` — so sitemap/robots/canonical/OG/JSON-LD never point at `your-domain.vercel.app` again. Keep fallback domain only for `bun dev`.
5. **P1-6 + §8.2 headers:** `vercel.json` (and `next.config.ts:headers()` if CSP needs nonce) add:
   ```json
   { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; img-src 'self' data: https: *.convex.cloud; connect-src 'self' https://*.convex.cloud wss://*.convex.cloud" },
   { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
   { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
   ```
   Keep existing `nosniff/frame DENY/referrer`. Test with `curl -I`.
6. **P0-4 analytics wiring:** add `@vercel/analytics` or GA4 `gtag` script in `app/layout.tsx` gated on `NEXT_PUBLIC_GA_ID`; set `NEXT_PUBLIC_GA_ID` in Vercel env; coordinate `generate_lead` event name with Pal.
7. **P2-1 CI:** create `.github/workflows/ci.yml` (30 lines):
   ```yaml
   name: ci
   on: [pull_request]
   jobs:
     check:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: oven-sh/setup-bun@v2
         - run: bun install
         - run: bun run lint
         - run: bun run typecheck
         - run: bun run build
         - run: bun run test --if-present
   ```
   Add unit tests for `lib/schemas/inquiry.test.ts` and one Playwright e2e `e2e/enquiry.spec.ts` (load → fill → submit → success). Share `scripts/verify-runtime.mjs` still runs.
8. **P2-2 dead-weight purge:** delete `app/assets/` (2.5 MB duplicates — `public/categories/*` is canonical; fix typo filenames), `lib/utils/cn.ts` (grep 0 imports), `public/file.svg`/`next.svg`/`globe.svg`/`window.svg` if unused, `INQUIRY_CATEGORIES` duplicate after zod, `use-contact-submit.ts` shim if redundant, `biome-ignore` comment (`layout.tsx:96`), `TRUSTED_ORIGINS` docs if unread or wire it, `Geist_Mono` if unused. `bun run build` must still pass; `rg "from.*cn|Geist_Mono|Hardwarel|CommoditiestT" --no-ignore` → 0.
9. **P2-3 process:** unify `lib/site.ts` as fallback-only re-export of CMS data (merge Orny+Pal `site.nav`); consolidate git identities (`.mailmap` or `git config user.name/email` for `Pratyush112`/`Abtahee-2104089`), add `.github/pull_request_template.md` enforcing branch naming (`feat/cms-*`/`chore/cms-*`), `app/page.tsx`/`globals.css`/`lib/site.ts` Kabir-owned — PR template requires 1 non-author review.
10. **Integration:** own `app/layout.tsx`, `app/page.tsx` composition, `app/providers/convex-provider.tsx` (ConvexAuthProvider if using Convex Auth), `app/sitemap.ts`/`robots.ts`/`manifest.ts` (now using real `NEXT_PUBLIC_SITE_URL`), `next.config.ts` `remotePatterns`, `middleware.ts`. Resolve Orny+Pal conflicts yourself.
11. **Prod deploy:**
    ```bash
    bunx convex deploy
    bunx convex env set --prod SITE_URL https://<final-domain>
    bunx convex env set --prod NEXT_PUBLIC_SITE_URL https://<final-domain>  # or Vercel env only — pick one and document
    bunx convex env set --prod INQUIRY_NOTIFY_TO <real-team-inbox>  # P0-2: replace example.ae everywhere
    bunx convex env set --prod EMAIL_TRANSPORT gmail_smtp
    bunx convex env set --prod GMAIL_SMTP_USER <mailbox>
    bunx convex env set --prod GMAIL_SMTP_APP_PASSWORD   # paste interactively, never commit
    bunx convex env set --prod EMAIL_FROM_NAME "UAE Trade Gateway"
    bunx convex env set --prod ADMIN_EMAILS <staff@mail>
    bunx convex env set --prod NEXT_PUBLIC_GA_ID <ga-id>  # P0-4
    # Vercel env: CONVEX_DEPLOYMENT, NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_CONVEX_SITE_URL, NEXT_PUBLIC_SITE_URL=https://<final-domain>
    bun run check; bun run build; BASE_URL=http://localhost:3000 bun run verify:runtime
    # push main → Vercel auto-deploys (bun install + bun run build, NOT --frozen-lockfile)
    # then run convex seed once against prod + create admin login
    ```
12. **QA gate (must all pass before handover):**
    - [ ] Homepage renders from CMS; edit site name/product/service/image/address/Trust in `/admin` → public refresh shows it; unpublish product → hidden.
    - [ ] `curl /sitemap.xml` + `/robots.txt` + view source JSON-LD/canonical/OG show final domain, no `your-domain`/`example.ae`/`000 0000`.
    - [ ] Lighthouse mobile a11y ≥97, no placeholder contrast fail, tab order skips GlobalNetwork cards, focus lands on success heading.
    - [ ] `inquiries.submit` rejects bad category, honeypot blocked, 6th rapid submit rate-limited, `wa.me` works, category preselect works.
    - [ ] `/admin` without login redirects; non-admin cannot mutate (`UNAUTHORIZED`); analytics `generate_lead` fires.
    - [ ] `rg "your-domain|example\.ae|000 0000" dist -n` → 0; `bun run check` + `build` + `verify:runtime` green; headers present.
13. **Task 2 handover (private channel only — never in git/chat logs):** site + CMS link + credentials + cheat-sheet, then rotate temp password after confirmation.
    > Website: `https://<final-domain>` · CMS: `https://<final-domain>/admin` · Login: `<admin-email>` / `<temp-password>` (change on first login; do not share publicly) · Editor guide: site text → `/admin/site`, products → `/admin/products`, address/WhatsApp → `/admin/site#contact`, Trust proof → `/admin/sections#trust`.

### Manual testing — Kabir (QA gate, do all before handover, ~30 min)

1. Auth gate (`/admin` locked):
   ```
   Incognito → http://localhost:3000/admin → redirects to /admin/login (no flash of data).
   Login with non-admin email → try siteSettings.update in console → expect UNAUTHORIZED, no write.
   Login with admin email → /admin loads, sign-out button works → back to /login after sign-out.
   ```
   ```bash
   # negative test: anonymous admin mutation must fail
   bunx convex run cms:updateSiteSettings '{"patch":{"siteName":"HACKED"}}'
   # expect: UNAUTHORIZED / requireAdmin error, siteName unchanged in dashboard
   ```
2. Build guard (P0-3 — placeholder domain can never ship again):
   ```bash
   # must FAIL without site URL in prod mode:
   $env:NEXT_PUBLIC_SITE_URL=""; bun run build
   # expect: build error "NEXT_PUBLIC_SITE_URL is required in production"
   # must PASS with it set:
   $env:NEXT_PUBLIC_SITE_URL="https://trading-landing-beta.vercel.app"; bun run build
   ```
   Snippet you own (`lib/site.ts` top):
   ```ts
   if (process.env.VERCEL_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
     throw new Error("NEXT_PUBLIC_SITE_URL is required in production — sitemap/OG would point at placeholder.");
   }
   export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
   ```
3. Placeholder + SEO sweep (P0-2 / §10):
   ```bash
   bun run build; bun start --port 3100 &
   curl -s http://localhost:3100/sitemap.xml | head -20        # expect: final domain, NO your-domain.vercel.app
   curl -s http://localhost:3100/robots.txt                    # expect: Sitemap: https://<final-domain>/sitemap.xml
   curl -s http://localhost:3100/ | Select-String "example.ae|000 0000|your-domain"  # expect: no matches
   curl -s http://localhost:3100/ | Select-String "wa.me|generate_lead|googletagmanager"  # expect: WhatsApp + analytics present
   ```
4. Security headers (P1-6):
   ```bash
   curl -I http://localhost:3100/ | Select-String "Content-Security-Policy|Strict-Transport-Security|Permissions-Policy|X-Content-Type|Referrer-Policy"
   # expect all 5+ present. If CSP missing → fix vercel.json + next.config.ts headers(), redeploy.
   ```
   ```jsonc
   // vercel.json shape you verify:
   { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; img-src 'self' data: https: *.convex.cloud; connect-src 'self' https://*.convex.cloud wss://*.convex.cloud" }
   ```
5. Full QA checklist run (final gate before Task 2 handover):
   ```bash
   bun run check; bun run build
   $env:BASE_URL="http://localhost:3000"; bun run verify:runtime
   bunx tsc --noEmit  # via typecheck — catches zod/type drift
   # Lighthouse (Chrome DevTools, Mobile): Perf ≥90, A11y ≥97, BP 100, SEO 100
   # Mobile 360px + keyboard-only pass: skip link → nav → hero CTAs → form → footer, all focus rings visible
   ```
6. Prod deploy + handover dry-run:
   ```bash
   bunx convex deploy
   # set --prod envs (SITE_URL, INQUIRY_NOTIFY_TO=<real inbox>, SMTP, ADMIN_EMAILS, NEXT_PUBLIC_GA_ID) then:
   # Vercel env: NEXT_PUBLIC_SITE_URL=https://<final-domain> → redeploy → run seed once on prod → create admin user
   # Submit live #contact form → team inbox + sender BOTH receive mail within 2 min
   ```
   Private message template (never in git): `Website: <url> · CMS: <url>/admin · Login: <email> / <temp-pw> (change on first login) · Guide: site text → /admin/site, products → /admin/products, address/WhatsApp → /admin/site#contact`.

General workflow (all): short-lived branches above, PRs into `main` with Kabir review; `git status` before commit; never `git add .` with `.env.local`; never commit secrets; `git pull --rebase` on reject; conflicts in `app/page.tsx`/`globals.css`/`lib/site.ts` → stop, ping Kabir.

Milestones: **Day 1** Shawon contract frozen + seed + throttle/zod; Orny+Pal read layer + a11y/photo prep. **Day 2** public sections CMS-driven, `/admin` CRUD draft, honeypot/preselect/wa.me/analytics event. **Day 3** Kabir auth gate + build guard + headers + CI + purge + prod deploy + seed + QA + link/credentials handover. Verdict's bottom line — "verification work, not coding" — is closed when Day 3 QA checklist is green.
