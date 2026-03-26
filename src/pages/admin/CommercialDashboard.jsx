import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { hasAnyRole, STAFF_ROLES } from "../../utils/roles";
import AdminAccessFooter from "../../components/admin/AdminAccessFooter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getEnv } from "../../lib/env";
import adminEn from "../../../locales/en/admin.json";
import adminFr from "../../../locales/fr/admin.json";

const API_BASE = getEnv("VITE_API_URL", "http://localhost:8000/api");

function StatCard({ label, value, sub, theme, accent = false }) {
  const card = theme === "dark" ? "bg-[#262626] border-[#333] text-white" : "bg-white border-gray-200 text-gray-900";
  return (
    <div className={`rounded-xl border shadow p-4 ${card}`}>
      <div className={`text-2xl font-bold ${accent ? "text-indigo-500" : ""}`}>{value ?? "—"}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function CommercialDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? adminFr : adminEn;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const card = theme === "dark" ? "bg-[#262626] border-[#333] text-white" : "bg-white border-gray-200 text-gray-900";
  const meta = theme === "dark" ? "text-white/60" : "text-gray-500";

  const isAllowed = hasAnyRole(user, ["Commercial"]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${API_BASE}/commercial/analytics/`, { credentials: "include" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setData(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !isAllowed) return;
    fetchData();
    document.title = t.page_title_commercial;
    return () => { document.title = "Admin"; };
  }, [fetchData, user, isAllowed]);

  if (!user) return <div className="p-6">{t.common_please_login}</div>;
  if (!isAllowed) return <div className="p-6 text-red-600">{t.commercial_access_denied}</div>;

  if (loading) return <div className="p-6 text-sm opacity-70">{t.common_loading}</div>;
  if (error) return (
    <div className="p-6">
      <p className="text-red-500 text-sm mb-3">{t.common_error.replace("{message}", error)}</p>
      <button onClick={fetchData} className="text-sm underline">{t.commercial_retry}</button>
    </div>
  );

  const pipeline = data?.messages_pipeline ?? {};
  const pipelineData = [
    { name: t.commercial_pipeline_new, value: pipeline.nouveau ?? 0, color: "#f59e0b" },
    { name: t.commercial_pipeline_in_progress, value: pipeline.en_cours ?? 0, color: "#6366f1" },
    { name: t.commercial_pipeline_resolved, value: pipeline.resolu ?? 0, color: "#22c55e" },
  ];

  return (
    <main className="px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{t.commercial_title}</h1>
        <p className={`text-sm mt-1 ${meta}`}>{t.commercial_subtitle}</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={t.commercial_stat_registrations}
          value={data?.total_inscrits}
          theme={theme}
          accent
        />
        <StatCard
          label={t.commercial_stat_messages}
          value={data?.total_messages}
          theme={theme}
        />
        <StatCard
          label={t.commercial_stat_unassigned}
          value={data?.messages_non_assignes}
          sub={t.commercial_stat_unassigned_sub}
          theme={theme}
          accent={data?.messages_non_assignes > 0}
        />
        <StatCard
          label={t.commercial_stat_empty_trainings}
          value={data?.formations_sans_inscrits?.length ?? 0}
          theme={theme}
          accent={data?.formations_sans_inscrits?.length > 0}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pipeline messages */}
        <section className={`rounded-xl border shadow p-5 ${card}`}>
          <h2 className="text-base font-semibold mb-4">{t.commercial_pipeline_title}</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pipelineData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {pipelineData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Top formations */}
        <section className={`rounded-xl border shadow p-5 ${card}`}>
          <h2 className="text-base font-semibold mb-4">{t.commercial_top_formations}</h2>
          {data?.top_formations?.length === 0 ? (
            <p className={`text-sm ${meta}`}>{t.commercial_no_data}</p>
          ) : (
            <ul className="space-y-2">
              {(data?.top_formations ?? []).map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm truncate">{f.name}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    theme === "dark" ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600"
                  }`}>
                    {f.inscrits} {t.commercial_registrations}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Formations sans inscrits */}
      {data?.formations_sans_inscrits?.length > 0 && (
        <section className={`rounded-xl border shadow p-5 ${card}`}>
          <h2 className="text-base font-semibold mb-3">
            {t.commercial_formations_empty}
            <span className={`ml-2 text-sm font-normal ${meta}`}>({data.formations_sans_inscrits.length})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.formations_sans_inscrits.map((f) => (
              <span key={f.id} className={`px-3 py-1 rounded-full border text-sm ${
                theme === "dark" ? "border-orange-400/30 text-orange-300" : "border-orange-200 text-orange-600"
              }`}>
                {f.name}
              </span>
            ))}
          </div>
        </section>
      )}
      <AdminAccessFooter allowedRoles={STAFF_ROLES} />
    </main>
  );
}
