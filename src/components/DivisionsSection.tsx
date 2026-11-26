import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { RESEARCH_DIVISIONS, type ResearchDivision } from '../data/researchData';

interface DivisionsSectionProps {
  onSelectCollaborationTopic?: (subject: string) => void;
}

export function DivisionsSection({ onSelectCollaborationTopic }: DivisionsSectionProps) {
  const [selectedId, setSelectedId] = useState<string>(RESEARCH_DIVISIONS[0].id);

  const selectedDivision: ResearchDivision =
    RESEARCH_DIVISIONS.find((d) => d.id === selectedId) ?? RESEARCH_DIVISIONS[0];

  return (
    <section id="divisions" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs tracking-[0.16em] text-[#D9480F] uppercase">
            02. Research Directions
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Seven Exploratory Research Directions.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            These domains represent conceptual and experimental research directions under active
            exploration—not yet established operational laboratories.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESEARCH_DIVISIONS.map((division, idx) => {
            const isSelected = division.id === selectedDivision.id;
            const spanLast = idx === RESEARCH_DIVISIONS.length - 1;
            return (
              <button
                key={division.id}
                type="button"
                onClick={() => setSelectedId(division.id)}
                aria-pressed={isSelected}
                className={`flex flex-col justify-between rounded-2xl border p-6 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] ${
                  spanLast ? 'sm:col-span-2 lg:col-span-3' : ''
                } ${
                  isSelected
                    ? 'border-[#D9480F] bg-orange-50/45 shadow-[0_8px_28px_rgba(217,72,15,0.08)]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-medium tabular-nums ${
                        isSelected ? 'text-[#D9480F]' : 'text-slate-400'
                      }`}
                    >
                      {division.code}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Research Direction
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-slate-950">
                    {division.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {division.summary}
                  </p>
                </div>

                <p
                  className={`mt-4 font-mono text-xs font-medium ${
                    isSelected ? 'text-[#D9480F]' : 'text-slate-500'
                  }`}
                >
                  {isSelected ? 'Selected Direction ↓' : 'Inspect Scope →'}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Direction Technical Specification Card */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="relative h-36 w-full overflow-hidden border-b border-slate-200 bg-slate-950 sm:h-44">
            <img
              src="/src/assets/images/hero_neural_architecture_1795656742795.jpg"
              alt="Abstract scientific visualization of interconnected neural computational systems"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-85"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent"
            />
            <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between font-mono text-xs text-slate-200">
              <span>Direction {selectedDivision.code} · Exploratory Specification</span>
              <span className="text-[#FB923C]">{selectedDivision.shortName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="font-mono text-xs font-medium text-[#D9480F]">
                Direction {selectedDivision.code} <span aria-hidden="true">·</span> Exploratory
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-slate-950">
                {selectedDivision.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {selectedDivision.researchQuestions}
              </p>
            </div>

            <div className="flex flex-col justify-between lg:col-span-6 lg:border-l lg:border-slate-200 lg:pl-8">
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  Exploratory Focus Areas
                </h4>
                <ul className="mt-3 space-y-2">
                  {selectedDivision.focusAreas.map((area) => (
                    <li key={area} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9480F]"
                      />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <a
                  href="#contact"
                  onClick={() =>
                    onSelectCollaborationTopic?.(`Collaboration Inquiry: ${selectedDivision.name}`)
                  }
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#D9480F] hover:text-[#B93808] transition-colors"
                >
                  <span>Collaborate on {selectedDivision.shortName}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
