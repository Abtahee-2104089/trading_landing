# UAE Trade Gateway — Concept Deck (tomorrow 3pm)

Owner: Md. Abtahee Kabir (Integration & Rest). One unified page, one design language.

## 1. One-line summary

*A modern B2B trade gateway that uses the UAE's strategic position as the visual and narrative anchor, guiding visitors from credibility → capabilities → global reach → inquiry.*

## 2. Business objective + page flow

Credibility → capabilities → global reach → inquiry. Each section answers exactly one question:

| # | Section | Question it answers | Anchor |
|---|---------|---------------------|--------|
| 01 | Navbar | Where can I go? | `#home` |
| 02 | Hero | Why should I care? | `#home` |
| 03 | Who We Are + UAE Advantage | Who are you, why UAE? | `#about` |
| 04 | Trading Categories | What do you trade? | `#categories` |
| 05 | Global Network / Logistics | Where do you operate? | `#network` |
| 06 | Trust & Compliance | Why should I trust you? | `#trust` |
| 07 | Final CTA + Inquiry Form | How do I contact you? | `#contact` |
| 08 | Footer | Where is the fine print? | — |

## 3. Creative direction (`UAE Trade Gateway`)

- Tone: confident, precise, global, trustworthy.
- Language: editorial typography + structured grids + trade/logistics imagery; routes used subtly.
- Palette (single source in `app/globals.css` `@theme`):
  - Deep Navy `#081226 / #0F2140` — headers, major text, dark sections
  - Warm White `#FDFBF7` — main background
  - Muted Gold `#C9A227 / #D9B545` — the one primary CTA + route highlights
  - Teal `#0F766E` range — secondary accents, focus rings, checkmarks
- Typography: Geist sans, strong weight contrast; large short hero headline, restrained body copy.
- Motion: route-dash SVG animation + reveal only; `prefers-reduced-motion` respected.

## 4. Hero concept

- Headline: **Global Trade. Seamless Supply. Trusted from the UAE.**
- Copy: UAE-based partner connecting suppliers and buyers through sourcing, commodity trading, cross-border logistics.
- Dual CTA: `Request a Quote` (gold, primary, repeated everywhere) + `Explore Trading Categories` (outline).
- Visual: cargo vessel + port cranes at dusk (`public/images/hero-gateway.svg`), UAE-Jebel Ali hub with dashed routes to Asia / Europe / Africa / GCC; floating badge "Sourcing → clearance → delivery".
- Assurances row: Jebel Ali consolidation · Customs cleared · One partner.

## 5. Section wireframe (desktop → mobile stacks)

```
Navbar (sticky navy) : logo | About Categories Network Trust Contact | [Request a Quote]
Hero (navy, 2-col)   : eyebrow, H1, lede, dual CTA, 3 assurances | port visual + badge
About (cream, 2-col) : centered H2 + 4 advantage cards + dual CTA | UAE hub map + why-it-matters note
Categories (white)   : centered H2 + 6 cards (image, desc, 3 bullets, enquire link)
Network (navy, dark) : H2 + 4 hub cards + 5-step journey (sourcing→coordination→logistics→docs→distribution)
Trust (cream)        : H2 + 4 pillars + compliance note (NO invented stats/certs)
Contact (white,2-col): H2 "Let's Talk Trade" + contact details | form card (name/company/email/phone/category/message)
Footer (navy)        : identity | explore nav | contact + CTA | copyright bar
```

## 6. Category cards + network visualization

- 6 cards with `next/image` (`public/categories/*`): Electronics, Foodstuff & Agro, Textiles, Building Materials, Cosmetics, Auto Parts & Industrial. Each: image + short desc + 3 item bullets + "Enquire about this category →".
- Network: 4 hub cards (UAE Hub / GCC & ME / Asia Sourcing / Africa & Europe) + numbered 5-step journey; dark navy section with gold step numerals.

## 7. Trust / compliance treatment

- 4 pillars: verified suppliers, pre-shipment QC, transparent pricing, compliant documentation.
- Compliance note instead of numbers: no invented certifications, clients, volumes, awards, statistics, or partnerships — verified credentials shared on request. (Prior fake-stats grid removed in QA pass.)

## 8. Contact / lead-capture flow

- Fields: name*, company, email*, phone, requirement/category, message* (min 10 chars).
- Client validation mirrors server (`lib/utils/validation.ts`); server authoritative (`convex/inquiries.ts`).
- Single hook: `useSubmitInquiry()` → `inquiries.submit(...) → {id}`; mail failures never fail the submit (`emailStatus` + `mailOutbox` log).
- Response expectation printed twice: "Our trading desk replies within one business day with price, lead time, and shipping options."
- Without `NEXT_PUBLIC_CONVEX_URL` the form shows a clear "backend not configured" error instead of crashing.

## 9. Stack + implementation approach

Next.js 16 + TypeScript + Tailwind v4 + Bun; Convex (inquiries + SMTP outbox); Vercel deploy; Gmail SMTP transport. SEO: metadata + Open Graph + Twitter card + canonical + robots + sitemap + manifest + JSON-LD Organization + dynamic OG image.

## 10. Responsibility split

Orny (A): navbar/hero/about/ui. Pal (B): categories/network/trust/contact UI/footer. Shawon (backend): schema/inquiries/emails. Kabir (integration): scaffold, `app/`, `lib/`, metadata/SEO, provider + hook, unified merge, env wiring, `bun run check + build + verify:runtime`, deploy, this deck.

## 11. Demo checklist for 3pm

`bun run check` ✓ · `bun run build` ✓ · `verify:runtime` ✓ · one CTA label ✓ · one navy/one gold-teal ✓ · identical radius/spacing ✓ · no fake stats ✓ · form validates empty/invalid ✓ · mobile 360px readable ✓ · keyboard/focus + contrast pass ✓.
