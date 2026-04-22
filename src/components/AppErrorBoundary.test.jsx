import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppErrorBoundary from "./AppErrorBoundary";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
}));

// ── Helpers ────────────────────────────────────────────────────────────────

/** Component that throws an error on render */
function Bomb({ message = "Boom" }) {
  throw new Error(message);
}

/** Composant sain */
function Healthy() {
  return <p>Contenu OK</p>;
}

// Vitest affiche les erreurs boundary dans la console — on les supprime
function suppressConsoleErrors() {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("AppErrorBoundary", () => {
  suppressConsoleErrors();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendu normal ─────────────────────────────────────────────────────────

  it("rend ses enfants quand aucune erreur n'est levée", () => {
    render(
      <AppErrorBoundary>
        <Healthy />
      </AppErrorBoundary>
    );
    expect(screen.getByText("Contenu OK")).toBeInTheDocument();
  });

  it("n'affiche pas l'écran d'erreur quand tout va bien", () => {
    render(
      <AppErrorBoundary>
        <Healthy />
      </AppErrorBoundary>
    );
    expect(screen.queryByText(/application error/i)).toBeNull();
  });

  // ── Capture d'erreur ─────────────────────────────────────────────────────

  it("affiche le fallback quand un enfant lève une erreur", () => {
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>
    );
    expect(screen.getByText(/application error/i)).toBeInTheDocument();
  });

  it("affiche le message d'erreur dans le fallback", () => {
    render(
      <AppErrorBoundary>
        <Bomb message="Test crash" />
      </AppErrorBoundary>
    );
    expect(screen.getByText("Test crash")).toBeInTheDocument();
  });

  it("affiche le titre 'Unable to render this screen'", () => {
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>
    );
    expect(
      screen.getByRole("heading", { name: /unable to render this screen/i })
    ).toBeInTheDocument();
  });

  it("affiche le bouton 'Reload app'", () => {
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>
    );
    expect(screen.getByRole("button", { name: /reload app/i })).toBeInTheDocument();
  });

  // ── Default error message ────────────────────────────────────────────────

  it("affiche un message générique si l'erreur n'a pas de message", () => {
    function BombNoMessage() {
      // eslint-disable-next-line no-throw-literal
      throw { message: undefined };
    }
    render(
      <AppErrorBoundary>
        <BombNoMessage />
      </AppErrorBoundary>
    );
    expect(
      screen.getByText(/an unexpected error occurred/i)
    ).toBeInTheDocument();
  });

  // ── Sentry ───────────────────────────────────────────────────────────────

  it("rapporte l'erreur à Sentry via captureException", async () => {
    const { captureException } = await import("@sentry/react");
    render(
      <AppErrorBoundary>
        <Bomb message="Sentry test" />
      </AppErrorBoundary>
    );
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Sentry test" }),
      expect.objectContaining({ extra: expect.objectContaining({ componentStack: expect.anything() }) })
    );
  });

  // ── Bouton Retry ─────────────────────────────────────────────────────────

  it("le bouton 'Reload app' appelle window.location.reload", async () => {
    const user = userEvent.setup();
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>
    );
    await user.click(screen.getByRole("button", { name: /reload app/i }));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  // ── Semantic structure ───────────────────────────────────────────────────

  it("le fallback utilise une balise <section>", () => {
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>
    );
    expect(document.querySelector("section")).toBeInTheDocument();
  });

  it("le label 'Application Error' est en texte visible", () => {
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>
    );
    expect(screen.getByText(/application error/i)).toBeVisible();
  });
});
