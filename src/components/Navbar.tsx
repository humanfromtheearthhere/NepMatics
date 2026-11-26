import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { BrandMark } from './BrandMark';

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Divisions', href: '#divisions' },
  { label: 'Research', href: '#research' },
  { label: 'Approach', href: '#approach' },
  { label: 'Publications', href: '#publications' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lensX, setLensX] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    setLensX(e.clientX - rect.left);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div
        ref={barRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setLensX(null)}
        className={`relative mx-auto flex h-14 max-w-4xl items-center justify-between gap-8 overflow-hidden rounded-full border px-4 sm:px-5 transition-all duration-300 ease-out ${
          scrolled && !mobileOpen
            ? 'scale-[1.03] border-white/60 bg-white/30 backdrop-blur-xl backdrop-saturate-150 shadow-[0_14px_40px_rgba(15,23,42,0.14),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(15,23,42,0.06)]'
            : 'scale-100 border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]'
        }`}
      >
        {/* Optical magnifying-glass refraction sheen when scrolled */}
        {scrolled && !mobileOpen && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/55 via-white/15 to-white/30"
            />
            {lensX !== null && (
              <div
                aria-hidden="true"
                style={{
                  background: `radial-gradient(120px circle at ${lensX}px 50%, rgba(255,255,255,0.65), transparent 72%)`,
                }}
                className="pointer-events-none absolute inset-0 transition-opacity duration-150"
              />
            )}
          </>
        )}

        <a
          href="#top"
          aria-label="NEPMATICS Home"
          className={`relative z-10 rounded-sm transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] ${
            scrolled && !mobileOpen ? 'scale-[1.03]' : 'scale-100'
          }`}
        >
          <BrandMark />
        </a>

        <nav aria-label="Primary Navigation" className="relative z-10 hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`relative py-1 text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0 after:absolute after:inset-x-0 after:bottom-0 after:h-[1.5px] after:bg-[#D9480F] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-150 after:origin-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] rounded-sm ${
                scrolled && !mobileOpen
                  ? 'text-slate-950 font-semibold scale-[1.05] hover:scale-[1.12] drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)]'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <a
            href="#contact"
            className={`hidden sm:inline-flex items-center justify-center rounded-full bg-[#D9480F] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#EA580C] transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              scrolled && !mobileOpen ? 'scale-[1.04] shadow-[0_6px_18px_rgba(217,72,15,0.28)]' : ''
            }`}
          >
            Collaborate
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300 hover:text-slate-950 md:hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F]"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile Navigation"
          className="mx-auto mt-2 max-w-4xl rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-md md:hidden"
        >
          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className="flex min-h-[44px] items-center rounded-lg px-4 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="#contact"
                onClick={handleLinkClick}
                className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-[#D9480F] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#EA580C] transition-colors"
              >
                Collaborate
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
