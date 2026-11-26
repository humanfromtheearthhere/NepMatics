import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';

interface ContactSectionProps {
  presetSubject?: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface SubmissionReceipt {
  referenceId: string;
  submittedAt: string;
  message: string;
}

const COLLABORATION_PROFILES = [
  {
    title: 'Researchers & Academics',
    detail: 'Joint problem formulation, theoretical inquiry, and open co-authorship.',
  },
  {
    title: 'Students & Fellows',
    detail: 'Curious minds across Nepal and beyond seeking rigorous foundational R&D.',
  },
  {
    title: 'Engineers & Developers',
    detail: 'Systems builders across ML infrastructure, robotics, security, and scientific tooling.',
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactSection({ presetSubject }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);

  useEffect(() => {
    if (presetSubject) {
      setSubject(presetSubject);
      setReceipt(null);
    }
  }, [presetSubject]);

  function validateClient(): FieldErrors {
    const errors: FieldErrors = {};
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      errors.name = 'Please enter your name (2 to 100 characters).';
    }
    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 160) {
      errors.email = 'Please enter a valid email address.';
    }
    if (cleanSubject.length < 3 || cleanSubject.length > 150) {
      errors.subject = 'Please enter a subject (3 to 150 characters).';
    }
    if (cleanMessage.length < 15 || cleanMessage.length > 3000) {
      errors.message = 'Please write at least 15 characters describing your inquiry.';
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const validation = validateClient();
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        referenceId?: string;
        submittedAt?: string;
        message?: string;
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!response.ok) {
        if (payload.fieldErrors) {
          setFieldErrors(payload.fieldErrors);
        }
        setServerError(
          payload.error || 'Submission could not be completed. Please verify your inputs.'
        );
        return;
      }

      setReceipt({
        referenceId: payload.referenceId || 'Recorded',
        submittedAt: payload.submittedAt || new Date().toISOString(),
        message: payload.message || 'Your inquiry has been recorded by NepMatics.',
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setFieldErrors({});
    } catch {
      setServerError(
        'Network error while contacting the NepMatics server. Please check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs tracking-[0.16em] text-[#D9480F] uppercase">
              06. Join NepMatics
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Collaborate on What Comes Next.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-slate-600">
              We welcome correspondence from researchers, students, software developers, hardware
              engineers, and potential collaborators interested in foundational technology R&amp;D
              originating in Nepal.
            </p>

            <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              {COLLABORATION_PROFILES.map((profile) => (
                <div key={profile.title} className="py-4">
                  <h3 className="font-display text-sm font-semibold text-slate-950">
                    {profile.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {profile.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 font-mono text-xs text-slate-500">
              <p>Origin: Nepal · Verified Server Recording</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-8">
              {receipt ? (
                <div role="status" className="space-y-5 py-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-display text-xl font-semibold text-slate-950">
                        Inquiry Recorded
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {receipt.message}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                        Reference ID
                      </p>
                      <p className="mt-1 font-mono text-sm font-semibold text-slate-950 tabular-nums">
                        {receipt.referenceId}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                        Recorded At (UTC)
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-600 tabular-nums">
                        {receipt.submittedAt}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReceipt(null)}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-900 hover:border-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F]"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="border-b border-slate-200 pb-4">
                    <h3 className="font-display text-lg font-semibold text-slate-950">
                      Collaboration &amp; Research Inquiry
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Complete all fields below to submit directly.
                    </p>
                  </div>

                  {serverError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-medium text-slate-800"
                      >
                        Full Name
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (fieldErrors.name) {
                            setFieldErrors((prev) => ({ ...prev, name: undefined }));
                          }
                        }}
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
                        placeholder="Aarav Shrestha"
                        className={`mt-2 block w-full min-h-[44px] rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9480F] ${
                          fieldErrors.name ? 'border-rose-500' : 'border-slate-300'
                        }`}
                      />
                      {fieldErrors.name && (
                        <p id="contact-name-error" className="mt-1.5 text-xs text-rose-600">
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-medium text-slate-800"
                      >
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
                        placeholder="name@institution.org"
                        className={`mt-2 block w-full min-h-[44px] rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9480F] ${
                          fieldErrors.email ? 'border-rose-500' : 'border-slate-300'
                        }`}
                      />
                      {fieldErrors.email && (
                        <p id="contact-email-error" className="mt-1.5 text-xs text-rose-600">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-medium text-slate-800"
                    >
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        if (fieldErrors.subject) {
                          setFieldErrors((prev) => ({ ...prev, subject: undefined }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.subject)}
                      aria-describedby={fieldErrors.subject ? 'contact-subject-error' : undefined}
                      placeholder="Research collaboration, engineering fellowship, or GeoMind inquiry"
                      className={`mt-2 block w-full min-h-[44px] rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9480F] ${
                        fieldErrors.subject ? 'border-rose-500' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.subject && (
                      <p id="contact-subject-error" className="mt-1.5 text-xs text-rose-600">
                        {fieldErrors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium text-slate-800"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (fieldErrors.message) {
                          setFieldErrors((prev) => ({ ...prev, message: undefined }));
                        }
                      }}
                      aria-invalid={Boolean(fieldErrors.message)}
                      aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
                      placeholder="Share your background, research focus, or how you would like to collaborate with NepMatics."
                      className={`mt-2 block w-full rounded-lg border bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9480F] ${
                        fieldErrors.message ? 'border-rose-500' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.message && (
                      <p id="contact-message-error" className="mt-1.5 text-xs text-rose-600">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <span className="font-mono text-[11px] text-slate-500">
                      Direct server verification enabled
                    </span>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#D9480F] px-7 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9480F] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                    >
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
