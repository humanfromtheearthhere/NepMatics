import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  dispatchContactEmail,
  sanitizeMultiline,
  sanitizeSingleLine,
} from '../lib/mailer.ts';

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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
    return jsonResponse(
      {
        error:
          mailResult.error ||
          `Unable to deliver email to ${mailResult.recipientEmail} right now.`,
      },
      502
    );
  }

  const entry: ContactSubmission = {
    ...mailPayload,
    recipientEmail: mailResult.recipientEmail,
    emailDispatched: mailResult.dispatched,
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
    if (!mailResult.dispatched) {
      return jsonResponse(
        { error: 'Unable to record your inquiry right now. Please try again shortly.' },
        500
      );
    }
  }

  return jsonResponse(
    {
      ok: true,
      referenceId: entry.id,
      submittedAt: entry.submittedAt,
      recipientEmail: mailResult.recipientEmail,
      emailDispatched: mailResult.dispatched,
      message: mailResult.dispatched
        ? `Your inquiry has been delivered directly to ${mailResult.recipientEmail}.`
        : 'Your inquiry has been recorded on the server.',
    },
    201
  );
}
