import Image from "next/image";
import Container from "@/app/components/ui/Container";
import Button from "@/app/components/ui/Button";

const assurances = [
  { title: "Jebel Ali consolidation", text: "Mixed containers, one shipment" },
  { title: "Customs cleared", text: "Documents handled end to end" },
  { title: "One partner", text: "Sourcing to last-mile delivery" },
];

/** Hero — value prop above the fold with dual CTAs + port/route visual. */
export default function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="relative scroll-mt-20 overflow-hidden bg-navy-950 text-white"
    >
      {/* subtle route treatment behind copy */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-teal-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl" />
        <svg
          className="absolute inset-x-0 top-0 h-full w-full opacity-20"
          viewBox="0 0 800 400"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-20 320 C 180 260, 320 200, 480 190 S 700 150, 830 90"
            stroke="#D9B545"
            strokeWidth="2"
            strokeDasharray="7 7"
            className="animate-route-dash"
          />
          <path
            d="M-20 350 C 200 320, 380 280, 560 250 S 720 210, 830 180"
            stroke="#2DD4BF"
            strokeWidth="2"
            strokeDasharray="7 7"
            strokeOpacity="0.7"
            className="animate-route-dash"
          />
        </svg>
      </div>

      <Container className="relative grid grid-cols-1 items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-widest text-gold-300 uppercase">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            UAE-based import &amp; export
          </p>
          <h1
            id="home-heading"
            className="mt-4 text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Global Trade. Seamless Supply.{" "}
            <span className="text-gold-400">Trusted from the UAE.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Your UAE-based partner connecting international suppliers and
            buyers through sourcing, commodity trading, and cross-border
            logistics — consolidated at Jebel Ali, delivered across the region.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="#contact" variant="primary" size="lg">
              Request a Quote
            </Button>
            <Button href="#categories" variant="outline-light" size="lg">
              Explore Trading Categories
            </Button>
          </div>
          <dl className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {assurances.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <dt className="text-sm font-semibold text-white">{item.title}</dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-slate-300">
                  {item.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
            <Image
              src="/images/hero-gateway.svg"
              alt="Cargo vessel and port cranes at dusk with trade routes radiating from the UAE hub at Jebel Ali"
              width={800}
              height={640}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-auto w-full"
            />
          </div>
          <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-xl border border-white/10 bg-navy-900/95 px-4 py-3 shadow-xl backdrop-blur sm:left-6">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white"
            >
              ✓
            </span>
            <p className="text-xs leading-snug text-slate-200">
              <span className="block text-sm font-semibold text-white">
                Sourcing → clearance → delivery
              </span>
              One connected journey, one accountable partner.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
