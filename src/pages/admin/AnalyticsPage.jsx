import React, { useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import AnalyticsCharts from "../../components/admin/AnalyticsCharts";

export default function AnalyticsPage() {
  const { theme } = useTheme();

  useEffect(() => {
    const prev = document.title;
    document.title = "Analytiques — Admin";
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
        <h1 className="text-2xl md:text-3xl font-bold">Analytiques</h1>
        <p className={theme === "dark" ? "text-white/70" : "text-gray-600"}>
          Statistiques globales de la plateforme.
        </p>
      </header>

      <section className={`rounded-2xl border p-4 ${card}`}>
        <AnalyticsCharts theme={theme} />
      </section>
    </main>
  );
}
