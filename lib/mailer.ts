import nodemailer from 'nodemailer';

export interface ContactMailPayload {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export interface MailDispatchResult {
  dispatched: boolean;
  provider: 'smtp' | 'resend' | 'none';
  recipientEmail: string;
  error?: string;
}

const DEFAULT_RECIPIENT = 'humanfromtheearthhere@gmail.com';

export function getRecipientEmail(): string {
  const configured = process.env.CONTACT_RECIPIENT_EMAIL?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_RECIPIENT;
}

export function sanitizeSingleLine(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
}

export function sanitizeMultiline(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function dispatchContactEmail(
  entry: ContactMailPayload
): Promise<MailDispatchResult> {
  const recipientEmail = getRecipientEmail();
  const safeSubject = `[NEPMATICS] ${entry.subject}`;

  const textBody = [
    `Reference ID: ${entry.id}`,
    `Submitted At: ${entry.submittedAt}`,
    `From: ${entry.name} <${entry.email}>`,
    `Subject: ${entry.subject}`,
    '',
    'Message:',
    entry.message,
  ].join('\n');

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; line-height: 1.6;">
      <h2 style="margin: 0 0 12px; font-size: 18px;">New NEPMATICS Collaboration Inquiry</h2>
      <p style="margin: 0 0 6px;"><strong>Reference ID:</strong> ${escapeHtml(entry.id)}</p>
      <p style="margin: 0 0 6px;"><strong>From:</strong> ${escapeHtml(entry.name)} (&lt;${escapeHtml(entry.email)}&gt;)</p>
      <p style="margin: 0 0 6px;"><strong>Subject:</strong> ${escapeHtml(entry.subject)}</p>
      <p style="margin: 0 0 16px;"><strong>Submitted At:</strong> ${escapeHtml(entry.submittedAt)}</p>
      <div style="padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; white-space: pre-wrap;">${escapeHtml(entry.message)}</div>
    </div>
  `;

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  if (smtpUser && smtpPass) {
    const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = port === 465;

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"NEPMATICS Website" <${smtpUser}>`,
        to: recipientEmail,
        replyTo: entry.email,
        subject: safeSubject,
        text: textBody,
        html: htmlBody,
      });

      return { dispatched: true, provider: 'smtp', recipientEmail };
    } catch {
      return {
        dispatched: false,
        provider: 'smtp',
        recipientEmail,
        error: 'Unable to send email through the configured SMTP server.',
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
          recipientEmail,
          error: 'Email service returned an error while sending your message.',
        };
      }

      return { dispatched: true, provider: 'resend', recipientEmail };
    } catch {
      return {
        dispatched: false,
        provider: 'resend',
        recipientEmail,
        error: 'Unable to reach the configured email delivery service.',
      };
    }
  }

  return { dispatched: false, provider: 'none', recipientEmail };
}
