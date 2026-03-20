import React, { useEffect } from "react";
import AnalyticsCharts from "./AnalyticsCharts";

const MOCK_DATA = {
  total_utilisateurs: 128,
  total_inscrits: 54,
  total_articles: 17,
  total_formations: 8,
  total_feedbacks: 73,
  total_abonnes: 312,
  messages_non_traites: 5,
  taux_satisfaction: 82,
  satisfaction_globale: {
    positif: 58,
    negatif: 6,
    neutre: 9,
    non_evalue: 0,
  },
  inscriptions_par_mois: [
    { mois: "2025-01", count: 8 },
    { mois: "2025-02", count: 12 },
    { mois: "2025-03", count: 7 },
    { mois: "2025-04", count: 15 },
    { mois: "2025-05", count: 12 },
  ],
  feedbacks_par_mois: [
    { mois: "2025-01", count: 5 },
    { mois: "2025-02", count: 14 },
    { mois: "2025-03", count: 9 },
    { mois: "2025-04", count: 20 },
    { mois: "2025-05", count: 25 },
  ],
  top_formations: [
    { id: 1, name: "React Avancé", inscrits: 22 },
    { id: 2, name: "Python Débutant", inscrits: 18 },
    { id: 3, name: "Docker & Kubernetes", inscrits: 14 },
  ],
  top_articles_lus: [
    { id: 1, title: "Les hooks React en 2025", vues: 340 },
    { id: 2, title: "Débuter avec Django REST", vues: 210 },
    { id: 3, title: "TailwindCSS v4 — ce qui change", vues: 185 },
  ],
};

/**
 * Intercepte fetch pour retourner MOCK_DATA sans appel réseau.
 */
function withMockedFetch(data, ok = true) {
  return (Story) => {
    useEffect(() => {
      const original = window.fetch;
      window.fetch = async () => ({
        ok,
        status: ok ? 200 : 500,
        json: async () => data,
      });
      return () => {
        window.fetch = original;
      };
    }, []);
    return <Story />;
  };
}

const meta = {
  title: "Admin/AnalyticsCharts",
  component: AnalyticsCharts,
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
  },
  args: { theme: "light" },
};

export default meta;

export const Default = {
  decorators: [withMockedFetch(MOCK_DATA)],
};

export const DarkTheme = {
  args: { theme: "dark" },
  decorators: [withMockedFetch(MOCK_DATA)],
  parameters: { backgrounds: { default: "dark" } },
};

export const Loading = {
  decorators: [
    (Story) => {
      // Fetch qui ne se résout jamais = état loading permanent
      useEffect(() => {
        const original = window.fetch;
        window.fetch = () => new Promise(() => {});
        return () => { window.fetch = original; };
      }, []);
      return <Story />;
    },
  ],
};

export const ErrorState = {
  decorators: [withMockedFetch({}, false)],
};

export const NoFeedbacks = {
  decorators: [
    withMockedFetch({
      ...MOCK_DATA,
      taux_satisfaction: null,
      satisfaction_globale: { positif: 0, negatif: 0, neutre: 0, non_evalue: 0 },
      total_feedbacks: 0,
    }),
  ],
};
