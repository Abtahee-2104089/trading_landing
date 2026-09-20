"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/site", label: "Site" },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-2">
      {links.map((l) => {
        const active =
          l.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none ${
              active
                ? "bg-navy-950 text-white"
                : "bg-white text-navy-900 ring-1 ring-navy-900/15 hover:bg-navy-50"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
