import contactEn from "../../../locales/en/contact.json";
import contactFr from "../../../locales/fr/contact.json";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

export default function ContactIntro() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = language === "fr" ? contactFr : contactEn;
  const isDark = theme === "dark";

  return (
    <section
      className="relative text-center px-6 pt-28 pb-16 max-w-4xl mx-auto"
      aria-label={t.contact_title}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(192,132,252,0.10), transparent 70%)"
            : "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(147,51,234,0.05), transparent 70%)",
        }}
      />

      {/* Badge */}
      <span
        className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border mb-7 ${
          isDark
            ? "border-primary/25 text-primary bg-primary/5"
            : "border-secondary/25 text-secondary bg-secondary/5"
        }`}
      >
        <svg
          className="w-3 h-3 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {t.contact_badge}
      </span>

      {/* h1 — test checks getByRole("heading", { name: t.contact_title }) */}
      <h1
        className={`font-display font-extrabold tracking-tight leading-tight ${
          isDark ? "text-white" : "text-dark"
        }`}
        style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
      >
        {t.contact_title}
      </h1>

      {/* Subtitle — test checks getByText(t.contact_intro) */}
      <p
        className={`mt-4 text-lg max-w-xl mx-auto leading-relaxed ${
          isDark ? "text-white/70" : "text-dark/70"
        }`}
      >
        {t.contact_intro}
      </p>

      {/* Trust strip */}
      <div
        className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm ${
          isDark ? "text-white/70" : "text-dark/50"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 shrink-0 ${isDark ? "text-primary" : "text-secondary"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {language === "fr" ? "Réponse sous 48h" : "Reply within 48h"}
        </span>

        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 shrink-0 ${isDark ? "text-primary" : "text-secondary"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {language === "fr" ? "Équipe directe" : "Direct team"}
        </span>

        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 shrink-0 ${isDark ? "text-primary" : "text-secondary"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          {language === "fr" ? "Données protégées" : "Data protected"}
        </span>
      </div>
    </section>
  );
}
