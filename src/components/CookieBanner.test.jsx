import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CookieBanner from "./CookieBanner";

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGetCookie = vi.fn();
const mockSetCookie = vi.fn();
const mockDeleteCookie = vi.fn();

vi.mock("../lib/cookies", () => ({
  COOKIE_CONSENT_NAME: "cookie_consent",
  getCookie: (...args) => mockGetCookie(...args),
  setCookie: (...args) => mockSetCookie(...args),
  deleteCookie: (...args) => mockDeleteCookie(...args),
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

vi.mock("../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "fr" }),
}));

// Stub des locales (valeurs minimales pour les tests)
vi.mock("../../locales/fr/cookies.json", () => ({
  default: {
    title: "Cookies",
    description: "Nous utilisons des cookies.",
    required_title: "Requis",
    required_label: "Fonctionnels",
    required_desc: "Nécessaires au fonctionnement.",
    optional_title: "Optionnels",
    optional_label: "Analytiques",
    optional_desc: "Pour améliorer le service.",
    reject: "Tout refuser",
    accept_all: "Tout accepter",
    save: "Enregistrer",
    remove_choice: "Réinitialiser",
    manage_button: "Gérer les cookies",
  },
}));

vi.mock("../../locales/en/cookies.json", () => ({
  default: {
    title: "Cookies",
    description: "We use cookies.",
    required_title: "Required",
    required_label: "Functional",
    required_desc: "Necessary for the site to work.",
    optional_title: "Optional",
    optional_label: "Analytics",
    optional_desc: "To improve the service.",
    reject: "Reject all",
    accept_all: "Accept all",
    save: "Save",
    remove_choice: "Reset",
    manage_button: "Manage cookies",
  },
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function setupNoConsent() {
  mockGetCookie.mockReturnValue(null); // aucun consentement → bannière visible
}

function setupWithConsent(value = '{"optional":true}') {
  mockGetCookie.mockReturnValue(value); // consentement existant → bannière cachée
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("CookieBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Affichage initial ────────────────────────────────────────────────────

  it("affiche la bannière si aucun consentement n'est enregistré", () => {
    setupNoConsent();
    render(<CookieBanner />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("n'affiche pas la bannière si un consentement est déjà enregistré", () => {
    setupWithConsent();
    render(<CookieBanner />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("affiche le bouton 'Gérer les cookies' après consentement (pas la bannière)", () => {
    setupWithConsent();
    render(<CookieBanner />);
    expect(screen.getByRole("button", { name: /gérer les cookies/i })).toBeInTheDocument();
  });

  it("ne rend rien si pas de consentement et pas visible (état impossible par défaut géré)", () => {
    // Sans cookie → visible=true, hasConsent=false → dialog affiché
    setupNoConsent();
    const { container } = render(<CookieBanner />);
    expect(container).not.toBeEmptyDOMElement();
  });

  // ── Bouton "Tout accepter" ────────────────────────────────────────────────

  it("appelle setCookie avec optional:true en cliquant 'Tout accepter'", async () => {
    const user = userEvent.setup();
    setupNoConsent();
    render(<CookieBanner />);
    await user.click(screen.getByRole("button", { name: /tout accepter/i }));
    expect(mockSetCookie).toHaveBeenCalledWith(
      "cookie_consent",
      JSON.stringify({ optional: true })
    );
  });

  it("ferme la bannière après 'Tout accepter'", async () => {
    const user = userEvent.setup();
    setupNoConsent();
    render(<CookieBanner />);
    await user.click(screen.getByRole("button", { name: /tout accepter/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // ── Bouton "Tout refuser" ─────────────────────────────────────────────────

  it("appelle setCookie avec optional:false en cliquant 'Tout refuser'", async () => {
    const user = userEvent.setup();
    setupNoConsent();
    render(<CookieBanner />);
    await user.click(screen.getByRole("button", { name: /tout refuser/i }));
    expect(mockSetCookie).toHaveBeenCalledWith(
      "cookie_consent",
      JSON.stringify({ optional: false })
    );
  });

  it("ferme la bannière après 'Tout refuser'", async () => {
    const user = userEvent.setup();
    setupNoConsent();
    render(<CookieBanner />);
    await user.click(screen.getByRole("button", { name: /tout refuser/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // ── Bouton "Enregistrer" (préférences personnalisées) ────────────────────

  it("enregistre les préférences actuelles en cliquant 'Enregistrer'", async () => {
    const user = userEvent.setup();
    setupNoConsent();
    render(<CookieBanner />);

    // Cocher la case optionnelle
    const checkbox = screen.getByRole("checkbox", { name: "" }); // checkbox analytics (non disabled)
    await user.click(checkbox);

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));
    expect(mockSetCookie).toHaveBeenCalledWith(
      "cookie_consent",
      JSON.stringify({ optional: true })
    );
  });

  it("ferme la bannière après 'Enregistrer'", async () => {
    const user = userEvent.setup();
    setupNoConsent();
    render(<CookieBanner />);
    await user.click(screen.getByRole("button", { name: /enregistrer/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // ── Bouton "Réinitialiser" ────────────────────────────────────────────────

  it("réaffiche la bannière après 'Réinitialiser'", async () => {
    const user = userEvent.setup();
    setupWithConsent(); // consentement existant → bouton gérer visible
    render(<CookieBanner />);

    // Ouvrir la bannière via le bouton gérer
    await user.click(screen.getByRole("button", { name: /gérer les cookies/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Cliquer sur réinitialiser
    await user.click(screen.getByRole("button", { name: /réinitialiser/i }));
    expect(mockDeleteCookie).toHaveBeenCalledWith("cookie_consent");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // ── Bouton "Gérer les cookies" ────────────────────────────────────────────

  it("ouvre la bannière en cliquant sur 'Gérer les cookies'", async () => {
    const user = userEvent.setup();
    setupWithConsent();
    render(<CookieBanner />);
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: /gérer les cookies/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // ── Consentement enregistré comme "accepted"/"rejected" (legacy) ──────────

  it("interprète correctement le consentement legacy 'accepted'", () => {
    setupWithConsent("accepted");
    render(<CookieBanner />);
    // Pas de bannière → le consentement a été reconnu
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("interprète correctement le consentement legacy 'rejected'", () => {
    setupWithConsent("rejected");
    render(<CookieBanner />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // ── Accessibilité ────────────────────────────────────────────────────────

  it("le dialog a aria-label='Consentement aux cookies'", () => {
    setupNoConsent();
    render(<CookieBanner />);
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "Consentement aux cookies"
    );
  });

  it("la case 'Fonctionnels' est toujours désactivée (cookie requis)", () => {
    setupNoConsent();
    render(<CookieBanner />);
    const checkboxes = screen.getAllByRole("checkbox");
    const required = checkboxes.find((cb) => cb.disabled);
    expect(required).toBeInTheDocument();
    expect(required).toBeChecked();
  });
});
