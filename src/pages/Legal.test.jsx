import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Legal from "./Legal";
import legalEn from "../../locales/en/legal.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
});

describe("Legal page", () => {
  it("renders title and sections", () => {
    render(<Legal />);

    expect(screen.getByRole("heading", { name: legalEn.title })).toBeInTheDocument();
    expect(screen.getByText(legalEn.intro)).toBeInTheDocument();

    legalEn.sections.forEach((section) => {
      expect(screen.getByRole("heading", { name: section.title })).toBeInTheDocument();
      section.items.forEach((item) => {
        // Email addresses are rendered as <a> links, splitting the text across nodes.
        // We match on textContent of the container element instead.
        expect(
          screen.getAllByText((_, el) => el?.textContent === item).length
        ).toBeGreaterThan(0);
      });
    });
  });
});
