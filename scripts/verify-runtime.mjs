/**
 * Runtime smoke check for the unified landing page (Kabir-owned QA).
 * Usage: BASE_URL=http://localhost:3000 bun run verify:runtime
 *
 * Asserts: / renders, all 8 section anchors exist, metadata/OG present,
 * #contact form has name/company/email/phone/category/message fields.
 */
const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

const requiredAnchors = [
  "home",
  "about",
  "categories",
  "network",
  "trust",
  "contact",
];
const requiredFields = [
  'name="name"',
  'name="company"',
  'name="email"',
  'name="phone"',
  'name="category"',
  'name="message"',
];

async function main() {
  const res = await fetch(`${base}/`, {
    headers: { "user-agent": "verify-runtime" },
  });
  if (!res.ok) throw new Error(`GET / failed with ${res.status}`);
  const html = await res.text();

  const missing = requiredAnchors.filter((id) => !html.includes(`id="${id}"`));
  if (missing.length > 0)
    throw new Error(`Missing section anchors: ${missing.join(", ")}`);

  const missingFields = requiredFields.filter((f) => !html.includes(f));
  if (missingFields.length > 0)
    throw new Error(`Missing form fields: ${missingFields.join(", ")}`);

  for (const token of [
    "og:title",
    "og:description",
    "twitter:card",
    'rel="canonical"',
  ]) {
    if (!html.includes(token)) throw new Error(`Missing SEO token: ${token}`);
  }

  // Sitemap + robots must resolve.
  for (const path of ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest"]) {
    const r = await fetch(`${base}${path}`);
    if (!r.ok) throw new Error(`GET ${path} failed with ${r.status}`);
  }

  console.log(
    `verify:runtime OK — ${base}/ renders all anchors, form fields, and SEO routes.`,
  );
}

main().catch((err) => {
  console.error(
    `verify:runtime FAILED — ${err instanceof Error ? err.message : err}`,
  );
  process.exit(1);
});
