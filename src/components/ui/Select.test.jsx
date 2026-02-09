import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "./Select";
import { useTheme } from "../../context/ThemeContext";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReset();
});

describe("Select", () => {
  it("renders options and calls onChange", async () => {
    useTheme.mockReturnValue({ theme: "light" });
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        id="topic"
        value={null}
        onChange={onChange}
        placeholder="Choose"
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />
    );

    expect(screen.getByRole("option", { name: "Choose" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "b");
    expect(onChange).toHaveBeenCalledWith("b");

    await user.selectOptions(screen.getByRole("combobox"), "");
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
