import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { API_BASE } from "../../lib/api";

const SATISFACTION_COLORS = {
  positif: "#22c55e",
  negatif: "#ef4444",
  neutre: "#f59e0b",
  non_evalue: "#6b7280",
};

const SATISFACTION_LABELS = {
  positif: "Positif",
  negatif: "Négatif",
  neutre: "Neutre",
  non_evalue: "Non évalué",
};

function StatCard({ label, value, theme, accent }) {
  const base =
    theme === "dark"
      ? "bg-[#1c1c1c] border-[#333] text-white"
      : "bg-white border-gray-200 text-gray-900";
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${base}`}>
      <span className={`text-3xl font-bold ${accent ?? ""}`}>{value ?? "—"}</span>
      <span className="text-sm opacity-70">{label}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-3">
      {children}
    </h3>
  );
}

function ChartSkeleton({ height = 200 }) {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Chargement du graphique">
      <div className="h-4 w-1/3 bg-gray-300/20 rounded mb-3" />
      <div className={`bg-gray-300/10 rounded`} style={{ height }} />
    </div>
  );
}

function CardSkeleton() {
  return <div className="h-20 rounded-xl bg-gray-300/10 animate-pulse" />;
}

function TauxSatisfaction({ taux, theme }) {
  if (taux === null || taux === undefined) {
    return <p className="text-sm opacity-50">Aucun feedback évalué.</p>;
  }
  const color =
    taux >= 70 ? "#22c55e" : taux >= 40 ? "#f59e0b" : "#ef4444";
  const label =
    taux >= 70 ? "Bon" : taux >= 40 ? "Moyen" : "Faible";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-2xl" style={{ color }}>
          {taux} %
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full border font-medium"
          style={{ color, borderColor: color }}
        >
          {label}
        </span>
      </div>
      <div
        className="w-full rounded-full h-2"
        style={{
          background: theme === "dark" ? "#333" : "#e5e7eb",
        }}
        role="progressbar"
        aria-valuenow={taux}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Taux de satisfaction : ${taux}%`}
      >
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${taux}%`, background: color }}
        />
      </div>
      <p className="text-xs opacity-50">Feedbacks positifs parmi les feedbacks évalués</p>
    </div>
  );
}

/**
 * Dashboard analytique admin — graphiques recharts.
 *
 * @param {object} props
 * @param {string} props.theme - "dark" | "light"
 */
export default function AnalyticsCharts({ theme }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/admin/analytics/`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (alive) setData(json);
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const axisColor = theme === "dark" ? "#888" : "#666";
  const gridColor = theme === "dark" ? "#333" : "#e5e7eb";
  const tooltipStyle =
    theme === "dark"
      ? { backgroundColor: "#1c1c1c", border: "1px solid #333", color: "#fff" }
      : { backgroundColor: "#fff", border: "1px solid #e5e7eb", color: "#111" };

  if (error) {
    return (
      <p className="text-sm text-red-500 mt-2" role="alert">
        Impossible de charger les statistiques : {error}
      </p>
    );
  }

  const pieData = data
    ? Object.entries(data.satisfaction_globale)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: SATISFACTION_LABELS[key] ?? key,
          value,
          color: SATISFACTION_COLORS[key] ?? "#9ca3af",
        }))
    : [];

  const axisProps = {
    tick: { fill: axisColor, fontSize: 11 },
    tickLine: false,
  };

  return (
    <div className="space-y-8 mt-4">

      {/* ── Ligne 1 : KPIs principaux ── */}
      <div>
        <SectionTitle>Vue d'ensemble</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <StatCard label="Utilisateurs" value={data?.total_utilisateurs} theme={theme} />
              <StatCard label="Inscrits formations" value={data?.total_inscrits} theme={theme} />
              <StatCard label="Articles" value={data?.total_articles} theme={theme} />
              <StatCard label="Formations" value={data?.total_formations} theme={theme} />
            </>
          )}
        </div>
      </div>

      {/* ── Ligne 2 : KPIs secondaires ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Feedbacks reçus" value={data?.total_feedbacks} theme={theme} />
            <StatCard label="Abonnés newsletter" value={data?.total_abonnes} theme={theme} />
            <StatCard
              label="Messages non traités"
              value={data?.messages_non_traites}
              theme={theme}
              accent={data?.messages_non_traites > 0 ? "text-amber-500" : undefined}
            />
          </>
        )}
      </div>

      {/* ── Ligne 3 : BarCharts côte à côte ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <SectionTitle>Inscriptions par mois</SectionTitle>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.inscriptions_par_mois ?? []}>
                <XAxis dataKey="mois" {...axisProps} axisLine={{ stroke: gridColor }} />
                <YAxis {...axisProps} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: theme === "dark" ? "#ffffff10" : "#00000008" }}
                />
                <Bar dataKey="count" name="Inscriptions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div>
          <SectionTitle>Feedbacks par mois</SectionTitle>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.feedbacks_par_mois ?? []}>
                <XAxis dataKey="mois" {...axisProps} axisLine={{ stroke: gridColor }} />
                <YAxis {...axisProps} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: theme === "dark" ? "#ffffff10" : "#00000008" }}
                />
                <Bar dataKey="count" name="Feedbacks" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Ligne 4 : Satisfaction ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <SectionTitle>Répartition satisfaction</SectionTitle>
          {loading ? (
            <ChartSkeleton />
          ) : pieData.length === 0 ? (
            <p className="text-sm opacity-50">Aucun feedback pour l'instant.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: axisColor }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div>
          <SectionTitle>Taux de satisfaction</SectionTitle>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 w-1/4 bg-gray-300/20 rounded" />
              <div className="h-2 bg-gray-300/10 rounded-full" />
            </div>
          ) : (
            <TauxSatisfaction taux={data?.taux_satisfaction} theme={theme} />
          )}
        </div>
      </div>

      {/* ── Ligne 5 : Tops ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <SectionTitle>Top formations</SectionTitle>
          {loading ? (
            <ChartSkeleton height={120} />
          ) : (
            <ul className="space-y-2">
              {(data?.top_formations ?? []).map((f, i) => (
                <li key={f.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-right opacity-40 font-mono">{i + 1}.</span>
                  <span className="truncate flex-1">{f.name}</span>
                  <span className="font-semibold tabular-nums">{f.inscrits}</span>
                  <span className="opacity-40 text-xs">inscrits</span>
                </li>
              ))}
              {!data?.top_formations?.length && (
                <li className="text-sm opacity-50">Aucune formation.</li>
              )}
            </ul>
          )}
        </div>

        <div>
          <SectionTitle>Articles les plus lus</SectionTitle>
          {loading ? (
            <ChartSkeleton height={120} />
          ) : (
            <ul className="space-y-2">
              {(data?.top_articles_lus ?? []).map((a, i) => (
                <li key={a.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-right opacity-40 font-mono">{i + 1}.</span>
                  <span className="truncate flex-1">{a.title}</span>
                  <span className="font-semibold tabular-nums">{a.vues}</span>
                  <span className="opacity-40 text-xs">vues</span>
                </li>
              ))}
              {!data?.top_articles_lus?.length && (
                <li className="text-sm opacity-50">Aucune lecture enregistrée.</li>
              )}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
