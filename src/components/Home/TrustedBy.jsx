import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

const METRICS = [
  { target: 120,  suffix: "+", labelFr: "articles publiés",      labelEn: "articles published"  },
  { target: 18,   suffix: "",  labelFr: "formations disponibles", labelEn: "courses available"   },
  { target: 2000, suffix: "+", labelFr: "apprenants actifs",      labelEn: "active learners"     },
];

const DURATION = 1600; // ms

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target) {
  const [count, setCount] = useState(0);
  const triggerRef = useRef(null);
  const rafRef    = useRef(null);
  const firedRef  = useRef(false);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    // Respect prefers-reduced-motion — affiche directement la valeur finale
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || firedRef.current) return;
        firedRef.current = true;

        if (prefersReduced) {
          setCount(target);
          return;
        }

        const startTime = performance.now();

        function tick(now) {
          const elapsed  = now - startTime;
          const progress = Math.min(elapsed / DURATION, 1);
          setCount(target * easeOutCubic(progress));
          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick);
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return { triggerRef, count };
}

function MetricItem({ target, suffix, labelFr, labelEn, theme, language }) {
  const { triggerRef, count } = useCountUp(target);

  // Formatage avec séparateur de milliers selon la locale
  const formatted = new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US").format(
    Math.round(count)
  );

  return (
    <div ref={triggerRef} className="flex-1 text-center sm:px-8">
      <dt
        className={`font-display text-5xl font-bold tabular-nums tracking-tight ${
          theme === "dark" ? "text-primary" : "text-secondary"
        }`}
        aria-label={`${target}${suffix}`}
      >
        {formatted}{suffix}
      </dt>
      <dd className={`mt-2 text-sm ${theme === "dark" ? "text-white/50" : "text-dark/50"}`}>
        {language === "fr" ? labelFr : labelEn}
      </dd>
    </div>
  );
}

export default function TrustedBy() {
  const { theme }    = useTheme();
  const { language } = useLanguage();

  return (
    <section
      aria-label={language === "fr" ? "Weeb en chiffres" : "Weeb in numbers"}
      className="py-12 px-6 max-w-5xl mx-auto"
    >
      <div
        className={`rounded-2xl px-8 py-10 text-center border ${
          theme === "dark"
            ? "bg-surface border-border"
            : "bg-white border-gray-100 shadow-sm"
        }`}
      >
        <p
          className={`text-xs uppercase tracking-widest font-medium mb-8 ${
            theme === "dark" ? "text-primary" : "text-secondary"
          }`}
        >
          {language === "fr" ? "Weeb en chiffres" : "Weeb in numbers"}
        </p>

        <dl className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0 sm:divide-x sm:divide-border">
          {METRICS.map((metric) => (
            <MetricItem
              key={metric.target}
              {...metric}
              theme={theme}
              language={language}
            />
          ))}
        </dl>
      </div>
    </section>
  );
}
