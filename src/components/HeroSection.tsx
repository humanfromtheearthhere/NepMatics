import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  const [horizonFailed, setHorizonFailed] = useState(false);
  const [craftFailed, setCraftFailed] = useState(false);

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden bg-white"
    >
      {/* Full-Bleed Orbital Horizon & Spacecraft Background with Crisp White Top Blend */}
      <div className="pointer-events-none absolute inset-0">
        {/* Main orbital horizon + Himalayan ridge spanning prominently across the hero */}
        <div className="absolute inset-x-0 bottom-0 top-12 overflow-hidden">
          {!horizonFailed ? (
            <img
              src="/src/assets/images/hero_orbital_horizon_1795657446828.jpg"
              alt="Curved planetary horizon with electric orange atmospheric glow and Himalayan peaks"
              referrerPolicy="no-referrer"
              onError={() => setHorizonFailed(true)}
              className="h-full w-full object-cover object-bottom contrast-105 saturate-110"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_bottom,_rgba(249,115,22,0.35),_#ffffff_75%)]" />
          )}

          {!craftFailed && (
            <img
              src="/src/assets/images/space_engineering_silhouette_1795657445842.jpg"
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              onError={() => setCraftFailed(true)}
              className="absolute left-1/2 bottom-[14%] h-[58%] w-auto min-w-[680px] -translate-x-1/2 object-contain opacity-65 mix-blend-screen"
            />
          )}

          {/* Measured top-only white fade so the upper white navbar & headline stay crisp while the image remains vivid */}
          <div className="absolute inset-x-0 top-0 h-[44%] bg-gradient-to-b from-white via-white/85 to-transparent" />
        </div>
      </div>

      {/* Centered Hero Copy Stack */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-start px-5 pb-52 pt-28 text-center sm:px-8 sm:pb-64 sm:pt-32">
        {/* Subtle localized light backdrop behind typography for effortless WCAG contrast without hiding surrounding imagery */}
        <div className="rounded-3xl bg-white/75 px-6 py-7 shadow-[0_12px_48px_rgba(255,255,255,0.65)] backdrop-blur-[6px] sm:px-10 sm:py-9">
          <p className="font-mono text-xs tracking-[0.16em] text-slate-700">
            <span>NEPMATICS</span>
            <span aria-hidden="true" className="mx-2.5 text-[#D9480F]">·</span>
            <span>Advanced Technology R&amp;D</span>
            <span aria-hidden="true" className="mx-2.5 text-[#D9480F]">·</span>
            <span>Nepal</span>
          </p>

          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-slate-950 sm:text-6xl lg:text-[4.15rem] lg:leading-[1.06]">
            Engineering What Comes Next.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-700 sm:text-base">
            We explore the frontiers of artificial intelligence, robotics, computing and advanced
            engineering to develop technologies for a changing world.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#research"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#D9480F] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(217,72,15,0.28)] hover:bg-[#EA580C] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span>Explore Our Research</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href="#about"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Discover NepMatics
            </a>
          </div>
        </div>
      </div>

      {/* Smooth Curved Horizon Wave Transition into Next Section */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-10 -mb-px w-full overflow-hidden leading-none"
      >
        <svg
          viewBox="0 0 1440 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-14 w-full sm:h-20 lg:h-24"
          preserveAspectRatio="none"
        >
          <path
            d="M0 78C260 18 520 12 760 54C1000 96 1230 98 1440 42V110H0V78Z"
            fill="#F8FAFC"
          />
          <path
            d="M0 78C260 18 520 12 760 54C1000 96 1230 98 1440 42"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </section>
  );
}
