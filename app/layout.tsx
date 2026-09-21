import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./providers/convex-provider";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "UAE import export",
    "Dubai general trading",
    "Jebel Ali consolidation",
    "commodity trading UAE",
    "GCC logistics",
    "cross-border trade",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: "/",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "UAE Trade Gateway — cargo port at dusk with trade routes from Jebel Ali",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ["/opengraph-image"],
  },
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.webmanifest",
  category: "business",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#081226",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  description: site.description,
  url: site.url,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dubai",
    addressRegion: "Dubai",
    addressCountry: "AE",
  },
  email: site.contact.email,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream-50 text-navy-950">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static trusted JSON-LD
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
