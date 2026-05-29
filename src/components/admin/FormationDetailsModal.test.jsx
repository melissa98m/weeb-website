import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormationDetailsModal from "./FormationDetailsModal";
import { useTheme } from "../../context/ThemeContext";
import { ensureCsrf } from "../../lib/api";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../../lib/api", () => ({
  ensureCsrf: vi.fn(),
}));

vi.mock("../ui/Pagination", () => ({
  default: () => <div>Pagination</div>,
}));

vi.mock("../ui/PageSizer", () => ({
  default: ({ pageSize }) => <div>PageSizer {pageSize}</div>,
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  ensureCsrf.mockResolvedValue("token");
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal("confirm", vi.fn(() => true));
  vi.stubGlobal("alert", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FormationDetailsModal", () => {
  it("loads and shows empty state", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ results: [] }),
    });

    render(
      <FormationDetailsModal
        open
        onClose={() => {}}
        apiBase="/api"
        formation={{ id: 1, title: "React" }}
        onDeleted={() => {}}
      />
    );

    expect(await screen.findAllByText(/Aucun inscrit/)).toHaveLength(1);
  });

  it("deletes formation", async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();

    fetch
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => ({ results: [] }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(
      <FormationDetailsModal
        open
        onClose={() => {}}
        apiBase="/api"
        formation={{ id: 2, title: "Vue" }}
        onDeleted={onDeleted}
      />
    );

    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    expect(onDeleted).toHaveBeenCalledWith(2);
  });
});
