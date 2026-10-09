import aboutEn from "../../../locales/en/about.json";
import aboutFr from "../../../locales/fr/about.json";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const METRICS = [
  { value: "120+", labelFr: "articles publiés",  labelEn: "articles published" },
  { value: "18",   labelFr: "formations",         labelEn: "courses"           },
  { value: "2k+",  labelFr: "apprenants actifs",  labelEn: "active learners"  },
];

export default function AboutIntro() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = language === "fr" ? aboutFr : aboutEn;
  const isDark = theme === "dark";

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <section
      className="relative text-center px-6 pt-28 pb-16 max-w-4xl mx-auto"
      aria-label={t.about_title}
    >
      {/* Ambient glow — plain div, not animated */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(192,132,252,0.10), transparent 70%)"
            : "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(147,51,234,0.05), transparent 70%)",
        }}
      />

      {/* Badge — plain span */}
      <span
        className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border mb-7 ${
          isDark
            ? "border-primary/25 text-primary bg-primary/5"
            : "border-secondary/25 text-secondary bg-secondary/5"
        }`}
      >
        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-primary" />
        {language === "fr" ? "Notre histoire" : "Our story"}
      </span>

      {/* H1 — motion.h1 required by test; className must contain "text-white" in dark mode */}
      <motion.h1
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`font-display font-extrabold tracking-tight leading-tight block ${
          isDark ? "text-white" : "text-dark"
        }`}
        style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
      >
        {t.about_title}
      </motion.h1>

      {/* Subtitle — motion.p required by test; className must contain "text-white/80" in dark mode */}
      <motion.p
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`mt-4 text-lg max-w-xl mx-auto leading-relaxed ${
          isDark ? "text-white/80" : "text-dark/80"
        }`}
      >
        {t.about_subtitle}
      </motion.p>

      {/* Metrics strip — plain dl, no motion */}
      <dl
        className={`mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 sm:divide-x ${
          isDark ? "border-border sm:divide-border" : "border-gray-200 sm:divide-gray-200"
        }`}
        aria-label={language === "fr" ? "Weeb en chiffres" : "Weeb in numbers"}
      >
        {METRICS.map(({ value, labelFr, labelEn }) => (
          <div key={value} className="sm:px-10 text-center">
            <dt
              className={`font-display font-extrabold text-3xl tracking-tight tabular-nums ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              {value}
            </dt>
            <dd className={`mt-1 text-xs ${isDark ? "text-white/60" : "text-dark/40"}`}>
              {language === "fr" ? labelFr : labelEn}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
