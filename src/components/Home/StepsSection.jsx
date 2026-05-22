import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

function IconCompass({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function IconBookOpen({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconTrophy({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="8 21 12 17 16 21" />
      <line x1="12" y1="17" x2="12" y2="11" />
      <path d="M7 4H4a2 2 0 0 0-2 2v2c0 3.31 2.69 6 6 6h0" />
      <path d="M17 4h3a2 2 0 0 1 2 2v2c0 3.31-2.69 6-6 6h0" />
      <rect x="7" y="2" width="10" height="9" rx="2" ry="2" />
    </svg>
  );
}

function IconArrowRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

const STEPS_FR = [
  {
    number: "01",
    icon: IconCompass,
    title: "Explorez",
    description: "Parcourez des dizaines d'articles et formations sur le développement web, le design et les tendances du digital.",
    color: "primary",
  },
  {
    number: "02",
    icon: IconBookOpen,
    title: "Apprenez",
    description: "Suivez des formations structurées à votre rythme, des tutoriels pratiques et du contenu mis à jour chaque semaine.",
    color: "violet",
  },
  {
    number: "03",
    icon: IconTrophy,
    title: "Progressez",
    description: "Suivez votre avancement, développez vos compétences et restez à la pointe des évolutions du web.",
    color: "emerald",
  },
];

const STEPS_EN = [
  {
    number: "01",
    icon: IconCompass,
    title: "Explore",
    description: "Browse dozens of articles and courses on web development, design and the latest digital trends.",
    color: "primary",
  },
  {
    number: "02",
    icon: IconBookOpen,
    title: "Learn",
    description: "Follow structured courses at your own pace, practical tutorials and content updated every week.",
    color: "violet",
  },
  {
    number: "03",
    icon: IconTrophy,
    title: "Grow",
    description: "Track your progress, develop your skills and stay up to date with the latest web developments.",
    color: "emerald",
  },
];

const COLOR_MAP = {
  primary: {
    dark:  { icon: "bg-primary/10 text-primary",        number: "#c084fc" },
    light: { icon: "bg-secondary/10 text-secondary",    number: "#9333ea" },
  },
  violet: {
    dark:  { icon: "bg-violet-500/10 text-violet-400",  number: "#a78bfa" },
    light: { icon: "bg-violet-100 text-violet-600",     number: "#7c3aed" },
  },
  emerald: {
    dark:  { icon: "bg-emerald-500/10 text-emerald-400", number: "#34d399" },
    light: { icon: "bg-emerald-100 text-emerald-600",   number: "#059669" },
  },
};

// Icon outer wrapper size: p-2 (8px) + w-12 (48px) + p-2 (8px) = 64px → center at 32px = top-8
const ICON_CENTER_PX = 32;

export default function StepsSection() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();
  const isFr = language === "fr";

  const steps = isFr ? STEPS_FR : STEPS_EN;

  // Page background color — used to mask the gradient line under each icon
  const pageBg = isDark ? "#0f172a" : "#f2f2f2";

  return (
    <section
      className="px-6 py-20 max-w-6xl mx-auto"
      aria-label={isFr ? "Comment ça marche" : "How it works"}
    >
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? "text-white/30" : "text-dark/30"}`}>
          {isFr ? "Simple et efficace" : "Simple and effective"}
        </span>
        <h2
          className={`font-display font-extrabold tracking-tight mt-3 ${isDark ? "text-white" : "text-dark"}`}
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
        >
          {isFr ? "Comment ça marche" : "How it works"}
        </h2>
        <p className={`mt-3 text-base max-w-md mx-auto ${isDark ? "text-white/50" : "text-dark/50"}`}>
          {isFr
            ? "Trois étapes pour maîtriser le développement web à votre rythme."
            : "Three steps to master web development at your own pace."}
        </p>
      </motion.div>

      {/* Steps */}
      <div className="relative">

        {/*
          Gradient line — desktop only.
          Spans the full width at exactly icon-center height (ICON_CENTER_PX from top).
          Each icon has an opaque background wrapper (pageBg) with z-10 that masks the
          line underneath, making it appear to connect icon-to-icon perfectly at any width.
        */}
        <div
          className="hidden md:block absolute left-0 right-0 h-[2.5px] pointer-events-none"
          aria-hidden="true"
          style={{
            top: `${ICON_CENTER_PX - 1}px`,
            background: isDark
              ? "linear-gradient(to right, #c084fc 0%, #a78bfa 50%, #34d399 100%)"
              : "linear-gradient(to right, #9333ea 0%, #7c3aed 50%, #059669 100%)",
            opacity: 0.4,
          }}
        />

        {/* 3-column grid — icons centered so the line passes through them */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => {
            const colors = COLOR_MAP[step.color][isDark ? "dark" : "light"];
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center text-center"
              >
                {/*
                  Icon wrapper — p-2 creates an opaque ring matching the page background.
                  z-10 places it above the gradient line so the line is hidden under it,
                  giving the illusion the line ends exactly at the icon edge.
                */}
                <div
                  className="relative z-10 p-2 rounded-2xl mb-4 flex-shrink-0"
                  style={{ background: pageBg }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.icon}`}>
                    <Icon size={22} />
                  </div>
                </div>

                {/* Gradient number */}
                <span
                  className="font-display font-black leading-none tabular-nums select-none mb-3"
                  aria-hidden="true"
                  style={{
                    fontSize: "clamp(2.25rem, 4vw, 3rem)",
                    background: `linear-gradient(135deg, ${colors.number} 0%, ${colors.number}70 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {step.number}
                </span>

                {/* Title */}
                <h3 className={`font-display font-bold text-xl mb-2 ${isDark ? "text-white" : "text-dark"}`}>
                  {step.title}
                </h3>

                {/* Description */}
                <p className={`text-sm leading-relaxed max-w-xs ${isDark ? "text-white/50" : "text-dark/55"}`}>
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.3 }}
        className="mt-14 text-center"
      >
        <Link
          to="/register"
          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded ${
            isDark ? "text-primary hover:text-white" : "text-secondary hover:text-dark"
          }`}
        >
          {isFr ? "Commencer gratuitement" : "Get started for free"}
          <IconArrowRight />
        </Link>
      </motion.div>
    </section>
  );
}
