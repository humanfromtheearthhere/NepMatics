import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

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

// Confine persistence path inside DATA_DIR
if (!INQUIRIES_FILE.startsWith(DATA_DIR + path.sep)) {
  throw new Error('Invalid inquiries storage path configuration.');
}

// Simple per-IP sliding window rate limiter for contact submissions
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
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

function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
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
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'nepmatics-web' });
  });

  // Publications archive endpoint (honest empty state until research outputs are released)
  app.get('/api/publications', (_req: Request, res: Response) => {
    const publications: PublicationEntry[] = [];
    res.json({ publications });
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

    const name = sanitizeText(body.name);
    const email = sanitizeText(body.email);
    const subject = sanitizeText(body.subject);
    const message = sanitizeText(body.message);

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

    const entry: ContactSubmission = {
      id: referenceId,
      name,
      email,
      subject,
      message,
      submittedAt: now.toISOString(),
    };

    try {
      await persistInquiry(entry);
      res.status(201).json({
        ok: true,
        referenceId: entry.id,
        submittedAt: entry.submittedAt,
        message: 'Your inquiry has been recorded by NepMatics.',
      });
    } catch {
      res.status(500).json({
        error: 'Unable to record your inquiry right now. Please try again shortly.',
      });
    }
  });

  if (!IS_PROD) {
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
