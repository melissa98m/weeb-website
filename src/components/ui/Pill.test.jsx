import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Pill from "./Pill";
import { useTheme } from "../../context/ThemeContext";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReset();
});

describe("Pill", () => {
  it("applies light palette classes", () => {
    useTheme.mockReturnValue({ theme: "light" });
    render(
      <Pill color="success" variant="soft" size="md">
        Ok
      </Pill>
    );

    const pill = screen.getByText("Ok");
    expect(pill.className).toContain("bg-green-50");
    expect(pill.className).toContain("text-green-700");
    expect(pill.className).toContain("text-sm");
  });

  it("applies dark palette classes", () => {
    useTheme.mockReturnValue({ theme: "dark" });
    render(
      <Pill color="warning" variant="outline" size="sm">
        Warn
      </Pill>
    );

    const pill = screen.getByText("Warn");
    expect(pill.className).toContain("border-amber-500/40");
    expect(pill.className).toContain("text-amber-300");
    expect(pill.className).toContain("text-xs");
  });
});
