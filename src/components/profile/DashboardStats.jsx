import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import profileEn from "../../../locales/en/profile.json";
import profileFr from "../../../locales/fr/profile.json";

function StatCard({ label, value, theme }) {
  const base =
    theme === "dark"
      ? "bg-surface border-border text-white"
      : "bg-white border-gray-200 text-gray-900";
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${base}`}>
      <span className="text-2xl font-bold">{value ?? "—"}</span>
      <span className="text-sm opacity-70">{label}</span>
    </div>
  );
}

function TimelineItem({ formation, theme, isLast, enrolledOnLabel, locale }) {
  const textMuted = theme === "dark" ? "text-white/50" : "text-gray-400";
  const lineBg = theme === "dark" ? "bg-border-2" : "bg-gray-200";
  const dot = theme === "dark" ? "bg-blue-400" : "bg-blue-500";

  const date = new Date(formation.inscrit_le);
  const dateLabel = date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateIso = date.toISOString().split("T")[0];

  return (
    <li className="relative pl-6">
      {/* Ligne verticale */}
      {!isLast && (
        <span className={`absolute left-[7px] top-5 bottom-0 w-px ${lineBg}`} aria-hidden="true" />
      )}
      {/* Dot */}
      <span
        className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-surface ${dot}`}
        aria-hidden="true"
      />
      <div>
        <p className="font-medium leading-snug">{formation.name}</p>
        {formation.description && (
          <p className={`text-sm mt-0.5 line-clamp-1 ${textMuted}`}>{formation.description}</p>
        )}
        <p className={`text-xs mt-1 ${textMuted}`}>
          {enrolledOnLabel} <time dateTime={dateIso}>{dateLabel}</time>
        </p>
      </div>
    </li>
  );
}

/**
 * Section tableau de bord personnel affiché dans la page Profil.
 *
 * @param {object} props
 * @param {object|null} props.data   - Données du dashboard (API /dashboard/).
 * @param {boolean} props.loading    - En cours de chargement.
 * @param {string|null} props.error  - Message d'erreur.
 * @param {string} props.theme       - "dark" | "light".
 */
export default function DashboardStats({ data, loading, error, theme }) {
  const { language } = useLanguage();
  const t = language === "fr" ? profileFr : profileEn;
  const locale = language === "fr" ? "fr-FR" : "en-US";

  const card =
    theme === "dark"
      ? "bg-surface-2 border-border text-white"
      : "bg-white border-gray-200 text-gray-900";
  const textMuted = theme === "dark" ? "text-white/60" : "text-gray-500";

  return (
    <section className={`rounded-2xl border p-5 mt-6 ${card}`} aria-label={t.dashboard_title}>
      <h2 className="text-lg font-semibold mb-4">{t.dashboard_title}</h2>

      {loading && (
        <div className="animate-pulse space-y-3" aria-busy="true" aria-label={t.dashboard_title}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-300/20" />
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

      {error && !loading && (
        <p className="text-sm text-red-500" role="alert">
          {language === "fr" ? "Impossible de charger les statistiques." : "Unable to load statistics."}
        </p>
      )}

      {data && !loading && (
        <>
          {/* Cartes stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <StatCard
              label={t.dashboard_formations}
              value={data.formations_inscrites}
              theme={theme}
            />
            <StatCard
              label={t.dashboard_feedback_sent}
              value={data.feedbacks_laisses}
              theme={theme}
            />
            <StatCard
              label={t.dashboard_articles_read}
              value={data.articles_lus}
              theme={theme}
            />
          </div>

          {/* Timeline formations */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 opacity-60">
              {t.dashboard_recent_formations}
            </h3>
            {data.historique_formations.length === 0 ? (
              <p className={`text-sm ${textMuted}`}>
                {language === "fr" ? "Aucune formation suivie pour l'instant." : "No courses followed yet."}
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
