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
  mockGetCookie.mockReturnValue(null); // no consent → banner visible
}

function setupWithConsent(value = '{"optional":true}') {
  mockGetCookie.mockReturnValue(value); // existing consent → banner hidden
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
    // No cookie → visible=true, hasConsent=false → dialog shown
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

  // ── "Save" button (custom preferences) ─────────────────────────────────

  it("enregistre les préférences actuelles en cliquant 'Enregistrer'", async () => {
    const user = userEvent.setup();
    setupNoConsent();
    render(<CookieBanner />);

    // Cocher la case optionnelle (la seule qui ne soit pas disabled)
    const checkboxes = screen.getAllByRole("checkbox");
    const checkbox = checkboxes.find((cb) => !cb.disabled);
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

  // ── "Reset" button ───────────────────────────────────────────────────────

  it("réaffiche la bannière après 'Réinitialiser'", async () => {
    const user = userEvent.setup();
    setupWithConsent(); // existing consent → "manage cookies" button visible
    render(<CookieBanner />);

    // Open the banner via the manage button
    await user.click(screen.getByRole("button", { name: /gérer les cookies/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Click reset
    await user.click(screen.getByRole("button", { name: /réinitialiser/i }));
    expect(mockDeleteCookie).toHaveBeenCalledWith("cookie_consent");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // ── "Manage cookies" button ──────────────────────────────────────────────

  it("ouvre la bannière en cliquant sur 'Gérer les cookies'", async () => {
    const user = userEvent.setup();
    setupWithConsent();
    render(<CookieBanner />);
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: /gérer les cookies/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // ── Consent stored as "accepted"/"rejected" (legacy format) ─────────────

  it("interprète correctement le consentement legacy 'accepted'", () => {
    setupWithConsent("accepted");
    render(<CookieBanner />);
    // No banner → consent was recognized
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("interprète correctement le consentement legacy 'rejected'", () => {
    setupWithConsent("rejected");
    render(<CookieBanner />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // ── Accessibility ────────────────────────────────────────────────────────

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
