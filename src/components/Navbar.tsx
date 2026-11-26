import { useState, useEffect, useRef } from 'react';
import { BrandMark } from './BrandMark';

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Divisions', href: '#divisions' },
  { label: 'Research', href: '#research' },
  { label: 'Approach', href: '#approach' },
  { label: 'Publications', href: '#publications' },
];

function createMagnifierDisplacementMap(): string {
  const width = 200;
  const height = 56;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    const ny = (y / (height - 1)) * 2 - 1;
    for (let x = 0; x < width; x++) {
      const nx = (x / (width - 1)) * 2 - 1;

      // Strongest convex magnification in center & curved lateral prism falloff near edges
      const edgeX = Math.max(0, 1 - Math.pow(Math.abs(nx), 3.4));
      const edgeY = Math.max(0, 1 - Math.pow(Math.abs(ny), 2.0));
      const lensFactor = edgeX * edgeY;

      const dx = -nx * lensFactor * 0.55;
      const dy = -ny * lensFactor * 0.96;

      const idx = (y * width + x) * 4;
      data[idx] = Math.max(0, Math.min(255, Math.round(128 + dx * 127)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(128 + dy * 127)));
      data[idx + 2] = 128;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

function ThreeLineIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 18 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line
        x1="1"
        y1="2"
        x2="17"
        y2="2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className={`transition-all duration-200 ${active ? 'text-[#D9480F]' : ''}`}
      />
      <line
        x1="1"
        y1="7"
        x2="17"
        y2="7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <line
        x1="1"
        y1="12"
        x2="17"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className={`transition-all duration-200 ${active ? 'text-[#D9480F]' : ''}`}
      />
    </svg>
  );
}

export function Navbar() {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lensMapUrl, setLensMapUrl] = useState<string>('');
  const [lensX, setLensX] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLensMapUrl(createMagnifierDisplacementMap());

    const onScroll = () => {
      const nextScrolled = window.scrollY > 36;
      setScrolled(nextScrolled);
      if (!nextScrolled) {
        setMenuExpanded(false);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = () => {
    setMenuExpanded(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    setLensX(e.clientX - rect.left);
  };

  // Magnifying glass is active ONLY when scrolled down AND the 3-line menu is collapsed
  const isLensActive = scrolled && !menuExpanded;
  const showInlineLinks = !scrolled || menuExpanded;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      {/* Inline SVG optical convex magnifying-glass filter with RGB chromatic dispersion */}
      {lensMapUrl && (
        <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden="true">
          <defs>
            <filter
              id="nepmatics-magnifier-lens"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={lensMapUrl}
                x="0"
                y="0"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                result="lensMap"
              />
              {/* Separate RGB displacements for authentic optical rainbow edge dispersion */}
              <feDisplacementMap
                in="SourceGraphic"
                in2="lensMap"
                scale="34"
                xChannelSelector="R"
                yChannelSelector="G"
                result="dispR"
              />
              <feColorMatrix
                in="dispR"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="redOnly"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="lensMap"
                scale="26"
                xChannelSelector="R"
                yChannelSelector="G"
                result="dispG"
              />
              <feColorMatrix
                in="dispG"
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="greenOnly"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="lensMap"
                scale="18"
                xChannelSelector="R"
                yChannelSelector="G"
                result="dispB"
              />
              <feColorMatrix
                in="dispB"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                result="blueOnly"
              />
              <feComposite
                in="redOnly"
                in2="greenOnly"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
                result="rg"
              />
              <feComposite
                in="rg"
                in2="blueOnly"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
            </filter>
          </defs>
        </svg>
      )}

      <div
        ref={barRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setLensX(null)}
        style={
          isLensActive && lensMapUrl
            ? {
                backdropFilter: 'url(#nepmatics-magnifier-lens) contrast(1.05)',
                WebkitBackdropFilter: 'url(#nepmatics-magnifier-lens) contrast(1.05)',
              }
            : undefined
        }
        className={`relative mx-auto flex h-14 items-center justify-between gap-6 overflow-hidden rounded-full border px-4 sm:px-5 transition-all duration-300 ease-out ${
          isLensActive
            ? 'max-w-2xl scale-[1.04] border-slate-900/15 bg-transparent shadow-[0_16px_42px_rgba(15,23,42,0.14),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1.5px_3px_rgba(15,23,42,0.14)]'
            : 'max-w-4xl scale-100 border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]'
        }`}
      >
        {/* Prismatic Rainbow Lateral Dispersion & Specular Rim Effects on Scrolled Glass Lens */}
        {isLensActive && (
          <>
            {/* Lateral rainbow chromatic refraction along left and right curved glass sides */}
            <div
              aria-hidden="true"
              style={{
                background:
                  'linear-gradient(90deg, rgba(239,68,68,0.22) 0%, rgba(249,115,22,0.18) 2.5%, rgba(234,179,8,0.14) 5%, rgba(34,197,94,0.14) 7.5%, rgba(59,130,246,0.18) 10%, transparent 17%, transparent 83%, rgba(59,130,246,0.18) 90%, rgba(168,85,247,0.16) 93%, rgba(236,72,153,0.18) 96.5%, rgba(249,115,22,0.22) 100%)',
              }}
              className="pointer-events-none absolute inset-0 rounded-full"
            />
            {/* Top-and-bottom curved prism edge highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-rose-400/50 via-white/95 to-sky-400/50"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 bottom-0 h-[1px] bg-gradient-to-r from-amber-400/40 via-slate-300/60 to-violet-400/40"
            />
            {lensX !== null && (
              <div
                aria-hidden="true"
                style={{
                  background: `radial-gradient(100px circle at ${lensX}px 50%, rgba(255,255,255,0.26), transparent 72%)`,
                }}
                className="pointer-events-none absolute inset-0"
              />
            )}
          </>
        )}

        <a
          href="#top"
          aria-label="NEPMATICS Home"
          className={`relative z-10 rounded-sm transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] ${
            isLensActive
              ? 'scale-[1.03] [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.95))]'
              : 'scale-100'
          }`}
        >
          <BrandMark />
        </a>

        {/* Navigation links shown cleanly when at top OR when expanded from 3-line toggle */}
        {showInlineLinks && (
          <nav
            aria-label="Primary Navigation"
            className="relative z-10 hidden md:flex items-center gap-6"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className="relative py-1 text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors duration-150 whitespace-nowrap shrink-0 after:absolute after:inset-x-0 after:bottom-0 after:h-[1.5px] after:bg-[#D9480F] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-150 after:origin-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] rounded-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <div className="relative z-10 flex items-center gap-2 shrink-0">
          {showInlineLinks && (
            <a
              href="#contact"
              onClick={handleLinkClick}
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#D9480F] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#EA580C] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Collaborate
            </a>
          )}

          {/* Persistent 3-line toggle (no X cross): always visible when scrolled, and on mobile */}
          <button
            type="button"
            onClick={() => setMenuExpanded((prev) => !prev)}
            aria-expanded={menuExpanded}
            aria-controls="nepmatics-nav-drawer"
            aria-label={
              menuExpanded
                ? 'Collapse navigation and restore optical lens'
                : 'Expand navigation menu'
            }
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] ${
              scrolled ? 'inline-flex' : 'md:hidden'
            } ${
              menuExpanded
                ? 'border-[#D9480F]/50 bg-orange-50 text-slate-950'
                : isLensActive
                ? 'border-slate-900/15 bg-white/35 text-slate-950 hover:bg-white/60 [filter:drop-shadow(0_0_6px_rgba(255,255,255,0.9))]'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:text-slate-950'
            }`}
          >
            <ThreeLineIcon active={menuExpanded} />
          </button>
        </div>
      </div>

      {/* Mobile / Narrow-Viewport Dropdown Drawer (uses the same 3-line toggle without an X cross) */}
      {menuExpanded && (
        <nav
          id="nepmatics-nav-drawer"
          aria-label="Expanded Navigation"
          className="mx-auto mt-2 max-w-4xl rounded-2xl border border-slate-200 bg-white/98 p-3 shadow-lg backdrop-blur-md md:hidden"
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
