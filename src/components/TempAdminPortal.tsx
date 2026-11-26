import { useState, type ChangeEvent } from 'react';
import {
  ArrowLeft,
  Check,
  Film,
  Image as ImageIcon,
  Play,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { APPROACH_STAGES } from '../data/researchData';
import {
  DEFAULT_LOADING_VIDEO_URL,
  type ApproachVideoMap,
} from '../../lib/siteConfig';
import { isImageAssetUrl, useSiteConfig } from '../context/SiteConfigContext';
import { BrandMark } from './BrandMark';

interface TempAdminPortalProps {
  onClose: () => void;
}

type StageKey = keyof ApproachVideoMap;

export function TempAdminPortal({ onClose }: TempAdminPortalProps) {
  const {
    config,
    saving,
    lastSavedAt,
    saveError,
    triggerLoadingPreview,
    updateConfig,
    uploadMediaFile,
    resetAllConfig,
  } = useSiteConfig();

  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [loadingUrlInput, setLoadingUrlInput] = useState('');
  const [stageUrlInputs, setStageUrlInputs] = useState<Record<StageKey, string>>({
    '01': '',
    '02': '',
    '03': '',
    '04': '',
  });

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    setUploadingSlot('logo');
    try {
      const url = await uploadMediaFile(file);
      await updateConfig({ logoUrl: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Logo upload failed.');
    } finally {
      setUploadingSlot(null);
    }
  }

  async function handleLoadingUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    setUploadingSlot('loading');
    try {
      const url = await uploadMediaFile(file);
      await updateConfig({ loadingVideoUrl: url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Loading media upload failed.');
    } finally {
      setUploadingSlot(null);
    }
  }

  async function handleStageVideoUpload(stageKey: StageKey, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    setUploadingSlot(`stage-${stageKey}`);
    try {
      const url = await uploadMediaFile(file);
      await updateConfig((prev) => ({
        ...prev,
        approachVideos: {
          ...prev.approachVideos,
          [stageKey]: url,
        },
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Stage video upload failed.');
    } finally {
      setUploadingSlot(null);
    }
  }

  async function applyStageUrl(stageKey: StageKey) {
    const url = stageUrlInputs[stageKey].trim();
    if (!url) return;
    setUploadError(null);
    await updateConfig((prev) => ({
      ...prev,
      approachVideos: {
        ...prev.approachVideos,
        [stageKey]: url,
      },
    }));
    setStageUrlInputs((prev) => ({ ...prev, [stageKey]: '' }));
  }

  async function applyVideoToAllStages(url: string) {
    await updateConfig((prev) => ({
      ...prev,
      approachVideos: {
        '01': url,
        '02': url,
        '03': url,
        '04': url,
      },
    }));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Website</span>
            </button>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#D9480F]">
                Temporary Open Portal
              </p>
              <h1 className="font-display text-base font-semibold text-slate-950 sm:text-lg">
                NEPMATICS Media &amp; Brand Control
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {saving ? (
              <span className="font-mono text-xs text-slate-500">Saving changes...</span>
            ) : lastSavedAt ? (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-700">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Synced {lastSavedAt}</span>
              </span>
            ) : null}

            <button
              type="button"
              onClick={triggerLoadingPreview}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900 hover:border-slate-400 transition-colors"
            >
              <Play className="h-3.5 w-3.5 text-[#D9480F]" aria-hidden="true" />
              <span>Test Loading Screen</span>
            </button>

            <button
              type="button"
              onClick={resetAllConfig}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset All</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
        {(uploadError || saveError) && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800"
          >
            {uploadError || saveError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 1. App Logo Control */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#D9480F]">
                  01. Brand Identity
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-slate-950">
                  Website App Logo
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Updates the Navbar, Footer, and browser tab icon across the site.
                </p>
              </div>
              <ImageIcon className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Live Header Preview
              </p>
              <div className="mt-3 flex min-h-[56px] items-center rounded-full border border-slate-200 bg-white px-5 shadow-sm">
                <BrandMark />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-xs font-medium text-slate-700 hover:border-[#D9480F] hover:bg-orange-50/40 transition-colors">
                <Upload className="h-4 w-4 text-[#D9480F]" aria-hidden="true" />
                <span>
                  {uploadingSlot === 'logo'
                    ? 'Uploading logo...'
                    : 'Upload Logo Image (PNG, SVG, JPG, WEBP)'}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  onChange={handleLogoUpload}
                  disabled={uploadingSlot === 'logo'}
                  className="sr-only"
                />
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                  placeholder="Or paste logo image URL (https://...)"
                  className="min-h-[40px] flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9480F]"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!logoUrlInput.trim()) return;
                    await updateConfig({ logoUrl: logoUrlInput.trim() });
                    setLogoUrlInput('');
                  }}
                  className="rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Apply
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={config.showBrandText}
                    onChange={(e) => updateConfig({ showBrandText: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#D9480F] focus:ring-[#D9480F]"
                  />
                  <span>Show &ldquo;NEPMATICS&rdquo; wordmark beside logo</span>
                </label>

                {config.logoUrl && (
                  <button
                    type="button"
                    onClick={() => updateConfig({ logoUrl: null, showBrandText: true })}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Restore Default Logo</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* 2. Loading Screen Control */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#D9480F]">
                  02. Refresh Splash Screen
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-slate-950">
                  Centered White Loading Screen
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Automatically appears centered on a white background on every page load or refresh.
                </p>
              </div>
              <Film className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
            </div>

            <div className="mt-5 flex items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
              {isImageAssetUrl(config.loadingVideoUrl) ? (
                <img
                  src={config.loadingVideoUrl}
                  alt="Current loading animation"
                  className="h-28 w-28 object-contain"
                />
              ) : (
                <video
                  key={config.loadingVideoUrl}
                  src={config.loadingVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-28 w-28 object-contain mix-blend-multiply"
                />
              )}
            </div>

            <div className="mt-5 space-y-4">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-xs font-medium text-slate-700 hover:border-[#D9480F] hover:bg-orange-50/40 transition-colors">
                <Upload className="h-4 w-4 text-[#D9480F]" aria-hidden="true" />
                <span>
                  {uploadingSlot === 'loading'
                    ? 'Uploading loading media...'
                    : 'Upload Loading Video or GIF (MP4, WEBM, GIF, PNG)'}
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,image/gif,image/png,image/webp,image/svg+xml"
                  onChange={handleLoadingUpload}
                  disabled={uploadingSlot === 'loading'}
                  className="sr-only"
                />
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={loadingUrlInput}
                  onChange={(e) => setLoadingUrlInput(e.target.value)}
                  placeholder="Or paste loading video/image URL (https://...)"
                  className="min-h-[40px] flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9480F]"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!loadingUrlInput.trim()) return;
                    await updateConfig({ loadingVideoUrl: loadingUrlInput.trim() });
                    setLoadingUrlInput('');
                  }}
                  className="rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Apply
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <span>Display Duration:</span>
                  <select
                    value={config.loadingDurationMs}
                    onChange={(e) =>
                      updateConfig({ loadingDurationMs: Number(e.target.value) })
                    }
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D9480F]"
                  >
                    <option value={1000}>1.0s</option>
                    <option value={1600}>1.6s (Default)</option>
                    <option value={2200}>2.2s</option>
                    <option value={3000}>3.0s</option>
                  </select>
                </label>

                {config.loadingVideoUrl !== DEFAULT_LOADING_VIDEO_URL && (
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig({
                        loadingVideoUrl: DEFAULT_LOADING_VIDEO_URL,
                        loadingDurationMs: 1600,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Restore Default Video</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* 3. Our Approach — 4 Stage Video Illustrations */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-slate-100 pb-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#D9480F]">
              03. Our Approach Visuals
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-slate-950">
              Discover · Research · Experiment · Engineer Video Illustrations
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Upload a looping video illustration (MP4, WEBM, MOV, or animated GIF) for each stage.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {APPROACH_STAGES.map((stage) => {
              const key = stage.step as StageKey;
              const videoUrl = config.approachVideos[key];
              const isUploading = uploadingSlot === `stage-${key}`;

              return (
                <div
                  key={stage.step}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-semibold text-[#D9480F]">
                          Stage {stage.step}
                        </span>
                        <h3 className="font-display text-base font-semibold text-slate-950">
                          {stage.title}
                        </h3>
                      </div>
                      {videoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            updateConfig((prev) => ({
                              ...prev,
                              approachVideos: {
                                ...prev.approachVideos,
                                [key]: null,
                              },
                            }))
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3" aria-hidden="true" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>

                    <div className="mt-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {videoUrl ? (
                        isImageAssetUrl(videoUrl) ? (
                          <img
                            src={videoUrl}
                            alt={`${stage.title} illustration`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <video
                            key={videoUrl}
                            src={videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        )
                      ) : (
                        <span className="font-mono text-xs text-slate-400">
                          No video uploaded for {stage.title}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 hover:border-[#D9480F] hover:bg-orange-50/30 transition-colors">
                      <Upload className="h-3.5 w-3.5 text-[#D9480F]" aria-hidden="true" />
                      <span>
                        {isUploading
                          ? 'Uploading video...'
                          : `Upload ${stage.title} Video (MP4 / WEBM / GIF)`}
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,image/gif,image/webp,image/png"
                        onChange={(e) => handleStageVideoUpload(key, e)}
                        disabled={isUploading}
                        className="sr-only"
                      />
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={stageUrlInputs[key]}
                        onChange={(e) =>
                          setStageUrlInputs((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder="Or paste video URL (https://...)"
                        className="min-h-[36px] flex-1 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9480F]"
                      />
                      <button
                        type="button"
                        onClick={() => applyStageUrl(key)}
                        className="rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                      >
                        Set
                      </button>
                    </div>

                    {videoUrl && (
                      <button
                        type="button"
                        onClick={() => applyVideoToAllStages(videoUrl)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950 transition-colors"
                      >
                        Apply This Video to All 4 Stages
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
