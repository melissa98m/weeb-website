import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackModal from "./FeedbackModal";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("../lib/env", () => ({
  getEnv: () => "http://localhost:8000/api",
}));

vi.mock("../lib/api", () => ({
  ensureCsrf: vi.fn().mockResolvedValue("csrf-token"),
}));

vi.mock("../../locales/fr/feedback.json", () => ({
  default: {
    title: "Laisser un avis",
    placeholder: "Votre retour…",
    send: "Envoyer",
    cancel: "Annuler",
    error: "Une erreur est survenue.",
  },
}));

vi.mock("../../locales/en/feedback.json", () => ({
  default: {
    title: "Leave a review",
    placeholder: "Your feedback…",
    send: "Send",
    cancel: "Cancel",
    error: "An error occurred.",
  },
}));

// ── Fixture ────────────────────────────────────────────────────────────────

const FORMATION = { id: 42, name: "Formation Python" };

const DEFAULT_PROPS = {
  open: true,
  onClose: vi.fn(),
  userId: 1,
  formation: FORMATION,
  theme: "light",
  language: "fr",
  onSuccess: vi.fn(),
};

function renderModal(props = {}) {
  return render(<FeedbackModal {...DEFAULT_PROPS} {...props} />);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("FeedbackModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Rendu ────────────────────────────────────────────────────────────────

  it("affiche la modale quand open=true et formation fournie", () => {
    renderModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("n'affiche rien si open=false", () => {
    renderModal({ open: false });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("n'affiche rien si formation est null", () => {
    renderModal({ formation: null });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("affiche le nom de la formation dans la modale", () => {
    renderModal();
    expect(screen.getByText("Formation Python")).toBeInTheDocument();
  });

  it("affiche le titre de la modale", () => {
    renderModal();
    expect(screen.getByRole("heading", { name: /laisser un avis/i })).toBeInTheDocument();
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  it("le dialog a role='dialog' et aria-modal='true'", () => {
    renderModal();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("le titre du dialog est lié via aria-labelledby", () => {
    renderModal();
    const dialog = screen.getByRole("dialog");
    const labelledById = dialog.getAttribute("aria-labelledby");
    expect(document.getElementById(labelledById)).toBeTruthy();
  });

  // ── Bouton Annuler ────────────────────────────────────────────────────────

  it("appelle onClose en cliquant 'Annuler'", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });
    await user.click(screen.getByRole("button", { name: /annuler/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose en cliquant le fond (backdrop)", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });
    // Le backdrop est le premier div fixed
    const backdrop = document.querySelector(".fixed.inset-0");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ── Send button — disabled state ─────────────────────────────────────────

  it("le bouton 'Envoyer' est désactivé si le textarea est vide", () => {
    renderModal();
    expect(screen.getByRole("button", { name: /envoyer/i })).toBeDisabled();
  });

  it("le bouton 'Envoyer' est activé quand du texte est saisi", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByRole("textbox"), "Super formation !");
    expect(screen.getByRole("button", { name: /envoyer/i })).toBeEnabled();
  });

  it("le bouton reste désactivé si le contenu n'est que des espaces", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByRole("textbox"), "   ");
    expect(screen.getByRole("button", { name: /envoyer/i })).toBeDisabled();
  });

  // ── Successful submission ────────────────────────────────────────────────

  it("envoie le feedback au bon endpoint", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, feedback_content: "Excellent !" }),
    });
    renderModal();
    await user.type(screen.getByRole("textbox"), "Excellent !");
    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain("/feedbacks/");
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body);
    expect(body.formation).toBe(42);
    expect(body.feedback_content).toBe("Excellent !");
  });

  it("inclut le header X-CSRFToken dans la requête", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });
    renderModal();
    await user.type(screen.getByRole("textbox"), "Très bien");
    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers["X-CSRFToken"]).toBe("csrf-token");
  });

  it("appelle onSuccess et onClose après un envoi réussi", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const created = { id: 1, feedback_content: "Super !" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(created),
    });
    renderModal({ onSuccess, onClose });
    await user.type(screen.getByRole("textbox"), "Super !");
    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(created);
      expect(onClose).toHaveBeenCalled();
    });
  });

  // ── Gestion des erreurs ──────────────────────────────────────────────────

  it("affiche un message d'erreur si le serveur répond avec une erreur", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    renderModal();
    await user.type(screen.getByRole("textbox"), "Test erreur");
    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() =>
      expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument()
    );
  });

  it("affiche un message d'erreur en cas d'exception réseau", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));
    renderModal();
    await user.type(screen.getByRole("textbox"), "Test réseau");
    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() =>
      expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument()
    );
  });

  it("réactive le bouton 'Envoyer' après une erreur", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    renderModal();
    await user.type(screen.getByRole("textbox"), "Test");
    await user.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /envoyer/i })).toBeEnabled()
    );
  });

  // ── Reset lors de la fermeture ────────────────────────────────────────────

  it("réinitialise le contenu et les erreurs quand open passe à false", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const { rerender } = renderModal();

    await user.type(screen.getByRole("textbox"), "Test reset");
    await user.click(screen.getByRole("button", { name: /envoyer/i }));
    await waitFor(() =>
      expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument()
    );

    // Fermer puis rouvrir
    rerender(<FeedbackModal {...DEFAULT_PROPS} open={false} />);
    rerender(<FeedbackModal {...DEFAULT_PROPS} open={true} />);

    expect(screen.queryByText(/une erreur est survenue/i)).toBeNull();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });
});
