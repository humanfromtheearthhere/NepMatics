import { useState } from 'react';
import { APPROACH_STAGES } from '../data/researchData';
import type { ApproachVideoMap } from '../../lib/siteConfig';
import { isImageAssetUrl, useSiteConfig } from '../context/SiteConfigContext';

interface ApproachSectionProps {
  onOpenAdmin?: () => void;
}

export function ApproachSection({ onOpenAdmin }: ApproachSectionProps) {
  const [activeStep, setActiveStep] = useState<string>(APPROACH_STAGES[0].step);
  const { config } = useSiteConfig();

  const selectedStage =
    APPROACH_STAGES.find((stage) => stage.step === activeStep) ?? APPROACH_STAGES[0];
  const selectedVideoUrl = config.approachVideos[selectedStage.step as keyof ApproachVideoMap];

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

        {/* 4 Stage Cards — Symbols removed; dedicated video illustration slots */}
        <div className="relative mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {APPROACH_STAGES.map((stage) => {
            const isSelected = stage.step === activeStep;
            const stageVideoUrl = config.approachVideos[stage.step as keyof ApproachVideoMap];

            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setActiveStep(stage.step)}
                aria-pressed={isSelected}
                className="group relative z-10 flex flex-col items-center text-center focus-visible:outline-none"
              >
                <div
                  className={`relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl border bg-slate-50 transition-all duration-200 ${
                    isSelected
                      ? 'border-[#D9480F] shadow-[0_14px_34px_rgba(217,72,15,0.14)]'
                      : 'border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.05)] group-hover:border-slate-300'
                  }`}
                >
                  {stageVideoUrl ? (
                    isImageAssetUrl(stageVideoUrl) ? (
                      <img
                        src={stageVideoUrl}
                        alt={`${stage.title} illustration`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        key={stageVideoUrl}
                        src={stageVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <span
                      className={`font-mono text-2xl font-semibold tracking-widest tabular-nums transition-colors ${
                        isSelected ? 'text-[#D9480F]' : 'text-slate-300 group-hover:text-slate-400'
                      }`}
                    >
                      {stage.step}
                    </span>
                  )}
                </div>

                <span
                  className={`mt-4 font-mono text-xs font-medium tabular-nums ${
                    isSelected ? 'text-[#D9480F]' : 'text-slate-400'
                  }`}
                >
                  {stage.step}
                </span>

                <h3 className="mt-1 font-display text-lg font-semibold text-slate-950">
                  {stage.title}
                </h3>

                <p className="mt-2 max-w-[26ch] text-xs leading-relaxed text-slate-600">
                  {stage.summary}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-xs font-medium text-[#D9480F]">
                Stage {selectedStage.step}
              </span>
              <h3 className="mt-0.5 font-display text-xl font-semibold text-slate-950">
                {selectedStage.title}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-slate-500">Core Stage Outputs</span>
              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-slate-700 hover:border-[#D9480F] hover:text-[#D9480F] transition-colors"
                >
                  Manage Stage Videos
                </button>
              )}
            </div>
          </div>

          {selectedVideoUrl && (
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {isImageAssetUrl(selectedVideoUrl) ? (
                <img
                  src={selectedVideoUrl}
                  alt={`${selectedStage.title} illustration`}
                  className="max-h-72 w-full object-cover"
                />
              ) : (
                <video
                  key={selectedVideoUrl}
                  src={selectedVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-h-72 w-full object-cover"
                />
              )}
            </div>
          )}

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
