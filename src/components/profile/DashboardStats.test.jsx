import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardStats from "./DashboardStats";

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "fr" }),
}));

const SAMPLE_DATA = {
  formations_inscrites: 3,
  feedbacks_laisses: 2,
  articles_lus: 7,
  historique_formations: [
    {
      id: 1,
      name: "React Avancé",
      description: "Apprenez React en profondeur",
      inscrit_le: "2025-03-15T10:00:00Z",
    },
    {
      id: 2,
      name: "Python Débutant",
      description: "",
      inscrit_le: "2025-01-10T08:00:00Z",
    },
  ],
};

describe("DashboardStats", () => {
  it("affiche le skeleton de chargement avec aria-busy", () => {
    const { container } = render(<DashboardStats data={null} loading={true} error={null} theme="dark" />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("affiche une erreur si error est fourni et loading=false", () => {
    render(<DashboardStats data={null} loading={false} error="Erreur réseau" theme="light" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/impossible de charger/i);
  });

  it("n'affiche pas d'erreur pendant le chargement", () => {
    render(<DashboardStats data={null} loading={true} error="Erreur" theme="light" />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("affiche les 3 cartes de stats avec les bonnes valeurs", () => {
    render(<DashboardStats data={SAMPLE_DATA} loading={false} error={null} theme="dark" />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("affiche les libellés des cartes de stats", () => {
    render(<DashboardStats data={SAMPLE_DATA} loading={false} error={null} theme="light" />);
    expect(screen.getByText(/formations suivies/i)).toBeInTheDocument();
    expect(screen.getByText(/feedbacks envoyés/i)).toBeInTheDocument();
    expect(screen.getByText(/articles lus/i)).toBeInTheDocument();
  });

  it("affiche les formations dans l'historique", () => {
    render(<DashboardStats data={SAMPLE_DATA} loading={false} error={null} theme="dark" />);
    expect(screen.getByText("React Avancé")).toBeInTheDocument();
    expect(screen.getByText("Python Débutant")).toBeInTheDocument();
  });

  it("affiche 'Aucune formation' si historique vide", () => {
    const data = { ...SAMPLE_DATA, historique_formations: [] };
    render(<DashboardStats data={data} loading={false} error={null} theme="light" />);
    expect(screen.getByText(/aucune formation suivie/i)).toBeInTheDocument();
  });

  it("est encapsulé dans une section avec aria-label", () => {
    render(<DashboardStats data={SAMPLE_DATA} loading={false} error={null} theme="dark" />);
    expect(screen.getByRole("region", { name: /tableau de bord/i })).toBeInTheDocument();
  });

  it("affiche '—' si une valeur de stat est nulle", () => {
    const data = { ...SAMPLE_DATA, formations_inscrites: null };
    render(<DashboardStats data={data} loading={false} error={null} theme="light" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("n'affiche pas le contenu données quand loading=true", () => {
    render(<DashboardStats data={SAMPLE_DATA} loading={true} error={null} theme="dark" />);
    expect(screen.queryByText("React Avancé")).toBeNull();
  });
});
