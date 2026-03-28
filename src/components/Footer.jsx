import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import footerEn from "../../locales/en/footer.json";
import footerFr from "../../locales/fr/footer.json";
import { useLanguage } from "../context/LanguageContext";
import { NewsletterApi } from "../lib/api";

function IconYoutube({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function IconFacebook({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function IconTwitter({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );
}

function IconInstagram({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
    </svg>
  );
}

function IconLinkedin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

// Simple RFC 5322-inspired regex — rejects obvious typos without over-constraining
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FOOTER_LINKS = [
  {
    title: { en: footerEn.product, fr: footerFr.product },
    links: [
      { label: { en: footerEn.overview, fr: footerFr.overview }, href: "/" },
      { label: { en: footerEn.browse, fr: footerFr.browse }, href: "/formations" },
    ],
  },
  {
    title: { en: footerEn.ressources, fr: footerFr.ressources },
    links: [
      { label: { en: footerEn.help_center, fr: footerFr.help_center }, href: "/contact" },
      { label: { en: footerEn.blog, fr: footerFr.blog }, href: "/blog" },
    ],
  },
  {
    title: { en: footerEn.company, fr: footerFr.company },
    links: [
      { label: { en: footerEn.about, fr: footerFr.about }, href: "/about-us" },
      { label: { en: footerEn.legal_notice, fr: footerFr.legal_notice }, href: "/legal-notices" },
      { label: { en: footerEn.privacy_policy, fr: footerFr.privacy_policy }, href: "/privacy-policy" },
    ],
  },
];

export default function Footer() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? footerFr : footerEn;

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState("idle");
  const [emailError, setEmailError] = useState("");

  const successRef = useRef(null);

  // Move focus to the success message so screen readers announce it immediately
  useEffect(() => {
    if (newsletterStatus === "success" || newsletterStatus === "success_duplicate") {
      successRef.current?.focus();
    }
  }, [newsletterStatus]);

  const validateEmailFormat = (value) => {
    if (value && !EMAIL_REGEX.test(value)) {
      setEmailError(t.newsletter_email_invalid);
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newsletterConsent || newsletterStatus === "loading") return;

    // Re-validate before submitting
    if (!EMAIL_REGEX.test(newsletterEmail.trim())) {
      setEmailError(t.newsletter_email_invalid);
      return;
    }

    setNewsletterStatus("loading");
    try {
      const { created } = await NewsletterApi.subscribe({ email: newsletterEmail.trim() });
      setNewsletterStatus(created ? "success" : "success_duplicate");
      setNewsletterEmail("");
      setNewsletterConsent(false);
      setEmailError("");
    } catch (err) {
      if (err.network) {
        setNewsletterStatus("error_network");
      } else if (err.status === 429) {
        setNewsletterStatus("error_rate_limit");
      } else if (err.status === 400 || err.status === 409) {
        // DRF unique constraint returns 400 with errors on the email field
        const emailErrors = err.details?.errors?.email;
        const isAlreadySubscribed =
          err.status === 409 ||
          emailErrors?.some?.((msg) => /already|existe|unique/i.test(msg));
        setNewsletterStatus(
          isAlreadySubscribed ? "error_duplicate" : "error_server"
        );
      } else {
        setNewsletterStatus("error_server");
      }
    }
  };

  const isDark = theme === "dark";

  // Footer uses inverted colours for contrast against the page background
  const footerBg = isDark
    ? "bg-white text-dark border-t border-slate-200"
    : "bg-dark text-white";
  const cardBg = isDark
    ? "bg-slate-50 border-slate-200"
    : "bg-white/[0.06] border-white/15";
  const subtleText = isDark ? "text-slate-600" : "text-slate-300";
  const mutedText = isDark ? "text-slate-500" : "text-slate-400";
  const inputCls = isDark
    ? "border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500"
    : "border-white/30 text-white placeholder-slate-400 focus:border-white/60";
  const inputErrorCls = isDark
    ? "border-red-400 focus:border-red-500"
    : "border-red-400 focus:border-red-400";
  const navLinkCls = `transition-colors duration-150 ${
    isDark ? "text-slate-700 hover:text-dark" : "text-slate-300 hover:text-white"
  }`;
  // Separator: slightly stronger than before for visibility in both modes
  const dividerCls = isDark ? "border-slate-200" : "border-white/20";

  const errorMessageMap = {
    error_network: t.newsletter_error_network,
    error_duplicate: t.newsletter_error_duplicate,
    error_rate_limit: t.newsletter_error_rate_limit,
    error_server: t.newsletter_error_server,
  };
  const currentErrorMessage = errorMessageMap[newsletterStatus] ?? null;

  const isSubmitDisabled =
    !newsletterConsent || newsletterStatus === "loading";

  return (
    <footer className={`text-sm px-6 sm:px-12 py-12 w-full ${footerBg}`}>

      {/* ── Newsletter ─────────────────────────────────────── */}
      <div
        className={`max-w-5xl mx-auto mb-10 rounded-2xl border px-6 py-6 sm:px-8 ${cardBg}`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12">

          {/* Description */}
          <div className="lg:max-w-xs">
            <p className={`text-xs uppercase tracking-[0.2em] ${mutedText}`}>
              Newsletter
            </p>
            <h2 className="text-lg font-semibold mt-1">{t.newsletter_title}</h2>
            <p className={`mt-1 ${subtleText}`}>{t.newsletter_subtitle}</p>
          </div>

          {/*
            Form — grid layout ensures correct reading order on both mobile and desktop:
              Mobile (1 col):  email → consent → privacy → button
              Desktop (2 col): [email | button] / [consent + privacy + status]
          */}
          <form className="flex-1" onSubmit={handleSubmit} noValidate>
            <div className="sm:grid sm:grid-cols-[1fr_auto] sm:gap-x-3 sm:items-start">

              {/* Col 1, Row 1: email input + inline error */}
              <div className="sm:col-start-1 sm:row-start-1">
                <label htmlFor="newsletter-email" className="sr-only">
                  {t.newsletter_placeholder}
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  inputMode="email"
                  required
                  placeholder={t.newsletter_placeholder}
                  className={`w-full rounded-md border bg-transparent px-3 py-2 focus:outline-none transition-colors ${
                    emailError ? inputErrorCls : inputCls
                  }`}
                  autoComplete="email"
                  value={newsletterEmail}
                  aria-describedby={
                    emailError ? "newsletter-email-error" : "newsletter-privacy"
                  }
                  aria-invalid={emailError ? "true" : undefined}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    // Clear inline error as the user corrects their input
                    if (emailError && EMAIL_REGEX.test(e.target.value)) {
                      setEmailError("");
                    }
                  }}
                  onBlur={(e) => validateEmailFormat(e.target.value)}
                />
                {emailError && (
                  <p
                    id="newsletter-email-error"
                    role="alert"
                    className="mt-1 text-xs text-red-500"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* Col 1–2, Row 2: consent + privacy + status */}
              <div
                className={`mt-3 text-xs sm:col-start-1 sm:col-end-3 sm:row-start-2 ${subtleText}`}
              >
                <label className="flex items-start gap-2">
                  <input
                    id="newsletter-consent"
                    type="checkbox"
                    required
                    className={`mt-0.5 h-4 w-4 ${
                      isDark ? "accent-slate-600" : "accent-primary"
                    }`}
                    aria-describedby="newsletter-privacy"
                    checked={newsletterConsent}
                    onChange={(e) => setNewsletterConsent(e.target.checked)}
                  />
                  <span>{t.newsletter_consent}</span>
                </label>
                <p id="newsletter-privacy" className="mt-1.5">
                  {t.newsletter_privacy}{" "}
                  <a href="/privacy-policy" className="underline">
                    {t.privacy_policy}
                  </a>
                </p>
                {/* Live region for all async status messages */}
                <div aria-live="polite" aria-atomic="true">
                  {(newsletterStatus === "success" || newsletterStatus === "success_duplicate") && (
                    <p
                      ref={successRef}
                      tabIndex={-1}
                      className={`mt-2 focus:outline-none ${
                        newsletterStatus === "success_duplicate"
                          ? "text-amber-500"
                          : "text-green-500"
                      }`}
                    >
                      {newsletterStatus === "success_duplicate"
                        ? t.newsletter_success_duplicate
                        : t.newsletter_success}
                    </p>
                  )}
                  {currentErrorMessage && (
                    <p className="mt-2 text-red-500">{currentErrorMessage}</p>
                  )}
                </div>
              </div>

              {/* Col 2, Row 1: submit button — last in DOM so mobile order is correct */}
              <button
                type="submit"
                disabled={isSubmitDisabled}
                title={
                  !newsletterConsent ? t.newsletter_consent_required : undefined
                }
                className={`mt-3 w-full sm:mt-0 sm:w-auto sm:col-start-2 sm:row-start-1 rounded-md px-4 py-2 font-medium transition-colors ${
                  !isSubmitDisabled
                    ? isDark
                      ? "bg-dark text-white hover:bg-dark/80"
                      : "bg-primary text-dark hover:bg-primary/80"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              >
                {newsletterStatus === "loading"
                  ? t.newsletter_loading
                  : t.newsletter_cta}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Nav columns ────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto flex flex-col gap-8 lg:flex-row lg:justify-between text-left">

        {/* Logo + tagline */}
        <div className="lg:max-w-[180px]">
          <h2 className="text-xl font-bold">weeb</h2>
          <p className={`mt-1.5 text-xs leading-relaxed ${subtleText}`}>
            {t.tagline}
          </p>
        </div>

        {FOOTER_LINKS.map(({ title, links }) => (
          <div key={language === "fr" ? title.fr : title.en}>
            <h3 className={`font-semibold uppercase mb-3 ${subtleText}`}>
              {language === "fr" ? title.fr : title.en}
            </h3>
            <ul className="space-y-1.5">
              {links.map(({ label, href }) => (
                <li key={language === "fr" ? label.fr : label.en}>
                  <a href={href} className={navLinkCls}>
                    {language === "fr" ? label.fr : label.en}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ─────────────────────────────────────── */}
      <div
        className={`border-t mt-10 pt-6 flex flex-col sm:flex-row justify-between text-left gap-4 max-w-5xl mx-auto ${dividerCls}`}
      >
        <p className={subtleText}>
          &copy; {new Date().getFullYear()} {t.copyright}
        </p>
        <div className="flex gap-4">
          {[
            { Icon: IconYoutube, label: "YouTube", href: "#" },
            { Icon: IconFacebook, label: "Facebook", href: "#" },
            { Icon: IconTwitter, label: "Twitter / X", href: "#" },
            { Icon: IconInstagram, label: "Instagram", href: "#" },
            { Icon: IconLinkedin, label: "LinkedIn", href: "#" },
          ].map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              rel="noopener noreferrer"
              target="_blank"
              className={`transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${
                isDark
                  ? "text-slate-400 hover:text-primary"
                  : "text-slate-500 hover:text-secondary"
              }`}
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
