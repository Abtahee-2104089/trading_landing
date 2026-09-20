import Navbar from "./components/layout/navbar";
import Hero from "./components/hero";
import About from "./components/about";
import TradingCategories from "./components/trading-categories";
import GlobalNetwork from "./components/global-network";
import Trust from "./components/trust";
import Contact from "./components/contact";
import Footer from "./components/footer";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy-950 focus:ring-2 focus:ring-teal-700"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <About />
        <TradingCategories />
        <GlobalNetwork />
        <Trust />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
