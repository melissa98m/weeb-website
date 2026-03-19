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

function StatCard({ label, value, theme }) {
  const base =
    theme === "dark"
      ? "bg-[#1c1c1c] border-[#333] text-white"
      : "bg-white border-gray-200 text-gray-900";
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${base}`}>
      <span className="text-3xl font-bold">{value ?? "—"}</span>
      <span className="text-sm opacity-70">{label}</span>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Chargement du graphique">
      <div className="h-4 w-1/3 bg-gray-300/20 rounded mb-3" />
      <div className="h-48 bg-gray-300/10 rounded" />
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

  return (
    <div className="space-y-6 mt-4">
      {/* Cards globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading ? (
          <>
            <div className="h-20 rounded-xl bg-gray-300/10 animate-pulse" />
            <div className="h-20 rounded-xl bg-gray-300/10 animate-pulse" />
          </>
        ) : (
          <>
            <StatCard label="Total inscrits" value={data?.total_inscrits} theme={theme} />
            <StatCard label="Total feedbacks" value={data?.total_feedbacks} theme={theme} />
          </>
        )}
      </div>

      {/* BarChart — inscriptions par mois */}
      <div>
        <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-3">
          Inscriptions par mois
        </h3>
        {loading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.inscriptions_par_mois ?? []}>
              <XAxis
                dataKey="mois"
                tick={{ fill: axisColor, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis
                tick={{ fill: axisColor, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: theme === "dark" ? "#ffffff10" : "#00000008" }}
              />
              <Bar dataKey="count" name="Inscriptions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* PieChart — satisfaction */}
        <div>
          <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-3">
            Satisfaction globale
          </h3>
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

        {/* Top formations */}
        <div>
          <h3 className="text-sm font-semibold opacity-60 uppercase tracking-wide mb-3">
            Top formations
          </h3>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ul className="space-y-2">
              {(data?.top_formations ?? []).map((f, i) => (
                <li key={f.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 text-right opacity-40 font-mono">{i + 1}.</span>
                  <span className="truncate flex-1">{f.name}</span>
                  <span className="font-semibold">{f.inscrits}</span>
                </li>
              ))}
              {!data?.top_formations?.length && (
                <li className="text-sm opacity-50">Aucune formation.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
