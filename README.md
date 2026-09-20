# UAE Trade Gateway

The public B2B landing page and inquiry workspace for a UAE-based import and export trading company.

The application combines a single unified marketing page, a qualified lead-capture form, and
a Convex-backed inquiry and email-delivery workflow.

## Product areas

- Public landing sections for credibility, capabilities, global reach, and inquiry: navbar, hero, about plus UAE advantage, trading categories, global network and logistics, trust and compliance, inquiry form, and footer.
- Trading-category showcase with six cards: Electronics, Foodstuff and Agro, Textiles, Building Materials, Cosmetics, and Auto Parts and Industrial, each with an enquire link preselecting the contact form.
- Inquiry submission, validation, persistent storage, status tracking (`new`, `contacted`, `qualified`, `closed`), and internal review queries.
- Email delivery for team notifications and sender acknowledgements over Gmail SMTP, with a `mailOutbox` delivery log where failures never fail the form submit.
- SEO foundation with metadata, Open Graph, Twitter card, canonical URL, robots, sitemap, manifest, JSON-LD Organization data, and a dynamic OG image.

## Run locally

You need Bun 1.3 or newer and access to the project’s backend workspace.

1. Clone the repository and install dependencies.

```bash
git clone https://github.com/Abtahee-2104089/trading_landing.git
cd trading_landing
bun install
```

2. Create or select a development backend. This command writes the generated
   public endpoints to `.env.local` and keeps the backend synchronized while
   you work.

```bash
bunx convex dev
```

3. In another terminal, configure the local frontend origin and mail transport.
   Enter secrets interactively so they are not saved in shell history.

```bash
bunx convex env set SITE_URL http://localhost:3000
bunx convex env set INQUIRY_NOTIFY_TO sales@your-company.ae
bunx convex env set EMAIL_TRANSPORT gmail_smtp
bunx convex env set GMAIL_SMTP_USER your-mailbox@gmail.com
bunx convex env set GMAIL_SMTP_APP_PASSWORD
bunx convex env set EMAIL_FROM_NAME "UAE Trade Gateway"
```

To deliver team notifications and sender acknowledgements through Gmail, enable two-step verification, create a revocable
Google app password, and enter it interactively. Do not use the mailbox's main
password. Without a configured transport, inquiries still save in Convex with
`emailStatus: "failed"` and a `skipped` reason in the `mailOutbox` log while
remaining reviewable for the team.

4. Start the website.

```bash
bun dev
```

Open `http://localhost:3000`. All landing sections work without signing in.
Submit the `#contact` form to test `inquiries.submit` plus team notification
and sender acknowledgement end to end. Without `NEXT_PUBLIC_CONVEX_URL` the
form shows a clear "backend not configured" error instead of crashing.

## Public demo access

There are no accounts and no login. Every section and the inquiry form are
public.

| Access level | Credentials | What it demonstrates            |
| ------------ | ----------- | ------------------------------- |
| Guest        | none needed | Full landing page and `#contact` inquiry flow |

To verify delivery locally, submit the contact form with a name, a valid
email, a category, and a message of at least 10 characters. The trading desk
replies within one business day with price, lead time, and shipping options.
These test submissions must never contain personal, confidential, or
production data. A fresh Convex deployment has a separate database, so past
inquiries do not carry over when setting up another deployment.

## Environment variables

```dotenv
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
NEXT_PUBLIC_SITE_URL=
```

Never commit `.env.local`. `SITE_URL`, `INQUIRY_NOTIFY_TO`,
`EMAIL_TRANSPORT`, `GMAIL_SMTP_USER`, `GMAIL_SMTP_APP_PASSWORD`, and
`EMAIL_FROM_NAME` belong in the backend
deployment environment, not `.env.local`. `SITE_URL` must be one exact origin,
for example `https://your-domain.vercel.app`, with no path or trailing slash.
`INQUIRY_NOTIFY_TO` is the team inbox receiving new-lead mails.
`EMAIL_TRANSPORT` is `gmail_smtp` for Gmail delivery using `GMAIL_SMTP_USER`,
`GMAIL_SMTP_APP_PASSWORD`, and optionally `EMAIL_FROM_NAME`. `NEXT_PUBLIC_SITE_URL`
overrides the canonical site URL in `lib/site.ts`; without it the default
placeholder domain is used for metadata.

## Quality checks

```bash
bun run lint
bun run typecheck
bun run format:check
bun run build
```

Run the complete local validation before opening a pull request:

```bash
bun run check
bun run build
BASE_URL=http://localhost:3000 bun run verify:runtime
```

## Screenshots

There is no maintained screenshot gallery yet.

See the [concept deck](docs/concept-deck.md), [team workflow](Teamwork%20distribution.md), [Convex schema](convex/schema.ts), [inquiry workflow](convex/inquiries.ts), and [email delivery](convex/emails.ts).

## Deployment

The production frontend is deployed on Vercel with `bun install` and `bun run build` from `vercel.json`.

1. Create the production backend and deploy its schema and functions.

```bash
bunx convex deploy
```

2. In the production backend environment, set the canonical website origin,
   the team inbox, and the Gmail SMTP transport.

```bash
bunx convex env set --prod SITE_URL https://your-domain.vercel.app
bunx convex env set --prod INQUIRY_NOTIFY_TO sales@your-company.ae
bunx convex env set --prod EMAIL_TRANSPORT gmail_smtp
bunx convex env set --prod GMAIL_SMTP_USER your-mailbox@gmail.com
bunx convex env set --prod GMAIL_SMTP_APP_PASSWORD
bunx convex env set --prod EMAIL_FROM_NAME "UAE Trade Gateway"
```

3. In the frontend hosting project, configure:

```dotenv
CONVEX_DEPLOYMENT=prod:<deployment-name>
NEXT_PUBLIC_CONVEX_URL=https://<deployment-name>.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://<deployment-name>.convex.site
```

4. Configure the host to install with `bun install` and build
   with `bun run build`, then deploy. Use a plain install, not
   `--frozen-lockfile`: Vercel's Bun 1.3.x cannot parse the v2 lockfile
   written by local Bun 1.4.x. Redeploy after changing any
   `NEXT_PUBLIC_` value because those values are embedded during the build.

5. Confirm `/`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, and
   `#contact` submission on the final domain. Check that both the team inbox
   and the sender receive mail. If the form reports the backend is not
   configured, ensure `NEXT_PUBLIC_CONVEX_URL` was set before the build and
   that `SITE_URL` contains only the final origin.

## Content rule

Until verified company info is available, use credible placeholder copy. Do not invent certifications, clients, transaction volumes, awards, statistics, or specific partnerships.

## License

Copyright © Trading team. Internal company project — do not distribute or accept external contributions without company approval.
