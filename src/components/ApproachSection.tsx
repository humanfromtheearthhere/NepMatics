import { useState } from 'react';
import { Compass, FlaskConical, Cpu, Microscope } from 'lucide-react';
import { APPROACH_STAGES } from '../data/researchData';

function StageRingIcon({ step, active }: { step: string; active: boolean }) {
  const colorClass = active ? 'text-[#D9480F]' : 'text-slate-700';
  switch (step) {
    case '01':
      return <Compass className={`h-8 w-8 ${colorClass}`} strokeWidth={1.5} aria-hidden="true" />;
    case '02':
      return <Microscope className={`h-8 w-8 ${colorClass}`} strokeWidth={1.5} aria-hidden="true" />;
    case '03':
      return <FlaskConical className={`h-8 w-8 ${colorClass}`} strokeWidth={1.5} aria-hidden="true" />;
    default:
      return <Cpu className={`h-8 w-8 ${colorClass}`} strokeWidth={1.5} aria-hidden="true" />;
  }
}

export function ApproachSection() {
  const [activeStep, setActiveStep] = useState<string>(APPROACH_STAGES[0].step);

  const selectedStage =
    APPROACH_STAGES.find((stage) => stage.step === activeStep) ?? APPROACH_STAGES[0];

  return (
    <section id="approach" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-[0.16em] text-[#D9480F] uppercase">
            04. Our Approach
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Discover → Research → Experiment → Engineer
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Four disciplined stages guiding inquiry from first-principles questions to reliable
            systems.
          </p>
        </div>

        {/* 4 Clean White Circular Icon Rings */}
        <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[12%] right-[12%] top-12 hidden h-px bg-slate-200 lg:block"
          />

          {APPROACH_STAGES.map((stage) => {
            const isSelected = stage.step === activeStep;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setActiveStep(stage.step)}
                aria-pressed={isSelected}
                className="group relative z-10 flex flex-col items-center text-center focus-visible:outline-none"
              >
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-full border bg-white transition-all duration-200 ${
                    isSelected
                      ? 'border-[#D9480F] shadow-[0_14px_34px_rgba(217,72,15,0.16)]'
                      : 'border-slate-200 shadow-[0_10px_28px_rgba(15,23,42,0.06)] group-hover:border-slate-300'
                  }`}
                >
                  <StageRingIcon step={stage.step} active={isSelected} />
                </div>

                <span
                  className={`mt-5 font-mono text-xs font-medium tabular-nums ${
                    isSelected ? 'text-[#D9480F]' : 'text-slate-400'
                  }`}
                >
                  {stage.step}
                </span>

                <h3 className="mt-1.5 font-display text-lg font-semibold text-slate-950">
                  {stage.title}
                </h3>

                <p className="mt-2 max-w-[24ch] text-xs leading-relaxed text-slate-600">
                  {stage.summary}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-xs font-medium text-[#D9480F]">
                Stage {selectedStage.step}
              </span>
              <h3 className="mt-0.5 font-display text-xl font-semibold text-slate-950">
                {selectedStage.title}
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500">Core Stage Outputs</span>
          </div>

          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {selectedStage.deliverables.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
