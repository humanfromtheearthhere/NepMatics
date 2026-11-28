import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

interface ApproachVideoMap {
  '01': string | null;
  '02': string | null;
  '03': string | null;
  '04': string | null;
}

interface SiteConfig {
  logoUrl: string | null;
  showBrandText: boolean;
  loadingVideoUrl: string;
  loadingDurationMs: number;
  approachVideos: ApproachVideoMap;
}

const DEFAULT_LOADING_VIDEO_URL = '/assets/aistudio/loading_fcae490c.mp4';

const DEFAULT_SITE_CONFIG: SiteConfig = {
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

const SAFE_DATA_MEDIA_PREFIXES = [
  'data:image/png;base64,',
  'data:image/jpeg;base64,',
  'data:image/webp;base64,',
  'data:image/gif;base64,',
  'data:video/mp4;base64,',
  'data:video/webm;base64,',
];

function sanitizeMediaUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2_000_000) return null;
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) return null;

  if (trimmed.startsWith('/assets/') || trimmed.startsWith('/api/media/')) {
    if (trimmed.includes('..') || trimmed.includes('\\')) return null;
    return trimmed;
  }

  for (const prefix of SAFE_DATA_MEDIA_PREFIXES) {
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

function normalizeSiteConfig(input: unknown): SiteConfig {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const logoUrl = sanitizeMediaUrl(raw.logoUrl);
  const showBrandText =
    typeof raw.showBrandText === 'boolean' ? raw.showBrandText : DEFAULT_SITE_CONFIG.showBrandText;
  const loadingVideoUrl = sanitizeMediaUrl(raw.loadingVideoUrl) || DEFAULT_LOADING_VIDEO_URL;
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

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getConfigStorePath(): { dir: string; file: string } {
  const dir = path.resolve(os.tmpdir(), 'nepmatics-config');
  const file = path.resolve(dir, 'site-config.json');
  if (!file.startsWith(dir + path.sep)) {
    throw new Error('Invalid config storage path.');
  }
  return { dir, file };
}

export async function GET(): Promise<Response> {
  try {
    const { file } = getConfigStorePath();
    const raw = await fs.readFile(file, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    return jsonResponse({ ok: true, config: normalizeSiteConfig(parsed) }, 200);
  } catch {
    return jsonResponse({ ok: true, config: DEFAULT_SITE_CONFIG }, 200);
  }
}

export async function PUT(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid configuration JSON.' }, 400);
  }

  const normalized = normalizeSiteConfig(body);
  try {
    const { dir, file } = getConfigStorePath();
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(normalized, null, 2), 'utf-8');
  } catch {
    // Still return normalized config if temp write fails
  }

  return jsonResponse({ ok: true, config: normalized }, 200);
}
