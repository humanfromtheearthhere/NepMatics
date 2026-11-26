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
  recipientEmail: string;
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

if (!INQUIRIES_FILE.startsWith(DATA_DIR + path.sep)) {
  throw new Error('Invalid inquiries storage path configuration.');
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
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'nepmatics-web' });
  });

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

    const mailPayload = {
      id: referenceId,
      name,
      email,
      subject,
      message,
      submittedAt: now.toISOString(),
    };

    const mailResult = await dispatchContactEmail(mailPayload);

    if (mailResult.provider !== 'none' && !mailResult.dispatched) {
      res.status(502).json({
        error:
          mailResult.error ||
          `Unable to deliver email to ${mailResult.recipientEmail} right now.`,
      });
      return;
    }

    const entry: ContactSubmission = {
      ...mailPayload,
      recipientEmail: mailResult.recipientEmail,
      emailDispatched: mailResult.dispatched,
    };

    try {
      await persistInquiry(entry);
      res.status(201).json({
        ok: true,
        referenceId: entry.id,
        submittedAt: entry.submittedAt,
        recipientEmail: mailResult.recipientEmail,
        emailDispatched: mailResult.dispatched,
        message: mailResult.dispatched
          ? `Your inquiry has been delivered directly to ${mailResult.recipientEmail}.`
          : 'Your inquiry has been recorded on the server.',
      });
    } catch {
      if (mailResult.dispatched) {
        res.status(201).json({
          ok: true,
          referenceId: entry.id,
          submittedAt: entry.submittedAt,
          recipientEmail: mailResult.recipientEmail,
          emailDispatched: true,
          message: `Your inquiry has been delivered directly to ${mailResult.recipientEmail}.`,
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
