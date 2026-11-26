export interface ApproachVideoMap {
  '01': string | null;
  '02': string | null;
  '03': string | null;
  '04': string | null;
}

export interface SiteConfig {
  logoUrl: string | null;
  showBrandText: boolean;
  loadingVideoUrl: string;
  loadingDurationMs: number;
  approachVideos: ApproachVideoMap;
}

export const DEFAULT_LOADING_VIDEO_URL = '/assets/aistudio/loading_fcae490c.mp4';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  logoUrl: null,
  showBrandText: true,
  loadingVideoUrl: DEFAULT_LOADING_VIDEO_URL,
  loadingDurationMs: 1600,
  approachVideos: {
    '01': '/assets/approach/discover.mp4',
    '02': '/assets/approach/research.mp4',
    '03': '/assets/approach/experiment.mp4',
    '04': '/assets/approach/engineer.mp4',
  },
};

const SAFE_DATA_IMAGE_PREFIXES = [
  'data:image/png;base64,',
  'data:image/jpeg;base64,',
  'data:image/webp;base64,',
  'data:image/gif;base64,',
];

export function sanitizeMediaUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2_000_000) return null;
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return null;

  if (trimmed.startsWith('/assets/') || trimmed.startsWith('/api/media/')) {
    if (trimmed.includes('..') || trimmed.includes('\\')) return null;
    return trimmed;
  }

  for (const prefix of SAFE_DATA_IMAGE_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return trimmed;
    }
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeSiteConfig(input: unknown): SiteConfig {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;

  const logoUrl = sanitizeMediaUrl(raw.logoUrl);
  const showBrandText =
    typeof raw.showBrandText === 'boolean' ? raw.showBrandText : DEFAULT_SITE_CONFIG.showBrandText;

  const loadingCandidate = sanitizeMediaUrl(raw.loadingVideoUrl);
  const loadingVideoUrl = loadingCandidate || DEFAULT_LOADING_VIDEO_URL;

  const rawDuration = Number(raw.loadingDurationMs);
  const loadingDurationMs =
    Number.isFinite(rawDuration) && rawDuration >= 600 && rawDuration <= 5000
      ? Math.round(rawDuration)
      : DEFAULT_SITE_CONFIG.loadingDurationMs;

  const rawApproach = (
    raw.approachVideos && typeof raw.approachVideos === 'object' ? raw.approachVideos : {}
  ) as Record<string, unknown>;

  return {
    logoUrl,
    showBrandText,
    loadingVideoUrl,
    loadingDurationMs,
    approachVideos: {
      '01':
        '01' in rawApproach
          ? sanitizeMediaUrl(rawApproach['01'])
          : DEFAULT_SITE_CONFIG.approachVideos['01'],
      '02':
        '02' in rawApproach
          ? sanitizeMediaUrl(rawApproach['02'])
          : DEFAULT_SITE_CONFIG.approachVideos['02'],
      '03':
        '03' in rawApproach
          ? sanitizeMediaUrl(rawApproach['03'])
          : DEFAULT_SITE_CONFIG.approachVideos['03'],
      '04':
        '04' in rawApproach
          ? sanitizeMediaUrl(rawApproach['04'])
          : DEFAULT_SITE_CONFIG.approachVideos['04'],
    },
  };
}

export function sanitizeSvgContent(svgText: string): string {
  return svgText
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}
