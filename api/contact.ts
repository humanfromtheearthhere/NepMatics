import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import nodemailer from 'nodemailer';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  emailDispatched: boolean;
}

interface MailDispatchResult {
  dispatched: boolean;
  provider: 'smtp' | 'resend' | 'formsubmit' | 'none';
  activationRequired?: boolean;
  error?: string;
}

const PRIVATE_RECIPIENT = 'humanfromtheearthhere@gmail.com';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getRecipientEmail(): string {
  const configured = process.env.CONTACT_RECIPIENT_EMAIL?.trim();
  return configured && configured.length > 0 ? configured : PRIVATE_RECIPIENT;
}

function sanitizeSingleLine(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
}

function sanitizeMultiline(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function resolveSafeOrigin(candidate?: string): string {
  const fallbacks = [candidate, process.env.APP_URL, 'https://nepmatics.com'];
  for (const item of fallbacks) {
    if (!item) continue;
    try {
      const parsed = new URL(item.trim());
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // Try next fallback
    }
  }
  return 'https://nepmatics.com';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function dispatchContactEmail(entry: {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  siteOrigin?: string;
}): Promise<MailDispatchResult> {
  const recipientEmail = getRecipientEmail();
  const safeSubject = `[NEPMATICS Form] ${entry.subject}`;

  const textBody = [
    'NEPMATICS — COLLABORATION & RESEARCH FORM SUBMISSION',
    '====================================================',
    `Reference ID : ${entry.id}`,
    `Submitted At : ${entry.submittedAt}`,
    `Full Name    : ${entry.name}`,
    `Reply Email  : ${entry.email}`,
    `Subject      : ${entry.subject}`,
    '',
    'Message:',
    '----------------------------------------------------',
    entry.message,
  ].join('\n');

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; line-height: 1.6; max-width: 640px; margin: 0 auto;">
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: #0f172a; color: #ffffff; padding: 18px 22px;">
          <div style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #fb923c; font-weight: 600;">NEPMATICS · Automated Form Delivery</div>
          <h2 style="margin: 6px 0 0; font-size: 18px; font-weight: 600;">New Collaboration &amp; Research Inquiry</h2>
        </div>
        <div style="padding: 20px 22px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
            <tr>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 130px;"><strong>Reference ID</strong></td>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${escapeHtml(entry.id)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;"><strong>Full Name</strong></td>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(entry.name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;"><strong>Reply Email</strong></td>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(entry.email)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;"><strong>Subject</strong></td>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(entry.subject)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #64748b;"><strong>Submitted At</strong></td>
              <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">${escapeHtml(entry.submittedAt)}</td>
            </tr>
          </table>
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px;">Message</div>
          <div style="padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; white-space: pre-wrap; font-size: 14px;">${escapeHtml(entry.message)}</div>
        </div>
      </div>
    </div>
  `;

  const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpUser =
    process.env.SMTP_USER?.trim() ||
    (smtpPass && host.includes('gmail') ? recipientEmail : '');

  if (smtpUser && smtpPass) {
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = port === 465;
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: `"NEPMATICS Website" <${smtpUser}>`,
        to: recipientEmail,
        replyTo: entry.email,
        subject: safeSubject,
        text: textBody,
        html: htmlBody,
      });
      return { dispatched: true, provider: 'smtp' };
    } catch {
      return {
        dispatched: false,
        provider: 'smtp',
        error: 'Unable to send email through the configured mail server.',
      };
    }
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const fromAddress =
      process.env.RESEND_FROM?.trim() || 'NEPMATICS <onboarding@resend.dev>';
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [recipientEmail],
          reply_to: entry.email,
          subject: safeSubject,
          text: textBody,
          html: htmlBody,
        }),
      });
      if (!response.ok) {
        return {
          dispatched: false,
          provider: 'resend',
          error: 'Email service returned an error while sending your message.',
        };
      }
      return { dispatched: true, provider: 'resend' };
    } catch {
      return {
        dispatched: false,
        provider: 'resend',
        error: 'Unable to reach the configured email delivery service.',
      };
    }
  }

  const origin = resolveSafeOrigin(entry.siteOrigin);
  const formSubmitTarget = process.env.FORMSUBMIT_TOKEN?.trim() || recipientEmail;

  try {
    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(formSubmitTarget)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Origin: origin,
          Referer: `${origin}/`,
          'User-Agent': 'Mozilla/5.0 (compatible; NepMaticsMailer/1.0)',
        },
        body: JSON.stringify({
          name: entry.name,
          email: entry.email,
          subject: entry.subject,
          reference_id: entry.id,
          submitted_at: entry.submittedAt,
          message: entry.message,
          _subject: safeSubject,
          _replyto: entry.email,
          _template: 'table',
          _captcha: 'false',
          _url: `${origin}/#contact`,
        }),
      }
    );

    const data = (await response.json().catch(() => null)) as {
      success?: boolean | string;
      message?: string;
    } | null;

    const succeeded =
      response.ok &&
      data &&
      (data.success === true || String(data.success).toLowerCase() === 'true');

    if (succeeded) {
      return { dispatched: true, provider: 'formsubmit' };
    }

    const msg = typeof data?.message === 'string' ? data.message : '';
    if (msg.toLowerCase().includes('activat')) {
      return { dispatched: false, provider: 'formsubmit', activationRequired: true };
    }

    return { dispatched: false, provider: 'formsubmit' };
  } catch {
    return { dispatched: false, provider: 'formsubmit' };
  }
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

  const originHeader =
    request.headers.get('origin') ||
    (request.headers.get('host') ? `https://${request.headers.get('host')}` : undefined);

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
    return jsonResponse(
      {
        error:
          mailResult.error ||
          'Unable to deliver your inquiry right now. Please try again shortly.',
      },
      502
    );
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
      emailDispatched: mailResult.dispatched,
      activationRequired: Boolean(mailResult.activationRequired),
      message: mailResult.dispatched
        ? 'Your inquiry has been delivered directly to the NepMatics team.'
        : mailResult.activationRequired
          ? 'Your inquiry is recorded and a one-time email activation prompt was sent to the team inbox.'
          : 'Your inquiry has been recorded securely on the server.',
    },
    201
  );
}
