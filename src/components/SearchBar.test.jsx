import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import SearchBar from "./SearchBar";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function renderSearchBar() {
  return render(
    <MemoryRouter>
      <SearchBar />
    </MemoryRouter>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("SearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── État fermé (bouton déclencheur) ──────────────────────────────────────

  it("affiche le bouton 'Ouvrir la recherche' par défaut", () => {
    renderSearchBar();
    expect(screen.getByRole("button", { name: /ouvrir la recherche/i })).toBeInTheDocument();
  });

  it("n'affiche pas l'input par défaut", () => {
    renderSearchBar();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("le bouton a title='Rechercher (Ctrl+K)'", () => {
    renderSearchBar();
    expect(screen.getByRole("button")).toHaveAttribute("title", "Rechercher (Ctrl+K)");
  });

  // ── Ouverture ────────────────────────────────────────────────────────────

  it("ouvre l'input au clic sur le bouton", async () => {
    const user = userEvent.setup();
    renderSearchBar();
    await user.click(screen.getByRole("button", { name: /ouvrir la recherche/i }));
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("ouvre l'input via Ctrl+K", async () => {
    renderSearchBar();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    await waitFor(() => expect(screen.getByRole("searchbox")).toBeInTheDocument());
  });

  it("ouvre l'input via Meta+K (Cmd+K)", async () => {
    renderSearchBar();
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    await waitFor(() => expect(screen.getByRole("searchbox")).toBeInTheDocument());
  });

  // ── Fermeture ────────────────────────────────────────────────────────────

  it("ferme l'input avec la touche Escape", async () => {
    const user = userEvent.setup();
    renderSearchBar();
    await user.click(screen.getByRole("button", { name: /ouvrir la recherche/i }));
    expect(screen.getByRole("searchbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("efface la query à la fermeture via Escape", async () => {
    const user = userEvent.setup();
    renderSearchBar();
    await user.click(screen.getByRole("button", { name: /ouvrir la recherche/i }));
    await user.type(screen.getByRole("searchbox"), "django");

    await user.keyboard("{Escape}");
    // Après réouverture, le champ doit être vide
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    await waitFor(() => {
      expect(screen.getByRole("searchbox")).toHaveValue("");
    });
  });

  // ── Soumission du formulaire ──────────────────────────────────────────────

  it("navigue vers /search?q=… lors de la soumission (q ≥ 3 chars)", async () => {
    const user = userEvent.setup();
    renderSearchBar();
    await user.click(screen.getByRole("button", { name: /ouvrir la recherche/i }));
    await user.type(screen.getByRole("searchbox"), "Django");
    fireEvent.submit(screen.getByRole("search"));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining("q=Django")
    );
  });

  it("encode correctement les caractères spéciaux dans l'URL", async () => {
    const user = userEvent.setup();
    renderSearchBar();
    await user.click(screen.getByRole("button", { name: /ouvrir la recherche/i }));
    await user.type(screen.getByRole("searchbox"), "c++ débutant");
    fireEvent.submit(screen.getByRole("search"));

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("c++ débutant"))
    );
  });

  it("ne navigue pas si la query a moins de 3 caractères", async () => {
    const user = userEvent.setup();
    renderSearchBar();
    await user.click(screen.getByRole("button", { name: /ouvrir la recherche/i }));
    await user.type(screen.getByRole("searchbox"), "ab");
    fireEvent.submit(screen.getByRole("search"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("ne navigue pas si la query est vide", async () => {
    const user = userEvent.setup();
    renderSearchBar();
    await user.click(screen.getByRole("button", { name: /ouvrir la recherche/i }));
    fireEvent.submit(screen.getByRole("search"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("vide la query et ferme après soumission réussie", async () => {
    const user = userEvent.setup();
    renderSearchBar();
    await user.click(screen.getByRole("button", { name: /ouvrir la recherche/i }));
    await user.type(screen.getByRole("searchbox"), "Python");
    fireEvent.submit(screen.getByRole("search"));

    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  // ── Accessibilité ────────────────────────────────────────────────────────

  it("le formulaire a role='search'", async () => {
    const user = userEvent.setup();
    renderSearchBar();
    await user.click(screen.getByRole("button", { name: /ouvrir la recherche/i }));
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("l'input a aria-label='Terme de recherche'", async () => {
    const user = userEvent.setup();
    renderSearchBar();
    await user.click(screen.getByRole("button", { name: /ouvrir la recherche/i }));
    expect(screen.getByLabelText(/terme de recherche/i)).toBeInTheDocument();
  });

  // ── Cleanup des event listeners ──────────────────────────────────────────

  it("supprime l'écouteur Ctrl+K au démontage", () => {
    const spy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderSearchBar();
    unmount();
    expect(spy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });
});
