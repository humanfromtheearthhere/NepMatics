import { BrandMark } from './BrandMark';

const FOOTER_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Research', href: '#research' },
  { label: 'Divisions', href: '#divisions' },
  { label: 'Publications', href: '#publications' },
  { label: 'Contact', href: '#contact' },
];

interface FooterProps {
  onOpenAdmin?: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-col justify-between gap-10 border-b border-slate-200 pb-12 md:flex-row md:items-start">
          <div>
            <a
              href="#top"
              aria-label="NEPMATICS Back to top"
              className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F]"
            >
              <BrandMark />
            </a>
            <p className="mt-4 text-sm font-medium text-slate-800">
              Engineering What Comes Next.
            </p>
            <p className="mt-1.5 font-mono text-xs text-slate-500">
              Nepal
              <span aria-hidden="true" className="mx-2">·</span>
              <a
                href="#contact"
                className="text-slate-600 hover:text-[#D9480F] transition-colors"
              >
                Research Desk
              </a>
            </p>
          </div>

          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-medium uppercase tracking-wider text-slate-600 hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] rounded-sm"
              >
                {link.label}
              </a>
            ))}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-xs font-medium uppercase tracking-wider text-[#D9480F] hover:text-[#B93808] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] rounded-sm"
              >
                Temp Admin
              </button>
            )}
          </nav>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} NEPMATICS. Independent Technology Research &amp; Development.</p>
          <p>Originating in Nepal · Global Scientific Outlook</p>
        </div>
      </div>
    </footer>
  );
}
