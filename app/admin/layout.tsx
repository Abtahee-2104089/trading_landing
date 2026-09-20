import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminNav from "@/app/components/admin/AdminNav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-navy-900/10 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase">
              CMS
            </p>
            <h1 className="text-xl font-bold text-navy-950">Site Admin</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 hover:bg-navy-50 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
            >
              ← View site
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
          <AdminNav />
        </div>
      </header>
      {/* TODO(auth): Kabir gates /admin/* with real login; until then this
          panel is dev-only. Do not expose publicly without the gate. */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <p
          role="note"
          className="mt-4 rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-2.5 text-sm text-amber-900"
        >
          Sign-in gate pending (Kabir: <code>chore/cms-auth-deploy</code>).
          Treat this panel as staff-only until login lands.
        </p>
      </div>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
