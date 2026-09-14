const navLinks = [
  { href: "#about", label: "About" },
  { href: "#categories", label: "Categories" },
  { href: "#network", label: "Network" },
  { href: "#trust", label: "Trust" },
  { href: "#contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-white">UAE Trade</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed">
              Dubai-based general trading — sourcing, QC, freight, and customs
              for importers across the GCC and beyond.
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="text-sm font-semibold tracking-widest text-neutral-300 uppercase">
              Explore
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-1 lg:grid-cols-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-sm underline-offset-4 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-sm font-semibold tracking-widest text-neutral-300 uppercase">
              Contact
            </p>
            <address className="mt-3 text-sm leading-relaxed not-italic">
              Jebel Ali, Dubai, UAE
              <br />
              <a
                href="mailto:trade@example.ae"
                className="rounded-sm underline-offset-4 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
              >
                trade@example.ae
              </a>
              <br />
              <a
                href="tel:+971400000000"
                className="rounded-sm underline-offset-4 hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
              >
                +971 4 000 0000
              </a>
            </address>
            <a
              href="#contact"
              className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
            >
              Request a quote
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-neutral-800 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} UAE Trade. All rights reserved.</p>
          <p>Jebel Ali · Dubai · United Arab Emirates</p>
        </div>
      </div>
    </footer>
  );
}
