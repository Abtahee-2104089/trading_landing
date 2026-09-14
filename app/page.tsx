import TradingCategories from "./components/trading-categories";
import GlobalNetwork from "./components/global-network";
import Trust from "./components/trust";
import Contact from "./components/contact";
import Footer from "./components/footer";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#categories", label: "Categories" },
  { href: "#network", label: "Network" },
  { href: "#trust", label: "Trust" },
  { href: "#contact", label: "Contact" },
];

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-neutral-900 focus:ring-2 focus:ring-emerald-600"
      >
        Skip to content
      </a>

      <header id="top" className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a
            href="#top"
            className="rounded-sm text-lg font-bold text-neutral-900 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            UAE Trade
          </a>
          <nav aria-label="Primary">
            <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-md px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-3"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">
        <section
          id="about"
          aria-labelledby="about-heading"
          className="scroll-mt-20 bg-neutral-50 py-16 sm:py-20"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase">
              About
            </p>
            <h1
              id="about-heading"
              className="mt-2 max-w-2xl text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
            >
              General trading from the heart of Dubai
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              We help retailers, wholesalers, and project buyers source quality
              goods, consolidate shipments at Jebel Ali, and clear customs
              without delays.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="rounded-lg bg-emerald-700 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Request a quote
              </a>
              <a
                href="#categories"
                className="rounded-lg border border-neutral-300 bg-white px-6 py-3 text-center text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Browse categories
              </a>
            </div>
          </div>
        </section>

        <TradingCategories />
        <GlobalNetwork />
        <Trust />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
