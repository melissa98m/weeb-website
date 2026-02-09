import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Autocomplete from "./Autocomplete";
import { useTheme } from "../../context/ThemeContext";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReset();
  useTheme.mockReturnValue({ theme: "light" });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Autocomplete", () => {
  it("fetches options after debounce and selects an option", async () => {
    const fetchOptions = vi.fn().mockResolvedValue([
      { id: 1, label: "Alpha" },
      { id: 2, label: "Beta" },
    ]);
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Autocomplete
        id="topic"
        value={null}
        onChange={onChange}
        placeholder="Search"
        fetchOptions={fetchOptions}
        minSearchLength={2}
        debounceMs={0}
      />
    );

    await user.type(screen.getByRole("combobox"), "ab");

    await waitFor(() => {
      expect(fetchOptions).toHaveBeenCalledWith("ab", expect.any(AbortSignal));
    });

    const option = await screen.findByRole("option", { name: "Alpha" });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
