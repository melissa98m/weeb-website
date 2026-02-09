import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenrePicker from "./GenrePicker";
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

describe("GenrePicker", () => {
  it("loads genres and toggles selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [{ id: 1, name: "Tech", color: "#ff0000" }] }),
    });

    render(
      <GenrePicker apiBase="/api" value={[]} onChange={onChange} />
    );

    expect(await screen.findByText("Tech")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tech" }));
    expect(onChange).toHaveBeenCalledWith([{ id: 1, name: "Tech", color: "#ff0000" }]);
  });

  it("creates a new genre", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, name: "Design", color: "#00ff00" }),
      });

    render(
      <GenrePicker apiBase="/api" value={[]} onChange={onChange} />
    );

    await user.type(screen.getByPlaceholderText("Nouveau genre"), "Design");
    await user.click(screen.getByRole("button", { name: "Créer" }));

    expect(onChange).toHaveBeenCalledWith([{ id: 2, name: "Design", color: "#00ff00" }]);
  });
});
