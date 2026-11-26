import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import {
  dispatchContactEmail,
  sanitizeMultiline,
  sanitizeSingleLine,
} from './lib/mailer.ts';
import {
  DEFAULT_SITE_CONFIG,
  normalizeSiteConfig,
  sanitizeSvgContent,
  type SiteConfig,
} from './lib/siteConfig.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  emailDispatched: boolean;
}

interface PublicationEntry {
  id: string;
  title: string;
  category: 'paper' | 'report' | 'dataset' | 'experiment';
  authors: string[];
  year: number;
  abstract: string;
  url?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const INQUIRIES_FILE = path.resolve(DATA_DIR, 'inquiries.json');
const SITE_CONFIG_FILE = path.resolve(DATA_DIR, 'site-config.json');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');

if (
  !INQUIRIES_FILE.startsWith(DATA_DIR + path.sep) ||
  !SITE_CONFIG_FILE.startsWith(DATA_DIR + path.sep) ||
  !UPLOADS_DIR.startsWith(DATA_DIR + path.sep)
) {
  throw new Error('Invalid server storage path configuration.');
}

const ALLOWED_MEDIA_MIME: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

const SAFE_MEDIA_FILENAME = /^[a-f0-9-]{8,64}\.(png|jpg|webp|gif|svg|mp4|webm|mov)$/;

async function readSiteConfig(): Promise<SiteConfig> {
  try {
    const raw = await fs.readFile(SITE_CONFIG_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    return normalizeSiteConfig(parsed);
  } catch (err) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr.code !== 'ENOENT') {
      console.warn('[config] Failed to read site-config.json');
    }
    return DEFAULT_SITE_CONFIG;
  }
}

async function writeSiteConfig(config: SiteConfig): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SITE_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    rateLimitMap.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function persistInquiry(entry: ContactSubmission): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let existing: ContactSubmission[] = [];
  try {
    const raw = await fs.readFile(INQUIRIES_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      existing = parsed as ContactSubmission[];
    }
  } catch (err) {
    const nodeErr = err as NodeJS.ErrnoException;
    if (nodeErr.code !== 'ENOENT') {
      throw err;
    }
  }
  existing.push(entry);
  await fs.writeFile(INQUIRIES_FILE, JSON.stringify(existing, null, 2), 'utf-8');
}

async function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '256kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'nepmatics-web' });
  });

  app.get('/api/publications', (_req: Request, res: Response) => {
    const publications: PublicationEntry[] = [];
    res.json({ publications });
  });

  app.get('/api/site-config', async (_req: Request, res: Response) => {
    const config = await readSiteConfig();
    res.json({ ok: true, config });
  });

  app.put('/api/site-config', async (req: Request, res: Response) => {
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ error: 'Invalid site configuration payload.' });
      return;
    }
    const normalized = normalizeSiteConfig(req.body);
    try {
      await writeSiteConfig(normalized);
      res.json({ ok: true, config: normalized });
    } catch {
      res.status(500).json({ error: 'Unable to save site configuration.' });
    }
  });

  app.post(
    '/api/upload',
    express.raw({ type: Object.keys(ALLOWED_MEDIA_MIME), limit: '25mb' }),
    async (req: Request, res: Response) => {
      const contentTypeHeader = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
      const ext = ALLOWED_MEDIA_MIME[contentTypeHeader];
      if (!ext) {
        res.status(400).json({
          error: 'Unsupported file type. Upload PNG, JPG, WEBP, GIF, SVG, MP4, WEBM, or MOV.',
        });
        return;
      }

      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        res.status(400).json({ error: 'Uploaded file is empty.' });
        return;
      }

      const filename = `${crypto.randomUUID()}${ext}`;
      const targetPath = path.resolve(UPLOADS_DIR, filename);
      if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
        res.status(400).json({ error: 'Invalid upload path.' });
        return;
      }

      try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        if (ext === '.svg') {
          const cleanSvg = sanitizeSvgContent(req.body.toString('utf-8'));
          await fs.writeFile(targetPath, cleanSvg, 'utf-8');
        } else {
          await fs.writeFile(targetPath, req.body);
        }
        res.status(201).json({
          ok: true,
          url: `/api/media/${filename}`,
          filename,
          mimeType: contentTypeHeader,
        });
      } catch {
        res.status(500).json({ error: 'Failed to store uploaded file.' });
      }
    }
  );

  app.get('/api/media/:filename', async (req: Request, res: Response) => {
    const rawParam = req.params.filename;
    const filename = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    if (!filename || !SAFE_MEDIA_FILENAME.test(filename)) {
      res.status(404).json({ error: 'Media asset not found.' });
      return;
    }

    const filePath = path.resolve(UPLOADS_DIR, filename);
    if (!filePath.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(404).json({ error: 'Media asset not found.' });
      return;
    }

    try {
      await fs.access(filePath);
    } catch {
      res.status(404).json({ error: 'Media asset not found.' });
      return;
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (filename.endsWith('.svg')) {
      res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    }
    res.sendFile(filePath);
  });

  app.post('/api/contact', async (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
      res.status(429).json({
        error: 'Too many inquiries submitted recently. Please wait a few minutes before trying again.',
      });
      return;
    }

    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid request payload.' });
      return;
    }

    const name = sanitizeSingleLine(body.name);
    const email = sanitizeSingleLine(body.email);
    const subject = sanitizeSingleLine(body.subject);
    const message = sanitizeMultiline(body.message);

    const fieldErrors: Record<string, string> = {};

    if (name.length < 2 || name.length > 100) {
      fieldErrors.name = 'Please enter your name (2 to 100 characters).';
    }
    if (!EMAIL_PATTERN.test(email) || email.length > 160) {
      fieldErrors.email = 'Please provide a valid email address.';
    }
    if (subject.length < 3 || subject.length > 150) {
      fieldErrors.subject = 'Please enter a clear subject (3 to 150 characters).';
    }
    if (message.length < 15 || message.length > 3000) {
      fieldErrors.message = 'Please include a message of at least 15 characters (max 3000).';
    }

    if (Object.keys(fieldErrors).length > 0) {
      res.status(400).json({
        error: 'Please review the highlighted fields and try again.',
        fieldErrors,
      });
      return;
    }

    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const token = crypto.randomBytes(3).toString('hex').toUpperCase();
    const referenceId = `NM-${dateStamp}-${token}`;

    const originHeader =
      typeof req.headers.origin === 'string'
        ? req.headers.origin
        : typeof req.headers.host === 'string'
          ? `${req.protocol || 'https'}://${req.headers.host}`
          : undefined;

    const mailPayload = {
      id: referenceId,
      name,
      email,
      subject,
      message,
      submittedAt: now.toISOString(),
      siteOrigin: originHeader,
    };

    const mailResult = await dispatchContactEmail(mailPayload);

    if (
      (mailResult.provider === 'smtp' || mailResult.provider === 'resend') &&
      !mailResult.dispatched
    ) {
      res.status(502).json({
        error:
          mailResult.error ||
          'Unable to deliver your inquiry right now. Please try again shortly.',
      });
      return;
    }

    const entry: ContactSubmission = {
      id: mailPayload.id,
      name: mailPayload.name,
      email: mailPayload.email,
      subject: mailPayload.subject,
      message: mailPayload.message,
      submittedAt: mailPayload.submittedAt,
      emailDispatched: mailResult.dispatched,
    };

    try {
      await persistInquiry(entry);
      res.status(201).json({
        ok: true,
        referenceId: entry.id,
        submittedAt: entry.submittedAt,
        emailDispatched: mailResult.dispatched,
        activationRequired: Boolean(mailResult.activationRequired),
        message: mailResult.dispatched
          ? 'Your inquiry has been delivered directly to the NepMatics team.'
          : mailResult.activationRequired
            ? 'Your inquiry is recorded and a one-time email activation prompt was sent to the team inbox.'
            : 'Your inquiry has been recorded securely on the server.',
      });
    } catch {
      if (mailResult.dispatched) {
        res.status(201).json({
          ok: true,
          referenceId: entry.id,
          submittedAt: entry.submittedAt,
          emailDispatched: true,
          activationRequired: false,
          message: 'Your inquiry has been delivered directly to the NepMatics team.',
        });
        return;
      }
      res.status(500).json({
        error: 'Unable to record your inquiry right now. Please try again shortly.',
      });
    }
  });

  if (!IS_PROD) {
    app.use(express.static(path.resolve(process.cwd(), 'public')));
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEPMATICS server listening on http://0.0.0.0:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
