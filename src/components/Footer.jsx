import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import footerEn from "../../locales/en/footer.json";
import footerFr from "../../locales/fr/footer.json";
import { useLanguage } from "../context/LanguageContext";
import { NewsletterApi } from "../lib/api";

function IconYoutube({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function IconFacebook({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function IconTwitter({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  );
}

function IconInstagram({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
    </svg>
  );
}

function IconLinkedin({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export default function Footer() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? footerFr : footerEn;
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterConsentAt, setNewsletterConsentAt] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle");
  const footerLinks = [
    {
      title: {
        en: footerEn.product,
        fr: footerFr.product,
      },
      links: [
        {
          label: {
            en: footerEn.pricing,
            fr: footerFr.pricing,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.overview,
            fr: footerFr.overview,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.browse,
            fr: footerFr.browse,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.accessibility,
            fr: footerFr.accessibility,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.five,
            fr: footerFr.five,
          },
          href: "#",
        },
      ],
    },
    {
      title: {
        en: footerEn.solutions,
        fr: footerFr.solutions,
      },
      links: [
        {
          label: {
            en: footerEn.brainstorming,
            fr: footerFr.brainstorming,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.ideation,
            fr: footerFr.ideation,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.wireframing,
            fr: footerFr.wireframing,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.research,
            fr: footerFr.research,
          },
          href: "#",
        },
      ],
    },
    {
      title: {
        en: footerEn.ressources,
        fr: footerFr.ressources,
      },
      links: [
        {
          label: {
            en: footerEn.help_center,
            fr: footerFr.help_center,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.blog,
            fr: footerFr.blog,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.tutorials,
            fr: footerFr.tutorials,
          },
          href: "#",
        },
      ],
    },
    {
      title: {
        en: footerEn.company,
        fr: footerFr.company,
      },
      links: [
        {
          label: {
            en: footerEn.about,
            fr: footerFr.about,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.press,
            fr: footerFr.press,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.events,
            fr: footerFr.events,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.careers,
            fr: footerFr.careers,
          },
          href: "#",
        },
        {
          label: {
            en: footerEn.legal_notice,
            fr: footerFr.legal_notice,
          },
          href: "/mentions-legales",
        },
        {
          label: {
            en: footerEn.privacy_policy,
            fr: footerFr.privacy_policy,
          },
          href: "/politique-confidentialite",
        },
      ],
    },
  ];

  return (
    <footer
      className={`text-sm px-12 py-12 w-full ${
        theme === "dark" ? "bg-white text-dark" : "bg-dark text-white"
      }`}
    >
      <div
        className={`max-w-5xl mx-auto mb-10 rounded-2xl border px-6 py-6 sm:px-8 ${
          theme === "dark" ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
        }`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p
              className={`text-xs uppercase tracking-[0.2em] ${
                theme === "dark" ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Newsletter
            </p>
            <h3 className="text-lg font-semibold">{t.newsletter_title}</h3>
            <p className={theme === "dark" ? "text-slate-600" : "text-slate-300"}>
              {t.newsletter_subtitle}
            </p>
          </div>
          <form
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!newsletterConsent || newsletterStatus === "loading") return;
              try {
                setNewsletterStatus("loading");
                const consentAt = newsletterConsentAt || new Date().toISOString();
                await NewsletterApi.subscribe({
                  email: newsletterEmail.trim(),
                  consent: true,
                  consented_at: consentAt,
                });
                setNewsletterStatus("success");
                setNewsletterEmail("");
                setNewsletterConsent(false);
                setNewsletterConsentAt("");
              } catch (_) {
                setNewsletterStatus("error");
              }
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {t.newsletter_placeholder}
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder={t.newsletter_placeholder}
              className={`w-full rounded-md border bg-transparent px-3 py-2 focus:outline-none sm:w-64 ${
                theme === "dark"
                  ? "border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500"
                  : "border-white/30 text-white placeholder-slate-400 focus:border-white/60"
              }`}
              autoComplete="email"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
            />
            <input type="hidden" name="consent_at" value={newsletterConsentAt} />
            <button
              type="submit"
              disabled={!newsletterConsent || newsletterStatus === "loading"}
              className={`rounded-md px-4 py-2 font-medium transition-colors ${
                newsletterConsent && newsletterStatus !== "loading"
                  ? theme === "dark"
                    ? "bg-dark text-white hover:bg-dark/80"
                    : "bg-primary text-dark hover:bg-primary/80"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              {newsletterStatus === "loading" ? t.newsletter_loading : t.newsletter_cta}
            </button>
          </form>
          <div className={`text-xs ${theme === "dark" ? "text-slate-600" : "text-slate-300"}`}>
            <p id="newsletter-privacy">
              {t.newsletter_privacy}{" "}
              <a href="/politique-confidentialite" className="underline">
                {t.privacy_policy}
              </a>
            </p>
            <label className="mt-2 flex items-start gap-2">
              <input
                id="newsletter-consent"
                type="checkbox"
                required
                className={`mt-0.5 h-4 w-4 ${
                  theme === "dark" ? "accent-slate-600" : "accent-primary"
                }`}
                aria-describedby="newsletter-privacy"
                checked={newsletterConsent}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setNewsletterConsent(checked);
                  setNewsletterConsentAt(checked ? new Date().toISOString() : "");
                }}
              />
              <span>{t.newsletter_consent}</span>
            </label>
            {newsletterStatus === "success" && (
              <p className="mt-2 text-xs text-green-500">{t.newsletter_success}</p>
            )}
            {newsletterStatus === "error" && (
              <p className="mt-2 text-xs text-red-500">{t.newsletter_error}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-8 lg:flex-row lg:justify-between text-left">
        {/* Colonne 1 : Logo */}
        <div>
          <h2 className="text-xl font-bold">weeb</h2>
        </div>
        {footerLinks.map(({ title, links }) => (
          <div key={language === "fr" ? title.fr : title.en}>
            <h3 className="font-semibold text-muted uppercase mb-2">
              {language === "fr" ? title.fr : title.en}
            </h3>
            <ul className="space-y-1">
              {links.map(({ label, href }) => (
                <li key={language === "fr" ? label.fr : label.en}>
                  <a href={href}>{language === "fr" ? label.fr : label.en}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Ligne du bas */}
      <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row justify-between text-left gap-4 max-w-5xl mx-auto">
        <p>
          &copy; {t.copyright}
        </p>
        {/* Reseaux sociaux */}
        <div className="flex gap-4 text-xl text-dark-icon">
          <IconYoutube
            className={`hover:text-primary cursor-pointer ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          />
          <IconFacebook
            className={`hover:text-primary cursor-pointer ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          />
          <IconTwitter
            className={`hover:text-primary cursor-pointer ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          />
          <IconInstagram
            className={`hover:text-primary cursor-pointer ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          />
          <IconLinkedin
            className={`hover:text-primary cursor-pointer ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          />
        </div>
      </div>
    </footer>
  );
}
