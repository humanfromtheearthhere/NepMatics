import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_SITE_CONFIG,
  normalizeSiteConfig,
  type SiteConfig,
} from '../../lib/siteConfig';

const STORAGE_KEY = 'nepmatics_site_config_v1';

interface SiteConfigContextValue {
  config: SiteConfig;
  saving: boolean;
  lastSavedAt: string | null;
  saveError: string | null;
  previewToken: number;
  triggerLoadingPreview: () => void;
  updateConfig: (updater: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => Promise<void>;
  uploadMediaFile: (file: File) => Promise<string>;
  resetAllConfig: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

function readCachedConfig(): SiteConfig {
  if (typeof window === 'undefined') return DEFAULT_SITE_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_CONFIG;
    return normalizeSiteConfig(JSON.parse(raw));
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

function writeCachedConfig(config: SiteConfig): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota errors
  }
}

export function isImageAssetUrl(url: string): boolean {
  const lower = url.toLowerCase().split('?')[0];
  return (
    lower.startsWith('data:image/') ||
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.svg')
  );
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(() => readCachedConfig());
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewToken, setPreviewToken] = useState(0);
  const configRef = useRef<SiteConfig>(config);
  configRef.current = config;

  // Sync with backend config on mount
  useEffect(() => {
    let active = true;
    fetch('/api/site-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { ok?: boolean; config?: unknown } | null) => {
        if (!active || !payload?.ok || !payload.config) return;
        const normalized = normalizeSiteConfig(payload.config);
        setConfig(normalized);
        writeCachedConfig(normalized);
      })
      .catch(() => {
        // Fallback to cached local config cleanly
      });
    return () => {
      active = false;
    };
  }, []);

  // Keep browser favicon in sync with custom logo
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    link.href = config.logoUrl || '/favicon.svg';
  }, [config.logoUrl]);

  const updateConfig = useCallback(
    async (updater: Partial<SiteConfig> | ((prev: SiteConfig) => SiteConfig)) => {
      const current = configRef.current;
      const merged =
        typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      const normalized = normalizeSiteConfig(merged);

      setConfig(normalized);
      writeCachedConfig(normalized);
      setSaving(true);
      setSaveError(null);

      try {
        const res = await fetch('/api/site-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(normalized),
        });
        if (!res.ok) {
          const errBody = (await res.json().catch(() => ({}))) as { error?: string };
          setSaveError(errBody.error || 'Saved locally, but server sync failed.');
          return;
        }
        const payload = (await res.json().catch(() => null)) as { config?: unknown } | null;
        if (payload?.config) {
          const serverConfig = normalizeSiteConfig(payload.config);
          setConfig(serverConfig);
          writeCachedConfig(serverConfig);
        }
        setLastSavedAt(new Date().toLocaleTimeString());
      } catch {
        setSaveError('Saved locally in browser. Server sync is currently unavailable.');
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const uploadMediaFile = useCallback(async (file: File): Promise<string> => {
    const allowedPrefix = file.type.startsWith('image/') || file.type.startsWith('video/');
    if (!allowedPrefix) {
      throw new Error('Please upload an image (PNG, JPG, WEBP, GIF, SVG) or video (MP4, WEBM, MOV).');
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (res.ok) {
      const payload = (await res.json()) as { url?: string };
      if (payload.url) {
        return payload.url;
      }
    }

    // Fallback for small images or short videos if running on static/serverless host without persistent /api/upload
    const supportsInlineFallback =
      (file.type.startsWith('image/') && file.type !== 'image/svg+xml') ||
      file.type === 'video/mp4' ||
      file.type === 'video/webm';

    if (supportsInlineFallback && file.size <= 1_200_000) {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Could not read uploaded file.'));
          }
        };
        reader.onerror = () => reject(new Error('Could not read uploaded file.'));
        reader.readAsDataURL(file);
      });
    }

    const errData = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errData.error || 'Upload failed. Please try a smaller file or valid URL.');
  }, []);

  const resetAllConfig = useCallback(async () => {
    await updateConfig(DEFAULT_SITE_CONFIG);
  }, [updateConfig]);

  const triggerLoadingPreview = useCallback(() => {
    setPreviewToken((prev) => prev + 1);
  }, []);

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        saving,
        lastSavedAt,
        saveError,
        previewToken,
        triggerLoadingPreview,
        updateConfig,
        uploadMediaFile,
        resetAllConfig,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfigContextValue {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error('useSiteConfig must be used inside SiteConfigProvider.');
  }
  return ctx;
}
