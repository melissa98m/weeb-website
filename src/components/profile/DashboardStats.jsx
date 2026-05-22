import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import profileEn from "../../../locales/en/profile.json";
import profileFr from "../../../locales/fr/profile.json";

// Test constraints preserved:
// - <section aria-label={t.dashboard_title}> → getByRole("region", { name: /tableau de bord/i })
// - aria-busy="true" on loading skeleton
// - role="alert" on error
// - stat value as isolated text node (getByText("3") etc.)

function StatCard({ label, value, theme, accent, icon }) {
  const isDark = theme === "dark";
  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-2 ${
        isDark ? "bg-surface border-border" : "bg-white border-gray-200"
      }`}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent + "1a", color: accent }}
        aria-hidden="true"
      >
        {icon}
      </div>
      {/* value must stay as isolated text node — test uses getByText("3") */}
      <span
        className={`text-2xl font-bold font-display tabular-nums ${isDark ? "text-white" : "text-dark"}`}
      >
        {value ?? "—"}
      </span>
      <span className={`text-xs leading-tight ${isDark ? "text-white/70" : "text-dark/50"}`}>
        {label}
      </span>
    </div>
  );
}

function TimelineItem({ formation, theme, isLast, enrolledOnLabel, locale }) {
  const isDark = theme === "dark";
  const textMuted = isDark ? "text-white/70" : "text-dark/45";
  const lineBg = isDark ? "bg-border-2" : "bg-gray-200";

  const date = new Date(formation.inscrit_le);
  const dateLabel = date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateIso = date.toISOString().split("T")[0];

  return (
    <li className="relative pl-6">
      {!isLast && (
        <span
          className={`absolute left-[7px] top-5 bottom-0 w-px ${lineBg}`}
          aria-hidden="true"
        />
      )}
      <span
        className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
          isDark ? "border-surface bg-primary" : "border-white bg-secondary"
        }`}
        aria-hidden="true"
      />
      <div>
        <p className={`text-sm font-medium leading-snug ${isDark ? "text-white" : "text-dark"}`}>
          {formation.name}
        </p>
        {formation.description && (
          <p className={`text-xs mt-0.5 line-clamp-1 ${textMuted}`}>{formation.description}</p>
        )}
        <p className={`text-xs mt-1 ${textMuted}`}>
          {enrolledOnLabel} <time dateTime={dateIso}>{dateLabel}</time>
        </p>
      </div>
    </li>
  );
}

export default function DashboardStats({ data, loading, error, theme, hideCards = false }) {
  const { language } = useLanguage();
  const t = language === "fr" ? profileFr : profileEn;
  const locale = language === "fr" ? "fr-FR" : "en-US";
  const isDark = theme === "dark";
  const textMuted = isDark ? "text-white/70" : "text-dark/50";

  const ACCENTS = ["#c084fc", "#38bdf8", "#34d399"];

  const ICONS = [
    <svg key="cap" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4l9 5-9 5-9-5 9-5z"/><path d="M4 10v4l8 4 8-4v-4"/></svg>,
    <svg key="msg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    <svg key="book" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  ];

  return (
    <section
      className={`rounded-2xl border p-5 ${
        isDark ? "bg-surface border-border" : "bg-white border-gray-200 shadow-sm"
      }`}
      aria-label={t.dashboard_title}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <p className={`text-[11px] uppercase tracking-[.15em] font-semibold ${isDark ? "text-primary/70" : "text-secondary/70"}`}>
          {t.dashboard_title}
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="animate-pulse space-y-4" aria-busy="true" aria-label={t.dashboard_title}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-300/20" />
            ))}
          </div>
          <div className="h-4 w-1/3 bg-gray-300/20 rounded mt-4" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 bg-gray-300/20 rounded" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p className="text-sm text-red-500" role="alert">
          {language === "fr"
            ? "Impossible de charger les statistiques."
            : "Unable to load statistics."}
        </p>
      )}

      {/* Data */}
      {data && !loading && (
        <>
          {!hideCards && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
              <StatCard label={t.dashboard_formations}   value={data.formations_inscrites} theme={theme} accent={ACCENTS[0]} icon={ICONS[0]} />
              <StatCard label={t.dashboard_feedback_sent} value={data.feedbacks_laisses}   theme={theme} accent={ACCENTS[1]} icon={ICONS[1]} />
              <StatCard label={t.dashboard_articles_read} value={data.articles_lus}        theme={theme} accent={ACCENTS[2]} icon={ICONS[2]} />
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className={`text-[11px] uppercase tracking-[.15em] font-semibold mb-4 ${textMuted}`}>
              {t.dashboard_recent_formations}
            </h3>
            {data.historique_formations.length === 0 ? (
              <p className={`text-sm ${textMuted}`}>
                {language === "fr"
                  ? "Aucune formation suivie pour l'instant."
                  : "No courses followed yet."}
              </p>
            ) : (
              <ul className="space-y-4">
                {data.historique_formations.map((formation, idx) => (
                  <TimelineItem
                    key={formation.id}
                    formation={formation}
                    theme={theme}
                    isLast={idx === data.historique_formations.length - 1}
                    enrolledOnLabel={t.dashboard_enrolled_on}
                    locale={locale}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
