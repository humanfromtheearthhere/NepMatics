import { useEffect, useState } from 'react';
import { isImageAssetUrl, useSiteConfig } from '../context/SiteConfigContext';

export function LoadingScreen() {
  const { config, previewToken } = useSiteConfig();
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  // Show centered white loading screen on initial load / refresh / restart,
  // and whenever re-triggered via Temp Admin preview.
  useEffect(() => {
    setVisible(true);
    setFadingOut(false);

    const minDelay = Math.max(900, config.loadingDurationMs || 1600);
    const startTime = performance.now();
    let fadeTimer: number | undefined;
    let hideTimer: number | undefined;
    let dismissed = false;

    const scheduleDismiss = () => {
      if (dismissed) return;
      dismissed = true;
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, minDelay - elapsed);

      fadeTimer = window.setTimeout(() => {
        setFadingOut(true);
        hideTimer = window.setTimeout(() => {
          setVisible(false);
        }, 280);
      }, remaining);
    };

    if (document.readyState === 'complete') {
      scheduleDismiss();
    } else {
      window.addEventListener('load', scheduleDismiss, { once: true });
      // Fallback safeguard in case a third-party resource stalls
      const safetyTimer = window.setTimeout(scheduleDismiss, Math.max(minDelay + 1400, 3200));
      return () => {
        window.removeEventListener('load', scheduleDismiss);
        window.clearTimeout(safetyTimer);
        if (fadeTimer) window.clearTimeout(fadeTimer);
        if (hideTimer) window.clearTimeout(hideTimer);
      };
    }

    return () => {
      if (fadeTimer) window.clearTimeout(fadeTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [previewToken, config.loadingDurationMs]);

  // Immediately re-engage pure white loading screen when user refreshes/reloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      setFadingOut(false);
      setVisible(true);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (!visible) return null;

  const isImage = isImageAssetUrl(config.loadingVideoUrl);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading NepMatics"
      className={`fixed inset-0 z-[9998] flex items-center justify-center bg-white transition-opacity duration-300 ${
        fadingOut ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-center">
        {isImage ? (
          <img
            src={config.loadingVideoUrl}
            alt="Loading animation"
            className="h-36 w-36 object-contain sm:h-44 sm:w-44"
          />
        ) : (
          <video
            key={config.loadingVideoUrl}
            src={config.loadingVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-36 w-36 object-contain mix-blend-multiply sm:h-44 sm:w-44"
          />
        )}
      </div>
    </div>
  );
}
