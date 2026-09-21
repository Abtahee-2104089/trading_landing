"use client";

import { useEffect, useState } from "react";
import Container from "@/app/components/ui/Container";
import Button from "@/app/components/ui/Button";
import { useSiteContent } from "@/lib/hooks/useSiteContent";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { content } = useSiteContent();
  const navLinks = content.nav;
  const brandName = content.siteName;
  const brandTagline = content.tagline;
  const ctaLabel = content.primaryCta;
  const ctaHref = content.primaryCtaHref;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      id="top"
      className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 text-white backdrop-blur"
    >
      <Container className="flex items-center justify-between py-3">
        <a
          href="#home"
          className="flex items-center gap-2.5 rounded-sm focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none"
          aria-label={`${brandName} — home`}
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500 text-base font-black text-navy-950"
          >
            U
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight">
              {brandName}
            </span>
            <span className="block text-[11px] font-medium tracking-widest text-slate-300 uppercase">
              {brandTagline}
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <Button href={ctaHref} variant="primary" size="sm">
            {ctaLabel}
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" className="relative block h-4 w-5">
            <span
              className={`absolute left-0 h-0.5 w-full rounded bg-current transition-transform duration-200 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute top-1.5 left-0 h-0.5 w-full rounded bg-current transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-full rounded bg-current transition-transform duration-200 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </Container>

      {/* Mobile menu */}
      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-white/10 bg-navy-950 px-4 pt-2 pb-5 sm:px-6 lg:hidden"
        >
          <nav aria-label="Mobile">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-slate-100 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Button
            href={ctaHref}
            variant="primary"
            size="lg"
            className="mt-3 w-full"
            onClick={() => setOpen(false)}
          >
            {ctaLabel}
          </Button>
        </div>
      ) : null}
    </header>
  );
}
