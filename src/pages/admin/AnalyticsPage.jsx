import React, { lazy, Suspense, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import { STAFF_ROLES } from "../../utils/roles";
import adminEn from "../../../locales/en/admin.json";
import adminFr from "../../../locales/fr/admin.json";

function IconChart({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

// recharts ~348KB — only loaded when the admin analytics page is visited
const AnalyticsCharts = lazy(() => import("../../components/admin/AnalyticsCharts"));

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;
  const isDark = theme === "dark";

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
      ? "bg-surface-2 text-white border-border"
      : "bg-white text-gray-900 border-gray-200";

  return (
    <main className="px-4 md:px-6 py-6">
      <AdminPageHeader
        title={t.analytics_title}
        subtitle={t.analytics_subtitle}
        icon={IconChart}
        iconBg={isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600"}
        isDark={isDark}
      />

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
      <AdminAccessFooter allowedRoles={STAFF_ROLES} />
    </main>
  );
}
