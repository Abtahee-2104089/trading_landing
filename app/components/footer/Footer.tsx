import Container from "@/app/components/ui/Container";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300">
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-white">{site.name}</p>
            <p className="mt-1 text-[11px] font-medium tracking-widest text-slate-400 uppercase">
              Import · Export · Dubai
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Dubai-based general trading — sourcing, QC, freight, and customs
              for importers across the GCC and beyond.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="text-sm font-semibold tracking-widest text-slate-200 uppercase">
              Explore
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-1 lg:grid-cols-2">
              {site.nav.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-sm underline-offset-4 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-sm font-semibold tracking-widest text-slate-200 uppercase">
              Contact
            </p>
            <address className="mt-3 text-sm leading-relaxed not-italic">
              {site.contact.office}
              <br />
              <a
                href={`mailto:${site.contact.email}`}
                className="rounded-sm underline-offset-4 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none"
              >
                {site.contact.email}
              </a>
              <br />
              <a
                href={site.contact.phoneHref}
                className="rounded-sm underline-offset-4 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none"
              >
                {site.contact.phoneDisplay}
              </a>
            </address>
            <a
              href="#contact"
              className="mt-4 inline-block rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none"
            >
              {site.primaryCta}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Jebel Ali · Dubai · United Arab Emirates</p>
        </div>
      </Container>
    </footer>
  );
}
