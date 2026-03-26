import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewsletterManager from "./NewsletterManager";

vi.mock("../../lib/api", () => ({ API_BASE: "http://localhost:8000/api" }));
vi.mock("../../lib/cookies", () => ({ getCookie: vi.fn(() => "csrf") }));
vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "dark" }),
}));
vi.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "fr" }),
}));
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { roles: ["Personnel"] } }),
}));
vi.mock("../../components/admin/RichTextEditor", () => ({
  default: ({ onChange, value }) => (
    <textarea
      id="nl-body"
      aria-label="Corps texte brut"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

function setup() {
  const user = userEvent.setup();
  global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes("/subscribers/")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: [], count: 0, num_pages: 1, page: 1 }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ total_abonnes: 42 }),
    });
  });
  render(<NewsletterManager />);
  return user;
}

describe("NewsletterManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le titre 'Newsletter'", () => {
    setup();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Newsletter");
  });

  it("charge et affiche le nombre d'abonnés", async () => {
    setup();
    await waitFor(() => expect(screen.getByText(/42 abonné/i)).toBeInTheDocument());
  });

  it("a un label associé au champ sujet", () => {
    setup();
    const label = screen.getByLabelText(/sujet/i);
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe("input");
  });

  it("a un label associé au champ corps texte brut", () => {
    setup();
    const label = screen.getByLabelText(/corps texte brut/i);
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).toBe("textarea");
  });

  it("désactive le bouton 'Envoyer' si le sujet est vide", async () => {
    setup();
    await waitFor(() => screen.getByText(/42 abonné/i));

    const btn = screen.getByRole("button", { name: /envoyer maintenant/i });
    expect(btn).toBeDisabled();
  });

  it("désactive le bouton 'Envoyer' si corps texte vide", async () => {
    const user = setup();
    await waitFor(() => screen.getByText(/42 abonné/i));

    await user.type(screen.getByLabelText(/sujet/i), "Mon sujet");
    const btn = screen.getByRole("button", { name: /envoyer maintenant/i });
    expect(btn).toBeDisabled();
  });

  it("active le bouton 'Envoyer' si sujet et corps remplis", async () => {
    const user = setup();
    await waitFor(() => screen.getByText(/42 abonné/i));

    await user.type(screen.getByLabelText(/sujet/i), "Test sujet");
    await user.type(screen.getByLabelText(/corps texte brut/i), "Corps de l'email");
    const btn = screen.getByRole("button", { name: /envoyer maintenant/i });
    expect(btn).not.toBeDisabled();
  });

  it("ouvre la modale de confirmation au clic sur 'Envoyer'", async () => {
    const user = setup();
    await waitFor(() => screen.getByText(/42 abonné/i));

    await user.type(screen.getByLabelText(/sujet/i), "Test sujet");
    await user.type(screen.getByLabelText(/corps texte brut/i), "Corps");
    await user.click(screen.getByRole("button", { name: /envoyer maintenant/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/confirmer l'envoi/i)).toBeInTheDocument();
  });

  it("ferme la modale au clic sur 'Annuler'", async () => {
    const user = setup();
    await waitFor(() => screen.getByText(/42 abonné/i));

    await user.type(screen.getByLabelText(/sujet/i), "Test sujet");
    await user.type(screen.getByLabelText(/corps texte brut/i), "Corps");
    await user.click(screen.getByRole("button", { name: /envoyer maintenant/i }));
    await user.click(screen.getByRole("button", { name: /annuler/i }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("ferme la modale avec la touche Escape", async () => {
    const user = setup();
    await waitFor(() => screen.getByText(/42 abonné/i));

    await user.type(screen.getByLabelText(/sujet/i), "Test sujet");
    await user.type(screen.getByLabelText(/corps texte brut/i), "Corps");
    await user.click(screen.getByRole("button", { name: /envoyer maintenant/i }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("envoie la campagne après confirmation et affiche le résultat", async () => {
    const user = setup();
    await waitFor(() => screen.getByText(/42 abonné/i));

    // Le stats fetch est déjà résolu ; on configure le send fetch
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ envoyes: 42, erreurs: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ total_abonnes: 42 }),
      });

    await user.type(screen.getByLabelText(/sujet/i), "Test sujet");
    await user.type(screen.getByLabelText(/corps texte brut/i), "Corps");
    await user.click(screen.getByRole("button", { name: /envoyer maintenant/i }));
    await user.click(screen.getByRole("button", { name: /^envoyer$/i }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(/campagne/i)
    );
  });

  it("affiche une erreur si l'envoi échoue", async () => {
    const user = setup();
    await waitFor(() => screen.getByText(/42 abonné/i));

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 99 }) })
      .mockResolvedValue({ ok: false, json: () => Promise.resolve({ detail: "Serveur indisponible" }) });

    await user.type(screen.getByLabelText(/sujet/i), "Test sujet");
    await user.type(screen.getByLabelText(/corps texte brut/i), "Corps");
    await user.click(screen.getByRole("button", { name: /envoyer maintenant/i }));
    await user.click(screen.getByRole("button", { name: /^envoyer$/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/serveur indisponible/i));
  });

  it("met robots noindex sur la page admin", () => {
    setup();
    const meta = document.querySelector('meta[name="robots"]');
    expect(meta?.content).toContain("noindex");
  });
});
