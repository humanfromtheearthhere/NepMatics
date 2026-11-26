import { useEffect, useState } from 'react';
import { FileText, ArrowUpRight } from 'lucide-react';
import type { PublicationItem } from '../data/researchData';

type FilterCategory = 'all' | 'paper' | 'report' | 'dataset' | 'experiment';

const FILTER_OPTIONS: { id: FilterCategory; label: string }[] = [
  { id: 'all', label: 'All Outputs' },
  { id: 'paper', label: 'Papers' },
  { id: 'report', label: 'Technical Reports' },
  { id: 'dataset', label: 'Datasets' },
  { id: 'experiment', label: 'Experiments' },
];

interface PublicationsSectionProps {
  onSelectCollaborationTopic: (subject: string) => void;
}

export function PublicationsSection({ onSelectCollaborationTopic }: PublicationsSectionProps) {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [publications, setPublications] = useState<PublicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/publications')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load publications archive.');
        }
        return (await res.json()) as { publications?: PublicationItem[] };
      })
      .then((data) => {
        if (active) {
          setPublications(Array.isArray(data.publications) ? data.publications : []);
          setFetchError(null);
        }
      })
      .catch(() => {
        if (active) {
          setFetchError('Unable to reach the publications archive right now.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered =
    filter === 'all'
      ? publications
      : publications.filter((item) => item.category === filter);

  return (
    <section id="publications" className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-[0.16em] text-[#D9480F] uppercase">
            05. Research Publications
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Papers, Reports &amp; Datasets.
          </h2>
          <div
            role="group"
            aria-label="Filter publications by category"
            className="mt-8 inline-flex flex-wrap justify-center gap-1 rounded-xl border border-slate-200 bg-white p-1"
          >
            {FILTER_OPTIONS.map((option) => {
              const isSelected = filter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] ${
                    isSelected
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <p className="font-mono text-xs text-slate-500">
                Checking publication index...
              </p>
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8">
              <p className="text-sm text-rose-800">{fetchError}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_6px_24px_rgba(15,23,42,0.03)] sm:p-12">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <div className="flex items-center gap-3 text-slate-500">
                    <FileText className="h-5 w-5 text-[#D9480F]" aria-hidden="true" />
                    <span className="font-mono text-xs uppercase tracking-wider">
                      Archive Status <span aria-hidden="true">·</span> Pre-Publication Phase
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-semibold text-slate-950">
                    No Publications Released Yet
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    Research papers, technical reports, curated datasets, and reproducible
                    experiments will be indexed here as ongoing investigations reach rigorous
                    validation. We do not release unverified claims or placeholder manuscripts.
                  </p>
                </div>

                <div className="lg:col-span-4 lg:border-l lg:border-slate-200 lg:pl-8">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                    Planned Formats
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Peer-Reviewed Papers · Technical Reports · Open Datasets · Reproducible
                    Experiments
                  </p>
                  <a
                    href="#contact"
                    onClick={() =>
                      onSelectCollaborationTopic('Research Collaboration & Preprint Inquiry')
                    }
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D9480F] hover:text-[#B93808] transition-colors"
                  >
                    <span>Inquire about upcoming research</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <p className="font-mono text-xs text-slate-500">
                    <span className="capitalize text-[#D9480F]">{item.category}</span>
                    <span aria-hidden="true"> · </span>
                    <span className="tabular-nums">{item.year}</span>
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.abstract}</p>
                  <p className="mt-4 text-xs text-slate-500">{item.authors.join(', ')}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
