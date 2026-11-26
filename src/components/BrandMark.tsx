import { useSiteConfig } from '../context/SiteConfigContext';

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className = '' }: BrandMarkProps) {
  const { config } = useSiteConfig();

  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      {config.logoUrl ? (
        <img
          src={config.logoUrl}
          alt="NEPMATICS"
          className="h-7 w-auto max-w-[130px] rounded-md object-contain shrink-0"
        />
      ) : (
        <svg
          width="26"
          height="26"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="2" y="2" width="60" height="60" rx="12" fill="#0F172A" />
          <path d="M18 46V18H23.5L40.5 39.2V18H46V46H40.5L23.5 24.8V46H18Z" fill="#FFFFFF" />
          <rect x="40.5" y="18" width="5.5" height="5.5" fill="#F97316" />
        </svg>
      )}
      {(!config.logoUrl || config.showBrandText) && (
        <span className="font-display text-[17px] font-bold tracking-[0.14em] text-slate-900 uppercase">
          NEPMATICS
        </span>
      )}
    </span>
  );
}
