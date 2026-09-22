import type { ReactNode } from "react";
import Link from "next/link";
import AdminErrorBoundary from "@/app/components/admin/AdminErrorBoundary";
import SignOutButton from "@/app/components/admin/SignOutButton";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/site", label: "Site & contact" },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/account", label: "Account" },
];

/**
 * CMS admin shell (Pal + Kabir). Every briefing item is editable from here —
 * no code, no Convex dashboard. Gated by `middleware.ts` (`admin_token`
 * cookie → `/admin/login`); Convex admin calls additionally thread
 * `adminSecret` (see `convex/adminAuth.ts`).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50 text-navy-950">
      <header className="border-b border-navy-900/10 bg-navy-950 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
          <Link href="/" className="mr-4 text-sm font-bold">
            ← Site
          </Link>
          <p className="mr-4 text-sm font-semibold text-gold-300">CMS Admin</p>
          <nav aria-label="Admin">
            <ul className="flex flex-wrap gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <span className="ml-auto">
            <SignOutButton />
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <AdminErrorBoundary>{children}</AdminErrorBoundary>
      </main>
    </div>
  );
}
