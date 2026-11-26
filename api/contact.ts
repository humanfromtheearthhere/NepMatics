import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown> | null = null;
  try {
    const parsed: unknown = await request.json();
    if (parsed && typeof parsed === 'object') {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    return jsonResponse({ error: 'Invalid request payload.' }, 400);
  }

  if (!body) {
    return jsonResponse({ error: 'Invalid request payload.' }, 400);
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
    return jsonResponse(
      {
        error: 'Please review the highlighted fields and try again.',
        fieldErrors,
      },
      400
    );
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
    const tmpDir = path.resolve(os.tmpdir(), 'nepmatics-inquiries');
    const storePath = path.resolve(tmpDir, 'inquiries.json');
    if (!storePath.startsWith(tmpDir + path.sep)) {
      throw new Error('Invalid inquiry storage path.');
    }
    await fs.mkdir(tmpDir, { recursive: true });
    let existing: ContactSubmission[] = [];
    try {
      const raw = await fs.readFile(storePath, 'utf-8');
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
    await fs.writeFile(storePath, JSON.stringify(existing, null, 2), 'utf-8');
  } catch {
    return jsonResponse(
      { error: 'Unable to record your inquiry right now. Please try again shortly.' },
      500
    );
  }

  return jsonResponse(
    {
      ok: true,
      referenceId: entry.id,
      submittedAt: entry.submittedAt,
      message: 'Your inquiry has been recorded by NepMatics.',
    },
    201
  );
}
