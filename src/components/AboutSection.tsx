import { useState } from 'react';

const PRINCIPLES = [
  {
    index: '01',
    title: 'Empirical Rigor',
    body: 'Every claim is treated as a hypothesis to be tested through controlled experimentation, honest ablation, and reproducible documentation.',
  },
  {
    index: '02',
    title: 'First-Principles Engineering',
    body: 'We build from fundamental mathematical, physical, and computational constraints rather than layering abstractions over unexamined assumptions.',
  },
  {
    index: '03',
    title: 'Independent Inquiry',
    body: 'Originating in Nepal with a global scientific horizon, NepMatics pursues long-horizon R&D free from short-term commercial hype.',
  },
];

export function AboutSection() {
  const [studioFailed, setStudioFailed] = useState(false);

  return (
    <section id="about" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs tracking-[0.16em] text-[#D9480F] uppercase">
            01. About NepMatics
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            An Independent Research Initiative Rooted in Nepal.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
            NepMatics is an independent technology research and development initiative originating
            in Nepal, established to investigate foundational problems across artificial
            intelligence, vision, robotics, computing, cybersecurity, and energy systems.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-9 lg:col-span-6">
            <div className="space-y-5 text-sm leading-relaxed text-slate-700 sm:text-base">
              <p>
                Meaningful technological progress does not belong exclusively to legacy research
                capitals. By combining disciplined scientific inquiry, original systems engineering,
                and deep attention to physical and regional realities, we aim to contribute durable
                ideas and open research to the global community.
              </p>
              <p className="text-slate-600">
                NepMatics emphasizes research, experimentation, and original invention. We remain
                deliberately transparent about our foundational stage—without fabricated metrics,
                unverified claims, or premature commercial promises.
              </p>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-5 font-mono text-xs text-slate-500">
              <span>Origin: Nepal</span>
              <span aria-hidden="true" className="mx-2.5 text-[#D9480F]">·</span>
              <span>Focus: Foundational R&amp;D</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:col-span-6">
            <div className="relative h-full min-h-[260px] w-full overflow-hidden bg-slate-900">
              {!studioFailed ? (
                <img
                  src="/src/assets/images/nepmatics_rd_architecture_1795656744010.jpg"
                  alt="Engineering research workbench with robotic manipulator and optical calibration instrumentation"
                  referrerPolicy="no-referrer"
                  onError={() => setStudioFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 p-8">
                  <span className="font-mono text-xs text-slate-500">
                    NEPMATICS RESEARCH &amp; ENGINEERING
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.index}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.03)]"
            >
              <span className="font-mono text-xs font-medium text-[#D9480F]">
                {principle.index}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-slate-950">
                {principle.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{principle.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
