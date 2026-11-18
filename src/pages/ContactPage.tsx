import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { siteConfig, buildWhatsAppUrl } from '../data/siteConfig';

interface FormState {
  name: string;
  email: string;
  phone: string;
  studentClass: string;
  message: string;
  botField: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  studentClass?: string;
  message?: string;
}

function encodeFormData(data: Record<string, string>): string {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const requestedProgrammeId = searchParams.get('programme');

  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    studentClass: '',
    message: '',
    botField: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [lastEnquirySummary, setLastEnquirySummary] = useState<{
    name: string;
    studentClass: string;
    message: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestedProgrammeId) return;
    const matched = siteConfig.services.find((s) => s.id === requestedProgrammeId);
    if (matched) {
      setFormState((prev) => {
        if (prev.message.trim().length > 0) return prev;
        return {
          ...prev,
          message: `Hello BrightPath Home Tutors, I would like to enquire about ${matched.title} (${matched.samplePrice} ${matched.billingCycle}).`,
        };
      });
    }
  }, [requestedProgrammeId]);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!formState.name.trim()) {
      nextErrors.name = 'Please enter your full name.';
    }
    if (!formState.email.trim()) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!formState.phone.trim()) {
      nextErrors.phone = 'Please enter your phone or WhatsApp number.';
    } else if (formState.phone.replace(/\D/g, '').length < 7) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }
    if (!formState.studentClass.trim()) {
      nextErrors.studentClass = 'Please select or enter the student’s class.';
    }
    if (!formState.message.trim()) {
      nextErrors.message = 'Please share the subjects needed and your preferred location/schedule.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formState.name.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      studentClass: formState.studentClass.trim(),
      message: formState.message.trim(),
      botField: formState.botField,
    };

    try {
      let confirmedRef: string | null = null;
      const apiResponse = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (apiResponse.ok) {
        const data = (await apiResponse.json()) as { ok?: boolean; referenceId?: string };
        confirmedRef = data.referenceId || null;
      } else if (apiResponse.status === 404 || apiResponse.status === 405) {
        // Static Netlify hosting fallback
        const netlifyResponse = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodeFormData({
            'form-name': 'contact',
            'bot-field': payload.botField,
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            studentClass: payload.studentClass,
            message: payload.message,
          }),
        });
        if (!netlifyResponse.ok) {
          throw new Error('Submission response was not ok');
        }
      } else {
        const errData = (await apiResponse.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errData?.error || 'Submission response was not ok');
      }

      setReferenceId(confirmedRef);
      setLastEnquirySummary({
        name: payload.name,
        studentClass: payload.studentClass,
        message: payload.message,
      });
      setSubmitted(true);
      setFormState({
        name: '',
        email: '',
        phone: '',
        studentClass: '',
        message: '',
        botField: '',
      });
    } catch (err) {
      const msg = err instanceof Error && err.message !== 'Submission response was not ok'
        ? err.message
        : `We could not transmit the web form right now. Please message us directly on WhatsApp (${siteConfig.contact.whatsapp}) or call ${siteConfig.contact.phone}.`;
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappHref = buildWhatsAppUrl(
    siteConfig.contact.whatsapp,
    'Hello BrightPath Home Tutors, I would like to book a home tutoring lesson for my child.'
  );

  return (
    <div>
      {/* Header */}
      <section className="bg-[#FCF9F0]/60 border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-medium text-[#8C6A1B]">
              {siteConfig.contactPage.kicker}
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#0B1F3A] tracking-tight">
              {siteConfig.contactPage.headline}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {siteConfig.contactPage.intro}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="enquiry" className="scroll-mt-20 py-14 sm:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Enquiry Form */}
            <div className="lg:col-span-7 p-6 sm:p-10 rounded-xl border border-slate-200 bg-white">
              <div className="space-y-2 pb-6 border-b border-slate-200">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                  Book a Lesson or Send an Enquiry
                </h2>
                <p className="text-sm text-slate-600">
                  Fill in your details below and our coordinator will follow up promptly.
                </p>
              </div>

              {submitted ? (
                <div
                  role="status"
                  className="mt-8 p-6 rounded-xl bg-[#FCF9F0] border border-[#C59B38]/40 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-6 h-6 text-[#8C6A1B] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-bold text-[#0B1F3A]">
                        Thank You — Enquiry Received
                      </h3>
                      {referenceId && (
                        <p className="text-xs font-semibold text-[#8C6A1B] tabular-nums">
                          Reference: {referenceId}
                        </p>
                      )}
                      <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                        Your tutoring enquiry has been submitted to BrightPath Home Tutors. We will contact you shortly via phone, WhatsApp, or email to discuss your child’s class and lesson schedule.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {lastEnquirySummary && (
                      <a
                        href={buildWhatsAppUrl(
                          siteConfig.contact.whatsapp,
                          `Hello BrightPath Home Tutors, I just submitted an enquiry${referenceId ? ` (${referenceId})` : ''} for ${lastEnquirySummary.studentClass}. Name: ${lastEnquirySummary.name}. ${lastEnquirySummary.message}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
                        <span>Also Send on WhatsApp</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setReferenceId(null);
                      }}
                      className="px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Send Another Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-8 space-y-5"
                >
                  {/* Required hidden input for Netlify Forms */}
                  <input type="hidden" name="form-name" value="contact" />

                  {/* Honeypot field for spam protection */}
                  <p className="hidden">
                    <label>
                      Leave this field empty:
                      <input
                        name="bot-field"
                        value={formState.botField}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, botField: e.target.value }))
                        }
                      />
                    </label>
                  </p>

                  {submitError && (
                    <div
                      role="alert"
                      className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-800"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Parent / Guardian Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-sm font-semibold text-[#0B1F3A]">
                      Parent / Guardian Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g. Mrs. Adebayo"
                      value={formState.name}
                      onChange={(e) => {
                        setFormState((prev) => ({ ...prev, name: e.target.value }));
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      className="w-full px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#C59B38]/30"
                    />
                    {errors.name && (
                      <p className="text-xs font-medium text-red-700">{errors.name}</p>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-sm font-semibold text-[#0B1F3A]">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={formState.email}
                        onChange={(e) => {
                          setFormState((prev) => ({ ...prev, email: e.target.value }));
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className="w-full px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#C59B38]/30"
                      />
                      {errors.email && (
                        <p className="text-xs font-medium text-red-700">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="block text-sm font-semibold text-[#0B1F3A]">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="e.g. 0803 000 0000"
                        value={formState.phone}
                        onChange={(e) => {
                          setFormState((prev) => ({ ...prev, phone: e.target.value }));
                          if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        className="w-full px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#C59B38]/30"
                      />
                      {errors.phone && (
                        <p className="text-xs font-medium text-red-700">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Student's Class */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="studentClass"
                      className="block text-sm font-semibold text-[#0B1F3A]"
                    >
                      Student’s Class
                    </label>
                    <select
                      id="studentClass"
                      name="studentClass"
                      required
                      value={formState.studentClass}
                      onChange={(e) => {
                        setFormState((prev) => ({ ...prev, studentClass: e.target.value }));
                        if (errors.studentClass)
                          setErrors((prev) => ({ ...prev, studentClass: undefined }));
                      }}
                      className="w-full px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#C59B38]/30"
                    >
                      <option value="">Select student’s current class</option>
                      {siteConfig.contactPage.studentClassOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.studentClass && (
                      <p className="text-xs font-medium text-red-700">{errors.studentClass}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-[#0B1F3A]"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      placeholder="Please share the subjects your child needs help with, your area in Lagos, and your preferred days/times."
                      value={formState.message}
                      onChange={(e) => {
                        setFormState((prev) => ({ ...prev, message: e.target.value }));
                        if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                      }}
                      className="w-full px-4 py-3 text-base text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A] focus:ring-2 focus:ring-[#C59B38]/30"
                    />
                    {errors.message && (
                      <p className="text-xs font-medium text-red-700">{errors.message}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-[#0B1F3A] rounded-lg hover:bg-[#132E53] disabled:opacity-60 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
                    >
                      {submitting ? 'Sending Enquiry...' : 'Submit Enquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Direct Contact Information & WhatsApp CTA */}
            <aside className="lg:col-span-5 space-y-6">
              {/* WhatsApp Direct Card */}
              <div className="p-7 sm:p-8 rounded-xl bg-[#0B1F3A] text-white space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wide text-[#D8B45A]">
                    Fastest Response
                  </p>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Message Us on WhatsApp
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Prefer a quick conversation about tutor availability, class level, or lesson times? Start a direct WhatsApp chat with our coordinator.
                  </p>
                </div>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-[#0B1F3A] bg-[#D8B45A] rounded-lg hover:bg-[#C59B38] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  <span>Chat on WhatsApp</span>
                </a>

                <p className="text-xs text-slate-300 tabular-nums">
                  WhatsApp Number: {siteConfig.contact.whatsapp}
                </p>
              </div>

              {/* Contact Details & Business Hours */}
              <div className="p-7 sm:p-8 rounded-xl border border-slate-200 bg-[#F8FAFC] space-y-6">
                <h2 className="font-display text-2xl font-bold text-[#0B1F3A]">
                  Direct Contact Details
                </h2>

                <ul className="space-y-4 text-sm sm:text-base text-slate-700">
                  <li className="flex items-start gap-3.5">
                    <Phone className="w-5 h-5 text-[#8C6A1B] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Phone</p>
                      <a
                        href={`tel:${siteConfig.contact.phone}`}
                        className="font-semibold text-[#0B1F3A] hover:text-[#8C6A1B] transition-colors tabular-nums"
                      >
                        {siteConfig.contact.phone}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <Mail className="w-5 h-5 text-[#8C6A1B] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Email</p>
                      <a
                        href={`mailto:${siteConfig.contact.email}`}
                        className="font-semibold text-[#0B1F3A] hover:text-[#8C6A1B] transition-colors break-all"
                      >
                        {siteConfig.contact.email}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-[#8C6A1B] shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Office Address</p>
                      <p className="font-medium text-[#0B1F3A]">{siteConfig.contact.address}</p>
                    </div>
                  </li>
                </ul>

                <div className="pt-5 border-t border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0B1F3A]">
                    <Clock className="w-4 h-4 text-[#8C6A1B]" aria-hidden="true" />
                    <span>Business Hours</span>
                  </div>
                  <dl className="space-y-2 text-sm">
                    {siteConfig.contact.businessHours.map((slot) => (
                      <div
                        key={slot.days}
                        className="flex flex-wrap items-baseline justify-between gap-2"
                      >
                        <dt className="text-slate-600">{slot.days}</dt>
                        <dd className="font-medium text-[#0B1F3A] tabular-nums">{slot.hours}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
