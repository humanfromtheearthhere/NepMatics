import { useState } from 'react';
import { GEOMIND_DOSSIER, type ResearchDossierTab } from '../data/researchData';

export function FeaturedResearchSection() {
  const [activeTabId, setActiveTabId] = useState<ResearchDossierTab['id']>('overview');
  const [imageFailed, setImageFailed] = useState(false);

  const activeTab =
    GEOMIND_DOSSIER.find((tab) => tab.id === activeTabId) ?? GEOMIND_DOSSIER[0];

  return (
    <section id="research" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs tracking-[0.16em] text-[#D9480F] uppercase">
            03. Featured Research
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            GeoMind × DataForge
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            An experimental research initiative investigating intelligent training-data quality,
            geographic context, temporal diversity and data-efficient learning for satellite
            imagery AI.
          </p>
          <p className="mt-3 font-mono text-xs text-slate-500">
            Status: Experimental &amp; Under Active Development
            <span aria-hidden="true" className="mx-2 text-[#D9480F]">·</span>
            NepMatics Vision &amp; Intelligence
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.06)]">
          <div className="relative aspect-[16/7] min-h-[220px] w-full overflow-hidden border-b border-slate-200 bg-slate-950">
            {!imageFailed ? (
              <img
                src="/src/assets/images/geomind_satellite_geospatial_1795656743395.jpg"
                alt="Orbital elevation contour and geospatial vector telemetry visualization across Himalayan terrain"
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-900 p-8">
                <span className="font-mono text-xs text-slate-400">
                  GEOMIND × DATAFORGE GEOSPATIAL TOPOGRAPHY
                </span>
              </div>
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"
            />
            <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-slate-200">
              <span>Spatial-Temporal Curation Architecture</span>
              <span className="text-[#FB923C]">Pre-Benchmark Stage</span>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="GeoMind × DataForge Research Dossier Sections"
            className="flex flex-wrap justify-center gap-1 border-b border-slate-200 bg-slate-50 p-2.5"
          >
            {GEOMIND_DOSSIER.map((tab) => {
              const isSelected = tab.id === activeTab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  id={`dossier-tab-${tab.id}`}
                  aria-selected={isSelected}
                  aria-controls={`dossier-panel-${tab.id}`}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`min-h-[38px] rounded-lg px-4 py-2 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] ${
                    isSelected
                      ? 'border border-slate-200 bg-white text-slate-950 shadow-sm'
                      : 'border border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-950'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`dossier-panel-${activeTab.id}`}
            aria-labelledby={`dossier-tab-${activeTab.id}`}
            className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12"
          >
            <div className="lg:col-span-7">
              <p className="font-mono text-xs font-medium text-[#D9480F]">{activeTab.label}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-slate-950">
                {activeTab.heading}
              </h3>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                {activeTab.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 lg:border-l lg:border-slate-200 lg:pl-8">
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                Parameters &amp; Scope
              </h4>
              {activeTab.bulletPoints && (
                <ul className="mt-4 space-y-3">
                  {activeTab.bulletPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9480F]"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
