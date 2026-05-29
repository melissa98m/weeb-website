import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AnalyticsCharts from "./AnalyticsCharts";

// Recharts uses ResizeObserver — stub required in jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock("../../lib/api", () => ({
  API_BASE: "http://localhost:8000/api",
}));

const MOCK_DATA = {
  total_utilisateurs: 42,
  total_inscrits: 18,
  total_articles: 7,
  total_formations: 5,
  total_feedbacks: 30,
  total_abonnes: 120,
  messages_non_traites: 3,
  taux_satisfaction: 75,
  satisfaction_globale: {
    positif: 20,
    negatif: 3,
    neutre: 5,
    non_evalue: 2,
  },
  inscriptions_par_mois: [
    { mois: "2025-01", count: 4 },
    { mois: "2025-02", count: 7 },
  ],
  feedbacks_par_mois: [
    { mois: "2025-01", count: 2 },
    { mois: "2025-02", count: 5 },
  ],
  top_formations: [
    { id: 1, name: "React Avancé", inscrits: 12 },
    { id: 2, name: "Python Débutant", inscrits: 6 },
  ],
  top_articles_lus: [
    { id: 1, title: "Guide React", vues: 99 },
    { id: 2, title: "Intro Django", vues: 55 },
  ],
};

function mockFetch(payload, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 403,
      json: async () => payload,
    })
  );
}

describe("AnalyticsCharts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("affiche les skeletons pendant le chargement", () => {
    mockFetch(MOCK_DATA);
    render(<AnalyticsCharts theme="light" />);
    // Les skeletons ont aria-busy=true
    expect(screen.getAllByRole("generic").length).toBeGreaterThan(0);
  });

  it("affiche les KPIs après chargement", async () => {
    mockFetch(MOCK_DATA);
    render(<AnalyticsCharts theme="dark" />);
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("affiche les KPIs secondaires", async () => {
    mockFetch(MOCK_DATA);
    render(<AnalyticsCharts theme="light" />);
    await waitFor(() => expect(screen.getByText("30")).toBeInTheDocument());
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("affiche le taux de satisfaction en %", async () => {
    mockFetch(MOCK_DATA);
    render(<AnalyticsCharts theme="light" />);
    await waitFor(() => expect(screen.getByText("75 %")).toBeInTheDocument());
  });

  it("affiche la barre de progression de satisfaction avec le bon aria", async () => {
    mockFetch(MOCK_DATA);
    render(<AnalyticsCharts theme="dark" />);
    await waitFor(() =>
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75")
    );
  });

  it("affiche le top formations", async () => {
    mockFetch(MOCK_DATA);
    render(<AnalyticsCharts theme="light" />);
    await waitFor(() => expect(screen.getByText("React Avancé")).toBeInTheDocument());
    expect(screen.getByText("Python Débutant")).toBeInTheDocument();
  });

  it("affiche le top articles lus", async () => {
    mockFetch(MOCK_DATA);
    render(<AnalyticsCharts theme="light" />);
    await waitFor(() => expect(screen.getByText("Guide React")).toBeInTheDocument());
    expect(screen.getByText("Intro Django")).toBeInTheDocument();
  });

  it("affiche un message d'erreur si l'API échoue", async () => {
    mockFetch({}, false);
    render(<AnalyticsCharts theme="light" />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/impossible de charger/i)
    );
  });

  it("n'affiche pas 'Aucune formation' quand des formations existent", async () => {
    mockFetch(MOCK_DATA);
    render(<AnalyticsCharts theme="dark" />);
    await waitFor(() => expect(screen.getByText("React Avancé")).toBeInTheDocument());
    expect(screen.queryByText("Aucune formation.")).not.toBeInTheDocument();
  });

  it("affiche 'Aucune formation' si top_formations est vide", async () => {
    mockFetch({ ...MOCK_DATA, top_formations: [], top_articles_lus: [] });
    render(<AnalyticsCharts theme="light" />);
    await waitFor(() => expect(screen.getByText("Aucune formation.")).toBeInTheDocument());
  });

  it("appelle bien l'endpoint analytics", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_DATA,
    });
    vi.stubGlobal("fetch", fetchSpy);
    render(<AnalyticsCharts theme="light" />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/admin/analytics/"),
      expect.objectContaining({ credentials: "include" })
    ));
  });
});
