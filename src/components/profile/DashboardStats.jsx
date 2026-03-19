import React from "react";

function StatCard({ label, value, theme }) {
  const base =
    theme === "dark"
      ? "bg-[#1c1c1c] border-[#333] text-white"
      : "bg-white border-gray-200 text-gray-900";
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${base}`}>
      <span className="text-2xl font-bold">{value ?? "—"}</span>
      <span className="text-sm opacity-70">{label}</span>
    </div>
  );
}

function TimelineItem({ formation, theme, isLast }) {
  const textMuted = theme === "dark" ? "text-white/50" : "text-gray-400";
  const lineBg = theme === "dark" ? "bg-[#444]" : "bg-gray-200";
  const dot = theme === "dark" ? "bg-blue-400" : "bg-blue-500";

  const date = new Date(formation.inscrit_le);
  const label = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <li className="relative pl-6">
      {/* Ligne verticale */}
      {!isLast && (
        <span className={`absolute left-[7px] top-5 bottom-0 w-px ${lineBg}`} aria-hidden="true" />
      )}
      {/* Dot */}
      <span
        className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#1c1c1c] ${dot}`}
        aria-hidden="true"
      />
      <div>
        <p className="font-medium leading-snug">{formation.name}</p>
        {formation.description && (
          <p className={`text-sm mt-0.5 line-clamp-1 ${textMuted}`}>{formation.description}</p>
        )}
        <p className={`text-xs mt-1 ${textMuted}`}>Inscrit le {label}</p>
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
  const card =
    theme === "dark"
      ? "bg-[#262626] border-[#333] text-white"
      : "bg-white border-gray-200 text-gray-900";
  const textMuted = theme === "dark" ? "text-white/60" : "text-gray-500";

  return (
    <section className={`rounded-2xl border p-5 mt-6 ${card}`} aria-label="Tableau de bord">
      <h2 className="text-lg font-semibold mb-4">Mon tableau de bord</h2>

      {loading && (
        <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Chargement du tableau de bord">
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
          Impossible de charger les statistiques.
        </p>
      )}

      {data && !loading && (
        <>
          {/* Cartes stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <StatCard
              label="Formations suivies"
              value={data.formations_inscrites}
              theme={theme}
            />
            <StatCard
              label="Feedbacks laissés"
              value={data.feedbacks_laisses}
              theme={theme}
            />
            <StatCard
              label="Articles lus"
              value={data.articles_lus}
              theme={theme}
            />
          </div>

          {/* Timeline formations */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 opacity-60">
              Historique des formations
            </h3>
            {data.historique_formations.length === 0 ? (
              <p className={`text-sm ${textMuted}`}>Aucune formation suivie pour l'instant.</p>
            ) : (
              <ul className="space-y-4">
                {data.historique_formations.map((formation, idx) => (
                  <TimelineItem
                    key={formation.id}
                    formation={formation}
                    theme={theme}
                    isLast={idx === data.historique_formations.length - 1}
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
