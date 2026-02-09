import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateFormationModal from "./CreateFormationModal";
import { useTheme } from "../../context/ThemeContext";
import { ensureCsrf } from "../../lib/api";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../../lib/api", () => ({
  ensureCsrf: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  ensureCsrf.mockResolvedValue("token");
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CreateFormationModal", () => {
  it("shows validation error when name is empty", async () => {
    const user = userEvent.setup();

    render(
      <CreateFormationModal open onClose={() => {}} onCreated={() => {}} apiBase="/api" />
    );

    const form = screen.getByText("Nouvelle formation").closest("form");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(await screen.findByText("Le nom est requis.")).toBeInTheDocument();
  });

  it("submits and calls callbacks", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const onClose = vi.fn();

    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, name: "React" }) });

    render(
      <CreateFormationModal open onClose={onClose} onCreated={onCreated} apiBase="/api" />
    );

    await user.type(screen.getByLabelText(/Nom/i), "React");
    await user.click(screen.getByRole("button", { name: "Créer" }));

    expect(onCreated).toHaveBeenCalledWith({ id: 1, name: "React" });
    expect(onClose).toHaveBeenCalled();
  });
});
