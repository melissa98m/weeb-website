import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AnalyticsPage from "./AnalyticsPage";

vi.mock("../../lib/api", () => ({ API_BASE: "http://localhost:8000/api" }));
vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "dark" }),
}));
vi.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "fr" }),
}));
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { roles: ["Personnel"] } }),
}));

// Mock recharts pour éviter les erreurs ResizeObserver dans jsdom
vi.mock("recharts", () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Legend: () => null,
}));

const ANALYTICS_DATA = {
  inscriptions_par_mois: [{ mois: "2025-01", count: 5 }],
  feedbacks_par_mois: [{ mois: "2025-01", count: 3 }],
  satisfaction_globale: { positif: 10, negatif: 2, neutre: 3, non_evalue: 1 },
  taux_satisfaction: 66.7,
  top_formations: [{ id: 1, name: "Python", inscrits: 12 }],
  top_articles_lus: [{ id: 1, title: "Intro Django", vues: 8 }],
  total_utilisateurs: 42,
  total_inscrits: 30,
  total_feedbacks: 16,
  total_articles: 5,
  total_formations: 3,
  total_abonnes: 20,
  total_messages: 7,
  messages_non_traites: 2,
};

function setup(data = ANALYTICS_DATA, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
  return render(
    <MemoryRouter>
      <AnalyticsPage />
    </MemoryRouter>
  );
}

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le titre 'Analytiques'", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Analytiques");
  });

  it("affiche les stat cards avec les valeurs après chargement", async () => {
    setup();
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("affiche le taux de satisfaction", async () => {
    setup();
    await waitFor(() => expect(screen.getByText("66.7 %")).toBeInTheDocument());
  });

  it("affiche la top formation", async () => {
    setup();
    await waitFor(() => expect(screen.getByText("Python")).toBeInTheDocument());
  });

  it("affiche l'article le plus lu", async () => {
    setup();
    await waitFor(() => expect(screen.getByText("Intro Django")).toBeInTheDocument());
  });

  it("affiche une erreur si le fetch échoue", async () => {
    setup({}, false);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("met robots noindex sur la page", () => {
    setup();
    const meta = document.querySelector('meta[name="robots"]');
    expect(meta?.content).toContain("noindex");
  });

  it("appelle fetch vers /admin/analytics/", async () => {
    setup();
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(global.fetch.mock.calls[0][0]).toContain("/admin/analytics/");
  });
});
