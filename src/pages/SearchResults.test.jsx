import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SearchResults from "./SearchResults";

vi.mock("../lib/api", () => ({ API_BASE: "http://localhost:8000/api" }));
vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "dark" }),
}));
vi.mock("../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "fr" }),
}));

const RESULTS = {
  articles: [
    { id: 1, title: "Introduction à Django", author: { username: "alice", first_name: "Alice" } },
  ],
  formations: [
    { id: 2, name: "Python avancé", description: "Formation Python" },
  ],
};

function renderWithQuery(q = "") {
  return render(
    <MemoryRouter initialEntries={[`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`]}>
      <Routes>
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SearchResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("affiche le titre 'Recherche' sans paramètre q", () => {
    renderWithQuery("");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Recherche");
  });

  it("affiche le terme recherché dans le h1", () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ articles: [], formations: [] }),
    });
    renderWithQuery("Django");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Django");
  });

  it("affiche le message 'Saisir au moins 3 caractères' pour q trop court", () => {
    renderWithQuery("ab");
    expect(screen.getByText(/saisir au moins 3 caractères/i)).toBeInTheDocument();
  });

  it("n'appelle pas fetch si q < 3 caractères", () => {
    global.fetch = vi.fn();
    renderWithQuery("ab");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("appelle fetch quand q >= 3 caractères", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ articles: [], formations: [] }),
    });
    renderWithQuery("Django");
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("q=Django");
  });

  it("affiche les skeletons pendant le chargement", async () => {
    vi.useFakeTimers();
    let resolve;
    global.fetch = vi.fn(() => new Promise((r) => { resolve = r; }));
    renderWithQuery("Django");
    // Déclencher le debounce de 300ms pour que setLoading(true) soit appelé
    await act(async () => { vi.advanceTimersByTime(300); });
    // Le fetch est en attente → skeletons visibles
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    vi.useRealTimers();
    await act(async () => {
      resolve({ ok: true, json: () => Promise.resolve({ articles: [], formations: [] }) });
    });
  });

  it("affiche les articles trouvés", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(RESULTS),
    });
    renderWithQuery("Django");
    await waitFor(() => expect(screen.getByText("Introduction à Django")).toBeInTheDocument());
  });

  it("affiche les formations trouvées", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(RESULTS),
    });
    renderWithQuery("Python");
    await waitFor(() => expect(screen.getByText("Python avancé")).toBeInTheDocument());
  });

  it("affiche le message 'Aucun résultat' si les listes sont vides", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ articles: [], formations: [] }),
    });
    renderWithQuery("xyzabc");
    await waitFor(() => expect(screen.getByText(/aucun résultat/i)).toBeInTheDocument());
  });

  it("affiche un message d'erreur si le fetch échoue", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    renderWithQuery("Django");
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("affiche le compte de résultats", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(RESULTS),
    });
    renderWithQuery("Django");
    await waitFor(() => expect(screen.getByText(/2 résultats trouvés/i)).toBeInTheDocument());
  });

  it("met robots noindex sur la page", () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ articles: [], formations: [] }),
    });
    renderWithQuery("Django");
    const meta = document.querySelector('meta[name="robots"]');
    expect(meta?.content).toContain("noindex");
  });
});
