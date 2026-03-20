import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExportCSVButton from "./ExportCSVButton";

vi.mock("../../lib/api", () => ({ API_BASE: "http://localhost:8000/api" }));
vi.mock("../../lib/cookies", () => ({ getCookie: vi.fn(() => "csrf-token") }));

describe("ExportCSVButton", () => {
  beforeEach(() => {
    // Intercepter le clic sur les <a> créés dynamiquement
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      const el = origCreate(tag);
      if (tag === "a") {
        vi.spyOn(el, "click").mockImplementation(() => {});
      }
      return el;
    });

    global.URL.createObjectURL = vi.fn(() => "blob:fake-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete global.fetch;
  });

  it("affiche le libellé par défaut pour le type 'inscrits'", () => {
    render(<ExportCSVButton type="inscrits" />);
    expect(screen.getByRole("button")).toHaveTextContent("Exporter Inscrits");
  });

  it("affiche le libellé par défaut pour le type 'feedbacks'", () => {
    render(<ExportCSVButton type="feedbacks" />);
    expect(screen.getByRole("button")).toHaveTextContent("Exporter Feedbacks");
  });

  it("affiche le libellé par défaut pour le type 'messages'", () => {
    render(<ExportCSVButton type="messages" />);
    expect(screen.getByRole("button")).toHaveTextContent("Exporter Messages");
  });

  it("utilise un libellé personnalisé si fourni", () => {
    render(<ExportCSVButton type="inscrits" label="Télécharger CSV" />);
    expect(screen.getByRole("button")).toHaveTextContent("Télécharger CSV");
  });

  it("affiche 'Export en cours…' et désactive le bouton pendant le fetch", async () => {
    let resolve;
    global.fetch = vi.fn(() => new Promise((r) => { resolve = r; }));
    const user = userEvent.setup();
    render(<ExportCSVButton type="inscrits" />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveTextContent("Export en cours…");
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");

    resolve({ ok: true, blob: () => Promise.resolve(new Blob(["a,b"])) });
    await waitFor(() => expect(screen.getByRole("button")).not.toBeDisabled());
  });

  it("déclenche un téléchargement si le fetch réussit", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["col1,col2\nval1,val2"])),
    });
    const user = userEvent.setup();
    render(<ExportCSVButton type="feedbacks" />);

    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(global.URL.createObjectURL).toHaveBeenCalled());
    await waitFor(() => expect(global.URL.revokeObjectURL).toHaveBeenCalled());
  });

  it("construit l'URL avec les paramètres de dates", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob([])),
    });
    const user = userEvent.setup();
    render(<ExportCSVButton type="inscrits" dateFrom="2025-01-01" dateTo="2025-12-31" />);

    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("from=2025-01-01");
    expect(url).toContain("to=2025-12-31");
  });

  it("affiche une erreur si le fetch retourne un statut d'erreur", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });
    const user = userEvent.setup();
    render(<ExportCSVButton type="messages" />);

    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("alert")).toHaveTextContent("403");
  });

  it("affiche une erreur si le fetch échoue (réseau)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<ExportCSVButton type="inscrits" />);

    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
  });

  it("efface l'erreur au prochain clic réussi", async () => {
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error("Erreur réseau"))
      .mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(new Blob([])),
      });
    const user = userEvent.setup();
    render(<ExportCSVButton type="inscrits" />);

    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("réactive le bouton après le téléchargement", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob([])),
    });
    const user = userEvent.setup();
    render(<ExportCSVButton type="inscrits" />);

    await user.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByRole("button")).not.toBeDisabled());
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy", "true");
  });
});
