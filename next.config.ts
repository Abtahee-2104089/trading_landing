import type { NextConfig } from "next";

// P1-6: hardening headers served by Next (Vercel edge headers in
// `vercel.json` mirror these for CDN-served responses).
// CSP allows: self, Next inline scripts, GA4, Convex + UploadThing (utfs.io).
// NOTE: `unsafe-eval` is added ONLY outside production — Turbopack/React
// dev requires eval() for debugging. Prod CSP stays strict.
const isProd = process.env.NODE_ENV === "production";
const scriptSrc = isProd
  ? "'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com"
  : "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com";

// CSP allows: self, Next inline scripts, GA4, Convex + UploadThing (utfs.io).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: *.convex.cloud *.ufs.sh utfs.io",
  "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.ufs.sh https://utfs.io https://*.utfs.io https://*.ingest.uploadthing.com https://www.google-analytics.com https://region1.google-analytics.com",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Perf: compress + immutable caching for hashed static assets.
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // CMS images live on Convex Storage (legacy) + UploadThing (utfs.io).
    remotePatterns: [
      { protocol: "https", hostname: "**.convex.cloud" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
