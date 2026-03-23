import React, { lazy, Suspense, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import adminEn from "../../../locales/en/admin.json";
import adminFr from "../../../locales/fr/admin.json";

// recharts ~348KB — chargé uniquement quand la page admin est visitée
const AnalyticsCharts = lazy(() => import("../../components/admin/AnalyticsCharts"));

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;

  useEffect(() => {
    const prev = document.title;
    document.title = t.page_title_analytics;
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, nofollow";
    return () => {
      document.title = prev;
      metaRobots.content = "index, follow";
    };
  }, []);

  const card =
    theme === "dark"
      ? "bg-[#262626] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  return (
    <main className="px-4 md:px-6 py-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{t.analytics_title}</h1>
        <p className={theme === "dark" ? "text-white/70" : "text-gray-600"}>
          {t.analytics_subtitle}
        </p>
      </header>

      <section className={`rounded-2xl border p-4 ${card}`}>
        <Suspense fallback={
          <div className="animate-pulse space-y-4 py-6">
            {[80, 60, 90, 50].map((w, i) => (
              <div key={i} className="h-4 rounded bg-gray-300/20" style={{ width: `${w}%` }} />
            ))}
          </div>
        }>
          <AnalyticsCharts theme={theme} />
        </Suspense>
      </section>
    </main>
  );
}
