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
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 23.227 23.2 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

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

const SOCIALS = [
  { Icon: IconYoutube,   label: "YouTube",    href: "#" },
  { Icon: IconFacebook,  label: "Facebook",   href: "#" },
  { Icon: IconTwitter,   label: "Twitter / X", href: "#" },
  { Icon: IconInstagram, label: "Instagram",  href: "#" },
  { Icon: IconLinkedin,  label: "LinkedIn",   href: "#" },
];

export default function Footer() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? footerFr : footerEn;
  const isDark = theme === "dark";

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState("idle");
  const [emailError, setEmailError] = useState("");

  const successRef = useRef(null);

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
        const emailErrors = err.details?.errors?.email;
        const isAlreadySubscribed =
          err.status === 409 ||
          emailErrors?.some?.((msg) => /already|existe|unique/i.test(msg));
        setNewsletterStatus(isAlreadySubscribed ? "error_duplicate" : "error_server");
      } else {
        setNewsletterStatus("error_server");
      }
    }
  };

  const errorMessageMap = {
    error_network: t.newsletter_error_network,
    error_duplicate: t.newsletter_error_duplicate,
    error_rate_limit: t.newsletter_error_rate_limit,
    error_server: t.newsletter_error_server,
  };
  const currentErrorMessage = errorMessageMap[newsletterStatus] ?? null;
  const isSubmitDisabled = !newsletterConsent || newsletterStatus === "loading";

  const label = (obj) => (language === "fr" ? obj.fr : obj.en);

  return (
    <footer
      className={`text-sm w-full border-t ${
        isDark ? "bg-surface-deep text-white border-border" : "bg-white text-dark border-gray-200"
      }`}
    >
      {/* ── Newsletter ─────────────────────────────────────── */}
      <div className={`border-b ${isDark ? "border-border/50" : "border-gray-100"}`}>
        <div className="max-w-5xl mx-auto px-6 sm:px-12 py-10">
          <div
            className={`rounded-2xl border px-6 py-7 sm:px-10 ${
              isDark
                ? "border-primary/20 bg-gradient-to-br from-primary/8 via-transparent to-transparent"
                : "border-secondary/20 bg-gradient-to-br from-purple-50/80 to-white"
            }`}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16">

              {/* Left — copy */}
              <div className="lg:max-w-xs">
                <span className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-primary/70" : "text-secondary"}`}>
                  Newsletter
                </span>
                <h2 className={`font-display font-bold text-xl leading-snug mt-1.5 ${isDark ? "text-white" : "text-dark"}`}>
                  {t.newsletter_title}
                </h2>
                <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-white/70" : "text-dark/50"}`}>
                  {t.newsletter_subtitle}
                </p>
              </div>

              {/* Right — form */}
              <form className="flex-1 lg:max-w-sm" onSubmit={handleSubmit} noValidate>
                <label htmlFor="newsletter-email" className="sr-only">
                  {t.newsletter_placeholder}
                </label>

                <div className="flex gap-2">
                  <input
                    id="newsletter-email"
                    type="email"
                    inputMode="email"
                    required
                    placeholder={t.newsletter_placeholder}
                    className={`flex-1 min-w-0 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
                      emailError
                        ? "border-red-400 focus:border-red-500 focus:ring-red-400/20"
                        : isDark
                        ? "bg-surface border-border text-white placeholder-white/30 focus:border-primary/40 focus:ring-primary/15"
                        : "bg-white border-gray-200 text-dark placeholder-dark/40 focus:border-secondary/40 focus:ring-secondary/15"
                    }`}
                    autoComplete="email"
                    value={newsletterEmail}
                    aria-describedby={emailError ? "newsletter-email-error" : "newsletter-privacy"}
                    aria-invalid={emailError ? "true" : undefined}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (emailError && EMAIL_REGEX.test(e.target.value)) setEmailError("");
                    }}
                    onBlur={(e) => validateEmailFormat(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    title={!newsletterConsent ? t.newsletter_consent_required : undefined}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
                      isSubmitDisabled
                        ? isDark
                          ? "bg-white/5 text-white/25 cursor-not-allowed border-border"
                          : "bg-gray-100 text-dark/30 cursor-not-allowed border-gray-200"
                        : isDark
                          ? "bg-primary/15 border-primary/30 text-primary hover:bg-primary/25"
                          : "bg-secondary text-white border-secondary hover:brightness-110"
                    }`}
                  >
                    {newsletterStatus === "loading" ? t.newsletter_loading : t.newsletter_cta}
                  </button>
                </div>

                {emailError && (
                  <p id="newsletter-email-error" role="alert" className="mt-1.5 text-xs text-red-500">
                    {emailError}
                  </p>
                )}

                <div className={`mt-3 text-xs ${isDark ? "text-white/60" : "text-dark/40"}`}>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      id="newsletter-consent"
                      type="checkbox"
                      required
                      className="mt-0.5 h-4 w-4 accent-primary"
                      aria-describedby="newsletter-privacy"
                      checked={newsletterConsent}
                      onChange={(e) => setNewsletterConsent(e.target.checked)}
                    />
                    <span>{t.newsletter_consent}</span>
                  </label>
                  <p id="newsletter-privacy" className="mt-1.5 pl-6">
                    {t.newsletter_privacy}{" "}
                    <a
                      href="/privacy-policy"
                      className={`underline underline-offset-2 ${isDark ? "text-white/60 hover:text-white" : "text-dark/60 hover:text-dark"}`}
                    >
                      {t.privacy_policy}
                    </a>
                  </p>
                  <div aria-live="polite" aria-atomic="true">
                    {(newsletterStatus === "success" || newsletterStatus === "success_duplicate") && (
                      <p
                        ref={successRef}
                        tabIndex={-1}
                        className={`mt-2 pl-6 focus:outline-none ${
                          newsletterStatus === "success_duplicate" ? "text-amber-500" : "text-green-500"
                        }`}
                      >
                        {newsletterStatus === "success_duplicate"
                          ? t.newsletter_success_duplicate
                          : t.newsletter_success}
                      </p>
                    )}
                    {currentErrorMessage && (
                      <p className="mt-2 pl-6 text-red-500">{currentErrorMessage}</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav + brand ────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">

          {/* Brand */}
          <div className="lg:max-w-[200px] shrink-0">
            <p className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              weeb
            </p>
            <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-white/60" : "text-dark/40"}`}>
              {t.tagline}
            </p>
            <div className="flex gap-0.5 mt-5 -ml-1.5" role="list" aria-label="Réseaux sociaux">
              {SOCIALS.map(({ Icon, label: ariaLabel, href }) => (
                <a
                  key={ariaLabel}
                  href={href}
                  aria-label={ariaLabel}
                  role="listitem"
                  rel="noopener noreferrer"
                  target="_blank"
                  className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isDark
                      ? "text-white/60 hover:text-primary hover:bg-primary/10"
                      : "text-dark/30 hover:text-secondary hover:bg-secondary/8"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:flex lg:gap-16">
            {FOOTER_LINKS.map(({ title, links }) => (
              <div key={label(title)}>
                <h3 className={`text-xs font-semibold uppercase tracking-widest mb-4 ${isDark ? "text-white/60" : "text-dark/30"}`}>
                  {label(title)}
                </h3>
                <ul className="space-y-2.5">
                  {links.map(({ label: lbl, href }) => (
                    <li key={label(lbl)}>
                      <a
                        href={href}
                        className={`transition-colors duration-150 ${
                          isDark ? "text-white/70 hover:text-primary" : "text-dark/50 hover:text-secondary"
                        }`}
                      >
                        {label(lbl)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────────── */}
        <div className={`border-t mt-10 pt-6 ${isDark ? "border-border/50" : "border-gray-100"}`}>
          <p className={`text-xs ${isDark ? "text-white/60" : "text-dark/30"}`}>
            &copy; {new Date().getFullYear()} {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
